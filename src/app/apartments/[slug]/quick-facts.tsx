import {
  Bus,
  Clock,
  DollarSign,
  Globe,
  PawPrint,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  subleaseLinkClass,
  subleaseRentClass,
} from "@/lib/sublease-ui";
import type { Apartment } from "@/lib/types";

interface QuickFactsProps {
  apartment: Apartment;
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function formatRent(min: number, max: number): string {
  if (min === max) return `$${min.toLocaleString()}/mo`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
}

export function QuickFacts({ apartment }: QuickFactsProps) {

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Quick facts
      </h2>
      <Separator className="my-4" />

      <div className="flex flex-col gap-4">
        {/* Floorplans & Rent */}
        <div className="flex items-start gap-3">
          <DollarSign className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Floorplans &amp; Rent</p>
            {apartment.floorplans && apartment.floorplans.length > 0 ? (
              <div className="mt-1.5 flex flex-col gap-1.5">
                {apartment.floorplans.map((fp) => (
                  <div key={fp.type} className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{fp.type}</span>
                    <span
                      className={cn("text-sm font-semibold tabular-nums", subleaseRentClass)}
                    >
                      {formatRent(fp.rent_min, fp.rent_max)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={cn("text-sm font-semibold", subleaseRentClass)}>
                {`$${apartment.rent_min.toLocaleString()} - $${apartment.rent_max.toLocaleString()}/mo`}
              </p>
            )}
          </div>
        </div>

        {apartment.distance_to_campus_minutes_walk != null && (
          <Fact
            icon={Clock}
            label="Walk to campus"
            value={`~${apartment.distance_to_campus_minutes_walk} min (est.)`}
          />
        )}

        {apartment.nearest_transit && (
          <div className="flex items-start gap-3">
            <Bus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Nearest transit</p>
              <p className="text-sm font-medium">{apartment.nearest_transit}</p>
              <a
                href="https://www.valleymetro.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline dark:hover:text-amber-300"
              >
                Valley Metro routes →
              </a>
            </div>
          </div>
        )}

        {apartment.pet_policy && (
          <Fact
            icon={PawPrint}
            label="Pet policy"
            value={apartment.pet_policy}
          />
        )}

        {apartment.official_website && (
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Official website</p>
              <a
                href={apartment.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("text-sm font-medium", subleaseLinkClass)}
              >
                Visit site →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
