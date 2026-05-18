-- ============================================================
-- 0002_apartment_photos.sql
-- Apartment photos table + Supabase Storage bucket.
-- Also adds the deferred cover_photo_id FK back to apartments.
-- ============================================================

CREATE TYPE photo_category_enum AS ENUM (
  'bedroom',
  'kitchen',
  'bathroom',
  'living',
  'gym',
  'pool',
  'parking',
  'exterior',
  'hallway',
  'other'
);

CREATE TABLE apartment_photos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id       uuid NOT NULL REFERENCES apartments (id) ON DELETE CASCADE,
  -- Path inside the "apartment-photos" Storage bucket
  storage_path       text NOT NULL,
  category           photo_category_enum NOT NULL DEFAULT 'other',
  caption            text,
  submitted_by_email text NOT NULL,
  -- Admin must set verified=true before the photo is publicly visible
  verified           boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-apartment lookups
CREATE INDEX apartment_photos_apartment_id_idx ON apartment_photos (apartment_id);

-- ── Back-reference FK on apartments ─────────────────────────
-- Now that apartment_photos exists, we can safely add the FK
-- for apartments.cover_photo_id.
ALTER TABLE apartments
  ADD CONSTRAINT apartments_cover_photo_id_fkey
  FOREIGN KEY (cover_photo_id)
  REFERENCES apartment_photos (id)
  ON DELETE SET NULL;

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE apartment_photos ENABLE ROW LEVEL SECURITY;

-- Public can only see verified photos
CREATE POLICY "apartment_photos_public_select"
  ON apartment_photos FOR SELECT
  TO public
  USING (verified = true);

-- ── Supabase Storage bucket ──────────────────────────────────
-- Creates the "apartment-photos" bucket as public (GET is unauthenticated).
-- Uploads go through server-side service_role actions only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apartment-photos',
  'apartment-photos',
  true,
  10485760,   -- 10 MB per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public can GET objects from this bucket (read-only)
CREATE POLICY "apartment_photos_storage_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'apartment-photos');
