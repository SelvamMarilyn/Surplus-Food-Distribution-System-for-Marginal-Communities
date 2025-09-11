const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

exports.findDonorById = async (id) => {
    const result = await pool.query('SELECT * FROM donors WHERE id = $1', [id]);
    return result;
};


// In donorModel.js, ensure your findDonorByEmail function returns all fields
exports.findDonorByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM donors WHERE email = $1', [email]);
    return result.rows[0]; // This should return all columns from donors table
};
// Reverted to only creating the initial donor record with basic info
exports.createDonor = async (name, email, hashedPassword) => {
    const result = await pool.query(
        `INSERT INTO donors (name, email, password_hash, status, is_email_verified)
         VALUES ($1, $2, $3, 'Pending', FALSE) RETURNING id`,
        [name, email, hashedPassword]
    );
    return result.rows[0].id;
};

exports.saveOtp = async (donorId, otp) => {
    await pool.query(
        `INSERT INTO email_verifications (donor_id, otp, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
         ON CONFLICT (donor_id) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
        [donorId, otp]
    );
};

exports.findDonorWithOtp = async (email, otp) => {
    const result = await pool.query(
        `SELECT d.id FROM donors d
         JOIN email_verifications ev ON d.id = ev.donor_id
         WHERE d.email = $1 AND ev.otp = $2 AND ev.expires_at > NOW()`,
        [email, otp]
    );
    return result.rows[0];
};

// The function to update the donor's profile with restaurant details is already correct
exports.updateDonorProfile = async (email, restaurantName, branchName, address, phone, openingHours, foodType, description) => {
    await pool.query(
        `UPDATE donors SET restaurant_name = $1, branch_name = $2, address = $3, phone = $4, opening_hours = $5, food_type = $6, description = $7
         WHERE email = $8`,
        [restaurantName, branchName, address, phone, openingHours, foodType, description, email]
    );
};

exports.verifyDonor = async (donorId) => {
    await pool.query('UPDATE donors SET is_email_verified = TRUE WHERE id = $1', [donorId]);
    await pool.query('DELETE FROM email_verifications WHERE donor_id = $1', [donorId]);
};

exports.updateDocumentPathAndStatus = async (email, documentPath) => {
    await pool.query(
        `UPDATE donors SET document_path = $1, status = 'Under Review' WHERE email = $2`,
        [documentPath, email]
    );
};

// Update basic donor profile info (name, phone, address)
// REPLACE the existing updateBasicProfile function with this:
exports.updateBasicProfile = async (email, profileData) => {
    const { name, phone, address } = profileData;
    const result = await pool.query(
        `UPDATE donors 
         SET restaurant_name = $1, phone = $2, address = $3 
         WHERE email = $4 
         RETURNING *`,
        [name, phone, address, email]
    );
    return result.rows[0];
};

// Add these methods to your donorModel.js

// Get all restaurants (donors with restaurant_name not null)
// Get all restaurants (donors with restaurant_name not null)
exports.getRestaurants = async () => {
    const result = await pool.query(`
        SELECT 
            id, 
            name, 
            email, 
            restaurant_name, 
            branch_name, 
            address, 
            phone, 
            opening_hours, 
            food_type, 
            description, 
            status,
            lat,
            lng,
            created_at
        FROM donors 
        WHERE restaurant_name IS NOT NULL 
        AND restaurant_name != '' 
        AND status = 'Approved'
        ORDER BY restaurant_name ASC
    `);
    return result.rows;
};
// Update donor coordinates (for caching geocoded results)
exports.updateDonorCoordinates = async (donorId, lat, lng) => {
    const result = await pool.query(`
        UPDATE donors 
        SET lat = $1, lng = $2, updated_at = NOW() 
        WHERE id = $3 
        RETURNING id, restaurant_name, lat, lng
    `, [lat, lng, donorId]);
    return result.rows[0];
};

// Get restaurant by ID
exports.getRestaurantById = async (id) => {
    const result = await pool.query(`
        SELECT 
            id, 
            name, 
            email, 
            restaurant_name, 
            branch_name, 
            address, 
            phone, 
            opening_hours, 
            food_type, 
            description, 
            status,
            lat,
            lng
        FROM donors 
        WHERE id = $1 AND restaurant_name IS NOT NULL
    `, [id]);
    return result.rows[0];
};