import { TriangleAlert } from "lucide-react";

export function ListingNotice() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <TriangleAlert
        className="mt-0.5 size-4 shrink-0 text-amber-500 dark:text-amber-400"
        aria-hidden
      />
      <p className="text-sm leading-relaxed">
        These listings are posted by community members. Verify details directly
        with the poster before making any decisions.
      </p>
    </div>
  );
}
