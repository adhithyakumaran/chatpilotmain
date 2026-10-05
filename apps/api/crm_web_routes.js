/**
 * CRM web BFF routes expected by the Converso-style dashboard UI.
 * Maps to Firestore inbox + existing WhatsApp session handlers.
 */
const express = require("express");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function createCrmWebRoutes({ db, sessionStatus, sessions, startSession, disconnectUid, uploadMedia }) {
  const router = express.Router();
  const companyUid = () => process.env.CRM_COMPANY_UID || process.env.DEFAULT_COMPANY_UID || "business_1";

  const mapStatus = (raw) => {
    if (!raw || raw === "not_started") return "DISCONNECTED";
    if (raw === "connected") return "CONNECTED";
    if (raw === "qr_ready") return "PAIRING";
    if (raw === "connecting" || raw === "reconnecting") return "LOADING";
    return String(raw).toUpperCase();
  };

  router.get("/api/session/status", (req, res) => {
    const uid = companyUid();
    const raw = sessionStatus.get(uid) || "not_started";
    res.json({ status: mapStatus(raw), user: sessions.has(uid) ? { id: uid } : null });
  });

  router.post("/api/session/pair", async (req, res) => {
    const uid = companyUid();
    const { phone } = req.body || {};
    if (phone) {
      await db.collection("companies").doc(uid).set({ pairingPhone: phone }, { merge: true });
    }
    retrySafeStart(startSession, uid);
    res.json({ code: null, message: "Session starting — scan QR in server logs if required" });
  });

  router.post("/api/session/logout", async (req, res) => {
    const uid = companyUid();
    if (disconnectUid) await disconnectUid(uid);
    res.json({ success: true });
  });

  router.get("/api/chat", async (req, res) => {
    try {
      const uid = companyUid();
      const snap = await db.collection("companies").doc(uid).collection("inbox").get();
      const rows = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          phone: d.contactPhone || doc.id.replace("@s.whatsapp.net", ""),
          name: d.name || d.contactPhone || "Contact",
          lastMessage: d.lastMessage || "",
          updatedAt: d.updatedAt || d.lastMessageAt,
        };
      });
      res.json(rows);
    } catch (e) {
      console.error("crm /api/chat", e);
      res.status(500).json([]);
    }
  });

  router.get("/api/chat/:phone", async (req, res) => {
    try {
      const uid = companyUid();
      const phone = req.params.phone;
      const inboxSnap = await db.collection("companies").doc(uid).collection("inbox")
        .where("contactPhone", "==", phone).limit(1).get();
      let chatId;
      if (inboxSnap.empty) {
        return res.json([]);
      }
      chatId = inboxSnap.docs[0].id;
      const msgSnap = await db.collection("companies").doc(uid).collection("inbox")
        .doc(chatId).collection("messages").orderBy("timestamp", "asc").limit(200).get();
      const messages = msgSnap.docs.map((m) => ({ id: m.id, ...m.data() }));
      res.json(messages);
    } catch (e) {
      console.error("crm get messages", e);
      res.json([]);
    }
  });

  router.post("/api/chat/:phone/send", async (req, res) => {
    try {
      const uid = companyUid();
      const phone = req.params.phone;
      const { text, mediaUrl, type, mimetype, fileName } = req.body || {};
      const inboxRef = db.collection("companies").doc(uid).collection("inbox");
      const q = await inboxRef.where("contactPhone", "==", phone).limit(1).get();
      let chatId;
      if (q.empty) {
        const ref = await inboxRef.add({
          contactPhone: phone,
          name: phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        chatId = ref.id;
      } else {
        chatId = q.docs[0].id;
      }
      const mediaType =
        type === "video" ? "video" : type === "document" || mimetype === "application/pdf" ? "document" : mediaUrl ? "image" : null;
      const msg = {
        text: text || "",
        mediaUrl: mediaUrl || null,
        mediaType,
        type: type || "text",
        mimetype: mimetype || null,
        fileName: fileName || null,
        fromMe: true,
        isMe: true,
        status: "pending",
        timestamp: new Date(),
      };
      await inboxRef.doc(chatId).collection("messages").add(msg);
      await inboxRef.doc(chatId).update({ lastMessage: text || fileName || "Media", updatedAt: new Date() });
      res.json({ success: true });
    } catch (e) {
      console.error("crm send", e);
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/chat/:phone", async (req, res) => {
    try {
      const uid = companyUid();
      const phone = req.params.phone;
      const inboxRef = db.collection("companies").doc(uid).collection("inbox");
      const q = await inboxRef.where("contactPhone", "==", phone).get();
      for (const doc of q.docs) {
        const msgs = await doc.ref.collection("messages").listDocuments();
        for (const m of msgs) await m.delete();
        await doc.ref.delete();
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });
      const uid = companyUid();
      const filename = `${Date.now()}-${req.file.originalname}`;
      const url = await uploadMedia(uid, filename, req.file.buffer, req.file.mimetype);
      try {
        await db.collection("companies").doc(uid).collection("media").add({
          name: req.file.originalname,
          url,
          mimetype: req.file.mimetype,
          createdAt: new Date(),
        });
      } catch (metaErr) {
        console.warn("media metadata", metaErr.message);
      }
      res.json({ url });
    } catch (e) {
      console.error("crm upload", e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  const { registerCrmDataRoutes } = require("./crm_web_data");
  registerCrmDataRoutes(router, { db, sessions, sessionStatus, companyUid });

  return router;
}

function retrySafeStart(startSession, uid) {
  if (typeof startSession === "function") {
    startSession(uid).catch((e) => console.error("startSession", e));
  }
}

module.exports = { createCrmWebRoutes };
