import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlusCircle, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingNotice } from "@/components/listing-notice";
import { getMarketplaceItems } from "@/lib/supabase/queries";
import { MarketplaceGrid } from "./marketplace-grid";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Buy furniture, electronics, and household items from students near ASU Tempe - move-out sales and direct listings in one place.",
};

export default async function MarketplacePage() {
  const items = await getMarketplaceItems().catch(() => []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Marketplace
        </p>
        <h1 className="font-heading mb-2 mt-1 text-3xl font-bold tracking-tight">
          Buy &amp; sell near ASU
        </h1>
        <p className="mb-6 text-muted-foreground">
          Move-out sales and direct listings from students near ASU Tempe.
        </p>
        <ListingNotice />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border bg-card py-20 text-center shadow-sm">
          <ShoppingBag className="size-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">No active listings right now.</p>
          <Button
            asChild
            className="bg-asu-gold text-white hover:bg-yellow-500 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500"
          >
            <Link href="/submit/listing">
              <PlusCircle className="size-4" />
              Sell an item
            </Link>
          </Button>
          <Link
            href="/submit/moveout"
            className="flex items-center gap-1 text-sm text-asu-gold underline-offset-4 hover:underline dark:text-asu-gold"
          >
            Moving out? List everything at once
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Marketplace
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Buy &amp; sell near ASU
          </h1>
          <p className="mt-1 text-muted-foreground">
            Move-out sales and direct listings from students near ASU Tempe.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Button
            asChild
            size="sm"
            className="bg-asu-gold text-white hover:bg-yellow-500 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500"
          >
            <Link href="/submit/listing">
              <PlusCircle className="size-4" />
              Sell an item
            </Link>
          </Button>
          <Link
            href="/submit/moveout"
            className="flex items-center gap-1 text-xs text-asu-gold underline-offset-4 hover:underline dark:text-asu-gold"
          >
            Moving out? List everything at once
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      <ListingNotice />

      <div className="mt-8">
        <MarketplaceGrid items={items} />
      </div>
    </div>
  );
}
