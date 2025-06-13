-- Test hotel data for Nevşehir to make the AI agent functional
-- Insert test hotels in Nevşehir

-- Hotel 1: Grand Hotel Nevşehir
INSERT INTO hotels (id, name, description, address, city, country, phone, email, website, star_rating, amenities, latitude, longitude) 
VALUES (
    1, 
    'Grand Hotel Nevşehir', 
    'Luxurious hotel in the heart of Cappadocia with panoramic views of fairy chimneys and modern amenities.',
    'Atatürk Bulvarı No:123, Merkez',
    'Nevşehir',
    'Turkey',
    '+90 384 213 4567',
    'info@grandhotelnevsehir.com',
    'www.grandhotelnevsehir.com',
    5,
    ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking', 'Room Service'],
    38.6244,
    34.7236
) ON CONFLICT (id) DO NOTHING;

-- Hotel 2: Cappadocia Cave Resort
INSERT INTO hotels (id, name, description, address, city, country, phone, email, website, star_rating, amenities, latitude, longitude)
VALUES (
    2,
    'Cappadocia Cave Resort',
    'Authentic cave hotel experience with traditional stone architecture and modern comfort.',
    'Göreme Yolu No:45, Merkez',
    'Nevşehir', 
    'Turkey',
    '+90 384 271 2345',
    'reservation@caveresort.com',
    'www.cappadociacaveresort.com',
    4,
    ARRAY['WiFi', 'Restaurant', 'Bar', 'Terrace', 'Concierge', 'Tours'],
    38.6387,
    34.8403
) ON CONFLICT (id) DO NOTHING;

-- Hotel 3: Fairy Chimney Hotel
INSERT INTO hotels (id, name, description, address, city, country, phone, email, website, star_rating, amenities, latitude, longitude)
VALUES (
    3,
    'Fairy Chimney Hotel',
    'Boutique hotel with stunning views of the famous fairy chimneys and underground cities.',
    'Ürgüp Caddesi No:78, Merkez',
    'Nevşehir',
    'Turkey', 
    '+90 384 341 5678',
    'info@fairychimneyhotel.com',
    'www.fairychimneyhotel.com',
    4,
    ARRAY['WiFi', 'Restaurant', 'Parking', 'Airport Transfer', 'Hot Air Balloon Tours'],
    38.6186,
    34.7528
) ON CONFLICT (id) DO NOTHING;

-- Hotel 4: Cappadocia Palace
INSERT INTO hotels (id, name, description, address, city, country, phone, email, website, star_rating, amenities, latitude, longitude)
VALUES (
    4,
    'Cappadocia Palace',
    'Modern palace-style hotel offering luxury accommodation with traditional Cappadocian hospitality.',
    'Kapadokya Caddesi No:156, Merkez',
    'Nevşehir',
    'Turkey',
    '+90 384 284 9012',
    'palace@cappadociapalace.com', 
    'www.cappadociapalace.com',
    5,
    ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking', 'Room Service', 'Conference Rooms'],
    38.6312,
    34.7189
) ON CONFLICT (id) DO NOTHING;

-- Insert rooms for the hotels
-- Hotel 1 rooms
INSERT INTO rooms (id, hotel_id, room_number, room_type, description, price_per_night, max_occupancy, amenities, is_available)
VALUES 
    (1, 1, '101', 'DELUXE', 'Spacious deluxe room with city view', 250.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe'], true),
    (2, 1, '102', 'SUITE', 'Luxury suite with panoramic view', 450.00, 4, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Balcony'], true),
    (3, 1, '201', 'STANDARD', 'Comfortable standard room', 180.00, 2, ARRAY['WiFi', 'TV', 'Safe'], true)
ON CONFLICT (id) DO NOTHING;

-- Hotel 2 rooms  
INSERT INTO rooms (id, hotel_id, room_number, room_type, description, price_per_night, max_occupancy, amenities, is_available)
VALUES
    (4, 2, 'C1', 'CAVE_ROOM', 'Authentic cave room experience', 320.00, 2, ARRAY['WiFi', 'TV', 'Safe'], true),
    (5, 2, 'C2', 'CAVE_SUITE', 'Luxury cave suite with terrace', 480.00, 3, ARRAY['WiFi', 'TV', 'Safe', 'Terrace'], true)
ON CONFLICT (id) DO NOTHING;

-- Hotel 3 rooms
INSERT INTO rooms (id, hotel_id, room_number, room_type, description, price_per_night, max_occupancy, amenities, is_available)
VALUES
    (6, 3, '301', 'STANDARD', 'Standard room with chimney view', 200.00, 2, ARRAY['WiFi', 'TV', 'Safe'], true),
    (7, 3, '302', 'DELUXE', 'Deluxe room with balcony', 280.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Balcony'], true)
ON CONFLICT (id) DO NOTHING;

-- Hotel 4 rooms
INSERT INTO rooms (id, hotel_id, room_number, room_type, description, price_per_night, max_occupancy, amenities, is_available)
VALUES
    (8, 4, '401', 'DELUXE', 'Palace deluxe room', 300.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe'], true),
    (9, 4, '402', 'SUITE', 'Royal suite with spa access', 500.00, 4, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Spa Access'], true),
    (10, 4, '501', 'PRESIDENTIAL', 'Presidential suite with all amenities', 800.00, 6, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Balcony', 'Butler Service'], true)
ON CONFLICT (id) DO NOTHING;
