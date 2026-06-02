"use client";

import * as React from "react";
import {
  Ban,
  CheckCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getPhotoUrl } from "@/lib/supabase/storage";
import {
  approveRecord,
  rejectRecord,
  deleteRecord,
  markAsTaken,
  markAsClosed,
  markAsSold,
  type ModeratableTable,
} from "./actions";
import { ApartmentEditor, type ApartmentRequest } from "./apartment-editor";
import { SubleaseEditForm } from "./sublease-edit-form";
import { ListingEditForm } from "./listing-edit-form";
import { MoveoutEditForm } from "./moveout-edit-form";
import type {
  Apartment,
  ApartmentPhoto,
  ApartmentReview,
  SubleaseWithApartment,
  MoveoutSale,
  Listing,
} from "@/lib/types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function modRejected(r: { verified: boolean; rejected?: boolean }) {
  return !r.verified && !!(r.rejected ?? false);
}

function modPending(r: { verified: boolean; rejected?: boolean }) {
  return !r.verified && !(r.rejected ?? false);
}

function filterModeratedRows<T extends { verified: boolean; rejected?: boolean }>(
  rows: T[],
  filter: StatusFilter,
): T[] {
  if (filter === "all") return rows;
  if (filter === "pending") return rows.filter(modPending);
  if (filter === "approved") return rows.filter((r) => r.verified);
  return rows.filter(modRejected);
}

function ModerationStatusBadge({
  verified,
  rejected,
}: {
  verified: boolean;
  rejected?: boolean;
}) {
  const rej = rejected ?? false;
  if (verified && !rej) {
    return (
      <Badge
        variant="outline"
        className="border-green-600/40 text-green-700 dark:text-green-400"
      >
        Approved
      </Badge>
    );
  }
  if (!verified && rej) {
    return (
      <Badge
        variant="outline"
        className="border-asu-gold/40 text-asu-gold dark:text-asu-gold"
      >
        Rejected
      </Badge>
    );
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function StatusFilterSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor={id} className="text-xs whitespace-nowrap">
        Status
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as StatusFilter)}>
        <SelectTrigger id={id} className="h-9 w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ModerationRowActions({
  table,
  id,
  verified,
  rejected,
  onEdit,
  onOptimisticDelete,
  onUndoDelete,
}: {
  table: ModeratableTable;
  id: string;
  verified: boolean;
  rejected?: boolean;
  onEdit?: () => void;
  onOptimisticDelete: () => void;
  onUndoDelete: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const rej = rejected ?? false;
  const isApproved = verified && !rej;
  const isRejectedState = !verified && rej;

  function run(action: () => Promise<{ error?: string }>, okMsg: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else {
        toast.success(okMsg);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    onOptimisticDelete();
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) {
        startTransition(async () => {
          const result = await deleteRecord(table, id);
          if (result.error) toast.error("Failed to delete permanently: " + result.error);
          else router.refresh();
        });
      }
    }, 5000);

    toast("Record deleted.", {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          cancelled = true;
          clearTimeout(timer);
          onUndoDelete();
          toast.success("Action undone.");
        },
      },
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending || isApproved}
        title={isApproved ? "Already approved" : undefined}
        className="gap-1 border-green-600/30 text-green-600 hover:bg-green-600/10 hover:text-green-700 dark:text-green-400"
        onClick={() => run(() => approveRecord(table, id), "Approved")}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || isRejectedState}
        title={isRejectedState ? "Already rejected" : undefined}
        className="gap-1 border-asu-gold/40 text-asu-gold hover:bg-asu-gold/10 hover:text-asu-gold dark:text-asu-gold"
        onClick={() => run(() => rejectRecord(table, id), "Marked as rejected")}
      >
        <Ban className="size-3.5" />
        Reject
      </Button>
      {onEdit && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          className="gap-1"
          onClick={onEdit}
        >
          <Edit2 className="size-3.5" />
          Edit
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        className="gap-1"
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>
    </div>
  );
}

