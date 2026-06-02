import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { subleaseNoticeClass } from "@/lib/sublease-ui";

export function ListingNotice() {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3 text-foreground",
        subleaseNoticeClass,
      )}
    >
      <TriangleAlert
        className="mt-0.5 size-4 shrink-0 text-asu-gold/70 dark:text-asu-gold/55"
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-muted-foreground">
        These listings are posted by community members. Verify details directly
        with the poster before making any decisions.
      </p>
    </div>
  );
}
