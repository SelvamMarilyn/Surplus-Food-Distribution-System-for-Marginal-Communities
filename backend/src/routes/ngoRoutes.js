// routes/ngoRoutes.js
const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload folder exists (serveable by server.js which exposes /uploads from project root)
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'ngo_docs');
fs.mkdirSync(uploadDir, { recursive: true });

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/register', ngoController.register);
router.post('/verify-email', ngoController.verifyEmail);
router.post('/update-profile', ngoController.updateProfile);
router.post('/upload-document', upload.single('document'), ngoController.uploadDocument);
router.post('/login', ngoController.login);

module.exports = router;
