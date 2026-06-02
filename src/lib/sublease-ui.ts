/**
 * Sublease board visuals: tinted chips stay low-contrast; warm accents (amber)
 * tie rent, links, notices, and CTAs together.
 */
export const subleaseChip = {
  /** Room type */
  room:
    "border border-slate-400/35 bg-slate-500/[0.08] text-slate-800 shadow-none dark:border-slate-400/18 dark:bg-slate-400/[0.10] dark:text-slate-200/90",

  /** Gender preference */
  gender:
    "border border-indigo-400/35 bg-indigo-500/[0.08] text-indigo-950 shadow-none dark:border-indigo-400/18 dark:bg-indigo-400/[0.10] dark:text-indigo-200/88",

  /** Vegetarian household */
  veg: "border border-emerald-400/35 bg-emerald-500/[0.08] text-emerald-950 shadow-none dark:border-emerald-400/18 dark:bg-emerald-400/[0.10] dark:text-emerald-200/88",

  /** Non-veg OK */
  nonVeg:
    "border border-amber-400/35 bg-amber-500/[0.08] text-amber-950 shadow-none dark:border-amber-400/18 dark:bg-amber-400/[0.10] dark:text-amber-200/88",

  /** Utilities included */
  utilities:
    "border border-cyan-400/30 bg-cyan-500/[0.07] text-cyan-950 shadow-none dark:border-cyan-400/16 dark:bg-cyan-400/[0.09] dark:text-cyan-200/85",

  /** Furnishing / misc meta */
  furnished:
    "border border-stone-400/35 bg-stone-500/[0.07] text-stone-900 shadow-none dark:border-stone-400/16 dark:bg-stone-400/[0.09] dark:text-stone-200/88",

  /** Any diet / low-emphasis factual */
  meta: "border border-border/70 bg-muted/40 text-muted-foreground shadow-none dark:bg-muted/30",
} as const;

/** Rent headline (light: visibly orange; dark: soft warm glow) */
export const subleaseRentClass =
  "font-bold tabular-nums text-amber-600 dark:text-amber-200/92";

/** Secondary links (directory, apartment) */
export const subleaseLinkClass =
  "underline-offset-4 transition-colors text-amber-900/80 hover:text-amber-950 hover:underline dark:text-amber-400/72 dark:hover:text-amber-300";

/** Outline control hover (buttons, ghost actions) - same amber family */
export const subleaseOutlineAccentHover =
  "hover:border-amber-500/35 hover:bg-amber-500/[0.07] hover:text-foreground dark:hover:border-amber-400/30 dark:hover:bg-amber-400/[0.08]";

/** Tiny text actions (reset filters, etc.) */
export const subleaseMutedActionClass =
  "text-amber-900/68 underline-offset-4 transition-colors hover:text-amber-950 hover:underline dark:text-amber-400/65 dark:hover:text-amber-300";

/** Solid CTA (“Post …”) aligned with accents */
export const subleaseSolidCtaClass =
  "bg-amber-600 text-white shadow-sm shadow-amber-900/15 hover:bg-amber-700 dark:bg-amber-500/88 dark:text-zinc-950 dark:shadow-amber-950/20 dark:hover:bg-amber-400/90";

/** Notice strip: same hue, very light */
export const subleaseNoticeClass =
  "border border-amber-500/22 bg-amber-500/[0.07] dark:border-amber-400/18 dark:bg-amber-400/[0.07]";
