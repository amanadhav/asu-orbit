interface NeighborhoodMapProps {
  name: string;
  address: string;
}

export function NeighborhoodMap({ name, address }: NeighborhoodMapProps) {
  // Search by name + city so Google Maps pins the registered business (shows the
  // apartment name in the info box). Using just the address often resolves to the
  // generic city result on the free embed API.
  const query = `${name}, Tempe, AZ`;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`;

  return (
    <section aria-labelledby="neighborhood-heading" className="space-y-4">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Location
        </p>
        <h2
          id="neighborhood-heading"
          className="font-heading text-xl font-bold tracking-tight sm:text-2xl"
        >
          Neighborhood
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Explore transit stops, grocery stores, and restaurants nearby ({address}).
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <iframe
          title={`Map of ${name}`}
          src={src}
          width="100%"
          height="350"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full border-0 bg-muted/20"
          style={{ height: 350 }}
        />
      </div>
    </section>
  );
}
