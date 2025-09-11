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
