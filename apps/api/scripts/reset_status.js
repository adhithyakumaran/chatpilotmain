const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2";

async function fixStatus() {
    try {
        const ref = db.collection("companies").doc(UID).collection("integrations").doc("whatsapp");

        // Read current state
        const doc = await ref.get();
        if (doc.exists) {
            console.log("Current state:", JSON.stringify(doc.data(), null, 2));
        }

        // Clear the error field and QR
        await ref.update({
            error: admin.firestore.FieldValue.delete(),
            qr: null,
            status: "disconnected"  // Force fresh connection
        });

        console.log("\n✅ Database reset. Please restart backend and reconnect.");

    } catch (error) {
        console.error("Error:", error);
    }

    process.exit(0);
}

fixStatus();
