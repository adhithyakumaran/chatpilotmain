/**
 * Firestore-backed CRM dashboard routes (customers, flows, broadcasts, etc.)
 */
const admin = require("firebase-admin");

const FLOW_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome & qualify",
    description: "Greet new leads and collect intent.",
  },
  {
    id: "support",
    name: "Support triage",
    description: "Route issues to human or auto-reply.",
  },
  {
    id: "promo",
    name: "Promo follow-up",
    description: "Nudge users who viewed pricing.",
  },
];

function tsToIso(v) {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function normalizePhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  return digits;
}

function registerCrmDataRoutes(router, { db, sessions, sessionStatus, companyUid }) {
  const cref = () => db.collection("companies").doc(companyUid());

  async function tagsMap(uid) {
    const snap = await db.collection("companies").doc(uid).collection("tags").get();
    const map = new Map();
    snap.docs.forEach((d) => map.set(d.id, { id: d.id, name: d.data().name, color: d.data().color }));
    return map;
  }

  function mapContact(doc, tagMap) {
    const d = doc.data();
    const tagIds = d.tags || [];
    const tags = tagIds.map((tid) => tagMap.get(tid) || { id: tid, name: String(tid), color: "gray" });
    return {
      id: doc.id,
      name: d.name || null,
      phone: d.phone || d.contactPhone || "",
      email: d.email || null,
      tags,
      lastSeenAt: tsToIso(d.lastSeenAt || d.updatedAt || d.createdAt),
    };
  }

  router.post("/api/users/sync", async (req, res) => {
    try {
      const uid = companyUid();
      const { userId, email, name, photoUrl, provider } = req.body || {};
      if (!userId) return res.status(400).json({ error: "userId required" });
      await db.collection("companies").doc(uid).collection("team").doc(userId).set(
        {
          email,
          name,
          photoUrl,
          provider,
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.json({ success: true });
    } catch (e) {
      console.error("users/sync", e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/notifications", async (req, res) => {
    try {
      const uid = companyUid();
      const snap = await db.collection("companies").doc(uid).collection("notifications").orderBy("createdAt", "desc").limit(50).get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: tsToIso(d.data().createdAt) })));
    } catch (e) {
      res.json([]);
    }
  });

  router.get("/api/business/me", async (req, res) => {
    try {
      const doc = await cref().get();
      const d = doc.exists ? doc.data() : {};
      res.json({
        id: companyUid(),
        name: d.name || d.businessName || "My Business",
        phone: d.phone || d.pairingPhone || "",
        timezone: d.timezone || "Asia/Kolkata",
        ...d,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/api/business/me", async (req, res) => {
    try {
      const body = { ...req.body };
      delete body.id;
      await cref().set(body, { merge: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/customers", async (req, res) => {
    try {
      const uid = companyUid();
      const tagMap = await tagsMap(uid);
      const snap = await db.collection("companies").doc(uid).collection("contacts").get();
      let rows = snap.docs.map((d) => mapContact(d, tagMap));
      const search = (req.query.search || "").toString().toLowerCase();
      if (search) {
        rows = rows.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(search)) ||
            (c.phone && c.phone.includes(search)) ||
            (c.email && c.email.toLowerCase().includes(search))
        );
      }
      res.json(rows);
    } catch (e) {
      console.error("customers list", e);
      res.status(500).json([]);
    }
  });

  router.post("/api/customers", async (req, res) => {
    try {
      const uid = companyUid();
      const { name, phone, email, tags } = req.body || {};
      const p = normalizePhone(phone);
      if (!p) return res.status(400).json({ error: "phone required" });
      const ref = await db.collection("companies").doc(uid).collection("contacts").add({
        name: name || null,
        phone: p,
        email: email || null,
        tags: tags || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/api/customers/:id", async (req, res) => {
    try {
      const uid = companyUid();
      const { name, phone, email, tags } = req.body || {};
      const update = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      if (name !== undefined) update.name = name;
      if (phone !== undefined) update.phone = normalizePhone(phone);
      if (email !== undefined) update.email = email;
      if (tags !== undefined) update.tags = tags;
      await db.collection("companies").doc(uid).collection("contacts").doc(req.params.id).update(update);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/customers/:id", async (req, res) => {
    try {
      const uid = companyUid();
      await db.collection("companies").doc(uid).collection("contacts").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/customers/:id/tags", async (req, res) => {
    try {
      const uid = companyUid();
      const { tags } = req.body || {};
      const ref = db.collection("companies").doc(uid).collection("contacts").doc(req.params.id);
      await ref.update({ tags: admin.firestore.FieldValue.arrayUnion(...(tags || [])) });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/customers/:customerId/tags/:tagId", async (req, res) => {
    try {
      const uid = companyUid();
      const ref = db.collection("companies").doc(uid).collection("contacts").doc(req.params.customerId);
      const doc = await ref.get();
      const current = doc.data()?.tags || [];
      await ref.update({ tags: current.filter((t) => t !== req.params.tagId) });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/customers/export", async (req, res) => {
    try {
      const uid = companyUid();
      const tagMap = await tagsMap(uid);
      const snap = await db.collection("companies").doc(uid).collection("contacts").get();
      const lines = ["name,phone,email,tags"];
      snap.docs.forEach((d) => {
        const c = mapContact(d, tagMap);
        const tagNames = c.tags.map((t) => t.name).join(";");
        lines.push(`"${(c.name || "").replace(/"/g, '""')}",${c.phone},${c.email || ""},"${tagNames}"`);
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=customers.csv");
      res.send(lines.join("\n"));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/tags", async (req, res) => {
    try {
      const uid = companyUid();
      const snap = await db.collection("companies").doc(uid).collection("tags").get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      res.json([]);
    }
  });

  router.post("/api/tags", async (req, res) => {
    try {
      const uid = companyUid();
      const { name, color } = req.body || {};
      const ref = await db.collection("companies").doc(uid).collection("tags").add({
        name,
        color: color || "blue",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/tags/:id", async (req, res) => {
    try {
      const uid = companyUid();
      await db.collection("companies").doc(uid).collection("tags").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/products", async (req, res) => {
    try {
      const snap = await cref().collection("products").get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      res.json([]);
    }
  });

  router.post("/api/products", async (req, res) => {
    try {
      const ref = await cref().collection("products").add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/products/:id", async (req, res) => {
    try {
      await cref().collection("products").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/variables", async (req, res) => {
    try {
      const snap = await cref().collection("variables").get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      res.json([]);
    }
  });

  router.post("/api/variables", async (req, res) => {
    try {
      const ref = await cref().collection("variables").add(req.body);
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/variables/:id", async (req, res) => {
    try {
      await cref().collection("variables").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/media", async (req, res) => {
    try {
      const snap = await cref().collection("media").orderBy("createdAt", "desc").limit(200).get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: tsToIso(d.data().createdAt) })));
    } catch (e) {
      res.json([]);
    }
  });

  router.delete("/api/media/:id", async (req, res) => {
    try {
      await cref().collection("media").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/api/upload/:id", async (req, res) => {
    try {
      await cref().collection("media").doc(req.params.id).set(req.body, { merge: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/templates", async (req, res) => {
    try {
      const snap = await cref().collection("message_templates").get();
      res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      res.json([]);
    }
  });

  router.post("/api/templates", async (req, res) => {
    try {
      const ref = await cref().collection("message_templates").add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/api/templates/:id", async (req, res) => {
    try {
      await cref().collection("message_templates").doc(req.params.id).set(req.body, { merge: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/templates/:id", async (req, res) => {
    try {
      await cref().collection("message_templates").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  function mapCampaign(doc) {
    const d = doc.data();
    const total = (d.sentCount || 0) + (d.failedCount || 0);
    return {
      id: doc.id,
      name: d.title || d.name || "Campaign",
      message: d.message || "",
      audienceType: d.filters?.tags?.length ? "TAGS" : "ALL",
      status: d.status || "Pending",
      stats: { sent: d.sentCount || 0, failed: d.failedCount || 0, total },
      createdAt: tsToIso(d.createdAt),
    };
  }

  router.get("/api/broadcasts", async (req, res) => {
    try {
      const snap = await cref().collection("campaigns").orderBy("createdAt", "desc").limit(100).get();
      res.json(snap.docs.map(mapCampaign));
    } catch (e) {
      res.json([]);
    }
  });

  router.post("/api/broadcasts", async (req, res) => {
    try {
      const { message, mediaUrl, name, audienceType, tags, tagIds } = req.body || {};
      const tagList = tags || tagIds || [];
      const doc = {
        title: name || "Broadcast",
        message: message || "",
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? (mediaUrl.endsWith(".mp4") ? "video" : mediaUrl.endsWith(".pdf") ? "document" : "image") : null,
        filters: audienceType === "TAGS" ? { tags: tagList } : {},
        status: "Pending",
        sentCount: 0,
        failedCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await cref().collection("campaigns").add(doc);
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/broadcasts/estimate", async (req, res) => {
    try {
      const uid = companyUid();
      const { audienceType, tags, tagIds } = req.body || {};
      const tagList = tags || tagIds || [];
      const snap = await db.collection("companies").doc(uid).collection("contacts").get();
      let contacts = snap.docs.map((d) => d.data());
      if (audienceType === "TAGS" && tagList.length) {
        contacts = contacts.filter((c) => (c.tags || []).some((t) => tagList.includes(t)));
      }
      res.json({ count: contacts.length });
    } catch (e) {
      res.json({ count: 0 });
    }
  });

  router.post("/api/broadcasts/:id/execute", async (req, res) => {
    try {
      await cref().collection("campaigns").doc(req.params.id).update({ status: "Pending" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/flows/business/me", async (req, res) => {
    try {
      const snap = await cref().collection("flows").orderBy("createdAt", "desc").get();
      res.json(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || "Flow",
            isActive: data.isActive === true || data.status === "active",
            createdAt: tsToIso(data.createdAt),
          };
        })
      );
    } catch (e) {
      res.json([]);
    }
  });

  router.get("/api/flows/templates", (req, res) => {
    res.json(FLOW_TEMPLATES);
  });

  router.post("/api/flows/templates/instantiate", async (req, res) => {
    try {
      const { templateId } = req.body || {};
      const tpl = FLOW_TEMPLATES.find((t) => t.id === templateId);
      const ref = await cref().collection("flows").add({
        name: tpl?.name || "New flow",
        templateId: templateId || null,
        nodes: [],
        edges: [],
        isActive: false,
        status: "draft",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/flows", async (req, res) => {
    try {
      const { name, type } = req.body || {};
      const ref = await cref().collection("flows").add({
        name: name || "Untitled flow",
        type: type || "custom",
        nodes: [],
        edges: [],
        isActive: false,
        status: "draft",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/flows/:id", async (req, res) => {
    try {
      const doc = await cref().collection("flows").doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });
      res.json({ id: doc.id, ...doc.data() });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/api/flows/:id", async (req, res) => {
    try {
      await cref().collection("flows").doc(req.params.id).set(req.body, { merge: true });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/api/flows/:id", async (req, res) => {
    try {
      await cref().collection("flows").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/flows/:id/activate", async (req, res) => {
    try {
      const batch = db.batch();
      const all = await cref().collection("flows").get();
      all.docs.forEach((d) => batch.update(d.ref, { isActive: d.id === req.params.id, status: d.id === req.params.id ? "active" : "draft" }));
      await batch.commit();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/api/flows/compile", async (req, res) => {
    try {
      const { blueprint } = req.body || {};
      const ref = await cref().collection("flows").add({
        name: blueprint?.name || "Guided flow",
        nodes: blueprint?.nodes || [],
        edges: blueprint?.edges || [],
        isActive: false,
        status: "draft",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: ref.id, success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/analytics/funnel", async (req, res) => {
    try {
      const contacts = (await cref().collection("contacts").get()).size;
      const inbox = (await cref().collection("inbox").get()).size;
      res.json({ leads: contacts, conversations: inbox, converted: Math.floor(inbox * 0.15) });
    } catch (e) {
      res.json({ leads: 0, conversations: 0, converted: 0 });
    }
  });

  router.get("/api/analytics/broadcasts", async (req, res) => {
    try {
      const snap = await cref().collection("campaigns").get();
      let sent = 0;
      let failed = 0;
      snap.docs.forEach((d) => {
        sent += d.data().sentCount || 0;
        failed += d.data().failedCount || 0;
      });
      res.json({ campaigns: snap.size, sent, failed });
    } catch (e) {
      res.json({ campaigns: 0, sent: 0, failed: 0 });
    }
  });

  router.get("/api/analytics/engagement", async (req, res) => {
    res.json({ responseRate: 42, avgReplyMinutes: 12 });
  });

  router.get("/api/analytics/flows", async (req, res) => {
    try {
      const snap = await cref().collection("flows").get();
      res.json({ active: snap.docs.filter((d) => d.data().isActive).length, total: snap.size });
    } catch (e) {
      res.json({ active: 0, total: 0 });
    }
  });

  router.get("/api/analytics/tags", async (req, res) => {
    try {
      const snap = await cref().collection("tags").get();
      res.json({ count: snap.size });
    } catch (e) {
      res.json({ count: 0 });
    }
  });
}

module.exports = { registerCrmDataRoutes };
