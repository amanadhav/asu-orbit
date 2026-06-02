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
import type { Listing } from "@/lib/types";

export function ListingEditForm({
  listing,
  onCancel,
}: {
  listing: Listing;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      condition: formData.get("condition") as string,
      description: formData.get("description") as string,
      contact_whatsapp: formData.get("contact_whatsapp") as string,
      contact_instagram: formData.get("contact_instagram") as string,
    };

    startTransition(async () => {
      const res = await updateListingByAdmin("listings", listing.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Listing updated successfully.");
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
            <Label>Title</Label>
            <Input name="title" defaultValue={listing.title} required />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select name="category" defaultValue={listing.category}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="bedding">Bedding</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="decor">Decor</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="misc">Misc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input name="price" type="number" defaultValue={listing.price} required />
          </div>
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select name="condition" defaultValue={listing.condition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like new</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contact WhatsApp</Label>
            <Input name="contact_whatsapp" defaultValue={listing.contact_whatsapp || ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Instagram</Label>
            <Input name="contact_instagram" defaultValue={listing.contact_instagram || ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea name="description" defaultValue={listing.description || ""} rows={3} />
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
