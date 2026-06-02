import type { Metadata } from "next";
import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Apartment, ApartmentPhoto, ApartmentReview, SubleaseWithApartment, MoveoutSale, Listing } from "@/lib/types";
import { AdminDashboard } from "./admin-dashboard";
import { AdminLogin } from "./admin-login";

export const metadata: Metadata = {
  title: "Admin",
};

// Prevent caching - admin panel should always be fresh.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieStore = await cookies();
  const isAdmin =
    !!adminPassword &&
    cookieStore.get("admin_session")?.value === adminPassword;

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            ASU Orbit · Admin
          </h1>
        </div>
        <AdminLogin />
      </div>
    );
  }

  // ── Fetch pending items ────────────────────────────────────
  const supabase = createSupabaseAdminClient();

  const [
    { data: rawPhotos },
    { data: rawReviews },
    { data: rawSubleases },
    { data: rawMoveoutSales },
    { data: rawListings },
    { data: rawApartments },
    { data: rawApartmentRequests },
  ] = await Promise.all([
      supabase
        .from("apartment_photos")
        .select("*, apartments(name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("apartment_reviews")
        .select("*, apartments(name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("subleases")
        .select(
          `id, apartment_id, custom_apartment_name, rent_monthly,
           utilities_included, available_from, available_until,
           gender_preference, room_type, household_diet,
           furnished, amenities, move_in_notes, roommate_expectations,
           contact_whatsapp, contact_instagram, contact_method,
           additional_info, submitted_by_email, verified, rejected, status, expires_at, created_at,
           apartments(id, name, slug)`,
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("moveout_sales")
        .select(
          `id, seller_name, apartment_id, custom_location, moveout_date,
           contact_whatsapp, contact_instagram, contact_method, additional_info, submitted_by_email, verified, rejected,
           status, expires_at, created_at,
           apartments(name),
           moveout_items(id)`,
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("listings")
        .select(
          `id, title, category, price, condition, description, photo_path,
           contact_whatsapp, contact_instagram, contact_method, submitted_by_email, verified, rejected, status, expires_at, created_at,
           apartment_id, custom_apartment_name`,
        )
        .order("created_at", { ascending: false }),
      supabase.from("apartments").select("*").order("name"),
      supabase
        .from("apartment_requests")
        .select(
          "id, apartment_name, address, submitted_by_email, created_at, status",
        )
        .order("created_at", { ascending: false }),
    ]);

  const photos: (ApartmentPhoto & { apartment_name: string })[] = (
    rawPhotos ?? []
  ).map((p: ApartmentPhoto & { apartments: { name: string } | null }) => ({
    ...p,
    rejected: p.rejected ?? false,
    apartment_name: p.apartments?.name ?? "Unknown",
  }));

  const reviews: (ApartmentReview & { apartment_name: string })[] = (
    rawReviews ?? []
  ).map((r: ApartmentReview & { apartments: { name: string } | null }) => ({
    ...r,
    rejected: r.rejected ?? false,
    apartment_name: r.apartments?.name ?? "Unknown",
  }));

  const subleases = (rawSubleases ?? []).map((s) => {
    const row = s as unknown as SubleaseWithApartment;
    return {
      ...row,
      rejected: row.rejected ?? false,
    };
  });

  const moveoutSales = (rawMoveoutSales ?? []).map((s) => {
    const raw = s as unknown as MoveoutSale & {
      apartments: { name: string } | null;
      moveout_items: { id: string }[];
      rejected?: boolean;
    };
    return {
      ...raw,
      rejected: raw.rejected ?? false,
      apartment_name: raw.apartments?.name ?? raw.custom_location ?? "Unknown",
      item_count: raw.moveout_items?.length ?? 0,
    };
  });

  const listings = ((rawListings ?? []) as Listing[]).map((l) => ({
    ...l,
    rejected: l.rejected ?? false,
    apartment_id: l.apartment_id ?? null,
    custom_apartment_name: l.custom_apartment_name ?? null,
  }));
  const apartments = (rawApartments ?? []) as Apartment[];
  const apartmentRequests = (rawApartmentRequests ?? []) as import("./apartment-editor").ApartmentRequest[];

  function modPending(r: { verified: boolean; rejected?: boolean }) {
    return !r.verified && !(r.rejected ?? false);
  }

  const pendingTotal =
    photos.filter(modPending).length +
    reviews.filter(modPending).length +
    subleases.filter(modPending).length +
    moveoutSales.filter(modPending).length +
    listings.filter(modPending).length +
    apartmentRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Admin dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Signed in</p>
        </div>
        <p className="text-sm text-muted-foreground">{pendingTotal} pending</p>
      </div>

      <AdminDashboard
        photos={photos}
        reviews={reviews}
        subleases={subleases}
        moveoutSales={moveoutSales}
        listings={listings}
        apartments={apartments}
        apartmentRequests={apartmentRequests}
      />
    </div>
  );
}
