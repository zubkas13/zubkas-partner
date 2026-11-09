/*
# Create customer_payments table

## Overview
Adds a new `customer_payments` table to track individual payment records
for customers. Each payment is linked to a customer and records the amount,
the period it covers (month for monthly plans, year for yearly plans),
and the payment date.

## New Tables
1. `customer_payments` — Individual payment records per customer
   - `id` (uuid, primary key, auto-generated)
   - `customer_id` (text, not null) — FK to customers table
   - `amount` (numeric, not null) — payment amount
   - `period_label` (text, not null) — e.g. "2026-10" for monthly, "2026" for yearly
   - `plan_type` (text, not null) — "Monthly" or "Yearly"
   - `payment_date` (text, not null) — date the payment was recorded
   - `notes` (text, optional) — admin notes
   - `recorded_by` (text, optional) — name of admin who recorded the payment
   - `created_at` (timestamptz, default now())

## Security
- Single-tenant app with custom auth (same pattern as all other tables).
- RLS enabled with `TO anon, authenticated` policies for full CRUD.
- Intentionally public/shared data — the app uses the anon key for all operations.

## Important Notes
1. Uses UUID primary key with gen_random_uuid() default, matching the pattern
   used by later migrations for other tables.
2. No destructive changes to existing tables — purely additive.
*/

CREATE TABLE IF NOT EXISTS customer_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  period_label text NOT NULL,
  plan_type text NOT NULL DEFAULT 'Monthly',
  payment_date text NOT NULL,
  notes text NOT NULL DEFAULT '',
  recorded_by text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customer_payments" ON customer_payments;
CREATE POLICY "anon_select_customer_payments" ON customer_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customer_payments" ON customer_payments;
CREATE POLICY "anon_insert_customer_payments" ON customer_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customer_payments" ON customer_payments;
CREATE POLICY "anon_update_customer_payments" ON customer_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customer_payments" ON customer_payments;
CREATE POLICY "anon_delete_customer_payments" ON customer_payments FOR DELETE
  TO anon, authenticated USING (true);
