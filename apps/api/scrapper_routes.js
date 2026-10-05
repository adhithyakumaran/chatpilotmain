const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// --- JUNK REMOVAL & CLEANING LOGIC ---

// 1. Strip Junk (Scripts, Styles, Comments)
function stripJunk(html) {
    let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<!--[\s\S]*?-->/gi, '');
    return clean;
}

// 2. Extract Numbers with Context (near keywords)
function extractContextNumbers(html) {
    const keywords = /(call|phone|contact|mobile|tel|whatsapp|reach|support|info)/i;
    const results = [];
    // Split by lines or common delimiters to find context
    // Using a simpler approach: regex lookaround is hard in JS for variable length.
    // Instead, we scan the text.

    // Let's use the user's logic: split by lines.
    // Note: HTML might not have newlines. We should replace <br> and block tags with newlines first?
    // For now, let's assume textContent or raw HTML with some structure.
    // Actually, user said "lines = html.split".

    const lines = html.split(/[\n\r]+/);
    for (let line of lines) {
        if (keywords.test(line)) {
            // Extract potential numbers: 10-20 chars allowing spaces/dots/hyphens
            const nums = line.match(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g);
            if (nums) results.push(...nums);
        }
    }
    return results;
}

// 3. Clean Phones (Keep digits, validate length 10-15)
function cleanPhones(rawPhones) {
    const cleaned = rawPhones
        .map(p => p.replace(/\D/g, "")) // keep digits only
        .filter(p => p.length >= 10 && p.length <= 15) // valid length
        .filter(p => !/^(\d)\1+$/.test(p)); // remove repeated same digit (e.g. 1111111111)

    return Array.from(new Set(cleaned)); // unique
}

// 4. Remove Pincodes (6 digits exactly)
function removePincodes(arr) {
    // We already filtered 10-15 length in cleanPhones, so 6 digit pincodes are already gone!
    // But if we had them, this would be the logic.
    // However, sometimes pincodes are detected as part of a larger string if not careful.
    // Since cleanPhones enforces >= 10, pincodes (6 digits) are automatically removed.
    // We'll keep this if we change logic later, but for now it's redundant but safe.
    return arr.filter(n => n.length !== 6);
}

// 5. Filter Invalid Patterns (000..., repeated digits)
function filterInvalidPatterns(nums) {
    return nums.filter(n => {
        if (n.startsWith("000")) return false;
        if (/(\d)\1{4}/.test(n)) return false; // 5 repeated digits
        return true;
    });
}

// 6. Clean Emails
function cleanEmails(rawEmails) {
    return rawEmails
        .filter(e => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e))
        .filter(e => !e.includes("example.com"))
        .filter(e => !e.includes("noreply"))
        .filter(e => !e.includes("no-reply"))
        .filter(e => !e.includes("sentry")) // Common junk
        .filter(e => !e.endsWith(".png"))
        .filter(e => !e.endsWith(".jpg"));
}

// 7. Valid WhatsApp
function isValidWhatsapp(num) {
    const clean = num.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 15;
}


// --- ROUTES ---

router.post('/url', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        console.log(`🕷️ Scraping (Cleaned): ${targetUrl}`);

        const { data: html } = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 15000
        });

        // 1. Strip Junk
        const cleanHtml = stripJunk(html);
        const $ = cheerio.load(cleanHtml);
        const textContent = $('body').text(); // Text without scripts/styles

        const leads = new Set();

        // --- EMAILS ---
        const rawEmails = cleanHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const validEmails = cleanEmails(rawEmails);
        validEmails.forEach(e => leads.add(JSON.stringify({ type: 'Email', value: e, context: 'Verified' })));

        // --- PHONES ---
        // Strategy: 
        // A. Regex on full text (broad)
        // B. Context-based (narrow)
        // Combine and clean.

        const broadMatches = textContent.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/g) || [];
        const contextMatches = extractContextNumbers(textContent); // Use textContent for context to avoid HTML tag noise

        const allRawPhones = [...broadMatches, ...contextMatches];

        // Pipeline: clean -> remove pincodes -> filter patterns
        const cleanedPhones = filterInvalidPatterns(
            removePincodes(
                cleanPhones(allRawPhones)
            )
        );

        cleanedPhones.forEach(p => leads.add(JSON.stringify({ type: 'Phone', value: p, context: 'Verified Number' })));

        // --- WHATSAPP ---
        const waMatches = cleanHtml.match(/https?:\/\/(api\.whatsapp\.com|wa\.me)\/[^\s"']+/g) || [];
        waMatches.forEach(w => {
            // Extract number from link
            const num = w.split('/').pop();
            if (isValidWhatsapp(num)) {
                leads.add(JSON.stringify({ type: 'WhatsApp', value: num, context: 'Direct Link' }));
            }
        });

        // --- SOCIAL ---
        const socialRegex = {
            instagram: /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/g,
            linkedin: /https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/g,
            facebook: /https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/g
        };

        [...cleanHtml.match(socialRegex.instagram) || [],
        ...cleanHtml.match(socialRegex.linkedin) || [],
        ...cleanHtml.match(socialRegex.facebook) || []
        ].forEach(s => leads.add(JSON.stringify({ type: 'Social', value: s, context: 'Social Profile' })));

        // --- META INFO ---
        const metaDesc = $('meta[name="description"]').attr('content');
        if (metaDesc) leads.add(JSON.stringify({ type: 'Info', value: metaDesc, context: 'Meta Description' }));

        const results = Array.from(leads).map(item => JSON.parse(item));
        res.json({ success: true, data: results });

    } catch (error) {
        console.error("Scrape Error:", error.message);
        res.status(500).json({ error: "Failed to scrape URL. The site might be blocking bots." });
    }
});

// Stub routes
router.post('/business-search', (req, res) => res.json({ success: true, data: [{ type: 'Info', value: 'Requires Google Places API', context: 'System' }] }));

router.post('/text', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    // Reuse logic
    const leads = [];
    const validEmails = cleanEmails(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []);
    validEmails.forEach(e => leads.push({ type: 'Email', value: e, context: 'Raw Text' }));

    const cleanedPhones = filterInvalidPatterns(cleanPhones(text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/g) || []));
    cleanedPhones.forEach(p => leads.push({ type: 'Phone', value: p, context: 'Raw Text' }));

    res.json({ success: true, data: leads });
});

router.post('/format-wa', (req, res) => {
    const { numbers } = req.body;
    if (!numbers) return res.status(400).json({ error: "Numbers required" });
    const rawList = Array.isArray(numbers) ? numbers : numbers.split(/[\n,]+/);
    const formatted = [];
    rawList.forEach(num => {
        let clean = num.replace(/\D/g, '');
        if (clean.length >= 10) {
            if (clean.length === 10) clean = '91' + clean;
            formatted.push({ type: 'WhatsApp', value: clean, context: 'Formatted', extraInfo: `https://wa.me/${clean}` });
        }
    });
    res.json({ success: true, data: [...new Map(formatted.map(item => [item['value'], item])).values()] });
});

module.exports = router;