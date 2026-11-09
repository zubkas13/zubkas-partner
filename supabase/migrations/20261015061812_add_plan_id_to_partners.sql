/*
# Add plan_id column to partners table

1. Changes
- Adds `plan_id` text column to `partners` table (nullable).
- This column references the `plans` table id, storing which commission plan
  was assigned to a partner at account creation time.
- Existing partner rows will have NULL plan_id, which is valid — the app
  falls back to a default commission rate when no plan is assigned.
2. Security
- No RLS policy changes. The existing anon/authenticated CRUD policies on
  partners already cover the new column (column-level privileges are not
  restricted; the table-level policies govern access).
*/

DO $$ BEGIN
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS plan_id text;
EXCEPTION WHEN duplicate_column THEN
  -- column already exists, no-op
  NULL;
END $$;
