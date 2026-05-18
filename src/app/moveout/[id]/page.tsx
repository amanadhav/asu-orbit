import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactDisplay } from "@/components/contact-display";
import { getMoveoutSaleById, getMoveoutPhotoUrl } from "@/lib/supabase/queries";
import type { MoveoutItem } from "@/lib/types";

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

const STATUS_STYLES: Record<MoveoutItem["status"], string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  sold: "bg-muted text-muted-foreground",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sale = await getMoveoutSaleById(id);
  if (!sale) return { title: "Sale not found" };
  const location = sale.apartments?.name ?? sale.custom_location ?? "ASU Tempe";
  return {
    title: `${sale.seller_name}'s move-out sale · ${location}`,
    description: `${sale.moveout_items.length} items listed by a student moving out from ${location}.`,
  };
}

export default async function MoveoutSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getMoveoutSaleById(id);
  if (!sale) notFound();

  const location = sale.apartments?.name ?? sale.custom_location ?? "Unknown location";
  const availableCount = sale.moveout_items.filter((i) => i.status === "available").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 gap-1 text-muted-foreground">
        <Link href="/moveout">
          <ArrowLeft className="size-4" />
          All sales
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {sale.seller_name}&apos;s move-out sale
          </h1>
          {sale.status === "mostly_sold" && (
            <Badge variant="secondary">Mostly sold</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {sale.apartments ? (
              <Link
                href={`/apartments/${sale.apartments.slug}`}
                className="text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
              >
                {location}
              </Link>
            ) : (
              location
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" />
            Moving out {format(parseISO(sale.moveout_date), "MMMM d, yyyy")}
          </span>
          <span>
            {availableCount} of {sale.moveout_items.length} item
            {sale.moveout_items.length !== 1 ? "s" : ""} still available
          </span>
        </div>

        {sale.additional_info && (
          <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            {sale.additional_info}
          </p>
        )}
      </div>

      {/* Items grid */}
      <section aria-labelledby="items-heading" className="mb-10">
        <h2 id="items-heading" className="font-heading mb-4 text-xl font-bold tracking-tight">
          Items
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sale.moveout_items
            .sort((a, b) => {
              const order = { available: 0, reserved: 1, sold: 2 };
              return order[a.status] - order[b.status];
            })
            .map((item) => {
              const photoUrl = item.photo_path ? getMoveoutPhotoUrl(item.photo_path) : null;
              const isSold = item.status === "sold";

              return (
                <li
                  key={item.id}
                  className={`overflow-hidden rounded-xl border bg-card shadow-sm ${isSold ? "opacity-50" : ""}`}
                >
                  {/* Photo */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug">{item.name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[item.status]}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xl font-bold">
                      {item.price === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400">${item.price}</span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {CONDITION_LABELS[item.condition]}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </section>

      {/* Contact */}
      <section
        aria-labelledby="contact-heading"
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 id="contact-heading" className="font-heading mb-1 text-lg font-bold tracking-tight">
          Interested? Contact the seller
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Mention which item(s) you are interested in and arrange a pickup time.
        </p>
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          <MessageCircle className="mt-1 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <ContactDisplay
              whatsapp={sale.contact_whatsapp}
              instagram={sale.contact_instagram}
              fallback={sale.contact_method}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Always meet in a public place. Do not transfer money before seeing the
          item in person.{" "}
          <a
            href={`mailto:avadhav@asu.edu?subject=Report listing ${id}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Report this listing
          </a>
        </p>
      </section>
    </div>
  );
}
