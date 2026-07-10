# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

CRWD is a marketplace for paid communities: sellers list communities, buyers pay for
memberships. All 11 IMPLEMENTATION.md phases (setup through deployment config) are built
and pass typecheck/lint/build. What's missing is **live infrastructure** — no
`DATABASE_URL` and none of the third-party credentials in `.env.example` are provisioned,
so nothing has run against a real database or been deployed. Every integration
(`lib/stripe.ts`, `lib/razorpay.ts`, `lib/resend.ts`, `lib/redis.ts`, `lib/pinecone.ts`,
`lib/gcs.ts`) throws a clear "missing env var" error at call time rather than at import, so
the app builds and pages render even with zero keys configured — that pattern should be
followed for any new integration.

Before a real deploy: provision `DATABASE_URL`, run `npx prisma migrate dev --name init`,
then `npm run db:seed` and `npm run db:enable-search`; set every var in `.env.example` in
Vercel; point Cloudflare DNS at the Vercel deployment.

## Commands

- `npm run dev` — local dev server
- `npm run build` / `npm run lint` — must both pass clean before committing
- `npm test` — Vitest, runs `lib/__tests__/*` (pure logic only, no DB required)
- `npm run prisma:generate` / `npm run prisma:migrate` — Prisma client / migrations
- `npm run db:seed` — seeds categories/tags (`prisma/seed.ts`)
- `npm run db:enable-search` — enables `pg_trgm` + trigram indexes (`prisma/enable-search.ts`);
  run once against a live DB after the initial migration, not modeled in schema.prisma
  since Prisma doesn't represent extensions or non-btree index types

`npm run build` prerenders `/`, which needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set (even a
placeholder) or the build fails — see `ClerkProvider` in `app/layout.tsx`.

## Stack (TECH_SPEC.md)

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma ORM over Supabase PostgreSQL
- Clerk (auth), Stripe + Razorpay (payments), Resend (email)
- Upstash Redis (cache/rate-limit), Pinecone (vector search)
- Google Cloud Storage (assets)
- PostHog (analytics), Sentry (errors)
- Deploy: Vercel behind Cloudflare

## Engineering rules (RULES.md — enforce on all code)

- TypeScript everywhere; no duplicated logic; keep components reusable.
- Prefer React Server Components where appropriate.
- Validate every request; never trust client input; protect authenticated routes.
- Verify payment webhooks (Stripe + Razorpay) before acting on them.
- Mobile-first responsive UI; every feature must serve the core marketplace experience.

## Data model (SCHEMA.md)

Core tables: `users`, `sellers`, `communities`, `categories`, `tags`, `community_tags`
(join), `memberships`, `payments`, `reviews`, `wishlists` — modeled in
`prisma/schema.prisma`. There is no dedicated reports/disputes table; `/admin/reports`
(`app/admin/reports/page.tsx`) is scoped to what the schema actually supports (refunds,
listing suspension) rather than a fabricated table — extend SCHEMA.md first if that needs
to grow into real report records.

## Core flows (WEBSITE_FLOW.md) → routes

- Buyer: `/` → `/browse` or `/search` → `/c/[slug]` → (Clerk sign-in) → `/c/[slug]/checkout`
  → webhook confirms payment → `/dashboard` (membership + invite link)
- Seller: `/sell` (onboarding if no seller row yet) → `/sell/listings/new` → submit for
  review → `/sell/orders`, `/sell/analytics`
- Admin: `/admin` (moderation) → `/admin/sellers` (verification) → `/admin/reports`
  (refunds)

`middleware.ts` gates `/dashboard`, `/sell/*` (except bare `/sell`, the onboarding entry
point), `/admin/*`, and `/c/*/checkout` by Clerk session + role in `publicMetadata`.

## Payment → membership pipeline

Checkout (`lib/actions/checkout.ts`) creates a `PENDING` payment row keyed by the
provider's session/order id. The corresponding webhook
(`app/api/webhooks/stripe|razorpay/route.ts`) verifies the signature, flips the payment to
`SUCCEEDED`, **swaps `provider_payment_id` to the actual refundable id** (Stripe
PaymentIntent / Razorpay payment id — session/order ids aren't refundable), then calls
`activateMembership()` (`lib/memberships.ts`), which is idempotent on `payment.id` so
webhook retries are safe. Admin refunds (`lib/actions/admin.ts`) depend on that id swap
having happened.

## Design system (DESIGN.md)

Minimal, spacious, content-first. Inter font, 8px spacing grid, 12px rounded corners,
soft shadows, thin borders. Light + dark themes via CSS vars in `app/globals.css`, mapped
to Tailwind v4's `@theme inline`. Shared components in `components/ui/` (`Button`, `Card`,
`Badge`, `LoadingState`/`EmptyState`/`ErrorState`) — reuse these rather than one-off
styling; every route has `loading.tsx`/`error.tsx` or an equivalent empty state.

## Build order (IMPLEMENTATION.md / TRACKER.md)

All 11 phases (Setup → Auth → Marketplace → Search → Seller dashboard → Payments →
Memberships → Reviews → Admin → Testing → Deployment config) are complete. See
`TRACKER.md` for what's still blocked on live infrastructure (DB migration, integration/
E2E tests, actual deploy).
