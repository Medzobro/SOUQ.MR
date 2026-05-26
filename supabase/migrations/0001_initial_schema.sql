-- =====================================================================
-- SOUQ.MR — Initial schema
-- Marketplace for Mauritania: profiles, stores, products, chat, reviews
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";

-- Helper: updated_at trigger -----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles  (extends auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  avatar_url text,
  city text,
  preferred_locale text default 'ar' check (preferred_locale in ('ar', 'fr', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- categories
-- =====================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_fr text,
  name_en text,
  icon text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- =====================================================================
-- stores
-- =====================================================================
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  avatar_url text,
  cover_url text,
  city text,
  address text,
  phone text,
  whatsapp text,
  is_verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  followers_count int not null default 0,
  products_count int not null default 0,
  opening_hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists stores_owner_id_idx on public.stores(owner_id);
create index if not exists stores_city_idx on public.stores(city);

create trigger stores_set_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

-- =====================================================================
-- products
-- =====================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  price numeric(14,2) not null check (price >= 0),
  currency text not null default 'MRU',
  condition text not null default 'used' check (condition in ('new', 'like_new', 'used', 'refurbished')),
  city text,
  address text,
  status text not null default 'active' check (status in ('active', 'sold', 'hidden', 'pending')),
  badge text,
  is_negotiable boolean not null default true,
  views_count int not null default 0,
  favorites_count int not null default 0,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_seller_id_idx on public.products(seller_id);
create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_status_created_idx on public.products(status, created_at desc);
create index if not exists products_search_idx on public.products using gin(search_vector);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Search vector trigger (multilingual via simple config)
create or replace function public.products_search_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.city, '')), 'C');
  return new;
end;
$$;

create trigger products_search_update
  before insert or update of title, description, city on public.products
  for each row execute function public.products_search_trigger();

-- Maintain stores.products_count
create or replace function public.update_store_products_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.store_id is not null) then
    update public.stores set products_count = products_count + 1 where id = new.store_id;
  elsif (tg_op = 'DELETE' and old.store_id is not null) then
    update public.stores set products_count = greatest(products_count - 1, 0) where id = old.store_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger products_count_trigger
  after insert or delete on public.products
  for each row execute function public.update_store_products_count();

-- =====================================================================
-- product_images
-- =====================================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id, sort_order);

-- =====================================================================
-- favorites
-- =====================================================================
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_product_id_idx on public.favorites(product_id);

-- Maintain products.favorites_count
create or replace function public.update_product_favorites_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.products set favorites_count = favorites_count + 1 where id = new.product_id;
  elsif (tg_op = 'DELETE') then
    update public.products set favorites_count = greatest(favorites_count - 1, 0) where id = old.product_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger favorites_count_trigger
  after insert or delete on public.favorites
  for each row execute function public.update_product_favorites_count();

-- =====================================================================
-- followers (users following stores)
-- =====================================================================
create table if not exists public.followers (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, store_id)
);

create index if not exists followers_store_idx on public.followers(store_id);

create or replace function public.update_store_followers_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.stores set followers_count = followers_count + 1 where id = new.store_id;
  elsif (tg_op = 'DELETE') then
    update public.stores set followers_count = greatest(followers_count - 1, 0) where id = old.store_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger followers_count_trigger
  after insert or delete on public.followers
  for each row execute function public.update_store_followers_count();

-- =====================================================================
-- conversations & messages (chat)
-- =====================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  buyer_unread_count int not null default 0,
  seller_unread_count int not null default 0,
  created_at timestamptz not null default now(),
  unique(buyer_id, seller_id, product_id)
);

create index if not exists conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) > 0),
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

-- Update conversation metadata on new message
create or replace function public.handle_new_message()
returns trigger
language plpgsql
as $$
declare
  conv public.conversations%rowtype;
begin
  select * into conv from public.conversations where id = new.conversation_id;

  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(new.content, 100),
      buyer_unread_count = case when new.sender_id = conv.seller_id then buyer_unread_count + 1 else buyer_unread_count end,
      seller_unread_count = case when new.sender_id = conv.buyer_id then seller_unread_count + 1 else seller_unread_count end
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- =====================================================================
-- reviews (buyers reviewing stores)
-- =====================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(store_id, reviewer_id)
);

create index if not exists reviews_store_idx on public.reviews(store_id, created_at desc);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Recompute store rating after review change
create or replace function public.recompute_store_rating()
returns trigger
language plpgsql
as $$
declare
  target_store uuid;
begin
  target_store := coalesce(new.store_id, old.store_id);
  update public.stores
  set rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where store_id = target_store), 0),
      reviews_count = (select count(*) from public.reviews where store_id = target_store)
  where id = target_store;
  return coalesce(new, old);
end;
$$;

create trigger reviews_rating_trigger
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_store_rating();

-- =====================================================================
-- notifications
-- =====================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc) where read_at is null;
