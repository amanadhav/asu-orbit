import type { Metadata } from "next";

import { getApartments } from "@/lib/supabase/queries";
import { SubmitPhotoForm } from "./submit-photo-form";

export const metadata: Metadata = {
  title: "Submit a photo",
  description: "Share a photo of your apartment to help other students at ASU.",
};

export default async function SubmitPhotoPage({
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
          Submit a photo
        </h1>
        <p className="text-muted-foreground">
          Real photos from residents - not the leasing-office brochure shots - are the entire point of this directory. Thank you for contributing.
        </p>
      </div>
      <SubmitPhotoForm
        apartments={apartments}
        preselectedApartmentId={preselected?.id}
      />
    </div>
  );
}
