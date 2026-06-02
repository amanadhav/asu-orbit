import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingNotice } from "@/components/listing-notice";
import { getMoveoutItems, getApartments } from "@/lib/supabase/queries";
import { MoveoutGrid } from "./moveout-grid";

export const metadata: Metadata = {
  title: "Move-out sales",
  description: "Furniture, electronics, and household items from students moving out near ASU Tempe.",
};

export default async function MoveoutPage() {
  const [items, apartments] = await Promise.all([
    getMoveoutItems().catch(() => []),
    getApartments().catch(() => []),
  ]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Move-out sales
        </p>
        <h1 className="font-heading mb-2 mt-1 text-3xl font-bold tracking-tight">
          Items from students moving out
        </h1>
        <p className="mb-6 text-muted-foreground">
          Items listed by students moving out near ASU Tempe.
        </p>
        <ListingNotice />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border bg-card py-20 text-center shadow-sm">
          <p className="text-muted-foreground">No active listings right now.</p>
          <Button
            asChild
            className="bg-asu-gold text-white hover:bg-yellow-500 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500"
          >
            <Link href="/submit/moveout">
              <PlusCircle className="size-4" />
              List your move-out sale
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
            Move-out sales
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Items from students moving out
          </h1>
          <p className="mt-1 text-muted-foreground">
            Items listed by students moving out near ASU Tempe.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-asu-gold text-white hover:bg-yellow-500 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500"
        >
          <Link href="/submit/moveout">
            <PlusCircle className="size-4" />
            List your sale
          </Link>
        </Button>
      </div>

      <ListingNotice />

      <div className="mt-8">
        <MoveoutGrid items={items} apartments={apartments} />
      </div>
    </div>
  );
}
