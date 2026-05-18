-- Optional apartment association for standalone marketplace listings.
-- apartment_id links to directory complex; custom_apartment_name for free-text when not in directory.

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS apartment_id uuid REFERENCES apartments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS custom_apartment_name text;

CREATE INDEX IF NOT EXISTS listings_apartment_id_idx ON listings (apartment_id);
