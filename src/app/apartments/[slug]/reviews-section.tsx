import { Star, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { subleaseChip, subleaseLinkClass } from "@/lib/sublease-ui";
import type { ApartmentReview, ReviewAggregate } from "@/lib/types";

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < Math.round(value)
              ? "fill-amber-400 text-asu-gold"
              : "fill-muted text-muted-foreground",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

function RatingBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-asu-gold"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <span className="w-6 text-right text-xs font-medium">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

interface ReviewsSectionProps {
  reviews: ApartmentReview[];
  aggregate: ReviewAggregate | null;
  submitHref: string;
}

export function ReviewsSection({
  reviews,
  aggregate,
  submitHref,
}: ReviewsSectionProps) {
  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="reviews-heading"
          className="font-heading text-lg font-bold tracking-tight sm:text-xl"
        >
          Reviews
          {aggregate && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({aggregate.count})
            </span>
          )}
        </h2>
        <a
          href={submitHref}
          className={cn("text-sm font-medium", subleaseLinkClass)}
        >
          Write a review →
        </a>
      </div>

      {aggregate ? (
        <>
          {/* Aggregate block */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              {/* Big number */}
              <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:border-border sm:pr-6">
                <span className="text-4xl font-bold tabular-nums">
                  {aggregate.overall.toFixed(1)}
                </span>
                <StarRow value={aggregate.overall} />
                <span className="text-xs text-muted-foreground">
                  {aggregate.count} {aggregate.count === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* Category bars */}
              <div className="flex-1 space-y-2.5">
                <RatingBar label="Overall" value={aggregate.overall} />
                <RatingBar label="Maintenance" value={aggregate.maintenance} />
                <RatingBar label="Management" value={aggregate.management} />
                <RatingBar label="Value" value={aggregate.value} />
                <RatingBar label="Safety" value={aggregate.safety} />
              </div>
            </div>

            {aggregate.wouldRecommendPct > 0 && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ThumbsUp className="size-4 shrink-0 text-asu-gold" />
                {Math.round(aggregate.wouldRecommendPct)}% of reviewers would
                recommend this apartment
              </p>
            )}
          </div>

          {/* Individual reviews */}
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <StarRow value={review.rating_overall} />
                    <p className="text-xs text-muted-foreground">
                      {review.lease_term_start.slice(0, 7)} -{" "}
                      {review.lease_term_end.slice(0, 7)}
                    </p>
                  </div>
                  {review.would_recommend && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full text-xs font-medium shadow-none",
                        subleaseChip.veg,
                      )}
                    >
                      Would recommend
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {review.review_text}
                </p>

                {(review.pros || review.cons) && (
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    {review.pros && (
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-muted-foreground">Pros</p>
                        <p className="mt-0.5">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-muted-foreground">Cons</p>
                        <p className="mt-0.5">{review.cons}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No verified reviews yet
          </p>
          <a
            href={submitHref}
            className={cn("text-sm font-medium", subleaseLinkClass)}
          >
            Be the first to leave one →
          </a>
        </div>
      )}
    </section>
  );
}
