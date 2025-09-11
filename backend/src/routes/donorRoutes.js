const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const donorUploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(donorUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, donorUploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// All the logic is now in the controller
router.post('/register', donorController.registerDonor);
router.post('/login', donorController.loginDonor);
router.post('/verify-email', donorController.verifyEmail);
router.post('/update-profile', donorController.updateDonorProfile);
router.get('/profile/:email', donorController.getProfile); // FIXED: Removed /donors prefix
router.put('/update-basic-profile', donorController.updateProfile);
router.get('/debug-profile/:email', donorController.debugProfile);
router.post('/upload-document', upload.single('document'), donorController.uploadDocument);

module.exports = router;