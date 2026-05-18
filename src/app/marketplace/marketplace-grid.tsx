"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { MarketplaceItem } from "@/lib/types";

function getMoveoutPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/moveout-photos/${storagePath}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Furniture",
  kitchen: "Kitchen",
  electronics: "Electronics",
  bedding: "Bedding",
  study: "Study",
  decor: "Decor",
  clothing: "Clothing",
  misc: "Misc",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

const CONDITION_COLORS: Record<string, string> = {
  new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  like_new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  good: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  fair: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

type SortKey = "newest" | "price_asc" | "price_desc";
type ListingTypeFilter = "all" | "moveout" | "direct";

interface MarketplaceGridProps {
  items: MarketplaceItem[];
}

export function MarketplaceGrid({ items }: MarketplaceGridProps) {
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [conditionFilter, setConditionFilter] = React.useState("all");
  const [listingTypeFilter, setListingTypeFilter] =
    React.useState<ListingTypeFilter>("all");
  const [freeOnly, setFreeOnly] = React.useState(false);
  const [maxPrice, setMaxPrice] = React.useState(500);
  const [sort, setSort] = React.useState<SortKey>("newest");

  const filtered = React.useMemo(() => {
    let result = [...items];

    if (categoryFilter !== "all")
      result = result.filter((i) => i.category === categoryFilter);
    if (conditionFilter !== "all")
      result = result.filter((i) => i.condition === conditionFilter);
    if (listingTypeFilter !== "all")
      result = result.filter((i) => i.listing_type === listingTypeFilter);
    if (freeOnly) result = result.filter((i) => i.price === 0);
    else result = result.filter((i) => i.price <= maxPrice);

    if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
    // newest = server order (already sorted by created_at desc)

    return result;
  }, [items, categoryFilter, conditionFilter, listingTypeFilter, freeOnly, maxPrice, sort]);

  function clearFilters() {
    setCategoryFilter("all");
    setConditionFilter("all");
    setListingTypeFilter("all");
    setFreeOnly(false);
    setMaxPrice(500);
    setSort("newest");
  }

  return (
    <div className="space-y-6">
      {/* ── Filters ── */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Condition</Label>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any condition</SelectItem>
                {Object.entries(CONDITION_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Listing type</Label>
            <Select
              value={listingTypeFilter}
              onValueChange={(v) =>
                setListingTypeFilter(v as ListingTypeFilter)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All listings</SelectItem>
                <SelectItem value="moveout">Move-out sales only</SelectItem>
                <SelectItem value="direct">Direct listings only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sort</Label>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortKey)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max price - spans last column on large screens */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Max price: {freeOnly ? "FREE" : `$${maxPrice}`}
            </Label>
            <Input
              type="number"
              min={0}
              max={9999}
              value={maxPrice}
              disabled={freeOnly}
              onChange={(e) =>
                setMaxPrice(Math.min(9999, Number(e.target.value)))
              }
              className="h-9"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
            />
            <span className="text-sm font-medium">Free items only</span>
          </label>

          {!freeOnly && (
            <div className="flex min-w-48 flex-1 items-end gap-3">
              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} item{filtered.length !== 1 ? "s" : ""} available
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
          <Package className="size-8 text-muted-foreground/40" />
          <p className="text-muted-foreground">No items match your filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const photoUrl = item.photo_path
              ? getMoveoutPhotoUrl(item.photo_path)
              : null;
            const isMoveout = item.listing_type === "moveout";

            const cardContent = (
              <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                {/* Photo */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="size-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Price pill */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-sm font-bold shadow ${
                        item.price === 0
                          ? "bg-green-500 text-white"
                          : "bg-background/90 text-foreground backdrop-blur-sm"
                      }`}
                    >
                      {item.price === 0 ? "FREE" : `$${item.price}`}
                    </span>
                  </div>
                  {/* Listing type badge */}
                  <div className="absolute right-2 top-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isMoveout
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300"
                      }`}
                    >
                      {isMoveout ? "Move-out sale" : "Direct listing"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="font-medium leading-snug line-clamp-2 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {item.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        CONDITION_COLORS[item.condition]
                      }`}
                    >
                      {CONDITION_LABELS[item.condition]}
                    </span>
                  </div>

                  {!isMoveout && (
                    <div className="mt-auto flex flex-col gap-2">
                      {item.context ? (
                        item.apartment_slug ? (
                          <Link
                            href={`/apartments/${item.apartment_slug}?from=marketplace`}
                            className="text-xs text-muted-foreground line-clamp-1 underline-offset-4 hover:text-amber-600 hover:underline dark:hover:text-amber-400"
                          >
                            {item.context}
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.context}
                          </p>
                        )
                      ) : null}
                      <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        View listing <ArrowRight className="size-3" />
                      </p>
                      {item.contact_method ? (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.contact_method}
                        </p>
                      ) : null}
                    </div>
                  )}

                  {isMoveout && item.context && (
                    <p className="mt-auto text-xs text-muted-foreground line-clamp-1">
                      {item.context}
                    </p>
                  )}

                  {isMoveout && (
                    <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      View sale <ArrowRight className="size-3" />
                    </p>
                  )}
                </div>
              </div>
            );

            return (
              <li key={`${item.listing_type}-${item.id}`}>
                {isMoveout && item.sale_href ? (
                  <Link href={item.sale_href} className="block h-full">
                    {cardContent}
                  </Link>
                ) : !isMoveout ? (
                  <Link href={`/marketplace/${item.id}`} className="block h-full">
                    {cardContent}
                  </Link>
                ) : (
                  <div className="h-full">{cardContent}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
