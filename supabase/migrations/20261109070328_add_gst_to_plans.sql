/*
# Add GST support fields to plans

1. Modified Tables
- `plans`
  - `gst_applicable` (boolean, default false) — whether GST applies to this plan's pricing.
  - `gst_rate` (numeric, default 18) — the GST percentage rate applied when gst_applicable is true.

2. Security
- No RLS or policy changes. Existing policies on `plans` remain unchanged.

3. Notes
- All new columns are nullable or have safe defaults so existing plan rows remain valid.
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ blocks so re-running is safe.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'gst_applicable') THEN
    ALTER TABLE plans ADD COLUMN gst_applicable boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'gst_rate') THEN
    ALTER TABLE plans ADD COLUMN gst_rate numeric NOT NULL DEFAULT 18;
  END IF;
END $$;
