# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

CRWD is a marketplace for paid communities: sellers list communities, buyers pay for
memberships. As of this writing the repo contains **only planning docs** (`PRD.md`,
`DESIGN.md`, `TECH_SPEC.md`, `SCHEMA.md`, `RULES.md`, `IMPLEMENTATION.md`, `TRACKER.md`,
`WEBSITE_FLOW.md`) — no application code, no `package.json`, no tooling. The first
implementation task is scaffolding the Next.js app per the stack below. Until then there
are no build/lint/test commands.

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
(join), `memberships`, `payments`, `reviews`, `wishlists`. SCHEMA.md has full field-level
detail (types, FKs, enums, indexes) — use it directly when writing `prisma/schema.prisma`.

## Core flows (WEBSITE_FLOW.md)

- Buyer: Guest → Browse → Search → Community → Login → Checkout → Payment → Membership → Invite → Dashboard
- Seller: Login → Dashboard → Create Listing → Publish → Orders → Analytics
- Admin: Dashboard → Moderate → Verify → Reports

## Design system (DESIGN.md)

Minimal, spacious, content-first. Inter font, 8px spacing grid, 12px rounded corners,
soft shadows, thin borders. Light + dark themes with defined token palettes (see
DESIGN.md for exact hex). Max two primary actions per screen; loading/empty/error states
on every page.

## Build order (IMPLEMENTATION.md / TRACKER.md)

Setup → Auth → Marketplace → Search → Seller dashboard → Payments → Memberships →
Reviews → Admin → Testing → Deployment. Update `TRACKER.md` checkboxes as features land.
