-- ============================================================
-- 0007_listings.sql
-- Standalone buy-sell listings (not tied to a move-out event).
-- Reuses item_category_enum, item_condition_enum, item_status_enum
-- defined in 0005_moveout.sql.
-- ============================================================

CREATE TABLE listings (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  category            item_category_enum  NOT NULL,
  -- 0 = free; stored in whole dollars
  price               integer     NOT NULL DEFAULT 0 CHECK (price >= 0),
  condition           item_condition_enum NOT NULL,
  description         text,
  -- Supabase Storage path in the moveout-photos bucket (reused)
  photo_path          text,
  contact_method      text        NOT NULL,
  submitted_by_email  text        NOT NULL,
  verified            boolean     NOT NULL DEFAULT false,
  -- 'reserved' value exists in item_status_enum but is not used here
  status              item_status_enum NOT NULL DEFAULT 'available',
  -- Auto-expire 60 days after creation; admin can extend
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '60 days'),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX listings_category_idx ON listings (category);
CREATE INDEX listings_status_idx
  ON listings (status, expires_at)
  WHERE verified = true;

-- ── Row-Level Security ─────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public sees only verified, available, non-expired listings.
CREATE POLICY "listings_public_select"
  ON listings FOR SELECT TO public
  USING (
    verified   = true
    AND status = 'available'
    AND expires_at > now()
  );
