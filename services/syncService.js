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
 * Manual sync function that can be called via API endpoint
 * Used for Vercel Cron Jobs
 */
const executeSyncTask = async () => {
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
      return {
        success: true,
        message: 'No leads to sync',
        syncedCount: 0
      };
    }
    
    // Sync each lead (with idempotency - only unsynced leads)
    for (const lead of verifiedLeads) {
      await syncToCRM(lead);
    }
    
    console.log(`Successfully synced ${verifiedLeads.length} lead(s)`);
    console.log('========================================\n');
    
    return {
      success: true,
      message: `Successfully synced ${verifiedLeads.length} lead(s)`,
      syncedCount: verifiedLeads.length
    };
    
  } catch (error) {
    console.error('Error in background automation:', error);
    return {
      success: false,
      message: 'Error during sync',
      error: error.message
    };
  }
};

module.exports = { executeSyncTask };
