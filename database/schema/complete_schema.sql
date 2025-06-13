-- Complete Database Schema for KapadokyaReservation
-- Execute this after setting up PostgreSQL

-- Existing tables (to be created if not exists)
CREATE TABLE IF NOT EXISTS hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    amenities TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(id),
    room_number VARCHAR(10) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL,
    max_occupancy INTEGER NOT NULL,
    amenities TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    hotel_id BIGINT REFERENCES hotels(id),
    room_id BIGINT REFERENCES rooms(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Landing Page Configuration
CREATE TABLE landing_page_config (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(id),
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'json', 'boolean'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, config_key)
);

-- NEW: Landing Page Banners
CREATE TABLE landing_page_banners (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(id),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(500),
    cta_text VARCHAR(100),
    cta_link VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Service Shortcuts Configuration
CREATE TABLE service_shortcuts (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(id),
    service_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    color_code VARCHAR(7), -- hex color
    link_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT REFERENCES reservations(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: User Preferences for AI
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    preferred_amenities TEXT[],
    budget_range_min DECIMAL(10,2),
    budget_range_max DECIMAL(10,2),
    preferred_room_types TEXT[],
    location_preferences TEXT[],
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: AI Conversation History
CREATE TABLE conversation_history (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100),
    entities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- NEW: Hotel Reviews
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(id),
    user_id VARCHAR(255) NOT NULL,
    reservation_id BIGINT REFERENCES reservations(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Check-in Records
CREATE TABLE checkin_records (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT REFERENCES reservations(id),
    user_id VARCHAR(255) NOT NULL,
    passport_image_url VARCHAR(500),
    passport_data JSONB, -- extracted MRZ data
    faceio_session_id VARCHAR(255),
    liveness_check_result JSONB,
    checkin_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    checkin_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEW: Activity Reservations
CREATE TABLE activity_reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    hotel_id BIGINT REFERENCES hotels(id),
    activity_name VARCHAR(255) NOT NULL,
    activity_date DATE NOT NULL,
    activity_time TIME,
    participant_count INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default landing page configuration
INSERT INTO landing_page_config (hotel_id, config_key, config_value, config_type) VALUES
(1, 'hotel_title', 'Hotel California', 'text'),
(1, 'welcome_heading', 'Hello, what would you like to discover today?', 'text'),
(1, 'welcome_subtitle', 'Select an action or search for specific information.', 'text'),
(1, 'assistant_prompt', 'Can''t find what you''re looking for?', 'text'),
(1, 'assistant_button_text', 'Chat with the assistant', 'text'),
(1, 'primary_color', '#6366f1', 'text'),
(1, 'secondary_color', '#8b5cf6', 'text');

-- Insert default service shortcuts
INSERT INTO service_shortcuts (hotel_id, service_name, display_name, description, icon_name, color_code, link_url, display_order) VALUES
(1, 'restaurant', 'Restaurant', 'Menu and opening hours', 'book', '#fb923c', '/restaurant', 1),
(1, 'room_service', 'Meals', 'Room service', 'shopping-cart', '#f87171', '/room-service', 2),
(1, 'reservation', 'Reservation', 'Stay details', 'calendar', '#60a5fa', '/reservations', 3),
(1, 'profile', 'My Profile', 'Sign in', 'user', '#a78bfa', '/profile', 4),
(1, 'spa', 'Spas', 'Wellness nearby', 'play', '#34d399', '/spa', 5),
(1, 'news', 'News', 'Local news', 'newspaper', '#4ade80', '/news', 6);
