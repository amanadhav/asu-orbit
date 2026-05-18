import type { Metadata } from "next";

import { getApartments } from "@/lib/supabase/queries";
import { SubmitSubleaseForm } from "./submit-sublease-form";

export const metadata: Metadata = {
  title: "List your sublease",
  description: "Post your sublease on the ASU Desi Hub board - reaches Indian students actively searching.",
};

export default async function SubmitSubleasePage({
  searchParams,
}: {
  searchParams: Promise<{ apartment?: string }>;
}) {
  const { apartment: preselectedSlug } = await searchParams;
  const apartments = await getApartments().catch(() => []);
  const preselected = preselectedSlug
    ? apartments.find((a) => a.slug === preselectedSlug)
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Submit</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          List your sublease
        </h1>
        <p className="text-muted-foreground">
          Listings are active for 30 days and visible to Indian students searching
          for housing near ASU Tempe. You'll receive a private link to mark it as
          taken when filled.
        </p>
      </div>
      <SubmitSubleaseForm
        apartments={apartments}
        preselectedApartmentId={preselected?.id}
      />
    </div>
  );
}
