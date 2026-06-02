"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CalendarRange,
  PlusCircle,
  Utensils,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  subleaseChip,
  subleaseLinkClass,
  subleaseMutedActionClass,
  subleaseOutlineAccentHover,
  subleaseRentClass,
  subleaseSolidCtaClass,
} from "@/lib/sublease-ui";
import type { Apartment, SubleaseWithApartment } from "@/lib/types";

const GENDER_LABELS: Record<string, string> = {
  male: "Male preferred",
  female: "Female preferred",
  any: "Any gender",
};

const DIET_LABELS: Record<string, string> = {
  veg: "Veg household",
  non_veg: "Non-veg OK",
  any: "Any diet",
};

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function SubleaseCard({ s }: { s: SubleaseWithApartment }) {
  const name = s.apartments?.name ?? s.custom_apartment_name ?? "Unknown complex";
  const slug = s.apartments?.slug;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold leading-tight">{name}</p>
            {slug && (
              <Link
                href={`/apartments/${slug}?from=subleases`}
                className={cn("text-xs", subleaseLinkClass)}
              >
                View apartment &rarr;
              </Link>
            )}
          </div>
          <p className={cn("shrink-0 text-xl", subleaseRentClass)}>
            ${s.rent_monthly.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarRange className="size-3.5" />
          {fmtDate(s.available_from)} - {fmtDate(s.available_until)}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className={cn("font-medium shadow-none", subleaseChip.room)}
          >
            {s.room_type === "private" ? "Private room" : "Shared room"}
          </Badge>
          {s.gender_preference !== "any" && (
            <Badge
              variant="secondary"
              className={cn("gap-1 font-medium shadow-none", subleaseChip.gender)}
            >
              <Users className="size-3" />
              {GENDER_LABELS[s.gender_preference]}
            </Badge>
          )}
          {s.household_diet !== "any" && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 font-medium shadow-none",
                s.household_diet === "veg" ? subleaseChip.veg : subleaseChip.nonVeg,
              )}
            >
              <Utensils className="size-3" />
              {DIET_LABELS[s.household_diet]}
            </Badge>
          )}
          {s.utilities_included && (
            <Badge
              variant="secondary"
              className={cn("font-medium shadow-none", subleaseChip.utilities)}
            >
              Utilities incl.
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 py-3">
        <Button
          variant="outline"
          size="sm"
          asChild
          className={cn("w-full", subleaseOutlineAccentHover)}
        >
          <Link href={`/subleases/${s.id}`}>View details</Link>
        </Button>
      </div>
    </div>
  );
}

const ALL = "__all__";

interface SubleaseGridProps {
  subleases: SubleaseWithApartment[];
  apartments: Apartment[];
}

export function SubleaseGrid({ subleases, apartments }: SubleaseGridProps) {
  const maxRent = Math.max(...subleases.map((s) => s.rent_monthly), 2000);
  const minRent = Math.min(...subleases.map((s) => s.rent_monthly), 0);

  const [aptFilter, setAptFilter] = React.useState(ALL);
  const [genderFilter, setGenderFilter] = React.useState(ALL);
  const [roomFilter, setRoomFilter] = React.useState(ALL);
  const [dietFilter, setDietFilter] = React.useState(ALL);
  const [rentRange, setRentRange] = React.useState([minRent, maxRent]);
  const [sortBy, setSortBy] = React.useState<"date" | "rent">("date");

  const filtered = React.useMemo(() => {
    let result = subleases.filter((s) => {
      if (aptFilter !== ALL) {
        const aptId = s.apartments?.id;
        if (aptId !== aptFilter) return false;
      }
      if (genderFilter !== ALL && s.gender_preference !== genderFilter) return false;
      if (roomFilter !== ALL && s.room_type !== roomFilter) return false;
      if (dietFilter !== ALL && s.household_diet !== dietFilter) return false;
      if (s.rent_monthly < rentRange[0] || s.rent_monthly > rentRange[1]) return false;
      return true;
    });

    result = [...result].sort((a, b) =>
      sortBy === "rent"
        ? a.rent_monthly - b.rent_monthly
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return result;
  }, [subleases, aptFilter, genderFilter, roomFilter, dietFilter, rentRange, sortBy]);

  function reset() {
    setAptFilter(ALL);
    setGenderFilter(ALL);
    setRoomFilter(ALL);
    setDietFilter(ALL);
    setRentRange([minRent, maxRent]);
    setSortBy("date");
  }

  const hasFilters =
    aptFilter !== ALL ||
    genderFilter !== ALL ||
    roomFilter !== ALL ||
    dietFilter !== ALL ||
    rentRange[0] !== minRent ||
    rentRange[1] !== maxRent;

  // Apartments that appear in the current subleases
  const activeApartmentIds = new Set(
    subleases.map((s) => s.apartments?.id).filter(Boolean),
  );
  const activeApartments = apartments.filter((a) => activeApartmentIds.has(a.id));

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        {activeApartments.length > 0 && (
          <Select value={aptFilter} onValueChange={setAptFilter}>
            <SelectTrigger className="h-9 w-[180px] text-sm">
              <SelectValue placeholder="All complexes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All complexes</SelectItem>
              {activeApartments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue placeholder="Any gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any gender</SelectItem>
            <SelectItem value="male">Male preferred</SelectItem>
            <SelectItem value="female">Female preferred</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="h-9 w-[150px] text-sm">
            <SelectValue placeholder="Room type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any room type</SelectItem>
            <SelectItem value="private">Private room</SelectItem>
            <SelectItem value="shared">Shared room</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dietFilter} onValueChange={setDietFilter}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue placeholder="Diet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any diet</SelectItem>
            <SelectItem value="veg">Vegetarian household</SelectItem>
            <SelectItem value="non_veg">Non-veg OK</SelectItem>
          </SelectContent>
        </Select>

        {/* Rent slider */}
        <div className="flex w-full items-center gap-3">
          <span className="shrink-0 text-xs text-muted-foreground">Rent</span>
          <Slider
            min={minRent}
            max={maxRent}
            step={50}
            value={rentRange}
            onValueChange={setRentRange}
            className="flex-1"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            ${rentRange[0]}-${rentRange[1]}
          </span>
        </div>

        {/* Sort + reset */}
        <div className="flex w-full items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === "date" ? "rent" : "date")}
            className="gap-1.5 text-xs"
          >
            <ArrowUpDown className="size-3" />
            {sortBy === "date" ? "Sort: Newest first" : "Sort: Rent ↑"}
          </Button>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className={cn("text-xs font-medium", subleaseMutedActionClass)}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length === subleases.length
          ? `${subleases.length} listings`
          : `${filtered.length} of ${subleases.length} listings`}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">No listings match your filters.</p>
          <Button variant="outline" onClick={reset} className={subleaseOutlineAccentHover}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SubleaseCard key={s.id} s={s} />
          ))}
        </div>
      )}

      {/* Post CTA */}
      <div className="mt-10 text-center">
        <Button asChild variant="default" className={subleaseSolidCtaClass}>
          <Link href="/submit/sublease">
            <PlusCircle className="size-4" />
            Post your sublease
          </Link>
        </Button>
      </div>
    </div>
  );
}
