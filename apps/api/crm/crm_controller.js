const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Supabase Admin (Using Service Role Key to bypass RLS)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. GET DATABASES (HUB) ---
exports.getDatabases = async (req, res) => {
    try {
        const { userId } = req.body;
        // Fetch databases created by this user
        const { data, error } = await supabase
            .from('crm_databases')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ sheets: data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- 2. CREATE DATABASE ---
exports.createDatabase = async (req, res) => {
    try {
        const { userId, title } = req.body;
        const { data, error } = await supabase
            .from('crm_databases')
            .insert([{ user_id: userId, title: title }])
            .select();

        if (error) throw error;
        res.json({ success: true, sheet: data[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- 3. GET DATA (GRID VIEW) ---
exports.getSheetData = async (req, res) => {
    try {
        const { databaseId } = req.body;
        const { data, error } = await supabase
            .from('crm_rows')
            .select('*')
            .eq('database_id', databaseId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten JSONB data for easier frontend consumption
        // Input: { id: "123", data: { Name: "John" } }
        // Output: { id: "123", Name: "John" }
        const cleanRows = data.map(row => ({ id: row.id, ...row.data }));
        res.json({ rows: cleanRows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- 4. AI EDIT (THE MAGIC BAR) ---
exports.aiEditSheet = async (req, res) => {
    const { databaseId, userPrompt } = req.body;

    try {
        // Use Gemini 2.5 Flash (Fast & Current)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a Data Entry Bot. 
        User Input: "${userPrompt}"
        
        Task: Extract data into JSON.
        
        Rules:
        1. If adding a person, keys MUST be Capitalized (Name, Phone, Status, Email, etc).
        2. Infer missing keys if obvious (e.g. "john@gmail.com" -> Email).
        3. If specific columns aren't mentioned, ignore them.
        4. Return ONLY raw JSON. No markdown.

        Output Format:
        { "action": "ADD", "data": { "Name": "...", "Phone": "...", "Status": "Lead" } }
        OR
        { "action": "UPDATE", "lookupKey": "Phone", "lookupVal": "...", "updateKey": "Status", "newVal": "..." }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const cmd = JSON.parse(text);

        // --- ACTION: ADD ROW ---
        if (cmd.action === 'ADD') {
            // Safety Check: Don't add empty rows
            if (!cmd.data || Object.keys(cmd.data).length === 0) {
                return res.json({ success: false, message: "Could not extract data from prompt." });
            }

            // Safety Check: Ensure at least one primary field exists
            if (!cmd.data.Name && !cmd.data.Phone && !cmd.data.Email) {
                return res.json({ success: false, message: "Please provide a Name, Phone, or Email." });
            }

            const { error } = await supabase
                .from('crm_rows')
                .insert([{ database_id: databaseId, data: cmd.data }]);

            if (error) throw error;
            return res.json({ success: true, message: "Row added successfully" });
        }

        // --- ACTION: UPDATE ROW ---
        else if (cmd.action === 'UPDATE') {
            // 1. Get all rows for this DB
            const { data: rows, error: fetchError } = await supabase
                .from('crm_rows')
                .select('*')
                .eq('database_id', databaseId);

            if (fetchError) throw fetchError;

            // 2. Find matching row (JS Logic for JSONB search)
            const target = rows.find(r => {
                const val = r.data[cmd.lookupKey];
                return val && String(val).includes(String(cmd.lookupVal));
            });

            if (target) {
                // 3. Update specific key while keeping others
                const newData = { ...target.data, [cmd.updateKey]: cmd.newVal };
                const { error: updateError } = await supabase
                    .from('crm_rows')
                    .update({ data: newData })
                    .eq('id', target.id);

                if (updateError) throw updateError;
                return res.json({ success: true, message: `Updated ${cmd.updateKey} to ${cmd.newVal}` });
            }
            return res.json({ success: false, message: "Record not found" });
        }

        return res.json({ success: false, message: "Command not understood" });

    } catch (e) {
        console.error("AI Controller Error:", e);
        return res.status(500).json({ error: e.message || "Internal Server Error" });
    }
};

// --- 5. EXTERNAL LOOKUP (FOR WHATSAPP BOT) ---
exports.lookupCustomer = async (req, res) => {
    try {
        const { userId, customerPhone } = req.body;

        // 1. Find the user's first CRM database
        const { data: dbs } = await supabase
            .from('crm_databases')
            .select('id')
            .eq('user_id', userId)
            .limit(1);

        if (!dbs || dbs.length === 0) {
            return res.json({ found: false, message: "No CRM configured" });
        }

        const databaseId = dbs[0].id;

        // 2. Fetch rows
        const { data: rows } = await supabase
            .from('crm_rows')
            .select('data')
            .eq('database_id', databaseId);

        // 3. Find Customer
        const cleanPhone = (p) => String(p).replace(/\D/g, '');
        const targetPhone = cleanPhone(customerPhone);

        const row = rows.find(r => {
            const p = r.data['Phone'];
            return p && cleanPhone(p).includes(targetPhone);
        });

        if (row) {
            return res.json({ found: true, data: row.data });
        } else {
            return res.json({ found: false, message: "Customer not found" });
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- 6. EXTERNAL UPDATE (FOR WHATSAPP BOT) ---
exports.updateCustomerFromBot = async (req, res) => {
    try {
        const { userId, customerPhone, fieldToUpdate, newValue } = req.body;

        // 1. Find DB
        const { data: dbs } = await supabase
            .from('crm_databases')
            .select('id')
            .eq('user_id', userId)
            .limit(1);

        if (!dbs || dbs.length === 0) return res.json({ success: false });
        const databaseId = dbs[0].id;

        // 2. Find Row
        const { data: rows } = await supabase
            .from('crm_rows')
            .select('*')
            .eq('database_id', databaseId);

        const cleanPhone = (p) => String(p).replace(/\D/g, '');
        const targetPhone = cleanPhone(customerPhone);

        const target = rows.find(r => {
            const p = r.data['Phone'];
            return p && cleanPhone(p).includes(targetPhone);
        });

        if (target) {
            const newData = { ...target.data, [fieldToUpdate]: newValue };
            await supabase.from('crm_rows').update({ data: newData }).eq('id', target.id);
            return res.json({ success: true, message: "Updated" });
        } else {
            return res.json({ success: false, message: "Not found" });
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};