const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const UID = "E8gpkfdDXxZ096YnJMsaSlvFGxJ2"; // The affected user

async function testMediaMessages() {
    try {
        console.log("📸 Checking for pending media messages...\n");

        // Check inbox for pending media messages
        const inboxSnap = await db.collection("companies").doc(UID).collection("inbox").get();

        for (const inboxDoc of inboxSnap.docs) {
            const chatId = inboxDoc.id;
            const messagesSnap = await inboxDoc.ref.collection("messages")
                .where("status", "==", "pending")
                .where("isMe", "==", true)
                .get();

            for (const msgDoc of messagesSnap.docs) {
                const data = msgDoc.data();
                if (data.mediaUrl) {
                    console.log(`📤 Found pending media message in chat ${chatId}:`);
                    console.log(`   Type: ${data.mediaType || 'unknown'}`);
                    console.log(`   URL: ${data.mediaUrl}`);
                    console.log(`   Text: ${data.text || '(no caption)'}`);
                    console.log(`   Status: ${data.status}\n`);
                }
            }
        }

        // Check broadcast campaigns with media
        const campaignsSnap = await db.collection("companies").doc(UID).collection("campaigns")
            .where("status", "in", ["Pending", "Running"])
            .get();

        if (!campaignsSnap.empty) {
            console.log("📢 Found pending broadcast campaigns:\n");
            campaignsSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.mediaUrl) {
                    console.log(`   Campaign: ${data.title}`);
                    console.log(`   Media Type: ${data.mediaType || 'unknown'}`);
                    console.log(`   Media URL: ${data.mediaUrl}`);
                    console.log(`   Status: ${data.status}\n`);
                }
            });
        }

    } catch (error) {
        console.error("Error:", error);
    }

    process.exit(0);
}

testMediaMessages();
