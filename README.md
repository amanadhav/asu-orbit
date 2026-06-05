# ASU Orbit

Apartment directory + sublease board built for all students at Arizona State University.

## What this is

1. **Apartment directory** - real resident photos, honest management reviews, quick facts for every major complex near ASU.
2. **Sublease board** - structured listings tied to apartments in the directory, filterable by gender, diet, dates, rent, and room type.
3. **Add-ons** (later) - move-out sales, roommate requests, static guides for transit, food, and attractions.

## Tech

Next.js 16, React 19, TypeScript, Tailwind v4, Supabase (Postgres + Storage), MDX, shadcn/ui, Vercel.

## Local development

```bash
npm install
cp .env.example .env.local   # fill Supabase keys when ready
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Inspiration

[Budget SF](https://budgetsf.vercel.app) - same clean static-guide energy, different audience and scope.

## Live

[https://asu-orbit.vercel.app](https://asu-orbit.vercel.app)

## Status

Pre-launch. Scaffolding complete; database and seed data not wired yet.
