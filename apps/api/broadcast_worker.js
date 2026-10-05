/**
 * broadcast_worker.js - FINAL VERSION
 */
const admin = require("firebase-admin");
const db = admin.firestore();
const sessions = require("./sessions");

console.log("📡 Broadcast Worker Loaded");

const DELAY_MSG = 2000;

db.collectionGroup("campaigns")
  .where("status", "in", ["pending", "scheduled"])
  .onSnapshot(async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== "added") continue;
      const data = change.doc.data();

      if (data.status === "scheduled") {
        const now = new Date();
        const scheduled = data.scheduleTime?.toDate();
        if (!scheduled || scheduled > now) continue;
      }

      startBroadcast(change.doc.ref, data).catch(console.error);
    }
  });

async function startBroadcast(ref, data) {
  const uid = ref.path.split("/")[1];

  // 1. GET CONTACTS (Fixed: Use tenants collection)
  const snapshot = await db.collection("companies").doc(uid).collection("contacts").get();
  let contacts = snapshot.docs.map(d => d.data());

  // 🏷️ FILTER BY TAGS
  const tags = data.filters?.tags || [];
  if (tags.length > 0) {
    console.log(`🎯 Filtering by tags: ${tags.join(", ")}`);
    contacts = contacts.filter(c => {
      const cTags = c.tags || [];
      return cTags.some(t => tags.includes(t));
    });
  } else {
    console.log("📢 Broadcasting to ALL contacts");
  }

  if (contacts.length === 0) {
    await ref.update({ status: "failed", error: "No contacts found" });
    return;
  }

  await ref.update({ status: "running" });

  let sent = 0;
  let failed = 0;

  const text = data.message || "";
  const msg = {};

  // Validate media URL - must be a valid HTTP/HTTPS URL
  const hasValidMedia = data.mediaUrl &&
    (data.mediaUrl.startsWith("http://") ||
      data.mediaUrl.startsWith("https://"));

  if (hasValidMedia) {
    if (data.mediaUrl.endsWith("mp4")) msg.video = { url: data.mediaUrl };
    else if (data.mediaUrl.endsWith("pdf")) {
      msg.document = { url: data.mediaUrl };
      msg.mimetype = "application/pdf";
      msg.fileName = "File.pdf";
    }
    else msg.image = { url: data.mediaUrl };
    msg.caption = text;
  } else {
    if (data.mediaUrl && !hasValidMedia) {
      console.log(`⚠️ Invalid media URL: "${data.mediaUrl}", sending as text-only`);
    }
    msg.text = text;
  }

  for (const c of contacts) {
    try {
      // 🔄 GET FRESH SOCKET (Crucial for stability)
      const sock = sessions.get(uid);
      if (!sock) throw new Error("Socket disconnected");

      const phone = c.phone.replace(/\D/g, "") + "@s.whatsapp.net";
      let finalMsg = JSON.parse(JSON.stringify(msg));
      const name = c.name || "Friend";

      if (finalMsg.text) finalMsg.text = finalMsg.text.replace("{{name}}", name);
      if (finalMsg.caption) finalMsg.caption = finalMsg.caption.replace("{{name}}", name);

      await sock.sendMessage(phone, finalMsg);
      sent++;
      process.stdout.write(".");
    } catch (e) {
      console.error(`❌ Failed to send to ${c.phone}: ${e.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, DELAY_MSG));
  }

  await ref.update({ status: "completed", sentCount: sent, failedCount: failed });
  console.log(`\n✅ Campaign Done. Sent: ${sent}, Failed: ${failed}`);
}