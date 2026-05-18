import type { Metadata } from "next";
import { getApartments } from "@/lib/supabase/queries";
import { SubmitMoveoutForm } from "./submit-moveout-form";

export const metadata: Metadata = {
  title: "List your move-out sale",
  description: "Post furniture, electronics, and household items from your move-out for students at ASU Tempe.",
};

export default async function SubmitMoveoutPage() {
  const apartments = await getApartments().catch(() => []);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Submit</p>
      <h1 className="font-heading mb-1 text-3xl font-bold tracking-tight">
        List your move-out sale
      </h1>
      <p className="mb-8 text-muted-foreground">
        Moving out? List your furniture, electronics, and other items so fellow
        ASU students can grab them before you leave.
      </p>
      <SubmitMoveoutForm apartments={apartments} />
    </div>
  );
}
