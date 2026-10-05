const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn("⚠️ SENDGRID_API_KEY is missing in .env");
}

const db = admin.firestore();

// 1. VERIFY SENDER IDENTITY
router.post('/sender-verify/:uid', async (req, res) => {
    const { uid } = req.params;
    const { senderName, senderEmail, address, city, country } = req.body;

    if (!senderEmail || !senderName) {
        return res.status(400).json({ error: "Name and Email required" });
    }

    try {
        const response = await axios.post(
            'https://api.sendgrid.com/v3/verified_senders',
            {
                nickname: senderName,
                from_email: senderEmail,
                from_name: senderName,
                reply_to: senderEmail,
                reply_to_name: senderName,
                address: address || "123 Business Rd",
                address2: "",
                state: "NY",
                city: city || "New York",
                country: country || "USA",
                zip: "10001"
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        await db.collection('companies').doc(uid).collection('integrations').doc('email').set({
            senderName,
            senderEmail,
            verified: false,
            senderId: response.data.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Verification email sent" });

    } catch (error) {
        console.error("Sender Verify Error:", error.response?.data || error.message);

        await db.collection('companies').doc(uid).collection('integrations').doc('email').set({
            senderName,
            senderEmail,
            verified: false,
            error: "Manual verification required on SendGrid dashboard",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(500).json({ error: "Could not trigger auto-verification. Please verify manually on SendGrid." });
    }
});

// 2. REGISTER DOMAIN
router.post('/domain/:uid', async (req, res) => {
    const { uid } = req.params;
    const { domain } = req.body;

    if (!domain) return res.status(400).json({ error: "Domain required" });

    try {
        const response = await axios.post(
            'https://api.sendgrid.com/v3/whitelabel/domains',
            {
                domain: domain,
                subdomain: "mail",
                username: uid,
                automatic_security: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const dnsRecords = {};
        if (response.data.dns) {
            dnsRecords['cname1'] = { host: response.data.dns.mail_cname.host, data: response.data.dns.mail_cname.data };
            dnsRecords['dkim1'] = { host: response.data.dns.dkim1.host, data: response.data.dns.dkim1.data };
            dnsRecords['dkim2'] = { host: response.data.dns.dkim2.host, data: response.data.dns.dkim2.data };
        }

        await db.collection('companies').doc(uid).collection('integrations').doc('email_domain').set({
            domain,
            domainId: response.data.id,
            dns: dnsRecords,
            valid: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, dns: dnsRecords });

    } catch (error) {
        console.error("Domain Reg Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to register domain with SendGrid" });
    }
});

// 3. VERIFY DOMAIN STATUS
router.post('/domain/verify/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const doc = await db.collection('companies').doc(uid).collection('integrations').doc('email_domain').get();
        if (!doc.exists || !doc.data().domainId) {
            return res.status(404).json({ error: "No domain registration found" });
        }

        const domainId = doc.data().domainId;

        const response = await axios.post(
            `https://api.sendgrid.com/v3/whitelabel/domains/${domainId}/validate`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const isValid = response.data.valid;

        await doc.ref.update({
            valid: isValid,
            lastChecked: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: isValid });

    } catch (error) {
        console.error("Domain Verify Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to verify domain status" });
    }
});

// 4. SEND CAMPAIGN
router.post('/send/:uid', async (req, res) => {
    const { uid } = req.params;
    const { subject, body, recipients, attachments } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const senderDoc = await db.collection('companies').doc(uid).collection('integrations').doc('email').get();
        const fromEmail = senderDoc.exists ? senderDoc.data().senderEmail : process.env.DEFAULT_FROM_EMAIL;
        const fromName = senderDoc.exists ? senderDoc.data().senderName : "ChatPilot User";

        if (!fromEmail) {
            return res.status(400).json({ error: "No verified sender identity found. Please configure settings." });
        }

        // --- ENFORCE NOTIFICATION SETTINGS ---
        // Fetch user settings to check if 'email_alerts' is enabled
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Check settings.notifications.email_alerts (default to true if not set)
            // Structure based on settings_page.dart: settings: { email_alerts: boolean }
            const settings = userData.settings || {};
            // If email_alerts is explicitly false, block it. Otherwise allow.
            if (settings.email_alerts === false) {
                console.log(`🔕 Email blocked for user ${uid} due to notification settings.`);
                return res.json({ success: false, message: "Email skipped due to user preferences." });
            }
        }
        // -------------------------------------

        // Prepare Email
        const msg = {
            to: recipients,
            from: { email: fromEmail, name: fromName },
            subject: subject,
            html: body.replace(/\n/g, '<br>'),
        };

        // Handle Attachments
        if (attachments && attachments.length > 0) {
            const sgAttachments = [];

            for (const att of attachments) {
                try {
                    console.log(`📎 Downloading attachment: ${att.filename} from ${att.url}`);
                    const response = await axios.get(att.url, { responseType: 'arraybuffer' });
                    const base64Content = Buffer.from(response.data).toString('base64');

                    sgAttachments.push({
                        content: base64Content,
                        filename: att.filename,
                        type: att.type || 'application/octet-stream',
                        disposition: 'attachment'
                    });
                    console.log(`✅ Attachment ready: ${att.filename}`);
                } catch (err) {
                    console.error(`❌ Failed to fetch attachment ${att.filename}:`, err.message);
                }
            }

            if (sgAttachments.length > 0) {
                msg.attachments = sgAttachments;
                console.log(`📧 Sending email with ${sgAttachments.length} attachment(s)`);
            }
        }

        // Send
        await sgMail.sendMultiple(msg);

        // Log Campaign
        await db.collection('companies').doc(uid).collection('email_campaigns').add({
            subject,
            body,
            recipientCount: recipients.length,
            attachmentCount: attachments?.length || 0,
            status: 'Completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            from: fromEmail
        });

        res.json({ success: true, count: recipients.length });

    } catch (error) {
        console.error("Send Error:", error.response?.body || error.message);
        res.status(500).json({ error: "Failed to send emails. Check sender identity verification." });
    }
});



// 6. SEND APP LINK (Post-Payment)
router.post('/send-app-link', async (req, res) => {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        const msg = {
            to: email,
            from: process.env.DEFAULT_FROM_EMAIL || "no-reply@chatpilot.co.in",
            subject: `Welcome to ChatPilot! 🚀 Here is your access`,
            html: `
                <h2>Welcome to ChatPilot! 🎉</h2>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for your payment. We are excited to have you on board.</p>
                <p><strong>Your App Access:</strong></p>
                <p>You can download the app and log in using this email address.</p>
                <br>
                <a href="https://chatpilot.co.in/download" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download ChatPilot App</a>
                <br><br>
                <p>If you have any questions, reply to this email.</p>
                <p>- The ChatPilot Team</p>
            `,
        };

        await sgMail.send(msg);
        res.json({ success: true, message: "App link sent" });

    } catch (error) {
        console.error("App Link Email Error:", error.response?.body || error.message);
        res.status(500).json({ error: "Failed to send app link email" });
    }
});

// 3. VERIFY DOMAIN STATUS
router.post('/domain/verify/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const doc = await db.collection('companies').doc(uid).collection('integrations').doc('email_domain').get();
        if (!doc.exists || !doc.data().domainId) {
            return res.status(404).json({ error: "No domain registration found" });
        }

        const domainId = doc.data().domainId;

        const response = await axios.post(
            `https://api.sendgrid.com/v3/whitelabel/domains/${domainId}/validate`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const isValid = response.data.valid;

        await doc.ref.update({
            valid: isValid,
            lastChecked: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: isValid });

    } catch (error) {
        console.error("Domain Verify Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to verify domain status" });
    }
});

