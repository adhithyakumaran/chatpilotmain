/**
 * index.js - ChatPilot Universal Server
 * UPDATED: Added Period Tracker Plugin & Cron Jobs
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  makeCacheableSignalKeyStore,
  delay,
  Browsers
} = require("@whiskeysockets/baileys");

const admin = require("firebase-admin");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// <--- NEW: IMPORTS FOR PERIOD TRACKER ---
const moment = require("moment");
const cron = require("node-cron");
const { handlePadOnboarding } = require("./plugins/pad_onboarding");
// ----------------------------------------

// --- FIREBASE SETUP ---
// --- FIREBASE SETUP ---
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("✅ Loaded Firebase Service Account from ENV");
  } catch (e) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var");
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
    console.log("✅ Loaded Firebase Service Account from File");
  } catch (e) {
    console.error("❌ FATAL: serviceAccountKey.json missing and FIREBASE_SERVICE_ACCOUNT not set.");
    process.exit(1);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors({
  origin: true, // Allow all origins (for local Flutter dev)
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.raw({ type: ['application/octet-stream', 'image/*', 'video/*', 'application/pdf'], limit: '100mb' }));

// --- HELPER IMPORTS ---
const { uploadMedia } = require("./storage_r2");

// --- API ROUTES IMPORTS ---
let scraperRoutes;
let emailRoutes;
let crmRoutes;
let integrationsRoutes;
let authRoutes;
let paymentRoutes;

try { scraperRoutes = require("./scrapper_routes"); } catch (e) { console.warn("⚠️ scrapper_routes.js not found"); }
try { emailRoutes = require("./email_routes"); } catch (e) { console.warn("⚠️ email_routes.js error:", e.message); }

try {
  crmRoutes = require("./crm/crm_routes");
  console.log("🔹 CRM Module Loaded");
} catch (e) {
  console.warn("⚠️ crm_routes.js error:", e.message);
}

try {
  integrationsRoutes = require("./integrations_routes");
  console.log("🔹 Integrations Module Loaded");
} catch (e) {
  console.warn("⚠️ integrations_routes.js not found or error:", e.message);
}

try {
  authRoutes = require("./auth_routes");
  console.log("🔹 Auth Module Loaded");
} catch (e) {
  console.warn("⚠️ auth_routes.js not found or error:", e.message);
}

try {
  paymentRoutes = require("./payment_routes");
  console.log("🔹 Payment Module Loaded");
} catch (e) { console.warn("Payment routes error:", e.message); }

// --- PERIOD AI ROUTES ---
let periodRoutes;
try {
  periodRoutes = require("./period_routes");
  console.log("🌸 Period AI Module Loaded");
} catch (e) { console.warn("⚠️ period_routes.js error:", e.message); }

// --- CONTACT ROUTES ---
let contactRoutes;
try {
  contactRoutes = require("./contact_routes");
  console.log("📧 Contact Module Loaded");
} catch (e) { console.warn("⚠️  contact_routes.js error:", e.message); }

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3002;
const AI_SERVER_URL = (process.env.AI_SERVER_URL || "http://localhost:4000").replace(/\/$/, "");
const SERVER_API_KEY = process.env.SERVER_API_KEY || "chatpilot-secret-key-123";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- GEMINI AI SETUP ---
let genAI;
let reportModel;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  reportModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("✅ Gemini AI Initialized for Reports (gemini-2.5-flash)");
} else {
  console.warn("⚠️ GEMINI_API_KEY not set - AI reports will be disabled");
}

// --- GLOBAL STATE ---
const sessions = new Map();           // Map<uid, socket>
const sessionStatus = new Map();      // Map<uid, status_string>
const retryCount = new Map();         // Map<uid, number>
const processedMsgCache = new Set();  // Anti-duplicate
const aiActionCache = new Map();      // Map<msgId, actionTag>

// --- CONFIGURATION CONSTANTS ---
const MAX_RETRY_ATTEMPTS = 10;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 60000;

// --- MOUNT ROUTES ---
if (scraperRoutes) app.use('/api/scrape', scraperRoutes);
if (emailRoutes) app.use('/api/email', emailRoutes);
if (crmRoutes) app.use('/api/crm', crmRoutes);
if (integrationsRoutes) app.use('/api/integrations', integrationsRoutes);
if (authRoutes) app.use('/api/auth', authRoutes);
if (paymentRoutes) app.use('/api/payment', paymentRoutes);
if (periodRoutes) app.use('/api/period', periodRoutes);
if (contactRoutes) app.use('/api/contact', contactRoutes);


// --- HEALTH CHECK (Uptime Robot) ---
app.get("/health", (req, res) => res.status(200).send("OK"));

// --- PING CHECK (User Request) ---
app.get('/ping', (req, res) => {
  res.send("ChatPilot backend is running 🚀");
});

// --- MEDIA UPLOAD ENDPOINT ---
app.put("/upload/:uid/:filename", async (req, res) => {
  try {
    console.log(`📥 Upload Request: ${req.params.filename}, UID: ${req.params.uid}`);
    if (req.headers['x-api-key'] !== SERVER_API_KEY) return res.status(403).send("Forbidden");
    const { uid, filename } = req.params;
    const fileBuffer = req.body;

    if (!fileBuffer || fileBuffer.length === 0) return res.status(400).send("No file data");

    const ext = filename.split('.').pop().toLowerCase();
    let mimeType = 'application/octet-stream';
    if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'mp4') mimeType = 'video/mp4';
    else if (ext === 'pdf') mimeType = 'application/pdf';

    const publicUrl = await uploadMedia(uid, filename, fileBuffer, mimeType);
    res.status(200).send(publicUrl);
  } catch (e) {
    console.error("Upload Error:", e.message);
    res.status(500).send("Upload failed");
  }
});

// --- DOCUMENT UPLOAD ENDPOINT ---
app.post("/api/upload-document", async (req, res) => {
  try {
    const { fileName, fileData, contentType, uid } = req.body;
    if (!fileName || !fileData || !uid) return res.status(400).json({ success: false, error: "Missing required fields" });

    const fileBuffer = Buffer.from(fileData, 'base64');
    if (fileBuffer.length > 10 * 1024 * 1024) return res.status(400).json({ success: false, error: "File size exceeds 10MB limit" });

    const mimeType = contentType || 'application/octet-stream';
    const publicUrl = await uploadMedia(uid, fileName, fileBuffer, mimeType);
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: "Upload failed: " + error.message });
  }
});


// --- SESSION STATUS ENDPOINT ---
app.get("/session-status/:uid", (req, res) => {
  const { uid } = req.params;
  const status = sessionStatus.get(uid) || "not_started";
  const retries = retryCount.get(uid) || 0;
  res.json({ success: true, status, retries, hasSession: sessions.has(uid) });
});

// --- SESSION CONTROL ENDPOINTS ---
app.post("/start-session/:uid", async (req, res) => {
  const { uid } = req.params;
  if (sessions.has(uid) && sessionStatus.get(uid) === 'connected') {
    return res.json({ success: true, message: "Session already active and connected" });
  }
  retryCount.set(uid, 0);
  await startSession(uid);
  res.json({ success: true, message: "Session starting..." });
});

app.post("/disconnect/:uid", async (req, res) => {
  const { uid } = req.params;
  console.log(`🔌 Manual Disconnect Request for: ${uid}`);

  const sock = sessions.get(uid);
  if (sock) {
    try { sock.end(new Error("User requested disconnect")); } catch (e) { }
    try { await sock.logout(); } catch (e) { }
    sessions.delete(uid);
  }

  sessionStatus.set(uid, 'disconnected');
  retryCount.set(uid, MAX_RETRY_ATTEMPTS + 1);

  const authPath = path.join(__dirname, `auth_info_${uid}`);
  if (fs.existsSync(authPath)) {
    try { fs.rmSync(authPath, { recursive: true, force: true }); } catch (e) { }
  }

  await updateDB(uid, { status: "disconnected", qr: null, connectedAt: null });
  res.json({ success: true, message: "Disconnected successfully" });
});

app.post("/force-reconnect/:uid", async (req, res) => {
  const { uid } = req.params;
  console.log(`🔄 Force Reconnect Request for: ${uid}`);
  const sock = sessions.get(uid);
  if (sock) {
    try { sock.end(new Error("Force reconnect")); } catch (e) { }
    sessions.delete(uid);
  }
  retryCount.set(uid, 0);
  sessionStatus.set(uid, 'reconnecting');
  await startSession(uid);
  res.json({ success: true, message: "Reconnecting..." });
});

// --- AI ANALYTICS REPORT GENERATION ---
app.post("/api/generate-report/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { period } = req.query;

    if (!reportModel) return res.status(503).json({ success: false, error: "AI service not available" });

    console.log(`📊 Generating ${period} report for: ${uid}`);
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '1week': startDate.setDate(now.getDate() - 7); break;
      case '1month': startDate.setMonth(now.getMonth() - 1); break;
      case '1year': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setDate(now.getDate() - 7);
    }

    const analyticsData = await getAnalyticsDataForPeriod(uid, startDate, now);
    const report = await generateAIAnalysisReport(analyticsData, period);

    res.json({ success: true, report, period, dateRange: { start: startDate.toISOString(), end: now.toISOString() }, metrics: analyticsData.summary });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to generate report: " + error.message });
  }
});

// Helper: Aggregate analytics data
async function getAnalyticsDataForPeriod(uid, startDate, endDate) {
  try {
    const companyRef = db.collection("companies").doc(uid);
    const campaignsSnap = await companyRef.collection("campaigns")
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
      .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(endDate))
      .get();
    const campaigns = campaignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const emailCampaignsSnap = await companyRef.collection("email_campaigns")
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
      .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(endDate))
      .get();
    const emailCampaigns = emailCampaignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const contactsSnap = await companyRef.collection("contacts").get();
    const allContacts = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const newContacts = allContacts.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = c.createdAt.toDate();
      return createdDate >= startDate && createdDate <= endDate;
    });

    const inboxSnap = await companyRef.collection("inbox").get();
    let totalMessages = 0;
    let sentMessages = 0;
    let receivedMessages = 0;

    for (const inboxDoc of inboxSnap.docs) {
      const messagesSnap = await inboxDoc.ref.collection("messages")
        .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
        .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(endDate))
        .get();
      messagesSnap.docs.forEach(msgDoc => {
        totalMessages++;
        const msgData = msgDoc.data();
        if (msgData.isMe) sentMessages++; else receivedMessages++;
      });
    }

    let totalCampaignsSent = 0;
    let totalCampaignsFailed = 0;
    let completedCampaigns = 0;
    let activeCampaigns = 0;

    campaigns.forEach(c => {
      totalCampaignsSent += c.sentCount || 0;
      totalCampaignsFailed += c.failedCount || 0;
      if (c.status === 'Completed') completedCampaigns++;
      if (c.status === 'Running' || c.status === 'Pending') activeCampaigns++;
    });

    const successRate = totalCampaignsSent + totalCampaignsFailed > 0
      ? ((totalCampaignsSent / (totalCampaignsSent + totalCampaignsFailed)) * 100).toFixed(2)
      : 0;

    let totalEmailsSent = 0;
    emailCampaigns.forEach(c => { totalEmailsSent += c.recipientCount || 0; });

    return {
      summary: {
        totalCampaigns: campaigns.length, completedCampaigns, activeCampaigns, totalMessagesSent: totalCampaignsSent,
        totalMessagesFailed: totalCampaignsFailed, campaignSuccessRate: successRate, totalContacts: allContacts.length,
        newContacts: newContacts.length, inboxMessages: totalMessages, sentMessages, receivedMessages,
        responseRate: sentMessages > 0 && receivedMessages > 0 ? ((sentMessages / receivedMessages) * 100).toFixed(2) : 0,
        totalEmailCampaigns: emailCampaigns.length, totalEmailsSent
      },
      campaigns: campaigns.map(c => ({ title: c.title, status: c.status, sent: c.sentCount || 0, failed: c.failedCount || 0, createdAt: c.createdAt?.toDate().toISOString() })),
      emailCampaigns: emailCampaigns.map(c => ({ subject: c.subject, recipients: c.recipientCount || 0, createdAt: c.createdAt?.toDate().toISOString() })),
      contactGrowth: newContacts.length,
      period: { start: startDate.toISOString(), end: endDate.toISOString() }
    };
  } catch (error) { throw error; }
}

// Helper: Generate AI report
async function generateAIAnalysisReport(analyticsData, period) {
  try {
    const { summary, campaigns } = analyticsData;
    const prompt = `You are a business analytics expert. Generate a comprehensive performance and improvement analysis report for a WhatsApp marketing platform.
    Time Period: ${period}
    Metrics: ${JSON.stringify(summary)}
    Recent Campaigns: ${JSON.stringify(campaigns.slice(0, 5))}
    Format the report in clear markdown with headers, bullet points, and emphasis.`;

    const result = await reportModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) { throw new Error("AI analysis failed: " + error.message); }
}

// --- CRON JOBS (DAILY REMINDERS) ---
// Checks every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log("⏰ Running Daily Period Reminder Check...");

  const TARGET_UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2";

  const sock = sessions.get(TARGET_UID);
  if (!sock) {
    console.log(`⚠️ Target Client ${TARGET_UID} not connected - Skipping Reminders`);
    return;
  }

  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'day').startOf('day');

  try {
    // Find users who need a reminder TODAY (reminder_date == today)
    const snapshot = await db.collection("companies").doc(TARGET_UID)
      .collection("period_tracker_users")
      .where("reminder_date", ">=", today.toDate())
      .where("reminder_date", "<", tomorrow.toDate())
      .get();

    if (snapshot.empty) return;

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const phone = data.phone + "@s.whatsapp.net";

      await sock.sendMessage(phone, {
        text: `🌸 *Cycle Reminder* 🌸\n\nHi ${data.name || 'there'}! Just a heads up, your period is likely to start in 3 days.\n\nNeed to restock? Use code *PADS20* for 20% off today!`
      });
      console.log(`✅ Sent reminder to ${data.phone}`);
    });
  } catch (e) {
    console.error("Cron Job Error:", e.message);
  }
});

// --- CRM WEB BFF (Converso-style /api/* for dashboard UI) ---
try {
  const { createCrmWebRoutes } = require("./crm_web_routes");
  const disconnectUid = async (uid) => {
    const sock = sessions.get(uid);
    if (sock) {
      try { sock.end(new Error("User requested disconnect")); } catch (e) { }
      try { await sock.logout(); } catch (e) { }
      sessions.delete(uid);
    }
    sessionStatus.set(uid, "disconnected");
  };
  app.use(
    createCrmWebRoutes({
      db,
      sessionStatus,
      sessions,
      startSession,
      disconnectUid,
      uploadMedia,
    })
  );
  console.log("🔹 CRM Web BFF routes mounted");
} catch (e) {
  console.warn("⚠️ CRM Web BFF not loaded:", e.message);
}

// --- SERVER START ---
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));

// ==================== WHATSAPP SESSION LOGIC ====================

function getRetryDelay(attempts) {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempts), MAX_RETRY_DELAY);
}

// Startup: Restore ALL 'connected' sessions
(async () => {
  console.log("♻️  Restoring sessions on server startup...");
  await delay(2000);
  try {
    const snaps = await db.collection("companies").get();
    for (const doc of snaps.docs) {
      const integrationsDoc = await db.collection("companies").doc(doc.id).collection("integrations").doc("whatsapp").get();
      if (integrationsDoc.exists) {
        const wa = integrationsDoc.data();
        if (wa && wa.status === 'connected') {
          console.log(`📱 Restoring session for: ${doc.id}`);
          retryCount.set(doc.id, 0);
          startSession(doc.id);
          await delay(1000);
        }
      }
    }
  } catch (e) { console.error("Session restoration error:", e.message); }
})();

// Dashboard Listener
db.collection("server_config").doc("active_company").onSnapshot(s => {
  if (s.exists && s.data().uid) {
    const uid = s.data().uid;
    const currentStatus = sessionStatus.get(uid);
    if (!sessions.has(uid) && currentStatus !== 'connecting' && currentStatus !== 'connected') {
      console.log(`📊 Dashboard triggered session start for: ${uid}`);
      retryCount.set(uid, 0);
      startSession(uid);
    }
  }
});

// ==================== CORE SESSION FUNCTION ====================
// (Imports already handled at top of file)

// ==================== CORE SESSION FUNCTION ====================
async function startSession(uid) {
  if (sessions.has(uid)) return;
  const currentStatus = sessionStatus.get(uid);
  if (currentStatus === 'connecting') return;

  const currentRetries = retryCount.get(uid) || 0;
  if (currentRetries > MAX_RETRY_ATTEMPTS) {
    console.log(`❌ Max retries exceeded for: ${uid}`);
    await updateDB(uid, { status: "disconnected", qr: null, error: "Max retries exceeded" });
    return;
  }

  console.log(`🚀 Starting Session: ${uid} (Attempt: ${currentRetries + 1})`);
  sessionStatus.set(uid, 'connecting');

  const authPath = path.join(__dirname, `auth_info_${uid}`);
  if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      printQRInTerminal: true,
      browser: ["ChatPilot", "Chrome", "22.0"],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 10000, // Added for stability
      retryRequestDelayMs: 2000,
    });

    sessions.set(uid, sock);

    // Heartbeat Logger
    // Heartbeat Logger & Self-Cleaning
    setInterval(async () => {
      try {
        const status = sessionStatus.get(uid);
        const isSocketOpen = sock?.ws?.readyState === 1;
        const user = sock?.user?.id;



        // Self-Heal: If socket is open and user exists, but DB says otherwise -> Fix it
        if (isSocketOpen && user && status !== 'connected') {
          console.log(`🩹 Self-Healing: Force marking [${uid}] as CONNECTED`);
          sessionStatus.set(uid, 'connected');
          await updateDB(uid, { status: "connected", qr: null });
        }
      } catch (e) { }
    }, 5000);

    // ==================== CONNECTION UPDATE HANDLER ====================
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Handle connection open first to prevent stale QR processing
      if (connection === "open") {
        console.log(`✅ Connected: ${uid}`);
        // Clear any pending QR timeout
        if (global.qrTimeouts && global.qrTimeouts[uid]) {
          clearTimeout(global.qrTimeouts[uid]);
          global.qrTimeouts[uid] = null;
        }
        sessionStatus.set(uid, 'connected');
        retryCount.set(uid, 0);
        await updateDB(uid, {
          status: "connected",
          qr: null,
          connectedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return; // skip further processing for this update
      }

      // QR Code handling with debounce – only if not already connected
      if (qr && sessionStatus.get(uid) !== 'connected') {
        if (!global.qrTimeouts) global.qrTimeouts = {};
        // Cancel any previous pending QR timeout for this uid
        if (global.qrTimeouts[uid]) {
          clearTimeout(global.qrTimeouts[uid]);
        }
        // Set a new timeout; if after 4s we are still not connected, emit QR.
        global.qrTimeouts[uid] = setTimeout(async () => {
          if (sessionStatus.get(uid) !== 'connected' && (!sock?.ws?.readyState || sock.ws.readyState !== 1)) {
            console.log(`📱 QR Generated for ${uid} (Confirmed needed)`);
            sessionStatus.set(uid, 'qr_ready');
            await updateDB(uid, { status: "qr", qr });
          } else {
            console.log(`🛡️ Blocked QR for ${uid} (already connected)`);
          }
          global.qrTimeouts[uid] = null;
        }, 4000);
      } else if (qr) {
        // Already connected – ignore QR event
        console.log(`🛡️ Ignored QR for ${uid} (already connected)`);
        // Clear any pending timeout
        if (global.qrTimeouts && global.qrTimeouts[uid]) {
          clearTimeout(global.qrTimeouts[uid]);
          global.qrTimeouts[uid] = null;
        }
      }

      // Handle connection close
      if (connection === "close") {
        sessions.delete(uid);
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const errorMessage = lastDisconnect?.error?.message || "Unknown error";
        console.log(`❌ Connection Closed [${uid}] - ${statusCode}: ${errorMessage}`);

        if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
          sessionStatus.set(uid, 'logged_out');
          retryCount.set(uid, MAX_RETRY_ATTEMPTS + 1);
          try { fs.rmSync(authPath, { recursive: true, force: true }); } catch (e) { }
          await updateDB(uid, { status: "disconnected", qr: null, error: "Logged out" });
        } else {
          // Reconnect logic
          const retries = retryCount.get(uid) || 0;
          if (retries < MAX_RETRY_ATTEMPTS) {
            const retryDelay = getRetryDelay(retries);
            console.log(`🔄 Reconnecting ${uid} in ${retryDelay / 1000}s...`);
            sessionStatus.set(uid, 'reconnecting');
            retryCount.set(uid, retries + 1);
            await updateDB(uid, { status: "reconnecting", retryCount: retries + 1 });
            setTimeout(() => startSession(uid), retryDelay);
          } else {
            sessionStatus.set(uid, 'disconnected');
            await updateDB(uid, { status: "disconnected", error: "Connection lost" });
          }
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    // ==================== INBOX: INCOMING MESSAGES ====================
    sock.ev.on("messages.upsert", async (m) => {
      try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === "status@broadcast") return;
        if (processedMsgCache.has(msg.key.id)) return;
        processedMsgCache.add(msg.key.id);
        setTimeout(() => processedMsgCache.delete(msg.key.id), 60000);

        const isMe = msg.key.fromMe;
        const contactPhone = msg.key.remoteJid.split('@')[0];
        let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        console.log(`📩 New Msg | Me: ${isMe} | ${contactPhone}: ${text.substring(0, 15)}...`);

        // (Redundant Period Plugin check removed)

        // <--- 🔌 NEW: PERIOD TRACKER PLUGIN CHECK 🔌 ---
        // This is the Guard Clause. If the specific plugin handles the message,
        // we return immediately so the Generic AI does not trigger.
        if (!isMe) {
          try {
            const isHandled = await handlePadOnboarding(sock, msg, text, uid, db);
            if (isHandled) {
              console.log(`✅ Message handled by Period Plugin for ${uid}`);
              return; // STOP execution here
            }
          } catch (e) {
            console.error("Plugin Error:", e.message);
          }
        }
        // <--- 🔌 END PLUGIN CHECK ---

        // --- 🤖 AI AUTO-REPLY SYSTEM ---
        console.log(`🔍 AI Check: text="${text}", isMe=${isMe}`);

        if (text && !isMe) {
          console.log(`✅ AI Block: Conditions met (has text, not from me)`);
          try {
            const integrationRef = db.collection("companies").doc(uid).collection("integrations").doc("whatsapp");
            console.log(`🔍 Fetching integration doc for UID: ${uid}`);
            const integrationSnap = await integrationRef.get();

            if (integrationSnap.exists) {
              console.log(`✅ Integration doc exists`);
              const data = integrationSnap.data();
              const aiEnabled = data.ai_enabled || false;
              const handoffKeywords = data.handoff_keywords || []; // Array of strings e.g. ["human", "support"]

              console.log(`🔍 AI Config: ai_enabled=${aiEnabled}, handoff_keywords=${JSON.stringify(handoffKeywords)}`);

              // 1. Check for Human Handoff Triggers
              const lowerText = text.toLowerCase();
              const triggeredHandoff = handoffKeywords.some(k => lowerText.includes(k.toLowerCase()));

              if (triggeredHandoff) {
                console.log(`👨‍💼 Human Handoff Triggered for ${uid} by keyword.`);

                // Tag the chat
                const inboxRef = db.collection("companies").doc(uid).collection("inbox");
                const q = await inboxRef.where("contactPhone", "==", contactPhone).limit(1).get();
                if (!q.empty) {
                  const chatId = q.docs[0].id;
                  await inboxRef.doc(chatId).update({
                    tags: admin.firestore.FieldValue.arrayUnion("👨‍💼 Human Requested"),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                  });
                }

                // Optionally notify (log for now)
                // Skip AI execution
                return;
              }

              // 2. Execute AI if enabled and no handoff
              if (aiEnabled) {
                console.log(`🤖 AI Enabled for ${uid}. Forwarding to Brain...`);
                const aiResponse = await axios.post(`${AI_SERVER_URL}/widget/chat`, {
                  agentId: uid,
                  message: text,
                  customerPhone: contactPhone
                });

                console.log(`✅ AI Response received:`, aiResponse.data);
                const { reply: replyText, image: replyImage, action: actionTag } = aiResponse.data;

                if (replyText) {
                  console.log(`🤖 AI Replying: "${replyText.substring(0, 20)}..."`);
                  let sentMsg;
                  if (replyImage) {
                    sentMsg = await sock.sendMessage(msg.key.remoteJid, { image: { url: replyImage }, caption: replyText });
                  } else {
                    sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: replyText });
                  }

                  if (actionTag && sentMsg && sentMsg.key) {
                    aiActionCache.set(sentMsg.key.id, actionTag);
                    setTimeout(() => aiActionCache.delete(sentMsg.key.id), 10000);
                  }
                } else {
                  console.log(`⚠️ AI returned no reply text`);
                }
              } else {
                console.log(`❌ AI is DISABLED for ${uid} (ai_enabled=${aiEnabled})`);
              }
            } else {
              console.log(`❌ Integration doc does NOT exist for ${uid}`);
            }
          } catch (error) {
            console.error("❌ AI Bridge Failed:", error.message);
            console.error("Full error:", error);
          }
        } else {
          console.log(`⏭️ AI Block: Skipped (text="${text}", isMe=${isMe})`);
        }

        let mediaType = null;
        let fileName = null;
        let mimeType = null;

        if (msg.message.imageMessage) { mediaType = "image"; mimeType = "image/jpeg"; fileName = `img_${Date.now()}.jpg`; text = msg.message.imageMessage.caption || ""; }
        else if (msg.message.videoMessage) { mediaType = "video"; mimeType = "video/mp4"; fileName = `vid_${Date.now()}.mp4`; text = msg.message.videoMessage.caption || ""; }
        else if (msg.message.documentMessage) { mediaType = "document"; const doc = msg.message.documentMessage; text = doc.caption || doc.fileName || "Document"; mimeType = doc.mimetype; fileName = doc.fileName; }
        else if (msg.message.reactionMessage) {
          // Reaction logic (omitted for brevity, handled above in original)
          return;
        }

        const inboxRef = db.collection("companies").doc(uid).collection("inbox");
        const q = await inboxRef.where("contactPhone", "==", contactPhone).limit(1).get();
        let chatId;
        const lastMsgPreview = mediaType ? `📷 ${mediaType}` : text;

        if (q.empty) {
          const doc = await inboxRef.add({
            contactPhone, contactName: msg.pushName || contactPhone, lastMessage: lastMsgPreview,
            unreadCount: isMe ? 0 : 1, status: "open",
            createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          chatId = doc.id;
        } else {
          chatId = q.docs[0].id;
          const updateData = { lastMessage: lastMsgPreview, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
          if (!isMe) updateData.unreadCount = admin.firestore.FieldValue.increment(1);
          await inboxRef.doc(chatId).update(updateData);
        }

        let mediaUrl = null;
        if (mediaType) {
          const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
          mediaUrl = await uploadMedia(uid, fileName, buffer, mimeType);
        }

        const msgData = {
          text, isMe, status: "delivered", mediaUrl, mediaType,
          createdAt: admin.firestore.FieldValue.serverTimestamp(), waMessageId: msg.key.id
        };
        if (isMe && aiActionCache.has(msg.key.id)) {
          msgData.action = aiActionCache.get(msg.key.id);
          aiActionCache.delete(msg.key.id);
        }

        // Check if message with this waMessageId already exists (prevents duplicates from WhatsApp echo)
        const existingMsgQuery = await inboxRef.doc(chatId).collection("messages")
          .where("waMessageId", "==", msg.key.id)
          .limit(1)
          .get();

        if (existingMsgQuery.empty) {
          // No existing message found, safe to add
          await inboxRef.doc(chatId).collection("messages").add(msgData);
        } else {
          console.log(`⚠️ Message ${msg.key.id} already exists, skipping duplicate insert`);
        }

        if (!isMe) {
          // ... Integrations Logic (Zapier, Slack) ...
          // (Kept original logic, just condensed for space in this view)
          try {
            const integrationsSnap = await db.collection("companies").doc(uid).collection("integrations").where("status", "==", "connected").get();
            integrationsSnap.docs.forEach(async (doc) => {
              const integration = doc.data();
              const provider = doc.id;
              if (provider === 'zapier' && integration.webhookUrl) {
                axios.post(integration.webhookUrl, { event: "new_message", contact: { name: msg.pushName, phone: contactPhone }, message: { text, mediaUrl, type: mediaType || 'text', timestamp: new Date().toISOString() } }).catch(e => { });
              }
            });
          } catch (e) { }
        }
      } catch (e) { console.error("Inbox Error:", e.message); }
    });

  } catch (e) {
    console.error(`❌ Failed to start session for ${uid}:`, e.message);
    sessionStatus.set(uid, 'error');
    sessions.delete(uid);
  }
}

// ==================== CAMPAIGNS (Broadcasts) ====================
db.collectionGroup("campaigns").where("status", "in", ["Pending", "Scheduled"]).onSnapshot(snap => {
  snap.docChanges().forEach(async change => {
    if (change.type !== "added" && change.type !== "modified") return;
    const data = change.doc.data();
    const ref = change.doc.ref;
    if (data.status === "Scheduled") { if (!data.scheduledAt || data.scheduledAt.toDate() > new Date()) return; }

    const uid = ref.path.split("/")[1];
    const sock = sessions.get(uid);
    if (!sock || sessionStatus.get(uid) !== 'connected') return;

    await ref.update({ status: "Running" });

    console.log(`🚀 Starting Broadcast Campaign: ${data.title}`);
    console.log(`📦 Media Data: Type=${data.mediaType}, URL=${data.mediaUrl ? 'YES' : 'NO'}`);
    if (data.mediaUrl) console.log(`🔗 Media URL: ${data.mediaUrl}`);

    // ... (Campaign sending logic remains same as your original) ...
    // For brevity, assuming standard sending logic here
    try {
      const contactsSnap = await db.collection("companies").doc(uid).collection("contacts").get();
      let contacts = contactsSnap.docs.map(d => d.data());
      if (data.filters?.tags?.length > 0) contacts = contacts.filter(c => c.tags && c.tags.some(t => data.filters.tags.includes(t)));

      let sentCount = 0;
      let failedCount = 0;
      for (const contact of contacts) {
        // Sending logic with media support
        let phone = contact.phone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        phone = phone + "@s.whatsapp.net";
        try {
          // Build message object
          let messageObj;
          if (data.mediaUrl && data.mediaType) {
            // Send with media (image, video, or document)
            console.log(`📢 Broadcast media for ${phone}: ${data.mediaType} - ${data.mediaUrl.substring(0, 50)}...`);
            messageObj = {
              [data.mediaType]: { url: data.mediaUrl }
            };
            if (data.message) {
              messageObj.caption = data.message;
            }
          } else {
            // Text only
            messageObj = { text: data.message };
          }

          await sock.sendMessage(phone, messageObj);
          sentCount++;
          await delay(1000);
          if (sentCount % 5 === 0) await ref.update({ sentCount, failedCount });
        } catch (e) {
          failedCount++;
          console.error(`Broadcast send error for ${phone}:`, e.message);
        }
      }
      await ref.update({ status: "Completed", sentCount, failedCount, completedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) { await ref.update({ status: "Failed", error: e.message }); }
  });
});

// ==================== INBOX: PENDING MESSAGES ====================
// Listen for pending messages from inbox and send them via WhatsApp
db.collectionGroup("messages")
  .where("status", "==", "pending")
  .where("isMe", "==", true)
  .onSnapshot(snap => {
    snap.docChanges().forEach(async change => {
      if (change.type !== "added") return;

      const msgDoc = change.doc;
      const msgData = msgDoc.data();
      const msgRef = msgDoc.ref;

      // Extract uid from path: companies/{uid}/inbox/{chatId}/messages/{msgId}
      const pathParts = msgRef.path.split("/");
      const uid = pathParts[1];
      const chatId = pathParts[3];

      console.log(`📤 Processing pending message for ${uid}, chat: ${chatId}`);

      // Get socket
      const sock = sessions.get(uid);
      if (!sock || sessionStatus.get(uid) !== 'connected') {
        console.log(`⚠️ Session not connected for ${uid}, skipping message send`);
        return;
      }

      try {
        // Update status to 'sending' immediately to prevent duplicate processing
        await msgRef.update({ status: "sending" });

        // Get contact phone from inbox doc
        const inboxDoc = await db.collection("companies").doc(uid)
          .collection("inbox").doc(chatId).get();

        if (!inboxDoc.exists) {
          console.error(`❌ Inbox doc not found for chatId: ${chatId}`);
          await msgRef.update({ status: "failed", error: "Chat not found" });
          return;
        }

        let phone = inboxDoc.data().contactPhone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        const contactPhone = phone + "@s.whatsapp.net";

        // Send message based on type
        let sentMsg;
        if (msgData.mediaUrl && msgData.mediaType) {
          // Send media message (image, video, or document)
          console.log(`📸 Preparing to send ${msgData.mediaType}:`);
          console.log(`   URL: ${msgData.mediaUrl}`);
          console.log(`   Caption: ${msgData.text || '(none)'}`);

          const mediaMsg = { [msgData.mediaType]: { url: msgData.mediaUrl } };
          if (msgData.text) mediaMsg.caption = msgData.text;
          sentMsg = await sock.sendMessage(contactPhone, mediaMsg);
          console.log(`✅ Sent ${msgData.mediaType} message to ${contactPhone}`);
        } else if (msgData.text) {
          // Send text message
          sentMsg = await sock.sendMessage(contactPhone, { text: msgData.text });
          console.log(`✅ Sent text message to ${contactPhone}`);
        } else {
          console.warn(`⚠️ Message has no text or media, skipping`);
          await msgRef.update({ status: "pending" }); // Reset status if skipping
          return;
        }

        // Update message status to sent AND save the WhatsApp Message ID
        const updateData = { status: "sent" };
        if (sentMsg && sentMsg.key && sentMsg.key.id) {
          updateData.waMessageId = sentMsg.key.id;
        }
        await msgRef.update(updateData);
      } catch (error) {
        console.error(`❌ Failed to send inbox message: ${error.message}`);
        await msgRef.update({ status: "failed", error: error.message });
      }
    });
  });

async function updateDB(uid, data) {
  try {
    // Log critical updates to trace the "QR Loop" issue
    if (data.status === 'qr' || data.qr) {
      console.log(`📝 DB WRITE: [${uid}] Setting QR... (Status: ${data.status})`);
    } else if (data.status === 'connected') {
      console.log(`📝 DB WRITE: [${uid}] Setting CONNECTED (QR: ${data.qr})`);
    }

    await db.collection("companies").doc(uid).collection("integrations").doc("whatsapp").set(data, { merge: true });
  }
  catch (e) { console.error("DB Update Error:", e.message); }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  for (const [uid, sock] of sessions) { try { sock.end(new Error("Shutdown")); } catch (e) { } }
  sessions.clear();
  process.exit(0);
});