import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for ASU Orbit - community bulletin board for students at ASU.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-heading mb-2 text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: May 2026
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

        <p className="text-base text-muted-foreground">
          ASU Orbit is a free community bulletin board built for all
          students at Arizona State University. By using this
          site, you agree to the following terms. They are written in plain
          English on purpose - if something is unclear, email us.
        </p>

        <h2>We are a bulletin board, not a party to any transaction</h2>
        <p>
          ASU Orbit does not buy, sell, rent, or sublease anything.
          We provide a space for students to share information and connect
          with each other. Any agreement, transaction, or arrangement made
          between users is entirely between those users. We are not involved,
          we are not responsible, and we have no liability for the outcome.
        </p>

        <h2>We do not verify listing accuracy</h2>
        <p>
          We verify that submissions come from ASU email addresses, but we do
          not independently confirm that the information in any listing - rent amounts, availability dates, apartment conditions, or anything
          else - is accurate. Always verify details directly with the person
          posting before making any decision.
        </p>

        <h2>Check your own lease before subleasing</h2>
        <p>
          Subleasing may be restricted, require landlord approval, or be
          prohibited entirely under your individual lease agreement. It is
          your responsibility to read your lease and understand what you are
          allowed to do before posting or accepting a sublease. ASU Orbit
          does not provide legal advice and cannot tell you whether subleasing
          is permitted in your specific situation.
        </p>

        <h2>You are responsible for your own safety</h2>
        <p>
          When meeting someone from a listing, take common-sense precautions:
          meet in a public place, bring a friend, do not transfer money before
          viewing a space in person, and trust your instincts. We do not
          screen users beyond verifying an ASU email address.
        </p>

        <h2>Your submissions must be honest</h2>
        <p>
          By submitting a listing, photo, or review, you confirm that the
          information is accurate to the best of your knowledge and that you
          have the right to share it. Do not post fake listings, misleading
          information, or content that belongs to someone else.
        </p>

        <h2>We may remove any listing</h2>
        <p>
          We reserve the right to remove, reject, or modify any listing,
          photo, or review at any time and for any reason, including (but not
          limited to) inaccurate information, complaints from other users,
          or content that violates these terms. We do not guarantee that any
          submission will be approved or remain visible.
        </p>

        <h2>No commercial transactions on this platform</h2>
        <p>
          ASU Orbit does not process payments, collect deposits, or
          facilitate any financial transaction between users. If anyone
          claiming to be associated with ASU Orbit asks you for money,
          that is a scam - please report it immediately.
        </p>

        <h2>Intellectual property</h2>
        <p>
          By submitting a photo, you grant ASU Orbit a non-exclusive,
          royalty-free licence to display that photo on the site. You retain
          ownership. Do not submit photos you do not have the right to share.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          site after a change means you accept the updated terms. We will
          update the date at the top of this page when changes are made.
        </p>

        <h2>Contact and DMCA</h2>
        <p>
          For questions, concerns, content removal requests, or DMCA takedown
          notices, email{" "}
          <a
            href="mailto:avadhav@asu.edu"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            avadhav@asu.edu
          </a>
          . We will respond as quickly as we can.
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
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
