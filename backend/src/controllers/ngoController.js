// controllers/ngoController.js
const ngoModel = require('../models/ngoModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { geocodeAddressWithFallback } = require('../utils/geocode');
// const coords = await geocodeAddressWithFallback(address);

// configure nodemailer (same pattern as adminController)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // check existing
    const existing = await ngoModel.findNgoByEmail(email);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const result = await ngoModel.createNgo({ name, email, password });
    const ngo = result.rows[0];

    // generate OTP, save, send email
    const otp = generateOtp();
    await ngoModel.saveOtp(ngo.id, otp);

    const mailOptions = {
      from: `"Surplus Food" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your NGO Registration OTP',
      html: `<p>Hello ${name},</p><p>Your OTP for NGO registration is <b>${otp}</b>. It expires in 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'NGO registered. OTP sent to email.', ngo: { id: ngo.id, email: ngo.email } });
  } catch (err) {
    console.error('NGO register error:', err);
    res.status(500).json({ message: 'NGO registration failed.' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const match = await ngoModel.findNgoWithOtp(email, otp);
    if (!match.rows || match.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const ngoId = match.rows[0].id;
    await ngoModel.verifyNgo(ngoId);
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('NGO verify error:', err);
    res.status(500).json({ message: 'Failed to verify email.' });
  }
};



const updateProfile = async (req, res) => {
    try {
        const { email, registrationNumber, address, phone } = req.body;
        
        // First update the basic profile
        const result = await ngoModel.updateNgoProfile(email, { registrationNumber, address, phone });
        
        let coords = null;
        
        // Geocode the address with proper fallbacks
        if (address && address.trim()) {
            try {
                console.log(`Geocoding NGO address: ${address}`);
                coords = await geocodeAddressWithFallback(address, 'Puducherry', 'Tamil Nadu');
                
                if (coords && coords.lat && coords.lng) {
                    const ngo = result.rows[0];
                    // Update coordinates in database
                    await ngoModel.updateNgoCoordinates(ngo.id, coords.lat, coords.lng);
                    console.log(`✅ Successfully geocoded NGO to: ${coords.lat}, ${coords.lng}`);
                }
            } catch (geocodeError) {
                console.log(`NGO geocoding failed: ${geocodeError.message}`);
                // Set default coordinates if geocoding fails
                await setDefaultNgoCoordinates(email);
            }
        } else {
            // No address provided, use default coordinates
            await setDefaultNgoCoordinates(email);
        }
        
        res.json({ 
            message: 'Profile updated successfully with location data.', 
            ngo: result.rows[0],
            coordinates: coords 
        });
    } catch (err) {
        console.error('NGO update profile error:', err);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};

// Helper function for NGO default coordinates
async function setDefaultNgoCoordinates(email) {
    try {
        const ngoResult = await ngoModel.findNgoByEmail(email);
        if (ngoResult.rows && ngoResult.rows.length > 0) {
            await ngoModel.updateNgoCoordinates(ngoResult.rows[0].id, 11.9139, 79.8145);
            console.log('✅ Set default Puducherry coordinates for NGO');
        }
    } catch (error) {
        console.error('Error setting default NGO coordinates:', error);
    }
}
// upload document (multipart) - use multer in route
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // store only the filename in DB; frontend will prefix with /uploads/ngo_docs/
    const fileName = req.file.filename;
    const { email } = req.body;

    const result = await ngoModel.updateDocumentPathAndStatus(email, fileName);
    res.json({ message: 'Document uploaded and NGO set to Under Review.', ngo: result.rows[0] });
  } catch (err) {
    console.error('NGO upload error:', err);
    res.status(500).json({ message: 'Document upload failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await ngoModel.findNgoByEmail(email);
    if (found.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

    const ngo = found.rows[0];
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, ngo.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    if (ngo.status !== 'Approved') {
      return res.status(403).json({ message: 'NGO is not approved yet.' });
    }

    // Create JWT
    const payload = { id: ngo.id, role: 'ngo', email: ngo.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      ngo: { id: ngo.id, name: ngo.name, email: ngo.email }
    });
  } catch (err) {
    console.error('NGO login error:', err);
    res.status(500).json({ message: 'Login failed.' });
  }
};
const saveCoordinates = async (req, res) => {
    try {
        const { email, lat, lng } = req.body;
        
        const ngoResult = await ngoModel.findNgoByEmail(email);
        if (!ngoResult.rows || ngoResult.rows.length === 0) {
            return res.status(404).json({ message: 'NGO not found' });
        }
        
        await ngoModel.updateNgoCoordinates(ngoResult.rows[0].id, lat, lng);
        res.json({ message: 'Coordinates saved successfully' });
    } catch (err) {
        console.error('Save coordinates error:', err);
        res.status(500).json({ message: 'Failed to save coordinates' });
    }
};

// Get complete NGO profile
const getNgoProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const ngoResult = await ngoModel.findNgoByEmail(email);
    
    if (!ngoResult.rows || ngoResult.rows.length === 0) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    
    const ngo = ngoResult.rows[0];
    
    // Get additional stats - remove foodModel dependencies for now
    // We'll add these later once basic profile works
    const activeRequests = 0; // Placeholder
    const peopleServed = 0;   // Placeholder
    
    res.json({
      email: ngo.email,
      name: ngo.name,
      address: ngo.address,
      phone: ngo.phone,
      registration_number: ngo.registration_number,
      // area: ngo.area || 'Puducherry',
      people_served: peopleServed,
      active_requests: activeRequests,
      lat: ngo.lat,
      lng: ngo.lng,
      status: ngo.status
    });
  } catch (err) {
    console.error('Get NGO profile error:', err);
    res.status(500).json({ message: 'Failed to get NGO profile' });
  }
};
const updateCompleteProfile = async (req, res) => {
  try {
    const { email, name, registrationNumber, address, phone } = req.body;
    
    // First update the basic profile
    const result = await ngoModel.updateCompleteProfile(email, { 
      name, 
      registrationNumber, 
      address, 
      phone, 
    });
    
    let coords = null;
    
    // Geocode the address if provided
    if (address && address.trim()) {
      try {
        coords = await geocodeAddressWithFallback(address, 'Puducherry', 'Tamil Nadu');
        if (coords && coords.lat && coords.lng) {
          await ngoModel.updateNgoCoordinates(result.rows[0].id, coords.lat, coords.lng);
        }
      } catch (geocodeError) {
        console.log(`NGO geocoding failed: ${geocodeError.message}`);
        await setDefaultNgoCoordinates(email);
      }
    } else {
      await setDefaultNgoCoordinates(email);
    }
    
    res.json({ 
      message: 'Profile updated successfully.', 
      ngo: result.rows[0]
    });
  } catch (err) {
    console.error('NGO update complete profile error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
// Add to module.exports
module.exports = {
    register,
    verifyEmail,
    updateProfile,
    updateCompleteProfile, 
    uploadDocument,
    login,
    saveCoordinates,  // ← Add this
    getNgoProfile 
};


