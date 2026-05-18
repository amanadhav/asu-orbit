import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client with no cookie/session plumbing.
 * Use for public reads so routes can stay fully static (generateStaticParams /
 * generateMetadata) without triggering next/headers cookies().
 */
export function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(url, anonKey);
}
