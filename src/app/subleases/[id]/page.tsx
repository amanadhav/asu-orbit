import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarRange,
  Flag,
  Home,
  Mail,
  Utensils,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactDisplay } from "@/components/contact-display";
import { cn } from "@/lib/utils";
import {
  subleaseChip,
  subleaseLinkClass,
  subleaseRentClass,
} from "@/lib/sublease-ui";
import { getSubleaseById } from "@/lib/supabase/queries";
import type { SubleaseFurnished } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sublease = await getSubleaseById(id).catch(() => null);
  if (!sublease) return { title: "Sublease not found" };
  const name =
    sublease.apartments?.name ?? sublease.custom_apartment_name ?? "Sublease";
  return {
    title: `Sublease at ${name}`,
    description: `$${sublease.rent_monthly}/mo · Available ${format(parseISO(sublease.available_from), "MMM d, yyyy")}`,
  };
}

const GENDER_LABELS: Record<string, string> = {
  male: "Male preferred",
  female: "Female preferred",
  any: "Any gender",
};
const DIET_LABELS: Record<string, string> = {
  veg: "Vegetarian household",
  non_veg: "Non-veg OK",
  any: "Any diet",
};

const FURNISHED_LABELS: Record<SubleaseFurnished, string> = {
  fully: "Fully furnished",
  partial: "Partially furnished",
  unfurnished: "Unfurnished",
};

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "MMMM d, yyyy");
  } catch {
    return iso;
  }
}

export default async function SubleaseDetailPage({ params }: Props) {
  const { id } = await params;
  const sublease = await getSubleaseById(id).catch(() => null);
  if (!sublease) notFound();

  const aptName =
    sublease.apartments?.name ?? sublease.custom_apartment_name ?? "Unknown complex";
  const adminEmail = process.env.ADMIN_EMAIL ?? "adesihub@asu.edu";
  const reportSubject = encodeURIComponent(`Report sublease ${sublease.id}`);
  const reportBody = encodeURIComponent(
    `Reporting sublease listing:\nID: ${sublease.id}\nComplex: ${aptName}\n\nReason:\n`,
  );

  const furnishedLabel =
    sublease.furnished != null ? FURNISHED_LABELS[sublease.furnished] : null;
  const amenityChips =
    sublease.amenities?.filter((a) => a.trim().length > 0) ?? [];

  const dietChipClass =
    sublease.household_diet === "veg"
      ? subleaseChip.veg
      : sublease.household_diet === "non_veg"
        ? subleaseChip.nonVeg
        : subleaseChip.meta;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Back */}
      <Link
        href="/subleases"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to board
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight">
              {aptName}
            </h1>
            {sublease.apartments?.slug && (
              <Link
                href={`/apartments/${sublease.apartments.slug}?from=subleases`}
                className={cn("mt-0.5 inline-flex items-center gap-1 text-sm", subleaseLinkClass)}
              >
                <Home className="size-3.5" />
                View in apartment directory
              </Link>
            )}
          </div>
          <div className="text-right">
            <p className={cn("text-3xl", subleaseRentClass)}>
              ${sublease.rent_monthly.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
            {sublease.utilities_included && (
              <p className="text-xs text-muted-foreground">Utilities included</p>
            )}
          </div>
        </div>

        {/* Key details */}
        <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarRange className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Available
              </p>
              <p className="text-sm">
                {fmtDate(sublease.available_from)} -{" "}
                {fmtDate(sublease.available_until)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Room
              </p>
              <p className="text-sm">
                {sublease.room_type === "private" ? "Private room" : "Shared room"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Gender preference
              </p>
              <p className="text-sm">{GENDER_LABELS[sublease.gender_preference]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Utensils className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Household diet
              </p>
              <p className="text-sm">{DIET_LABELS[sublease.household_diet]}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {sublease.utilities_included && (
            <Badge
              variant="secondary"
              className={cn("font-medium shadow-none", subleaseChip.utilities)}
            >
              Utilities included
            </Badge>
          )}
          {furnishedLabel != null ? (
            <Badge
              variant="secondary"
              className={cn("font-medium shadow-none", subleaseChip.furnished)}
            >
              {furnishedLabel}
            </Badge>
          ) : null}
          <Badge
            variant="secondary"
            className={cn("gap-1 font-medium shadow-none", subleaseChip.gender)}
          >
            <Users className="size-3" />
            {GENDER_LABELS[sublease.gender_preference]}
          </Badge>
          <Badge
            variant="secondary"
            className={cn("gap-1 font-medium shadow-none", dietChipClass)}
          >
            <Utensils className="size-3 shrink-0" />
            {DIET_LABELS[sublease.household_diet]}
          </Badge>
        </div>

        {amenityChips.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              {amenityChips.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {/* Move-in notes */}
        {sublease.move_in_notes != null && sublease.move_in_notes.trim().length > 0 ? (
          <div className="rounded-xl border bg-muted/30 p-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Move-in
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {sublease.move_in_notes}
            </p>
          </div>
        ) : null}

        {/* Roommate expectations */}
        {sublease.roommate_expectations != null &&
        sublease.roommate_expectations.trim().length > 0 ? (
          <div className="rounded-xl border bg-muted/30 p-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roommate expectations
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {sublease.roommate_expectations}
            </p>
          </div>
        ) : null}

        {/* Additional info */}
        {sublease.additional_info && (
          <div className="rounded-xl border bg-muted/30 p-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Additional info
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {sublease.additional_info}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-amber-700/55 dark:text-amber-400/45" />
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact the lister
              </p>
              <ContactDisplay
                whatsapp={sublease.contact_whatsapp}
                instagram={sublease.contact_instagram}
                fallback={sublease.contact_method}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" asChild>
            <a href={`mailto:${adminEmail}?subject=${reportSubject}&body=${reportBody}`}>
              <Flag className="size-3.5" />
              Report this listing
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Listed{" "}
          {format(parseISO(sublease.created_at), "MMMM d, yyyy")} · Expires{" "}
          {format(parseISO(sublease.expires_at), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
