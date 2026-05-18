import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingNotice } from "@/components/listing-notice";
import { getSubleases, getApartments } from "@/lib/supabase/queries";
import { SubleaseGrid } from "./sublease-grid";

export const metadata: Metadata = {
  title: "Sublease board",
  description: "Verified student subleases near ASU Tempe campus, posted by Indian students.",
};

export default async function SubleasesPage() {
  const [subleases, apartments] = await Promise.all([
    getSubleases().catch(() => []),
    getApartments().catch(() => []),
  ]);

  if (subleases.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sublease board
        </p>
        <h1 className="font-heading mb-2 mt-1 text-3xl font-bold tracking-tight">
          Find your next place
        </h1>
        <p className="mb-6 text-muted-foreground">
          Verified listings from Indian students near ASU Tempe.
        </p>
        <ListingNotice />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border bg-card py-20 text-center shadow-sm">
          <p className="text-muted-foreground">No active subleases right now.</p>
          <Button
            asChild
            className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400"
          >
            <Link href="/submit/sublease">
              <PlusCircle className="size-4" />
              Post your sublease
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sublease board
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Find your next place
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verified listings from Indian students near ASU Tempe.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400"
        >
          <Link href="/submit/sublease">
            <PlusCircle className="size-4" />
            Post a sublease
          </Link>
        </Button>
      </div>

      <ListingNotice />

      <div className="mt-8">
        <SubleaseGrid subleases={subleases} apartments={apartments} />
      </div>
    </div>
  );
}
