-- Add nearest_transit column to apartments
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS nearest_transit text;
