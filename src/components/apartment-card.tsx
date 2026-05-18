import Image from "next/image";
import Link from "next/link";
import { Building2, Clock, MapPin } from "lucide-react";

import { getPhotoUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { Apartment } from "@/lib/types";

interface ApartmentCardProps {
  apartment: Apartment;
  className?: string;
}

export function ApartmentCard({ apartment, className }: ApartmentCardProps) {
  return (
    <Link
      href={`/apartments/${apartment.slug}`}
      className={cn(
        "group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-200 group-hover:shadow-md group-focus-visible:shadow-md">
        {/* Cover photo / placeholder */}
        {apartment.cover_photo ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b bg-muted">
            <Image
              src={getPhotoUrl(apartment.cover_photo.storage_path)}
              alt={`${apartment.name} exterior`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center border-b bg-muted">
            <Building2
              className="size-12 text-muted-foreground/30"
              aria-hidden
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <h2 className="font-heading text-sm font-semibold leading-snug text-foreground">
              {apartment.name}
            </h2>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{apartment.address}</span>
            </p>
          </div>

          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
            ${apartment.rent_min.toLocaleString()}
            <span className="font-normal text-muted-foreground"> - </span>$
            {apartment.rent_max.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              /mo
            </span>
          </p>

          {apartment.distance_to_campus_minutes_walk != null && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" aria-hidden />~
              {apartment.distance_to_campus_minutes_walk} min walk to campus
            </p>
          )}

        </div>
      </article>
    </Link>
  );
}
