import fs from 'fs';

const locations = [
  { area: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { area: 'Chandigarh - Elante Mall', lat: 30.7055, lng: 76.8013 },
  { area: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { area: 'Mohali - VR Punjab', lat: 30.7414, lng: 76.6543 },
  { area: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { area: 'Delhi - Connaught Place', lat: 28.6304, lng: 77.2177 },
  { area: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
  { area: 'Gurgaon - Cyber Hub', lat: 28.4950, lng: 77.0888 },
  { area: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { area: 'Bangalore - MG Road', lat: 12.9750, lng: 77.6000 },
];

let sql = `-- Smart Parking Dummy Data Generation Script
-- Generates parking slots for 10 distinct locations across 5 cities.
-- Includes exact city names to ensure frontend search compatibility.
-- 'booked_by' is kept NULL to respect the users foreign key constraint since user data is omitted.

-- 1. Clear existing slots to avoid UNIQUE constraint violations if run multiple times
TRUNCATE TABLE slots RESTART IDENTITY CASCADE;

`;

for (const loc of locations) {
  sql += `-- Insert slots for ${loc.area}\n`;
  sql += `INSERT INTO slots (slot_number, area, is_booked, booked_by_username, parking_hours, booking_end, lat, lng) VALUES\n`;
  
  const values = [];
  for (let i = 1; i <= 6; i++) {
    // Make every 3rd slot booked
    if (i % 3 === 0) {
      values.push(`(${i}, '${loc.area}', true, 'Guest Driver ${i}', ${i%3 + 1}, NOW() + INTERVAL '${i%3 + 1} hours', ${loc.lat}, ${loc.lng})`);
    } else {
      values.push(`(${i}, '${loc.area}', false, NULL, NULL, NULL, ${loc.lat}, ${loc.lng})`);
    }
  }
  sql += values.join(',\n') + ';\n\n';
}

sql += `-- Verification Queries
-- 1. Available slots by location
-- SELECT area, COUNT(*) as available_slots FROM slots WHERE is_booked = false GROUP BY area;

-- 2. Occupied slots
-- SELECT slot_number, area, booked_by_username, booking_end FROM slots WHERE is_booked = true;

-- 3. Total slots per location
-- SELECT area, COUNT(*) as total_slots FROM slots GROUP BY area;
`;

fs.writeFileSync('scratch/dummy_data.sql', sql);
console.log('SQL generated.');
