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
      <div className="rounded-xl border border-l-4 border-l-amber-500 bg-card px-6 py-5 shadow-sm">
        <h2
          id="community-notes-heading"
          className="font-heading mb-3 text-base font-bold tracking-tight"
        >
          📣 What residents say
        </h2>

        <div
          className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground
            [&_p]:leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0
            [&_ul]:my-2 [&_li]:my-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <p className="mt-4 border-t pt-3 text-xs text-muted-foreground/70">
          Synthesized from public reviews and community feedback. Not affiliated
          with the property.
        </p>
      </div>
    </section>
  );
}
