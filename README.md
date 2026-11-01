# Humble Subscription Hub

A full-store frontend replica of `dopaminedropsbd.com`, rebranded as **Humble Subscription Hub**. Built with the real scraped catalog, images, pricing plans and variants.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- `lucide-react` icons

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## What's included

| Area | Routes |
| --- | --- |
| Home | `/` — categories, popular subscriptions, popular products, why choose us |
| Catalog | `/product`, `/subscriptions`, `/product/category/[slug]` |
| Product detail | `/product/[slug]` — gallery, variants, plans, tabs, reviews, related |
| Commerce | `/cart`, `/checkout` (order success screen) |
| Account | `/login`, `/register`, `/profile` (orders / wishlist / account tabs) |
| Community | `/aura-leaderboard` |
| Content | `/about`, `/story`, `/contact`, `/guide`, `/shipping`, `/refund-policy`, `/privacy`, `/terms` |
| Fallback | `not-found.tsx` |

## Demo behaviour

Everything is client-side — there is no backend, database or payment gateway.

| Feature | Storage key |
| --- | --- |
| Cart | `humble.cart.v1` |
| Wishlist | `humble.wishlist.v1` |
| Signed-in user | `humble.user.v1` |
| Orders | `humble.orders.v1` |

- **Login / register** accept any email and password; a display name is derived from the email (or the name you enter). Details never leave the browser.
- **Promo code:** `HUMBLE10` — 10% off, capped at ৳300.
- **Delivery:** free over ৳3,000; otherwise ৳60 inside Dhaka, ৳120 outside.
- **Payments:** bKash, Nagad or cash on delivery (no real charge).
- **Aura points:** 1 per ৳10 spent + 25 per order; signed-in users appear on the leaderboard.

## Catalog data

The real catalog is scraped into JSON and images are stored locally:

- `data/products.json` — 68 products (9 digital subscriptions, 59 physical products) with prices, compare prices, plans, variants, features and reviews.
- `data/categories.json` — 10 categories with counts and images.
- `public/uploads/` — 285 local product images.

Re-scrape from the source site at any time:

```bash
npm run scrape
```

> `scripts/scrape.mjs` reads cached rendered HTML from `C:/Users/GIGABYTE/AppData/Local/Temp/opencode` and downloads image assets. Update the `STORE` and `TEMP` constants if the source or cache location changes.

## QA scripts

Headless-Chrome checks driven over the DevTools protocol (requires the dev server running):

```bash
node scripts/qa.mjs        # overflow, broken images, console errors at 4 breakpoints
node scripts/qa-flow.mjs   # cart → wishlist → promo → checkout → login → logout → search
node scripts/qa-layout.mjs # responsive grid, carousel, drawer, detail, leaderboard checks
```

The QA scripts use a temporary profile directory and write `qa-results.json` in the project root.
Set `CHROME_PATH` when Chrome or Chromium is not installed in a standard location, `BASE` to test
another running server, or `QA_OUTPUT` to choose a different results file. Ports can be overridden
with `QA_QA_PORT`, `QA_FLOW_PORT`, and `QA_LAYOUT_PORT`.

## Structure

```
app/                    routes + global layout/styles
components/
  auth/                 shared auth shell and fields
  content/              shared long-form page layout
  home/                 home sections and carousel
  layout/               announcement bar, header, footer, mobile nav, WhatsApp
  product/              product card, catalog listing, product detail
  store/                localStorage store provider (cart, wishlist, user, orders)
  ui/                   logo, rating, section heading, empty state, social icons
data/                   scraped catalog JSON
lib/                    types, data helpers, site constants
public/uploads/         product images
scripts/                scraper and QA scripts
```

## Notes for future changes

- Design tokens live in `app/globals.css` (`--color-theme-primary`, `--color-navy`, …).
- Brand copy, contact details and navigation are in `lib/constants.ts`.
- Products are read at build time from `data/products.json` via `lib/data.ts`.
- Prices are server-rendered from JSON; cart and checkout totals are computed client-side.
