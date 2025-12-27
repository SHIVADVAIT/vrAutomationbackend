const express = require('express');
const router = express.Router();
const { processLeads, getLeads, getLead } = require('../controllers/leadController');

// POST /api/leads/process - Process a batch of names
router.post('/process', processLeads);

// GET /api/leads - Get all leads (with optional status filter)
router.get('/', getLeads);

// GET /api/leads/:id - Get a single lead
router.get('/:id', getLead);

module.exports = router;
