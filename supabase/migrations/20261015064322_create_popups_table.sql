/*
# Create popups table for admin-managed portal popups

1. New Tables
- `popups`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — popup headline
  - `content` (text, not null) — popup body message
  - `image_url` (text, nullable) — optional image URL to display in the popup
  - `target_type` (text, not null) — audience type: 'all_partners', 'specific_partner', 'all_employees', 'specific_employee'
  - `target_id` (text, nullable) — when target_type is specific_partner or specific_employee, the partner/employee id
  - `is_active` (boolean, default false) — admin toggle to show/hide the popup
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `popups`.
- Allow anon + authenticated full CRUD — this is a single-tenant app where the
  frontend uses the anon key. All popup data is intentionally shared across
  admin/partner/employee roles (visibility is filtered client-side by
  target_type/target_id against the logged-in user).

3. Notes
- The `target_id` column stores a partner id or employee id depending on
  `target_type`. It is nullable because broadcast types ('all_partners',
  'all_employees') don't target a specific user.
- `is_active` defaults to false so newly created popups don't appear until
  the admin explicitly activates them.
*/

CREATE TABLE IF NOT EXISTS popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  target_type text NOT NULL DEFAULT 'all_partners',
  target_id text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_popups" ON popups;
CREATE POLICY "anon_select_popups" ON popups FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_popups" ON popups;
CREATE POLICY "anon_insert_popups" ON popups FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_popups" ON popups;
CREATE POLICY "anon_update_popups" ON popups FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_popups" ON popups;
CREATE POLICY "anon_delete_popups" ON popups FOR DELETE
  TO anon, authenticated USING (true);
