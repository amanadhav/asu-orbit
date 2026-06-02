"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

/** Amber outline aligned with CTAs elsewhere on the site */
const amberOutlineBtn =
  "border-amber-600 text-amber-700 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300";

const WA_PRETEXT = encodeURIComponent(
  "Hi! I saw your listing on ASU Orbit and I'm interested.",
);

/**
 * Phone classification (strict-ish):
 * - Trimmed starts with + and (after stripping spaces/dashes/parens) the rest are digits only, length ≥ 10,
 * OR
 * - After stripping spaces/dashes/parens only, the remainder is exactly 10 digits, or starts with 1 + 10 more digits (11 total).
 */
function parsePhone(contact: string): string | null {
  const trimmed = contact.trim();

  const noPlusNormalized = trimmed.replace(/[\s\-().]/g, "");

  if (trimmed.startsWith("+")) {
    const restDigits = noPlusNormalized.replace(/^\+/, "").replace(/\D/g, "");
    if (restDigits.length >= 10 && restDigits.length <= 15) return restDigits;
    return null;
  }

  if (!/^[\d\s\-().]+$/.test(trimmed)) {
    return null;
  }

  const d = trimmed.replace(/\D/g, "");
  if (d.length === 10) return `1${d}`;
  if (d.length === 11 && d.startsWith("1")) return d;
  return null;
}

function instagramHandle(contact: string): string | null {
  const trimmed = contact.trim();

  const igUrl = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]{1,30})/i);
  if (igUrl?.[1]) return igUrl[1].replace(/\/+$/, "");

  if (trimmed.startsWith("@")) {
    const h =
      trimmed.slice(1).split(/\s+/)[0]?.replace(/[^a-zA-Z0-9._]/g, "") ?? "";
    return h.length > 0 ? h : null;
  }

  if (trimmed.toLowerCase().includes("instagram")) {
    const atMatch = trimmed.match(/@([\w.]{1,30})/);
    if (atMatch?.[1]) return atMatch[1];
    return null;
  }

  return null;
}

/** Handle from the Instagram-only field (@user, plain user, or URL). */
function instagramHandleFromField(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.length) return null;
  const fromParser = instagramHandle(trimmed);
  if (fromParser) return fromParser;
  const stripped =
    trimmed.replace(/^@+/, "").split(/\s+/)[0]?.trim() ?? "";
  return /^[a-zA-Z0-9._]{1,30}$/.test(stripped) ? stripped : null;
}

function extractEmail(contact: string): string | null {
  const m = contact.match(/\b[^\s<>]+@[^\s<>]+\.[^\s]+/);
  return m?.[0]?.trim() ?? null;
}

function useCopiedFeedback(durationMs = 2000) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), durationMs);
    return () => window.clearTimeout(t);
  }, [copied, durationMs]);

  const flash = React.useCallback(() => setCopied(true), []);

  return { copied, flash };
}

function CopyContactFooter({ raw }: { raw: string }) {
  const { copied, flash } = useCopiedFeedback();

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw);
      flash();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="border-t border-border/80 pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={amberOutlineBtn}
        onClick={onCopy}
      >
        {copied ? "Copied ✓" : "Copy contact"}
      </Button>
    </div>
  );
}

/** Legacy freeform string parsing (existing rows before structured columns). */
function LegacyContactSection({ contact }: { contact: string }) {
  const rawTrimmed = contact.trim();

  const phoneDigits = parsePhone(contact);
  const ig = phoneDigits ? null : instagramHandle(contact);
  const emailResolved = phoneDigits || ig ? null : extractEmail(contact);

  const waUrl =
    phoneDigits != null
      ? `https://wa.me/${phoneDigits}?text=${WA_PRETEXT}`
      : null;
  const telHref = phoneDigits != null ? `tel:+${phoneDigits}` : null;

  return (
    <>
      {phoneDigits != null && waUrl != null && telHref != null ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp →
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a href={telHref} target="_blank" rel="noopener noreferrer">
              Call
            </a>
          </Button>
        </div>
      ) : null}

      {ig ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a
              href={`https://instagram.com/${encodeURIComponent(ig)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram →
            </a>
          </Button>
        </div>
      ) : null}

      {emailResolved ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a href={`mailto:${emailResolved}`} target="_blank" rel="noopener noreferrer">
              Email →
            </a>
          </Button>
        </div>
      ) : null}

      {!phoneDigits && !ig && !emailResolved ? (
        <FallbackInlineCopy contactRaw={contact} displayText={rawTrimmed} />
      ) : null}
    </>
  );
}

function FallbackInlineCopy({
  contactRaw,
  displayText,
}: {
  contactRaw: string;
  displayText: string;
}) {
  const { copied, flash } = useCopiedFeedback();

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(contactRaw);
      flash();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="break-all text-sm font-medium">{displayText}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={amberOutlineBtn}
        onClick={onCopy}
      >
        {copied ? "Copied ✓" : "Copy"}
      </Button>
    </div>
  );
}

export type ContactDisplayProps = {
  whatsapp?: string | null;
  instagram?: string | null;
  /** Legacy freeform column for rows without structured WhatsApp / Instagram. */
  fallback?: string | null;
};

export function ContactDisplay({
  whatsapp,
  instagram,
  fallback,
}: ContactDisplayProps) {
  const waTrim = whatsapp?.trim() ?? "";
  const igTrim = instagram?.trim() ?? "";
  const fbTrim = fallback?.trim() ?? "";
  const hasStructured = waTrim.length > 0 || igTrim.length > 0;

  if (!hasStructured && !fbTrim.length) {
    return (
      <p className="text-sm text-muted-foreground">No contact provided.</p>
    );
  }

  const phoneDigits = waTrim.length > 0 ? parsePhone(waTrim) : null;
  const waUrl =
    phoneDigits != null
      ? `https://wa.me/${phoneDigits}?text=${WA_PRETEXT}`
      : null;
  const telHref = phoneDigits != null ? `tel:+${phoneDigits}` : null;

  const igHandle = igTrim.length > 0 ? instagramHandleFromField(igTrim) : null;

  const copyRaw = hasStructured
    ? [
        ...(waTrim ? [`WhatsApp: ${waTrim}`] : []),
        ...(igTrim ? [`Instagram: ${igTrim}`] : []),
      ].join(" · ")
    : fbTrim;

  return (
    <div className="space-y-3">
      {waTrim.length > 0 &&
      phoneDigits != null &&
      waUrl != null &&
      telHref != null ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp →
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a href={telHref} target="_blank" rel="noopener noreferrer">
              Call
            </a>
          </Button>
        </div>
      ) : null}

      {igHandle ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 ${amberOutlineBtn}`}
            asChild
          >
            <a
              href={`https://instagram.com/${encodeURIComponent(igHandle)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram →
            </a>
          </Button>
        </div>
      ) : null}

      {!hasStructured ? <LegacyContactSection contact={fbTrim} /> : null}

      {copyRaw.length > 0 ? <CopyContactFooter raw={copyRaw} /> : null}
    </div>
  );
}
