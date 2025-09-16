const foodModel = require('../models/foodModel');
const donorModel = require('../models/donorModel');
const ngoModel = require('../models/ngoModel');
const path = require('path');
const multer = require('multer');
const { geocodeAddress } = require('../utils/geocode');

// Configure multer for food photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads', 'food_photos'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: (req, file, cb) => {
        if (!file || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware for food photo upload
exports.uploadFoodPhoto = upload.single('photo');

// Upload food item
// Enhanced uploadFoodItem function with better geocoding
// Enhanced uploadFoodItem function that works anywhere in India
exports.uploadFoodItem = async (req, res) => {
    try {
        const { email, foodName, quantity, expiryTime, description, foodType } = req.body;
        
        // Get donor by email
        const donor = await donorModel.findDonorByEmail(email);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        if (donor.status !== 'Approved') {
            return res.status(403).json({ message: 'Donor account not approved' });
        }

        // Create food item
        const photoPath = req.file ? `/uploads/food_photos/${req.file.filename}` : null;
        
        // Enhanced geocoding for all of India
        let foodLat = null; 
        let foodLng = null;
        
        if (donor.address) {
            try {
                console.log(`Geocoding donor address: ${donor.address}`);
                
                // Try the enhanced geocoding (now works India-wide)
                const coords = await geocodeAddress(donor.address);
                
                if (coords && coords.lat && coords.lng) {
                    // Validate coordinates are within India bounds
                    if (coords.lat >= 6.0 && coords.lat <= 37.6 && coords.lng >= 68.7 && coords.lng <= 97.25) {
                        foodLat = coords.lat;
                        foodLng = coords.lng;
                        console.log(`✓ Successfully geocoded donor address to: ${foodLat}, ${foodLng}`);
                    } else {
                        console.log(`❌ Coordinates outside India bounds: ${coords.lat}, ${coords.lng}`);
                    }
                }
            } catch (error) {
                console.log(`Geocoding error for "${donor.address}":`, error.message);
            }
        }

        // Create food item with coordinates
        const foodItem = await foodModel.createFoodItem(
            donor.id, 
            foodName, 
            quantity, 
            expiryTime, 
            description, 
            photoPath, 
            foodType,
            foodLat,  // Pass latitude
            foodLng   // Pass longitude
        );

        res.status(201).json({ 
            message: 'Food item uploaded successfully', 
            foodItem,
            geocoded: foodLat && foodLng ? true : false
        });
    } catch (error) {
        console.error('Food upload error:', error);
        res.status(500).json({ message: 'Failed to upload food item' });
    }
};

// Enhanced getAvailableFood function for India-wide operation
exports.getAvailableFood = async (req, res) => {
    try {
        console.log('Loading available food items...');
        const foodItems = await foodModel.getAvailableFoodItems();
        console.log(`Found ${foodItems.length} food items`);
        
        // Group food items by location for efficient geocoding
        const locationGroups = new Map();
        
        foodItems.forEach(item => {
            // Create a more robust location key that works across India
            const locationKey = `${(item.donor_address || '').toLowerCase().trim()}_${(item.restaurant_name || '').toLowerCase().trim()}`;
            if (!locationGroups.has(locationKey)) {
                locationGroups.set(locationKey, []);
            }
            locationGroups.get(locationKey).push(item);
        });
        
        console.log(`Grouped into ${locationGroups.size} unique locations`);
        
        // Process each location group
        const enrichedItems = [];
        
        for (const [locationKey, items] of locationGroups) {
            console.log(`Processing location group: ${locationKey} (${items.length} items)`);
            
            // Check if any item in the group already has coordinates
            let groupLat = null;
            let groupLng = null;
            
            for (const item of items) {
                if (item.lat && item.lng) {
                    groupLat = parseFloat(item.lat);
                    groupLng = parseFloat(item.lng);
                    console.log(`Found existing coordinates for group: ${groupLat}, ${groupLng}`);
                    break;
                }
            }
            
            // If no coordinates found, try geocoding the address
            if (!groupLat || !groupLng) {
                const address = items[0].donor_address;
                if (address && address.trim().length > 0) {
                    console.log(`Geocoding address for group: ${address}`);
                    
                    try {
                        // Use the enhanced geocoding that works anywhere in India
                        const coords = await geocodeAddress(address);
                        
                        if (coords && coords.lat && coords.lng) {
                            // Validate it's within India
                            if (coords.lat >= 6.0 && coords.lat <= 37.6 && coords.lng >= 68.7 && coords.lng <= 97.25) {
                                groupLat = coords.lat;
                                groupLng = coords.lng;
                                console.log(`✓ Successfully geocoded "${address}" to: ${groupLat}, ${groupLng}`);
                                console.log(`  Display name: ${coords.display_name || 'N/A'}`);
                            } else {
                                console.log(`❌ Coordinates outside India bounds: ${coords.lat}, ${coords.lng}`);
                            }
                        } else {
                            console.log(`❌ Failed to geocode: ${address}`);
                        }
                    } catch (error) {
                        console.log(`Geocoding error for "${address}":`, error.message);
                    }
                }
            }
            
            // Apply coordinates to all items in the group
            items.forEach((item, index) => {
                const enrichedItem = { ...item };
                
                if (groupLat && groupLng) {
                    enrichedItem.lat = groupLat;
                    enrichedItem.lng = groupLng;
                    
                    // Add slight offset for multiple items at same location for better visibility
                    if (items.length > 1) {
                        const offset = 0.001; // About 100 meters (suitable for India-wide scale)
                        const angle = (index * 2 * Math.PI) / items.length;
                        enrichedItem.lat = groupLat + (offset * Math.cos(angle));
                        enrichedItem.lng = groupLng + (offset * Math.sin(angle));
                        console.log(`Applied offset to item ${index + 1}: ${enrichedItem.lat}, ${enrichedItem.lng}`);
                    }
                } else {
                    console.log(`No coordinates available for item: ${item.food_name} at ${item.donor_address || 'unknown address'}`);
                }
                
                enrichedItems.push(enrichedItem);
            });
            
            // Add delay between location groups to respect rate limits
            if (locationGroups.size > 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        console.log(`Returning ${enrichedItems.length} enriched food items`);
        
        // Sort by expiry time for better user experience
        enrichedItems.sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));
        
        res.json(enrichedItems);
    } catch (error) {
        console.error('Get available food error:', error);
        res.status(500).json({ message: 'Failed to fetch available food' });
    }
};
// Simple version for debugging
// Add this method to your foodController.js

// Get all restaurants with geocoded locations
// Get all restaurants with geocoded locations
exports.getRestaurants = async (req, res) => {
    try {
        console.log('Loading restaurants...');
        
        // Get all approved donors that have restaurant names (they are restaurants)
        const restaurants = await donorModel.getRestaurants();
        
        console.log(`Found ${restaurants.length} restaurants`);
        
        // Geocode restaurant addresses if not already geocoded
        const enrichedRestaurants = [];
        
        for (const restaurant of restaurants) {
            // If restaurant already has coordinates, add to list
            if (restaurant.lat && restaurant.lng) {
                enrichedRestaurants.push({
                    ...restaurant,
                    lat: parseFloat(restaurant.lat),
                    lng: parseFloat(restaurant.lng)
                });
                console.log(`Restaurant ${restaurant.restaurant_name} already has coordinates: ${restaurant.lat}, ${restaurant.lng}`);
                continue;
            }
            
            // If no coordinates but has address, try to geocode
            if (restaurant.address && restaurant.address.trim().length > 0) {
                try {
                    console.log(`Geocoding restaurant address: ${restaurant.address}`);
                    const coords = await geocodeAddress(restaurant.address, null);
                    
                    if (coords && coords.lat && coords.lng) {
                        // Validate coordinates are within India
                        if (coords.lat >= 6.0 && coords.lat <= 37.6 && coords.lng >= 68.7 && coords.lng <= 97.25) {
                            console.log(`✓ Successfully geocoded restaurant "${restaurant.restaurant_name}" to: ${coords.lat}, ${coords.lng}`);
                            
                            // Try to save coordinates back to database for future use
                            try {
                                await donorModel.updateDonorCoordinates(restaurant.id, coords.lat, coords.lng);
                                console.log(`Saved coordinates for restaurant: ${restaurant.restaurant_name}`);
                            } catch (saveError) {
                                console.log(`Could not save coordinates for restaurant: ${saveError.message}`);
                            }
                            
                            enrichedRestaurants.push({
                                ...restaurant,
                                lat: coords.lat,
                                lng: coords.lng,
                                geocoded: true
                            });
                        } else {
                            console.log(`❌ Restaurant coordinates outside India bounds: ${coords.lat}, ${coords.lng}`);
                            enrichedRestaurants.push({
                                ...restaurant,
                                geocoded: false
                            });
                        }
                    } else {
                        console.log(`❌ Failed to geocode restaurant: ${restaurant.restaurant_name}`);
                        enrichedRestaurants.push({
                            ...restaurant,
                            geocoded: false
                        });
                    }
                } catch (error) {
                    console.log(`Geocoding error for restaurant "${restaurant.restaurant_name}": ${error.message}`);
                    enrichedRestaurants.push({
                        ...restaurant,
                        geocoded: false
                    });
                }
            } else {
                // Return restaurant without coordinates if no address
                console.log(`No address available for restaurant: ${restaurant.restaurant_name}`);
                enrichedRestaurants.push({
                    ...restaurant,
                    geocoded: false
                });
            }
            
            // Add delay to respect rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Sort restaurants by name for consistent display
        enrichedRestaurants.sort((a, b) => (a.restaurant_name || a.name).localeCompare(b.restaurant_name || b.name));
        
        console.log(`Returning ${enrichedRestaurants.length} restaurants, ${enrichedRestaurants.filter(r => r.lat && r.lng).length} with coordinates`);
        
        res.json(enrichedRestaurants);
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({ message: 'Failed to fetch restaurants' });
    }
};
// Get food items by donor
exports.getDonorFoodItems = async (req, res) => {
    try {
        const { email } = req.params;
        const donor = await donorModel.findDonorByEmail(email);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        const foodItems = await foodModel.getFoodItemsByDonor(donor.id);
        res.json(foodItems);
    } catch (error) {
        console.error('Get donor food items error:', error);
        res.status(500).json({ message: 'Failed to fetch food items' });
    }
};

// Request food item
exports.requestFoodItem = async (req, res) => {
    try {
        const { foodItemId, ngoEmail, estimatedPickupTime } = req.body;
        
        // Get NGO by email
        const ngoResult = await ngoModel.findNgoByEmail(ngoEmail);
        if (!ngoResult.rows || ngoResult.rows.length === 0) {
            return res.status(404).json({ message: 'NGO not found' });
        }
        
        const ngo = ngoResult.rows[0];
        if (ngo.status !== 'Approved') {
            return res.status(403).json({ message: 'NGO account not approved' });
        }

        // Check if food item is still available
        const foodItem = await foodModel.getFoodItemById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        
        if (foodItem.status !== 'Available') {
            return res.status(400).json({ message: 'Food item is no longer available' });
        }

        // Create food request
        const request = await foodModel.createFoodRequest(foodItemId, ngo.id, estimatedPickupTime);
        
        // Create notification for donor
        await foodModel.createNotification(
            foodItem.donor_id,
            'donor',
            'Food Request Received',
            `Your food item "${foodItem.food_name}" has been requested by ${ngo.name}`,
            'info'
        );

        res.status(201).json({ 
            message: 'Food request submitted successfully', 
            request 
        });
    } catch (error) {
        console.error('Request food error:', error);
        res.status(500).json({ message: 'Failed to request food item' });
    }
};

// Get NGO food requests
exports.getNgoRequests = async (req, res) => {
    try {
        const { ngoEmail } = req.params;
        const ngoResult = await ngoModel.findNgoByEmail(ngoEmail);
        if (!ngoResult.rows || ngoResult.rows.length === 0) {
            return res.status(404).json({ message: 'NGO not found' });
        }

        const requests = await foodModel.getFoodRequestsByNgo(ngoResult.rows[0].id);
        res.json(requests);
    } catch (error) {
        console.error('Get NGO requests error:', error);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
};

// Update request status (for delivery proof)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, deliveryProofPath } = req.body;
        
        const additionalData = {};
        if (status === 'Delivered') {
            additionalData.delivered_at = new Date();
            if (deliveryProofPath) {
                additionalData.delivery_proof_path = deliveryProofPath;
            }
        }

        const updatedRequest = await foodModel.updateRequestStatus(requestId, status, additionalData);
        
        // If delivered, update food item status
        if (status === 'Delivered') {
            await foodModel.updateFoodItemStatus(updatedRequest.food_item_id, 'Delivered');
        }

        res.json({ 
            message: 'Request status updated successfully', 
            request: updatedRequest 
        });
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({ message: 'Failed to update request status' });
    }
};

// Get slum areas
exports.getSlumAreas = async (req, res) => {
    try {
        const slumAreas = await foodModel.getAllSlumAreas();
        res.json(slumAreas);
    } catch (error) {
        console.error('Get slum areas error:', error);
        res.status(500).json({ message: 'Failed to fetch slum areas' });
    }
};

// Create slum area
exports.createSlumArea = async (req, res) => {
    try {
        const { name, lat, lng, population, description } = req.body;
        if (!name || lat == null || lng == null) {
            return res.status(400).json({ message: 'name, lat, lng are required' });
        }
        const area = await foodModel.createSlumArea(name, lat, lng, population || 0, description || null);
        res.status(201).json({ message: 'Slum area created', area });
    } catch (error) {
        console.error('Create slum area error:', error);
        res.status(500).json({ message: 'Failed to create slum area' });
    }
};

// Add NGO service area
exports.addNgoServiceArea = async (req, res) => {
    try {
        const { ngoEmail, slumAreaId, contactPerson, contactPhone } = req.body;
        
        const ngoResult = await ngoModel.findNgoByEmail(ngoEmail);
        if (!ngoResult.rows || ngoResult.rows.length === 0) {
            return res.status(404).json({ message: 'NGO not found' });
        }

        const serviceArea = await foodModel.addNgoServiceArea(
            ngoResult.rows[0].id, 
            slumAreaId, 
            contactPerson, 
            contactPhone
        );

        res.status(201).json({ 
            message: 'Service area added successfully', 
            serviceArea 
        });
    } catch (error) {
        console.error('Add service area error:', error);
        res.status(500).json({ message: 'Failed to add service area' });
    }
};

// Get NGO service areas
exports.getNgoServiceAreas = async (req, res) => {
    try {
        const { ngoEmail } = req.params;
        const ngoResult = await ngoModel.findNgoByEmail(ngoEmail);
        if (!ngoResult.rows || ngoResult.rows.length === 0) {
            return res.status(404).json({ message: 'NGO not found' });
        }

        const serviceAreas = await foodModel.getNgoServiceAreas(ngoResult.rows[0].id);
        res.json(serviceAreas);
    } catch (error) {
        console.error('Get service areas error:', error);
        res.status(500).json({ message: 'Failed to fetch service areas' });
    }
};

// Simple geocode test endpoint
exports.geocodeTest = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ message: 'address query param required' });
        console.log(`Testing geocoding for: ${address}`);
        const coords = await geocodeAddress(address);
        if (!coords) return res.status(404).json({ message: 'Could not resolve address' });
        res.json(coords);
    } catch (e) {
        console.log(`Geocode test error:`, e.message);
        res.status(500).json({ message: 'Geocode failed' });
    }
};
// Add this to your foodController.js exports
exports.getNgos = async (req, res) => {
    try {
        const ngos = await ngoModel.getNgos();
        res.json(ngos);
    } catch (error) {
        console.error('Get NGOs error:', error);
        res.status(500).json({ message: 'Failed to fetch NGOs' });
    }
};
// One-time function to geocode all existing addresses
exports.geocodeAllAddresses = async (req, res) => {
    try {
        console.log('Geocoding all existing addresses...');
        
        // Geocode all donors with addresses but no coordinates
        const donors = await donorModel.getDonorsWithoutCoordinates();
        console.log(`Found ${donors.length} donors without coordinates`);
        
        for (const donor of donors) {
            if (donor.address && donor.address.trim().length > 0) {
                try {
                    console.log(`Geocoding donor: ${donor.restaurant_name || donor.name}`);
                    const coords = await geocodeAddress(donor.address);
                    
                    if (coords && coords.lat && coords.lng) {
                        await donorModel.updateDonorCoordinates(donor.id, coords.lat, coords.lng);
                        console.log(`✓ Geocoded donor: ${donor.restaurant_name}`);
                    }
                } catch (error) {
                    console.log(`Error geocoding donor ${donor.id}: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
            }
        }
        
        // Geocode all NGOs with addresses but no coordinates
        const ngos = await ngoModel.getNgosWithoutCoordinates();
        console.log(`Found ${ngos.length} NGOs without coordinates`);
        
        for (const ngo of ngos) {
            if (ngo.address && ngo.address.trim().length > 0) {
                try {
                    console.log(`Geocoding NGO: ${ngo.name}`);
                    const coords = await geocodeAddress(ngo.address);
                    
                    if (coords && coords.lat && coords.lng) {
                        await ngoModel.updateNgoCoordinates(ngo.id, coords.lat, coords.lng);
                        console.log(`✓ Geocoded NGO: ${ngo.name}`);
                    }
                } catch (error) {
                    console.log(`Error geocoding NGO ${ngo.id}: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
            }
        }
        
        res.json({ message: 'Geocoding completed for all addresses' });
        
    } catch (error) {
        console.error('Geocode all addresses error:', error);
        res.status(500).json({ message: 'Failed to geocode addresses' });
    }
};

// Function to geocode and update food items with missing coordinates
exports.geocodeMissingFoodItems = async (req, res) => {
    try {
        console.log('Geocoding food items with missing coordinates...');
        
        // Get food items without coordinates
        const foodItems = await foodModel.getFoodItemsWithoutCoordinates();
        console.log(`Found ${foodItems.length} food items without coordinates`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const item of foodItems) {
            try {
                // Get donor info for this food item
                const donor = await donorModel.getDonorById(item.donor_id);
                
                if (donor && donor.address && donor.address.trim().length > 0) {
                    console.log(`Geocoding address for food item ${item.id}: ${donor.address}`);
                    
                    const coords = await geocodeAddress(donor.address);
                    
                    if (coords && coords.lat && coords.lng) {
                        // Validate coordinates are within India
                        if (coords.lat >= 6.0 && coords.lat <= 37.6 && coords.lng >= 68.7 && coords.lng <= 97.25) {
                            // Update food item with coordinates
                            await foodModel.updateFoodItemCoordinates(item.id, coords.lat, coords.lng);
                            console.log(`✓ Updated food item ${item.id} with coordinates: ${coords.lat}, ${coords.lng}`);
                            successCount++;
                        } else {
                            console.log(`❌ Coordinates outside India bounds for food item ${item.id}`);
                            failCount++;
                        }
                    } else {
                        console.log(`❌ Failed to geocode address for food item ${item.id}`);
                        failCount++;
                    }
                } else {
                    console.log(`❌ No address available for donor of food item ${item.id}`);
                    failCount++;
                }
            } catch (error) {
                console.log(`Error processing food item ${item.id}:`, error.message);
                failCount++;
            }
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        res.json({ 
            message: `Geocoding completed. Success: ${successCount}, Failed: ${failCount}`,
            successCount,
            failCount
        });
        
    } catch (error) {
        console.error('Geocode missing food items error:', error);
        res.status(500).json({ message: 'Failed to geocode missing food items' });
    }
};