-- Atomic views_count increment (no read-before-write race condition)
CREATE OR REPLACE FUNCTION public.increment_views(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET views_count = views_count + 1 WHERE id = product_id;
END;
$$;
