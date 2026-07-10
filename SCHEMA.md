# Schema

Prisma-oriented model over Supabase PostgreSQL. `users.id` mirrors Clerk `user_id`
(external identity — Clerk is source of truth for auth, this table holds app-level
profile/state).

## Enums

- `UserRole`: `BUYER`, `SELLER`, `ADMIN`
- `CommunityStatus`: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `SUSPENDED`
- `MembershipStatus`: `ACTIVE`, `EXPIRED`, `CANCELLED`, `REFUNDED`
- `PaymentProvider`: `STRIPE`, `RAZORPAY`
- `PaymentStatus`: `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED`

## users

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | matches Clerk `user_id` |
| email | text unique | |
| name | text | |
| avatar_url | text | nullable |
| role | UserRole | default `BUYER` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Relations: 1—1 `sellers` (optional), 1—N `memberships`, 1—N `payments`, 1—N `reviews`,
1—N `wishlists`.

## sellers

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | unique |
| display_name | text | |
| bio | text | nullable |
| verified | boolean | default false, set by admin |
| payout_details | jsonb | provider-specific payout info |
| created_at | timestamptz | |

Relations: 1—N `communities`.

## communities

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| seller_id | uuid FK → sellers.id | |
| category_id | uuid FK → categories.id | |
| title | text | |
| slug | text unique | |
| description | text | |
| cover_image_url | text | GCS asset |
| price_cents | int | |
| currency | text | ISO 4217 |
| billing_interval | text | `one_time` \| `monthly` \| `yearly` |
| platform | text | `discord` \| `slack` \| `telegram` \| `other` |
| invite_config | jsonb | API creds/link template for invite generation |
| member_count | int | denormalized, updated on membership change |
| status | CommunityStatus | default `DRAFT` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes: `slug` unique, `(status, category_id)` composite for browse queries.
Relations: N—N `tags` via `community_tags`, 1—N `memberships`, 1—N `reviews`, 1—N
`wishlists`.

## categories

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text unique | |
| slug | text unique | |

## tags

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text unique | |

## community_tags (join)

| Column | Type | Notes |
|---|---|---|
| community_id | uuid FK → communities.id | |
| tag_id | uuid FK → tags.id | |

PK: composite `(community_id, tag_id)`.

## memberships

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| community_id | uuid FK → communities.id | |
| payment_id | uuid FK → payments.id | nullable until payment confirmed |
| status | MembershipStatus | default `ACTIVE` |
| invite_url | text | nullable, generated post-payment |
| starts_at | timestamptz | |
| expires_at | timestamptz | nullable (null = lifetime for one_time) |
| created_at | timestamptz | |

Indexes: unique `(user_id, community_id)` where status = ACTIVE (partial), index on
`expires_at` for renewal jobs.

## payments

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| community_id | uuid FK → communities.id | |
| provider | PaymentProvider | |
| provider_payment_id | text | Stripe/Razorpay charge or order id |
| amount_cents | int | |
| currency | text | |
| status | PaymentStatus | default `PENDING` |
| webhook_verified | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes: unique `(provider, provider_payment_id)`.

## reviews

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| community_id | uuid FK → communities.id | |
| rating | int | 1–5 |
| body | text | nullable |
| created_at | timestamptz | |

Constraint: reviewer must have (had) a membership on this community; unique
`(user_id, community_id)`.

## wishlists

| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK → users.id | |
| community_id | uuid FK → communities.id | |
| created_at | timestamptz | |

PK: composite `(user_id, community_id)`.

## ER summary

```
users 1—1 sellers 1—N communities N—N tags (via community_tags)
communities N—1 categories
users 1—N memberships N—1 communities
users 1—N payments N—1 communities
memberships N—1 payments (0..1)
users 1—N reviews N—1 communities
users 1—N wishlists N—1 communities
```
