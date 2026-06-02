-- ============================================================
-- 0004_subleases.sql
-- Sublease listings board.
-- ============================================================

CREATE TYPE gender_preference_enum AS ENUM ('male', 'female', 'any');
CREATE TYPE room_type_enum AS ENUM ('private', 'shared');
CREATE TYPE household_diet_enum AS ENUM ('veg', 'non_veg', 'any');
CREATE TYPE sublease_status_enum AS ENUM ('active', 'taken', 'expired');

CREATE TABLE subleases (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Linked apartment from directory (nullable - lister may use custom name instead)
  apartment_id            uuid REFERENCES apartments (id) ON DELETE SET NULL,
  -- Freeform name for apartments not yet in the directory
  custom_apartment_name   text,
  rent_monthly            integer NOT NULL CHECK (rent_monthly > 0),
  utilities_included      boolean NOT NULL DEFAULT false,
  available_from          date NOT NULL,
  available_until         date NOT NULL,
  gender_preference       gender_preference_enum NOT NULL DEFAULT 'any',
  room_type               room_type_enum NOT NULL DEFAULT 'private',
  household_diet          household_diet_enum NOT NULL DEFAULT 'any',
  -- Phone, email, or Instagram handle - lister's choice
  contact_method          text NOT NULL,
  additional_info         text,
  submitted_by_email      text NOT NULL,
  verified                boolean NOT NULL DEFAULT false,
  status                  sublease_status_enum NOT NULL DEFAULT 'active',
  -- One-time token for lister to self-mark their listing as taken
  -- Never returned in public queries; used only by the /api route
  taken_token             uuid NOT NULL DEFAULT gen_random_uuid(),
  -- Auto-expire 30 days after creation; admin can extend by updating this column
  expires_at              timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at              timestamptz NOT NULL DEFAULT now(),

  -- Every listing must reference either a known apartment or provide a name
  CONSTRAINT subleases_apartment_ref_check
    CHECK (apartment_id IS NOT NULL OR custom_apartment_name IS NOT NULL),

  -- Sanity: end date must be after start date
  CONSTRAINT subleases_date_order_check
    CHECK (available_until > available_from)
);

CREATE INDEX subleases_apartment_id_idx ON subleases (apartment_id);
CREATE INDEX subleases_status_idx ON subleases (status, expires_at) WHERE verified = true;

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE subleases ENABLE ROW LEVEL SECURITY;

-- Public sees only verified, active, non-expired listings.
-- taken_token is intentionally NOT excluded at the policy level -
-- instead queries simply never SELECT it (see queries.ts).
CREATE POLICY "subleases_public_select"
  ON subleases FOR SELECT
  TO public
  USING (
    verified    = true
    AND status  = 'active'
    AND expires_at > now()
  );
