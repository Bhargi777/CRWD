# Setup — getting every key in `.env.example`

Copy `.env.example` to `.env.local` first, then fill in each var below.

```bash
cp .env.example .env.local
```

---

## `DATABASE_URL`

Supabase Postgres connection string, used by Prisma.

1. [supabase.com/dashboard](https://supabase.com/dashboard) → your project (`CRWD`,
   ref `tsjzlvlrwbirpuioybtu`, already created) → **Project Settings → Database**.
2. Click **Reset database password** (Supabase never shows the original password again
   after project creation, even via CLI — this is the only way to get one).
3. Copy the **Connection pooling** string (port `6543`, transaction mode) and paste in
   the password:

```
postgresql://postgres.tsjzlvlrwbirpuioybtu:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

After it's set:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run db:enable-search
```

---

## `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Already populated in `.env.local` (pulled via `clerk env pull` from the linked Clerk app
`CRWD`). Nothing to do. If you ever need to re-pull:

```bash
clerk env pull
```

Dashboard equivalent: [dashboard.clerk.com](https://dashboard.clerk.com) → your app →
**API Keys**.

## `CLERK_WEBHOOK_SECRET`

[dashboard.clerk.com](https://dashboard.clerk.com) → your app → **Webhooks → Add
Endpoint** → URL `https://<your-domain>/api/webhooks/clerk` → copy the **Signing Secret**
(`whsec_...`).

To test locally before you have a domain:

```bash
clerk webhooks listen --token "$(clerk webhooks token)" --forward-to http://localhost:3000/api/webhooks/clerk
```

---

## `STRIPE_SECRET_KEY`

[dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → copy the
**Secret key** (use the test-mode key while developing, starts `sk_test_`).

## `STRIPE_WEBHOOK_SECRET`

- Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints
  a `whsec_...`.
- Production: [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) →
  **Add endpoint** → URL `/api/webhooks/stripe` → copy the signing secret.

---

## `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`

[dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys) → **Generate
Key** (use test mode while developing).

## `RAZORPAY_WEBHOOK_SECRET`

[dashboard.razorpay.com](https://dashboard.razorpay.com) → **Settings → Webhooks → Add
New Webhook** → URL `/api/webhooks/razorpay` → set any secret value there and use the
same value here.

---

## `RESEND_API_KEY`

[resend.com/api-keys](https://resend.com/api-keys) → **Create API Key**. Verify a sending
domain under **Domains** before sending real email.

---

## `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

[console.upstash.com](https://console.upstash.com) → **Create Database** (Redis) → open
it → **REST API** panel → copy both values directly.

---

## `PINECONE_API_KEY`

[app.pinecone.io](https://app.pinecone.io) → **API Keys** → copy the default key.

## `PINECONE_INDEX`

Name of the index you create in the Pinecone console (**Create Index**). Dimension must
match whatever embedding model `lib/pinecone.ts` uses.

---

## `GCS_BUCKET`

Google Cloud Console → **Cloud Storage → Buckets → Create**, or:

```bash
gcloud storage buckets create gs://<bucket-name>
```

## `GCS_SERVICE_ACCOUNT_JSON`

GCP Console → **IAM & Admin → Service Accounts** → create one with **Storage Object
Admin** on that bucket → **Keys → Add Key → JSON** → paste the entire downloaded JSON as
a single-line value. Or:

```bash
gcloud iam service-accounts keys create key.json --iam-account=<sa-email>
```

---

## `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`

[app.posthog.com](https://app.posthog.com) → create a project → **Project Settings →
API Keys** → copy the **Project API Key**. Host is `https://us.i.posthog.com` (or
`https://eu.i.posthog.com` if your project is in the EU region).

---

## `SENTRY_DSN`

[sentry.io](https://sentry.io) → create a project → **Settings → Projects → [project] →
Client Keys (DSN)** → copy the DSN.

---

## `CRON_SECRET`

Not from a third party — generate one yourself, then set the same value in Vercel's cron
config (so `app/api/cron/*` routes can verify the caller):

```bash
openssl rand -hex 32
```
