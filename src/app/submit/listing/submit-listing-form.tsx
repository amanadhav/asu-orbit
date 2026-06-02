"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormDisclaimer } from "@/components/form-disclaimer";
import { ApartmentRequestForm } from "@/components/apartment-request-form";
import {
  listingSchema,
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
  type ListingFormValues,
} from "@/lib/schemas";
import type { Apartment } from "@/lib/types";
import { convertHeicIfNeeded, isHeicLike } from "@/lib/convert-heic-if-needed";
import { submitListingAction } from "../actions";

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Furniture",
  kitchen: "Kitchen",
  electronics: "Electronics",
  bedding: "Bedding",
  study: "Study & office",
  decor: "Decor",
  clothing: "Clothing",
  misc: "Miscellaneous",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

interface SubmitListingFormProps {
  apartments: Apartment[];
}

const DIRECTORY_NONE = "__none__";

const SUBMIT_SUCCESS_TOAST =
  "Your listing was submitted! It will appear once approved.";

export function SubmitListingForm({ apartments }: SubmitListingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [mode, setMode] = React.useState<"directory" | "custom">("directory");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      price: 0,
      category: "misc",
      condition: "good",
      apartment_id: "",
      custom_apartment_name: "",
      description: "",
      contact_whatsapp: "",
      contact_instagram: "",
      submitted_by_email: "",
    },
  });

  const apartmentIdVal = watch("apartment_id");

  const priceVal = watch("price");

  function onSubmit(data: ListingFormValues) {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("listing", JSON.stringify(data));
        if (photoFile) fd.set("photo", photoFile);

        const result = await submitListingAction(fd);
        if (!result.success) {
          toast.error(result.error);
        } else {
          toast.success(SUBMIT_SUCCESS_TOAST);
          window.setTimeout(() => {
            router.push("/marketplace");
          }, 1000);
        }
      } catch {
        toast.error(
          "Something went wrong while submitting. If you attached a large photo, try a smaller image or compress it.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Item title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. IKEA bed frame, queen size"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="misc"
            onValueChange={(v) =>
              setValue("category", v as ListingFormValues["category"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>
            Condition <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="good"
            onValueChange={(v) =>
              setValue("condition", v as ListingFormValues["condition"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CONDITION_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-xs text-destructive">{errors.condition.message}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price{" "}
          {priceVal === 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              FREE
            </Badge>
          )}
          <span className="text-destructive"> *</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="price"
            type="number"
            min={0}
            max={9999}
            step={1}
            placeholder="0"
            className="pl-7"
            {...register("price", { valueAsNumber: true })}
          />
        </div>
        {errors.price && (
          <p className="text-xs text-destructive">{errors.price.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Enter 0 to mark as free.</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Dimensions, colour, any defects, reason for selling, etc."
          rows={3}
          {...register("description")}
        />
      </div>

      {/* Apartment (optional) - same toggle pattern as sublease */}
      <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">
          Related apartment <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "directory" ? "default" : "outline"}
            onClick={() => {
              setMode("directory");
              setValue("custom_apartment_name", "");
            }}
          >
            From directory
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "custom" ? "default" : "outline"}
            onClick={() => {
              setMode("custom");
              setValue("apartment_id", "");
            }}
          >
            Not in directory
          </Button>
        </div>

        {mode === "directory" ? (
          <div className="space-y-2">
            <Label htmlFor="listing-apartment-select">Apartment</Label>
            <Select
              value={
                apartmentIdVal && apartmentIdVal.length > 0
                  ? apartmentIdVal
                  : DIRECTORY_NONE
              }
              onValueChange={(v) =>
                setValue(
                  "apartment_id",
                  v === DIRECTORY_NONE ? "" : v,
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="listing-apartment-select" className="w-full bg-background">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DIRECTORY_NONE}>Not apartment-related</SelectItem>
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="custom_apartment_name">Complex name</Label>
            <Input
              id="custom_apartment_name"
              placeholder="e.g. Brickyard Tempe"
              {...register("custom_apartment_name")}
            />
            {errors.custom_apartment_name && (
              <p className="text-xs text-destructive">
                {errors.custom_apartment_name.message}
              </p>
            )}
          </div>
        )}
      </div>

      <ApartmentRequestForm email={watch("submitted_by_email")} />

      {/* Photo */}
      <div className="space-y-2">
        <Label>Photo (optional)</Label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-asu-gold hover:text-foreground">
          <Upload className="size-4 shrink-0" />
          <span>
            {photoFile?.name ?? "Click to upload (max 5 MB)"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const input = e.target;
              const raw = input.files?.[0] ?? null;
              if (!raw) {
                setPhotoFile(null);
                return;
              }
              if (raw.size > 5 * 1024 * 1024) {
                toast.error("Photo must be under 5 MB.");
                input.value = "";
                return;
              }
              let loadingId: string | number | undefined;
              try {
                if (isHeicLike(raw)) {
                  loadingId = toast.loading("Converting HEIC to JPEG…");
                }
                const file = await convertHeicIfNeeded(raw);
                if (loadingId !== undefined) toast.dismiss(loadingId);
                setPhotoFile(file);
              } catch (err) {
                if (loadingId !== undefined) toast.dismiss(loadingId);
                toast.error(
                  err instanceof Error ? err.message : "Could not process photo.",
                );
                input.value = "";
                setPhotoFile(null);
              }
            }}
          />
        </label>
      </div>

      {/* Contact method */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium leading-none">
            Contact method <span className="text-destructive">*</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Buyers reach you directly through these links. Provide WhatsApp{" "}
            <span className="font-medium text-foreground/90">or</span> Instagram,
            or <span className="font-medium text-foreground/90">both</span>.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="contact_whatsapp">WhatsApp number</Label>
            <Input
              id="contact_whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="+1 480 555 0123"
              {...register("contact_whatsapp")}
            />
            <p className="text-xs text-muted-foreground">
              Include country code
            </p>
          </div>
          <div
            className="flex shrink-0 items-center justify-center sm:w-12 sm:border-x sm:border-border/70 sm:bg-muted/25 sm:self-stretch sm:py-0 dark:sm:bg-muted/15"
            aria-hidden
          >
            <span className="rounded-full border border-border/60 bg-muted/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm dark:bg-muted/40">
              or
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="contact_instagram">Instagram handle</Label>
            <Input
              id="contact_instagram"
              placeholder="@your_handle"
              {...register("contact_instagram")}
            />
            <p className="text-xs text-muted-foreground">
              Without the instagram.com part
            </p>
          </div>
        </div>
        {(errors.contact_whatsapp || errors.contact_instagram) && (
          <div className="space-y-1">
            {errors.contact_whatsapp && (
              <p className="text-xs text-destructive">
                {errors.contact_whatsapp.message}
              </p>
            )}
            {errors.contact_instagram && (
              <p className="text-xs text-destructive">
                {errors.contact_instagram.message}
              </p>
            )}
          </div>
        )}
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
          <p className="text-xs text-destructive">
            {errors.submitted_by_email.message}
          </p>
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
          "Submit listing"
        )}
      </Button>
      <FormDisclaimer />

      {/* Move-out nudge */}
      <div className="rounded-xl border bg-muted/40 px-4 py-4">
        <p className="text-sm font-medium text-foreground">Moving out soon?</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          List all your items at once and share a single link with your
          building&apos;s WhatsApp group.
        </p>
        <Link
          href="/submit/moveout"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-asu-gold underline-offset-4 hover:underline dark:text-asu-gold"
        >
          Create a move-out sale
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </form>
  );
}
