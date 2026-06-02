import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Camera, MapPin, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getApartmentBySlug,
  getApartmentSlugs,
  getPhotosForApartment,
  getReviewsForApartment,
  getSubleasesByApartment,
} from "@/lib/supabase/queries";
import { computeReviewAggregate } from "@/lib/types";

import {
  subleaseLinkClass,
  subleaseOutlineAccentHover,
  subleaseRentClass,
  subleaseSolidCtaClass,
} from "@/lib/sublease-ui";

import { ApartmentBackLink } from "./apartment-back-link";
import { CommunityNotes } from "./community-notes";
import { NeighborhoodMap } from "./neighborhood-map";
import { PhotoGallery } from "./photo-gallery";
import { QuickFacts } from "./quick-facts";
import { ReviewsSection } from "./reviews-section";

const apartmentsFallbackBack = (
  <Link
    href="/apartments"
    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
  >
    <ArrowLeft className="size-4" />
    All apartments
  </Link>
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getApartmentSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apartment = await getApartmentBySlug(slug);
    if (!apartment) return { title: "Not found" };
    return {
      title: apartment.name,
      description: `${apartment.name} near ASU Tempe - resident photos, honest reviews, rent info ($${apartment.rent_min}-$${apartment.rent_max}/mo), and active subleases.`,
    };
  } catch {
    return { title: "Apartment" };
  }
}

export default async function ApartmentSlugPage({ params }: Props) {
  const { slug } = await params;

  let apartment;
  try {
    apartment = await getApartmentBySlug(slug);
  } catch {
    apartment = null;
  }

  if (!apartment) notFound();

  const [photosResult, reviewsResult, subleasesResult] =
    await Promise.allSettled([
      getPhotosForApartment(apartment.id),
      getReviewsForApartment(apartment.id),
      getSubleasesByApartment(apartment.id),
    ] as const);

  const photos =
    photosResult.status === "fulfilled" ? photosResult.value : [];
  const reviews =
    reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
  const subleases =
    subleasesResult.status === "fulfilled" ? subleasesResult.value : [];

  const aggregate = computeReviewAggregate(reviews, apartment);

  const photoSubmitHref = `/submit/photo?apartment=${slug}`;
  const reviewSubmitHref = `/submit/review?apartment=${slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Back link (client: reads ?from= for referrer) */}
      <Suspense fallback={apartmentsFallbackBack}>
        <ApartmentBackLink />
      </Suspense>

      {/* Hero */}
      <div className="mb-8 space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Apartment directory
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-heading max-w-[22ch] text-3xl font-bold tracking-tight text-balance sm:max-w-none sm:text-4xl">
              {apartment.name}
            </h1>
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              <Button size="sm" asChild variant="default" className={subleaseSolidCtaClass}>
                <Link href={photoSubmitHref}>
                  <Camera className="size-4" />
                  Submit a photo
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className={subleaseOutlineAccentHover}
              >
                <Link href={reviewSubmitHref}>
                  <PenLine className="size-4" />
                  Write a review
                </Link>
              </Button>
            </div>
          </div>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span>{apartment.address}</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <PhotoGallery
            photos={photos}
            apartmentName={apartment.name}
            submitHref={photoSubmitHref}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left: description + reviews */}
        <div className="space-y-10">
          {apartment.description && (
            <section
              aria-labelledby="description-heading"
              className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <h2
                id="description-heading"
                className="font-heading text-lg font-bold tracking-tight sm:text-xl"
              >
                About this complex
              </h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {apartment.description}
              </p>
            </section>
          )}

          {apartment.community_notes && (
            <CommunityNotes notes={apartment.community_notes} />
          )}

          <ReviewsSection
            reviews={reviews}
            aggregate={aggregate}
            submitHref={reviewSubmitHref}
          />
        </div>

        {/* Right: quick facts + live subleases */}
        <aside className="flex flex-col gap-6">
          <QuickFacts apartment={apartment} />

          {/* Live subleases */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live subleases
            </h2>
            <Separator className="my-4" />
            {subleases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active subleases right now.
              </p>
            ) : (
              <ul className="space-y-3">
                {subleases.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-border bg-secondary/30 p-3.5 transition-colors hover:bg-secondary/45 dark:bg-secondary/25 dark:hover:bg-secondary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm", subleaseRentClass)}>
                        ${s.rent_monthly.toLocaleString()}
                        <span className="text-xs font-medium text-muted-foreground">
                          /mo
                        </span>
                      </span>
                      <Link
                        href={`/subleases/${s.id}`}
                        className={cn("text-xs font-medium", subleaseLinkClass)}
                      >
                        Details →
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.room_type === "private" ? "Private" : "Shared"} ·{" "}
                      {s.gender_preference === "any"
                        ? "Any gender"
                        : s.gender_preference === "male"
                          ? "Male pref."
                          : "Female pref."}{" "}
                      · Avail.{" "}
                      {new Date(s.available_from).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/submit/sublease?apartment=${slug}`}
              className={cn("mt-4 inline-block text-sm font-medium", subleaseLinkClass)}
            >
              List yours →
            </Link>
          </div>
        </aside>
      </div>

      {apartment.address && (
        <>
          <Separator className="my-12" />
          <NeighborhoodMap name={apartment.name} address={apartment.address} />
        </>
      )}
    </div>
  );
}
