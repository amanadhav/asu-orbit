import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, MapPin, MessageCircle, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactDisplay } from "@/components/contact-display";
import {
  getMarketplaceListingById,
  getMoveoutPhotoUrl,
} from "@/lib/supabase/queries";

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Furniture",
  kitchen: "Kitchen",
  electronics: "Electronics",
  bedding: "Bedding",
  study: "Study",
  decor: "Decor",
  clothing: "Clothing",
  misc: "Misc",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

const CONDITION_COLORS: Record<string, string> = {
  new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  like_new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  good: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  fair: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingId: string }>;
}): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getMarketplaceListingById(listingId).catch(() => null);
  if (!listing) return { title: "Listing not found" };
  const priceLabel = listing.price === 0 ? "FREE" : `$${listing.price}`;
  return {
    title: `${listing.title} · ${priceLabel}`,
    description:
      listing.description?.slice(0, 160) ??
      `${listing.title} - ${CONDITION_LABELS[listing.condition]} · ${priceLabel}`,
  };
}

export default async function MarketplaceListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await getMarketplaceListingById(listingId).catch(() => null);
  if (!listing) notFound();

  const photoUrl = listing.photo_path
    ? getMoveoutPhotoUrl(listing.photo_path)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6 gap-1 text-muted-foreground"
      >
        <Link href="/marketplace">
          <ArrowLeft className="size-4" />
          Marketplace
        </Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-start gap-3">
        <Badge
          variant="secondary"
          className="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300"
        >
          Direct listing
        </Badge>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {listing.title}
        </h1>
        <p className="font-heading text-2xl font-bold text-amber-600 dark:text-amber-400">
          {listing.price === 0 ? "FREE" : `$${listing.price}`}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">{CATEGORY_LABELS[listing.category]}</Badge>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[listing.condition]}`}
        >
          {CONDITION_LABELS[listing.condition]}
        </span>
      </div>

      {listing.location_label && (
        <p className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {listing.apartment_slug ? (
            <Link
              href={`/apartments/${listing.apartment_slug}?from=marketplace`}
              className="text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
            >
              {listing.location_label}
            </Link>
          ) : (
            <span>{listing.location_label}</span>
          )}
        </p>
      )}

      <div className="relative mb-8 aspect-square w-full max-w-xl overflow-hidden rounded-2xl border bg-muted shadow-sm">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 576px"
            priority
          />
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center">
            <Package className="size-16 text-muted-foreground/25" />
          </div>
        )}
      </div>

      {listing.description?.trim() ? (
        <section className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading mb-2 text-lg font-semibold tracking-tight">
            About this item
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {listing.description.trim()}
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <MessageCircle className="size-5 text-amber-600 dark:text-amber-400" />
          Contact seller
        </h2>
        <p className="text-sm text-muted-foreground">
          Reach out using the method below. ASU Orbit does not handle payments
          or meetups - agree details directly with the seller.
        </p>
        <div className="mt-3">
          <ContactDisplay
            whatsapp={listing.contact_whatsapp}
            instagram={listing.contact_instagram}
            fallback={listing.contact_method}
          />
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Listed {format(parseISO(listing.created_at), "MMMM d, yyyy")}
      </p>
    </div>
  );
}
