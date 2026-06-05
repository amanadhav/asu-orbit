# ASU Orbit

[Live Demo](https://asu-orbit.vercel.app)

I kept seeing the same thing happen to people in my program - someone lands an internship or job offer and suddenly needs to sublease their apartment by next month. They post in three different WhatsApp groups, maybe Facebook Marketplace, maybe a Reddit thread, and half the time they get scammed or just never find anyone. Facebook Marketplace especially has gotten bad for this, fake profiles, ghost listings, people asking for deposits over Venmo with no lease verification.

The other side of the problem: incoming students have no reliable way to figure out which complexes near ASU are actually worth living in. Leasing office websites all look the same and say nothing real. The honest reviews are scattered across Reddit posts from 2021.

ASU Orbit is my attempt to fix both. It's a housing platform built specifically for ASU students - an apartment directory with real resident info and a sublease board where listings are tied to verified apartments, not random text posts.

## How it works

**Apartment directory**
Each complex near ASU gets its own page - photos submitted by actual residents, honest reviews, rent ranges, whether subleasing is allowed, and proximity to campus. The goal is enough signal to decide if a place is worth touring before you ever call the leasing office.

**Sublease board**
Listings are tied to apartments already in the directory, so you know exactly what building you're looking at. Filter by move-in date, rent, gender preference, diet (veg/non-veg is a real filter here, it matters), and room type. Each listing has a contact method and an admin review step before it goes live.

**Marketplace and move-out sales**
Students leaving can post furniture, appliances, whatever they're selling before they move out. Same idea - tied to a real location, not a random Craigslist post.

**Submit flows**
Anyone can submit a sublease, a move-out sale, a photo of their complex, or a review. Everything goes through a moderation queue before it's visible.

## Architecture

```
                    ┌──────────────────────────────────┐
                    │       Next.js 16 (Vercel)         │
User ─────────────▶ │  shadcn/ui · Tailwind v4 · TS    │
                    │  Apartments · Subleases · Market  │
                    └───────────────┬──────────────────┘
                                    │  Supabase JS client
                                    ▼
                    ┌──────────────────────────────────┐
                    │        Supabase (Postgres)        │
                    │  /apartments · /subleases         │
                    │  /marketplace · /reviews          │
                    └───────┬──────────────┬───────────┘
                            │              │
               ┌────────────▼───┐   ┌──────▼────────────┐
               │  Supabase      │   │  Next.js           │
               │  Storage       │   │  API routes        │
               │  (photos)      │   │  (submit + admin)  │
               └────────────────┘   └───────────────────┘
```

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Radix UI |
| Backend | Next.js API routes, Supabase (Postgres + Storage) |
| Auth | Supabase Auth (magic link) |
| Forms | React Hook Form, Zod |
| Email | Resend |
| Deploy | Vercel |

## Running locally

Requires Node.js 18+.

```bash
# 1. Clone
git clone https://github.com/amanadhav/asu-orbit.git
cd asu-orbit

# 2. Install
npm install

# 3. Environment
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and service role key

# 4. Run
npm run dev
```

Open http://localhost:3000.

## Project structure

```
asu-orbit/
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   ├── components/          # reusable UI components
│   └── lib/                 # Supabase helpers, types, schemas, utils
├── supabase/
│   ├── migrations/          # database schema migrations
│   └── seed.sql             # initial apartment data
├── scripts/                 # one-off data scripts (photos, content, Reddit research)
├── public/                  # static assets
└── seed.js                  # apartment import helper
```

## Inspired by

[Budget SF](https://budgetsf.vercel.app) - clean city guide energy, different problem space.
