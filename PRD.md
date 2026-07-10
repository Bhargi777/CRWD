# Product Requirements Document

## Problem

Paid online communities (Discord, Slack, Circle, Telegram groups) have no unified
discovery or payment layer. Creators cobble together Gumroad/Stripe links, manual invite
distribution, and spreadsheets to track members. Buyers have no central place to browse,
compare, or trust community quality before paying.

## Target customers

**Buyer** — wants to discover communities by topic/category, evaluate via reviews and
seller reputation, pay once, get automatic invite access.

**Seller** — creator/expert running a paid community elsewhere (Discord/Slack/etc.), wants
a storefront to list it, collect payments (global — cards + UPI/local rails), manage
members, and see analytics without building infrastructure.

**Admin** — CRWD staff moderating listings, verifying sellers, handling disputes/reports.

## Value proposition

CRWD is the discovery + payment + membership-management layer for paid communities.
Sellers keep hosting their community wherever it already lives; CRWD handles listing,
checkout, invite delivery, renewal, and reviews.

## Core features

1. **Browse & search** — category/tag filtering, keyword + semantic search (Pinecone),
   sorting (popularity, price, rating, newest).
2. **Community listing page** — description, pricing, seller profile, reviews, member
   count, tags.
3. **Checkout** — guest browse, login-gated payment, Stripe (global) + Razorpay (India),
   one-time or recurring membership pricing.
4. **Membership & invite** — on successful payment, auto-generate/deliver invite link to
   the external community platform; track membership status (active/expired/cancelled).
5. **Seller dashboard** — create/edit/publish listings, view orders, revenue analytics,
   member list.
6. **Reviews** — buyers with active/past membership can rate + review a community.
7. **Wishlists** — buyers save communities for later.
8. **Admin panel** — moderate new listings, verify sellers, handle reported
   content/disputes.

## Success metrics

- GMV (gross merchandise value) processed per month
- Platform take-rate revenue
- Buyer conversion rate (listing view → payment)
- Seller activation rate (signed up → first published listing)
- Membership renewal / churn rate
- Median time-to-first-sale for new sellers

## Non-goals

- CRWD does **not** host communities — no chat, no channels, no bespoke community
  infrastructure. The community itself lives on Discord/Slack/Telegram/etc.; CRWD is the
  discovery + payment + membership layer in front of it.
- No creator content hosting (courses, videos) beyond what's needed to describe a listing.
- No native mobile apps in v1 — mobile-first responsive web only.

## Assumptions & risks

- Assumes sellers can generate/rotate invite links via their platform's API or manually.
- Payment webhook reliability (Stripe/Razorpay) is critical — membership activation must
  not depend on synchronous checkout redirect alone.
- Dual payment provider adds complexity; must keep webhook verification and payment state
  machine provider-agnostic (see SCHEMA.md, TECH_SPEC.md).
