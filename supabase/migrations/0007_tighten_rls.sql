-- =====================================================================
-- SOUQ.MR — Tighten RLS: prevent sellers from changing status/is_promoted
-- =====================================================================
-- Issue: Sellers could update status='active' or is_promoted=true
-- Fix: Trigger that blocks non-admin status/promotion changes

-- Drop the overly-permissive seller update policy, replace with trigger
drop policy if exists "Sellers update their products" on public.products;

-- Recreate the update policy WITHOUT the with-check (trigger handles it)
create policy "Sellers update their own products (trigger-controlled)"
  on public.products for update
  using (auth.uid() = seller_id);

-- ── Function: prevent unauthorized status/promotion changes ──────────

create or replace function public.check_product_update()
returns trigger as $$
declare
  v_role text;
  v_old_status text;
  v_new_status text;
begin
  -- Fetch user role
  select role into v_role
  from public.profiles
  where id = auth.uid();

  v_old_status := old.status;
  v_new_status := new.status;

  -- Admin can change anything
  if v_role = 'admin' then
    return new;
  end if;

  -- Sellers CANNOT change status to 'active' or 'hidden' (admin only)
  if v_new_status in ('active', 'hidden') and v_old_status != v_new_status then
    raise exception 'Only admins can approve or hide products';
  end if;

  -- Sellers CANNOT change is_promoted to true (admin only)
  if new.is_promoted = true and old.is_promoted = false then
    raise exception 'Only admins can promote products';
  end if;

  -- Sellers CANNOT change promotion_requested from false to true if not seller
  -- (this is handled by server action already, but defense in depth)
  if new.promotion_requested = true and old.promotion_requested = false then
    if old.seller_id != auth.uid() then
      raise exception 'Only the seller can request promotion';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- ── Attach trigger ───────────────────────────────────────────────────

drop trigger if exists trg_check_product_update on public.products;

create trigger trg_check_product_update
  before update on public.products
  for each row execute function public.check_product_update();
