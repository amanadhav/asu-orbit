/* ============================================================
   Domain types - mirrors the Supabase schema in .cursorrules.
   Keep in sync with migrations in supabase/migrations/.
   ============================================================ */

export type SubleaseAllowed = "yes" | "no" | "with_approval" | "unknown";

export type PhotoCategory =
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "living"
  | "gym"
  | "pool"
  | "parking"
  | "exterior"
  | "hallway"
  | "other";

export type SubleaseStatus = "active" | "taken" | "expired";
export type GenderPreference = "male" | "female" | "any";
export type RoomType = "private" | "shared";
export type HouseholdDiet = "veg" | "non_veg" | "any";
export type SubleaseFurnished = "fully" | "partial" | "unfurnished";

export interface Apartment {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance_to_campus_minutes_walk: number | null;
  distance_to_campus_minutes_orbit: number | null;
  rent_min: number;
  rent_max: number;
  utilities_typically_included: boolean;
  parking_cost_monthly: number | null;
  sublease_allowed: SubleaseAllowed;
  pet_policy: string | null;
  official_website: string | null;
  description: string;
  community_notes: string | null;
  cover_photo_id: string | null;
  /** Populated only when the query joins apartment_photos on cover_photo_id. */
  cover_photo: { storage_path: string } | null;
  nearest_transit: string | null;
  floorplans: Array<{ type: string; rent_min: number; rent_max: number }> | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApartmentPhoto {
  id: string;
  apartment_id: string;
  storage_path: string;
  category: PhotoCategory;
  caption: string | null;
  submitted_by_email: string;
  verified: boolean;
  /** Moderation: soft-reject (still in DB). Pending = !verified && !rejected */
  rejected: boolean;
  created_at: string;
}

export interface ApartmentReview {
  id: string;
  apartment_id: string;
  rating_overall: number;
  rating_maintenance: number;
  rating_management: number;
  rating_value: number;
  rating_safety: number;
  lease_term_start: string;
  lease_term_end: string;
  review_text: string;
  pros: string | null;
  cons: string | null;
  would_recommend: boolean;
  submitted_by_email: string;
  verified: boolean;
  /** Moderation: soft-reject (still in DB). Pending = !verified && !rejected */
  rejected: boolean;
  created_at: string;
}

export interface Sublease {
  id: string;
  apartment_id: string | null;
  custom_apartment_name: string | null;
  rent_monthly: number;
  utilities_included: boolean;
  available_from: string;
  available_until: string;
  gender_preference: GenderPreference;
  room_type: RoomType;
  household_diet: HouseholdDiet;
  furnished: SubleaseFurnished | null;
  amenities: string[] | null;
  move_in_notes: string | null;
  roommate_expectations: string | null;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_method: string;
  additional_info: string | null;
  submitted_by_email: string;
  verified: boolean;
  rejected: boolean;
  status: SubleaseStatus;
  /** Not returned by public queries - only via admin client. */
  taken_token?: string;
  expires_at: string;
  created_at: string;
}

/** Sublease row joined with its linked apartment (if any). */
export type SubleaseWithApartment = Omit<Sublease, "taken_token"> & {
  apartments: { id: string; name: string; slug: string } | null;
};

// ── Move-out marketplace ──────────────────────────────────────

export type MoveoutSaleStatus = "active" | "mostly_sold" | "closed";
export type ItemCategory =
  | "furniture"
  | "kitchen"
  | "electronics"
  | "bedding"
  | "study"
  | "decor"
  | "clothing"
  | "misc";
export type ItemCondition = "new" | "like_new" | "good" | "fair";
export type ItemStatus = "available" | "reserved" | "sold";

export interface MoveoutSale {
  id: string;
  seller_name: string;
  apartment_id: string | null;
  custom_location: string | null;
  moveout_date: string;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_method: string;
  additional_info: string | null;
  submitted_by_email: string;
  verified: boolean;
  rejected: boolean;
  status: MoveoutSaleStatus;
  expires_at: string;
  created_at: string;
}

export interface MoveoutItem {
  id: string;
  moveout_sale_id: string;
  name: string;
  category: ItemCategory;
  price: number;
  condition: ItemCondition;
  description: string | null;
  photo_path: string | null;
  status: ItemStatus;
  created_at: string;
}

/** Item row joined with its parent sale and the sale's linked apartment. */
export type MoveoutItemWithSale = MoveoutItem & {
  moveout_sales: (MoveoutSale & {
    apartments: { id: string; name: string; slug: string } | null;
  }) | null;
};

/** Sale row joined with its linked apartment and all its items. */
export type MoveoutSaleWithItems = MoveoutSale & {
  apartments: { id: string; name: string; slug: string } | null;
  moveout_items: MoveoutItem[];
};

// ── Standalone listings ───────────────────────────────────────

export interface Listing {
  id: string;
  title: string;
  category: ItemCategory;
  price: number;
  condition: ItemCondition;
  description: string | null;
  photo_path: string | null;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_method: string;
  submitted_by_email: string;
  verified: boolean;
  rejected: boolean;
  status: ItemStatus;
  expires_at: string;
  created_at: string;
  apartment_id: string | null;
  custom_apartment_name: string | null;
}

// ── Unified marketplace feed ──────────────────────────────────

export type ListingType = "moveout" | "direct";

/**
 * Common shape returned by getMarketplaceItems().
 * Both moveout items and direct listings are normalised into this
 * so the marketplace grid renders them without type-branching.
 */
export interface MarketplaceItem {
  id: string;
  title: string;
  category: ItemCategory;
  price: number;
  condition: ItemCondition;
  description: string | null;
  photo_path: string | null;
  /** Differentiates source - used only for the badge. */
  listing_type: ListingType;
  /**
   * For move-out items: "/moveout/[saleId]".
   * For direct listings: null - use `/marketplace/[listingId]` for detail.
   */
  sale_href: string | null;
  /**
   * Move-out: apartment name or custom location.
   * Direct: apartment name, custom complex name, or null.
   */
  context: string | null;
  /** Direct listings only: directory slug when listing.apartment_id is set. */
  apartment_slug?: string | null;
  /** Contact method for direct listings; null for move-out items. */
  contact_method: string | null;
  created_at: string;
}

/** Verified direct listing for `/marketplace/[listingId]` detail page. */
export interface MarketplaceListingDetail {
  id: string;
  title: string;
  category: ItemCategory;
  price: number;
  condition: ItemCondition;
  description: string | null;
  photo_path: string | null;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_method: string;
  created_at: string;
  /** Directory name or custom complex label */
  location_label: string | null;
  /** Present only when tied to an apartments row */
  apartment_slug: string | null;
}

/** Computed aggregate from a set of ApartmentReview rows. */
export interface ReviewAggregate {
  count: number;
  overall: number;
  maintenance: number;
  management: number;
  value: number;
  safety: number;
  wouldRecommendPct: number;
}

export function computeReviewAggregate(
  reviews: ApartmentReview[],
  apartment?: Pick<Apartment, 'google_rating' | 'google_reviews_count'> | null
): ReviewAggregate | null {
  if (reviews.length === 0 && !apartment?.google_rating) return null;
  
  const avg = (key: keyof ApartmentReview) => {
    if (reviews.length === 0) return apartment?.google_rating || 0;
    return reviews.reduce((sum, r) => sum + (r[key] as number), 0) / reviews.length;
  };

  return {
    count: apartment?.google_reviews_count || reviews.length,
    overall: apartment?.google_rating || avg("rating_overall"),
    maintenance: avg("rating_maintenance"),
    management: avg("rating_management"),
    value: avg("rating_value"),
    safety: avg("rating_safety"),
    wouldRecommendPct: reviews.length > 0
      ? (reviews.filter((r) => r.would_recommend).length / reviews.length) * 100
      : (apartment?.google_rating && apartment.google_rating >= 4 ? 100 : 0),
  };
}
