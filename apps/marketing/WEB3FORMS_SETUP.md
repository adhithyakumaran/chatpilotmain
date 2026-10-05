# Web3Forms Contact Form Setup

## Quick Setup (2 minutes)

### Step 1: Get Your Access Key

1. **Visit:** https://web3forms.com
2. **Click:** "Get Started Free"
3. **Enter your email:** adhithyakumaran2005@gmail.com
4. **Check your email** for the access key
5. **Copy the access key** (looks like: `abc123-def456-ghi789`)

### Step 2: Update ContactForm.tsx

Replace this line:
```typescript
formDataToSend.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');
```

With your actual key:
```typescript
formDataToSend.append('access_key', 'your-actual-key-here');
```

### Step 3: Deploy

```bash
cd chatpilot-landing
git add components/ContactForm.tsx
git commit -m "Add Web3Forms integration for contact form"
git push
```

That's it! ✅

---

## How It Works

✅ **No backend needed** - Works directly from your Next.js site
✅ **Free forever** - Up to 250 submissions/month
✅ **Emails sent to:** adhithyakumaran2005@gmail.com
✅ **Spam protection** - Built-in honeypot and verification
✅ **File attachments** - Supported (if needed later)

## Email Format

You'll receive emails with:
- **Subject:** "New Contact from [Name] - ChatPilot"
- **From:** Web3Forms
- **Reply-To:** User's email
- **Content:**
  - Name
  - Email
  - Company
  - Message

---

## Optional Enhancements

### Add Custom Email Template (Free)

In your Web3Forms dashboard:
1. Go to "Email Templates"
2. Customize the email design
3. Add your logo

### Add Notifications

- Email notifications (included)
- Slack notifications (premium)
- Webhook to your backend (when you deploy it)

---

## Troubleshooting

**"Access key required" error**
- Make sure you replaced `YOUR_WEB3FORMS_ACCESS_KEY` with your actual key

**Not receiving emails**
- Check spam folder
- Verify email address in Web3Forms dashboard
- Check Web3Forms submission logs

**Form not submitting**
- Check browser console for errors
- Verify access key is correct
- Check internet connection

---

## Files Modified

- `chatpilot-landing/components/ContactForm.tsx`

## Cost

**FREE** ✅
- 250 submissions/month
- No credit card required
- Upgrade available if you need more
