-- Reversible moderation reject (soft), separate from delete.
-- Pending: verified = false AND rejected = false
-- Rejected: verified = false AND rejected = true
-- Approved: verified = true (rejected cleared)

ALTER TABLE apartment_photos
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false;

ALTER TABLE apartment_reviews
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false;

ALTER TABLE subleases
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false;

ALTER TABLE moveout_sales
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false;

ALTER TYPE apartment_request_status_enum ADD VALUE 'rejected';
