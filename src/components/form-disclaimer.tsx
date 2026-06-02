import Link from "next/link";

export function FormDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground leading-relaxed border-t pt-4">
      By submitting, you confirm this information is accurate and you agree to
      our{" "}
      <Link
        href="/terms"
        className="underline underline-offset-4 hover:text-foreground"
      >
        Terms of Service
      </Link>
      . ASU Orbit is not responsible for transactions between users.
    </p>
  );
}
