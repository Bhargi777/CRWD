# Implementation Plan

Phased build order. Each phase lists deliverables and its dependency on prior phases,
SCHEMA.md tables, and WEBSITE_FLOW.md routes/flows.

## 1. Project setup

- Scaffold Next.js 15 (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- Prisma init against Supabase Postgres; connect env vars (TECH_SPEC.md inventory).
- Base layout, theme provider (light/dark tokens from DESIGN.md), Sentry + PostHog init.
- No dependencies — first phase.

## 2. Authentication

- Integrate Clerk; `middleware.ts` route protection per WEBSITE_FLOW.md access table.
- `users` table sync (Clerk webhook → upsert `users` row, default `role = BUYER`).
- Seller onboarding flow creates `sellers` row, sets `role = SELLER`.
- Depends on: Setup. Schema: `users`, `sellers`.

## 3. Marketplace (browse + listing pages)

- `categories`, `tags`, `community_tags` seed/management.
- `/browse`, `/c/[slug]` pages (RSC, public).
- Community CRUD (server actions) — create/edit constrained to `PUBLISHED`/`DRAFT` state
  machine (SCHEMA.md `CommunityStatus`).
- Depends on: Auth (seller-owned listings). Schema: `communities`, `categories`, `tags`,
  `community_tags`.

## 4. Search

- Postgres full-text/trigram index on `communities.title`/`description`.
- Pinecone embedding pipeline for semantic search; `/search` route merging both.
- Depends on: Marketplace (needs listing data to index).

## 5. Seller dashboard

- `/sell`, `/sell/listings/new`, `/sell/listings/[id]/edit`, `/sell/orders`,
  `/sell/analytics`.
- GCS signed-upload flow for cover images.
- Depends on: Marketplace. Schema: `communities`, `sellers`.

## 6. Payments

- Stripe + Razorpay checkout integration, `/c/[slug]/checkout`.
- Webhook route handlers (`/api/webhooks/stripe`, `/api/webhooks/razorpay`) — signature
  verification, idempotent write to `payments`.
- Depends on: Marketplace, Auth. Schema: `payments`.

## 7. Memberships

- On payment success: create `memberships` row, trigger invite generation
  (`lib/invite/`), Resend email delivery.
- `/dashboard` — buyer membership list, invite re-access, wishlist.
- Renewal/expiry background job (`memberships.status` transitions).
- Depends on: Payments. Schema: `memberships`, `wishlists`.

## 8. Reviews

- Review submission gated on membership existence (SCHEMA.md constraint).
- Display on `/c/[slug]`.
- Depends on: Memberships. Schema: `reviews`.

## 9. Admin

- `/admin`, `/admin/sellers`, `/admin/reports` — moderation queue, seller verification,
  dispute/refund handling.
- Depends on: Marketplace, Payments, Reviews (moderates all of the above). Schema:
  `communities.status`, `sellers.verified`, `payments`.

## 10. Testing

- Unit tests for `lib/` business logic (payment state transitions, invite generation,
  search ranking).
- Integration tests for webhook idempotency and auth-gated routes.
- E2E for core buyer flow (browse → checkout → membership) and seller flow (create →
  publish → order).

## 11. Deployment

- Vercel project + Cloudflare DNS/CDN in front.
- Env vars provisioned per TECH_SPEC.md inventory across preview/prod.
- Sentry release tracking + PostHog production config verified.
