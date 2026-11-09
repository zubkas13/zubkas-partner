-- Add password column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password text NOT NULL DEFAULT '';

-- Seed the specific employee login
INSERT INTO employees (id, name, email, phone, role, role_id, status, joined_date, password)
VALUES (
  'emp-zubkas-tech',
  'Zubkas Technology',
  'zubkastechnology@gmail.com',
  '',
  'Full Access',
  'role-full-admin',
  'Active',
  '2024-01-01',
  'MARJAN@53542'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  role = EXCLUDED.role,
  role_id = EXCLUDED.role_id;