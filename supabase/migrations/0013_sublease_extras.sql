-- Extra sublease submission / display fields (furnishing, amenities, notes).
-- Uses 0013 because 0012 is listing_apartment.

ALTER TABLE subleases
  ADD COLUMN IF NOT EXISTS furnished text;

ALTER TABLE subleases DROP CONSTRAINT IF EXISTS subleases_furnished_check;

ALTER TABLE subleases
  ADD CONSTRAINT subleases_furnished_check CHECK (
    furnished IS NULL OR furnished IN ('fully', 'partial', 'unfurnished')
  );

ALTER TABLE subleases
  ADD COLUMN IF NOT EXISTS amenities text[];

ALTER TABLE subleases
  ADD COLUMN IF NOT EXISTS move_in_notes text;

ALTER TABLE subleases
  ADD COLUMN IF NOT EXISTS roommate_expectations text;

COMMENT ON COLUMN subleases.furnished IS 'fully | partial | unfurnished';
COMMENT ON COLUMN subleases.amenities IS 'Multi-select amenity labels';
COMMENT ON COLUMN subleases.move_in_notes IS 'Flexible move-in timing notes';
COMMENT ON COLUMN subleases.roommate_expectations IS 'House norms / roommate expectations';
