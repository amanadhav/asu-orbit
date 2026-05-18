export default function ApartmentSlugLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Back link */}
      <div className="mb-6 h-4 w-28 animate-pulse rounded bg-muted" />
      {/* Title */}
      <div className="mb-6 space-y-2">
        <div className="h-9 w-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
      {/* Gallery */}
      <div className="aspect-[16/7] animate-pulse rounded-xl bg-muted" />
      {/* Separator */}
      <div className="my-8 h-px bg-border" />
      {/* Two-col body */}
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
