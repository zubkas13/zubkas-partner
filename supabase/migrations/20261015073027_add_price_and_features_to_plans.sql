/*
# Add price and features columns to plans table

1. Modified Tables
- `plans`: Added `price` (numeric, nullable, default null) to store the plan's subscription price in INR.
- `plans`: Added `features` (jsonb, not null, default '[]') to store the list of feature bullet points for each plan.

2. Security
- No RLS policy changes. Existing policies on `plans` remain unchanged.

3. Important Notes
- Both columns are additive — no existing data is modified or lost.
- `price` is nullable so existing plans without a price remain valid.
- `features` defaults to an empty array so existing plans get `[]` automatically.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'price'
  ) THEN
    ALTER TABLE plans ADD COLUMN price numeric DEFAULT null;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'features'
  ) THEN
    ALTER TABLE plans ADD COLUMN features jsonb NOT NULL DEFAULT '[]';
  END IF;
END $$;
