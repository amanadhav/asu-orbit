import Link from "next/link";

const submitLinks = [
  { href: "/submit/photo", label: "Photo" },
  { href: "/submit/review", label: "Review" },
  { href: "/submit/sublease", label: "Sublease" },
  { href: "/submit/moveout", label: "Move-out sale" },
] as const;

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

/** Dark band footer - same in light/dark themes for contrast with the airy page shell. */
const footerLink =
  "text-zinc-400 underline-offset-4 transition-colors hover:text-amber-400 hover:underline";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-4">
            <p className="font-heading text-lg font-semibold tracking-tight text-white">
              ASU Orbit
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Built by{" "}
              <span className="font-medium text-zinc-200">Aman</span>
              {" · "}
              Community bulletin board - not affiliated with ASU.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legal">
              {legalLinks.map((item) => (
                <Link key={item.href} href={item.href} className={footerLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4 md:items-end md:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Submit
            </p>
            <nav
              className="flex flex-col gap-2.5 text-sm md:items-end"
              aria-label="Submit"
            >
              <span className="sr-only">Submit links:</span>
              {submitLinks.map((item) => (
                <Link key={item.href} href={item.href} className={`font-medium ${footerLink}`}>
                  Submit {item.label.toLowerCase()}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
