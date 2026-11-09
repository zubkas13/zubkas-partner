/*
# Add monthly_gst and yearly_gst columns to products

1. Modified Tables
- `products`
  - `monthly_gst` (numeric, nullable) — the computed GST amount for the monthly price (monthly_price * gst_rate / 100), stored when gst_applicable is true and a monthly_price exists.
  - `yearly_gst` (numeric, nullable) — the computed GST amount for the yearly price (yearly_price * gst_rate / 100), stored when gst_applicable is true and a yearly_price exists.

2. Security
- No RLS or policy changes. Existing policies on `products` remain unchanged.

3. Notes
- Both columns are nullable so existing product rows remain valid without backfill.
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ blocks so re-running is safe.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'monthly_gst') THEN
    ALTER TABLE products ADD COLUMN monthly_gst numeric;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'yearly_gst') THEN
    ALTER TABLE products ADD COLUMN yearly_gst numeric;
  END IF;
END $$;
