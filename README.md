# SOUQ.MR — السوق المحلي الأول في موريتانيا

Mauritania's local marketplace, built with **Next.js 15**, **React 19**, **Supabase** (Postgres + Auth + Storage + Realtime), and **next-intl** (Arabic / Français / English).

> Production-grade scaffold — auth, profiles, stores, listings with image upload, real-time chat, ratings, follows, and a fully-RTL UI matching the bespoke `SOUQ.MR` design system.

---

## ✨ Features

- 🔐 **Auth** — email + password sign-up/sign-in with **buyer / seller** role selector
- 🏪 **Stores** — sellers create their own store page with cover, avatar, contact info, products, reviews tabs
- 📦 **Listings** — multi-image upload to Supabase Storage, categories, condition, location, full-text search
- 💬 **Real-time chat** — direct buyer ↔ seller conversations powered by Supabase Realtime
- ❤️ **Favourites** & **followers** — wishlist products, follow stores
- ⭐ **Reviews** — rate stores 1–5 stars with auto-recomputed aggregate
- 🌍 **Tri-lingual** — Arabic (RTL), French, English with `next-intl`
- 🇲🇷 **Mauritania-first** — MRU currency, local cities, Cairo + Bebas Neue typography
- 🔒 **Row-Level Security** — every table has explicit RLS policies; storage buckets are per-user-folder

---

## 🛠️ Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + a hand-written design-system stylesheet |
| Auth/DB/Storage/Realtime | [Supabase](https://supabase.com/) |
| i18n | [next-intl](https://next-intl.dev/) |
| Validation | [zod](https://zod.dev/) |
| Fonts | Cairo + Bebas Neue (via `next/font`) |

---

## 📋 Prerequisites

- **Node.js 20+** and **npm** (or `pnpm`/`yarn`)
- A free **Supabase** project — sign up at [supabase.com](https://supabase.com/)

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Either:

- **Hosted** — Create a new project at [app.supabase.com](https://app.supabase.com/), then run the SQL migrations in order from the SQL editor:

  ```
  supabase/migrations/0001_initial_schema.sql
  supabase/migrations/0002_rls_policies.sql
  supabase/migrations/0003_storage.sql
  supabase/seed.sql
  ```

- **Local** — Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then:

  ```bash
  supabase start
  supabase db reset
  ```

See [`supabase/README.md`](supabase/README.md) for details.

### 3. Configure environment variables

Copy the example env and fill in your project keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In the Supabase dashboard, **Authentication → URL Configuration**, add `http://localhost:3000/*/auth/callback` to the redirect allowlist.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Arabic by default. Switch language via the top-nav selector or visit `/fr` / `/en`.

---

## 📁 Project structure

```
src/
  app/
    layout.tsx              # passthrough root layout
    [locale]/
      layout.tsx            # html/body, fonts, NextIntlClientProvider
      page.tsx              # home (hero + categories + latest)
      auth/                 # login + register (server actions)
      product/[id]/         # product detail + gallery
      store/[id]/           # public store page (tabs: products/about/reviews)
      sell/                 # add listing form (image uploader)
      messages/             # conversations list + realtime chat room
      profile/              # account + store onboarding
      search/               # filtered listings
      categories/           # all categories grid
  components/
    layout/                 # TopNav, BottomNav, LocaleSwitcher
    products/               # ProductCard, ProductGallery, FavoriteButton
    chat/                   # ChatRoom, ContactSellerButton
    store/                  # FollowButton, MessageStoreButton, StoreTabs
    upload/                 # ImageUploader (Supabase Storage)
    categories/, search/, ui/
  i18n/                     # next-intl routing + request config
  lib/
    supabase/               # browser, server, middleware, types
    queries.ts              # reusable DB reads
    format.ts, cn.ts, categories.ts
  middleware.ts             # i18n + Supabase session refresh
messages/
  ar.json / fr.json / en.json
supabase/
  migrations/               # 0001..0003 schema, RLS, storage
  seed.sql                  # categories
public/favicon.svg
```

---

## 🎨 Design system

The UI follows the `.kiro/steering/design-system.md` spec saved at the workspace root:

- **Background:** `#0A0A0F` · **Card:** `#12121A` · **Border:** `#2A2A3A`
- **Accent gradient:** `#FF6B35 → #FFB347` (orange) for CTAs
- **Brand gradient:** `#FF6B35 → #F0C040` (orange → gold) for the logo
- **Typography:** Cairo for body, Bebas Neue for display
- **RTL-aware:** all text blocks honour `[dir="rtl"]` selectors

---

## 🔧 Scripts

```bash
npm run dev         # start dev server
npm run build       # production build
npm run start       # serve built app
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

---

## 🗃️ Database overview

Tables (all RLS-protected):

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — full_name, phone, role (buyer/seller), preferred_locale |
| `categories` | Hierarchical taxonomy with multilingual names |
| `stores` | One per seller — cover, avatar, contact, computed counts |
| `products` | Listings with full-text `tsvector`, condition, status, view counter |
| `product_images` | Multiple images per listing (sorted) |
| `favorites` | User wishlist (counter trigger) |
| `followers` | Users following stores (counter trigger) |
| `conversations` + `messages` | Real-time chat rooms scoped by buyer/seller/optional product |
| `reviews` | Store ratings 1–5 with auto-recomputed `stores.rating` |
| `notifications` | In-app notifications |

Storage buckets: `product-images`, `store-images`, `avatars` — public read, owner-only write/delete enforced by `(storage.foldername(name))[1] = auth.uid()::text`.

---

## 🚧 Roadmap

The following are intentionally out of scope for this initial release but the schema supports them:

- 🚚 Local delivery integration
- 💳 Local payment (Bankily / Sedad / Masrvi)
- ✅ Manual store verification flow + admin dashboard
- 🔔 Push notifications via Supabase Edge Functions + FCM/Web Push
- 📱 PWA install + offline shell
- 🔍 Advanced search (filters, sort, full-text via `search_vector`)
- 📞 OTP login via SMS provider (replace `loginWithWhatsapp` placeholder)

---

## 📄 License

MIT — for the SOUQ.MR project. Logos and branding remain the property of the project owner.
