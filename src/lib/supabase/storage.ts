/**
 * Pure URL helpers for Supabase Storage.
 * This file has NO server-only imports so it is safe to use in Client Components.
 */

/** Public URL for a file in the apartment-photos bucket. */
export function getPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/apartment-photos/${storagePath}`;
}

/** Public URL for a file in the moveout-photos bucket. */
export function getMoveoutPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/moveout-photos/${storagePath}`;
}
