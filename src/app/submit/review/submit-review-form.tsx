"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reviewSchema, type ReviewFormValues } from "@/lib/schemas";
import type { Apartment } from "@/lib/types";
import { submitReviewAction } from "../actions";
import { FormDisclaimer } from "@/components/form-disclaimer";

const RATING_LABELS: Record<string, string> = {
  rating_overall: "Overall experience",
  rating_maintenance: "Maintenance response",
  rating_management: "Management / leasing office",
  rating_value: "Value for money",
  rating_safety: "Safety & security",
};

function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="rounded focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Star
            className={cn(
              "size-7 transition-colors",
              n <= (hovered || value)
                ? "fill-amber-400 text-asu-gold"
                : "fill-muted text-muted-foreground",
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

interface SubmitReviewFormProps {
  apartments: Apartment[];
  preselectedApartmentId?: string;
}

export function SubmitReviewForm({
  apartments,
  preselectedApartmentId,
}: SubmitReviewFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      apartment_id: preselectedApartmentId ?? "",
      rating_overall: 0,
      rating_maintenance: 0,
      rating_management: 0,
      rating_value: 0,
      rating_safety: 0,
      lease_term_start: "",
      lease_term_end: "",
      review_text: "",
      pros: "",
      cons: "",
      would_recommend: true,
      submitted_by_email: "",
    },
  });

  const wouldRecommend = watch("would_recommend");

  function onSubmit(data: ReviewFormValues) {
    startTransition(async () => {
      const result = await submitReviewAction(data);
      if (result.success) {
        toast.success("Review submitted! It will appear once an admin verifies it.");
        if (result.redirectTo) router.push(result.redirectTo);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Apartment */}
      <div className="space-y-2">
        <Label>
          Apartment <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={preselectedApartmentId}
          onValueChange={(v) => setValue("apartment_id", v, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a complex…" />
          </SelectTrigger>
          <SelectContent>
            {apartments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.apartment_id && (
          <p className="text-xs text-destructive">{errors.apartment_id.message}</p>
        )}
      </div>

      {/* Star ratings */}
      <div className="space-y-5 rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold">Ratings <span className="text-destructive">*</span></p>
        {(Object.keys(RATING_LABELS) as (keyof ReviewFormValues)[]).map((field) => (
          <div key={field} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-sm font-normal text-muted-foreground">
              {RATING_LABELS[field as string]}
            </Label>
            <Controller
              name={field as keyof ReviewFormValues}
              control={control}
              render={({ field: f }) => (
                <StarInput
                  value={f.value as number}
                  onChange={f.onChange}
                  label={RATING_LABELS[field as string]}
                />
              )}
            />
            {errors[field] && (
              <p className="text-xs text-destructive">{(errors[field] as { message?: string })?.message}</p>
            )}
          </div>
        ))}
      </div>

      {/* Lease dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lease_term_start">
            Move-in month <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lease_term_start"
            type="month"
            {...register("lease_term_start")}
          />
          {errors.lease_term_start && (
            <p className="text-xs text-destructive">{errors.lease_term_start.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lease_term_end">
            Move-out month <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lease_term_end"
            type="month"
            {...register("lease_term_end")}
          />
          {errors.lease_term_end && (
            <p className="text-xs text-destructive">{errors.lease_term_end.message}</p>
          )}
        </div>
      </div>

      {/* Review text */}
      <div className="space-y-2">
        <Label htmlFor="review_text">
          Your review <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="review_text"
          placeholder="What was management like? How fast did they respond to maintenance? Any hidden fees? Deposit return experience?"
          rows={5}
          {...register("review_text")}
        />
        {errors.review_text && (
          <p className="text-xs text-destructive">{errors.review_text.message}</p>
        )}
      </div>

      {/* Pros + cons */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pros">Pros (optional)</Label>
          <Textarea
            id="pros"
            placeholder="e.g. Quick maintenance, close to campus"
            rows={3}
            {...register("pros")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cons">Cons (optional)</Label>
          <Textarea
            id="cons"
            placeholder="e.g. Thin walls, parking issues"
            rows={3}
            {...register("cons")}
          />
        </div>
      </div>

      {/* Would recommend */}
      <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4">
        <Switch
          id="would_recommend"
          checked={wouldRecommend}
          onCheckedChange={(v) => setValue("would_recommend", v)}
        />
        <Label htmlFor="would_recommend" className="cursor-pointer">
          {wouldRecommend
            ? "Yes, I would recommend this apartment"
            : "No, I would not recommend this apartment"}
        </Label>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="submitted_by_email">
          Your ASU email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="submitted_by_email"
          type="email"
          placeholder="you@asu.edu"
          {...register("submitted_by_email")}
        />
        {errors.submitted_by_email && (
          <p className="text-xs text-destructive">{errors.submitted_by_email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Used only to verify submissions. Never shown publicly.
        </p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-asu-gold text-white hover:bg-yellow-500 disabled:opacity-60 dark:bg-asu-gold dark:text-gray-900 dark:hover:bg-yellow-500 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
      <FormDisclaimer />
    </form>
  );
}
