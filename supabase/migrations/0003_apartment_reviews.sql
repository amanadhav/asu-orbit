-- ============================================================
-- 0003_apartment_reviews.sql
-- Apartment reviews table.
-- ============================================================

CREATE TABLE apartment_reviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id        uuid NOT NULL REFERENCES apartments (id) ON DELETE CASCADE,
  -- All ratings are 1–5; enforced with CHECK constraints
  rating_overall      integer NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_maintenance  integer NOT NULL CHECK (rating_maintenance BETWEEN 1 AND 5),
  rating_management   integer NOT NULL CHECK (rating_management BETWEEN 1 AND 5),
  rating_value        integer NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  rating_safety       integer NOT NULL CHECK (rating_safety BETWEEN 1 AND 5),
  lease_term_start    date NOT NULL,
  lease_term_end      date NOT NULL,
  review_text         text NOT NULL,
  pros                text,
  cons                text,
  would_recommend     boolean NOT NULL,
  submitted_by_email  text NOT NULL,
  -- Admin must set verified=true before the review is publicly visible
  verified            boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX apartment_reviews_apartment_id_idx ON apartment_reviews (apartment_id);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE apartment_reviews ENABLE ROW LEVEL SECURITY;

-- Public can only see verified reviews
CREATE POLICY "apartment_reviews_public_select"
  ON apartment_reviews FOR SELECT
  TO public
  USING (verified = true);