// 4. SEND CAMPAIGN
router.post('/send/:uid', async (req, res) => {
    const { uid } = req.params;
    const { subject, body, recipients, attachments } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const senderDoc = await db.collection('companies').doc(uid).collection('integrations').doc('email').get();
        const fromEmail = senderDoc.exists ? senderDoc.data().senderEmail : process.env.DEFAULT_FROM_EMAIL;
        const fromName = senderDoc.exists ? senderDoc.data().senderName : "ChatPilot User";

        if (!fromEmail) {
            return res.status(400).json({ error: "No verified sender identity found. Please configure settings." });
        }

        // --- ENFORCE NOTIFICATION SETTINGS ---
        // Fetch user settings to check if 'email_alerts' is enabled
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Check settings.notifications.email_alerts (default to true if not set)
            // Structure based on settings_page.dart: settings: { email_alerts: boolean }
            const settings = userData.settings || {};
            // If email_alerts is explicitly false, block it. Otherwise allow.
            if (settings.email_alerts === false) {
                console.log(`🔕 Email blocked for user ${uid} due to notification settings.`);
                return res.json({ success: false, message: "Email skipped due to user preferences." });
            }
        }
        // -------------------------------------

        // Prepare Email
        const msg = {
            to: recipients,
            from: { email: fromEmail, name: fromName },
            subject: subject,
            html: body.replace(/\n/g, '<br>'),
        };

        // Handle Attachments
        if (attachments && attachments.length > 0) {
            const sgAttachments = [];

            for (const att of attachments) {
                try {
                    console.log(`📎 Downloading attachment: ${att.filename} from ${att.url}`);
                    const response = await axios.get(att.url, { responseType: 'arraybuffer' });
                    const base64Content = Buffer.from(response.data).toString('base64');

                    sgAttachments.push({
                        content: base64Content,
                        filename: att.filename,
                        type: att.type || 'application/octet-stream',
                        disposition: 'attachment'
                    });
                    console.log(`✅ Attachment ready: ${att.filename}`);
                } catch (err) {
                    console.error(`❌ Failed to fetch attachment ${att.filename}:`, err.message);
                }
            }

            if (sgAttachments.length > 0) {
                msg.attachments = sgAttachments;
                console.log(`📧 Sending email with ${sgAttachments.length} attachment(s)`);
            }
        }

        // Send
        await sgMail.sendMultiple(msg);

        // Log Campaign
        await db.collection('companies').doc(uid).collection('email_campaigns').add({
            subject,
            body,
            recipientCount: recipients.length,
            attachmentCount: attachments?.length || 0,
            status: 'Completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            from: fromEmail
        });

        res.json({ success: true, count: recipients.length });

    } catch (error) {
        console.error("Send Error:", error.response?.body || error.message);
        res.status(500).json({ error: "Failed to send emails. Check sender identity verification." });
    }
});

