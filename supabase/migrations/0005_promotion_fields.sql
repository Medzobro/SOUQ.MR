-- Add promotion fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promoted boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS promoted_until timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_requested boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_requested_at timestamptz;

-- Index for promoted products (efficient filtering)
CREATE INDEX IF NOT EXISTS idx_products_promoted ON products(is_promoted, promoted_until) WHERE is_promoted = true;
