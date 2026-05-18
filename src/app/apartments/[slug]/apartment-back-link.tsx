"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const linkClass =
  "mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export function ApartmentBackLink() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("from");

  if (raw === "subleases") {
    return (
      <Link href="/subleases" className={linkClass}>
        <ArrowLeft className="size-4" />
        Back to subleases
      </Link>
    );
  }

  if (raw === "marketplace") {
    return (
      <Link href="/marketplace" className={linkClass}>
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>
    );
  }

  return (
    <Link href="/apartments" className={linkClass}>
      <ArrowLeft className="size-4" />
      All apartments
    </Link>
  );
}
