/**
 * Clear WhatsApp Session - Fix "Bad MAC" errors
 * This deletes the corrupted session so you can reconnect fresh
 */

const fs = require('fs');
const path = require('path');

// Your UID - replace if different
const UID = 'E8gpkfdDXxZ096YnJMsaSlvFGxJ2';

const sessionPath = path.join(__dirname, '..', `auth_info_${UID}`);

console.log(`🔍 Looking for session: ${sessionPath}`);

if (fs.existsSync(sessionPath)) {
    try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`✅ Deleted corrupted session: auth_info_${UID}`);
        console.log(`\n📱 Next steps:`);
        console.log(`1. Restart your server: npm start`);
        console.log(`2. Open Flutter app → Connect page`);
        console.log(`3. Scan the NEW QR code`);
        console.log(`4. Send a test message from another phone`);
        console.log(`\n✅ Messages should now appear in inbox!`);
    } catch (e) {
        console.error(`❌ Error deleting session:`, e.message);
    }
} else {
    console.log(`⚠️ Session folder not found (already deleted or different UID)`);
}
