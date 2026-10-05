const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    // Try forcing v1
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Manual Axios Check
    const axios = require('axios');
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("🔍 Checking via REST API (v1beta)...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await axios.get(url);
        console.log("📦 Available Models (REST):");
        res.data.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods})`));
    } catch (e) {
        console.log(`❌ REST API Error: ${e.response ? e.response.status : e.message}`);
        if (e.response && e.response.data) console.log(JSON.stringify(e.response.data));
    }
}

listModels();
