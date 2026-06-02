import Image from "next/image";
import { Camera } from "lucide-react";

import { getPhotoUrl } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import { subleaseLinkClass } from "@/lib/sublease-ui";
import type { ApartmentPhoto, PhotoCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  living: "Living room",
  gym: "Gym",
  pool: "Pool",
  parking: "Parking",
  exterior: "Exterior",
  hallway: "Hallway",
  other: "Other",
};

interface PhotoGalleryProps {
  photos: ApartmentPhoto[];
  apartmentName: string;
  submitHref: string;
}

export function PhotoGallery({
  photos,
  apartmentName,
  submitHref,
}: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/50">
        <Camera className="size-10 text-muted-foreground/30" aria-hidden />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No photos yet for {apartmentName}
          </p>
          <a href={submitHref} className={cn("mt-1 text-sm font-medium", subleaseLinkClass)}>
            Be the first to submit one →
          </a>
        </div>
      </div>
    );
  }

  // Show up to 5 photos in a responsive masonry-style grid
  const main = photos[0];
  const rest = photos.slice(1, 5);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2.5">
      {/* Main photo */}
      <div className="relative col-span-1 row-span-2 overflow-hidden rounded-lg sm:col-span-1 lg:col-span-2 lg:row-span-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={getPhotoUrl(main.storage_path)}
            alt={main.caption ?? `${CATEGORY_LABELS[main.category]} photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>
      </div>

      {/* Thumbnail strip */}
      {rest.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={getPhotoUrl(photo.storage_path)}
            alt={photo.caption ?? `${CATEGORY_LABELS[photo.category]} photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {photo.category !== "other" && (
            <span className="absolute bottom-1.5 left-2 rounded-md border border-border/60 bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-sm">
              {CATEGORY_LABELS[photo.category]}
            </span>
          )}
        </div>
      ))}

      {photos.length > 5 && (
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-muted/60 text-sm font-semibold text-muted-foreground">
          +{photos.length - 5} more
        </div>
      )}
    </div>
  );
}
