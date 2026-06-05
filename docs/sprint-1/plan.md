# Sprint 1 — Foundation & Database Schema

**Goal:** Stand up the full project skeleton: routing, Supabase schema with RLS, and the two page shells (Guest invitation page + Admin dashboard). No styling polish yet — just working plumbing.

**Success Criteria:**
- [ ] App runs via `docker compose up` with no errors
- [ ] Guest page (`/`) renders with placeholder invitation content fetched from Supabase
- [ ] Admin login (`/admin/login`) authenticates via Supabase Auth and redirects to `/admin`
- [ ] Unauthenticated access to `/admin` redirects to `/admin/login`
- [ ] All three Supabase tables exist with RLS policies applied (see schema below)
- [ ] Supabase client is centralised in `Frontend/src/lib/supabase.js` — no direct calls elsewhere

---

## Supabase Schema

### Table: `invitation_content`
Holds all editable fields for the guest-facing invitation page. Single-row table.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `int2` | Always `1` (enforced by RLS/check) |
| `couple_names` | `text` | e.g. "Ali & Siti" |
| `event_date` | `date` | |
| `event_time` | `text` | e.g. "11:00 AM" |
| `venue_name` | `text` | |
| `venue_address` | `text` | |
| `story_blurb` | `text` | Short paragraph about the couple |
| `hero_image_url` | `text` | Public image URL |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

**RLS:**
- `SELECT` — public (anon role)
- `UPDATE` — authenticated role only (admin)

---

### Table: `invite_keys`
One row per family group.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `family_name` | `text` | e.g. "Family A" |
| `secret_key` | `text` | Unique, short random string e.g. `FAM-X7K2` |
| `seat_limit` | `int2` | Max attendees allowed under this key |
| `seats_used` | `int2` | Default `0`, incremented on registration |
| `is_active` | `bool` | Default `true`; set to `false` on revocation |
| `created_at` | `timestamptz` | |

**RLS:**
- `SELECT` (secret_key only) — anon role, for key validation by guests
- `SELECT` (all columns) — authenticated role only
- `INSERT`, `UPDATE`, `DELETE` — authenticated role only

---

### Table: `rsvp_guests`
One row per registered guest.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `invite_key_id` | `uuid` | FK → `invite_keys.id` |
| `full_name` | `text` | |
| `phone_number` | `text` | Malaysian format, stored as `+60XXXXXXXXX` |
| `registered_at` | `timestamptz` | |

**RLS:**
- `INSERT` — anon role allowed (guest registration)
- `SELECT`, `UPDATE`, `DELETE` — authenticated role only

---

## Tasks (prioritised)

### T1 — Supabase migrations
Create SQL migration files in `Backend/supabase/migrations/`:
1. `001_create_invitation_content.sql`
2. `002_create_invite_keys.sql`
3. `003_create_rsvp_guests.sql`
4. `004_rls_policies.sql`
5. `005_seed_invitation_content.sql` — insert the single default row into `invitation_content`

### T2 — Supabase client
Create `Frontend/src/lib/supabase.js`:
- Initialise Supabase client from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
- Export the client as default

### T3 — Routing skeleton
Set up React Router in `App.jsx` with these routes:
- `/` → `GuestPage`
- `/admin/login` → `AdminLoginPage`
- `/admin` → `AdminDashboard` (protected — redirect to `/admin/login` if not authenticated)

Create page component shells in `Frontend/src/pages/`:
- `GuestPage.jsx`
- `AdminLoginPage.jsx`
- `AdminDashboard.jsx`

Create a `ProtectedRoute` component in `Frontend/src/components/ProtectedRoute.jsx` that checks Supabase Auth session.

### T4 — Guest page: fetch & display invitation content
In `GuestPage.jsx`:
- On mount, fetch the single row from `invitation_content`
- Render all fields in clearly labelled placeholder sections (no design polish yet)
- Show a loading state while fetching

### T5 — Admin login page
In `AdminLoginPage.jsx`:
- Email + password form
- Call `supabase.auth.signInWithPassword()`
- On success, redirect to `/admin`
- Show inline error on failure

### T6 — Admin dashboard shell
In `AdminDashboard.jsx`:
- Show the authenticated user's email
- Logout button calling `supabase.auth.signOut()`
- Three empty tab/section placeholders: **Invite Keys**, **RSVPs**, **Edit Invitation**

---

## Out of Scope for Sprint 1
- Invite key generation UI (Sprint 2)
- RSVP form (Sprint 2)
- Invitation content editor (Sprint 3)
- Any visual design / Tailwind styling beyond basic readability

---

## Agent Prompt for Dev Team

> **Sprint 1 — Foundation & Database Schema**
>
> You are building a wedding invitation app (React + Vite + Supabase, Docker-only dev environment).
> Read `README.md` and `docs/sprint-1/plan.md` carefully before touching any code.
>
> Complete tasks T1–T6 in order. Stick strictly to the schema defined in the plan.
> - All Supabase calls go through `Frontend/src/lib/supabase.js` only.
> - Use functional React components and Tailwind CSS classes (basic utility classes are fine for layout).
> - Do not add any features not listed in this sprint.
> - After completing all tasks, verify the app runs with `docker compose up --build` and all success criteria are met.
> - Update `docs/sprint-1/progress.md` as you go, noting completed tasks and any blockers.
