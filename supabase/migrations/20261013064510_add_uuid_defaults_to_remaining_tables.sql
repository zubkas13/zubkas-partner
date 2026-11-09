/*
# Add UUID defaults to remaining tables

Adds gen_random_uuid()::text default to the id column on:
- notifications
- leads
- announcements
- chat_threads
- chat_messages
- commission_transactions

This allows new rows to be inserted without an explicit id, so the
database generates a valid UUID instead of the application sending a
temporary string like "n-1234567890".

Column type stays text (unchanged). Only the default is added.
Existing rows are not affected. Idempotent.
*/

ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE leads ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE announcements ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE chat_threads ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE chat_messages ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE commission_transactions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;