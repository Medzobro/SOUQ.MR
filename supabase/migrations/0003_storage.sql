-- =====================================================================
-- SOUQ.MR — Storage buckets & policies
-- =====================================================================

-- Public buckets for product, store, and avatar images ---------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('store-images',   'store-images',   true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('avatars',        'avatars',        true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- All buckets above are publicly readable
create policy "Public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Public read store-images"
  on storage.objects for select
  using (bucket_id = 'store-images');

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder (uid as first path segment)
create policy "Auth upload product-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update own product-images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth delete own product-images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth upload store-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'store-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update own store-images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'store-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth upload avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
