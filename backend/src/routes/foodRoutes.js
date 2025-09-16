const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const foodPhotosDir = path.join(__dirname, '..', '..', 'uploads', 'food_photos');
const deliveryProofsDir = path.join(__dirname, '..', '..', 'uploads', 'delivery_proofs');

fs.mkdirSync(foodPhotosDir, { recursive: true });
fs.mkdirSync(deliveryProofsDir, { recursive: true });

// Food item routes
router.post('/upload', foodController.uploadFoodPhoto, foodController.uploadFoodItem);
router.get('/available', foodController.getAvailableFood);
router.get('/donor/:email', foodController.getDonorFoodItems);
router.get('/food/donor/:email', foodController.getDonorFoodItems);
router.get('/ngos', foodController.getNgos);
// Add this route for one-time geocoding fix
router.get('/geocode-all', foodController.geocodeAllAddresses);
// Route to geocode missing food items
router.get('/geocode-missing-items', foodController.geocodeMissingFoodItems);
// Add this route to your foodRoutes.js
router.get('/restaurants', foodController.getRestaurants);
// Food request routes
router.post('/request', foodController.requestFoodItem);
router.get('/requests/ngo/:ngoEmail', foodController.getNgoRequests);
router.put('/requests/:requestId/status', foodController.updateRequestStatus);

// Slum areas and service areas
router.get('/slum-areas', foodController.getSlumAreas);
router.post('/slum-areas', express.json(), foodController.createSlumArea);
router.post('/service-areas', foodController.addNgoServiceArea);
router.get('/service-areas/:ngoEmail', foodController.getNgoServiceAreas);
router.get('/geocode', foodController.geocodeTest);

module.exports = router;

