"use client";

import * as React from "react";
import { Trash2, Loader2, Save, ChevronDown, ChevronUp, CheckCircle, Ban } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { updateApartmentContent, approveApartmentRequest, rejectRecord, deleteRecord } from "./actions";
import type { Apartment } from "@/lib/types";

export type ApartmentRequest = {
  id: string;
  apartment_name: string;
  address: string | null;
  submitted_by_email: string | null;
  created_at: string;
  status: "pending" | "added" | "rejected";
};

function ApartmentRow({ apartment }: { apartment: Apartment }) {
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState(
    apartment.description ?? "",
  );
  const [communityNotes, setCommunityNotes] = React.useState(
    apartment.community_notes ?? "",
  );
  const [floorplansJson, setFloorplansJson] = React.useState(
    apartment.floorplans ? JSON.stringify(apartment.floorplans, null, 2) : "",
  );
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function handleFloorplansChange(val: string) {
    setFloorplansJson(val);
    if (!val.trim()) { setJsonError(null); return; }
    try { JSON.parse(val); setJsonError(null); }
    catch { setJsonError("Invalid JSON"); }
  }

  function save() {
    if (jsonError) { toast.error("Fix the floorplans JSON before saving."); return; }
    startTransition(async () => {
      const result = await updateApartmentContent(
        apartment.id,
        description,
        communityNotes,
        floorplansJson,
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${apartment.name} saved`);
        setOpen(false);
      }
    });
  }

  return (
    <div className="border-b last:border-0">
      {/* Row header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-muted/30 transition-colors px-1 rounded"
      >
        <div>
          <p className="font-medium text-sm">{apartment.name}</p>
          <p className="text-xs text-muted-foreground">{apartment.address}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {apartment.community_notes ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Notes ✓
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No notes</span>
          )}
          {open ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Inline edit form */}
      {open && (
        <div className="pb-5 space-y-4 px-1">
          <div className="space-y-2">
            <Label htmlFor={`desc-${apartment.id}`}>Description</Label>
            <Textarea
              id={`desc-${apartment.id}`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Official apartment description…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${apartment.id}`}>
              Community notes{" "}
              <span className="font-normal text-muted-foreground">
                (supports markdown)
              </span>
            </Label>
            <Textarea
              id={`notes-${apartment.id}`}
              rows={6}
              value={communityNotes}
              onChange={(e) => setCommunityNotes(e.target.value)}
              placeholder="Paste synthesised summary from scripts/reddit-data/all-summaries.json…"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`fp-${apartment.id}`}>
              Floorplans (JSON){" "}
              <span className="font-normal text-muted-foreground">optional</span>
            </Label>
            <Textarea
              id={`fp-${apartment.id}`}
              rows={5}
              value={floorplansJson}
              onChange={(e) => handleFloorplansChange(e.target.value)}
              placeholder={`[{"type":"1B1B","rent_min":950,"rent_max":1100}]`}
              className={`font-mono text-xs ${jsonError ? "border-destructive" : ""}`}
            />
            {jsonError && (
              <p className="text-xs text-destructive">{jsonError}</p>
            )}
          </div>

          <Button
            size="sm"
            onClick={save}
            disabled={pending}
            className="gap-1.5"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Requested apartments ──────────────────────────────────────
function RequestRow({ req }: { req: ApartmentRequest }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function approve() {
    startTransition(async () => {
      const result = await approveApartmentRequest(req.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${req.apartment_name}" marked as added`);
        router.refresh();
      }
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectRecord("apartment_requests", req.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${req.apartment_name}" rejected`);
        router.refresh();
      }
    });
  }

  function removeRequest() {
    if (
      !window.confirm(
        `Permanently delete the request for "${req.apartment_name}"?`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteRecord("apartment_requests", req.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Request deleted");
        router.refresh();
      }
    });
  }

  const badgeVariant =
    req.status === "pending"
      ? "secondary"
      : req.status === "rejected"
        ? "outline"
        : "outline";
  const badgeClass =
    req.status === "added"
      ? "border-green-600/40 text-green-700 dark:text-green-400"
      : req.status === "rejected"
        ? "border-asu-gold/40 text-asu-gold dark:text-asu-gold"
        : "";

  return (
    <div className="flex items-start justify-between gap-4 border-b py-4 last:border-0">
      <div className="space-y-1 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-sm">{req.apartment_name}</p>
          <Badge variant={badgeVariant} className={badgeClass}>
            {req.status === "pending"
              ? "Pending"
              : req.status === "rejected"
                ? "Rejected"
                : "Added"}
          </Badge>
        </div>
        {req.address && (
          <p className="text-xs text-muted-foreground">{req.address}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {req.submitted_by_email ?? "Anonymous"}
          {" · "}
          {format(parseISO(req.created_at), "MMM d, yyyy")}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={approve}
          disabled={pending || req.status === "added"}
          title={req.status === "added" ? "Already marked as added" : undefined}
          className="gap-1 border-green-600/30 text-green-600 hover:bg-green-600/10 hover:text-green-700 dark:text-green-400"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle className="size-3.5" />
          )}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={reject}
          disabled={pending || req.status === "rejected"}
          title={req.status === "rejected" ? "Already rejected" : undefined}
          className="gap-1 border-asu-gold/40 text-asu-gold hover:bg-asu-gold/10 hover:text-asu-gold dark:text-asu-gold"
        >
          <Ban className="size-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={removeRequest}
          disabled={pending}
          className="gap-1"
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

interface ApartmentEditorProps {
  apartments: Apartment[];
  requests?: ApartmentRequest[];
}

type RequestStatusFilter = "all" | "pending" | "approved" | "rejected";

export function ApartmentEditor({
  apartments,
  requests = [],
}: ApartmentEditorProps) {
  const [requestFilter, setRequestFilter] =
    React.useState<RequestStatusFilter>("pending");

  const filteredRequests = React.useMemo(() => {
    if (requestFilter === "all") return requests;
    if (requestFilter === "pending")
      return requests.filter((r) => r.status === "pending");
    if (requestFilter === "approved")
      return requests.filter((r) => r.status === "added");
    return requests.filter((r) => r.status === "rejected");
  }, [requests, requestFilter]);

  const pendingReqCount = requests.filter((r) => r.status === "pending")
    .length;

  return (
    <div>
      {apartments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No apartments found.
        </p>
      ) : (
        apartments.map((apt) => (
          <ApartmentRow key={apt.id} apartment={apt} />
        ))
      )}

      {requests.length > 0 && (
        <>
          <Separator className="my-6" />
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold">Requested apartments</h3>
              {pendingReqCount > 0 && (
                <Badge
                  variant="destructive"
                  className="rounded-full px-1.5 py-0 text-[10px]"
                >
                  {pendingReqCount}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Label htmlFor="req-status-filter" className="text-xs whitespace-nowrap">
                  Status
                </Label>
                <Select
                  value={requestFilter}
                  onValueChange={(v) =>
                    setRequestFilter(v as RequestStatusFilter)
                  }
                >
                  <SelectTrigger id="req-status-filter" className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Students couldn&apos;t find these complexes in the directory. Add
              them to the apartments table, then mark as added here.
            </p>
            {filteredRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {requestFilter === "rejected"
                  ? "No rejected apartment requests."
                  : requestFilter === "all"
                    ? "No apartment requests."
                    : `No ${requestFilter} apartment requests.`}
              </p>
            ) : (
              filteredRequests.map((r) => (
                <RequestRow key={r.id} req={r} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
