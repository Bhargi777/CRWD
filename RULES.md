# Engineering Rules

## Language & structure

- Use TypeScript everywhere; no `any` without justification comment.
- Avoid duplicated logic — shared logic lives in `lib/` (e.g. `lib/payments/`,
  `lib/invite/`, `lib/search/`), imported by both server actions and route handlers.
- Keep components reusable — presentational components accept props, no direct data
  fetching inside shared UI components (`components/ui/*` from shadcn stays pure).
- Prefer server components where appropriate; mark `"use client"` only when the component
  needs interactivity/state/browser APIs (forms, filters, live dashboard widgets).

## Validation & security

- Validate every request — zod schemas at every boundary: server action input, route
  handler body, form submission. Reject early, return typed errors.
- Never trust client input — re-validate price/ownership/permissions server-side even if
  UI already constrains it (e.g. seller can only edit own listings — check
  `communities.seller_id` against session user server-side, not just hide the edit button).
- Protect authenticated routes — Clerk middleware gates `/dashboard`, `/sell/*`,
  `/admin/*`; role check (`BUYER`/`SELLER`/`ADMIN`) enforced in addition to session
  presence, per route group in `middleware.ts`.
- Verify payment webhooks — Stripe (`Stripe-Signature` + `STRIPE_WEBHOOK_SECRET`) and
  Razorpay (`X-Razorpay-Signature` + `RAZORPAY_WEBHOOK_SECRET`) signatures checked before
  any DB write; unverified requests rejected 400, never processed.
- Webhook handlers idempotent on `(provider, provider_payment_id)` — safe under provider
  retry.

## UI

- Ship mobile-first responsive UI — base Tailwind classes target smallest breakpoint,
  scale up with `md:`/`lg:` variants (see DESIGN.md breakpoints).
- Every page implements loading, empty, and error states (see DESIGN.md state patterns) —
  no bare blank screens, no unhandled promise rejection surfacing raw errors to UI.

## Product alignment

- Every feature must support the core marketplace experience (discovery → payment →
  membership) — features outside PRD.md scope (e.g. in-app chat, content hosting) are
  out of bounds without a PRD update first.

## Conventions

- **Naming**: kebab-case files/folders, PascalCase components, camelCase
  functions/variables, SCREAMING_SNAKE_CASE env vars, snake_case DB columns (Prisma
  `@map`).
- **Folder structure**: `app/` (routes), `components/` (ui + feature components),
  `lib/` (business logic, integrations), `prisma/` (schema/migrations), `app/api/`
  (webhook + external-facing route handlers only — internal mutations use server
  actions).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.), one logical change
  per commit.
