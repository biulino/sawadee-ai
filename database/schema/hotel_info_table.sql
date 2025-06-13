-- Hotel Information Configuration Table
-- This table stores configurable hotel information for AI chat agent responses

CREATE TABLE IF NOT EXISTS hotel_info (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    operating_hours JSONB,
    amenities JSONB,
    policies JSONB,
    location JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_hotel_info_tenant UNIQUE (tenant_id),
    CONSTRAINT fk_hotel_info_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hotel_info_tenant_id ON hotel_info(tenant_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_hotel_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hotel_info_updated_at
    BEFORE UPDATE ON hotel_info
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_info_updated_at();

-- Sample data for SawadeeAI Hotel (tenant_id = 1)
INSERT INTO hotel_info (
    tenant_id, 
    name, 
    address, 
    phone, 
    email, 
    website, 
    description,
    operating_hours,
    amenities,
    policies,
    location
) VALUES (
    1,
    'SawadeeAI Cappadocia Hotel',
    'Göreme Mah. Müze Cad. No:25, 50180 Göreme/Nevşehir, Turkey',
    '+90 384 271 2525',
    'info@sawadeeaicappadocia.com',
    'https://www.sawadeeaicappadocia.com',
    'Experience the magic of Cappadocia at SawadeeAI Hotel, nestled in the heart of Göreme. Our boutique hotel offers stunning cave rooms with panoramic valley views, traditional Turkish hospitality, and modern amenities.',
    '{"reception": "24/7", "restaurant": "07:00 - 23:00", "spa": "09:00 - 21:00", "pool": "06:00 - 22:00", "gym": "06:00 - 23:00", "roomService": "24/7", "concierge": "08:00 - 20:00"}',
    '["Free Wi-Fi", "Swimming Pool", "Spa & Wellness Center", "Fitness Center", "Restaurant & Bar", "24/7 Room Service", "Concierge Service", "Airport Shuttle", "Hot Air Balloon Tours", "Cave Rooms", "Terrace with Valley View", "Traditional Turkish Bath", "Bicycle Rental", "Laundry Service", "Business Center", "Pet Friendly", "Parking", "Air Conditioning", "Heating", "Safe Deposit Box"]',
    '{"checkIn": "15:00", "checkOut": "12:00", "cancellation": "Free cancellation up to 24 hours before arrival. Late cancellations may incur charges.", "petPolicy": "Pets are welcome with prior notification. Additional cleaning fee may apply.", "smokingPolicy": "Non-smoking hotel. Designated smoking areas available in outdoor terraces.", "childrenPolicy": "Children of all ages are welcome. Extra bed available for children under 12."}',
    '{"latitude": 38.6431, "longitude": 34.8268, "city": "Göreme", "country": "Turkey", "timezone": "Europe/Istanbul"}'
) ON CONFLICT (tenant_id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    operating_hours = EXCLUDED.operating_hours,
    amenities = EXCLUDED.amenities,
    policies = EXCLUDED.policies,
    location = EXCLUDED.location,
    updated_at = CURRENT_TIMESTAMP;

-- Sample data for Kapadokya Hotel (tenant_id = 2) 
INSERT INTO hotel_info (
    tenant_id, 
    name, 
    address, 
    phone, 
    email, 
    website, 
    description,
    operating_hours,
    amenities,
    policies,
    location
) VALUES (
    2,
    'Kapadokya Cave Resort',
    'Ürgüp Mah. Kayseri Cad. No:15, 50400 Ürgüp/Nevşehir, Turkey',
    '+90 384 341 4040',
    'reservations@kapadokyacave.com',
    'https://www.kapadokyacaveresort.com',
    'Discover the ancient beauty of Cappadocia at Kapadokya Cave Resort. Our luxury cave suites offer an authentic experience with modern comfort, overlooking the fairy chimneys and valleys.',
    '{"reception": "24/7", "restaurant": "07:00 - 22:30", "spa": "10:00 - 20:00", "pool": "07:00 - 21:00", "gym": "24/7", "roomService": "06:00 - 24:00", "concierge": "07:00 - 22:00"}',
    '["Free Wi-Fi", "Outdoor Pool", "Spa Services", "Fitness Center", "Fine Dining Restaurant", "Room Service", "Tour Desk", "Airport Transfer", "Balloon Tour Packages", "Cave Architecture", "Panoramic Terraces", "Turkish Bath", "Horse Riding", "ATV Tours", "Wine Cellar", "Pet Friendly", "Valet Parking", "Climate Control", "Minibar", "In-room Safe"]',
    '{"checkIn": "14:00", "checkOut": "11:00", "cancellation": "Flexible cancellation policy. Free cancellation up to 48 hours before check-in.", "petPolicy": "Small pets allowed with advance notice. Pet fee applies.", "smokingPolicy": "Completely smoke-free property. Smoking permitted only in designated outdoor areas.", "childrenPolicy": "Family-friendly. Children under 6 stay free when using existing bedding."}',
    '{"latitude": 38.6247, "longitude": 34.9119, "city": "Ürgüp", "country": "Turkey", "timezone": "Europe/Istanbul"}'
) ON CONFLICT (tenant_id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    operating_hours = EXCLUDED.operating_hours,
    amenities = EXCLUDED.amenities,
    policies = EXCLUDED.policies,
    location = EXCLUDED.location,
    updated_at = CURRENT_TIMESTAMP;
