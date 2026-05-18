/**
 * scripts/fetch-street-view-photos.ts
 *
 * Fetches Google Street View photos (outdoor + indoor) for every apartment in
 * the database and uploads them to Supabase Storage (apartment-photos bucket),
 * then inserts verified rows into apartment_photos.
 *
 * Outdoor photo also sets cover_photo_id on the apartment row so the card
 * thumbnail renders on the /apartments listing page.
 *
 * Duplicate-pano detection: if Street View resolves two different addresses to
 * the same panorama ID (which happens when the nearest outdoor pano is a road
 * intersection shared by several blocks), the second apartment is skipped for
 * that photo type rather than uploading the same road photo twice.
 *
 * Run:
 *   npx tsx scripts/fetch-street-view-photos.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GOOGLE_STREET_VIEW_API_KEY
 */

import axios from "axios";
import * as path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local from the project root.
const envResult = dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});
if (envResult.error) {
  console.error("Failed to load .env.local:", envResult.error.message);
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STREET_VIEW_KEY  = process.env.GOOGLE_STREET_VIEW_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !STREET_VIEW_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, " +
    "SUPABASE_SERVICE_ROLE_KEY, GOOGLE_STREET_VIEW_API_KEY",
  );
  process.exit(1);
}

const DELAY_BETWEEN_MS = 1_500;

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreetViewMetadata {
  status: string;
  pano_id?: string;
  location?: { lat: number; lng: number };
  copyright?: string;
  date?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getOutdoorMetadata(address: string): Promise<StreetViewMetadata> {
  const { data } = await axios.get<StreetViewMetadata>(
    "https://maps.googleapis.com/maps/api/streetview/metadata",
    { params: { location: address, key: STREET_VIEW_KEY, source: "outdoor" } },
  );
  return data;
}

async function fetchOutdoorImage(address: string): Promise<Buffer> {
  const { data } = await axios.get<ArrayBuffer>(
    "https://maps.googleapis.com/maps/api/streetview",
    {
      params: {
        size: "1200x800",
        location: address,
        key: STREET_VIEW_KEY,
        source: "outdoor",
        fov: 90,
        pitch: 10,
      },
      responseType: "arraybuffer",
    },
  );
  return Buffer.from(data);
}

/** Returns photo IDs of existing street-view photos for this apartment. */
async function existingStreetViewPaths(
  apartmentId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("apartment_photos")
    .select("storage_path")
    .eq("apartment_id", apartmentId)
    .ilike("storage_path", "%street-view%");
  return (data ?? []).map((r: { storage_path: string }) => r.storage_path);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { data: apartments, error: fetchError } = await supabase
    .from("apartments")
    .select("id, name, slug, address")
    .not("address", "is", null)
    .order("name");

  if (fetchError || !apartments) {
    console.error("Failed to fetch apartments:", fetchError?.message);
    process.exit(1);
  }

  console.log(`Found ${apartments.length} apartments to process.\n`);

  let uploadedExterior = 0;
  let skippedNoView = 0;
  let skippedDuplicate = 0;
  let skippedExists = 0;

  // Track seen pano IDs so we don't upload the same road intersection for multiple apartments
  const seenOutdoorPanoIds = new Set<string>();

  for (const apt of apartments) {
    const { id, name, slug, address } = apt as {
      id: string; name: string; slug: string; address: string;
    };

    console.log(`\n🏢 ${name}`);

    const existing = await existingStreetViewPaths(id);
    const hasExterior = existing.some((p) => p.includes("street-view-exterior"));

    // ── Outdoor / exterior ───────────────────────────────────────────────────

    if (hasExterior) {
      console.log(`   ⏭️  exterior already exists`);
      skippedExists++;
    } else {
      let outdoorMeta: StreetViewMetadata;
      try {
        outdoorMeta = await getOutdoorMetadata(address);
      } catch (err) {
        console.error(`   ⚠️  outdoor metadata failed:`, (err as Error).message);
        await sleep(DELAY_BETWEEN_MS);
        continue;
      }

      if (outdoorMeta.status !== "OK" || !outdoorMeta.pano_id) {
        console.log(`   🚫 no outdoor street view`);
        skippedNoView++;
      } else if (seenOutdoorPanoIds.has(outdoorMeta.pano_id)) {
        console.log(
          `   ⚠️  pano_id ${outdoorMeta.pano_id.slice(0, 12)}… already used by another apartment — likely a road intersection, skipping`,
        );
        skippedDuplicate++;
      } else {
        seenOutdoorPanoIds.add(outdoorMeta.pano_id);

        let imgBuffer: Buffer;
        try {
          imgBuffer = await fetchOutdoorImage(address);
        } catch (err) {
          console.error(`   ⚠️  outdoor fetch failed:`, (err as Error).message);
          await sleep(DELAY_BETWEEN_MS);
          continue;
        }

        const storagePath = `${slug}/street-view-exterior.jpg`;

        const { error: uploadErr } = await supabase.storage
          .from("apartment-photos")
          .upload(storagePath, imgBuffer, { contentType: "image/jpeg", upsert: true });

        if (uploadErr) {
          console.error(`   ⚠️  storage upload failed:`, uploadErr.message);
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from("apartment_photos")
            .insert({
              apartment_id: id,
              storage_path: storagePath,
              category: "exterior",
              caption: `Street view of ${name}`,
              submitted_by_email: "admin@asudesihub.com",
              verified: true,
            })
            .select("id")
            .single();

          if (insertErr) {
            console.error(`   ⚠️  DB insert failed:`, insertErr.message);
            await supabase.storage.from("apartment-photos").remove([storagePath]);
          } else {
            // Set as cover photo if not already set
            await supabase
              .from("apartments")
              .update({ cover_photo_id: (inserted as { id: string }).id })
              .eq("id", id)
              .is("cover_photo_id", null);

            console.log(`   ✅ exterior uploaded (pano ${outdoorMeta.pano_id!.slice(0, 12)}…)`);
            uploadedExterior++;
          }
        }
      }
    }

    // ── Indoor / interior ────────────────────────────────────────────────────
    // NOTE: Google's Street View Static API does not support source=indoor.
    // Indoor business panoramas are only available via the Maps JavaScript API
    // (browser-rendered), which cannot be fetched as a static JPEG buffer.
    // Interior photos must be submitted manually through the app's upload form.

    await sleep(DELAY_BETWEEN_MS);
  }

  console.log(
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Done!\n` +
    `  ✅ exterior uploaded : ${uploadedExterior}\n` +
    `  🚫 no outdoor view  : ${skippedNoView}\n` +
    `  ⚠️  duplicate pano   : ${skippedDuplicate}\n` +
    `  ⏭️  already existed  : ${skippedExists}\n`,
  );
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
