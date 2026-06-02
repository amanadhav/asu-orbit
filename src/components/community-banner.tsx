"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "asu-desi-hub-banner-dismissed";

export function CommunityBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, SSR) - don't show
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-200/40 bg-amber-50/70 py-3.5 text-foreground dark:border-amber-900/35 dark:bg-amber-950/25"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            ASU Orbit is a community bulletin board.
          </span>{" "}
          We don&apos;t verify listings or handle transactions. Always meet in
          a safe public place and trust your instincts.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-amber-100/80 hover:text-foreground dark:hover:bg-amber-900/40"
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">Got it</span>
        </button>
      </div>
    </div>
  );
}
