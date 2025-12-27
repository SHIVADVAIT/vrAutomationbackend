const Lead = require('../models/Lead');
const { processBatch } = require('../services/enrichmentService');

/**
 * Process a batch of leads
 * POST /api/leads/process
 */
const processLeads = async (req, res) => {
  try {
    const { names } = req.body;
    
    // Validate input
    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of names' 
      });
    }
    
    // Process the batch using the enrichment service
    const enrichedData = await processBatch(names);
    
    // Save to database
    const savedLeads = [];
    for (const leadData of enrichedData) {
      const lead = new Lead(leadData);
      const saved = await lead.save();
      savedLeads.push(saved);
    }
    
    res.status(201).json({
      success: true,
      count: savedLeads.length,
      data: savedLeads
    });
    
  } catch (error) {
    console.error('Error processing leads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing leads',
      error: error.message 
    });
  }
};

/**
 * Get all leads with optional filtering
 * GET /api/leads
 */
const getLeads = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const leads = await Lead.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leads',
      error: error.message 
    });
  }
};

/**
 * Get a single lead by ID
 * GET /api/leads/:id
 */
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lead',
      error: error.message 
    });
  }
};

module.exports = {
  processLeads,
  getLeads,
  getLead
};
