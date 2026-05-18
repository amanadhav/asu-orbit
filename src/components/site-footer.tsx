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

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <span className="font-medium text-foreground">Aman</span>
            {" · "}
            Community bulletin board - not affiliated with ASU.
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legal">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-amber-600 hover:underline dark:hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
          aria-label="Submit"
        >
          <span className="sr-only">Submit links:</span>
          {submitLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-amber-600 hover:underline dark:hover:text-amber-400"
            >
              Submit {item.label.toLowerCase()}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
