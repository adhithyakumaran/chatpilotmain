const express = require('express');
const router = express.Router();
const controller = require('./crm_controller');

// --- API ENDPOINTS ---

// 1. Get list of databases (Used if fetching via API instead of direct SDK)
router.post('/list', controller.getDatabases);

// 2. Create a new database (Used if creating via API)
router.post('/create', controller.createDatabase);

// 3. Get row data (Used if fetching via API)
router.post('/data', controller.getSheetData);

// 4. The Magic Bar - AI Editing (Used by Flutter)
router.post('/ai-edit', controller.aiEditSheet);

module.exports = router;