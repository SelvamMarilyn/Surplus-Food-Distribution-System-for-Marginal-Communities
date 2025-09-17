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
    const ngo = result.rows[0];git

    // generate OTP, save, send email
    const otp = generateOtp();
    await ngoModel.saveOtp(ngo.id, otp);

    const mailOptions = {
      from: `"HopeBites Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to HopeBites - NGO Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to HopeBites, ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining HopeBites as a partner organization! We're excited to work with you in our mission to reduce food waste and serve communities in need.
            </p>
            
            <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #333; margin: 0; font-size: 14px; font-weight: 500;">Your verification code is:</p>
              <h1 style="color: #ff6b6b; margin: 10px 0; font-size: 32px; letter-spacing: 3px;">${otp}</h1>
              <p style="color: #666; margin: 0; font-size: 12px;">Valid for 15 minutes</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Enter this code in the verification field to complete your NGO account setup. Once verified, you'll be able to request food donations from our network of generous donors.
            </p>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>🤝 Partnership Benefits:</strong><br/>
                • Connect with local food donors<br/>
                • Receive surplus food for your community<br/>
                • Track your impact and donations
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>The HopeBites Team</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
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


