const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2"; // The affected user

async function checkStatus() {
    try {
        const doc = await db.collection("companies").doc(UID).collection("integrations").doc("whatsapp").get();
        if (doc.exists) {
            console.log("📄 CURRENT FIRESTORE STATE:");
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log("❌ Document does not exist!");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

checkStatus();
