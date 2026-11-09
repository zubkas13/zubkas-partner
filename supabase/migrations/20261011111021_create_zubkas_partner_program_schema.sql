/*
# Create Zubkas Partner Program Schema

## Overview
Creates all core tables for the Zubkas Partner Program application, replacing
the previous localStorage-based mock data system with a persistent Supabase backend.

## New Tables
1. `partners` — Partner accounts with commission/sales metrics
2. `customers` — Customers referred by partners, with subscription and commission info
3. `leads` — Leads submitted by partners, with lock/approval/conversion workflow
4. `employees` — Internal staff (partner managers, support, onboarding)
5. `categories` — Partner business categories
6. `plans` — Commission plan tiers (Free, Premium, etc.)
7. `products` — Zubkas products available for referral
8. `announcements` — Admin announcements shown to partners
9. `notifications` — Per-user notifications
10. `commission_transactions` — Historical commission payment records
11. `app_users` — Login users (admin, employee, partner) with passwords
12. `app_settings` — Global app settings (single row)
13. `site_content` — Landing/login page text content (single row)
14. `roles` — Employee roles with admin panel permissions
15. `partner_users` — Additional partner login users (created when admin adds a partner)
16. `chat_threads` — Support chat threads between partner and support
17. `chat_messages` — Individual messages in chat threads

## Security
- Single-tenant app: no Supabase auth. The app has its own login system.
- RLS enabled on all tables with `TO anon, authenticated` policies for full CRUD.
- This is intentionally public/shared data — the app uses the anon key for all operations.

## Important Notes
1. All tables use `text` primary keys to match the app's existing ID generation pattern (e.g. `partner-123`).
2. Array columns (features, permissions) use `jsonb`.
3. The `app_users` table includes a `password` column for the app's custom auth.
4. A seed admin user (admin@zubkas.com) is inserted for initial access.
*/

