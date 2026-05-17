-- Add plate_number column to parking_spots table
ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS plate_number VARCHAR(20);
