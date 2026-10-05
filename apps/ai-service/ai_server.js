/**
 * ChatPilot AI Brain 🧠 (Production Ready)
 * Features: PDF Training, Branding, Shopify Reader, HubSpot Writer
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const admin = require("firebase-admin");
const axios = require("axios"); // For calling Main Server Tools
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// --- CONSTANTS ---
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || "http://localhost:3002";
const SERVER_API_KEY = process.env.SERVER_API_KEY || "chatpilot-secret-key-123";

// --- FIREBASE SETUP ---
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    try {
        serviceAccount = require("./serviceAccountKey.json");
    } catch (e) {
        console.error("❌ FATAL: serviceAccountKey.json missing.");
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

// --- LIBRARY LOADING ---
let pdfParse;
try {
    pdfParse = require("pdf-parse");
    if (typeof pdfParse !== 'function' && pdfParse.default) pdfParse = pdfParse.default;
} catch (e) { console.error("❌ 'pdf-parse' missing."); }

// --- CONFIG ---
const app = express();
const DEFAULT_ALLOWED_ORIGINS = [
    "https://www.chatpilot.co.in",
    "https://chatpilot.co.in",
    "https://edu.chatpilot.co.in",
    "https://app.chatpilot.co.in",
    "https://chatpilot-7084d.web.app",
];
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            return callback(null, true);
        }
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Initialize Groq with Round-Robin API Keys
const GROQ_API_KEYS = process.env.GROQ_API_KEYS.split(',');
let currentKeyIndex = 0;

function getNextGroqClient() {
    const apiKey = GROQ_API_KEYS[currentKeyIndex];
    const keyNumber = currentKeyIndex + 1; // Store before incrementing
    const keyPreview = apiKey.slice(-8); // Last 8 chars for identification
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    console.log(`🔄 Using Groq Key #${keyNumber}/${GROQ_API_KEYS.length} (...${keyPreview})`);
    return new Groq({ apiKey });
}

// Initialize Gemini for Reports
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
const reportModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- RATE LIMITER FOR GROQ (30 RPM, 14,400 RPD) ---
const rateLimiter = {
    minute: { count: 0, reset: Date.now() + 60000 },
    day: { count: 0, reset: Date.now() + 86400000 }
};

function checkRateLimit() {
    const now = Date.now();

    // Reset minute counter
    if (now > rateLimiter.minute.reset) {
        rateLimiter.minute = { count: 0, reset: now + 60000 };
    }

    // Reset day counter
    if (now > rateLimiter.day.reset) {
        rateLimiter.day = { count: 0, reset: now + 86400000 };
    }

    // Check limits
    if (rateLimiter.minute.count >= 30) {
        return { allowed: false, reason: "Rate limit: 30 requests per minute exceeded" };
    }
    if (rateLimiter.day.count >= 14400) {
        return { allowed: false, reason: "Rate limit: 14,400 requests per day exceeded" };
    }

    // Increment counters
    rateLimiter.minute.count++;
    rateLimiter.day.count++;

    return { allowed: true };
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});


// --- ROUTE: HEALTH CHECK (For Uptime Robot) ---
app.get("/health", (req, res) => res.send("OK"));

// --- ROUTE: PING CHECK (User Request) ---
app.get("/ping", (req, res) => res.send("AI Server is running 🧠"));

// --- ROUTE 1: LEGACY TRAIN (Maintained for backward compatibility) ---
app.post("/train-ai", upload.single("pdf"), async (req, res) => {
    try {
        const { uid, instruction, bot_name, bot_color } = req.body;
        const file = req.file;

        // If file provided, treat as "Source Add" for PDF
        if (file) {
            // Forward to new logic
            await addSource({
                uid,
                type: 'pdf',
                content: file.buffer,
                name: file.originalname
            });
        }

        // Update metadata
        await db.collection("agents").doc(uid).set({
            system_instruction: instruction,
            bot_name,
            bot_color,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- NEW: KNOWLEDGE BASE API ---

// 1. ADD SOURCE (PDF, Text, URL)
app.post("/knowledge/add", upload.single("file"), async (req, res) => {
    try {
        const { uid, type, url, textName } = req.body; // type: 'pdf', 'text', 'url'
        const file = req.file;

        console.log(`📚 Adding Source [${type}] for ${uid}`);

        let sourceData = {
            type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (type === 'pdf' && file) {
            sourceData.name = file.originalname;
            sourceData.content = await extractPdfText(file.buffer);
        } else if (type === 'text' && file) {
            sourceData.name = file.originalname;
            sourceData.content = file.buffer.toString('utf-8');
        } else if (type === 'url' && url) {
            sourceData.name = url;
            sourceData.url = url;
            sourceData.content = await scrapeUrl(url);
        } else {
            return res.status(400).json({ error: "Invalid source data" });
        }

        // Save Source to Subcollection
        const docRef = await db.collection("agents").doc(uid).collection("sources").add(sourceData);

        // Rebuild Brain
        await rebuildBrain(uid);

        res.json({ success: true, id: docRef.id, name: sourceData.name });

    } catch (e) {
        console.error("Add Source Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// 2. LIST SOURCES
app.get("/knowledge/list/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const snapshot = await db.collection("agents").doc(uid).collection("sources").orderBy("createdAt", "desc").get();
        const sources = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            type: doc.data().type,
            date: doc.data().createdAt
        }));
        res.json({ sources });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. DELETE SOURCE
app.delete("/knowledge/delete/:uid/:sourceId", async (req, res) => {
    try {
        const { uid, sourceId } = req.params;
        await db.collection("agents").doc(uid).collection("sources").doc(sourceId).delete();
        await rebuildBrain(uid);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- HELPERS ---

async function extractPdfText(buffer) {
    if (typeof pdfParse !== 'function') throw new Error("PDF Library missing");
    const data = await pdfParse(buffer);
    return data.text;
}

async function scrapeUrl(url) {
    try {
        const cheerio = require('cheerio'); // Lazy load
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove script, style, and boilerplates
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        // Get meaningful text
        let text = $('body').text();
        return text.replace(/\s+/g, ' ').trim().substring(0, 50000); // Limit size
    } catch (e) {
        throw new Error(`Failed to scrape URL: ${e.message}`);
    }
}

async function addSource({ uid, type, content, name }) {
    await db.collection("agents").doc(uid).collection("sources").add({
        type, name, content, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await rebuildBrain(uid);
}

async function rebuildBrain(uid) {
    console.log(`🧠 Rebuilding Brain for ${uid}...`);
    const snapshot = await db.collection("agents").doc(uid).collection("sources").get();

    let fullKnowledge = "";
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        fullKnowledge += `\n\n--- SOURCE: ${data.name} ---\n${data.content || ""}`;
    });

    // Limit total brain size to avoiding token limits (naive truncation)
    if (fullKnowledge.length > 200000) fullKnowledge = fullKnowledge.substring(0, 200000);

    await db.collection("agents").doc(uid).set({
        knowledge_text: fullKnowledge,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`✅ Brain Rebuilt (${fullKnowledge.length} chars)`);
}

// --- ROUTE 2: CONFIG ---
app.get("/widget/config/:agentId", async (req, res) => {
    try {
        const doc = await db.collection("agents").doc(req.params.agentId).get();
        if (!doc.exists) return res.json({ name: "Support", color: "#075e54" });
        const data = doc.data();
        res.json({ name: data.bot_name || "Support", color: data.bot_color || "#075e54" });
    } catch (e) { res.status(500).json({ error: "Config Error" }); }
});

// --- ROUTE 3: CHAT (The Brain + Tools) ---
app.post("/widget/chat", async (req, res) => {
    const { agentId, message } = req.body;

    try {
        const doc = await db.collection("agents").doc(agentId).get();
        if (!doc.exists) return res.json({ reply: "I haven't been trained yet." });

        const data = doc.data();
        const context = data.knowledge_text || "";
        const systemInstruction = data.system_instruction || "You are a helpful AI assistant.";

        // --- 1. INTELLIGENT CONTEXT FETCHING ---
        // The Brain decides if it needs to consult the Tools (Shopify/HubSpot)
        console.log(`🧠 AI Analyzing intent for: "${message}"`);
        const { liveStoreData, crmData, productImage, actionTag } = await fetchContextData(agentId, message);

        let systemNote = "";
        if (crmData) {
            systemNote += `\n[SYSTEM: Found CRM Data for this user: ${JSON.stringify(crmData)}. Use this to personalize the answer.]`;
        }

        // ---------------------------------------------------------
        // BUILD PROMPT
        // ---------------------------------------------------------
        const prompt = `
        ROLE: ${systemInstruction}
        
        INSTRUCTIONS:
        Answer the customer based on the BUSINESS DOCUMENTS and LIVE INTEGRATION DATA.
        
        RULES:
        1. If LIVE STORE DATA has products, YOU MUST recommend them with prices and links.
        2. If CRM DATA is present, confirm you found their details.
        3. Be helpful, professional, and concise.
        ${systemNote}

        LIVE INTEGRATION DATA (Shopify/HubSpot):
        ${liveStoreData}

        BUSINESS DOCUMENTS (PDF Knowledge):
        "${context.substring(0, 20000)}" 

        CUSTOMER QUESTION:
        "${message}"
        `;

        // Check rate limit before calling Groq
        const rateLimitCheck = checkRateLimit();
        if (!rateLimitCheck.allowed) {
            console.error(`⚠️ Rate Limit: ${rateLimitCheck.reason}`);
            return res.json({ reply: "I'm receiving too many requests right now. Please try again in a minute." });
        }

        const groq = getNextGroqClient(); // Round-robin key selection
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024
        });

        const replyText = chatCompletion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";

        console.log(`🤖 AI Reply: ${replyText.substring(0, 50)}...`);
        res.json({
            reply: replyText,
            image: productImage,
            action: actionTag
        });

    } catch (e) {
        console.error("❌ Chat Error:", e.message);
        res.json({ reply: "I'm having trouble connecting right now." });
    }
});

// --- HELPER: CONTEXT FETCHING AGENT ---
async function fetchContextData(uid, message) {
    let liveStoreData = "No live data available.";
    let crmData = null;
    let productImage = null;
    let actionTag = null;

    try {
        // 1. Check Connect Integrations
        const integrationsSnap = await db.collection("companies").doc(uid).collection("integrations").where("status", "==", "connected").get();
        const connectedProviders = integrationsSnap.docs.map(d => d.id);

        console.log(`🔌 Connected Tools for ${uid}: ${connectedProviders.join(", ")}`);

        // 2. SHOPIFY TOOL (Trigger: 'price', 'cost', 'buy', 'product', 'stock')
        if (connectedProviders.includes("shopify")) {
            const keywords = ['price', 'cost', 'buy', 'product', 'stock', 'have', 'looking for'];
            const isProductQuery = keywords.some(k => message.toLowerCase().includes(k));

            if (isProductQuery) {
                console.log("🛍️ Intent: Shopping. Fetching Shopify Data...");
                try {
                    // Extract potential product name (simple heuristic)
                    const searchTerm = message.replace(/price|cost|buy|product|stock|do you have/gi, "").trim();
                    const shopifyRes = await axios.get(`${MAIN_SERVER_URL}/api/integrations/shopify/search`, {
                        params: { uid, query: searchTerm }
                    });

                    if (shopifyRes.data.products && shopifyRes.data.products.length > 0) {
                        const products = shopifyRes.data.products;
                        liveStoreData = "FOUND PRODUCTS IN STORE:\n" + products.map(p =>
                            `- ${p.title}: ${p.currency} ${p.price} (Stock: ${p.inventory})\n  Link: ${p.link}`
                        ).join("\n");

                        // Pick first image for specific product queries
                        if (products[0].image) productImage = products[0].image;
                        actionTag = "🛍️ Checked Store";
                    } else {
                        liveStoreData = "No matching products found in the store.";
                        actionTag = "🛍️ Checked Store";
                    }
                } catch (e) {
                    console.error("Shopify Tool Error:", e.message);
                }
            }
        }

        // 3. HUBSPOT TOOL (Trigger: specific emails or 'my status', 'check lead')
        if (connectedProviders.includes("hubspot")) {
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const emailMatch = message.match(emailRegex);

            if (emailMatch) {
                const email = emailMatch[0];
                console.log(`📇 Intent: CRM Lookup. Checking HubSpot for ${email}...`);
                try {
                    const hubspotRes = await axios.get(`${MAIN_SERVER_URL}/api/integrations/hubspot/search`, {
                        params: { uid, email }
                    });

                    if (hubspotRes.data.found) {
                        crmData = hubspotRes.data.contact;
                        liveStoreData += `\n\nCRM CONTACT FOUND: ${JSON.stringify(crmData)}`;
                        actionTag = "📇 Checked CRM";
                    } else {
                        liveStoreData += `\n\nCRM: Contact ${email} not found in database.`;
                        actionTag = "📇 CRM Lookup";
                    }
                } catch (e) {
                    console.error("HubSpot Tool Error:", e.message);
                }
            }
        }

    } catch (e) {
        console.error("Context Fetch Error:", e.message);
    }

    return { liveStoreData, crmData, productImage, actionTag };
}

// --- ROUTE 4: ANALYTICS SUGGESTIONS ---
app.post("/generate-suggestions", async (req, res) => {
    const { analytics } = req.body;
    try {
        if (!analytics) return res.json({ suggestions: [] });

        const prompt = `
        Analyze these WhatsApp metrics and give 4 JSON business suggestions:
        Sent: ${analytics.total_sent}, Campaigns: ${analytics.recent_campaigns?.length || 0}
        
        Format: JSON Array of objects {title, description, category, priority, icon}
        `;

        const result = await reportModel.generateContent(prompt);
        let text = result.response.text().replace(/```json|```/g, '').trim();

        res.json({ suggestions: JSON.parse(text) });
    } catch (e) {
        res.json({ suggestions: [] });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 ChatPilot AI Server running on Port ${PORT}`));