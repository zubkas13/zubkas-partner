/*
# Add gst_amount column to plans

1. Modified Tables
- `plans`
  - `gst_amount` (numeric, default 0) — the computed GST amount (price * gst_rate / 100) when gst_applicable is true, 0 otherwise. Stored so it persists across refreshes without re-deriving.

2. Security
- No RLS or policy changes. Existing policies on `plans` remain unchanged.

3. Notes
- All new columns are nullable or have safe defaults so existing plan rows remain valid.
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ so re-running is safe.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'gst_amount') THEN
    ALTER TABLE plans ADD COLUMN gst_amount numeric NOT NULL DEFAULT 0;
  END IF;
END $$;