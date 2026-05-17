-- Add guest_count field to reservations table

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1 CHECK (guest_count >= 1);
