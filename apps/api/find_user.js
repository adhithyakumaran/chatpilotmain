require("dotenv").config();
const admin = require("firebase-admin");

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require("./serviceAccountKey.json");
}

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function mapUser() {
    console.log("🔍 Searching for user 'lessgo'...");

    // Try to find by email or name in 'companies' or 'users'
    // Note: Firestore doesn't list users from Auth, so we rely on 'companies' collection matching
    const companies = await db.collection("companies").get();

    for (const doc of companies.docs) {
        const data = doc.data();
        // Check known fields for email/name
        if (JSON.stringify(data).toLowerCase().includes("lessgo")) {
            console.log(`✅ FOUND: ${doc.id}`);
            console.log(`   Data: ${JSON.stringify(data, null, 2)}`);

            // Check integration status
            const wa = await db.collection("companies").doc(doc.id).collection("integrations").doc("whatsapp").get();
            if (wa.exists) {
                console.log(`\n   WhatsApp Status:`);
                console.log(`   ${JSON.stringify(wa.data(), null, 2)}`);
            } else {
                console.log(`   WhatsApp Status: NO DOCUMENT`);
            }
        }
    }

    process.exit(0);
}

mapUser();
