"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { ApartmentCard } from "@/components/apartment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Apartment, SubleaseAllowed } from "@/lib/types";

interface ApartmentGridProps {
  apartments: Apartment[];
}

const SUBLEASE_OPTIONS: { value: SubleaseAllowed; label: string }[] = [
  { value: "yes", label: "Sublease OK" },
  { value: "with_approval", label: "With approval" },
  { value: "no", label: "Not allowed" },
  { value: "unknown", label: "Unknown" },
];

export function ApartmentGrid({ apartments }: ApartmentGridProps) {
  const globalRentMin = Math.min(...apartments.map((a) => a.rent_min));
  const globalRentMax = Math.max(...apartments.map((a) => a.rent_max));
  const globalDistMax = Math.max(
    ...apartments
      .map((a) => a.distance_to_campus_minutes_walk ?? 0)
      .filter(Boolean),
    30,
  );

  const [rentRange, setRentRange] = React.useState<[number, number]>([
    globalRentMin,
    globalRentMax,
  ]);
  const [maxDist, setMaxDist] = React.useState(globalDistMax);
  const [subleaseFilter, setSubleaseFilter] = React.useState<
    Set<SubleaseAllowed>
  >(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  function toggleSublease(val: SubleaseAllowed) {
    setSubleaseFilter((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }

  function resetFilters() {
    setRentRange([globalRentMin, globalRentMax]);
    setMaxDist(globalDistMax);
    setSubleaseFilter(new Set());
  }

  const isFiltered =
    rentRange[0] !== globalRentMin ||
    rentRange[1] !== globalRentMax ||
    maxDist !== globalDistMax ||
    subleaseFilter.size > 0;

  const filtered = apartments.filter((a) => {
    // Rent overlap: show if apt range overlaps selected range
    if (a.rent_max < rentRange[0] || a.rent_min > rentRange[1]) return false;
    // Distance: include if null (unknown) or within limit
    const walk = a.distance_to_campus_minutes_walk;
    if (walk != null && walk > maxDist) return false;
    // Sublease: if no filter selected, show all
    if (subleaseFilter.size > 0 && !subleaseFilter.has(a.sublease_allowed))
      return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-asu-gold dark:hover:text-asu-gold"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {isFiltered && (
              <Badge className="rounded-full border-asu-gold/50 bg-asu-gold/20 px-1.5 py-0 text-xs text-asu-gold dark:border-amber-800/50 dark:bg-asu-maroon/30 dark:text-asu-gold">
                on
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {apartments.length} apartments
            </span>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={resetFilters}
              >
                <X className="size-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200",
            filtersOpen ? "mt-6 grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0">
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Rent range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rent range</span>
                  <span className="text-muted-foreground">
                    ${rentRange[0].toLocaleString()} - $
                    {rentRange[1].toLocaleString()}
                    /mo
                  </span>
                </div>
                <Slider
                  min={globalRentMin}
                  max={globalRentMax}
                  step={50}
                  value={rentRange}
                  onValueChange={(v) =>
                    setRentRange(v as [number, number])
                  }
                  aria-label="Rent range"
                />
              </div>

              {/* Max walk distance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Walk to campus</span>
                  <span className="text-muted-foreground">
                    ≤ {maxDist} min
                  </span>
                </div>
                <Slider
                  min={1}
                  max={globalDistMax}
                  step={1}
                  value={[maxDist]}
                  onValueChange={([v]) => setMaxDist(v)}
                  aria-label="Max walk distance"
                />
              </div>

              {/* Sublease policy */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sublease policy</p>
                <div className="flex flex-wrap gap-2">
                  {SUBLEASE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleSublease(value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        subleaseFilter.has(value)
                          ? "border-asu-gold bg-asu-gold text-white dark:border-asu-gold dark:bg-asu-gold dark:text-gray-900"
                          : "border-border bg-background text-muted-foreground hover:border-asu-gold/50 hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-base font-semibold">No apartments match your filters</p>
          <p className="text-sm text-muted-foreground">
            Try widening the rent range or walk distance.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-1 border-amber-300 text-asu-gold hover:bg-asu-gold/10 dark:border-asu-gold dark:text-asu-gold dark:hover:bg-asu-maroon/20"
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <li key={apt.id}>
              <ApartmentCard apartment={apt} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
