const https = require('https');

// Enhanced geocoder with better Puducherry region handling
exports.geocodeAddress = (address) => new Promise((resolve, reject) => {
  if (!address) return resolve(null);
  
  // Clean and normalize the address
  let cleanAddress = address.trim();
  
  // Remove common formatting issues
  cleanAddress = cleanAddress.replace(/NO:\d+\s*,?\s*/i, ''); // Remove house numbers like "NO:123"
  cleanAddress = cleanAddress.replace(/\s+/g, ' '); // Normalize spaces
  cleanAddress = cleanAddress.replace(/,+/g, ','); // Normalize commas
  
  // Create multiple search variations for better accuracy
  const searchVariations = [
    // Primary search with enhanced Puducherry context
    `${cleanAddress}, Puducherry, Tamil Nadu, India`,
    `${cleanAddress}, Puducherry, India`,
    // Secondary searches
    cleanAddress.replace(/puducherry/i, 'Pondicherry'), // Try old name
    `${cleanAddress.replace(/puducherry/i, 'Pondicherry')}, Tamil Nadu, India`,
    // Fallback with just the main parts
    cleanAddress.split(',').slice(0, 2).join(', ') + ', Puducherry, India',
    // Last resort - just the first part
    cleanAddress.split(',')[0] + ', Puducherry, India'
  ];
  
  console.log(`Geocoding variations for "${address}":`, searchVariations);
  
  // Try each variation until we get a result in the correct region
  const tryNextVariation = async (index = 0) => {
    if (index >= searchVariations.length) {
      console.log(`All geocoding variations failed for: ${address}`);
      return resolve(null);
    }
    
    const searchAddress = searchVariations[index];
    const encodedAddress = encodeURIComponent(searchAddress);
    
    // Enhanced Nominatim query with strict Puducherry bounds
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=3&countrycodes=in&bounded=1&viewbox=79.7,11.8,79.9,12.1&addressdetails=1&dedupe=1`;
    
    console.log(`Trying geocoding variation ${index + 1}: "${searchAddress}"`);
    
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'food-distribution-app/1.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`Geocoding response ${index + 1}:`, JSON.stringify(json.slice(0, 2), null, 2)); // Log first 2 results
          
          if (Array.isArray(json) && json.length > 0) {
            // Find the best match within Puducherry region
            for (const result of json) {
              const lat = parseFloat(result.lat);
              const lng = parseFloat(result.lon);
              
              // Strict Puducherry bounds check
              if (lat >= 11.8 && lat <= 12.1 && lng >= 79.7 && lng <= 79.9) {
                // Additional verification - check if address contains Puducherry/Pondicherry
                const displayName = result.display_name.toLowerCase();
                if (displayName.includes('puducherry') || displayName.includes('pondicherry')) {
                  const finalResult = { 
                    lat: lat, 
                    lng: lng,
                    display_name: result.display_name,
                    confidence: result.importance || 0.5
                  };
                  console.log(`✓ Successfully geocoded "${searchAddress}" to: ${lat}, ${lng}`);
                  console.log(`  Display name: ${result.display_name}`);
                  return resolve(finalResult);
                }
              }
            }
          }
          
          // No valid result found, try next variation
          console.log(`No valid Puducherry result for variation ${index + 1}, trying next...`);
          setTimeout(() => tryNextVariation(index + 1), 1000); // Rate limiting
          
        } catch (e) {
          console.log(`JSON parse error for variation ${index + 1}:`, e.message);
          setTimeout(() => tryNextVariation(index + 1), 1000);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`Request error for variation ${index + 1}:`, error.message);
      setTimeout(() => tryNextVariation(index + 1), 1000);
    });
    
    // Set timeout to prevent hanging requests
    req.setTimeout(10000, () => {
      req.abort();
      console.log(`Geocoding timeout for variation ${index + 1}`);
      setTimeout(() => tryNextVariation(index + 1), 1000);
    });
  };
  
  // Start trying variations
  tryNextVariation(0);
});