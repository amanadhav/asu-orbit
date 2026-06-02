import { marked } from "marked";

interface CommunityNotesProps {
  notes: string;
}

/**
 * Renders admin-curated community notes (synthesised from public Reddit data)
 * as formatted markdown inside a visually distinct accent card.
 *
 * Only rendered when community_notes is non-null - the parent checks this.
 */
export async function CommunityNotes({ notes }: CommunityNotesProps) {
  const html = marked.parse(notes) as string;

  return (
    <section aria-labelledby="community-notes-heading">
      <div className="rounded-2xl border border-border border-l-[3px] border-l-amber-500/90 bg-card px-5 py-6 shadow-sm ring-1 ring-black/[0.04] dark:border-border dark:border-l-amber-500 dark:ring-white/[0.06] sm:px-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What residents say
        </p>
        <h2
          id="community-notes-heading"
          className="font-heading mb-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          Community notes
        </h2>

        <div
          className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground
            [&_p]:leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0
            [&_ul]:my-2 [&_li]:my-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground/80">
          Synthesized from public reviews and community feedback. Not affiliated
          with the property.
        </p>
      </div>
    </section>
  );
}
