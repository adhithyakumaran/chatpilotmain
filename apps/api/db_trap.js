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
// The user confirmed this UID in the logs: E8gpkfdDXxZ096YnJMsaSlvFGxJ2
const TARGET_UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2";

console.log(`🪤 DB TRAP ACTIVE for ${TARGET_UID}`);
console.log("Waiting for database changes...");

db.collection("companies").doc(TARGET_UID).collection("integrations").doc("whatsapp")
    .onSnapshot((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        const ts = new Date().toISOString().split('T')[1].split('.')[0];

        console.log(`\n[${ts}] 📝 DB CHANGED!`);
        console.log(`       Status: ${data.status}`);
        console.log(`       Has QR: ${data.qr ? 'YES' : 'NO'}`);

        if (data.status === 'qr') {
            console.log("       🚨 ALERT: status became 'qr'!");
        }
    });

// Keep alive
setInterval(() => { }, 10000);
