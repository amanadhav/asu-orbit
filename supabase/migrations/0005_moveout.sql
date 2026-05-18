-- ============================================================
-- 0005_moveout.sql
-- Move-out sale / buy-sell marketplace.
-- ============================================================

CREATE TYPE moveout_sale_status_enum AS ENUM ('active', 'mostly_sold', 'closed');
CREATE TYPE item_category_enum AS ENUM (
  'furniture', 'kitchen', 'electronics',
  'bedding', 'study', 'decor', 'clothing', 'misc'
);
CREATE TYPE item_condition_enum AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE item_status_enum    AS ENUM ('available', 'reserved', 'sold');

-- ── moveout_sales ──────────────────────────────────────────────
CREATE TABLE moveout_sales (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name         text    NOT NULL,
  -- Linked apartment from directory (nullable — seller may use custom location)
  apartment_id        uuid    REFERENCES apartments (id) ON DELETE SET NULL,
  -- Freeform location for apartments not in the directory
  custom_location     text,
  moveout_date        date    NOT NULL,
  contact_method      text    NOT NULL,
  additional_info     text,
  submitted_by_email  text    NOT NULL,
  verified            boolean NOT NULL DEFAULT false,
  status              moveout_sale_status_enum NOT NULL DEFAULT 'active',
  -- Auto-expire 60 days after creation; admin can extend
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '60 days'),
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Must reference either a known apartment or provide a custom location
  CONSTRAINT moveout_sales_location_check
    CHECK (apartment_id IS NOT NULL OR custom_location IS NOT NULL)
);

CREATE INDEX moveout_sales_apartment_id_idx ON moveout_sales (apartment_id);
CREATE INDEX moveout_sales_status_idx
  ON moveout_sales (status, expires_at) WHERE verified = true;

-- ── moveout_items ──────────────────────────────────────────────
CREATE TABLE moveout_items (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  moveout_sale_id uuid    NOT NULL
    REFERENCES moveout_sales (id) ON DELETE CASCADE,
  name            text    NOT NULL,
  category        item_category_enum  NOT NULL,
  -- 0 = free; stored in whole dollars
  price           integer NOT NULL DEFAULT 0 CHECK (price >= 0),
  condition       item_condition_enum NOT NULL,
  description     text,
  -- Supabase Storage path in the moveout-photos bucket
  photo_path      text,
  status          item_status_enum NOT NULL DEFAULT 'available',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX moveout_items_sale_id_idx  ON moveout_items (moveout_sale_id);
CREATE INDEX moveout_items_category_idx ON moveout_items (category);
CREATE INDEX moveout_items_avail_idx    ON moveout_items (status)
  WHERE status = 'available';

-- ── Row-Level Security ─────────────────────────────────────────
ALTER TABLE moveout_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE moveout_items ENABLE ROW LEVEL SECURITY;

-- Public sees only verified, non-closed, non-expired sales.
CREATE POLICY "moveout_sales_public_select"
  ON moveout_sales FOR SELECT TO public
  USING (
    verified   = true
    AND status != 'closed'
    AND expires_at > now()
  );

-- Items inherit parent sale visibility via correlated subquery.
-- All item statuses (available/reserved/sold) are visible as long as
-- the parent sale passes the above checks — needed for the detail page.
CREATE POLICY "moveout_items_public_select"
  ON moveout_items FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM moveout_sales s
      WHERE s.id        = moveout_items.moveout_sale_id
        AND s.verified   = true
        AND s.status    != 'closed'
        AND s.expires_at > now()
    )
  );

-- ── Storage bucket ─────────────────────────────────────────────
-- Create the moveout-photos bucket manually in Supabase Dashboard →
-- Storage after running this migration:
--   Bucket name : moveout-photos
--   Public      : true (public read)
--   File size   : 5 MB
--   MIME types  : image/jpeg, image/png, image/webp
