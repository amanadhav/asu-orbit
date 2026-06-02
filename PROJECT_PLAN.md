# Build Plan

## Phase 0 - Scaffolding (Day 1)
- [ ] Next.js 16 + TypeScript + Tailwind v4 + ESLint
- [ ] shadcn/ui setup with slate theme + dark mode via next-themes
- [ ] Header (logo + nav + dark mode toggle + mobile hamburger)
- [ ] Footer
- [ ] Placeholder routes so nav works
- [ ] Supabase project created, env vars wired up
- [ ] Deployed to Vercel

## Phase 1 - Apartment Directory (Week 1)
- [ ] Supabase tables: apartments, apartment_photos, apartment_reviews
- [ ] Storage bucket for photos with public read
- [ ] Seed 10 apartments manually with basic info (no photos/reviews yet)
- [ ] /apartments - grid view with filters: rent range, distance to campus, sublease-allowed
- [ ] /apartments/[slug] - apartment page with:
  - Cover photo + photo gallery
  - Quick facts sidebar
  - Reviews section with aggregated star ratings
  - "Submit a photo" and "Submit a review" CTAs
  - Live subleases at this apartment
- [ ] /submit/photo - form to upload a photo (with email verification)
- [ ] /submit/review - form to submit a review (with email verification)
- [ ] Admin route /admin - verify pending submissions

## Phase 2 - Sublease Board (Week 2)
- [ ] Supabase table: subleases
- [ ] /subleases - grid with filters: gender, room type, diet, rent range, dates, apartment
- [ ] /subleases/[id] - individual sublease page
- [ ] /submit/sublease - submission form with apartment dropdown
- [ ] Auto-expire listings 30 days after creation
- [ ] Email verification flow for submissions
- [ ] Admin can mark "taken" or "expired"
- [ ] Seed with 10 real listings collected manually from WhatsApp

## Phase 3 - Launch and Iterate (Week 3+)
- [ ] Create the curated sublease WhatsApp group
- [ ] Announce in 3-4 existing ASU student groups + r/ASU
- [ ] Manually add listings from the group to seed
- [ ] Reach out to current residents to submit photos and reviews for top 5 apartments
- [ ] Track what people actually use and ask for

## Phase 4 - Add-ons (Month 2+, only if traction)
- [ ] Move-out sales
- [ ] Roommate requests
- [ ] Static guide pages (transit, food, free, attractions, student)
- [ ] Twilio WhatsApp bot for auto-parsing group messages

## Not Doing
- Payments / escrow
- Full user accounts
- WhatsApp scraping
- Naming individual apartment staff in reviews