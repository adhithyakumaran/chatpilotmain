const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Helper: Validate Email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// POST /api/auth/create-account
router.post('/create-account', async (req, res) => {
    try {
        const { email, password, username, plan } = req.body;

        // 1. Validation
        if (!email || !password || !username) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, error: "Invalid email" });
        }

        console.log(`👤 Creating account for: ${email} [${plan}]`);

        // 2. Create Firebase Auth User
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username,
            emailVerified: true // Auto-verify since they paid
        });

        const uid = userRecord.uid;
        const now = admin.firestore.FieldValue.serverTimestamp();

        // 3. Initialize Firestore Company Doc
        // We set ID = UID for 1:1 mapping in this multi-tenant app
        await admin.firestore().collection('companies').doc(uid).set({
            name: username, // Initially use username as company name
            email: email,
            email: email,
            plan: plan || 'pro',
            // Default active status for paid accounts (simulated)
            subscriptionStatus: 'active',
            autoRenew: true, // Virtual default
            createdAt: now,
            updatedAt: now,
            // Default Settings
            settings: {
                timezone: "Asia/Kolkata",
                currency: "INR"
            },
            // Empty collections will be created on demand, but we can set flags
            setupComplete: true
        });

        // 4. Initialize Integrations Sub-collection (Optional placeholders)
        await admin.firestore().collection('companies').doc(uid).collection('integrations').doc('whatsapp').set({
            status: 'disconnected',
            ai_enabled: true
        });

        console.log(`✅ Account Created: ${uid}`);

        res.json({
            success: true,
            uid: uid,
            message: "Account created successfully"
        });

    } catch (error) {
        console.error("❌ Create Account Error:", error);
        // Handle "Email already exists" specifically
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ success: false, error: "Email already in use." });
        }
        res.status(500).json({ success: false, error: "Server error: " + error.message });
    }
});

module.exports = router;
