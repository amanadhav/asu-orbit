import Link from "next/link";
import { ArrowRight, Building2, Camera, KeyRound, PenLine, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";

import { getMarketplaceItems, getRecentSubleases } from "@/lib/supabase/queries";
import type { ItemCondition, MarketplaceItem } from "@/lib/types";

const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

const CONDITION_COLORS: Record<ItemCondition, string> = {
  new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  like_new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  good: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  fair: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

function marketplaceItemHref(item: MarketplaceItem): string {
  if (item.listing_type === "moveout" && item.sale_href) return item.sale_href;
  return `/marketplace/${item.id}`;
}

const comingSoon = [
  "Roommate requests - veg households, budget fit, move-in timing",
  "Guides - transit, food spots, free campus events, weekend trips, survival tips",
];

export default async function HomePage() {
  const [recentSubleases, marketplaceFeed] = await Promise.all([
    getRecentSubleases(3).catch(() => []),
    getMarketplaceItems().catch(() => []),
  ]);

  const recentMarketplaceItems = marketplaceFeed.slice(0, 3);
  const showLatestPreview =
    recentSubleases.length > 0 || recentMarketplaceItems.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:py-16">
      {/* ── Hero ── */}
      <section className="flex flex-col gap-6">
        <Badge className="w-fit rounded-full border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
          For Indian students at ASU
        </Badge>
        <div className="max-w-3xl space-y-4">
          <p className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
            ASU Desi Hub
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Real apartments. Honest subleases.
          </h1>
          <p className="text-lg font-medium text-muted-foreground sm:text-xl">
            Built for the Tempe grind.
          </p>
          <p className="max-w-2xl text-lg text-muted-foreground">
            ASU Desi Hub is two things working together: a photo-backed apartment
            directory with resident truth on management and deposits, and a
            structured sublease board filtered the way desi house hunts actually
            work - dates, rent, room type, gender preference, and veg vs
            non-veg households.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400"
          >
            <Link href="/apartments">
              Browse apartments
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/subleases">
              See subleases
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Latest: subleases + marketplace ── */}
      {showLatestPreview && (
        <section aria-labelledby="latest-preview-heading">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Latest
              </p>
              <h2
                id="latest-preview-heading"
                className="mt-1 font-heading text-2xl font-bold tracking-tight"
              >
                Subleases &amp; marketplace
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Active sublease listings from students leaving before lease end,
                plus move-out items and direct listings near ASU Tempe.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:shrink-0 sm:justify-end">
              <Link
                href="/subleases"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 underline-offset-4 transition-colors hover:text-amber-500 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
              >
                Subleases
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 underline-offset-4 transition-colors hover:text-amber-500 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
              >
                Marketplace
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {recentSubleases.length > 0 && (
            <div className={recentMarketplaceItems.length > 0 ? "space-y-3" : ""}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent subleases
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {recentSubleases.map((s) => {
                  const name =
                    s.apartments?.name ?? s.custom_apartment_name ?? "Unknown complex";
                  return (
                    <Link
                      key={s.id}
                      href={`/subleases/${s.id}`}
                      className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                      <p className="font-semibold leading-tight transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {name}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                        ${s.rent_monthly.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">
                          /mo
                        </span>
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {s.room_type === "private" ? "Private room" : "Shared room"} ·
                        Avail.{" "}
                        {format(parseISO(s.available_from), "MMM d")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {recentMarketplaceItems.length > 0 && (
            <div
              className={
                recentSubleases.length > 0 ? "mt-10 space-y-3" : "space-y-3"
              }
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marketplace picks
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {recentMarketplaceItems.map((item) => (
                  <Link
                    key={`${item.listing_type}-${item.id}`}
                    href={marketplaceItemHref(item)}
                    className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    <p className="font-semibold leading-tight transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {item.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {item.price === 0 ? "FREE" : `$${item.price}`}
                    </p>
                    <span
                      className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[item.condition]}`}
                    >
                      {CONDITION_LABELS[item.condition]}
                    </span>
                    <p className="mt-4 text-xs font-medium text-amber-600 dark:text-amber-400">
                      View →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Two pillars ── */}
      <section aria-labelledby="pillars-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Platform
        </p>
        <h2
          id="pillars-heading"
          className="mb-6 mt-1 font-heading text-2xl font-semibold tracking-tight"
        >
          What you get
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="flex flex-col shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Building2 className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-xl font-semibold">Apartment directory</CardTitle>
              <CardDescription className="text-base">
                Resident photos (not leasing-office stock shots), honest
                reviews on maintenance and deposit returns, quick facts on
                rent, walk distance, and sublease rules - everything you need
                before you sign.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto border-t pt-4">
              <Button
                asChild
                className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 sm:w-auto"
              >
                <Link href="/apartments">
                  Browse apartments
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <KeyRound className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-xl font-semibold">Sublease board</CardTitle>
              <CardDescription className="text-base">
                Listings tied to buildings in the directory - filter by
                move-in dates, rent, private vs shared room, gender
                preference, and household diet when it matters for your thali
                situation.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto border-t pt-4">
              <Button
                asChild
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/subleases">
                  See subleases
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col shadow-sm transition-shadow duration-200 hover:shadow-md md:col-span-2">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <ShoppingBag className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-xl font-semibold">Marketplace</CardTitle>
              <CardDescription className="text-base">
                Two types of listings in one place: move-out sales where
                students leaving Tempe list everything at once, and direct
                listings for selling a single item any time of year - both
                often at steep discounts or free. Filter by category,
                condition, and listing type.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto border-t pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/marketplace">
                  Browse marketplace
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* ── Submit CTAs ── */}
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contribute
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Help build the directory
          </h2>
          <p className="text-muted-foreground">
            Photos and honest reviews are the whole point. If you live or
            have lived near ASU, your submission makes this better for
            every student who comes after you.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/submit/photo">
              <Camera className="size-4" />
              Submit a photo
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit/review">
              <PenLine className="size-4" />
              Write a review
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit/sublease">
              <KeyRound className="size-4" />
              List your sublease
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit/moveout">
              <ShoppingBag className="size-4" />
              List a move-out sale
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/submit/listing">
              <ShoppingBag className="size-4" />
              Sell an item
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Coming soon ── */}
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Roadmap
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            What&apos;s coming next
          </h2>
          <p className="text-muted-foreground">
            After the two pillars ship, community tools - still practical,
            still mobile-first.
          </p>
        </div>
        <Separator className="my-6" />
        <ul className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {comingSoon.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500/70"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
