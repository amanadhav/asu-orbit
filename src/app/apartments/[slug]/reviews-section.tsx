import { Star, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
              ? "fill-amber-400 text-amber-400"
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
          className="h-full rounded-full bg-amber-500"
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
          className="font-heading text-xl font-bold tracking-tight"
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
          className="text-sm font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
        >
          Write a review →
        </a>
      </div>

      {aggregate ? (
        <>
          {/* Aggregate block */}
          <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              {/* Big number */}
              <div className="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r">
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
                <ThumbsUp className="size-4 shrink-0 text-amber-500" />
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
                className="rounded-xl border bg-card p-5 shadow-sm"
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
                    <Badge className="shrink-0 rounded-full border-green-200 bg-green-100 text-xs text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
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
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No verified reviews yet
          </p>
          <a
            href={submitHref}
            className="text-sm font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Be the first to leave one →
          </a>
        </div>
      )}
    </section>
  );
}
