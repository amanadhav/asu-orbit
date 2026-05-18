-- Add floorplan-level rent breakdown to apartments
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS floorplans jsonb;
-- Format: [{"type":"1B1B","rent_min":950,"rent_max":1100}, ...]
