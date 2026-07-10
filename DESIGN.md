# Design System

## Design Principles

- Minimal
- Clean
- Spacious
- Consistent
- Accessible
- Content-first

The interface should feel modern with subtle depth, generous whitespace, rounded corners, and restrained use of color.

---

# Themes

## Light

Background: #FFFFFF
Surface: #F8FAFC
Card: #FFFFFF
Text Primary: #0F172A
Text Secondary: #64748B
Border: #E2E8F0
Primary: #2563EB
Success: #16A34A
Warning: #F59E0B
Danger: #DC2626

## Dark

Background: #020617
Surface: #0F172A
Card: #111827
Text Primary: #F8FAFC
Text Secondary: #94A3B8
Border: #1E293B
Primary: #3B82F6
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444

## Token mapping (shadcn/ui)

| shadcn var | Light | Dark |
|---|---|---|
| `--background` | Background | Background |
| `--foreground` | Text Primary | Text Primary |
| `--card` | Card | Card |
| `--card-foreground` | Text Primary | Text Primary |
| `--muted` | Surface | Surface |
| `--muted-foreground` | Text Secondary | Text Secondary |
| `--border` / `--input` | Border | Border |
| `--primary` | Primary | Primary |
| `--destructive` | Danger | Danger |
| `--ring` | Primary | Primary |

Success/Warning map to custom `--success` / `--warning` extension tokens (not in default
shadcn set) for status badges (membership active, payment failed, etc).

---

# Typography

Font: Inter

## Type scale

| Token | Size / Line height | Weight | Use |
|---|---|---|---|
| display | 36px / 44px | Semibold | Hero/landing |
| h1 | 28px / 36px | Semibold | Page title |
| h2 | 22px / 30px | Semibold | Section header |
| h3 | 18px / 26px | Semibold | Card title |
| body | 16px / 24px | Regular | Default text |
| body-sm | 14px / 20px | Regular | Secondary text, captions |
| label | 13px / 18px | Medium | Form labels, badges |

Heading: Semibold, tight letter-spacing.
Body: Regular, comfortable line height.

---

# Spacing

8px grid: `4, 8, 12, 16, 24, 32, 48, 64` px steps. Component padding in multiples of 8;
4px reserved for icon/text micro-gaps only.

---

# Components

- Rounded corners: 12px (cards, buttons, inputs), 8px (badges, chips)
- Soft shadows only (`shadow-sm`/`shadow-md`, no hard drop shadows)
- Thin borders (1px, Border token)
- Large touch targets (min 44px height on interactive elements)
- Consistent spacing (8px grid)

## Component specs

**Button** — variants: `primary` (filled, Primary bg), `secondary` (outline, Border),
`ghost` (no border/bg), `destructive` (Danger bg). Sizes: sm (36px), md (44px), lg (52px).

**Card** — Card bg, 1px Border, 12px radius, shadow-sm, 16–24px padding. Used for
community listing tiles, dashboard stat cards.

**Input** — Card bg, 1px Border, 12px radius, 44px height, focus ring = Primary.

**Badge** — 8px radius, label type scale, status colors (Success/Warning/Danger/Primary
tints) for membership/payment/listing status.

**Modal** — Card bg, 12px radius, shadow-md, backdrop blur, max-width 480px on desktop,
full-screen sheet on mobile.

**Toast** — bottom-right (desktop) / bottom (mobile), Card bg, auto-dismiss 4s, status
color left border.

**Nav** — sticky top bar, Border bottom, logo + search + auth state; mobile = bottom tab
bar or hamburger drawer.

## State patterns

Every page/view implements: **loading** (skeleton matching layout, not spinner-only),
**empty** (icon + message + primary action), **error** (message + retry action). No bare
blank screens.

---

# Responsive breakpoints

| Name | Width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

Mobile-first: base styles target sm; scale up via `md:`/`lg:` Tailwind variants.

---

# Accessibility

- Text contrast ≥ 4.5:1 (body), ≥ 3:1 (large text) against background in both themes.
- Visible focus ring (Primary, 2px offset) on all interactive elements — never
  `outline: none` without replacement.
- Touch targets ≥ 44×44px.
- All images require alt text; icon-only buttons require `aria-label`.

---

# UX Rules

- Mobile-first
- Maximum two primary actions per screen
- Clear visual hierarchy
- Fast page transitions
- Loading, empty and error states on every page
