import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Camera, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getApartmentBySlug,
  getApartmentSlugs,
  getPhotosForApartment,
  getReviewsForApartment,
  getSubleasesByApartment,
} from "@/lib/supabase/queries";
import { computeReviewAggregate } from "@/lib/types";

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

  const aggregate = computeReviewAggregate(reviews);

  const photoSubmitHref = `/submit/photo?apartment=${slug}`;
  const reviewSubmitHref = `/submit/review?apartment=${slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Back link (client: reads ?from= for referrer) */}
      <Suspense fallback={apartmentsFallbackBack}>
        <ApartmentBackLink />
      </Suspense>

      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {apartment.name}
        </h1>
        <p className="text-muted-foreground">{apartment.address}</p>
      </div>

      {/* Photo gallery */}
      <PhotoGallery
        photos={photos}
        apartmentName={apartment.name}
        submitHref={photoSubmitHref}
      />

      {/* Submit CTAs */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          size="sm"
          asChild
          className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400"
        >
          <Link href={photoSubmitHref}>
            <Camera className="size-4" />
            Submit a photo
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={reviewSubmitHref}>
            <PenLine className="size-4" />
            Write a review
          </Link>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left: description + reviews */}
        <div className="space-y-10">
          {apartment.description && (
            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="font-heading text-xl font-bold tracking-tight"
              >
                About this complex
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
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
          <div className="rounded-xl border bg-card p-5 shadow-sm">
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
                  <li key={s.id} className="rounded-lg border bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        ${s.rent_monthly.toLocaleString()}/mo
                      </span>
                      <Link
                        href={`/subleases/${s.id}`}
                        className="text-xs font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
                      >
                        Details →
                      </Link>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
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
              className="mt-3 block text-sm font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
            >
              List yours →
            </Link>
          </div>
        </aside>
      </div>

      {apartment.address && (
        <>
          <Separator className="my-10" />
          <NeighborhoodMap name={apartment.name} address={apartment.address} />
        </>
      )}
    </div>
  );
}
