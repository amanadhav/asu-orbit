"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  SUBLEASE_AMENITY_OPTIONS,
  subleaseSchema,
  type SubleaseFormValues,
} from "@/lib/schemas";
import type { Apartment } from "@/lib/types";
import { submitSubleaseAction } from "../actions";
import { FormDisclaimer } from "@/components/form-disclaimer";
import { ApartmentRequestForm } from "@/components/apartment-request-form";

interface SubmitSubleaseFormProps {
  apartments: Apartment[];
  preselectedApartmentId?: string;
}

export function SubmitSubleaseForm({
  apartments,
  preselectedApartmentId,
}: SubmitSubleaseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [mode, setMode] = React.useState<"directory" | "custom">("directory");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubleaseFormValues>({
    resolver: zodResolver(subleaseSchema),
    defaultValues: {
      apartment_id: preselectedApartmentId ?? "",
      custom_apartment_name: "",
      rent_monthly: undefined,
      utilities_included: false,
      available_from: "",
      available_until: "",
      gender_preference: "any",
      room_type: "private",
      household_diet: "any",
      furnished: "fully",
      amenities: [],
      move_in_notes: "",
      roommate_expectations: "",
      contact_whatsapp: "",
      contact_instagram: "",
      additional_info: "",
      submitted_by_email: "",
    },
  });

  const utilitiesIncluded = watch("utilities_included");
  const amenitySelection = watch("amenities");

  function toggleAmenity(option: (typeof SUBLEASE_AMENITY_OPTIONS)[number]) {
    const current = amenitySelection ?? [];
    const next = current.includes(option)
      ? current.filter((a) => a !== option)
      : [...current, option];
    setValue("amenities", next, { shouldValidate: true });
  }

  function onSubmit(data: SubleaseFormValues) {
    startTransition(async () => {
      const result = await submitSubleaseAction(data);
      if (result.success && result.data) {
        toast.success("Sublease submitted!", {
          description:
            "It will appear once approved. Check your email for a link to mark it as taken when filled.",
          duration: 5000,
        });
        window.setTimeout(() => {
          router.push("/subleases");
        }, 1000);
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Apartment source toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "directory" ? "default" : "outline"}
          onClick={() => setMode("directory")}
        >
          From directory
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "custom" ? "default" : "outline"}
          onClick={() => { setMode("custom"); setValue("apartment_id", ""); }}
        >
          Not in directory
        </Button>
      </div>

      {mode === "directory" ? (
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
      ) : (
        <div className="space-y-2">
          <Label htmlFor="custom_apartment_name">
            Complex name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="custom_apartment_name"
            placeholder="e.g. Brickyard Tempe"
            {...register("custom_apartment_name")}
          />
          {errors.custom_apartment_name && (
            <p className="text-xs text-destructive">{errors.custom_apartment_name.message}</p>
          )}
        </div>
      )}

      {mode === "directory" && (
        <ApartmentRequestForm email={watch("submitted_by_email")} />
      )}

      {/* Rent + utilities */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rent_monthly">
            Monthly rent ($) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="rent_monthly"
            type="number"
            min={100}
            max={9999}
            placeholder="850"
            {...register("rent_monthly", { valueAsNumber: true })}
          />
          {errors.rent_monthly && (
            <p className="text-xs text-destructive">{errors.rent_monthly.message}</p>
          )}
        </div>
        <div className="flex items-end gap-3 pb-1">
          <Switch
            id="utilities_included"
            checked={utilitiesIncluded}
            onCheckedChange={(v) => setValue("utilities_included", v)}
          />
          <Label htmlFor="utilities_included" className="cursor-pointer leading-snug">
            {utilitiesIncluded ? "Utilities included" : "Utilities not included"}
          </Label>
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="available_from">
            Available from <span className="text-destructive">*</span>
          </Label>
          <Input id="available_from" type="date" {...register("available_from")} />
          {errors.available_from && (
            <p className="text-xs text-destructive">{errors.available_from.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="available_until">
            Available until <span className="text-destructive">*</span>
          </Label>
          <Input id="available_until" type="date" {...register("available_until")} />
          {errors.available_until && (
            <p className="text-xs text-destructive">{errors.available_until.message}</p>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>
            Gender preference <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="any"
            onValueChange={(v) => setValue("gender_preference", v as SubleaseFormValues["gender_preference"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            Room type <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="private"
            onValueChange={(v) => setValue("room_type", v as SubleaseFormValues["room_type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private room</SelectItem>
              <SelectItem value="shared">Shared room</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            Household diet <span className="text-destructive">*</span>
          </Label>
          <Select
            defaultValue="any"
            onValueChange={(v) => setValue("household_diet", v as SubleaseFormValues["household_diet"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="veg">Vegetarian household</SelectItem>
              <SelectItem value="non_veg">Non-veg OK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Furnished */}
      <div className="space-y-2">
        <Label>
          Furnishing <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("furnished")}
          onValueChange={(v) =>
            setValue(
              "furnished",
              v as SubleaseFormValues["furnished"],
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select furnished status…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fully">Fully furnished</SelectItem>
            <SelectItem value="partial">Partially furnished</SelectItem>
            <SelectItem value="unfurnished">Unfurnished</SelectItem>
          </SelectContent>
        </Select>
        {errors.furnished && (
          <p className="text-xs text-destructive">{errors.furnished.message}</p>
        )}
      </div>

      {/* Amenities */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Amenities (optional)</legend>
        <p className="text-xs text-muted-foreground">
          Select anything that applies to this sublease.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBLEASE_AMENITY_OPTIONS.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(amenitySelection ?? []).includes(opt)}
                onChange={() => toggleAmenity(opt)}
                className="size-4 rounded border-input accent-amber-600 dark:accent-amber-500"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Move-in flexibility */}
      <div className="space-y-2">
        <Label htmlFor="move_in_notes">Move-in flexibility (optional)</Label>
        <Textarea
          id="move_in_notes"
          placeholder="e.g. Anytime from August, flexible on exact date"
          rows={3}
          {...register("move_in_notes")}
        />
      </div>

      {/* Roommate expectations */}
      <div className="space-y-2">
        <Label htmlFor="roommate_expectations">
          Roommate expectations (optional)
        </Label>
        <Textarea
          id="roommate_expectations"
          placeholder="e.g. Peaceful environment, respectful, no smoking - anything you want potential roommates to know"
          rows={3}
          {...register("roommate_expectations")}
        />
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

      {/* Additional info */}
      <div className="space-y-2">
        <Label htmlFor="additional_info">Additional info (optional)</Label>
        <Textarea
          id="additional_info"
          placeholder="Any other details - furnished/unfurnished, parking, quiet house, etc."
          rows={3}
          {...register("additional_info")}
        />
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
        className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 sm:w-auto"
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
    </form>
  );
}
