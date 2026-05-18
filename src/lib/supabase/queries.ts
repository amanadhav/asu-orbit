import { createSupabasePublicClient } from "./public";
import type {
  Apartment,
  ApartmentPhoto,
  ApartmentReview,
  SubleaseWithApartment,
  MoveoutItemWithSale,
  MoveoutSaleWithItems,
  MarketplaceItem,
  MarketplaceListingDetail,
  ItemCategory,
  ItemCondition,
} from "@/lib/types";

// Columns we expose publicly - never includes taken_token.
const SUBLEASE_PUBLIC_COLS = `
  id, apartment_id, custom_apartment_name, rent_monthly, utilities_included,
  available_from, available_until, gender_preference, room_type, household_diet,
  furnished, amenities, move_in_notes, roommate_expectations,
  contact_whatsapp, contact_instagram, contact_method, additional_info, submitted_by_email, verified, status, expires_at, created_at,
  apartments ( id, name, slug )
` as const;

// Re-exported so existing server-component imports continue to work unchanged.
export { getPhotoUrl, getMoveoutPhotoUrl } from "./storage";

const APARTMENT_SELECT =
  "*, cover_photo:apartment_photos!cover_photo_id(storage_path)" as const;

export async function getApartments(): Promise<Apartment[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartments")
    .select(APARTMENT_SELECT)
    .order("name");
  if (error) throw error;
  return (data as unknown as Apartment[]) ?? [];
}

export async function getFeaturedApartments(limit = 6): Promise<Apartment[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartments")
    .select(APARTMENT_SELECT)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data as unknown as Apartment[]) ?? [];
}

export async function getApartmentBySlug(
  slug: string,
): Promise<Apartment | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartments")
    .select(APARTMENT_SELECT)
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as unknown as Apartment;
}

export async function getApartmentSlugs(): Promise<string[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartments")
    .select("slug");
  if (error) return [];
  return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getPhotosForApartment(
  apartmentId: string,
): Promise<ApartmentPhoto[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartment_photos")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("created_at");
  if (error) throw error;
  return (data as ApartmentPhoto[]) ?? [];
}

export async function getReviewsForApartment(
  apartmentId: string,
): Promise<ApartmentReview[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("apartment_reviews")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ApartmentReview[]) ?? [];
}

export async function getSubleases(): Promise<SubleaseWithApartment[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("subleases")
    .select(SUBLEASE_PUBLIC_COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as SubleaseWithApartment[]) ?? [];
}

export async function getSubleaseById(
  id: string,
): Promise<SubleaseWithApartment | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("subleases")
    .select(SUBLEASE_PUBLIC_COLS)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as SubleaseWithApartment;
}

export async function getSubleasesByApartment(
  apartmentId: string,
): Promise<SubleaseWithApartment[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("subleases")
    .select(SUBLEASE_PUBLIC_COLS)
    .eq("apartment_id", apartmentId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as unknown as SubleaseWithApartment[]) ?? [];
}

export async function getRecentSubleases(
  limit = 3,
): Promise<SubleaseWithApartment[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("subleases")
    .select(SUBLEASE_PUBLIC_COLS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as unknown as SubleaseWithApartment[]) ?? [];
}

// ── Move-out marketplace ──────────────────────────────────────

const MOVEOUT_ITEM_COLS = `
  id, moveout_sale_id, name, category, price, condition,
  description, photo_path, status, created_at,
  moveout_sales (
    id, seller_name, apartment_id, custom_location,
    moveout_date, contact_whatsapp, contact_instagram, contact_method,
    apartments ( id, name, slug )
  )
` as const;

/** All available items for the marketplace grid. */
export async function getMoveoutItems(): Promise<MoveoutItemWithSale[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("moveout_items")
    .select(MOVEOUT_ITEM_COLS)
    .eq("status", "available")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as MoveoutItemWithSale[]) ?? [];
}

/** Single sale with all its items (all statuses) for the detail page. */
export async function getMoveoutSaleById(
  id: string,
): Promise<MoveoutSaleWithItems | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("moveout_sales")
    .select(
      `id, seller_name, apartment_id, custom_location, moveout_date,
       contact_whatsapp, contact_instagram, contact_method, additional_info, status, expires_at, created_at,
       apartments ( id, name, slug ),
       moveout_items ( id, name, category, price, condition,
                       description, photo_path, status, created_at )`,
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as MoveoutSaleWithItems;
}

// ── Unified marketplace feed ──────────────────────────────────

/**
 * Returns a merged, newest-first feed of:
 *  - moveout_items from verified, non-closed, non-expired sales (explicit join -
 *    does not rely on RLS so the feed stays correct if policies change)
 *  - standalone listings that are verified, available, and not expired
 */
