require("dotenv").config();
const admin = require("firebase-admin");

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require("./serviceAccountKey.json");
}

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function cleanupStaleQRs() {
    console.log("🧹 Cleaning up stale QR codes in Firestore...\n");

    const companies = await db.collection("companies").get();

    for (const doc of companies.docs) {
        const uid = doc.id;
        const waRef = db.collection("companies").doc(uid)
            .collection("integrations").doc("whatsapp");
        const waDoc = await waRef.get();

        if (waDoc.exists) {
            const data = waDoc.data();

            // If status is "qr" or "reconnecting" and has a QR code, clear it
            if ((data.status === 'qr' || data.status === 'reconnecting') && data.qr) {
                console.log(`🔧 Fixing ${uid}: ${data.status} -> disconnected`);
                await waRef.update({
                    status: 'disconnected',
                    qr: null
                });
            }
        }
    }

    console.log("\n✅ Cleanup complete!");
    process.exit(0);
}

cleanupStaleQRs();
