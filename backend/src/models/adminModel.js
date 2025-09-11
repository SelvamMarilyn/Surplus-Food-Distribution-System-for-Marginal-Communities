const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to create the admin_users table and a default admin account
const setupAdmin = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        // Check if a default admin user exists
        const res = await client.query("SELECT * FROM admin_users WHERE username = 'admin'");
        if (res.rowCount === 0) {
            const hashedPassword = await bcrypt.hash('password', 10);
            await client.query("INSERT INTO admin_users(username, password) VALUES('admin', $1)", [hashedPassword]);
            console.log("Default admin account created: username 'admin', password 'password'");
        }
    } catch (err) {
        console.error('Database setup error:', err.message);
    } finally {
        client.release();
    }
};

// Call the setup function when the module is loaded
setupAdmin();

const getPendingDonors = () => {
    // Corrected to look for 'Under Review' status
    return pool.query("SELECT * FROM donors WHERE status = 'Under Review'");
};

// Change: Add a function to get all donors
const getAllDonors = () => {
    return pool.query("SELECT * FROM donors ORDER BY status ASC, id ASC");
};

const approveDonor = (id) => {
    return pool.query("UPDATE donors SET status = 'Approved' WHERE id = $1 RETURNING id", [id]);
};

const rejectDonor = (id) => {
    // Updated to set status to 'Rejected'
    return pool.query("UPDATE donors SET status = 'Rejected' WHERE id = $1 RETURNING id", [id]);
};

const findAdminByUsername = (username) => {
    return pool.query("SELECT * FROM admin_users WHERE username = $1", [username]);
};
const blockDonor = (id) => {
    return pool.query("UPDATE donors SET status = 'Blocked' WHERE id = $1 RETURNING id", [id]);
};

const deleteDonor = (id) => {
    return pool.query("DELETE FROM donors WHERE id = $1 RETURNING id", [id]);
};

const unblockDonor = (id) => {
    return pool.query("UPDATE donors SET status = 'Approved' WHERE id = $1 RETURNING id", [id]);
};
const getAllNgos = () => {
  return pool.query("SELECT * FROM ngos ORDER BY status ASC, id ASC");
};

const approveNgo = (id) => {
  return pool.query("UPDATE ngos SET status = 'Approved' WHERE id = $1 RETURNING id", [id]);
};

const rejectNgo = (id) => {
  return pool.query("UPDATE ngos SET status = 'Rejected' WHERE id = $1 RETURNING id", [id]);
};

const blockNgo = (id) => {
  return pool.query("UPDATE ngos SET status = 'Blocked' WHERE id = $1 RETURNING id", [id]);
};

const unblockNgo = (id) => {
  return pool.query("UPDATE ngos SET status = 'Approved' WHERE id = $1 RETURNING id", [id]);
};

const deleteNgo = (id) => {
  return pool.query("DELETE FROM ngos WHERE id = $1 RETURNING id", [id]);
};


module.exports = {
    getPendingDonors,
    // Change: Export the new function
    getAllDonors,
    approveDonor,
    rejectDonor,
    findAdminByUsername,
    blockDonor,
    deleteDonor,
    unblockDonor,
    getAllNgos,
    approveNgo,
    rejectNgo,
    blockNgo,
    unblockNgo,
    deleteNgo,
};