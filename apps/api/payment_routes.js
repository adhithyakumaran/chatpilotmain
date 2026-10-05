const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_live_RopYFLWwX6Jd2p',
    key_secret: process.env.RAZORPAY_KEY_SECRET
});



router.post('/record-payment', async (req, res) => {
    try {
        const { paymentId, orderId, signature, email, plan, uid } = req.body;
        console.log(`💰 Payment Recorded: ${paymentId} for ${email} [${plan}]`);

        // --- SECURE VERIFICATION ---
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest('hex');

        if (generated_signature !== signature) {
            console.error("❌ Invalid Signature for payment:", paymentId);
            return res.status(400).json({ success: false, error: "Invalid Payment Signature" });
        }

        if (!uid) {
            console.log("⚠️ No UID provided for subscription update");
            // Still return success for payment, but log warning
            return res.json({ success: true, message: "Payment verified (No UID)" });
        }

        const admin = require('firebase-admin');
        const db = admin.firestore();

        // Update Company Document
        const isLifetime = plan === 'lifetime';

        await companyRef.set({
            plan: 'pro', // Give 'pro' limits
            subscriptionStatus: isLifetime ? 'lifetime' : 'active',
            subscriptionStart: admin.firestore.FieldValue.serverTimestamp(),
            autoRenew: !isLifetime,
            paymentId: paymentId,
            lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Subscription activated for user ${uid}`);

        res.json({ success: true, message: "Payment verified & Subscription Activated" });
    } catch (error) {
        console.error("Payment Record Error:", error);
        res.status(500).json({ success: false, error: "Failed" });
    }
});

// Validate Coupon Endpoint
router.post('/validate-coupon', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, error: "Code required" });

        const cleanCode = code.toUpperCase().trim();

        // Check hardcoded first (for fallback)
        const HARDCODED = {
            'WELCOME20': 0.20,
            'CHAT100': 1.00,
            'TEST1': 0.999
        };

        if (HARDCODED[cleanCode]) {
            return res.json({ success: true, discount: HARDCODED[cleanCode] });
        }

        // Check Firestore
        const admin = require('firebase-admin');
        const db = admin.firestore();
        const doc = await db.collection('coupons').doc(cleanCode).get();

        if (doc.exists && doc.data().active !== false) {
            return res.json({ success: true, discount: doc.data().discount || 0 });
        }

        res.json({ success: false, error: "Invalid Coupon" });

    } catch (error) {
        console.error("Coupon Validate Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
