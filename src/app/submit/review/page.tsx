import type { Metadata } from "next";

import { getApartments } from "@/lib/supabase/queries";
import { SubmitReviewForm } from "./submit-review-form";

export const metadata: Metadata = {
  title: "Submit a review",
  description: "Share your honest experience to help students at ASU find the right apartment.",
};

export default async function SubmitReviewPage({
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
          Write a review
        </h1>
        <p className="text-muted-foreground">
          Honest management reviews - especially around maintenance response and
          deposit returns - are the most valuable thing in this directory. Say what
          you actually experienced.
        </p>
      </div>
      <SubmitReviewForm
        apartments={apartments}
        preselectedApartmentId={preselected?.id}
      />
    </div>
  );
}
