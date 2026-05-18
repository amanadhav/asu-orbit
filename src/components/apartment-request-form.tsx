"use client";

import * as React from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestApartmentAction } from "@/app/submit/actions";

interface ApartmentRequestFormProps {
  /** Pre-fills submitted_by_email from the parent form's watched email field. */
  email?: string;
}

export function ApartmentRequestForm({ email = "" }: ApartmentRequestFormProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [done, setDone] = React.useState(false);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");

  function handleSubmit() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await requestApartmentAction({
        apartment_name: name.trim(),
        address: address.trim() || undefined,
        submitted_by_email: email.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
      } else {
        setDone(true);
        // Auto-collapse after 3 s so the parent form flow continues
        setTimeout(() => {
          setOpen(false);
          setDone(false);
          setName("");
          setAddress("");
        }, 3000);
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Don&apos;t see your apartment? Tell us the name and we&apos;ll add it
        <ArrowRight className="size-3 shrink-0" />
      </button>

      {open && (
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          {done ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="size-4 shrink-0" />
              Request sent - we&apos;ll add it to the directory soon!
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Apartment name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="e.g. Brickyard Tempe"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address (if you know it)</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="e.g. 123 E Apache Blvd, Tempe, AZ 85281"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || !name.trim()}
                  onClick={handleSubmit}
                  className="h-7 text-xs"
                >
                  {pending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Request to add"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
