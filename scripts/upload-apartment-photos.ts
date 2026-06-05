/**
 * scripts/upload-apartment-photos.ts
 *
 * Bulk-uploads apartment photos from a local folder to Supabase Storage and
 * inserts verified rows into apartment_photos.  Sets cover_photo_id on the
 * apartment if it has none.
 *
 * Folder layout expected:
 *
 *   <PHOTOS_DIR>/
 *     Alight Tempe/          ← folder name matched against apartment.name (case-insensitive)
 *       bedroom-1.jpg
 *       kitchen.jpg
 *     District on Apache/
 *       exterior.jpg
 *     ...
 *
 * Category is inferred from the filename:
 *   bedroom → bedroom   kitchen → kitchen   bathroom → bathroom
 *   living / lounge     gym / fitness        pool / amenity
 *   parking / garage    exterior / building  hallway / corridor
 *   anything else       → other
 *
 * Supported image formats: .jpg / .jpeg / .png / .webp
 *
 * Usage:
 *   npx tsx scripts/upload-apartment-photos.ts [path-to-photos-folder]
 *
 * If no path is given it looks for a "photos" folder in the project root.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs   from "fs";
import * as path from "path";
import dotenv    from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const PHOTOS_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(process.cwd(), "photos");

if (!fs.existsSync(PHOTOS_DIR)) {
  console.error(`Photos folder not found: ${PHOTOS_DIR}`);
  console.error(`Usage: npx tsx scripts/upload-apartment-photos.ts <path-to-photos-folder>`);
  process.exit(1);
}

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MIME: Record<string, string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
};

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type PhotoCategory =
  | "bedroom" | "kitchen" | "bathroom" | "living"
  | "gym" | "pool" | "parking" | "exterior" | "hallway" | "other";

function inferCategory(filename: string): PhotoCategory {
  const f = filename.toLowerCase();
  if (/bedroom|bed\b|room/.test(f))           return "bedroom";
  if (/kitchen|cook/.test(f))                  return "kitchen";
  if (/bathroom|bath|shower/.test(f))          return "bathroom";
  if (/living|lounge|common/.test(f))          return "living";
  if (/gym|fitness|work.?out/.test(f))         return "gym";
  if (/pool|amenity|spa/.test(f))              return "pool";
  if (/parking|garage|lot/.test(f))            return "parking";
  if (/exterior|building|outside|front|street|view/.test(f)) return "exterior";
  if (/hallway|corridor|lobby|entrance/.test(f)) return "hallway";
  return "other";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load all apartments
  const { data: apartments, error } = await supabase
    .from("apartments")
    .select("id, name, slug, cover_photo_id");
  if (error || !apartments) {
    console.error("Could not fetch apartments:", error?.message);
    process.exit(1);
  }

  // Index by normalised name and by slug for fast lookup
  const byName  = new Map(apartments.map((a) => [a.name.toLowerCase().trim(), a]));
  const bySlug  = new Map(apartments.map((a) => [a.slug, a]));

  const folders = fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  if (folders.length === 0) {
    console.error(`No sub-folders found inside ${PHOTOS_DIR}`);
    process.exit(1);
  }

  console.log(`📂 Photos folder : ${PHOTOS_DIR}`);
  console.log(`🏢 Apartments DB : ${apartments.length} found`);
  console.log(`📁 Folders found : ${folders.length}\n`);

  let uploaded = 0;
  let skipped  = 0;
  let unmatched: string[] = [];

  for (const folder of folders) {
    const folderName = folder.name;

    // Match folder name → apartment
    const apt =
      byName.get(folderName.toLowerCase().trim()) ??
      bySlug.get(slugify(folderName));

    if (!apt) {
      console.log(`❓ "${folderName}" - no matching apartment found, skipping`);
      unmatched.push(folderName);
      continue;
    }

    const { id, name, slug } = apt as { id: string; name: string; slug: string; cover_photo_id: string | null };

    const images = fs
      .readdirSync(path.join(PHOTOS_DIR, folderName))
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort();

    if (images.length === 0) {
      console.log(`📁 "${folderName}" - no image files found`);
      continue;
    }

    console.log(`\n🏢 ${name} (${images.length} image${images.length !== 1 ? "s" : ""})`);

    let firstPhotoId: string | null = null;

    for (const imgFile of images) {
      const ext          = path.extname(imgFile).toLowerCase();
      const imgPath      = path.join(PHOTOS_DIR, folderName, imgFile);
      const buffer       = fs.readFileSync(imgPath);
      const category     = inferCategory(path.basename(imgFile, ext));
      const storagePath  = `${slug}/${imgFile}`;
      const contentType  = MIME[ext] ?? "image/jpeg";

      // Upload (upsert so re-running is safe)
      const { error: uploadErr } = await supabase.storage
        .from("apartment-photos")
        .upload(storagePath, buffer, { contentType, upsert: true });

      if (uploadErr) {
        console.log(`   ⚠️  ${imgFile} - upload failed: ${uploadErr.message}`);
        skipped++;
        continue;
      }

      // Upsert DB row (match on storage_path to avoid duplicates)
      const { data: existing } = await supabase
        .from("apartment_photos")
        .select("id")
        .eq("storage_path", storagePath)
        .maybeSingle();

      let photoId: string;

      if (existing) {
        photoId = existing.id;
        console.log(`   ⏭️  ${imgFile} - already in DB (${category}), storage updated`);
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("apartment_photos")
          .insert({
            apartment_id: id,
            storage_path: storagePath,
            category,
            caption: null,
            submitted_by_email: "admin@asudesihub.com",
            verified: true,
          })
          .select("id")
          .single();

        if (insertErr || !inserted) {
          console.log(`   ⚠️  ${imgFile} - DB insert failed: ${insertErr?.message}`);
          await supabase.storage.from("apartment-photos").remove([storagePath]);
          skipped++;
          continue;
        }

        photoId = (inserted as { id: string }).id;
        console.log(`   ✅ ${imgFile} - uploaded (${category})`);
        uploaded++;
      }

      if (!firstPhotoId) firstPhotoId = photoId;
    }

    // Set cover_photo_id if apartment has none
    if (firstPhotoId) {
      const current = (apt as { cover_photo_id: string | null }).cover_photo_id;
      if (!current) {
        await supabase
          .from("apartments")
          .update({ cover_photo_id: firstPhotoId })
          .eq("id", id);
        console.log(`   🖼️  cover photo set`);
      }
    }
  }

  console.log(
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Done!\n` +
    `  ✅ uploaded   : ${uploaded}\n` +
    `  ⏭️  skipped    : ${skipped}\n` +
    `  ❓ unmatched  : ${unmatched.length}\n`,
  );

  if (unmatched.length > 0) {
    console.log("Unmatched folders (no apartment with this name):");
    unmatched.forEach((f) => console.log(`  • ${f}`));
    console.log(
      "\nTip: folder name must match the apartment name exactly (case-insensitive)\n" +
      "or its slug (lowercase, spaces → hyphens). Example: 'Alight Tempe' or 'alight-tempe'",
    );
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