function PhotoRow({
  photo,
  apartmentName,
}: {
  photo: ApartmentPhoto;
  apartmentName: string;
}) {
  const [isDeleted, setIsDeleted] = React.useState(false);
  if (isDeleted) return null;

  const photoHref = getPhotoUrl(photo.storage_path);

  return (
    <div className="flex items-start justify-between gap-4 border-b py-4 last:border-0">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ModerationStatusBadge
            verified={photo.verified}
            rejected={photo.rejected}
          />
          <p className="font-medium">{apartmentName}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{photo.category}</Badge>
          {photo.caption && (
            <span className="text-xs text-muted-foreground">{photo.caption}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {photo.submitted_by_email} · {fmtDate(photo.created_at)}
        </p>
        <a
          href={photoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          <ExternalLink className="size-3" />
          View photo
        </a>
      </div>
      <ModerationRowActions
        table="apartment_photos"
        id={photo.id}
        verified={photo.verified}
        rejected={photo.rejected}
        onOptimisticDelete={() => setIsDeleted(true)}
        onUndoDelete={() => setIsDeleted(false)}
      />
    </div>
  );
}

function ReviewRow({
  review,
  apartmentName,
}: {
  review: ApartmentReview;
  apartmentName: string;
}) {
  const [isDeleted, setIsDeleted] = React.useState(false);
  if (isDeleted) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b py-4 last:border-0">
      <div className="min-w-0 space-y-1 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <ModerationStatusBadge
            verified={review.verified}
            rejected={review.rejected}
          />
          <p className="font-medium">{apartmentName}</p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Overall: {review.rating_overall}/5</span>
          <span>·</span>
          <span>Recommend: {review.would_recommend ? "Yes" : "No"}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {review.review_text}
        </p>
        <p className="text-xs text-muted-foreground">
          {review.submitted_by_email} · {fmtDate(review.created_at)}
        </p>
      </div>
      <ModerationRowActions
        table="apartment_reviews"
        id={review.id}
        verified={review.verified}
        rejected={review.rejected}
        onOptimisticDelete={() => setIsDeleted(true)}
        onUndoDelete={() => setIsDeleted(false)}
      />
    </div>
  );
}

function SubleaseRow({ s }: { s: SubleaseWithApartment }) {
  const router = useRouter();
  const [secondaryPending, startSecondary] = React.useTransition();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  if (isDeleted) return null;

  const name = s.apartments?.name ?? s.custom_apartment_name ?? "Unknown";
  const showMarkTaken =
    s.verified && !(s.rejected ?? false) && s.status === "active";

  function markTaken() {
    startSecondary(async () => {
      const result = await markAsTaken(s.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Marked as taken");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ModerationStatusBadge verified={s.verified} rejected={s.rejected} />
          <p className="font-medium">{name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">${s.rent_monthly}/mo</Badge>
          <Badge variant="outline">{s.room_type}</Badge>
          <Badge variant="outline">{s.gender_preference}</Badge>
          <Badge variant="outline">Listing: {s.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {fmtDate(s.available_from)} - {fmtDate(s.available_until)}
        </p>
        <p className="text-xs text-muted-foreground">
          {s.submitted_by_email} · {fmtDate(s.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <ModerationRowActions
          table="subleases"
          id={s.id}
          verified={s.verified}
          rejected={s.rejected}
          onEdit={() => setIsEditing(!isEditing)}
          onOptimisticDelete={() => setIsDeleted(true)}
          onUndoDelete={() => setIsDeleted(false)}
        />
        {showMarkTaken && (
          <Button
            size="sm"
            variant="secondary"
            disabled={secondaryPending}
            className="gap-1"
            onClick={markTaken}
          >
            {secondaryPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Mark as taken
          </Button>
        )}
      </div>
      </div>
      {isEditing && <SubleaseEditForm sublease={s} onCancel={() => setIsEditing(false)} />}
    </div>
  );
}

type MoveoutSaleRow = MoveoutSale & {
  apartment_name: string;
  item_count: number;
};

function MoveoutSaleAdminRow({ sale }: { sale: MoveoutSaleRow }) {
  const router = useRouter();
  const [secondaryPending, startSecondary] = React.useTransition();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  if (isDeleted) return null;

  const showClose =
    sale.verified &&
    !(sale.rejected ?? false) &&
    sale.status !== "closed";

  function closeSale() {
    startSecondary(async () => {
      const result = await markAsClosed(sale.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Sale marked closed");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ModerationStatusBadge
            verified={sale.verified}
            rejected={sale.rejected}
          />
          <p className="font-medium">{sale.seller_name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{sale.apartment_name}</Badge>
          <Badge variant="outline">
            {sale.item_count} item{sale.item_count !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline">Sale: {sale.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Move-out: {fmtDate(sale.moveout_date)}
        </p>
        <p className="text-xs text-muted-foreground">
          {sale.submitted_by_email} · {fmtDate(sale.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <ModerationRowActions
          table="moveout_sales"
          id={sale.id}
          verified={sale.verified}
          rejected={sale.rejected}
          onEdit={() => setIsEditing(!isEditing)}
          onOptimisticDelete={() => setIsDeleted(true)}
          onUndoDelete={() => setIsDeleted(false)}
        />
        {showClose && (
          <Button
            size="sm"
            variant="secondary"
            disabled={secondaryPending}
            onClick={closeSale}
          >
            {secondaryPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Mark as closed
          </Button>
        )}
      </div>
      </div>
      {isEditing && <MoveoutEditForm sale={sale} onCancel={() => setIsEditing(false)} />}
    </div>
  );
}

function ListingAdminRow({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [secondaryPending, startSecondary] = React.useTransition();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  if (isDeleted) return null;

  const showSold =
    listing.verified &&
    !(listing.rejected ?? false) &&
    listing.status !== "sold";

  function sold() {
    startSecondary(async () => {
      const result = await markAsSold(listing.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Marked as sold");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <ModerationStatusBadge
            verified={listing.verified}
            rejected={listing.rejected}
          />
          <p className="font-medium">{listing.title}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{listing.category}</Badge>
          <Badge variant="outline">
            {listing.price === 0 ? "FREE" : `$${listing.price}`}
          </Badge>
          <Badge variant="outline">{listing.condition}</Badge>
          <Badge variant="outline">Item: {listing.status}</Badge>
        </div>
        {listing.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {listing.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Contact: {listing.contact_method}
        </p>
        <p className="text-xs text-muted-foreground">
          {listing.submitted_by_email} · {fmtDate(listing.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <ModerationRowActions
          table="listings"
          id={listing.id}
          verified={listing.verified}
          rejected={listing.rejected}
          onEdit={() => setIsEditing(!isEditing)}
          onOptimisticDelete={() => setIsDeleted(true)}
          onUndoDelete={() => setIsDeleted(false)}
        />
        {showSold && (
          <Button
            size="sm"
            variant="secondary"
            disabled={secondaryPending}
            onClick={sold}
          >
            {secondaryPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Mark as sold
          </Button>
        )}
      </div>
      </div>
      {isEditing && <ListingEditForm listing={listing} onCancel={() => setIsEditing(false)} />}
    </div>
  );
}

function EmptyModerationState({
  filter,
  noun,
}: {
  filter: StatusFilter;
  noun: string;
}) {
  const label =
    filter === "all"
      ? `No ${noun}.`
      : `No ${filter} ${noun}.`;
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">{label}</p>
  );
}

interface AdminDashboardProps {
  photos: (ApartmentPhoto & { apartment_name: string })[];
  reviews: (ApartmentReview & { apartment_name: string })[];
  subleases: SubleaseWithApartment[];
  moveoutSales: MoveoutSaleRow[];
  listings: Listing[];
  apartments: Apartment[];
  apartmentRequests: ApartmentRequest[];
}

export function AdminDashboard({
  photos,
  reviews,
  subleases,
  moveoutSales,
  listings,
  apartments,
  apartmentRequests,
}: AdminDashboardProps) {
  const [logoutPending, startLogout] = React.useTransition();

  const [photoFilter, setPhotoFilter] =
    React.useState<StatusFilter>("pending");
  const [reviewFilter, setReviewFilter] =
    React.useState<StatusFilter>("pending");
  const [subleaseFilter, setSubleaseFilter] =
    React.useState<StatusFilter>("pending");
  const [moveoutFilter, setMoveoutFilter] =
    React.useState<StatusFilter>("pending");
  const [listingFilter, setListingFilter] =
    React.useState<StatusFilter>("pending");

  const photoPending = photos.filter(modPending).length;
  const reviewPending = reviews.filter(modPending).length;
  const subleasePending = subleases.filter(modPending).length;
  const moveoutPending = moveoutSales.filter(modPending).length;
  const listingPending = listings.filter(modPending).length;
  const aptReqPending = apartmentRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const filteredPhotos = filterModeratedRows(photos, photoFilter);
  const filteredReviews = filterModeratedRows(reviews, reviewFilter);
  const filteredSubleases = filterModeratedRows(subleases, subleaseFilter);
  const filteredMoveout = filterModeratedRows(moveoutSales, moveoutFilter);
  const filteredListings = filterModeratedRows(listings, listingFilter);

  function logout() {
    startLogout(async () => {
      await fetch("/admin4477/logout", { method: "POST" });
      window.location.href = "/";
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={logout}
          disabled={logoutPending}
        >
          {logoutPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Logging out…
            </>
          ) : (
            "Logout"
          )}
        </Button>
      </div>

      <Tabs defaultValue="photos">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="photos">
            Photos
            {photoPending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {photoPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews
            {reviewPending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {reviewPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subleases">
            Subleases
            {subleasePending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {subleasePending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="moveout">
            Move-out sales
            {moveoutPending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {moveoutPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="listings">
            Listings
            {listingPending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {listingPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="apartments">
            Apartments
            {aptReqPending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
              >
                {aptReqPending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <StatusFilterSelect
              id="photo-status-filter"
              value={photoFilter}
              onChange={setPhotoFilter}
            />
          </div>
          {filteredPhotos.length === 0 ? (
            <EmptyModerationState filter={photoFilter} noun="photos" />
          ) : (
            filteredPhotos.map((p) => (
              <PhotoRow key={p.id} photo={p} apartmentName={p.apartment_name} />
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <StatusFilterSelect
              id="review-status-filter"
              value={reviewFilter}
              onChange={setReviewFilter}
            />
          </div>
          {filteredReviews.length === 0 ? (
            <EmptyModerationState filter={reviewFilter} noun="reviews" />
          ) : (
            filteredReviews.map((r) => (
              <ReviewRow key={r.id} review={r} apartmentName={r.apartment_name} />
            ))
          )}
        </TabsContent>

        <TabsContent value="subleases" className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <StatusFilterSelect
              id="sublease-status-filter"
              value={subleaseFilter}
              onChange={setSubleaseFilter}
            />
          </div>
          {filteredSubleases.length === 0 ? (
            <EmptyModerationState filter={subleaseFilter} noun="subleases" />
          ) : (
            filteredSubleases.map((s) => <SubleaseRow key={s.id} s={s} />)
          )}
        </TabsContent>

        <TabsContent value="moveout" className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <StatusFilterSelect
              id="moveout-status-filter"
              value={moveoutFilter}
              onChange={setMoveoutFilter}
            />
          </div>
          {filteredMoveout.length === 0 ? (
            <EmptyModerationState filter={moveoutFilter} noun="move-out sales" />
          ) : (
            filteredMoveout.map((s) => (
              <MoveoutSaleAdminRow key={s.id} sale={s} />
            ))
          )}
        </TabsContent>

        <TabsContent value="listings" className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <StatusFilterSelect
              id="listing-status-filter"
              value={listingFilter}
              onChange={setListingFilter}
            />
          </div>
          {filteredListings.length === 0 ? (
            <EmptyModerationState filter={listingFilter} noun="direct listings" />
          ) : (
            filteredListings.map((l) => (
              <ListingAdminRow key={l.id} listing={l} />
            ))
          )}
        </TabsContent>

        <TabsContent value="apartments" className="rounded-xl border bg-card p-5">
          <p className="mb-4 text-xs text-muted-foreground">
            Edit description and community notes for each apartment. Community
            notes support markdown and are displayed on the public apartment page.
          </p>
          <ApartmentEditor apartments={apartments} requests={apartmentRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
