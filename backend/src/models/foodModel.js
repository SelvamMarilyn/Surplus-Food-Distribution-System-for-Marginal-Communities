const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Food Items
// In foodModel.js
exports.createFoodItem = async (donorId, foodName, quantity, expiryTime, description, photoPath, foodType, lat = null, lng = null) => {
    const query = `
        INSERT INTO food_items 
        (donor_id, food_name, quantity, expiry_time, description, photo_path, food_type, lat, lng)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    
    const values = [donorId, foodName, quantity, expiryTime, description, photoPath, foodType, lat, lng];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};
exports.getAvailableFoodItems = async () => {
    const result = await pool.query(
        `SELECT fi.*, d.name as donor_name, d.restaurant_name, d.address as donor_address, d.phone as donor_phone
         FROM food_items fi
         JOIN donors d ON fi.donor_id = d.id
         WHERE fi.status = 'Available' AND fi.expiry_time > NOW()
         ORDER BY fi.expiry_time ASC`
    );
    return result.rows;
};

exports.getFoodItemsByDonor = async (donorId) => {
    const result = await pool.query(
        `SELECT * FROM food_items WHERE donor_id = $1 ORDER BY created_at DESC`,
        [donorId]
    );
    return result.rows;
};

exports.updateFoodItemStatus = async (foodItemId, status) => {
    const result = await pool.query(
        `UPDATE food_items SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, foodItemId]
    );
    return result.rows[0];
};

exports.getFoodItemById = async (foodItemId) => {
    const result = await pool.query(
        `SELECT fi.*, d.name as donor_name, d.restaurant_name, d.address as donor_address, d.phone as donor_phone
         FROM food_items fi
         JOIN donors d ON fi.donor_id = d.id
         WHERE fi.id = $1`,
        [foodItemId]
    );
    return result.rows[0];
};

// Food Requests
exports.createFoodRequest = async (foodItemId, ngoId, estimatedPickupTime) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Create the request
        const requestResult = await client.query(
            `INSERT INTO food_requests (food_item_id, ngo_id, estimated_pickup_time)
             VALUES ($1, $2, $3) RETURNING *`,
            [foodItemId, ngoId, estimatedPickupTime]
        );
        
        // Update food item status
        await client.query(
            `UPDATE food_items SET status = 'Requested' WHERE id = $1`,
            [foodItemId]
        );
        
        await client.query('COMMIT');
        return requestResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.getFoodRequestsByNgo = async (ngoId) => {
    const result = await pool.query(
        `SELECT fr.*, fi.food_name, fi.quantity, fi.expiry_time, fi.description, fi.photo_path,
                d.name as donor_name, d.restaurant_name, d.address as donor_address, d.phone as donor_phone
         FROM food_requests fr
         JOIN food_items fi ON fr.food_item_id = fi.id
         JOIN donors d ON fi.donor_id = d.id
         WHERE fr.ngo_id = $1
         ORDER BY fr.requested_at DESC`,
        [ngoId]
    );
    return result.rows;
};

exports.updateRequestStatus = async (requestId, status, additionalData = {}) => {
    let query = `UPDATE food_requests SET status = $1`;
    let params = [status, requestId];
    let paramCount = 2;

    if (status === 'Approved' && additionalData.approved_at) {
        query += `, approved_at = $${paramCount + 1}`;
        params.push(additionalData.approved_at);
        paramCount++;
    }
    
    if (status === 'Picked Up' && additionalData.picked_up_at) {
        query += `, picked_up_at = $${paramCount + 1}`;
        params.push(additionalData.picked_up_at);
        paramCount++;
    }
    
    if (status === 'Delivered' && additionalData.delivered_at) {
        query += `, delivered_at = $${paramCount + 1}`;
        params.push(additionalData.delivered_at);
        paramCount++;
    }
    
    if (additionalData.delivery_proof_path) {
        query += `, delivery_proof_path = $${paramCount + 1}`;
        params.push(additionalData.delivery_proof_path);
        paramCount++;
    }

    query += ` WHERE id = $2 RETURNING *`;
    
    const result = await pool.query(query, params);
    return result.rows[0];
};

// Slum Areas
exports.getAllSlumAreas = async () => {
    const result = await pool.query(
        `SELECT id, name,
                (coordinates)[1] AS lat,  -- extract latitude (Y coordinate)
                (coordinates)[0] AS lng,  -- extract longitude (X coordinate)
                population, description, created_at
         FROM slum_areas ORDER BY name`
    );
    return result.rows;
};

exports.createSlumArea = async (name, lat, lng, population, description) => {
    const result = await pool.query(
        `INSERT INTO slum_areas (name, coordinates, population, description)
         VALUES ($1, POINT($2, $3), $4, $5) RETURNING *`,
        [name, lng, lat, population, description]
    );
    return result.rows[0];
};

// NGO Service Areas
exports.getNgoServiceAreas = async (ngoId) => {
    const result = await pool.query(
        `SELECT nsa.*, sa.name as slum_area_name,
                (sa.coordinates)[1] as lat,  -- extract latitude (Y coordinate)
                (sa.coordinates)[0] as lng,  -- extract longitude (X coordinate)
                sa.population
         FROM ngo_service_areas nsa
         JOIN slum_areas sa ON nsa.slum_area_id = sa.id
         WHERE nsa.ngo_id = $1
         ORDER BY sa.name`,
        [ngoId]
    );
    return result.rows;
};

exports.addNgoServiceArea = async (ngoId, slumAreaId, contactPerson, contactPhone) => {
    const result = await pool.query(
        `INSERT INTO ngo_service_areas (ngo_id, slum_area_id, contact_person, contact_phone)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [ngoId, slumAreaId, contactPerson, contactPhone]
    );
    return result.rows[0];
};

// Notifications
exports.createNotification = async (recipientId, recipientType, title, message, type = 'info') => {
    const result = await pool.query(
        `INSERT INTO notifications (recipient_id, recipient_type, title, message, type)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [recipientId, recipientType, title, message, type]
    );
    return result.rows[0];
};

exports.getNotifications = async (recipientId, recipientType) => {
    const result = await pool.query(
        `SELECT * FROM notifications 
         WHERE recipient_id = $1 AND recipient_type = $2 
         ORDER BY created_at DESC LIMIT 50`,
        [recipientId, recipientType]
    );
    return result.rows;
};

exports.markNotificationAsRead = async (notificationId) => {
    const result = await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
        [notificationId]
    );
    return result.rows[0];
};

// Get food items without coordinates
exports.getFoodItemsWithoutCoordinates = async () => {
    const query = `
        SELECT * FROM food_items 
        WHERE (lat IS NULL OR lng IS NULL) 
        AND status != 'Expired'
    `;
    
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Update food item coordinates
exports.updateFoodItemCoordinates = async (foodItemId, lat, lng) => {
    const query = `
        UPDATE food_items 
        SET lat = $1, lng = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
    `;
    
    const values = [lat, lng, foodItemId];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};