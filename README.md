# ASU Orbit

[asu-orbit.vercel.app](https://asu-orbit.vercel.app)

I built this because finding an apartment near ASU as an international student was genuinely awful. Every complex has a different leasing office number, nobody tells you which ones actually allow subleasing, and the only place to find real reviews is buried in a Reddit thread from 3 years ago. On top of that, subleases get posted everywhere -- GroupMe, WhatsApp, random Facebook groups -- with no consistent info and zero filtering.

ASU Orbit tries to fix that. It's two things:

**Apartment directory** -- one page per complex near ASU with actual photos from residents, management reviews, rent ranges, and whether they let you sublease. No fluff, just what you need to decide if it's worth touring.

**Sublease board** -- listings tied to apartments already in the directory, so you know exactly what you're looking at. Filter by move-in date, rent, gender preference, diet (veg/non-veg matters), and room type.

Later I want to add move-out sales and a roommate finder but that's after the core is solid.

## Stack

Next.js 16, React 19, TypeScript, Tailwind v4, Supabase, shadcn/ui, Vercel.

## Running locally

```bash
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

## Inspired by

[Budget SF](https://budgetsf.vercel.app) -- city guide done right, I wanted that same energy for student housing.
