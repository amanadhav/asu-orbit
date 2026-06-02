import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ASU Orbit - what data we collect and how we use it.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-heading mb-2 text-3xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

        <p className="text-base text-muted-foreground">
          ASU Orbit is a small community site with no advertising and no
          interest in selling your data. This policy explains what limited
          information we collect and why.
        </p>

        <h2>What we collect</h2>
        <p>
          The only piece of personal information we collect is your{" "}
          <strong className="text-foreground font-medium">ASU email address</strong>{" "}
          when you submit a listing, photo, or review. We use it solely
          to verify that you are an ASU student or affiliate. We do not collect
          names, phone numbers, payment information, location data, or any
          other personal data.
        </p>

        <h2>What we do not collect</h2>
        <ul>
          <li>No tracking cookies or advertising pixels</li>
          <li>No analytics that identify individual users</li>
          <li>No device fingerprinting</li>
          <li>No third-party social login data</li>
        </ul>

        <h2>Email addresses are never shown publicly</h2>
        <p>
          Your ASU email is stored in our database for verification purposes
          only. It is never displayed on any public page, never shared with
          other users, and never sold or rented to anyone. If a sublease
          poster chooses to include a personal email as their contact method,
          that is their own choice - we do not expose your submission email
          regardless.
        </p>

        <h2>Listings are public</h2>
        <p>
          Once a listing, photo, or review is approved, it is visible to
          anyone who visits the site - no login required. Do not include
          personal contact details in a listing unless you intend for them
          to be publicly visible.
        </p>

        <h2>Third-party services</h2>
        <p>
          We use Supabase to store data. Their privacy policy is available at{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            supabase.com/privacy
          </a>
          . We do not use Google Analytics, Facebook Pixel, or any other
          third-party tracking service.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain submitted data (including the associated email address)
          for as long as the listing or content is active on the site.
          Rejected submissions are deleted. If you would like your data
          removed, contact us and we will delete it.
        </p>

        <h2>Requesting data deletion</h2>
        <p>
          To request that your email address or any content you submitted be
          removed from our database, email{" "}
          <a
            href="mailto:avadhav@asu.edu"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            avadhav@asu.edu
          </a>{" "}
          with the subject line &ldquo;Data deletion request&rdquo;. We will
          process your request within 7 days.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we ever change what data we collect, we will update this page and
          the date at the top. We will not start collecting new categories of
          personal data without updating this policy first.
        </p>

        <div className="mt-10 rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          Questions?{" "}
          <a
            href="mailto:avadhav@asu.edu"
            className="text-primary underline underline-offset-4"
          >
            avadhav@asu.edu
          </a>{" "}
          &middot;{" "}
          <Link href="/terms" className="text-primary underline underline-offset-4">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
