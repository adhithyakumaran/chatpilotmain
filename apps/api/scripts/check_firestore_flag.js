const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function check() {
    console.log("Checking Firestore for Period Plugin Flag...");
    const uid = "O4HNozcfDZRtj1K9d4LmvWLAx5d2";
    const doc = await db.collection('companies').doc(uid).get();

    if (!doc.exists) {
        console.log("❌ Company Doc NOT FOUND for UID:", uid);
    } else {
        const data = doc.data();
        console.log("✅ Company Doc Found.");
        console.log("periodPluginEnabled:", data.periodPluginEnabled);
        console.log("Full Data Keys:", Object.keys(data));
    }
}

check().catch(console.error);
