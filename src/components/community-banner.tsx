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
      className="border-b bg-muted/60 px-4 py-3"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            ASU Desi Hub is a community bulletin board.
          </span>{" "}
          We don&apos;t verify listings or handle transactions. Always meet in
          a safe public place and trust your instincts.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">Got it</span>
        </button>
      </div>
    </div>
  );
}
