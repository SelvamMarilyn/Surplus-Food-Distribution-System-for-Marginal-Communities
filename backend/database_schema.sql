-- Surplus Food Distribution System Database Schema
-- Run these commands in your PostgreSQL database
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    restaurant_name VARCHAR(255),
    branch_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    opening_hours VARCHAR(255),
    food_type VARCHAR(50),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    is_email_verified BOOLEAN DEFAULT FALSE,
    document_path VARCHAR(255)
);
ALTER TABLE donors ADD COLUMN lat DECIMAL(10,8);
ALTER TABLE donors ADD COLUMN lng DECIMAL(11,8);
ALTER TABLE donors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE donors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE email_verifications (
    donor_id INT NOT NULL REFERENCES donors(id),
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (donor_id)
);

-- 1) NGOs table
CREATE TABLE IF NOT EXISTS ngos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  registration_number VARCHAR(255), -- optional NGO reg number
  address TEXT,
  phone VARCHAR(50),
  is_email_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending / Approved / Rejected / Blocked
  document_path VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ngos ADD COLUMN lat DECIMAL(10,8);
ALTER TABLE ngos ADD COLUMN lng DECIMAL(11,8);
ALTER TABLE ngos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- 2) NGO-specific OTP table (similar to donors' flow)
CREATE TABLE IF NOT EXISTS ngo_email_verifications (
  ngo_id INT NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ngo_id)
);

-- 1. Food Items table (for donor uploads)
CREATE TABLE IF NOT EXISTS food_items (
    id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    description TEXT,
    photo_path VARCHAR(255),
    food_type VARCHAR(50) DEFAULT 'veg', -- veg/non-veg
    status VARCHAR(50) DEFAULT 'Available', -- Available, Requested, Picked Up, Expired
    -- optional coordinates resolved from donor address
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Slum Areas table (for NGO service areas)
CREATE TABLE IF NOT EXISTS slum_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates POINT NOT NULL, -- PostgreSQL POINT type for lat/lng
    population INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NGO Service Areas (linking NGOs to slum areas)
CREATE TABLE IF NOT EXISTS ngo_service_areas (
    id SERIAL PRIMARY KEY,
    ngo_id INT NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
    slum_area_id INT NOT NULL REFERENCES slum_areas(id) ON DELETE CASCADE,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    people_served INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ngo_id, slum_area_id)
);

-- 4. Food Requests table (NGO requests for food)
CREATE TABLE IF NOT EXISTS food_requests (
    id SERIAL PRIMARY KEY,
    food_item_id INT NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    ngo_id INT NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Requested', -- Requested, Approved, Picked Up, Delivered, Cancelled
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    estimated_pickup_time TIMESTAMPTZ,
    delivery_proof_path VARCHAR(255),
    notes TEXT
);

-- 5. Delivery Proofs table (for tracking deliveries)
CREATE TABLE IF NOT EXISTS delivery_proofs (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES food_requests(id) ON DELETE CASCADE,
    photo_path VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 6. System Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- 'donor', 'ngo', 'admin'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_items_donor_id ON food_items(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_status ON food_items(status);
CREATE INDEX IF NOT EXISTS idx_food_items_expiry ON food_items(expiry_time);
CREATE INDEX IF NOT EXISTS idx_food_requests_ngo_id ON food_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_food_requests_status ON food_requests(status);
CREATE INDEX IF NOT EXISTS idx_ngo_service_areas_ngo_id ON ngo_service_areas(ngo_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);


