import Image from "next/image";
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

/** Placeholder hero - replace with a local asset when ready. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=85";

export default async function HomePage() {
  const [recentSubleases, marketplaceFeed] = await Promise.all([
    getRecentSubleases(3).catch(() => []),
    getMarketplaceItems().catch(() => []),
  ]);

  const recentMarketplaceItems = marketplaceFeed.slice(0, 3);
  const showLatestPreview =
    recentSubleases.length > 0 || recentMarketplaceItems.length > 0;

  return (
    <>
      {/* ── Hero (full-width image) ── */}
      <section className="w-full px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <div className="relative min-h-[min(78vh,720px)] w-full">
            <Image
              src={HERO_IMAGE}
              alt="Modern apartment buildings"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1152px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-[min(78vh,720px)] flex-col justify-end gap-6 p-6 sm:p-10 md:p-12">
              <Badge className="w-fit rounded-full border-asu-gold/50 bg-asu-gold/10 text-asu-gold shadow-sm backdrop-blur-md">
                For all students at ASU
              </Badge>
              <div className="max-w-3xl space-y-4 text-white">
                <p className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-asu-gold via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  ASU Orbit
                </p>
                <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                  Real apartments. Honest subleases.
                </h1>
                <p className="text-lg font-medium text-white/90 sm:text-xl">
                  Built for the Tempe grind.
                </p>
                <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg [text-shadow:0_1px_3px_rgb(0_0_0_/_0.75),0_2px_16px_rgb(0_0_0_/_0.5)]">
                  A photo-backed apartment directory with resident truth on
                  management and deposits, plus a sublease board filtered the way
                  house hunts actually work - dates, rent, room type,
                  gender preference, and veg vs non-veg households.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl dark:border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-asu-gold text-black hover:bg-yellow-500 transition-transform active:scale-95"
                    >
                      <Link href="/apartments">
                        Browse apartments
                        <ArrowRight className="size-4 ml-1" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-asu-maroon/50 text-white bg-black/50 hover:bg-asu-maroon/20 hover:text-white transition-transform active:scale-95"
                    >
                      <Link href="/subleases">
                        See subleases
                        <ArrowRight className="size-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Search bar placeholder matching image */}
                  <div className="relative w-full sm:w-64">
                    <input 
                      type="text" 
                      placeholder="Search" 
                      className="w-full rounded-full border border-asu-gold/30 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:border-asu-gold focus:outline-none focus:ring-1 focus:ring-asu-gold"
                    />
                    <div className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-asu-gold text-black">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-8 sm:gap-24 sm:px-6 sm:py-12">
      {showLatestPreview && (
        <section aria-labelledby="latest-preview-heading" className="scroll-mt-8">
          <div className="mb-8 space-y-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Latest
              </p>
              <h2
                id="latest-preview-heading"
                className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Subleases &amp; marketplace
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Active sublease listings from students leaving before lease end,
                plus move-out items and direct listings near ASU Tempe.
              </p>
            </div>
          </div>

          {recentSubleases.length > 0 && (
            <div className={recentMarketplaceItems.length > 0 ? "space-y-3" : ""}>
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                <Link
                  href="/subleases"
                  className="inline-flex items-center gap-1 text-asu-maroon underline-offset-4 transition-colors hover:text-rose-700 hover:underline dark:text-rose-400 dark:hover:text-rose-300"
                >
                  Recent subleases
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                </Link>
              </h3>
              <div className="grid gap-5 sm:grid-cols-3">
                {recentSubleases.map((s) => {
                  const name =
                    s.apartments?.name ?? s.custom_apartment_name ?? "Unknown complex";
                  return (
                    <Link
                      key={s.id}
                      href={`/subleases/${s.id}`}
                      className="group rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-asu-maroon/40 dark:hover:shadow-[0_0_15px_-3px_rgba(140,29,64,0.3)] relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-asu-maroon/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <p className="font-semibold leading-tight transition-colors group-hover:text-asu-maroon dark:group-hover:text-rose-400">
                        {name}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
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
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-1 text-asu-gold underline-offset-4 transition-colors hover:text-yellow-600 hover:underline dark:text-asu-gold dark:hover:text-yellow-300"
                >
                  Marketplace picks
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                </Link>
              </h3>
              <div className="grid gap-5 sm:grid-cols-3">
                {recentMarketplaceItems.map((item) => (
                  <Link
                    key={`${item.listing_type}-${item.id}`}
                    href={marketplaceItemHref(item)}
                    className="group flex flex-col rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-asu-gold/40 dark:hover:shadow-[0_0_15px_-3px_rgba(255,198,39,0.2)] relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-asu-gold/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <p className="font-semibold leading-tight transition-colors group-hover:text-asu-gold dark:group-hover:text-yellow-400">
                      {item.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {item.price === 0 ? "FREE" : `$${item.price}`}
                    </p>
                    <span
                      className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[item.condition]}`}
                    >
                      {CONDITION_LABELS[item.condition]}
                    </span>
                    <p className="mt-4 text-xs font-medium text-asu-gold dark:text-asu-gold">
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
      <section aria-labelledby="pillars-heading" className="scroll-mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Platform
        </p>
        <h2
          id="pillars-heading"
          className="mb-8 mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          What you get
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="flex flex-col rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-asu-gold/20 text-asu-gold dark:bg-asu-maroon/30 dark:text-asu-gold">
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
                className="w-full bg-asu-gold text-white hover:bg-yellow-500 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500 sm:w-auto"
              >
                <Link href="/apartments">
                  Browse apartments
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-asu-gold/20 text-asu-gold dark:bg-asu-maroon/30 dark:text-asu-gold">
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

          <Card className="flex flex-col rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md md:col-span-2">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-asu-gold/20 text-asu-gold dark:bg-asu-maroon/30 dark:text-asu-gold">
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
      <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contribute
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
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
      <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Roadmap
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
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
                className="mt-2 size-1.5 shrink-0 rounded-full bg-asu-gold/70"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </>
  );
}
