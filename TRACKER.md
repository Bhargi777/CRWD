# Development Tracker

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Phase 1 — Project setup
- [ ] Next.js 15 + TS + Tailwind v4 + shadcn/ui scaffold
- [ ] Prisma + Supabase Postgres connected
- [ ] Base layout + theme (light/dark tokens)
- [ ] Sentry + PostHog init

## Phase 2 — Authentication
- [ ] Clerk integration + middleware route protection
- [ ] `users` sync webhook
- [ ] Seller onboarding (`sellers` row + role upgrade)

## Phase 3 — Marketplace
- [ ] `categories` / `tags` / `community_tags` model + seed
- [ ] `/browse` page
- [ ] `/c/[slug]` listing page
- [ ] Community CRUD (draft/publish state machine)

## Phase 4 — Search
- [ ] Postgres full-text/trigram index
- [ ] Pinecone embedding pipeline
- [ ] `/search` merged results

## Phase 5 — Seller dashboard
- [ ] `/sell` home
- [ ] `/sell/listings/new`, `/sell/listings/[id]/edit`
- [ ] `/sell/orders`
- [ ] `/sell/analytics`
- [ ] GCS signed upload flow

## Phase 6 — Payments
- [ ] Stripe checkout
- [ ] Razorpay checkout
- [ ] `/api/webhooks/stripe` (signature verify, idempotent)
- [ ] `/api/webhooks/razorpay` (signature verify, idempotent)

## Phase 7 — Memberships
- [ ] Membership creation on payment success
- [ ] Invite generation (`lib/invite/`)
- [ ] Resend email delivery
- [ ] `/dashboard` (memberships, invite access, wishlist)
- [ ] Renewal/expiry background job

## Phase 8 — Reviews
- [ ] Review submission (membership-gated)
- [ ] Review display on listing page

## Phase 9 — Admin
- [ ] `/admin` moderation queue
- [ ] `/admin/sellers` verification
- [ ] `/admin/reports` disputes/refunds

## Phase 10 — Testing
- [ ] Unit tests (`lib/` business logic)
- [ ] Integration tests (webhooks, auth)
- [ ] E2E buyer flow
- [ ] E2E seller flow

## Phase 11 — Deployment
- [ ] Vercel + Cloudflare setup
- [ ] Env vars provisioned (preview + prod)
- [ ] Sentry/PostHog production verified
