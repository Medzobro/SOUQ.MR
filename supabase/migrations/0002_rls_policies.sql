-- =====================================================================
-- SOUQ.MR — Row Level Security policies
-- =====================================================================

-- Enable RLS on all tables -------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.stores           enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.favorites        enable row level security;
alter table public.followers        enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.reviews          enable row level security;
alter table public.notifications    enable row level security;

-- profiles -----------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- categories (read-only for users) -----------------------------------
create policy "Categories are public"
  on public.categories for select
  using (true);

-- stores -------------------------------------------------------------
create policy "Stores are viewable by everyone"
  on public.stores for select
  using (true);

create policy "Sellers create their own store"
  on public.stores for insert
  with check (auth.uid() = owner_id);

create policy "Owners update their own store"
  on public.stores for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners delete their own store"
  on public.stores for delete
  using (auth.uid() = owner_id);

-- products -----------------------------------------------------------
create policy "Active products are public"
  on public.products for select
  using (status = 'active' or auth.uid() = seller_id);

create policy "Sellers create products"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "Sellers update their products"
  on public.products for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Sellers delete their products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- product_images -----------------------------------------------------
create policy "Product images viewable by everyone"
  on public.product_images for select
  using (true);

create policy "Sellers manage images of own products"
  on public.product_images for all
  using (
    exists (select 1 from public.products p
            where p.id = product_id and p.seller_id = auth.uid())
  )
  with check (
    exists (select 1 from public.products p
            where p.id = product_id and p.seller_id = auth.uid())
  );

-- favorites ----------------------------------------------------------
create policy "Users see own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- followers ----------------------------------------------------------
create policy "Followers are public-readable"
  on public.followers for select
  using (true);

create policy "Users follow/unfollow themselves only"
  on public.followers for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- conversations ------------------------------------------------------
create policy "Participants see their conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyer creates conversation"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

create policy "Participants update conversation (read counters)"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- messages -----------------------------------------------------------
create policy "Participants see their messages"
  on public.messages for select
  using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id
              and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
  );

create policy "Participants send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (select 1 from public.conversations c
                where c.id = conversation_id
                  and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
  );

create policy "Participants mark messages as read"
  on public.messages for update
  using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id
              and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
  );

-- reviews ------------------------------------------------------------
create policy "Reviews are public"
  on public.reviews for select
  using (true);

create policy "Authenticated users post reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Reviewers update own reviews"
  on public.reviews for update
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

create policy "Reviewers delete own reviews"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- notifications ------------------------------------------------------
create policy "Users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications (mark read)"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
