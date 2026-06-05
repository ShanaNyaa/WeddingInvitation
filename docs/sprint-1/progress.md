# Sprint 1 — Progress

## Status: Complete

## Tasks

- [x] T1 — Supabase migrations (5 SQL files in `Backend/supabase/migrations/`)
- [x] T2 — Supabase client (`Frontend/src/lib/supabase.js`)
- [x] T3 — Routing skeleton (`App.jsx`, `ProtectedRoute`, page shells)
- [x] T4 — GuestPage: fetches & renders `invitation_content` from Supabase
- [x] T5 — AdminLoginPage: Supabase Auth email/password login with error handling
- [x] T6 — AdminDashboard: user email display, logout, three tab placeholders

## Decisions Made

- `@supabase/supabase-js ^2.45.4` added to `package.json` — will be installed inside container on next `docker compose up --build`
- `env_file` in `compose.yaml` uncommented so `VITE_SUPABASE_*` vars are injected at container start
- `.env.local.example` added as a setup guide; actual `.env.local` must be created manually and never committed
- RLS anon SELECT on `invite_keys` is limited to `is_active = true` rows only — prevents guests from seeing revoked keys

## Blockers

None. To run the app:
1. Create `.env.local` at the project root from `.env.local.example` with real Supabase credentials
2. Run migrations 001–005 in the Supabase SQL editor
3. Create an admin user in Supabase: Authentication → Users → Invite user
4. `docker compose up --build`

## Up Next (Sprint 2)

- Invite key generation UI in Admin Dashboard
- RSVP form on GuestPage (key validation + guest registration with Malaysian phone number)
