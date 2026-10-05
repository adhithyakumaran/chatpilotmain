/**
 * integrations_routes.js
 * Handles API keys, Shopify Product Search, and HubSpot Lead Capture.
 */

const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const axios = require("axios");

// Middleware to check API Key (Optional)
const checkAuth = (req, res, next) => {
    // const serverKey = req.headers['x-api-key'];
    // if (serverKey !== process.env.SERVER_API_KEY) return res.status(403).send("Unauthorized");
    next();
};

/**
 * POST /api/integrations/connect
 * Saves API keys securely to Firestore
 */
router.post("/connect", checkAuth, async (req, res) => {
    try {
        const { uid, provider, credentials } = req.body;

        if (!uid || !provider || !credentials) {
            return res.status(400).json({ success: false, error: "Missing data" });
        }

        console.log(`🔌 Connecting ${provider} for user ${uid}...`);

        let isValid = true;
        if (provider === 'shopify') {
            isValid = await validateShopify(credentials.shopUrl, credentials.accessToken);
        } else if (provider === 'hubspot') {
            isValid = await validateHubSpot(credentials.accessToken);
        } else if (['zapier', 'slack', 'googlesheets'].includes(provider)) {
            // For Webhook-based integrations, just check if a URL/Key was provided
            isValid = (credentials.webhookUrl && credentials.webhookUrl.startsWith('http')) || (credentials.apiKey && credentials.apiKey.length > 0);
        }

        if (!isValid) {
            return res.status(401).json({ success: false, error: "Invalid Credentials" });
        }

        await db.collection("companies").doc(uid)
            .collection("integrations").doc(provider).set({
                ...credentials,
                status: "connected",
                connectedAt: admin.firestore.FieldValue.serverTimestamp(),
                active: true
            }, { merge: true });

        res.json({ success: true, message: `${provider} connected successfully!` });

    } catch (error) {
        console.error("Integration Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/integrations/disconnect
 */
router.post("/disconnect", checkAuth, async (req, res) => {
    try {
        const { uid, provider } = req.body;
        await db.collection("companies").doc(uid)
            .collection("integrations").doc(provider).update({
                status: "disconnected",
                active: false,
            });
        res.json({ success: true, message: "Disconnected" });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==========================================
// 🛍️ SHOPIFY: PRODUCT SEARCH ROUTE
// ==========================================
router.get("/shopify/search", async (req, res) => {
    try {
        const { uid, query } = req.query;
        if (!uid) return res.status(400).json({ error: "Missing UID" });

        console.log(`🔍 Shopify Search Request for UID: '${uid}'`);

        const doc = await db.collection("companies").doc(uid)
            .collection("integrations").doc("shopify").get();

        console.log(`📄 Firestore Doc Exists: ${doc.exists}`);
        if (doc.exists) {
            console.log(`📄 Doc Status: ${doc.data().status}`);
            console.log(`📄 Doc Data: ${JSON.stringify(doc.data())}`);
        }

        if (!doc.exists || doc.data().status !== "connected") {
            console.log("❌ Shopify not connected check failed.");
            return res.status(404).json({ error: "Shopify not connected" });
        }

        const { shopUrl, accessToken } = doc.data();
        const cleanUrl = shopUrl.replace("https://", "").replace(/\/$/, "");

        // Search Logic
        let apiUrl = `https://${cleanUrl}/admin/api/2023-10/products.json?limit=5&status=active`;
        if (query) apiUrl += `&title=${encodeURIComponent(query)}`;

        console.log(`🔍 Searching Shopify for ${uid}: "${query || 'latest'}"`);

        const response = await axios.get(apiUrl, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });

        const products = response.data.products.map(p => ({
            id: p.id,
            title: p.title,
            price: p.variants[0]?.price,
            currency: "INR",
            inventory: p.variants[0]?.inventory_quantity,
            image: p.images.length > 0 ? p.images[0].src : null,
            link: `https://${cleanUrl}/products/${p.handle}`
        }));

        res.json({ success: true, products });

    } catch (error) {
        console.error("Shopify Search Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 📇 HUBSPOT: CREATE CONTACT ROUTE (NEW)
// ==========================================
router.post("/hubspot/contact", async (req, res) => {
    try {
        const { uid, email, firstname, lastname, phone } = req.body;

        if (!uid || !email) return res.status(400).json({ error: "UID and Email required" });

        const doc = await db.collection("companies").doc(uid)
            .collection("integrations").doc("hubspot").get();

        if (!doc.exists || doc.data().status !== "connected") {
            return res.status(404).json({ error: "HubSpot not connected" });
        }

        const { accessToken } = doc.data();

        console.log(`📝 Creating HubSpot contact for ${uid}: ${email}`);

        const properties = {
            email: email,
            firstname: firstname || "Friend",
            lastname: lastname || "",
            phone: phone || "",
            lifecyclestage: "lead"
        };

        const response = await axios.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            { properties },
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        res.json({ success: true, id: response.data.id });

    } catch (error) {
        if (error.response && error.response.status === 409) {
            console.log("⚠️ Contact already exists in HubSpot (Deduplicated).");
            return res.json({ success: true, message: "Contact already exists" });
        }
        console.error("HubSpot Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 🔎 HUBSPOT: SEARCH CONTACT ROUTE (AI TOOL)
// ==========================================
router.get("/hubspot/search", async (req, res) => {
    try {
        const { uid, email } = req.query;
        if (!uid || !email) return res.status(400).json({ error: "Missing UID or Email" });

        console.log(`🔎 Searching HubSpot for ${uid}: ${email}`);

        const doc = await db.collection("companies").doc(uid)
            .collection("integrations").doc("hubspot").get();

        if (!doc.exists || doc.data().status !== "connected") {
            return res.status(404).json({ error: "HubSpot not connected" });
        }

        const { accessToken } = doc.data();

        // HubSpot Search API
        const searchResponse = await axios.post(
            "https://api.hubapi.com/crm/v3/objects/contacts/search",
            {
                filterGroups: [{
                    filters: [{ propertyName: "email", operator: "EQ", value: email }]
                }],
                properties: ["email", "firstname", "lastname", "phone", "lifecyclestage"],
                limit: 1
            },
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        if (searchResponse.data.total > 0) {
            const contact = searchResponse.data.results[0];
            return res.json({
                success: true,
                found: true,
                contact: {
                    id: contact.id,
                    ...contact.properties
                }
            });
        }

        res.json({ success: true, found: false, message: "Contact not found" });

    } catch (error) {
        console.error("HubSpot Search Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- HELPER VALIDATORS ---
async function validateShopify(shopUrl, token) {
    try {
        const cleanUrl = shopUrl.replace("https://", "").replace(/\/$/, "");
        const url = `https://${cleanUrl}/admin/api/2023-10/shop.json`;
        const resp = await axios.get(url, { headers: { 'X-Shopify-Access-Token': token } });
        return resp.status === 200;
    } catch (e) { return false; }
}

async function validateHubSpot(token) {
    try {
        const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=1`;
        const resp = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        return resp.status === 200;
    } catch (e) { return false; }
}

module.exports = router;