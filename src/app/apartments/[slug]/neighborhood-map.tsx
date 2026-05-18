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
    <section aria-labelledby="neighborhood-heading">
      <h2
        id="neighborhood-heading"
        className="font-heading mb-1 text-xl font-semibold tracking-tight"
      >
        📍 Neighborhood
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Explore transit stops, grocery stores, and restaurants nearby.
      </p>
      <iframe
        title={`Map of ${name}`}
        src={src}
        width="100%"
        height="350"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full rounded-xl border-0"
        style={{ height: 350 }}
      />
    </section>
  );
}
