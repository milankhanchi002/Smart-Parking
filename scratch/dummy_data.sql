-- Smart Parking Dummy Data Generation Script
-- Generates parking slots for 10 distinct locations across 5 cities.
-- Includes exact city names to ensure frontend search compatibility.
-- 'booked_by' is kept NULL to respect the users foreign key constraint since user data is omitted.

-- 1. Clear existing slots to avoid UNIQUE constraint violations if run multiple times
TRUNCATE TABLE slots RESTART IDENTITY CASCADE;

-- Insert slots for Chandigarh
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Chandigarh', false, NULL, NULL, NULL, 30.7333, 76.7794),
(2, 'Chandigarh', false, NULL, NULL, NULL, 30.7333, 76.7794),
(3, 'Chandigarh', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 30.7333, 76.7794),
(4, 'Chandigarh', false, NULL, NULL, NULL, 30.7333, 76.7794),
(5, 'Chandigarh', false, NULL, NULL, NULL, 30.7333, 76.7794),
(6, 'Chandigarh', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 30.7333, 76.7794);

-- Insert slots for Chandigarh - Elante Mall
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Chandigarh - Elante Mall', false, NULL, NULL, NULL, 30.7055, 76.8013),
(2, 'Chandigarh - Elante Mall', false, NULL, NULL, NULL, 30.7055, 76.8013),
(3, 'Chandigarh - Elante Mall', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 30.7055, 76.8013),
(4, 'Chandigarh - Elante Mall', false, NULL, NULL, NULL, 30.7055, 76.8013),
(5, 'Chandigarh - Elante Mall', false, NULL, NULL, NULL, 30.7055, 76.8013),
(6, 'Chandigarh - Elante Mall', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 30.7055, 76.8013);

-- Insert slots for Mohali
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Mohali', false, NULL, NULL, NULL, 30.7046, 76.7179),
(2, 'Mohali', false, NULL, NULL, NULL, 30.7046, 76.7179),
(3, 'Mohali', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 30.7046, 76.7179),
(4, 'Mohali', false, NULL, NULL, NULL, 30.7046, 76.7179),
(5, 'Mohali', false, NULL, NULL, NULL, 30.7046, 76.7179),
(6, 'Mohali', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 30.7046, 76.7179);

-- Insert slots for Mohali - VR Punjab
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Mohali - VR Punjab', false, NULL, NULL, NULL, 30.7414, 76.6543),
(2, 'Mohali - VR Punjab', false, NULL, NULL, NULL, 30.7414, 76.6543),
(3, 'Mohali - VR Punjab', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 30.7414, 76.6543),
(4, 'Mohali - VR Punjab', false, NULL, NULL, NULL, 30.7414, 76.6543),
(5, 'Mohali - VR Punjab', false, NULL, NULL, NULL, 30.7414, 76.6543),
(6, 'Mohali - VR Punjab', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 30.7414, 76.6543);

-- Insert slots for Delhi
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Delhi', false, NULL, NULL, NULL, 28.7041, 77.1025),
(2, 'Delhi', false, NULL, NULL, NULL, 28.7041, 77.1025),
(3, 'Delhi', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 28.7041, 77.1025),
(4, 'Delhi', false, NULL, NULL, NULL, 28.7041, 77.1025),
(5, 'Delhi', false, NULL, NULL, NULL, 28.7041, 77.1025),
(6, 'Delhi', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 28.7041, 77.1025);

-- Insert slots for Delhi - Connaught Place
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Delhi - Connaught Place', false, NULL, NULL, NULL, 28.6304, 77.2177),
(2, 'Delhi - Connaught Place', false, NULL, NULL, NULL, 28.6304, 77.2177),
(3, 'Delhi - Connaught Place', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 28.6304, 77.2177),
(4, 'Delhi - Connaught Place', false, NULL, NULL, NULL, 28.6304, 77.2177),
(5, 'Delhi - Connaught Place', false, NULL, NULL, NULL, 28.6304, 77.2177),
(6, 'Delhi - Connaught Place', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 28.6304, 77.2177);

-- Insert slots for Gurgaon
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Gurgaon', false, NULL, NULL, NULL, 28.4595, 77.0266),
(2, 'Gurgaon', false, NULL, NULL, NULL, 28.4595, 77.0266),
(3, 'Gurgaon', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 28.4595, 77.0266),
(4, 'Gurgaon', false, NULL, NULL, NULL, 28.4595, 77.0266),
(5, 'Gurgaon', false, NULL, NULL, NULL, 28.4595, 77.0266),
(6, 'Gurgaon', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 28.4595, 77.0266);

-- Insert slots for Gurgaon - Cyber Hub
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Gurgaon - Cyber Hub', false, NULL, NULL, NULL, 28.495, 77.0888),
(2, 'Gurgaon - Cyber Hub', false, NULL, NULL, NULL, 28.495, 77.0888),
(3, 'Gurgaon - Cyber Hub', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 28.495, 77.0888),
(4, 'Gurgaon - Cyber Hub', false, NULL, NULL, NULL, 28.495, 77.0888),
(5, 'Gurgaon - Cyber Hub', false, NULL, NULL, NULL, 28.495, 77.0888),
(6, 'Gurgaon - Cyber Hub', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 28.495, 77.0888);

-- Insert slots for Bangalore
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Bangalore', false, NULL, NULL, NULL, 12.9716, 77.5946),
(2, 'Bangalore', false, NULL, NULL, NULL, 12.9716, 77.5946),
(3, 'Bangalore', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 12.9716, 77.5946),
(4, 'Bangalore', false, NULL, NULL, NULL, 12.9716, 77.5946),
(5, 'Bangalore', false, NULL, NULL, NULL, 12.9716, 77.5946),
(6, 'Bangalore', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 12.9716, 77.5946);

-- Insert slots for Bangalore - MG Road
INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES
(1, 'Bangalore - MG Road', false, NULL, NULL, NULL, 12.975, 77.6),
(2, 'Bangalore - MG Road', false, NULL, NULL, NULL, 12.975, 77.6),
(3, 'Bangalore - MG Road', true, 'Guest Driver 3', 1, NOW() + INTERVAL '1 hours', 12.975, 77.6),
(4, 'Bangalore - MG Road', false, NULL, NULL, NULL, 12.975, 77.6),
(5, 'Bangalore - MG Road', false, NULL, NULL, NULL, 12.975, 77.6),
(6, 'Bangalore - MG Road', true, 'Guest Driver 6', 1, NOW() + INTERVAL '1 hours', 12.975, 77.6);

-- Verification Queries
-- 1. Available slots by location
-- SELECT area, COUNT(*) as available_slots FROM slots WHERE is_booked = false GROUP BY area;

-- 2. Occupied slots
-- SELECT slot_number, area, booked_by_username, booking_end FROM slots WHERE is_booked = true;

-- 3. Total slots per location
-- SELECT area, COUNT(*) as total_slots FROM slots GROUP BY area;
