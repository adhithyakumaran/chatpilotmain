# Formspree Setup - Multiple Email Recipients

## Quick Setup (3 minutes)

### Step 1: Create Formspree Account

1. **Visit:** https://formspree.io
2. **Sign up** with: adhithyakumaran2005@gmail.com
3. **Verify your email**

### Step 2: Create New Form

1. Click "**+ New Form**"
2. **Form Name:** ChatPilot Contact Form
3. **Email Recipients:** Add both emails:
   - adhithyakumaran2005@gmail.com
   - 4002yogeswaran@gmail.com
4. Click "**Create Form**"

### Step 3: Get Your Form ID

After creating the form, you'll see:
```
https://formspree.io/f/YOUR_FORM_ID
```

Copy the `YOUR_FORM_ID` (example: `xwkdblmq`)

### Step 4: Update ContactForm.tsx

Replace this line in `ContactForm.tsx`:
```typescript
const response = await fetch('https://formspree.io/f/xnnqgnze', {
```

With your actual form ID:
```typescript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

### Step 5: Deploy

```bash
git add components/ContactForm.tsx
git commit -m "Update Formspree form ID"
git push
```

---

## Why Formspree?

✅ **Multiple recipients in FREE plan** - Unlike Web3Forms
✅ **50 submissions/month free** - Good for starting out
✅ **No API key needed** - Just the form ID
✅ **Spam protection** - Built-in
✅ **Email notifications** - Both addresses get notified

---

## Testing

1. Submit the form on your website
2. Check **both email inboxes**:
   - adhithyakumaran2005@gmail.com ✅
   - 4002yogeswaran@gmail.com ✅

---

## Alternative: Use Web3Forms PRO

If you prefer Web3Forms:
- **Cost:** $5/month
- **Unlimited emails**
- **Multiple recipients** with CC/BCC
- **More features**

But Formspree free plan works great for your needs!

---

## Email Format

Both recipients will receive:
- **Subject:** "New Contact from [Name] - ChatPilot"
- **From:** Formspree
- **Reply-To:** User's email
- **Content:**
  - Name
  - Email  
  - Company
  - Message
