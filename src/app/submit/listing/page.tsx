import type { Metadata } from "next";

import { getApartments } from "@/lib/supabase/queries";
import { SubmitListingForm } from "./submit-listing-form";

export const metadata: Metadata = {
  title: "Sell an item",
  description:
    "List furniture, electronics, or any item for sale to ASU students - no move-out event required.",
};

export default async function SubmitListingPage() {
  const apartments = await getApartments().catch(() => []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Submit</p>
      <h1 className="font-heading mb-1 text-3xl font-bold tracking-tight">
        Sell an item
      </h1>
      <p className="mb-8 text-muted-foreground">
        Listing a single item? Post it here directly - no move-out event needed.
        It will appear in the Marketplace alongside move-out sale items.
      </p>
      <SubmitListingForm apartments={apartments} />
    </div>
  );
}
