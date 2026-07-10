# CRWD

A marketplace for paid communities. Sellers list communities (Discord, Slack, Telegram,
or anything else); buyers discover, pay, and get an invite. CRWD is the discovery,
payment, and membership layer in front of communities that already live elsewhere — see
[PRD.md](PRD.md) for the full product scope.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma ORM over Supabase PostgreSQL
- Clerk (auth) · Stripe + Razorpay (payments) · Resend (email)
- Upstash Redis (rate limiting) · Pinecone (semantic search) · Google Cloud Storage (assets)
- PostHog (analytics) · Sentry (errors)
- Deploy: Vercel behind Cloudflare

Full rationale and architecture in [TECH_SPEC.md](TECH_SPEC.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys you have
npm run dev
```

`npm run dev` works with zero third-party keys configured — every integration
(`lib/stripe.ts`, `lib/clerk`, `lib/gcs.ts`, etc.) throws a clear error only when actually
called, not at startup. `npm run build` does need at least a placeholder
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set, since the landing page is prerendered through
`ClerkProvider`.

### Database

```bash
npx prisma migrate dev --name init   # once DATABASE_URL points at a real Postgres
npm run db:seed                      # categories + tags
npm run db:enable-search             # pg_trgm extension + trigram indexes
```

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest — pure-logic unit tests, no DB required |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run/create a migration |
| `npm run db:seed` | Seed categories/tags |
| `npm run db:enable-search` | Enable Postgres trigram search |

## Project structure

```
app/                Next.js App Router routes (pages, layouts, API/webhook routes)
components/ui/       Shared design-system components (Button, Card, Badge, state patterns)
lib/                 Business logic, integrations, server actions (lib/actions/)
prisma/              schema.prisma, seed script, search-enable script
```

## Docs

| File | Covers |
|---|---|
| [PRD.md](PRD.md) | Problem, personas, features, success metrics |
| [TECH_SPEC.md](TECH_SPEC.md) | Architecture, integrations, env vars, deploy topology |
| [SCHEMA.md](SCHEMA.md) | Full data model |
| [WEBSITE_FLOW.md](WEBSITE_FLOW.md) | Route map, buyer/seller/admin flows, edge cases |
| [DESIGN.md](DESIGN.md) | Design tokens, components, accessibility |
| [RULES.md](RULES.md) | Engineering conventions |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) / [TRACKER.md](TRACKER.md) | Build phases and status |
| [CLAUDE.md](CLAUDE.md) | Guidance for AI coding agents working in this repo |

## Status

All 11 build phases (setup through deployment config) are implemented and pass
typecheck/lint/build. What's outstanding is live infrastructure — a provisioned database
and the third-party credentials in `.env.example` — not code. See
[TRACKER.md](TRACKER.md) for the current checklist.
