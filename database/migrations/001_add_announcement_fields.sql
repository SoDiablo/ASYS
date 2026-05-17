-- Add priority and target_audience to announcements table

-- Add priority enum if not exists
DO $$ BEGIN
    CREATE TYPE announcement_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add target_audience enum if not exists
DO $$ BEGIN
    CREATE TYPE announcement_target AS ENUM ('all', 'residents', 'admin', 'security');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS priority announcement_priority DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS target_audience announcement_target DEFAULT 'all';

-- Add floor and status columns to parking_spots if missing
ALTER TABLE parking_spots
ADD COLUMN IF NOT EXISTS floor VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS plate_number VARCHAR(20);

-- Add description column to dues if missing
ALTER TABLE dues
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add guest_count to reservations if missing
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;
