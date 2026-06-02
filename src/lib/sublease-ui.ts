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
    "border border-asu-gold/35 bg-asu-gold/[0.08] text-amber-950 shadow-none dark:border-asu-gold/18 dark:bg-yellow-500/[0.10] dark:text-amber-200/88",

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
  "font-bold tabular-nums text-asu-gold dark:text-amber-200/92";

/** Secondary links (directory, apartment) */
export const subleaseLinkClass =
  "underline-offset-4 transition-colors text-asu-gold/80 hover:text-asu-gold hover:underline dark:text-asu-gold/72 dark:hover:text-yellow-300";

/** Outline control hover (buttons, ghost actions) - same amber family */
export const subleaseOutlineAccentHover =
  "hover:border-asu-gold/35 hover:bg-asu-gold/[0.07] hover:text-foreground dark:hover:border-asu-gold/30 dark:hover:bg-yellow-500/[0.08]";

/** Tiny text actions (reset filters, etc.) */
export const subleaseMutedActionClass =
  "text-asu-gold/68 underline-offset-4 transition-colors hover:text-asu-gold hover:underline dark:text-asu-gold/65 dark:hover:text-yellow-300";

/** Solid CTA (“Post …”) aligned with accents */
export const subleaseSolidCtaClass =
  "bg-asu-gold text-white shadow-sm shadow-amber-900/15 hover:bg-yellow-500 dark:bg-asu-gold/88 dark:text-zinc-950 dark:shadow-amber-950/20 dark:hover:bg-yellow-500/90";

/** Notice strip: same hue, very light */
export const subleaseNoticeClass =
  "border border-asu-gold/22 bg-asu-gold/[0.07] dark:border-asu-gold/18 dark:bg-yellow-500/[0.07]";