// 5. CONTACT US NOTIFICATION
router.post('/contact-us', async (req, res) => {
    const { name, email, interest, notes } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    // 1. SAVE TO FIRESTORE (Primary Backup)
    try {
        await db.collection('consultation_requests').add({
            name,
            email,
            interest,
            notes,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error("Firestore Save Error:", e);
    }

    // 2. SAVE TO CSV (Spreadsheet Backup)
    try {
        const fs = require('fs');
        const path = require('path');
        const csvPath = path.join(__dirname, 'leads.csv');
        console.log(`📝 Attempting to save lead to: ${csvPath}`);

        const date = new Date().toISOString();
        // Add header if new file
        if (!fs.existsSync(csvPath)) {
            console.log("📝 Creating new leads.csv file...");
            fs.writeFileSync(csvPath, 'Date,Name,Email,Interest,Notes\r\n');
        }

        // Append row
        const clean = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        const row = `${clean(date)},${clean(name)},${clean(email)},${clean(interest)},${clean(notes)}\r\n`;

        fs.appendFileSync(csvPath, row);
        console.log("✅ Lead saved to CSV successfully.");
    } catch (e) {
        console.error("❌ CSV Save Error:", e);
    }

    // 3. SEND EMAIL (Best Effort)
    try {
        const adminEmail = "adhithyakumaran2005@gmail.com";
        const msg = {
            to: adminEmail,
            from: process.env.DEFAULT_FROM_EMAIL || "no-reply@chatpilot.co.in",
            replyTo: email,
            subject: `New Consultation Request: ${interest || 'General Inquiry'}`,
            html: `
                <h3>New Consultation Request</h3>
                <p><strong>Name:</strong> ${name || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
                <p><strong>Notes:</strong></p>
                <p>${notes || 'None'}</p>
                <br>
                <p><em>Sent from ChatPilot Dashboard</em></p>
            `,
        };

        if (process.env.SENDGRID_API_KEY) {
            await sgMail.send(msg);
            res.json({ success: true, message: "Request received! (Email sent)" });
        } else {
            console.warn("⚠️ No SENDGRID_API_KEY. Email skipped.");
            res.json({ success: true, message: "Request received! (Saved to DB/CSV)" });
        }

    } catch (error) {
        console.error("Contact Email Error:", error.response?.body || error.message);
        // Still return success to frontend because we saved the data!
        res.json({ success: true, message: "Request received! (Saved to DB/CSV, Email Failed)" });
    }
});

// 5.1 DOWNLOAD LEADS CSV
router.get('/leads.csv', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const csvPath = path.join(__dirname, 'leads.csv');

        if (fs.existsSync(csvPath)) {
            res.download(csvPath, 'leads.csv', (err) => {
                if (err) {
                    console.error("Download Error:", err);
                    if (!res.headersSent) res.status(500).send("Could not download file");
                }
            });
        } else {
            res.status(404).send("No leads found yet.");
        }
    } catch (error) {
        console.error("CSV Download Error:", error);
        res.status(500).send("Server Error");
    }
});

// 6. SEND APP LINK (Post-Payment)
router.post('/send-app-link', async (req, res) => {
    const { email, name } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        const msg = {
            to: email,
            from: process.env.DEFAULT_FROM_EMAIL || "no-reply@chatpilot.co.in",
            subject: `Welcome to ChatPilot! 🚀 Here is your access`,
            html: `
                <h2>Welcome to ChatPilot! 🎉</h2>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for your payment. We are excited to have you on board.</p>
                <p><strong>Your App Access:</strong></p>
                <p>You can download the app and log in using this email address.</p>
                <br>
                <a href="https://chatpilot.co.in/download" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download ChatPilot App</a>
                <br><br>
                <p>If you have any questions, reply to this email.</p>
                <p>- The ChatPilot Team</p>
            `,
        };

        await sgMail.send(msg);
        res.json({ success: true, message: "App link sent" });

    } catch (error) {
        console.error("App Link Email Error:", error.response?.body || error.message);
        res.status(500).json({ error: "Failed to send app link email" });
    }
});

module.exports = router;