const admin = require('firebase-admin');
const path = require('path');

// Load service account
let serviceAccount;
try {
    serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
    console.error("❌ serviceAccountKey.json not found");
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function debugPeriodAI() {
    console.log("🔍 ========== PERIOD AI DIAGNOSTICS ==========\n");

    // Check 1: Hardcoded UID from plugin
    const HARDCODED_UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2";
    console.log(`1️⃣  Hardcoded UID in Plugin: ${HARDCODED_UID}\n`);

    // Check 2: Company document exists
    console.log(`2️⃣  Checking Company Document...`);
    const companyDoc = await db.collection('companies').doc(HARDCODED_UID).get();

    if (!companyDoc.exists) {
        console.log(`   ❌ Company document NOT FOUND for UID: ${HARDCODED_UID}`);
        console.log(`   💡 This UID doesn't exist in your Firestore.\n`);

        // List all company UIDs
        console.log(`3️⃣  Finding all company UIDs in Firestore...`);
        const companiesSnap = await db.collection('companies').limit(10).get();
        console.log(`   Found ${companiesSnap.size} companies:`);
        companiesSnap.forEach(doc => {
            console.log(`   - ${doc.id}`);
        });
        return;
    }

    console.log(`   ✅ Company document EXISTS\n`);

    // Check 3: Period Plugin Enabled Flag
    console.log(`3️⃣  Checking periodPluginEnabled flag...`);
    const companyData = companyDoc.data();
    const periodEnabled = companyData.periodPluginEnabled || false;

    if (periodEnabled) {
        console.log(`   ✅ periodPluginEnabled: true`);
    } else {
        console.log(`   ❌ periodPluginEnabled: ${periodEnabled}`);
        console.log(`   💡 Turn ON the Period AI toggle in the admin panel!\n`);
    }
    console.log();

    // Check 4: WhatsApp Integration
    console.log(`4️⃣  Checking WhatsApp Integration...`);
    const waDoc = await db.collection('companies').doc(HARDCODED_UID)
        .collection('integrations').doc('whatsapp').get();

    if (!waDoc.exists) {
        console.log(`   ❌ WhatsApp integration NOT FOUND`);
        console.log(`   💡 Connect WhatsApp first from the Connect page\n`);
    } else {
        const waData = waDoc.data();
        console.log(`   ✅ WhatsApp Status: ${waData.status || 'unknown'}`);
        console.log(`   📞 Phone: ${waData.phoneNumber || 'not set'}\n`);
    }

    // Check 5: Period Tracker Users
    console.log(`5️⃣  Checking Period Tracker Users...`);
    const usersSnap = await db.collection('companies').doc(HARDCODED_UID)
        .collection('period_tracker_users').get();

    console.log(`   👥 Total registered users: ${usersSnap.size}`);

    if (usersSnap.size > 0) {
        console.log(`   Registered users:`);
        usersSnap.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.name || 'Unknown'} (${data.phone})`);
        });
    }
    console.log();

    // Check 6: Period AI Config
    console.log(`6️⃣  Checking Period AI Configuration...`);
    const configDoc = await db.collection('companies').doc(HARDCODED_UID)
        .collection('period_ai_config').doc('settings').get();

    if (!configDoc.exists) {
        console.log(`   ⚠️  No custom config found (will use defaults)`);
    } else {
        const config = configDoc.data();
        console.log(`   ✅ AI Tone: ${config.aiTone || 'warm'}`);
        console.log(`   ✅ Welcome Message: ${config.welcomeMessage ? 'Set' : 'Default'}`);
    }
    console.log();

    // Summary
    console.log("📋 ========== SUMMARY ==========");
    console.log();

    const issues = [];
    const checks = [];

    if (!companyDoc.exists) {
        issues.push("❌ Company UID doesn't exist - WRONG UID in plugin");
    } else {
        checks.push("✅ Company exists");
    }

    if (!periodEnabled) {
        issues.push("❌ Period AI toggle is OFF");
    } else {
        checks.push("✅ Period AI enabled");
    }

    if (!waDoc.exists || waDoc.data()?.status !== 'connected') {
        issues.push("❌ WhatsApp not connected");
    } else {
        checks.push("✅ WhatsApp connected");
    }

    checks.forEach(c => console.log(c));
    console.log();

    if (issues.length > 0) {
        console.log("🚨 ISSUES FOUND:");
        issues.forEach(i => console.log(i));
        console.log();
    }

    if (issues.length === 0) {
        console.log("✅ All checks passed! Period AI should be working.");
        console.log();
        console.log("💡 If it's still not responding, check:");
        console.log("   1. Did you RESTART the server after editing pad_onboarding.js?");
        console.log("   2. Are you sending messages with period keywords?");
        console.log("      (period, cycle, next, date, cramp, flow, etc.)");
        console.log("   3. Check server logs for: '🔍 Plugin Check: Incoming UID'");
    }

    console.log("\n" + "=".repeat(50));
}

debugPeriodAI()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("Error:", err.message);
        process.exit(1);
    });
