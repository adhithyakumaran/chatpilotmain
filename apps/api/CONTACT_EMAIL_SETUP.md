# Contact Form Email Setup Guide

## Gmail App Password Setup

To enable email sending from the contact form, you need to create a Gmail App Password:

### Steps:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)
   - Click on "2-Step Verification"
   - Follow the setup process

3. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "ChatPilot"
   - Click "Generate"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

4. **Add to Environment Variables**
   
   Create or edit `.env` file in `chatpilot_server-2` folder:
   
   ```env
   GMAIL_APP_PASSWORD=your_16_character_app_password
   ```

   Replace `your_16_character_app_password` with the password from step 3 (remove spaces)

## Testing

1. **Restart the server:**
   ```bash
   cd chatpilot_server-2
   npm start
   ```

2. **Check server logs:**
   - You should see: `📧 Contact Module Loaded`

3. **Submit a test form:**
   - Go to landing page → scroll to contact form
   - Fill out and submit
   - Check `adhithyakumaran2005@gmail.com` inbox

## Backup Methods

Even without the Gmail App Password, the contact form will:
- ✅ Save to CSV file (`chatpilot_server-2/leads.csv`)
- ✔️ Show success message to user
- ❌ Email will be skipped (logged in console)

## Files Modified

1. `chatpilot_server-2/contact_routes.js` - New contact endpoint
2. `chatpilot_server-2/index.js` - Routes mounted
3. `chatpilot-landing/components/ContactForm.tsx` - Updated endpoint

## Email Format

Submissions will be sent to: **adhithyakumaran2005@gmail.com**

Email template includes:
- Name
- Email (with reply-to enabled)
- Company
- Message
- Timestamp
- Beautiful HTML formatting with ChatPilot branding
