# Website Flow

## Route map (Next.js App Router)

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Landing, featured communities |
| `/browse` | public | Category/tag filtered listing grid |
| `/search?q=` | public | Keyword + semantic search results |
| `/c/[slug]` | public | Community listing detail page |
| `/c/[slug]/checkout` | auth required | Payment flow |
| `/dashboard` | auth (buyer) | Memberships, wishlists, order history |
| `/sell` | auth (seller) | Seller dashboard home |
| `/sell/listings/new` | auth (seller) | Create listing |
| `/sell/listings/[id]/edit` | auth (seller), owner-only | Edit listing |
| `/sell/orders` | auth (seller) | Orders + member list |
| `/sell/analytics` | auth (seller) | Revenue/analytics |
| `/admin` | auth (admin) | Moderation queue |
| `/admin/sellers` | auth (admin) | Seller verification |
| `/admin/reports` | auth (admin) | Dispute/report handling |

Auth boundary enforced via Clerk middleware (see RULES.md); role check (`BUYER`/`SELLER`/
`ADMIN`) applied per route group in addition to session check.

## Buyer flow

1. **Guest** lands on `/` or `/browse` — no auth required.
2. **Browse** — filter by category/tag, sort by popularity/price/rating.
3. **Search** — keyword or semantic query (Pinecone) → ranked results.
4. **Community page** (`/c/[slug]`) — description, price, seller profile, reviews, member
   count.
5. **Login gate** — clicking "Join" while unauthenticated redirects to Clerk sign-in,
   returns to checkout with intent preserved (`redirect_url` param).
6. **Checkout** — select billing interval (if applicable), choose payment provider
   (Stripe for global cards, Razorpay for India/UPI), submit payment.
   - **Edge case: payment failure** — show inline error, allow retry, no membership row
     created until `PaymentStatus.SUCCEEDED`.
   - **Edge case: webhook delay** — checkout page polls/waits for webhook confirmation
     before showing success; timeout state offers "check status later" fallback.
7. **Payment success** — webhook (Stripe/Razorpay) marks `payments.status = SUCCEEDED`,
   creates `memberships` row (`ACTIVE`), triggers invite generation.
8. **Invite** — system generates/fetches invite link via `communities.invite_config`,
   stores on `memberships.invite_url`, emails via Resend + shows on dashboard.
   - **Edge case: invite generation failure** — membership stays `ACTIVE` w/ null
     `invite_url`; retry job + support fallback (manual seller notification).
   - **Edge case: invite link expiry** (Discord links expire) — regenerate on-demand from
     dashboard if `invite_url` stale.
9. **Dashboard** (`/dashboard`) — view active/expired memberships, re-access invite links,
   leave reviews, manage wishlist.
   - **Edge case: refund** — seller/admin-initiated refund sets `payments.status =
     REFUNDED`, cascades `memberships.status = REFUNDED`, revokes access messaging (CRWD
     cannot force-remove from external platform — informs seller to remove manually).
   - **Edge case: subscription expiry** (recurring billing) — background job flips
     `memberships.status = EXPIRED` when `expires_at` passes without renewal payment.

## Seller flow

1. **Login** via Clerk, role upgraded to `SELLER` on onboarding (seller profile created).
2. **Dashboard** (`/sell`) — summary stats (active members, revenue, pending payouts).
3. **Create listing** (`/sell/listings/new`) — title, description, category/tags, price,
   billing interval, platform (Discord/Slack/etc.), invite config, cover image (GCS
   upload).
   - Listing saved as `DRAFT`.
4. **Publish** — submit for review → `PENDING_REVIEW`; admin approves → `PUBLISHED`, or
   rejects → `REJECTED` w/ reason shown to seller.
   - **Edge case: edit after publish** — edits to a `PUBLISHED` listing don't unpublish;
     material changes (price, platform) may re-trigger `PENDING_REVIEW` per admin policy.
5. **Orders** (`/sell/orders`) — list of payments/memberships for seller's communities,
   member roster, manual invite resend action.
6. **Analytics** (`/sell/analytics`) — revenue over time, conversion funnel, churn, via
   PostHog-backed dashboard.

## Admin flow

1. **Dashboard** (`/admin`) — moderation queue of `PENDING_REVIEW` listings.
2. **Moderate** — approve/reject listings w/ reason; reject notifies seller.
3. **Verify** — review seller profiles/payout details, toggle `sellers.verified`.
4. **Reports** (`/admin/reports`) — user-reported listings/reviews, dispute resolution,
   manual refund trigger.
   - **Edge case: repeat offender** — admin can suspend a community (`SUSPENDED`) pulling
     it from browse/search without deleting historical payment/membership data.
