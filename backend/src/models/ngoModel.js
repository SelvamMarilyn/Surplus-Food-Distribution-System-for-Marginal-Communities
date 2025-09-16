// models/ngoModel.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create basic functions for NGO registration flow
exports.findNgoByEmail = (email) => {
  return pool.query('SELECT * FROM ngos WHERE email = $1', [email]);
};

exports.createNgo = async ({ name, email, password }) => {
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO ngos (name, email, password_hash, status)
     VALUES ($1, $2, $3, 'Pending') RETURNING id, name, email, status`,
    [name, email, hashed]
  );
  return result;
};

exports.saveOtp = async (ngoId, otp) => {
  await pool.query(
    `INSERT INTO ngo_email_verifications (ngo_id, otp, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
     ON CONFLICT (ngo_id) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
    [ngoId, otp]
  );
};

exports.findNgoWithOtp = async (email, otp) => {
  const result = await pool.query(
    `SELECT n.id FROM ngos n
     JOIN ngo_email_verifications ev ON n.id = ev.ngo_id
     WHERE n.email = $1 AND ev.otp = $2 AND ev.expires_at > NOW()`,
    [email, otp]
  );
  return result;
};

exports.verifyNgo = async (ngoId) => {
  await pool.query('UPDATE ngos SET is_email_verified = TRUE WHERE id = $1', [ngoId]);
  await pool.query('DELETE FROM ngo_email_verifications WHERE ngo_id = $1', [ngoId]);
};

exports.updateNgoProfile = async (email, { registrationNumber, address, phone }) => {
  return pool.query(
    `UPDATE ngos SET registration_number = $1, address = $2, phone = $3 WHERE email = $4 RETURNING *`,
    [registrationNumber, address, phone, email]
  );
};

exports.updateDocumentPathAndStatus = async (email, documentPath) => {
  return pool.query(
    `UPDATE ngos SET document_path = $1, status = 'Under Review' WHERE email = $2 RETURNING *`,
    [documentPath, email]
  );
};

exports.findNgoById = (id) => {
  return pool.query('SELECT * FROM ngos WHERE id = $1', [id]);
};

// Replace the existing getNgos function with this:
exports.getNgos = async () => {
    const result = await pool.query(`
        SELECT 
            id, 
            name, 
            email, 
            registration_number,
            address, 
            phone,
            status,
            lat,
            lng,
            created_at
        FROM ngos 
        WHERE status = 'Approved' 
        AND is_email_verified = TRUE
        ORDER BY name ASC
    `);
    return result.rows;
};

// Add this function for getting approved NGOs
exports.getAllApprovedNgos = async () => {
    const result = await pool.query(`
        SELECT 
            id, 
            name, 
            email, 
            registration_number,
            address, 
            phone,
            status,
            lat,
            lng,
            created_at
        FROM ngos 
        WHERE status = 'Approved' 
        AND is_email_verified = TRUE
        ORDER BY name ASC
    `);
    return result.rows;
};

// Update NGO coordinates (for caching geocoded results)
// Add this method to your existing ngoModel.js

// Update NGO coordinates
exports.updateNgoCoordinates = async (ngoId, lat, lng) => {
    const query = `
        UPDATE ngos 
        SET lat = $1, lng = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
    `;
    
    const values = [lat, lng, ngoId];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};
// Get NGOs without coordinates
exports.getNgosWithoutCoordinates = async () => {
    const result = await pool.query(`
        SELECT * FROM ngos 
        WHERE address IS NOT NULL 
        AND address != '' 
        AND (lat IS NULL OR lng IS NULL)
    `);
    return result.rows;
};
// Get active requests count for NGO
exports.getActiveRequestsCount = async (ngoId) => {
  const query = `
    SELECT COUNT(*) FROM food_requests 
    WHERE ngo_id = $1 AND status = 'Requested'
  `;
  
  try {
    const result = await pool.query(query, [ngoId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    throw error;
  }
};

// Get people served count (estimate)
exports.getPeopleServedCount = async (ngoId) => {
  const query = `
    SELECT COUNT(*) as delivery_count 
    FROM food_requests 
    WHERE ngo_id = $1 AND status = 'Delivered'
  `;
  
  try {
    const result = await pool.query(query, [ngoId]);
    const deliveryCount = parseInt(result.rows[0].delivery_count);
    return deliveryCount * 10; // Estimate 10 people per delivery
  } catch (error) {
    throw error;
  }
};
exports.findNgoByEmail = async (email) => {
  return await pool.query(
    'SELECT * FROM ngos WHERE email = $1',
    [email]
  );
};
// models/ngoModel.js
exports.updateCompleteProfile = async (email, { name, registrationNumber, address, phone }) => {
  const query = `
    UPDATE ngos
    SET 
      name = $1,
      registration_number = $2,
      address = $3,
      phone = $4,
      updated_at = NOW()
    WHERE email = $5
    RETURNING *
  `;
  
  const values = [name, registrationNumber, address, phone, email];
  
  try {
    const result = await pool.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};
