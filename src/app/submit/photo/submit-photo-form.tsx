"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
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
import { photoSchema, type PhotoFormValues } from "@/lib/schemas";
import type { Apartment } from "@/lib/types";
import { submitPhotoAction } from "../actions";
import { FormDisclaimer } from "@/components/form-disclaimer";
import { convertHeicIfNeeded, isHeicLike } from "@/lib/convert-heic-if-needed";

const CATEGORIES = [
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "living", label: "Living room" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Pool" },
  { value: "parking", label: "Parking" },
  { value: "exterior", label: "Exterior / building" },
  { value: "hallway", label: "Hallway" },
  { value: "other", label: "Other" },
] as const;

interface SubmitPhotoFormProps {
  apartments: Apartment[];
  preselectedApartmentId?: string;
}

export function SubmitPhotoForm({
  apartments,
  preselectedApartmentId,
}: SubmitPhotoFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      apartment_id: preselectedApartmentId ?? "",
      category: undefined,
      caption: "",
      submitted_by_email: "",
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    setFileError(null);
    setSelectedFile(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File is too large - max 5 MB.");
      input.value = "";
      return;
    }
    let loadingId: string | number | undefined;
    try {
      if (isHeicLike(file)) {
        loadingId = toast.loading("Converting HEIC to JPEG…");
      }
      const ready = await convertHeicIfNeeded(file);
      if (loadingId !== undefined) toast.dismiss(loadingId);
      setSelectedFile(ready);
    } catch (err) {
      if (loadingId !== undefined) toast.dismiss(loadingId);
      setFileError(
        err instanceof Error ? err.message : "Could not process this image.",
      );
      input.value = "";
    }
  }

  function onSubmit(data: PhotoFormValues) {
    if (!selectedFile) {
      setFileError("Please select a photo.");
      return;
    }
    const formData = new FormData();
    formData.set("photo", selectedFile);
    formData.set("apartment_id", data.apartment_id);
    formData.set("category", data.category);
    formData.set("caption", data.caption ?? "");
    formData.set("submitted_by_email", data.submitted_by_email);

    startTransition(async () => {
      const result = await submitPhotoAction(formData);
      if (result.success) {
        toast.success("Photo submitted! It will appear once an admin verifies it.");
        if (result.redirectTo) router.push(result.redirectTo);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Apartment */}
      <div className="space-y-2">
        <Label htmlFor="apartment_id">
          Apartment <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={preselectedApartmentId}
          onValueChange={(v) => setValue("apartment_id", v, { shouldValidate: true })}
        >
          <SelectTrigger id="apartment_id" className="w-full">
            <SelectValue placeholder="Select a complex…" />
          </SelectTrigger>
          <SelectContent>
            {apartments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.apartment_id && (
          <p className="text-xs text-destructive">{errors.apartment_id.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Room type <span className="text-destructive">*</span>
        </Label>
        <Select onValueChange={(v) => setValue("category", v as PhotoFormValues["category"], { shouldValidate: true })}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="What part of the apartment?" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <Label htmlFor="photo">
          Photo <span className="text-destructive">*</span>
        </Label>
        <div
          className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 transition-colors hover:border-amber-500/50 hover:bg-muted/50"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-8 text-muted-foreground" aria-hidden />
          {selectedFile ? (
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click to select - max 5 MB
            </p>
          )}
        </div>
        <input
          ref={fileRef}
          id="photo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption (optional)</Label>
        <Input
          id="caption"
          placeholder="e.g. 1-bed, facing the courtyard, Aug 2024"
          {...register("caption")}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="submitted_by_email">
          Your ASU email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="submitted_by_email"
          type="email"
          placeholder="you@asu.edu"
          {...register("submitted_by_email")}
        />
        {errors.submitted_by_email && (
          <p className="text-xs text-destructive">{errors.submitted_by_email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Used only to verify submissions. Never shown publicly.
        </p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:text-gray-900 dark:hover:bg-amber-400 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading…
          </>
        ) : (
          "Submit photo"
        )}
      </Button>
      <FormDisclaimer />
    </form>
  );
}
