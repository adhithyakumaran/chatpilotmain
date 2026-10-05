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

async function checkWhatsAppStatus() {
    const companies = await db.collection("companies").get();

    for (const doc of companies.docs) {
        const uid = doc.id;
        const waDoc = await db.collection("companies").doc(uid)
            .collection("integrations").doc("whatsapp").get();

        if (waDoc.exists) {
            const data = waDoc.data();
            console.log(`\n📊 Company: ${uid}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Has QR: ${data.qr ? 'YES' : 'NO'}`);
            console.log(`   Connected At: ${data.connectedAt?.toDate() || 'N/A'}`);
        }
    }

    process.exit(0);
}

checkWhatsAppStatus();
