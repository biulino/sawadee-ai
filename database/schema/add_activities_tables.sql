-- Add missing activities and activity_reservations tables
-- This script addresses the schema validation error in Spring Boot

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    capacity INTEGER,
    available_slots INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    hotel_id BIGINT,
    CONSTRAINT fk_activities_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- Create activity_reservations table
CREATE TABLE IF NOT EXISTS activity_reservations (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    number_of_participants INTEGER DEFAULT 1,
    special_requests TEXT,
    total_price DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(100),
    payment_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'CREATED',
    hotel_reservation_id BIGINT,
    activity_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_activity_reservations_hotel_reservation FOREIGN KEY (hotel_reservation_id) REFERENCES reservations(id),
    CONSTRAINT fk_activity_reservations_activity FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_hotel_id ON activities(hotel_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities(start_time);

CREATE INDEX IF NOT EXISTS idx_activity_reservations_activity_id ON activity_reservations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_reservations_hotel_reservation_id ON activity_reservations(hotel_reservation_id);
CREATE INDEX IF NOT EXISTS idx_activity_reservations_status ON activity_reservations(status);
CREATE INDEX IF NOT EXISTS idx_activity_reservations_email ON activity_reservations(email);

-- Insert sample activities for existing hotels
INSERT INTO activities (name, description, price, capacity, available_slots, start_time, end_time, status, hotel_id) VALUES
-- Activities for Hotel Sawadee (id = 1)
('Thai Cooking Class', 'Learn to cook authentic Thai dishes with our professional chef', 75.00, 12, 8, '2024-01-15 10:00:00', '2024-01-15 13:00:00', 'ACTIVE', 1),
('Temple Tour Bangkok', 'Visit the most famous temples in Bangkok including Wat Pho and Grand Palace', 45.00, 20, 15, '2024-01-16 09:00:00', '2024-01-16 17:00:00', 'ACTIVE', 1),
('Traditional Thai Massage', 'Relax with an authentic Thai massage by certified therapists', 60.00, 8, 5, '2024-01-17 14:00:00', '2024-01-17 16:00:00', 'ACTIVE', 1),
('Floating Market Tour', 'Experience the vibrant floating markets of Bangkok', 35.00, 15, 12, '2024-01-18 08:00:00', '2024-01-18 12:00:00', 'ACTIVE', 1),
('Muay Thai Show', 'Watch an exciting traditional Muay Thai boxing match', 25.00, 50, 30, '2024-01-19 19:00:00', '2024-01-19 21:00:00', 'ACTIVE', 1),

-- Activities for Hotel Palace (id = 2) 
('City Walking Tour', 'Explore the historic city center with our knowledgeable guide', 30.00, 25, 20, '2024-01-15 10:00:00', '2024-01-15 14:00:00', 'ACTIVE', 2),
('Wine Tasting Evening', 'Sample premium local wines with expert sommelier', 85.00, 16, 10, '2024-01-16 18:00:00', '2024-01-16 21:00:00', 'ACTIVE', 2),
('Art Gallery Tour', 'Visit the finest art galleries and museums in the city', 40.00, 20, 18, '2024-01-17 11:00:00', '2024-01-17 15:00:00', 'ACTIVE', 2),
('Cooking Workshop', 'Learn to prepare gourmet dishes with our executive chef', 95.00, 10, 6, '2024-01-18 16:00:00', '2024-01-18 19:00:00', 'ACTIVE', 2),
('Live Jazz Concert', 'Enjoy an intimate jazz performance in our lounge', 35.00, 40, 25, '2024-01-19 20:00:00', '2024-01-19 22:30:00', 'ACTIVE', 2);

-- Add sample activity reservations
INSERT INTO activity_reservations (full_name, email, phone, number_of_participants, total_price, payment_status, status, activity_id) VALUES
('John Smith', 'john.smith@email.com', '+1234567890', 2, 150.00, 'PAID', 'CONFIRMED', 1),
('Maria Garcia', 'maria.garcia@email.com', '+1987654321', 1, 45.00, 'PAID', 'CONFIRMED', 2),
('David Johnson', 'david.johnson@email.com', '+1122334455', 3, 180.00, 'PENDING', 'CREATED', 1),
('Sarah Wilson', 'sarah.wilson@email.com', '+1555666777', 2, 120.00, 'PAID', 'CONFIRMED', 3),
('Ahmed Al-Rashid', 'ahmed.rashid@email.com', '+1888999000', 1, 85.00, 'PAID', 'CONFIRMED', 7);

COMMIT;
