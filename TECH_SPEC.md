# Technical Specification

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma ORM
- Supabase PostgreSQL
- Clerk (auth)
- Stripe & Razorpay (payments)
- Resend (email)
- Vercel (hosting)
- Cloudflare (CDN/DNS/WAF)
- PostHog (product analytics)
- Sentry (error tracking)
- Upstash Redis (cache, rate limiting)
- Pinecone (vector search)
- Google Cloud Storage (asset storage)

## Architecture

- **Rendering**: React Server Components by default; client components only for
  interactive UI (checkout form, filters, dashboards w/ live updates).
- **Data mutations**: Next.js Server Actions for internal forms (listing create/edit,
  reviews, wishlist toggle); dedicated **route handlers** (`/app/api/*`) for external
  webhooks (Stripe, Razorpay) and any endpoint needing raw request body/signature
  verification.
- **Webhook endpoints**:
  - `POST /api/webhooks/stripe` — verifies `Stripe-Signature`, updates `payments`,
    `memberships`.
  - `POST /api/webhooks/razorpay` — verifies `X-Razorpay-Signature`, same downstream
    effect.
  - Both idempotent on `(provider, provider_payment_id)` unique constraint (see
    SCHEMA.md) to survive webhook retries.
- **Auth**: Clerk middleware (`middleware.ts`) protects `/dashboard`, `/sell/*`,
  `/admin/*` route groups; role claim (`BUYER`/`SELLER`/`ADMIN`) read from Clerk
  session/publicMetadata, cross-checked against `users.role`.

## Integration responsibilities

| Service | Owns |
|---|---|
| Clerk | Identity, session, login UI, role metadata |
| Stripe | Global card payments, subscriptions (recurring memberships) |
| Razorpay | India/UPI payments |
| Resend | Transactional email (invite delivery, receipts, seller notifications) |
| Supabase Postgres | System of record (via Prisma) |
| Upstash Redis | Rate limiting (checkout, search), short-lived cache (listing pages) |
| Pinecone | Semantic search embeddings over community title/description/tags |
| Google Cloud Storage | Cover images, seller assets (signed upload URLs, public read) |
| PostHog | Funnel/conversion analytics, feature flags |
| Sentry | Error + performance monitoring (server + client) |
| Vercel | App hosting, edge functions, deploy previews |
| Cloudflare | DNS, CDN, DDoS/WAF in front of Vercel |

## Search

Hybrid: Postgres full-text/trigram for exact/keyword match + category/tag filters;
Pinecone vector search for semantic query matching over listing embeddings. Search API
merges/reranks both result sets.

## Caching & rate limiting

Upstash Redis: sliding-window rate limit on checkout attempts and search endpoint per
IP/user; short-TTL cache (60–300s) for public listing/browse pages to reduce DB load.

## File upload

Client requests signed upload URL from a server action → uploads directly to GCS →
server action persists resulting public URL to `communities.cover_image_url`. No file
proxied through the app server.

## Observability

PostHog: pageview + event tracking (browse, search, checkout start/complete, listing
publish) for funnel metrics in PRD.md. Sentry: server + client error capture, release
tracking tied to Vercel deploys.

## Env var inventory

```
DATABASE_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
PINECONE_API_KEY=
PINECONE_INDEX=
GCS_BUCKET=
GCS_SERVICE_ACCOUNT_JSON=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
CRON_SECRET=
```

## Deploy topology

Cloudflare (DNS/CDN/WAF) → Vercel (Next.js app, edge + serverless functions) → Supabase
Postgres (primary DB), Upstash (Redis), Pinecone (vector DB), GCS (object storage) as
managed external services. Webhooks (Stripe/Razorpay) hit Vercel route handlers directly
(bypass edge cache).
