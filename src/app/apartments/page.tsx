import type { Metadata } from "next";

import { ApartmentGrid } from "./apartment-grid";
import { getApartments } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Apartments",
  description:
    "Browse apartments near ASU Tempe with resident photos, honest reviews, and quick facts on rent, distance, and sublease policies.",
};

export default async function ApartmentsPage() {
  let apartments = await getApartments().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Directory
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Apartments near ASU
        </h1>
        <p className="text-muted-foreground">
          {apartments.length} complexes - resident photos, honest management
          reviews, rent ranges, and sublease policies in one place.
        </p>
      </div>

      {apartments.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center">
          <p className="text-base font-semibold">No apartments in the directory yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Supabase and run the seed to see listings here.
          </p>
        </div>
      ) : (
        <ApartmentGrid apartments={apartments} />
      )}
    </div>
  );
}
