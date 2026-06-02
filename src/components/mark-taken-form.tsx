"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markListingByOwner } from "@/app/submit/actions";

interface MarkTakenFormProps {
  id: string;
  type: "sublease" | "listing" | "moveout";
  label: string;
}

export function MarkTakenForm({ id, type, label }: MarkTakenFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    startTransition(async () => {
      const res = await markListingByOwner({ type, id, email: email.trim() });
      if (res.success) {
        toast.success("Listing removed from the board");
        if (type === "sublease") {
          router.push("/subleases");
        } else if (type === "listing") {
          router.push("/marketplace");
        } else if (type === "moveout") {
          router.push("/moveout");
        }
      } else {
        toast.error(res.error || "Failed to mark as taken.");
      }
    });
  }

  if (!isOpen) {
    return (
      <div className="mt-12 flex justify-center pb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Did you post this?{" "}
          <span className="text-asu-maroon dark:text-rose-400 hover:underline underline-offset-4">
            {label}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 flex justify-center pb-8">
      <div className="w-full max-w-sm rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <p className="mb-4 text-sm font-medium text-foreground">
          Confirm it's yours to remove it from the board.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Your ASU email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
            disabled={isPending}
          />
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-asu-maroon text-white hover:bg-rose-800 dark:bg-rose-700 dark:hover:bg-rose-600"
            >
              {isPending ? "Updating..." : "Mark as taken"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
