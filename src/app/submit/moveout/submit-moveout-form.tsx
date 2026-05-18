"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormDisclaimer } from "@/components/form-disclaimer";
import { ApartmentRequestForm } from "@/components/apartment-request-form";
import {
  moveoutSaleSchema,
  moveoutItemSchema,
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
  type MoveoutSaleFormValues,
  type MoveoutItemFormValues,
} from "@/lib/schemas";
import type { Apartment } from "@/lib/types";
import { convertHeicIfNeeded, isHeicLike } from "@/lib/convert-heic-if-needed";
import { submitMoveoutAction } from "../actions";

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Furniture",
  kitchen: "Kitchen",
  electronics: "Electronics",
  bedding: "Bedding",
  study: "Study & office",
  decor: "Decor",
  clothing: "Clothing",
  misc: "Miscellaneous",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

interface SubmitMoveoutFormProps {
  apartments: Apartment[];
}

// Combined schema for the two-step form
const step1Schema = moveoutSaleSchema;
const step2Schema = z.object({
  items: z.array(moveoutItemSchema).min(1, "Add at least one item").max(20),
});

type Step1Values = MoveoutSaleFormValues;
type Step2Values = { items: MoveoutItemFormValues[] };

export function SubmitMoveoutForm({ apartments }: SubmitMoveoutFormProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [useDirectory, setUseDirectory] = React.useState(true);
  const [step1Data, setStep1Data] = React.useState<Step1Values | null>(null);
  const [pending, startTransition] = React.useTransition();
  // Map from item index → File | null
  const [photoFiles, setPhotoFiles] = React.useState<Record<number, File | null>>({});

  // ── Step 1 form ──────────────────────────────────────────────
  const {
    register: reg1,
    handleSubmit: handle1,
    setValue: set1,
    watch: watch1,
    formState: { errors: err1 },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      seller_name: "",
      apartment_id: "",
      custom_location: "",
      moveout_date: "",
      contact_whatsapp: "",
      contact_instagram: "",
      additional_info: "",
      submitted_by_email: "",
    },
  });

  // ── Step 2 form ──────────────────────────────────────────────
  const {
    register: reg2,
    handleSubmit: handle2,
    control,
    setValue: set2,
    watch: watch2,
    formState: { errors: err2 },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { items: [{ name: "", category: "misc", price: 0, condition: "good" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // ── Step 1 submit ────────────────────────────────────────────
  function onStep1(data: Step1Values) {
    setStep1Data(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Final submit ─────────────────────────────────────────────
  function onStep2(data: Step2Values) {
    if (!step1Data) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("sale", JSON.stringify(step1Data));
      fd.set("items", JSON.stringify(data.items));
      data.items.forEach((_, i) => {
        const file = photoFiles[i];
        if (file) fd.set(`photo_${i}`, file);
      });

      const result = await submitMoveoutAction(fd);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Move-out sale submitted!", {
          description:
            "It will appear once approved. Share this page with your building's WhatsApp group once live: asu-desi-hub.vercel.app/moveout",
          duration: 5000,
        });
        window.setTimeout(() => {
          router.push("/moveout");
        }, 1000);
      }
    });
  }

  // ── Step indicator ───────────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-8 flex items-center gap-3">
      {[1, 2].map((n) => (
        <React.Fragment key={n}>
          <div className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
            step === n
              ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
              : step > n
              ? "bg-green-500 text-white"
              : "border bg-muted text-muted-foreground"
          }`}>
            {step > n ? "✓" : n}
          </div>
          <span className={`text-sm ${step === n ? "font-medium" : "text-muted-foreground"}`}>
            {n === 1 ? "Sale details" : "Add items"}
          </span>
          {n < 2 && <div className="h-px flex-1 bg-border" />}
        </React.Fragment>
      ))}
    </div>
  );

  // ── Step 1 ───────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-6">
        <StepIndicator />
        <form onSubmit={handle1(onStep1)} className="space-y-5">
          {/* Seller name */}
          <div className="space-y-2">
            <Label htmlFor="seller_name">Your name <span className="text-destructive">*</span></Label>
            <Input id="seller_name" placeholder="First name or initials" {...reg1("seller_name")} />
            {err1.seller_name && <p className="text-xs text-destructive">{err1.seller_name.message}</p>}
          </div>

          {/* Apartment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Location <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${useDirectory ? "text-foreground" : "text-muted-foreground"}`}>
                  From directory
                </span>
                <Switch checked={!useDirectory} onCheckedChange={(v) => setUseDirectory(!v)} />
                <span className={`text-xs ${!useDirectory ? "text-foreground" : "text-muted-foreground"}`}>
                  Custom
                </span>
              </div>
            </div>
            {useDirectory ? (
              <Select onValueChange={(v) => { set1("apartment_id", v); set1("custom_location", ""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your apartment complex" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="e.g. Off-campus house near ASU"
                {...reg1("custom_location")}
                onChange={(e) => { set1("custom_location", e.target.value); set1("apartment_id", ""); }}
              />
            )}
            {err1.apartment_id && <p className="text-xs text-destructive">{err1.apartment_id.message}</p>}
          </div>

          {useDirectory && (
            <ApartmentRequestForm email={watch1("submitted_by_email") ?? ""} />
          )}

          {/* Move-out date */}
          <div className="space-y-2">
            <Label htmlFor="moveout_date">Move-out date <span className="text-destructive">*</span></Label>
            <Input id="moveout_date" type="date" {...reg1("moveout_date")} />
            {err1.moveout_date && <p className="text-xs text-destructive">{err1.moveout_date.message}</p>}
          </div>

          {/* Contact method */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium leading-none">
                Contact method <span className="text-destructive">*</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Buyers reach you directly through these links. Provide WhatsApp{" "}
                <span className="font-medium text-foreground/90">or</span> Instagram,
                or <span className="font-medium text-foreground/90">both</span>.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="contact_whatsapp">WhatsApp number</Label>
                <Input
                  id="contact_whatsapp"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 480 555 0123"
                  {...reg1("contact_whatsapp")}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code
                </p>
              </div>
              <div
                className="flex shrink-0 items-center justify-center sm:w-12 sm:border-x sm:border-border/70 sm:bg-muted/25 sm:self-stretch sm:py-0 dark:sm:bg-muted/15"
                aria-hidden
              >
                <span className="rounded-full border border-border/60 bg-muted/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm dark:bg-muted/40">
                  or
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="contact_instagram">Instagram handle</Label>
                <Input
                  id="contact_instagram"
                  placeholder="@your_handle"
                  {...reg1("contact_instagram")}
                />
                <p className="text-xs text-muted-foreground">
                  Without the instagram.com part
                </p>
              </div>
            </div>
            {(err1.contact_whatsapp || err1.contact_instagram) && (
              <div className="space-y-1">
                {err1.contact_whatsapp && (
                  <p className="text-xs text-destructive">{err1.contact_whatsapp.message}</p>
                )}
                {err1.contact_instagram && (
                  <p className="text-xs text-destructive">{err1.contact_instagram.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional info (optional)</Label>
            <Textarea
              id="additional_info"
              placeholder="Pickup hours, building access notes, anything else buyers should know"
              rows={3}
              {...reg1("additional_info")}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="submitted_by_email">Your ASU email <span className="text-destructive">*</span></Label>
            <Input id="submitted_by_email" type="email" placeholder="you@asu.edu" {...reg1("submitted_by_email")} />
            {err1.submitted_by_email && <p className="text-xs text-destructive">{err1.submitted_by_email.message}</p>}
            <p className="text-xs text-muted-foreground">Used only to verify submissions. Never shown publicly.</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 sm:w-auto"
          >
            Next: Add items →
          </Button>
        </form>
      </div>
    );
  }

  // ── Step 2 ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <StepIndicator />

      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        <span className="font-medium">{step1Data?.seller_name}</span>
        {" · "}
          <button
          onClick={() => setStep(1)}
          className="text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Edit sale details
        </button>
      </div>

      <form onSubmit={handle2(onStep2)} className="space-y-6">
        {fields.map((field, i) => {
          const priceVal = watch2(`items.${i}.price`);
          return (
            <div key={field.id} className="space-y-4 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Item {i + 1}</h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      remove(i);
                      setPhotoFiles((prev) => {
                        const next = { ...prev };
                        delete next[i];
                        return next;
                      });
                    }}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </Button>
                )}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label>Item name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. IKEA bed frame, queen size" {...reg2(`items.${i}.name`)} />
                {err2.items?.[i]?.name && (
                  <p className="text-xs text-destructive">{err2.items[i]?.name?.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select
                    defaultValue={field.category}
                    onValueChange={(v) => set2(`items.${i}.category`, v as MoveoutItemFormValues["category"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div className="space-y-1.5">
                  <Label>Condition <span className="text-destructive">*</span></Label>
                  <Select
                    defaultValue={field.condition}
                    onValueChange={(v) => set2(`items.${i}.condition`, v as MoveoutItemFormValues["condition"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label>
                  Price{" "}
                  {priceVal === 0 && <Badge variant="secondary" className="ml-1 text-xs">FREE</Badge>}
                  <span className="text-destructive"> *</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={0}
                    max={9999}
                    step={1}
                    placeholder="0"
                    className="pl-7"
                    {...reg2(`items.${i}.price`, { valueAsNumber: true })}
                  />
                </div>
                {err2.items?.[i]?.price && (
                  <p className="text-xs text-destructive">{err2.items[i]?.price?.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Enter 0 to mark as free.</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Dimensions, colour, any defects, etc."
                  rows={2}
                  {...reg2(`items.${i}.description`)}
                />
              </div>

              {/* Photo */}
              <div className="space-y-1.5">
                <Label>Photo (optional)</Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-amber-500 hover:text-foreground">
                  <Upload className="size-4 shrink-0" />
                  <span>
                    {photoFiles[i]?.name ?? "Click to upload (max 5 MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const input = e.target;
                      const raw = input.files?.[0] ?? null;
                      if (!raw) {
                        setPhotoFiles((prev) => {
                          const next = { ...prev };
                          delete next[i];
                          return next;
                        });
                        return;
                      }
                      if (raw.size > 5 * 1024 * 1024) {
                        toast.error(`Photo for item ${i + 1} must be under 5 MB.`);
                        input.value = "";
                        return;
                      }
                      let loadingId: string | number | undefined;
                      try {
                        if (isHeicLike(raw)) {
                          loadingId = toast.loading("Converting HEIC to JPEG…");
                        }
                        const file = await convertHeicIfNeeded(raw);
                        if (loadingId !== undefined) toast.dismiss(loadingId);
                        setPhotoFiles((prev) => ({ ...prev, [i]: file }));
                      } catch (err) {
                        if (loadingId !== undefined) toast.dismiss(loadingId);
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Could not process photo.",
                        );
                        input.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}

        {fields.length < 20 && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() =>
              append({ name: "", category: "misc", price: 0, condition: "good" })
            }
          >
            <PlusCircle className="size-4" />
            Add another item
          </Button>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            `Submit sale (${fields.length} item${fields.length !== 1 ? "s" : ""})`
          )}
        </Button>
        <FormDisclaimer />
      </form>
    </div>
  );
}
