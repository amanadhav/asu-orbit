# ASU Orbit

[Live](https://asu-orbit.vercel.app)

ASU Orbit is an apartment directory and sublease board built for students at Arizona State University. Find apartments with **real resident photos** and **honest management reviews**, or post and browse **subleases** filtered by gender, diet, dates, rent, and room type.

---

## Architecture

```
User ──────────────► Next.js 16 (Vercel)
                     shadcn/ui · Tailwind v4 · TS
                     Directory · Subleases · Guides
                            │
                     Supabase (Postgres + Storage)
                     /apartments · /subleases · /images
```

---

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

## Status

Pre-launch. Scaffolding complete; database and seed data not wired yet.