export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();

  const [moveoutResult, listingsResult] = await Promise.all([
    // !inner ensures items with no matching sale row are excluded entirely.
    // Filters on moveout_sales.* are applied explicitly here, independent of RLS.
    supabase
      .from("moveout_items")
      .select(
        `id, name, category, price, condition, description, photo_path, created_at,
         moveout_sales!inner (
           id, seller_name, verified, status, expires_at, custom_location,
           apartments ( id, name )
         )`,
      )
      .eq("status", "available")
      .eq("moveout_sales.verified", true)
      .neq("moveout_sales.status", "closed")
      .gt("moveout_sales.expires_at", now)
      .order("created_at", { ascending: false }),

    supabase
      .from("listings")
      .select(
        `id, title, category, price, condition, description, photo_path, contact_whatsapp, contact_instagram, contact_method, created_at,
         apartment_id, custom_apartment_name,
         apartments ( name, slug )`,
      )
      .eq("verified", true)
      .eq("status", "available")
      .gt("expires_at", now)
      .order("created_at", { ascending: false }),
  ]);

  if (moveoutResult.error) throw moveoutResult.error;
  if (listingsResult.error) throw listingsResult.error;

  type RawMoveoutItem = {
    id: string; name: string; category: string; price: number;
    condition: string; description: string | null; photo_path: string | null;
    created_at: string;
    moveout_sales: {
      id: string; seller_name: string; custom_location: string | null;
      apartments: { id: string; name: string } | null;
    };
  };

  type RawListing = {
    id: string;
    title: string;
    category: string;
    price: number;
    condition: string;
    description: string | null;
    photo_path: string | null;
    contact_whatsapp: string | null;
    contact_instagram: string | null;
    contact_method: string;
    created_at: string;
    apartment_id: string | null;
    custom_apartment_name: string | null;
    apartments: { name: string; slug: string } | null;
  };

  const moveoutItems: MarketplaceItem[] = (
    (moveoutResult.data ?? []) as unknown as RawMoveoutItem[]
  ).map((item) => {
    const sale = item.moveout_sales;
    return {
      id: item.id,
      title: item.name,
      category: item.category as ItemCategory,
      price: item.price,
      condition: item.condition as ItemCondition,
      description: item.description,
      photo_path: item.photo_path,
      listing_type: "moveout",
      sale_href: `/moveout/${sale.id}`,
      context: sale.apartments?.name ?? sale.custom_location ?? null,
      contact_method: null,
      created_at: item.created_at,
    };
  });

  const directItems: MarketplaceItem[] = (
    (listingsResult.data ?? []) as unknown as RawListing[]
  ).map((listing) => {
    const apt = listing.apartments;
    const context =
      apt?.name ??
      (listing.custom_apartment_name?.trim() || null);
    return {
      id: listing.id,
      title: listing.title,
      category: listing.category as ItemCategory,
      price: listing.price,
      condition: listing.condition as ItemCondition,
      description: listing.description,
      photo_path: listing.photo_path,
      listing_type: "direct",
      sale_href: null,
      context,
      apartment_slug: apt?.slug ?? null,
      contact_method: listing.contact_method,
      created_at: listing.created_at,
    };
  });

  return [...moveoutItems, ...directItems].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** Single verified direct listing for public detail page (same visibility rules as marketplace feed). */
export async function getMarketplaceListingById(
  listingId: string,
): Promise<MarketplaceListingDetail | null> {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `id, title, category, price, condition, description, photo_path, contact_whatsapp, contact_instagram, contact_method, created_at,
       custom_apartment_name,
       apartments ( name, slug )`,
    )
    .eq("id", listingId)
    .eq("verified", true)
    .eq("status", "available")
    .gt("expires_at", now)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type Raw = {
    id: string;
    title: string;
    category: string;
    price: number;
    condition: string;
    description: string | null;
    photo_path: string | null;
    contact_whatsapp: string | null;
    contact_instagram: string | null;
    contact_method: string;
    created_at: string;
    custom_apartment_name: string | null;
    apartments: { name: string; slug: string } | null;
  };

  const row = data as unknown as Raw;
  const apt = row.apartments;

  return {
    id: row.id,
    title: row.title,
    category: row.category as ItemCategory,
    price: row.price,
    condition: row.condition as ItemCondition,
    description: row.description,
    photo_path: row.photo_path,
    contact_whatsapp: row.contact_whatsapp,
    contact_instagram: row.contact_instagram,
    contact_method: row.contact_method,
    created_at: row.created_at,
    location_label:
      apt?.name ?? (row.custom_apartment_name?.trim() || null),
    apartment_slug: apt?.slug ?? null,
  };
}

/** Recent sales for homepage preview (returns sale rows, not items). */
export async function getRecentMoveoutSales(limit = 3) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("moveout_sales")
    .select(
      `id, seller_name, apartment_id, custom_location, moveout_date, created_at,
       apartments ( id, name, slug ),
       moveout_items ( id, status )`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as (Pick<
    MoveoutSaleWithItems,
    | "id"
    | "seller_name"
    | "apartment_id"
    | "custom_location"
    | "moveout_date"
    | "created_at"
    | "apartments"
  > & { moveout_items: { id: string; status: string }[] })[];
}
