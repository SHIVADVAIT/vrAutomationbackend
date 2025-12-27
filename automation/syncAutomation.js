const cron = require('node-cron');
const Lead = require('../models/Lead');

/**
 * Simulates syncing a lead to CRM
 * @param {Object} lead - The lead to sync
 */
const syncToCRM = async (lead) => {
  // Simulate CRM sync by logging to console
  console.log(`[CRM Sync] Sending verified lead [${lead.name}] to Sales Team...`);
  
  // Mark as synced
  lead.synced = true;
  lead.syncedAt = new Date();
  await lead.save();
};

/**
 * Background task that runs every 5 minutes
 * Identifies "Verified" leads and syncs them to CRM
 */
const startAutomation = () => {
  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('\n=== Running Background Automation Task ===');
      console.log('Time:', new Date().toISOString());
      
      // Find verified leads that haven't been synced yet
      const verifiedLeads = await Lead.find({
        status: 'Verified',
        synced: false
      });
      
      console.log(`Found ${verifiedLeads.length} verified lead(s) to sync`);
      
      if (verifiedLeads.length === 0) {
        console.log('No leads to sync at this time.');
        console.log('========================================\n');
        return;
      }
      
      // Sync each lead (with idempotency - only unsynced leads)
      for (const lead of verifiedLeads) {
        await syncToCRM(lead);
      }
      
      console.log(`Successfully synced ${verifiedLeads.length} lead(s)`);
      console.log('========================================\n');
      
    } catch (error) {
      console.error('Error in background automation:', error);
    }
  });
  
  console.log('✓ Background automation started - runs every 5 minutes');
};

module.exports = { startAutomation };
