"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";

import { sendAdminNotification } from "@/lib/email";
import { deriveContactMethod } from "@/lib/contact-compat";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  photoSchema,
  reviewSchema,
  subleaseSchema,
  moveoutSaleSchema,
  moveoutItemSchema,
  listingSchema,
} from "@/lib/schemas";
import type {
  PhotoFormValues,
  ReviewFormValues,
  SubleaseFormValues,
} from "@/lib/schemas";

export type ActionResult<T = undefined> =
  | { success: true; data?: T; redirectTo?: string }
  | { success: false; error: string };

/** Storage Content-Type when the browser sends an empty type (common for HEIC). */
function storageContentType(file: File): string {
  const fromBrowser = file.type?.trim();
  if (fromBrowser) return fromBrowser;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    avif: "image/avif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
  };
  return byExt[ext] ?? "application/octet-stream";
}

// ── Photo submission ──────────────────────────────────────────
export async function submitPhotoAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Parse non-file fields
    const raw: PhotoFormValues = {
      apartment_id: String(formData.get("apartment_id") ?? ""),
      category: String(formData.get("category") ?? "") as PhotoFormValues["category"],
      caption: String(formData.get("caption") ?? "") || undefined,
      submitted_by_email: String(formData.get("submitted_by_email") ?? ""),
    };

    const parsed = photoSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }

    const file = formData.get("photo") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Please select a photo to upload." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Photo must be under 5 MB." };
    }

    const supabase = createSupabaseAdminClient();

    // Upload to Storage
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${parsed.data.apartment_id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("apartment-photos")
      .upload(storagePath, file, {
        contentType: storageContentType(file),
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: "Upload failed - please try again." };
    }

    // Insert metadata
    const { error: insertError } = await supabase
      .from("apartment_photos")
      .insert({
        apartment_id: parsed.data.apartment_id,
        storage_path: storagePath,
        category: parsed.data.category,
        caption: parsed.data.caption ?? null,
        submitted_by_email: parsed.data.submitted_by_email,
        verified: false,
      });

    if (insertError) {
      // Attempt to clean up the uploaded file
      await supabase.storage.from("apartment-photos").remove([storagePath]);
      return { success: false, error: "Submission failed - please try again." };
    }

    revalidatePath(`/apartments`);
    return {
      success: true,
      redirectTo: `/apartments/${(await supabase.from("apartments").select("slug").eq("id", parsed.data.apartment_id).single()).data?.slug ?? ""}`,
    };
  } catch (err) {
    console.error("submitPhotoAction error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Review submission ─────────────────────────────────────────
export async function submitReviewAction(
  data: ReviewFormValues,
): Promise<ActionResult> {
  try {
    const parsed = reviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }

    const d = parsed.data;
    const supabase = createSupabaseAdminClient();

    // Fetch apartment slug for redirect
    const { data: apt } = await supabase
      .from("apartments")
      .select("slug")
      .eq("id", d.apartment_id)
      .single();

    const { error } = await supabase.from("apartment_reviews").insert({
      apartment_id: d.apartment_id,
      rating_overall: d.rating_overall,
      rating_maintenance: d.rating_maintenance,
      rating_management: d.rating_management,
      rating_value: d.rating_value,
      rating_safety: d.rating_safety,
      lease_term_start: `${d.lease_term_start}-01`,
      lease_term_end: `${d.lease_term_end}-01`,
      review_text: d.review_text,
      pros: d.pros ?? null,
      cons: d.cons ?? null,
      would_recommend: d.would_recommend,
      submitted_by_email: d.submitted_by_email,
      verified: false,
    });

    if (error) {
      return { success: false, error: "Submission failed - please try again." };
    }

    revalidatePath(`/apartments`);
    return {
      success: true,
      redirectTo: apt?.slug ? `/apartments/${apt.slug}` : "/apartments",
    };
  } catch (err) {
    console.error("submitReviewAction error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Sublease submission ───────────────────────────────────────
export async function submitSubleaseAction(
  data: SubleaseFormValues,
): Promise<ActionResult<{ id: string; takenToken: string }>> {
  try {
    const parsed = subleaseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation error" };
    }

    const d = parsed.data;
    const supabase = createSupabaseAdminClient();

    const contactWhatsapp = d.contact_whatsapp.trim();
    const contactInstagram = d.contact_instagram.trim();
    const contact_method = deriveContactMethod(contactWhatsapp, contactInstagram);

    const { data: row, error } = await supabase
      .from("subleases")
      .insert({
        apartment_id: d.apartment_id || null,
        custom_apartment_name: d.custom_apartment_name || null,
        rent_monthly: d.rent_monthly,
        utilities_included: d.utilities_included,
        available_from: d.available_from,
        available_until: d.available_until,
        gender_preference: d.gender_preference,
        room_type: d.room_type,
        household_diet: d.household_diet,
        furnished: d.furnished,
        amenities: d.amenities ?? [],
        move_in_notes: d.move_in_notes?.trim() ? d.move_in_notes.trim() : null,
        roommate_expectations: d.roommate_expectations?.trim()
          ? d.roommate_expectations.trim()
          : null,
        contact_whatsapp: contactWhatsapp.length > 0 ? contactWhatsapp : null,
        contact_instagram:
          contactInstagram.length > 0 ? contactInstagram : null,
        contact_method,
        additional_info: d.additional_info ?? null,
        submitted_by_email: d.submitted_by_email,
        verified: false,
        status: "active",
      })
      .select("id, taken_token")
      .single();

    if (error || !row) {
      return { success: false, error: "Submission failed - please try again." };
    }

    // Auto-log custom apartment names so admin can add them to the directory
    if (d.custom_apartment_name) {
      try {
        await supabase.from("apartment_requests").insert({
          apartment_name: d.custom_apartment_name,
          address: null,
          submitted_by_email: d.submitted_by_email,
          status: "pending",
        });
      } catch (reqErr) {
        console.error("apartment_requests auto-insert error:", reqErr);
      }
    }

    try {
      await sendAdminNotification({
        kind: "sublease",
        bodyLines: [
          "A new sublease was submitted and needs moderation.",
          `ID: ${row.id}`,
          `Rent: $${d.rent_monthly}/mo${d.utilities_included ? " (utilities included)" : ""}`,
          `Available: ${d.available_from} → ${d.available_until}`,
          d.apartment_id
            ? `Apartment ID: ${d.apartment_id}`
            : `Custom complex: ${d.custom_apartment_name ?? "(none)"}`,
          `Contact: ${contact_method}`,
        ],
      });
    } catch (notifyErr) {
      console.error("submitSubleaseAction admin email error:", notifyErr);
    }

    const submitterEmail = d.submitted_by_email?.trim();
    if (submitterEmail) {
      try {
        const apiKey = process.env.RESEND_API_KEY?.trim();
        if (apiKey) {
          let apartmentName = d.custom_apartment_name?.trim() ?? "";
          if (!apartmentName && d.apartment_id) {
            const { data: aptRow } = await supabase
              .from("apartments")
              .select("name")
              .eq("id", d.apartment_id)
              .maybeSingle();
            apartmentName = aptRow?.name?.trim() ?? "";
          }
          if (!apartmentName) apartmentName = "your complex";

          const markAsTakenUrl = `https://asu-desi-hub.vercel.app/api/subleases/${row.id}/taken?token=${row.taken_token}`;
          const submitterBody = `Hi,

Your sublease listing at ${apartmentName} has been submitted and is under review. It will appear on ASU Orbit once approved (usually within a few hours).

When your room is filled, use this link to mark it as taken so others know it's no longer available:

${markAsTakenUrl}

Thanks for listing on ASU Orbit!
`;

          const resend = new Resend(apiKey);
          const { error: submitterSendErr } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [submitterEmail],
            subject: "Your sublease is under review - ASU Orbit",
            text: submitterBody,
          });
          if (submitterSendErr) {
            console.error(
              "submitSubleaseAction submitter email Resend error:",
              submitterSendErr,
            );
          }
        }
      } catch (submitterMailErr) {
        console.error(
          "submitSubleaseAction submitter email error:",
          submitterMailErr,
        );
      }
    }

    revalidatePath("/subleases");
    return {
      success: true,
      data: { id: row.id, takenToken: row.taken_token },
    };
  } catch (err) {
    console.error("submitSubleaseAction error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Move-out sale submission ───────────────────────────────────
// FormData shape:
//   sale - JSON string of MoveoutSaleFormValues
//   items - JSON string of MoveoutItemFormValues[]
//   photo_N - File for item at index N (optional, one per item)
export async function submitMoveoutAction(
  formData: FormData,
): Promise<ActionResult<{ saleId: string }>> {
  try {
    // ── 1. Parse + validate sale data ──────────────────────────
    const rawSale = JSON.parse(
      (formData.get("sale") as string | null) ?? "{}",
    );
    const parsedSale = moveoutSaleSchema.safeParse(rawSale);
    if (!parsedSale.success) {
      return {
        success: false,
        error: parsedSale.error.issues[0]?.message ?? "Validation error",
      };
    }

    // ── 2. Parse + validate items ──────────────────────────────
    const rawItems = JSON.parse(
      (formData.get("items") as string | null) ?? "[]",
    ) as unknown[];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return { success: false, error: "Add at least one item." };
    }
    if (rawItems.length > 20) {
      return { success: false, error: "Maximum 20 items per sale." };
    }

    const parsedItems = rawItems.map((item, i) => {
      const p = moveoutItemSchema.safeParse(item);
      if (!p.success) {
        throw new Error(`Item ${i + 1}: ${p.error.issues[0]?.message ?? "Validation error"}`);
      }
      return p.data;
    });

    const supabase = createSupabaseAdminClient();
    const s = parsedSale.data;

    const contactWhatsappMove = s.contact_whatsapp.trim();
    const contactInstagramMove = s.contact_instagram.trim();
    const contactMethodMove = deriveContactMethod(
      contactWhatsappMove,
      contactInstagramMove,
    );

    // ── 3. Insert the sale ─────────────────────────────────────
    const { data: saleRow, error: saleError } = await supabase
      .from("moveout_sales")
      .insert({
        seller_name: s.seller_name,
        apartment_id: s.apartment_id || null,
        custom_location: s.custom_location || null,
        moveout_date: s.moveout_date,
        contact_whatsapp:
          contactWhatsappMove.length > 0 ? contactWhatsappMove : null,
        contact_instagram:
          contactInstagramMove.length > 0 ? contactInstagramMove : null,
        contact_method: contactMethodMove,
        additional_info: s.additional_info ?? null,
        submitted_by_email: s.submitted_by_email,
        verified: false,
        status: "active",
      })
      .select("id")
      .single();

    if (saleError || !saleRow) {
      return { success: false, error: "Submission failed - please try again." };
    }
    const saleId = saleRow.id as string;

    // ── 4. Upload photos + insert items ───────────────────────
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      let photoPath: string | null = null;

      const file = formData.get(`photo_${i}`) as File | null;
      if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) {
          // Clean up the sale on validation failure mid-loop
          await supabase.from("moveout_sales").delete().eq("id", saleId);
          return { success: false, error: `Photo for "${item.name}" exceeds 5 MB.` };
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        photoPath = `${saleId}/${i}_${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("moveout-photos")
          .upload(photoPath, file, {
            contentType: storageContentType(file),
            upsert: false,
          });
        if (uploadErr) {
          photoPath = null; // non-fatal - insert item without photo
        }
      }

      const { error: itemError } = await supabase.from("moveout_items").insert({
        moveout_sale_id: saleId,
        name: item.name,
        category: item.category,
        price: item.price,
        condition: item.condition,
        description: item.description ?? null,
        photo_path: photoPath,
        status: "available",
      });

      if (itemError) {
        // Cascade delete will clean up items; delete the sale itself
        await supabase.from("moveout_sales").delete().eq("id", saleId);
        return { success: false, error: "Submission failed - please try again." };
      }
    }

    // Auto-log custom locations so admin can add them to the directory
    if (s.custom_location) {
      try {
        await supabase.from("apartment_requests").insert({
          apartment_name: s.custom_location,
          address: null,
          submitted_by_email: s.submitted_by_email,
          status: "pending",
        });
      } catch (reqErr) {
        console.error("apartment_requests auto-insert error:", reqErr);
      }
    }

    try {
      await sendAdminNotification({
        kind: "moveout_sale",
        bodyLines: [
          "A new move-out sale was submitted and needs moderation.",
          `Sale ID: ${saleId}`,
          `Seller: ${s.seller_name}`,
          `Move-out date: ${s.moveout_date}`,
          s.apartment_id
            ? `Apartment ID: ${s.apartment_id}`
            : `Custom location: ${s.custom_location ?? "(none)"}`,
          `Items: ${parsedItems.length}`,
          `Submitted by: ${s.submitted_by_email}`,
          `Contact: ${contactMethodMove}`,
        ],
      });
    } catch (notifyErr) {
      console.error("submitMoveoutAction admin email error:", notifyErr);
    }

    revalidatePath("/moveout");
    revalidatePath("/marketplace");
    return { success: true, data: { saleId } };
  } catch (err) {
    console.error("submitMoveoutAction error:", err);
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    return { success: false, error: msg };
  }
}

// ── Standalone listing submission ─────────────────────────────
// FormData shape:
//   listing - JSON string of ListingFormValues
//   photo - File (optional)
export async function submitListingAction(
  formData: FormData,
): Promise<ActionResult<{ listingId: string }>> {
  try {
    const rawListing = JSON.parse(
      (formData.get("listing") as string | null) ?? "{}",
    );
    const parsed = listingSchema.safeParse(rawListing);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Validation error",
      };
    }

    const supabase = createSupabaseAdminClient();
    const d = parsed.data;

    const contactWhatsappListing = d.contact_whatsapp.trim();
    const contactInstagramListing = d.contact_instagram.trim();
    const contactMethodListing = deriveContactMethod(
      contactWhatsappListing,
      contactInstagramListing,
    );
    let photoPath: string | null = null;
    const file = formData.get("photo") as File | null;
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: "Photo must be under 5 MB." };
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      photoPath = `listings/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("moveout-photos")
        .upload(photoPath, file, {
          contentType: storageContentType(file),
          upsert: false,
        });
      if (uploadErr) {
        photoPath = null; // non-fatal
      }
    }

    const { data: row, error } = await supabase
      .from("listings")
      .insert({
        title: d.title,
        category: d.category,
        price: d.price,
        condition: d.condition,
        description: d.description ?? null,
        photo_path: photoPath,
        contact_whatsapp:
          contactWhatsappListing.length > 0 ? contactWhatsappListing : null,
        contact_instagram:
          contactInstagramListing.length > 0 ? contactInstagramListing : null,
        contact_method: contactMethodListing,
        submitted_by_email: d.submitted_by_email,
        verified: false,
        status: "available",
        apartment_id:
          d.apartment_id && d.apartment_id.length > 0 ? d.apartment_id : null,
        custom_apartment_name:
          d.apartment_id && d.apartment_id.length > 0
            ? null
            : d.custom_apartment_name?.trim() || null,
      })
      .select("id")
      .single();

    if (error || !row) {
      return { success: false, error: "Submission failed - please try again." };
    }

    try {
      const listingId = row.id as string;
      await sendAdminNotification({
        kind: "listing",
        bodyLines: [
          "A new marketplace listing was submitted and needs moderation.",
          `ID: ${listingId}`,
          `Title: ${d.title}`,
          `Category: ${d.category}`,
          `Price: $${d.price}`,
          `Condition: ${d.condition}`,
          d.apartment_id
            ? `Apartment ID: ${d.apartment_id}`
            : `Custom complex: ${d.custom_apartment_name?.trim() || "(none)"}`,
          `Photo: ${photoPath ? "yes" : "no"}`,
          `Submitted by: ${d.submitted_by_email}`,
          `Contact: ${contactMethodListing}`,
        ],
      });
    } catch (notifyErr) {
      console.error("submitListingAction admin email error:", notifyErr);
    }

    revalidatePath("/marketplace");
    return { success: true, data: { listingId: row.id as string } };
  } catch (err) {
    console.error("submitListingAction error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Apartment directory request ────────────────────────────────
export async function requestApartmentAction(data: {
  apartment_name: string;
  address?: string;
  submitted_by_email?: string;
}): Promise<ActionResult> {
  try {
    if (!data.apartment_name?.trim()) {
      return { success: false, error: "Apartment name is required." };
    }
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("apartment_requests").insert({
      apartment_name: data.apartment_name.trim(),
      address: data.address?.trim() || null,
      submitted_by_email: data.submitted_by_email?.trim() || null,
      status: "pending",
    });
    if (error) {
      return { success: false, error: "Request failed - please try again." };
    }
    return { success: true };
  } catch (err) {
    console.error("requestApartmentAction error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
