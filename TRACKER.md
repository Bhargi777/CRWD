# Development Tracker

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 1 — Project setup
- [x] Next.js 15 + TS + Tailwind v4 + shadcn/ui scaffold
- [~] Prisma + Supabase Postgres connected — schema modeled, no live DATABASE_URL yet
- [x] Base layout + theme (light/dark tokens)
- [ ] Sentry + PostHog init — packages installed, no DSN/keys wired yet

## Phase 2 — Authentication
- [x] Clerk integration + middleware route protection
- [x] `users` sync webhook
- [x] Seller onboarding (`sellers` row + role upgrade)

## Phase 3 — Marketplace
- [x] `categories` / `tags` / `community_tags` model + seed
- [x] `/browse` page
- [x] `/c/[slug]` listing page
- [x] Community CRUD (draft/publish state machine)

## Phase 4 — Search
- [x] Postgres full-text/trigram index
- [~] Pinecone embedding pipeline — wired, degrades to keyword-only until an embeddings provider is chosen
- [x] `/search` merged results

## Phase 5 — Seller dashboard
- [x] `/sell` home
- [x] `/sell/listings/new`, `/sell/listings/[id]/edit`
- [x] `/sell/orders`
- [x] `/sell/analytics`
- [x] GCS signed upload flow

## Phase 6 — Payments
- [x] Stripe checkout
- [x] Razorpay checkout
- [x] `/api/webhooks/stripe` (signature verify, idempotent)
- [x] `/api/webhooks/razorpay` (signature verify, idempotent)

## Phase 7 — Memberships
- [x] Membership creation on payment success
- [x] Invite generation (`lib/invite.ts`)
- [x] Resend email delivery
- [x] `/dashboard` (memberships, invite access, wishlist)
- [x] Renewal/expiry background job (`/api/cron/expire-memberships`)

## Phase 8 — Reviews
- [x] Review submission (membership-gated)
- [x] Review display on listing page

## Phase 9 — Admin
- [x] `/admin` moderation queue
- [x] `/admin/sellers` verification
- [x] `/admin/reports` disputes/refunds

## Phase 10 — Testing
- [x] Unit tests (`lib/` business logic — slugify, membership expiry math,
      Razorpay signature verification, invite generation edge cases)
- [ ] Integration tests (webhooks, auth) — needs a live DATABASE_URL to run
      against real Prisma queries; not runnable in this environment
- [ ] E2E buyer flow — needs a live DB + Playwright; not set up yet
- [ ] E2E seller flow — same blocker

## Phase 11 — Deployment
- [ ] Vercel + Cloudflare setup
- [ ] Env vars provisioned (preview + prod)
- [ ] Sentry/PostHog production verified
