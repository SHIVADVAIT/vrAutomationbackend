const express = require('express');
const router = express.Router();
const { executeSyncTask } = require('../services/syncService');

/**
 * POST /api/cron/sync
 * Endpoint called by Vercel Cron Job every 5 minutes
 * Protected by authorization header
 */
router.post('/sync', async (req, res) => {
  try {
    // Verify request is from Vercel Cron or authorized source
    const authHeader = req.headers.authorization;
    
    // In production, you can check for Vercel's cron secret
    // For now, we'll allow it if it's from Vercel or has a valid header
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const result = await executeSyncTask();
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in cron sync endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error executing sync task',
      error: error.message 
    });
  }
});

module.exports = router;