-- ===== PARTNERS =====
CREATE TABLE IF NOT EXISTS partners (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  joined_date text NOT NULL,
  category text NOT NULL DEFAULT '',
  total_commission numeric NOT NULL DEFAULT 0,
  monthly_commission numeric NOT NULL DEFAULT 0,
  pending_commission numeric NOT NULL DEFAULT 0,
  active_customers integer NOT NULL DEFAULT 0,
  monthly_sales numeric NOT NULL DEFAULT 0,
  badge text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_partners" ON partners;
CREATE POLICY "anon_select_partners" ON partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_partners" ON partners;
CREATE POLICY "anon_insert_partners" ON partners FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_partners" ON partners;
CREATE POLICY "anon_update_partners" ON partners FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_partners" ON partners;
CREATE POLICY "anon_delete_partners" ON partners FOR DELETE TO anon, authenticated USING (true);

-- ===== CUSTOMERS =====
CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  name text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  plan_type text NOT NULL DEFAULT 'Monthly',
  plan_tier text NOT NULL DEFAULT 'Free',
  commission_rate numeric NOT NULL DEFAULT 0,
  subscription_amount numeric NOT NULL DEFAULT 0,
  start_date text NOT NULL,
  renewal_date text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  commission_earned numeric NOT NULL DEFAULT 0,
  commission_end_date text NOT NULL,
  months_elapsed integer NOT NULL DEFAULT 0,
  remaining_months integer NOT NULL DEFAULT 12,
  lead_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE TO anon, authenticated USING (true);

-- ===== LEADS =====
CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  partner_name text NOT NULL DEFAULT '',
  company_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Open',
  submitted_date text NOT NULL,
  lock_end_date text NOT NULL,
  notes text NOT NULL DEFAULT '',
  whatsapp text,
  product_id text,
  product_name text,
  plan_type text,
  plan_price numeric,
  commission_rate numeric,
  payment_status text,
  renewal_date text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE TO anon, authenticated USING (true);

-- ===== EMPLOYEES =====
CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  role text NOT NULL DEFAULT '',
  role_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  joined_date text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_employees" ON employees;
CREATE POLICY "anon_select_employees" ON employees FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_employees" ON employees;
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE TO anon, authenticated USING (true);

-- ===== CATEGORIES =====
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  partner_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- ===== PLANS =====
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'Monthly',
  description text NOT NULL DEFAULT '',
  is_custom boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_plans" ON plans;
CREATE POLICY "anon_select_plans" ON plans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_plans" ON plans;
CREATE POLICY "anon_insert_plans" ON plans FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_plans" ON plans;
CREATE POLICY "anon_update_plans" ON plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_plans" ON plans;
CREATE POLICY "anon_delete_plans" ON plans FOR DELETE TO anon, authenticated USING (true);

-- ===== PRODUCTS =====
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Package',
  features jsonb NOT NULL DEFAULT '[]',
  commission_eligible boolean NOT NULL DEFAULT true,
  show_on_landing boolean NOT NULL DEFAULT true,
  monthly_price numeric,
  yearly_price numeric,
  status text NOT NULL DEFAULT 'Active',
  launch_date text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

-- ===== ANNOUNCEMENTS =====
CREATE TABLE IF NOT EXISTS announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'general',
  author text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT '',
  date text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE TO anon, authenticated USING (true);

-- ===== NOTIFICATIONS =====
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'system',
  date text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ===== COMMISSION TRANSACTIONS =====
CREATE TABLE IF NOT EXISTS commission_transactions (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  plan_tier text NOT NULL DEFAULT '',
  month text NOT NULL DEFAULT '',
  date text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_transactions" ON commission_transactions;
CREATE POLICY "anon_select_transactions" ON commission_transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transactions" ON commission_transactions;
CREATE POLICY "anon_insert_transactions" ON commission_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transactions" ON commission_transactions;
CREATE POLICY "anon_update_transactions" ON commission_transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transactions" ON commission_transactions;
CREATE POLICY "anon_delete_transactions" ON commission_transactions FOR DELETE TO anon, authenticated USING (true);

-- ===== APP USERS (login system) =====
CREATE TABLE IF NOT EXISTS app_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  phone text,
  whatsapp text,
  company text,
  partner_id text,
  employee_role text,
  joined_date text NOT NULL,
  password text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_app_users" ON app_users;
CREATE POLICY "anon_select_app_users" ON app_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_app_users" ON app_users;
CREATE POLICY "anon_insert_app_users" ON app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_app_users" ON app_users;
CREATE POLICY "anon_update_app_users" ON app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_app_users" ON app_users;
CREATE POLICY "anon_delete_app_users" ON app_users FOR DELETE TO anon, authenticated USING (true);

-- ===== APP SETTINGS (single row) =====
CREATE TABLE IF NOT EXISTS app_settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  lead_lock_days integer NOT NULL DEFAULT 3,
  commission_cap_months integer NOT NULL DEFAULT 12,
  default_currency text NOT NULL DEFAULT '₹',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ===== SITE CONTENT (single row) =====
CREATE TABLE IF NOT EXISTS site_content (
  id text PRIMARY KEY DEFAULT 'singleton',
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_site_content" ON site_content;
CREATE POLICY "anon_select_site_content" ON site_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_site_content" ON site_content;
CREATE POLICY "anon_insert_site_content" ON site_content FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_site_content" ON site_content;
CREATE POLICY "anon_update_site_content" ON site_content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ===== ROLES =====
CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  permissions jsonb NOT NULL DEFAULT '[]',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_roles" ON roles;
CREATE POLICY "anon_select_roles" ON roles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_roles" ON roles;
CREATE POLICY "anon_insert_roles" ON roles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_roles" ON roles;
CREATE POLICY "anon_update_roles" ON roles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_roles" ON roles;
CREATE POLICY "anon_delete_roles" ON roles FOR DELETE TO anon, authenticated USING (true);

-- ===== CHAT THREADS =====
CREATE TABLE IF NOT EXISTS chat_threads (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  partner_name text NOT NULL DEFAULT '',
  partner_company text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  unread_by_partner integer NOT NULL DEFAULT 0,
  unread_by_support integer NOT NULL DEFAULT 0
);
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_chat_threads" ON chat_threads;
CREATE POLICY "anon_select_chat_threads" ON chat_threads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat_threads" ON chat_threads;
CREATE POLICY "anon_insert_chat_threads" ON chat_threads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chat_threads" ON chat_threads;
CREATE POLICY "anon_update_chat_threads" ON chat_threads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chat_threads" ON chat_threads;
CREATE POLICY "anon_delete_chat_threads" ON chat_threads FOR DELETE TO anon, authenticated USING (true);

-- ===== CHAT MESSAGES =====
CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  thread_id text NOT NULL,
  sender_type text NOT NULL DEFAULT 'partner',
  sender_name text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE TO anon, authenticated USING (true);

-- ===== SEED: default roles =====
INSERT INTO roles (id, name, description, permissions, is_default) VALUES
  ('role-full-admin', 'Full Access', 'Full access to all admin panel sections',
    '["dashboard","partners","leads","employees","categories","plans","products","content","announcements","leaderboard","settings","roles"]'::jsonb, true),
  ('role-partner-manager', 'Partner Manager', 'Manage partners, leads, and view dashboard',
    '["dashboard","partners","leads","leaderboard"]'::jsonb, true),
  ('role-support-lead', 'Support Lead', 'Handle announcements and view leaderboard',
    '["dashboard","announcements","leaderboard"]'::jsonb, true),
  ('role-onboarding', 'Onboarding Specialist', 'View dashboard and manage announcements',
    '["dashboard","announcements"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- ===== SEED: default app settings =====
INSERT INTO app_settings (id, lead_lock_days, commission_cap_months, default_currency)
VALUES ('singleton', 3, 12, '₹')
ON CONFLICT (id) DO NOTHING;

-- ===== SEED: default site content =====
INSERT INTO site_content (id, content) VALUES ('singleton',
  '{
    "landingBadge": "Zubkas Authorized Partner Program",
    "landingHeroTitle1": "Earn recurring commissions",
    "landingHeroTitle2": "for up to 12 months",
    "landingHeroTitle3": "on every customer you refer",
    "landingHeroSubtitle": "Join the Zubkas Partner Program and earn up to 15% commission on every subscription. Track leads, monitor commissions, and climb the leaderboard — all from one powerful dashboard.",
    "landingCtaPrimary": "Become a Partner",
    "landingCtaSecondary": "Explore Features",
    "landingFeaturesHeading": "Everything you need to grow",
    "landingFeaturesSubheading": "A complete partner management platform with commission tracking, lead protection, and real-time analytics.",
    "landingEarningsHeading": "Watch your commissions grow",
    "landingEarningsDesc": "Every customer you refer generates commission automatically. Monthly plans earn every month for 12 months. Yearly plans earn a lump-sum. Track everything in real-time with visual progress bars and monthly breakdowns.",
    "landingHowItWorksHeading": "Start earning in 3 simple steps",
    "landingCtaSectionHeading": "Ready to start earning?",
    "landingCtaSectionDesc": "Sign in to access your partner dashboard, track commissions, and manage your referrals.",
    "landingCtaSectionButton": "Sign In to Dashboard",
    "landingStat1Value": "500+",
    "landingStat1Label": "Active Partners",
    "landingStat2Value": "₹2.4Cr+",
    "landingStat2Label": "Commission Paid",
    "landingStat3Value": "1,200+",
    "landingStat3Label": "Customers Referred",
    "landingStat4Value": "7",
    "landingStat4Label": "Products Suite",
    "loginBadge": "Authorized Partner Portal",
    "loginHeroTitle1": "Earn recurring commissions",
    "loginHeroTitle2": "for up to 12 months",
    "loginHeroSubtitle": "Refer customers to Zubkas products and earn 5-15% commission every month. Track your performance, manage leads, and grow your earnings.",
    "loginPartnerTitle": "Partner Login",
    "loginPartnerSubtitle": "Access your partner dashboard",
    "loginAdminTitle": "Admin / Employee Login",
    "loginAdminSubtitle": "Manage partners, plans, and announcements"
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ===== SEED: admin user =====
INSERT INTO app_users (id, email, name, role, phone, joined_date, password)
VALUES ('user-admin', 'admin@zubkas.com', 'Rajesh Kumar', 'admin', '+91 98765 43210', '2024-01-01', '')
ON CONFLICT (id) DO NOTHING;
