export default function ApartmentsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-80 animate-pulse rounded bg-muted" />
      </div>
      {/* Filter skeleton */}
      <div className="mb-6 h-14 animate-pulse rounded-xl border bg-muted" />
      {/* Grid skeleton */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="aspect-[16/10] animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
                <div className="h-5 w-1/4 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
