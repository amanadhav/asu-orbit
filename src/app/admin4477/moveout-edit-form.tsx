"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateListingByAdmin } from "./actions";
import type { MoveoutSale } from "@/lib/types";

export function MoveoutEditForm({
  sale,
  onCancel,
}: {
  sale: MoveoutSale;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      seller_name: formData.get("seller_name") as string,
      moveout_date: formData.get("moveout_date") as string,
      contact_whatsapp: formData.get("contact_whatsapp") as string,
      contact_instagram: formData.get("contact_instagram") as string,
      additional_info: formData.get("additional_info") as string,
    };

    startTransition(async () => {
      const res = await updateListingByAdmin("moveout_sales", sale.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Move-out sale updated successfully.");
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
            <Label>Seller Name</Label>
            <Input name="seller_name" defaultValue={sale.seller_name} required />
          </div>
          <div className="space-y-1.5">
            <Label>Move-out Date</Label>
            <Input name="moveout_date" type="date" defaultValue={sale.moveout_date} required />
          </div>
          <div className="space-y-1.5">
            <Label>Contact WhatsApp</Label>
            <Input name="contact_whatsapp" defaultValue={sale.contact_whatsapp || ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Instagram</Label>
            <Input name="contact_instagram" defaultValue={sale.contact_instagram || ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Additional Info</Label>
          <Textarea name="additional_info" defaultValue={sale.additional_info || ""} rows={3} />
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
