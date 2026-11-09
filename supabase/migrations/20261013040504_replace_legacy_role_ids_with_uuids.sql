/*
# Replace legacy string role IDs with proper UUIDs

1. Problem
- The initial seed inserted roles with hardcoded string IDs like
  "role-full-admin", "role-partner-manager", "role-support-lead",
  "role-onboarding".
- Employees reference these strings in their role_id column.
- The roles table now defaults to gen_random_uuid() for new rows, but the
  existing seed rows still have the old string IDs, so the employee form
  dropdown passes strings instead of UUIDs.

2. Changes
- For each of the 4 seed roles, generate a new UUID via gen_random_uuid().
- Update employees.role_id to point to the new UUID for any employee
  currently referencing the old string ID.
- Delete the old role row and re-insert with the same data but the new UUID.
  This is done in a DO block per role, preserving name, description,
  permissions, is_default, and created_at.

3. Security
- No changes to RLS or policies.

4. Notes
- Idempotent: if the roles already have UUID IDs (no rows match the old
  string IDs), the DO blocks are no-ops.
- The employee seeded with role_id = 'role-full-admin' is updated to
  the new UUID for the Full Access role.
*/

DO $$
DECLARE
  old_id text;
  new_id text;
  r_name text;
  r_description text;
  r_permissions jsonb;
  r_is_default boolean;
  r_created_at timestamptz;
  legacy_ids text[] := ARRAY['role-full-admin', 'role-partner-manager', 'role-support-lead', 'role-onboarding'];
BEGIN
  FOREACH old_id IN ARRAY legacy_ids LOOP
    -- Check if a row with the old string ID exists
    SELECT name, description, permissions, is_default, created_at
      INTO r_name, r_description, r_permissions, r_is_default, r_created_at
      FROM roles WHERE id = old_id;
    IF FOUND THEN
      new_id := gen_random_uuid()::text;
      -- Update employees referencing the old role ID
      UPDATE employees SET role_id = new_id WHERE role_id = old_id;
      -- Insert the role row with the new UUID, preserving all data
      INSERT INTO roles (id, name, description, permissions, is_default, created_at)
        VALUES (new_id, r_name, r_description, r_permissions, r_is_default, r_created_at);
      -- Remove the old row
      DELETE FROM roles WHERE id = old_id;
    END IF;
  END LOOP;
END $$;