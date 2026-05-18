import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/subleases/[id]/taken?token=<taken_token>
 *
 * Allows the original lister to self-mark their listing as taken.
 * The token is a UUID generated at insert time and returned only
 * on the submission success page - it is never shown publicly.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!id || !token) {
    return NextResponse.redirect(`${origin}/subleases?error=invalid_token`);
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Verify the token against the stored value.
    const { data, error } = await supabase
      .from("subleases")
      .select("id, status, taken_token")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.redirect(`${origin}/subleases?error=not_found`);
    }
    if (data.taken_token !== token) {
      return NextResponse.redirect(`${origin}/subleases?error=invalid_token`);
    }
    if (data.status === "taken") {
      return NextResponse.redirect(
        `${origin}/subleases?msg=already_taken`,
      );
    }

    const { error: updateError } = await supabase
      .from("subleases")
      .update({ status: "taken" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.redirect(`${origin}/subleases?error=update_failed`);
    }

    return NextResponse.redirect(`${origin}/subleases?msg=marked_taken`);
  } catch {
    return NextResponse.redirect(`${origin}/subleases?error=server_error`);
  }
}
