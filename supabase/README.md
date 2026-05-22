# Supabase setup

## Local development

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. From the project root run:

   ```bash
   supabase start            # boots local Postgres + Auth + Storage
   supabase db reset         # applies migrations + seed.sql
   ```
3. Copy the printed URL/anon key into `.env.local`.

## Hosted (production / staging)

1. Create a new project at [app.supabase.com](https://app.supabase.com).
2. From the SQL editor, run the files in `migrations/` in order:
   - `0001_initial_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_storage.sql`
3. Run `seed.sql` to load the categories.
4. Copy `Project URL`, `anon` and `service_role` keys to your env.
5. Enable **Phone (SMS)** auth in *Authentication → Providers* if you want OTP login.

## Schema overview

| Table | Purpose |
|---|---|
| `profiles` | User profile (extends `auth.users`), role = buyer/seller |
| `stores` | One row per seller (cover, avatar, contact, stats) |
| `categories` | Hierarchical taxonomy (multilingual names) |
| `products` | Listings with full-text search vector |
| `product_images` | Multiple images per product |
| `favorites` | User wishlist |
| `followers` | Users following stores |
| `conversations` + `messages` | Realtime chat between buyer & seller |
| `reviews` | Store ratings |
| `notifications` | In-app alerts |

All tables have RLS enabled — see `0002_rls_policies.sql`.
