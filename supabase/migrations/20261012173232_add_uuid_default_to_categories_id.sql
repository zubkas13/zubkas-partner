/*
# Add UUID default to categories.id

## Changes
- Sets the `id` column default on `categories` to `gen_random_uuid()::text`
  so that inserts which omit `id` get an auto-generated UUID primary key.

## Rationale
The frontend previously generated custom string IDs like `cat-123`. Moving
ID generation to the database ensures uniqueness and simplifies the insert
path. The column stays `text` type for backward compatibility with existing
rows — only the default changes.

## Security
- No RLS or policy changes.
- No new tables or columns.
*/

ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;