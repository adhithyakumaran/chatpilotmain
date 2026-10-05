const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment');

// This function should be called daily via a cron job or scheduler
async function checkPeriodReminders() {
    console.log('🔔 Running Period Reminder Check...');

    try {
        // Get all companies
        const companiesSnapshot = await db.collection('companies').get();

        for (const companyDoc of companiesSnapshot.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();

            // Skip if Period AI is disabled
            if (!companyData.periodPluginEnabled) {
                continue;
            }

            // Get all period tracker users for this company
            const usersSnapshot = await db
                .collection('companies')
                .doc(companyId)
                .collection('period_tracker_users')
                .get();

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const phone = userDoc.id;
                const nextPeriod = userData.next_period?.toDate();

                if (!nextPeriod) continue;

                // Check if next period is exactly 3 days away
                const daysUntilPeriod = moment(nextPeriod).diff(moment(), 'days');

                if (daysUntilPeriod === 3) {
                    console.log(`📅 Sending reminder to ${userData.name} (${phone})`);

                    // Send WhatsApp message via Period AI
                    await sendPeriodReminder(companyId, phone, userData.name, nextPeriod);
                }
            }
        }

        console.log('✅ Period Reminder Check Complete');
    } catch (error) {
        console.error('❌ Period Reminder Check Error:', error);
    }
}

async function sendPeriodReminder(companyId, phone, name, nextPeriodDate) {
    try {
        const chatId = `${phone}@s.whatsapp.net`;
        const formattedDate = moment(nextPeriodDate).format('MMMM Do');

        const reminderMessage = `Hi ${name}! 🌸\n\nJust a gentle reminder that your next period is expected in about 3 days (around ${formattedDate}).\n\n💜 Make sure you have everything you need!\n💊 Keep track of any symptoms\n🩺 Reach out if you have any concerns\n\nStay healthy! 💪`;

        // Save message to inbox
        await db.collection('companies')
            .doc(companyId)
            .collection('inbox')
            .doc(chatId)
            .collection('messages')
            .add({
                text: reminderMessage,
                fromMe: true,
                fromBot: true,
                type: 'period_reminder',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

        console.log(`✓ Reminder scheduled for ${name}`);

        // Note: Actual WhatsApp sending would need to be triggered via your WhatsApp client
        // This saves it to the inbox, and your WhatsApp integration should pick it up and send it

    } catch (error) {
        console.error(`Failed to send reminder to ${phone}:`, error);
    }
}

// Export for cron job or manual trigger
module.exports = {
    checkPeriodReminders,
    sendPeriodReminder
};

// If running this file directly for testing
if (require.main === module) {
    checkPeriodReminders().then(() => process.exit(0));
}
