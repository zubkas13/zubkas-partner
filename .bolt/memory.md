# Project memory

## Product intent & audience

- Internal admin/operations tool for Zubkas Technology Private Limited.
- App Settings page controls lead management and commission policy (`lead_lock_days`, `commission_cap_months`).

## Brand personality & voice

- Brand: Zubkas Technology Private Limited.
- Brand color: `#9f0f0f` (do not alter).

## Visual design & UX direction

- Vite + React + TypeScript frontend.
- Admin Settings uses a form with a "Save Settings" button; shows saving spinner, success, and error states.
- Feedback via toast and/or console log.
- After successful settings save, DB is re-fetched so form values persist across reloads.

## Decisions, constraints & rationale

- Supabase is the backend; `app_settings` table uses a singleton row (`id = 'singleton'`).
- Do not touch, modify, remove, or replace any existing Supabase credentials, env vars, or DB connection config.
- Settings save now uses explicit async Supabase `.update({ lead_lock_days, commission_cap_months }).eq('id', 'singleton')` from the Settings page.
- Removed redundant auto-persist `useEffect` in `AppContext` that fired an `upsert` on every `settingsState` change; replaced with a "skip first run" guard so `resetAllData` still works and explicit save is the single write path.
- `AppContext.updateSettings` updates local React state; persistence is handled by the explicit save in AdminSettings.

## Open questions & assumptions

- Assumes `app_settings` row with `id = 'singleton'` already exists (update, not insert).
- Toast/notification library assumed present; exact UI component choices not confirmed beyond spinner + success/error text.
- No `.bolt/prompt` authoritative instructions exist yet.