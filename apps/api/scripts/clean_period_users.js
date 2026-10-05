const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function cleanBadUsers() {
    const uid = "O4HNozcfDZRtj1K9d4LmvWLAx5d2";
    const collectionRef = db.collection('companies').doc(uid).collection('period_tracker_users');

    const snapshot = await collectionRef.get();
    let deletedCount = 0;

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Identify bad users: 
        // 1. Name starts with "Welcome to the family" (Bot text parsed as name)
        // 2. Phone is the bot's own number (usually has a specific length or we can assume self-loops create garbage names)
        if (data.name && (data.name.includes("Welcome to the family") || data.name.includes("I'm here for you"))) {
            console.log(`🗑️ Deleting bad user: ${data.name} (${doc.id})`);
            batch.delete(doc.ref);
            deletedCount++;
        }
    });

    if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully deleted ${deletedCount} corrupted user entries.`);
    } else {
        console.log("✨ No corrupted entries found.");
    }
}

cleanBadUsers().catch(console.error);
