const https = require('https');

// Puducherry-specific geocoder with enhanced accuracy
exports.geocodeAddress = (address) => new Promise((resolve, reject) => {
  if (!address) return resolve(null);
  
  // Clean and normalize the address
  let cleanAddress = address.trim();
  
  // Remove common formatting issues
  cleanAddress = cleanAddress.replace(/NO:\d+\s*,?\s*/i, ''); // Remove house numbers like "NO:123"
  cleanAddress = cleanAddress.replace(/\s+/g, ' '); // Normalize spaces
  cleanAddress = cleanAddress.replace(/,+/g, ','); // Normalize commas
  
  // Create Puducherry-specific search variations for better accuracy
  const searchVariations = [
    // Primary search with Puducherry context
    `${cleanAddress}, Puducherry, India`,
    `${cleanAddress}, Pondicherry, India`, // Old name
    // More specific variations
    `${cleanAddress}, Puducherry, Tamil Nadu, India`,
    `${cleanAddress}, Pondicherry, Tamil Nadu, India`,
    // Try with union territory
    `${cleanAddress}, Puducherry Union Territory, India`,
    // Fallback with just the main parts
    cleanAddress.split(',').slice(0, 2).join(', ') + ', Puducherry, India',
    // Last resort - just the first part
    cleanAddress.split(',')[0] + ', Puducherry, India'
  ];
  
  console.log(`Geocoding variations for "${address}":`, searchVariations);
  
  // Puducherry bounds (tighter for better accuracy)
  const PUDUCHERRY_BOUNDS = {
    minLat: 11.85,
    maxLat: 12.05,
    minLng: 79.75,
    maxLng: 79.90
  };
  
  // Try each variation until we get a valid Puducherry result
  const tryNextVariation = async (index = 0) => {
    if (index >= searchVariations.length) {
      console.log(`All geocoding variations failed for: ${address}`);
      return resolve(null);
    }
    
    const searchAddress = searchVariations[index];
    const encodedAddress = encodeURIComponent(searchAddress);
    
    // Enhanced Nominatim query with strict Puducherry bounds
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=5&countrycodes=in&bounded=1&viewbox=${PUDUCHERRY_BOUNDS.minLng},${PUDUCHERRY_BOUNDS.maxLat},${PUDUCHERRY_BOUNDS.maxLng},${PUDUCHERRY_BOUNDS.minLat}&addressdetails=1`;
    
    console.log(`Trying geocoding variation ${index + 1}: "${searchAddress}"`);
    
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'surplus-food-distribution/1.0 (Puducherry)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`Geocoding response ${index + 1}: Found ${json.length} results`);
          
          if (Array.isArray(json) && json.length > 0) {
            // Find the best match within strict Puducherry bounds
            for (const result of json) {
              const lat = parseFloat(result.lat);
              const lng = parseFloat(result.lon);
              
              // Strict Puducherry bounds check
              if (lat >= PUDUCHERRY_BOUNDS.minLat && lat <= PUDUCHERRY_BOUNDS.maxLat && 
                  lng >= PUDUCHERRY_BOUNDS.minLng && lng <= PUDUCHERRY_BOUNDS.maxLng) {
                
                // Additional verification - check if address contains Puducherry/Pondicherry
                const displayName = result.display_name.toLowerCase();
                const addressComponents = result.address || {};
                
                if (displayName.includes('puducherry') || displayName.includes('pondicherry') ||
                    (addressComponents.state && (addressComponents.state.toLowerCase().includes('puducherry') || 
                     addressComponents.state.toLowerCase().includes('pondicherry')))) {
                  
                  const finalResult = { 
                    lat: lat, 
                    lng: lng,
                    display_name: result.display_name,
                    confidence: result.importance || 0.5,
                    address: addressComponents
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
          setTimeout(() => tryNextVariation(index + 1), 1200); // Slightly longer delay for accuracy
          
        } catch (e) {
          console.log(`JSON parse error for variation ${index + 1}:`, e.message);
          setTimeout(() => tryNextVariation(index + 1), 1200);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`Request error for variation ${index + 1}:`, error.message);
      setTimeout(() => tryNextVariation(index + 1), 1200);
    });
    
    // Set timeout to prevent hanging requests
    req.setTimeout(12000, () => {
      req.abort();
      console.log(`Geocoding timeout for variation ${index + 1}`);
      setTimeout(() => tryNextVariation(index + 1), 1200);
    });
  };
  
  // Start trying variations
  tryNextVariation(0);
});

// Enhanced version with fallback for registration
exports.geocodeAddressWithFallback = async (address, city = 'Puducherry', state = 'Tamil Nadu') => {
  try {
    console.log(`Geocoding with fallback: ${address}`);
    
    // First try the main geocoding function
    let coords = await exports.geocodeAddress(address);
    
    if (!coords) {
      console.log('Primary geocoding failed, trying fallback strategies...');
      
      // Fallback 1: Try with different city variations
      const fallbackAddresses = [
        `${address}, ${city}, India`,
        `${address}, Pondicherry, India`,
        `${address}, ${city}, ${state}, India`,
        `${address.split(',')[0]}, ${city}, India` // Just first part + city
      ];
      
      for (const fallbackAddr of fallbackAddresses) {
        coords = await exports.geocodeAddress(fallbackAddr);
        if (coords) break;
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    // Final fallback: Use default Puducherry coordinates
    if (!coords) {
      console.log('All geocoding attempts failed, using default Puducherry coordinates');
      coords = {
        lat: 11.9139,
        lng: 79.8145,
        display_name: 'Puducherry, India',
        confidence: 0.1,
        address: {
          city: 'Puducherry',
          state: 'Tamil Nadu',
          country: 'India'
        }
      };
    }
    
    return coords;
  } catch (error) {
    console.error('Geocoding with fallback failed:', error);
    return {
      lat: 11.9139,
      lng: 79.8145,
      display_name: 'Puducherry, India',
      confidence: 0,
      address: {
        city: 'Puducherry',
        state: 'Tamil Nadu',
        country: 'India'
      }
    };
  }
};

// Test function to verify geocoding works
exports.testGeocoding = async () => {
  const testAddresses = [
    "24 Rue Dumas, White Town, Puducherry",
    "123 MG Road, Puducherry",
    "45 Anna Salai, Puducherry",
    "Puducherry Railway Station",
    "JIPMER Hospital, Puducherry"
  ];
  
  console.log('Testing geocoding with sample addresses...');
  
  for (const address of testAddresses) {
    try {
      const result = await exports.geocodeAddress(address);
      if (result) {
        console.log(`✅ "${address}" → ${result.lat}, ${result.lng}`);
      } else {
        console.log(`❌ "${address}" → Failed`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    } catch (error) {
      console.log(`❌ "${address}" → Error: ${error.message}`);
    }
  }
};