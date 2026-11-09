/*
# Add UUID default to employees.id

1. Modified Tables
- `employees`: altered the `id` column to default to `gen_random_uuid()::text`.
  This allows new employee rows to be inserted without an explicit id, so the
  database generates a valid UUID instead of the application sending a
  temporary string like "emp-1234567890".

2. Security
- No changes to RLS or policies. Existing policies remain intact.

3. Notes
- The column type stays `text` (unchanged). Only the default is added.
- Existing rows are not affected.
- Idempotent: re-running simply re-sets the same default.
*/

ALTER TABLE employees ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;