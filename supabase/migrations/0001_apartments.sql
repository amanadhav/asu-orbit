-- ============================================================
-- 0001_apartments.sql
-- Core apartment directory table.
-- NOTE: cover_photo_id FK is added in 0002 after apartment_photos is created
--       (circular reference requires the FK to be deferred to the second migration).
-- ============================================================

-- Enum for sublease policy
CREATE TYPE sublease_allowed_enum AS ENUM (
  'yes',
  'no',
  'with_approval',
  'unknown'
);

CREATE TABLE apartments (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                            text NOT NULL,
  slug                            text UNIQUE NOT NULL,
  address                         text NOT NULL,
  latitude                        double precision,
  longitude                       double precision,
  -- Walk distance is estimated at seed time; NULL = not yet verified
  distance_to_campus_minutes_walk integer,
  distance_to_campus_minutes_orbit integer,
  rent_min                        integer NOT NULL,
  rent_max                        integer NOT NULL,
  utilities_typically_included    boolean NOT NULL DEFAULT false,
  parking_cost_monthly            integer,
  sublease_allowed                sublease_allowed_enum NOT NULL DEFAULT 'unknown',
  pet_policy                      text,
  official_website                text,
  -- Supports markdown
  description                     text NOT NULL DEFAULT '',
  -- FK to apartment_photos.id added in 0002_apartment_photos.sql
  cover_photo_id                  uuid,
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now()
);

-- Auto-bump updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row-Level Security ───────────────────────────────────────
-- Enable RLS. With RLS enabled, all operations are DENIED by default
-- unless an explicit policy allows them.
-- service_role bypasses RLS entirely in Supabase, so no policies
-- are needed for admin mutations - just anon reads.
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

-- All apartments in the directory are admin-seeded and trusted.
-- Public can read every row (no verified column needed here).
CREATE POLICY "apartments_public_select"
  ON apartments FOR SELECT
  TO public
  USING (true);
