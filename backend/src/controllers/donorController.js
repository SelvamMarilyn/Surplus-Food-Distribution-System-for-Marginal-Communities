const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { geocodeAddressWithFallback } = require('../utils/geocode');
const donorModel = require('../models/donorModel'); // Make sure this path is correct
const { Pool } = require('pg');
// const coords = await geocodeAddressWithFallback(address);
// Configure database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.registerDonor = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userExists = await donorModel.findDonorByEmail(email);
        
        if (userExists) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const newDonorId = await donorModel.createDonor(name, email, hashedPassword);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await donorModel.saveOtp(newDonorId, otp);

        await transporter.sendMail({
            from: `"Surplus Food" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your One-Time Password (OTP) for Registration',
            html: `<p>Hello ${name},</p><p>Your one-time password (OTP) is: <strong>${otp}</strong>. This OTP is valid for 15 minutes.</p>`
        });

        res.status(200).json({ message: 'Registration successful. An OTP has been sent to your email.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const donor = await donorModel.findDonorWithOtp(email, otp);
        if (!donor) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        await donorModel.verifyDonor(donor.id);
        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'An error occurred during verification.' });
    }
};

exports.updateDonorProfile = async (req, res) => {
    const { email, restaurantName, branchName, address, phone, openingHours, foodType, description } = req.body;
    
    try {
        // First update the basic profile
        await donorModel.updateDonorProfile(email, restaurantName, branchName, address, phone, openingHours, foodType, description);
        
        let coords = null;
        
        // Geocode the address with proper fallbacks
        if (address && address.trim()) {
            try {
                console.log(`Geocoding donor address: ${address}`);
                coords = await geocodeAddressWithFallback(address, 'Puducherry', 'Tamil Nadu');
                
                if (coords && coords.lat && coords.lng) {
                    // Get donor to update coordinates
                    const donor = await donorModel.findDonorByEmail(email);
                    
                    if (donor) {
                        // Update coordinates in database
                        await donorModel.updateDonorCoordinates(donor.id, coords.lat, coords.lng);
                        console.log(`✅ Successfully geocoded and saved coordinates: ${coords.lat}, ${coords.lng}`);
                    }
                }
            } catch (geocodeError) {
                console.error('Geocoding failed:', geocodeError);
                // Even if geocoding fails, use default coordinates
                await setDefaultCoordinates(email);
            }
        } else {
            // No address provided, use default coordinates
            await setDefaultCoordinates(email);
        }
        
        res.status(200).json({ 
            message: 'Profile updated successfully with location data.', 
            coordinates: coords 
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: 'An error occurred while updating the profile.' });
    }
};

// Helper function to set default coordinates
async function setDefaultCoordinates(email) {
    try {
        const donor = await donorModel.findDonorByEmail(email);
        if (donor) {
            await donorModel.updateDonorCoordinates(donor.id, 11.9139, 79.8145);
            console.log('✅ Set default Puducherry coordinates');
        }
    } catch (error) {
        console.error('Error setting default coordinates:', error);
    }
}

exports.loginDonor = async (req, res) => {
    const { email, password } = req.body;
    try {
        const donor = await donorModel.findDonorByEmail(email);
        if (!donor) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, donor.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!donor.is_email_verified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        if (donor.status !== 'Approved') {
            return res.status(401).json({ message: 'Your account is not approved yet. Please wait for admin approval.' });
        }

        const token = jwt.sign(
            { donorId: donor.id, email: donor.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            donor: {
                id: donor.id,
                name: donor.name,
                email: donor.email,
                restaurant_name: donor.restaurant_name,
                status: donor.status
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { email } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No file was uploaded.' });
        }

        // multer stored the file; save filename in DB
        const storedFilename = req.file.filename;
        await donorModel.updateDocumentPathAndStatus(email, storedFilename);
        res.status(200).json({ message: 'Document uploaded successfully. Your account is now under review by an admin.' });
    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ message: 'Error saving file.' });
    }
};

// Update donor profile
exports.updateProfile = async (req, res) => {
    try {
        const { email, name, phone, address } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Get donor by email
        const donor = await donorModel.findDonorByEmail(email);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        // Update donor profile
        const updatedDonor = await donorModel.updateBasicProfile(email, { name, phone, address });
        
        res.status(200).json({ 
            message: 'Profile updated successfully', 
            donor: updatedDonor 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Get donor profile with stats
// Get donor profile with stats
exports.getProfile = async (req, res) => {
    try {
        const { email } = req.params;
        console.log('GET /donors/profile received for email:', email);
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Get donor by email
        const donor = await donorModel.findDonorByEmail(email);
        console.log('Database result for email:', email, donor);
        
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        // Calculate stats for the donor
        const totalDonationsResult = await pool.query(
            'SELECT COUNT(*) FROM food_items WHERE donor_id = $1',
            [donor.id]
        );

        const activeListingsResult = await pool.query(
            'SELECT COUNT(*) FROM food_items WHERE donor_id = $1 AND status = $2',
            [donor.id, 'Available']
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedTodayResult = await pool.query(
            'SELECT COUNT(*) FROM food_items WHERE donor_id = $1 AND status = $2 AND created_at >= $3',
            [donor.id, 'Delivered', today]
        );

        // Estimate people helped (assuming 1 food item helps 10 people)
        const peopleHelped = parseInt(totalDonationsResult.rows[0].count) * 10;

        // Return data in the exact format expected by frontend
        const responseData = {
            email: donor.email,
            name: donor.name,
            restaurant_name: donor.restaurant_name,
            address: donor.address,
            phone: donor.phone,
            total_donations: parseInt(totalDonationsResult.rows[0].count),
            people_helped: peopleHelped,
            active_listings: parseInt(activeListingsResult.rows[0].count),
            completed_today: parseInt(completedTodayResult.rows[0].count)
        };
        
        console.log('Sending response:', responseData);
        res.status(200).json(responseData);
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
};

// Debug endpoint to check what data is available
exports.debugProfile = async (req, res) => {
    try {
        const { email } = req.params;
        const donor = await donorModel.findDonorByEmail(email);
        
        console.log('RAW DATABASE RESPONSE:', donor);
        
        res.json({
            message: 'Debug info',
            rawData: donor,
            allFields: {
                id: donor.id,
                name: donor.name,
                email: donor.email,
                restaurant_name: donor.restaurant_name,
                address: donor.address,
                phone: donor.phone,
                branch_name: donor.branch_name,
                opening_hours: donor.opening_hours,
                food_type: donor.food_type,
                description: donor.description,
                status: donor.status
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: error.message });
    }
};