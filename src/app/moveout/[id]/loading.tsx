export default function MoveoutDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-6 h-8 w-24 animate-pulse rounded-lg bg-muted" />
      <div className="mb-2 h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mb-8 flex gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card">
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
