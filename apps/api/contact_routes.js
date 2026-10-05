const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adhithyakumaran2005@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '' // You'll need to set this
    }
});

// Contact form endpoint
router.post('/contact', async (req, res) => {
    const { name, email, company, message } = req.body;

    if (!email || !name || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to CSV
    try {
        const fs = require('fs');
        const path = require('path');
        const csvPath = path.join(__dirname, '../leads.csv');

        const date = new Date().toISOString();

        // Create CSV if it doesn't exist
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, 'Date,Name,Email,Company,Message\r\n');
        }

        // Escape CSV values
        const clean = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        const row = `${clean(date)},${clean(name)},${clean(email)},${clean(company)},${clean(message)}\r\n`;

        fs.appendFileSync(csvPath, row);
        console.log('✅ Lead saved to CSV');
    } catch (err) {
        console.error('❌ CSV Save Error:', err);
    }

    // Send email
    try {
        const mailOptions = {
            from: 'adhithyakumaran2005@gmail.com',
            to: 'adhithyakumaran2005@gmail.com',
            replyTo: email,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FF5500; border-bottom: 3px solid #FF5500; padding-bottom: 10px;">
                        📧 New Contact Form Submission
                    </h2>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>👤 Name:</strong> ${name}</p>
                        <p style="margin: 10px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="margin: 10px 0;"><strong>🏢 Company:</strong> ${company || 'Not provided'}</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #FF5500; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">💬 Message:</h3>
                        <p style="line-height: 1.6; color: #555;">${message}</p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
                        <p style="margin: 0; color: #888; font-size: 12px;">
                            <em>Sent from ChatPilot Landing Page Contact Form</em><br>
                            <em>${new Date().toLocaleString()}</em>
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');

        res.json({
            success: true,
            message: 'Thank you! We will get back to you shortly.'
        });

    } catch (error) {
        console.error('❌ Email Error:', error);

        // Still return success because data is saved to CSV
        res.json({
            success: true,
            message: 'Your message has been saved. We will contact you soon!'
        });
    }
});

module.exports = router;
