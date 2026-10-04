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

## Environment variables

Every var in `.env.example`, where it comes from, and how to get it. Two services
(Supabase, Clerk) have CLIs that can provision/pull credentials directly instead of
copy-pasting from a dashboard — installs below.

```bash
npm install -g supabase clerk   # or: brew install supabase/tap/supabase clerk/stable/clerk
supabase login
clerk auth login
```

### Database

`DATABASE_URL` — Supabase Postgres connection string, used by Prisma.

```bash
supabase projects list                              # find or create a project
supabase link --project-ref <ref>                   # links supabase/config.toml to it
```

The Postgres password is set once at project creation and Supabase never exposes it
again afterward — not even via CLI (by design, for security). Get/set it from the
dashboard: **Project Settings → Database → Reset database password**, then build the
pooled connection string (port `6543`, `pgbouncer=true`) Prisma needs:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Then:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run db:enable-search
```

### Auth — Clerk

`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — dev keys pull automatically once
the project is linked:

```bash
clerk init          # links + scaffolds; already done in this repo
clerk env pull       # writes dev keys straight to .env.local, never printed to a terminal
```

For production keys, `clerk deploy` is interactive (it needs a live domain to verify DNS
records), so it can't run unattended — run it yourself once the app is deployed to Vercel
and Cloudflare DNS is pointed at it, then pull the prod keys:

```bash
clerk deploy               # interactive: configures production instance + domain
clerk deploy status        # confirms it completed
clerk env pull --instance prod --file .env.production.local
```

`CLERK_WEBHOOK_SECRET` — created when you add the webhook endpoint in the Clerk dashboard
(**Webhooks → Add Endpoint**, pointed at `/api/webhooks/clerk`). To test locally first:

```bash
clerk webhooks listen --token "$(clerk webhooks token)" --forward-to http://localhost:3000/api/webhooks/clerk
```

### Payments

`STRIPE_SECRET_KEY` — [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys),
use the test key while developing.

`STRIPE_WEBHOOK_SECRET` — `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
(Stripe CLI) prints a `whsec_...` for local testing; in production it's generated when you
add the endpoint under **Developers → Webhooks**.

`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` —
[dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys).

`RAZORPAY_WEBHOOK_SECRET` — set when you add the webhook under **Settings → Webhooks**,
pointed at `/api/webhooks/razorpay`; the secret is whatever value you enter there.

### Email

`RESEND_API_KEY` — [resend.com/api-keys](https://resend.com/api-keys). Verify a sending
domain under **Domains** before going to production.

### Cache / rate limiting

`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — create a Redis database at
[console.upstash.com](https://console.upstash.com), then copy both from the database's
**REST API** panel.

### Search

`PINECONE_API_KEY` — [app.pinecone.io](https://app.pinecone.io) → **API Keys**.

`PINECONE_INDEX` — the index name you create in the Pinecone console (dimension must match
the embedding model used in `lib/pinecone.ts`).

### Storage

`GCS_BUCKET` — a Cloud Storage bucket name, created via `gcloud storage buckets create
gs://<bucket>` or the GCP console.

`GCS_SERVICE_ACCOUNT_JSON` — a service account key with Storage Object Admin on that
bucket: **IAM & Admin → Service Accounts → Keys → Add Key (JSON)** in the GCP console, or
`gcloud iam service-accounts keys create key.json --iam-account=<sa-email>`. Paste the
whole JSON as a single-line env var value.

### Observability

`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — create a project at
[app.posthog.com](https://app.posthog.com) → **Project Settings → API Keys**. Host is
`https://us.i.posthog.com` (or `https://eu.i.posthog.com` for the EU region).

`SENTRY_DSN` — create a project at [sentry.io](https://sentry.io) → **Settings → Projects
→ [project] → Client Keys (DSN)**.

### Cron

`CRON_SECRET` — not from a third party; generate one yourself and set the same value in
Vercel's cron config so `app/api/cron/*` routes can verify the caller:

```bash
openssl rand -hex 32
```

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
