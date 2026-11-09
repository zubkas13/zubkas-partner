/*
# Add billing frequency and GST fields to products

1. Modified Tables
- `products`
  - `billing_frequency` (text, nullable) — 'Monthly' or 'Yearly', indicates which price model the product uses.
  - `gst_applicable` (boolean, default false) — whether GST applies to this product's pricing.
  - `gst_rate` (numeric, default 18) — the GST percentage rate applied when gst_applicable is true.

2. Security
- No RLS or policy changes. Existing policies on `products` remain unchanged.

3. Notes
- All new columns are nullable or have safe defaults so existing product rows remain valid.
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ blocks so re-running is safe.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'billing_frequency') THEN
    ALTER TABLE products ADD COLUMN billing_frequency text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gst_applicable') THEN
    ALTER TABLE products ADD COLUMN gst_applicable boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gst_rate') THEN
    ALTER TABLE products ADD COLUMN gst_rate numeric NOT NULL DEFAULT 18;
  END IF;
END $$;
