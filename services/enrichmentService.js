const axios = require('axios');

/**
 * Fetches nationality data from Nationalize.io API
 * @param {string} name - The name to check
 * @returns {Promise<Object>} - The nationality data
 */
const getNationality = async (name) => {
  try {
    const response = await axios.get(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching nationality for ${name}:`, error.message);
    throw error;
  }
};

/**
 * Processes a batch of names concurrently
 * @param {Array<string>} names - Array of names to process
 * @returns {Promise<Array>} - Array of enriched lead data
 */
const processBatch = async (names) => {
  // Remove duplicates and empty names
  const uniqueNames = [...new Set(names.filter(name => name && name.trim()))];
  
  // Process all names concurrently using Promise.all
  const promises = uniqueNames.map(async (name) => {
    try {
      const nationalityData = await getNationality(name.trim());
      
      // Get the most likely country
      const countries = nationalityData.country || [];
      if (countries.length === 0) {
        return {
          name: name.trim(),
          mostLikelyCountry: 'Unknown',
          probability: 0,
          confidenceScore: 0,
          status: 'To Check'
        };
      }
      
      // Sort by probability and get the highest
      const mostLikely = countries.sort((a, b) => b.probability - a.probability)[0];
      const probability = mostLikely.probability;
      const confidenceScore = Math.round(probability * 100);
      
      // Apply business logic
      const status = probability >= 0.6 ? 'Verified' : 'To Check';
      
      return {
        name: name.trim(),
        mostLikelyCountry: mostLikely.country_id,
        probability: probability,
        confidenceScore: confidenceScore,
        status: status
      };
    } catch (error) {
      // Handle individual failures gracefully
      return {
        name: name.trim(),
        mostLikelyCountry: 'Error',
        probability: 0,
        confidenceScore: 0,
        status: 'To Check',
        error: error.message
      };
    }
  });
  
  // Wait for all promises to resolve
  const results = await Promise.all(promises);
  return results;
};

module.exports = { getNationality, processBatch };
