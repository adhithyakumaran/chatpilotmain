const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// GET /api/period/chat-history/:uid/:phone
router.get('/chat-history/:uid/:phone', async (req, res) => {
    try {
        const { uid, phone } = req.params;
        const chatId = `${phone}@s.whatsapp.net`;

        const messagesSnap = await db.collection('companies').doc(uid)
            .collection('inbox').doc(chatId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        const messages = messagesSnap.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text || doc.data().message || '',
            fromMe: doc.data().fromMe || false,
            createdAt: doc.data().createdAt?.toDate().toISOString()
        }));

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/period/user/:uid/:phone
router.delete('/user/:uid/:phone', async (req, res) => {
    try {
        const { uid, phone } = req.params;
        await db.collection('companies').doc(uid).collection('period_tracker_users').doc(phone).delete();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/period/medical-records/:uid/:phone
router.get('/medical-records/:uid/:phone', async (req, res) => {
    try {
        const { uid, phone } = req.params;
        const recordsSnap = await db.collection('companies').doc(uid)
            .collection('period_tracker_users').doc(phone)
            .collection('medical_records')
            .orderBy('createdAt', 'desc')
            .get();

        const records = recordsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        }));

        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/period/medical-record
router.post('/medical-record', async (req, res) => {
    try {
        const { uid, phone, type, description, documentUrl } = req.body;
        if (!uid || !phone || !description) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        await db.collection('companies').doc(uid)
            .collection('period_tracker_users').doc(phone)
            .collection('medical_records')
            .add({
                type: type || 'note',
                description,
                documentUrl: documentUrl || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: 'admin'
            });

        res.json({ success: true, message: 'Medical record saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/period/config/:uid
router.get('/config/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const configDoc = await db.collection('companies').doc(uid)
            .collection('period_ai_config').doc('settings').get();

        if (!configDoc.exists) {
            return res.json({
                success: true,
                config: {
                    welcomeMessage: 'Welcome to the family! 🌸\n\nTo activate your warranty and get your discount, please reply with your details in this format:\n\n*Name, Last Period Date (YYYY-MM-DD), Any Issues*\n\nExample:\n*Avni, 2024-12-01, severe cramps*',
                    aiTone: 'warm',
                    responseLength: 'short',
                    systemPrompt: 'You are a kind, empathetic, and sisterly women\'s health assistant for a Period Care Brand.'
                }
            });
        }

        res.json({ success: true, config: configDoc.data() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/period/config/:uid
router.post('/config/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { welcomeMessage, aiTone, responseLength, systemPrompt } = req.body;

        await db.collection('companies').doc(uid)
            .collection('period_ai_config').doc('settings').set({
                welcomeMessage,
                aiTone,
                responseLength,
                systemPrompt,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        res.json({ success: true, message: 'Configuration updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
