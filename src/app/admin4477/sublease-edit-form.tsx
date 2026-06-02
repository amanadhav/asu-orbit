"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateListingByAdmin } from "./actions";
import type { SubleaseWithApartment } from "@/lib/types";

export function SubleaseEditForm({
  sublease,
  onCancel,
}: {
  sublease: SubleaseWithApartment;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      rent_monthly: Number(formData.get("rent_monthly")),
      available_from: formData.get("available_from") as string,
      available_until: formData.get("available_until") as string,
      gender_preference: formData.get("gender_preference") as string,
      room_type: formData.get("room_type") as string,
      household_diet: formData.get("household_diet") as string,
      furnished: formData.get("furnished") as string,
      contact_whatsapp: formData.get("contact_whatsapp") as string,
      contact_instagram: formData.get("contact_instagram") as string,
      additional_info: formData.get("additional_info") as string,
    };

    startTransition(async () => {
      const res = await updateListingByAdmin("subleases", sublease.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Sublease updated successfully.");
        router.refresh();
        onCancel();
      }
    });
  }

  return (
    <div className="mt-4 rounded-xl border bg-muted/40 p-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Rent Monthly</Label>
            <Input name="rent_monthly" type="number" defaultValue={sublease.rent_monthly} required />
          </div>
          <div className="space-y-1.5">
            <Label>Available From</Label>
            <Input name="available_from" type="date" defaultValue={sublease.available_from} required />
          </div>
          <div className="space-y-1.5">
            <Label>Available Until</Label>
            <Input name="available_until" type="date" defaultValue={sublease.available_until} required />
          </div>
          <div className="space-y-1.5">
            <Label>Gender Preference</Label>
            <Select name="gender_preference" defaultValue={sublease.gender_preference}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Room Type</Label>
            <Select name="room_type" defaultValue={sublease.room_type}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Household Diet</Label>
            <Select name="household_diet" defaultValue={sublease.household_diet}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non_veg">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Furnished</Label>
            <Select name="furnished" defaultValue={sublease.furnished || "unfurnished"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fully">Fully</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unfurnished">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contact WhatsApp</Label>
            <Input name="contact_whatsapp" defaultValue={sublease.contact_whatsapp || ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Instagram</Label>
            <Input name="contact_instagram" defaultValue={sublease.contact_instagram || ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Additional Info</Label>
          <Textarea name="additional_info" defaultValue={sublease.additional_info || ""} rows={3} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
