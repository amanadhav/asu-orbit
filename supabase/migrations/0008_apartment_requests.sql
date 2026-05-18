-- ============================================================
-- 0008_apartment_requests.sql
-- Crowd-sourced requests for apartments not yet in the directory.
-- Submitted inline from the sublease, move-out, and listing forms.
-- ============================================================

CREATE TYPE apartment_request_status_enum AS ENUM ('pending', 'added');

CREATE TABLE apartment_requests (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_name      text        NOT NULL,
  address             text,
  -- Pre-filled from the parent form's email when already typed
  submitted_by_email  text,
  status              apartment_request_status_enum NOT NULL DEFAULT 'pending',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX apartment_requests_status_idx
  ON apartment_requests (status)
  WHERE status = 'pending';

-- ── Row-Level Security ─────────────────────────────────────────
ALTER TABLE apartment_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a request.
CREATE POLICY "apartment_requests_public_insert"
  ON apartment_requests FOR INSERT TO public
  WITH CHECK (true);

-- Only the service role (admin client) can read requests.
-- No SELECT policy for the public role → public queries return 0 rows.
