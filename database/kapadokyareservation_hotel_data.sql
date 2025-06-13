-- Test data for KapadokyaReservation Hotel (Single Hotel SaaS)
-- This is the main hotel that the SaaS serves

-- Insert the main hotel: KapadokyaReservation
INSERT INTO hotels (id, name, description, address, city, country, phone, email, website, star_rating, amenities, latitude, longitude) 
VALUES (
    4, 
    'KapadokyaReservation Hotel', 
    'Luxury cave hotel in the heart of Cappadocia offering authentic Turkish hospitality with modern amenities and stunning fairy chimney views.',
    'Göreme Mahallesi, Müze Caddesi No:1, Nevşehir Merkez',
    'Nevşehir',
    'Turkey',
    '+90 384 271 2525',
    'reservations@kapadokyareservation.com',
    'www.kapadokyareservation.com',
    5,
    ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Parking', 'Room Service', 'Concierge', 'Hot Air Balloon Tours', 'Airport Transfer'],
    38.6387,
    34.8403
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    star_rating = EXCLUDED.star_rating,
    amenities = EXCLUDED.amenities,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;

-- Insert rooms for KapadokyaReservation Hotel
INSERT INTO rooms (id, hotel_id, room_number, room_type, description, price_per_night, max_occupancy, amenities, is_available)
VALUES 
    -- Cave Rooms
    (4, 4, 'C101', 'DELUXE', 'Authentic cave room with modern amenities and fairy chimney view', 280.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Cave Architecture'], true),
    (5, 4, 'C102', 'SUITE', 'Luxury cave suite with private terrace and panoramic valley view', 450.00, 4, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Terrace', 'Valley View'], true),
    (6, 4, 'C201', 'STANDARD', 'Comfortable cave room with traditional stone architecture', 200.00, 2, ARRAY['WiFi', 'TV', 'Safe', 'Traditional Decor'], true),
    (7, 4, 'C202', 'DELUXE', 'Spacious cave room with jacuzzi and courtyard view', 320.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Jacuzzi'], true),
    (8, 4, 'C301', 'PRESIDENTIAL', 'Presidential cave suite with private pool and butler service', 800.00, 6, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Private Pool', 'Butler Service', 'Panoramic View'], true),
    
    -- Standard Hotel Rooms  
    (9, 4, 'H101', 'STANDARD', 'Modern hotel room with garden view', 180.00, 2, ARRAY['WiFi', 'TV', 'Safe', 'Garden View'], true),
    (10, 4, 'H102', 'DELUXE', 'Deluxe hotel room with balcony and mountain view', 250.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Balcony', 'Mountain View'], true),
    (11, 4, 'H201', 'SUITE', 'Family suite with separate living area', 380.00, 4, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Living Area', 'Family Friendly'], true),
    (12, 4, 'H202', 'DELUXE', 'Honeymoon deluxe room with romantic decor', 300.00, 2, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Romantic Decor', 'Special Amenities'], true),
    (13, 4, 'H301', 'SUITE', 'Executive suite with work area and city view', 420.00, 3, ARRAY['WiFi', 'TV', 'Minibar', 'Safe', 'Work Area', 'City View'], true)
ON CONFLICT (id) DO UPDATE SET
    hotel_id = EXCLUDED.hotel_id,
    room_number = EXCLUDED.room_number,
    room_type = EXCLUDED.room_type,
    description = EXCLUDED.description,
    price_per_night = EXCLUDED.price_per_night,
    max_occupancy = EXCLUDED.max_occupancy,
    amenities = EXCLUDED.amenities,
    is_available = EXCLUDED.is_available;
