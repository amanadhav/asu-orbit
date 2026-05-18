export default function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="mb-8 h-4 w-72 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-32 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
