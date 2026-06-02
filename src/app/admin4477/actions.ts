"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("Unauthorized");

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== adminPassword) throw new Error("Unauthorized");
}

export type ModeratableTable =
  | "apartment_photos"
  | "apartment_reviews"
  | "subleases"
  | "moveout_sales"
  | "listings";

export type DeleteTable =
  | ModeratableTable
  | "apartment_requests";

export async function approveRecord(
  table: ModeratableTable,
  id: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from(table)
      .update({ verified: true, rejected: false })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin4477");
    revalidatePath("/apartments");
    revalidatePath("/subleases");
    revalidatePath("/moveout");
    revalidatePath("/marketplace");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/** Soft-reject: row stays in DB; reversible via approveRecord. */
export async function rejectRecord(
  table: ModeratableTable | "apartment_requests",
  id: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();

    if (table === "apartment_requests") {
      const { error } = await supabase
        .from("apartment_requests")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from(table)
        .update({ verified: false, rejected: true })
        .eq("id", id);
      if (error) return { error: error.message };
    }

    revalidatePath("/admin4477");
    revalidatePath("/apartments");
    revalidatePath("/subleases");
    revalidatePath("/moveout");
    revalidatePath("/marketplace");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteRecord(
  table: DeleteTable,
  id: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();

    if (table === "moveout_sales") {
      const { error: itemsError } = await supabase
        .from("moveout_items")
        .delete()
        .eq("moveout_sale_id", id);
      if (itemsError) return { error: itemsError.message };
    }

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin4477");
    revalidatePath("/apartments");
    revalidatePath("/subleases");
    revalidatePath("/moveout");
    revalidatePath("/marketplace");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markAsTaken(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("subleases")
      .update({ status: "taken" })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin4477");
    revalidatePath("/subleases");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markAsClosed(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("moveout_sales")
      .update({ status: "closed" })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin4477");
    revalidatePath("/moveout");
    revalidatePath("/marketplace");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markAsSold(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin4477");
    revalidatePath("/marketplace");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markApartmentRequestAdded(
  id: string,
): Promise<{ error?: string }> {
  return approveApartmentRequest(id);
}

/** Pending or rejected → marked added (appears satisfied for directory workflow). */
export async function approveApartmentRequest(
  id: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    const { data: row, error: fetchErr } = await supabase
      .from("apartment_requests")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) return { error: fetchErr.message };
    if (!row) return { error: "Not found" };
    if (row.status === "added") return { error: "Already marked as added" };
    const { error } = await supabase
      .from("apartment_requests")
      .update({ status: "added" })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin4477");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateApartmentContent(
  id: string,
  description: string,
  community_notes: string,
  floorplans_json: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();

    let floorplans: unknown = null;
    if (floorplans_json.trim()) {
      try {
        floorplans = JSON.parse(floorplans_json.trim());
      } catch {
        return { error: "Floorplans JSON is invalid. Please check the format." };
      }
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("apartments")
      .update({
        description: description.trim(),
        community_notes: community_notes.trim() || null,
        floorplans,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/apartments");
    revalidatePath(`/admin4477`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateListingByAdmin(
  table: "subleases" | "listings" | "moveout_sales",
  id: string,
  data: any,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
    const supabase = createSupabaseAdminClient();
    
    const { error } = await supabase.from(table).update(data).eq("id", id);
    if (error) return { error: error.message };
    
    revalidatePath("/admin4477");
    if (table === "subleases") revalidatePath("/subleases");
    if (table === "listings") revalidatePath("/marketplace");
    if (table === "moveout_sales") {
      revalidatePath("/moveout");
      revalidatePath("/marketplace");
    }
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
