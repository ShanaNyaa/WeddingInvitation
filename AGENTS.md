# WeddingInvitation — Project Guidelines

> For full context, backlog, and DB schema details see `PROJECT_BRIEF.md`.

## Overview

A private wedding invitation web app. Guests view the invitation and RSVP using a secret invite key issued by the couple (admin). Each key is scoped to a family group with a fixed seat limit. The couple manages everything from a Supabase-authenticated admin dashboard.

**Two roles:**
- **Admin** (`/admin`) — Supabase Auth login; manages invite keys, views RSVPs, edits invitation content
- **Guest** (`/`) — public invitation page with a 3-step RSVP flow gated behind a secret key

## Architecture

| Layer | Technology | Folder |
|-------|-----------|--------|
| Frontend | Vite + React.js (TypeScript) | `Frontend/` |
| Routing | React Router v6 | `Frontend/src/App.tsx` |
| Styling | Tailwind CSS v4 | `Frontend/src/` |
| API Client | `fetch`-based (`api.ts`) | `Frontend/src/lib/api.ts` |
| Auth | Supabase Auth (proxied through backend) | `Backend/src/routes/auth.js` |
| Backend API | Express.js (Node.js) | `Backend/src/` |
| Backend / Database | Supabase (PostgreSQL + RLS) + service role key | `Backend/` |
| Containerization | Docker / Docker Compose | root `compose.yaml` |

## Folder Structure

```
WeddingInvitation/
├── compose.yaml
├── PROJECT_BRIEF.md          # full spec, DB schema, enhancement backlog
├── AGENTS.md                 # this file — auto-loaded every session
├── docs/
│   ├── sprint-1/             # DB schema, routing, auth shells
│   ├── sprint-2/             # Invite key UI, RSVP form
│   ├── sprint-3/             # Invitation content editor
│   ├── sprint-4/             # Express backend API
│   ├── sprint-5/             # TypeScript migration + Tailwind v4 + shadcn prerequisites
│   └── sprint-6/             # shadcn/ui integration + dark/light theme toggle
├── .env.local                 # VITE_API_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (never commit)
├── .env.local.example
├── Backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js           # Express app entry point (port 8080)
│   │   ├── lib/supabase.js    # Service-role Supabase client
│   │   ├── middleware/auth.js # JWT Bearer middleware
│   │   └── routes/
│   │       ├── public.js      # /api/invitation, /api/rsvp/*
│   │       ├── auth.js        # /api/auth/*
│   │       └── admin.js       # /api/admin/* (all protected)
│   └── supabase/migrations/  # 001–005 SQL files (run once in Supabase SQL editor)
└── Frontend/
    ├── Dockerfile
    ├── index.html             # includes blocking script to apply dark class before React mounts
    ├── components.json        # shadcn/ui config (style: radix-maia, base: mauve, CSS vars)
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx            # BrowserRouter + Routes
        ├── index.css          # Tailwind v4 + shadcn CSS variable theme tokens
        ├── vite-env.d.ts      # Vite env type declarations
        ├── hooks/
        │   └── useTheme.ts    # dark/light toggle — reads localStorage, toggles `dark` on <html>
        ├── lib/
        │   ├── api.ts             # ← ALL backend calls go through here only (typed)
        │   └── keyUtils.ts        # generateSecretKey() (now also in backend)
        ├── pages/
        │   ├── GuestPage.tsx
        │   ├── AdminLoginPage.tsx
        │   └── AdminDashboard.tsx
        └── components/
            ├── ProtectedRoute.tsx
            ├── ui/                # shadcn/ui primitives (auto-generated, do not hand-edit)
            │   └── (button, input, label, card, badge, alert, alert-dialog,
            │      table, tabs, textarea, separator, sonner)
            ├── admin/
            │   ├── InviteKeysPanel.tsx
            │   ├── RsvpsPanel.tsx
            │   └── EditInvitationPanel.tsx
            └── guest/
                └── RsvpSection.tsx
```

## Backend API (Express)

Base URL: `http://localhost:8080` (dev) — set via `VITE_API_URL` in `.env.local`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/invitation` | Public | Fetch invitation content |
| POST | `/api/rsvp/validate` | Public | Validate invite key → `{ id, family_name, seats_remaining }` |
| POST | `/api/rsvp/register` | Public | Register guests (calls DB RPC) |
| POST | `/api/auth/login` | Public | Supabase sign-in → `{ token, email }` |
| POST | `/api/auth/logout` | Bearer | Sign out |
| GET | `/api/auth/me` | Bearer | Verify token, return email |
| GET | `/api/admin/keys` | Bearer | List invite keys |
| POST | `/api/admin/keys` | Bearer | Create key (generates secret server-side) |
| PUT | `/api/admin/keys/:id/regenerate` | Bearer | Regenerate secret |
| DELETE | `/api/admin/keys/:id` | Bearer | Delete key |
| GET | `/api/admin/rsvps` | Bearer | All RSVPs grouped by key |
| GET | `/api/admin/invitation` | Bearer | Get invitation content |
| PUT | `/api/admin/invitation` | Bearer | Update invitation content |

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | GuestPage | Public |
| `/admin/login` | AdminLoginPage | Public |
| `/admin` | AdminDashboard | Protected — redirects to `/admin/login` if no session |
| `*` | Redirect to `/` | — |

## Database (Supabase)

Three tables with RLS enabled. See `PROJECT_BRIEF.md` section 4 for full column list.

- **`invitation_content`** — single row (id=1); all editable fields for the guest page
- **`invite_keys`** — one row per family group (family_name, secret_key, seat_limit, seats_used, is_active)
- **`rsvp_guests`** — one row per registered attendee (invite_key_id FK, full_name, phone_number)
- **RPC `register_guests(uuid, jsonb)`** — atomic guest insert + seat counter; callable by anon role

## Current State (2026-06-06)

All sprints complete and verified end-to-end. App is fully functional locally, not yet deployed.

| Sprint | Scope | Status |
|--------|-------|--------|
| 1 | DB schema + RLS, routing, page shells, Supabase Auth | ✅ Done |
| 2 | Invite key management UI, RSVP form with Malaysian phone validation | ✅ Done |
| 3 | Invitation content editor (CMS-lite) in admin dashboard | ✅ Done |
| 4 | Express backend API — frontend no longer calls Supabase directly | ✅ Done |
| 5 | TypeScript migration + Tailwind v4 + `@` alias — shadcn/ui prerequisites | ✅ Done |
| 6 | shadcn/ui integration (all panels converted) + dark/light theme toggle | ✅ Done |

**Next priorities** (see `PROJECT_BRIEF.md` section 8 for full backlog):
1. Production deployment (Vercel/Netlify + live Supabase)
2. Hero image upload to Supabase Storage
3. Wedding aesthetic polish (custom fonts, animations)

## Code Style

- Functional components only — no class components
- Tailwind CSS utility classes — no inline styles
- React Router `<Routes>` / `<Route>` — no `window.location` manipulation
- All backend calls in `src/lib/api.ts` only — never use `fetch` directly in components
- TypeScript strict mode — all components in `.tsx`, all modules in `.ts`
- `@/*` path alias maps to `./src/*` — use for all internal imports (required for shadcn/ui)
- Key generation happens server-side in `Backend/src/routes/admin.js`
- Phone validation: `^1[0-9]{8,9}$` client-side display; server validates before storing as `+60XXXXXXXXX`
- Admin JWT stored in `localStorage` (`wedding_admin_token` + `wedding_admin_email`); cleared on logout or 401

## Build & Dev

> **Docker-first**: Docker Desktop is the only dependency to **run** the app. Run `npm install` inside `Frontend/` only to get VS Code IntelliSense (does not affect the running containers).

```bash
# First run or after package.json changes
docker compose up --build

# Subsequent runs
docker compose up

# Clear node_modules volume and full rebuild (e.g. after adding a new dependency)
docker compose down -v && docker compose up --build

# Stop
docker compose down
```

App runs at `http://localhost:5173` with Vite HMR via volume mount.

## Conventions

- `VITE_` prefix required for all frontend env vars (only these reach the browser)
- `.env.local` (root) — never committed; copy from `.env.local.example`
- `SUPABASE_SERVICE_ROLE_KEY` is the legacy `service_role` JWT from Supabase → API Keys — backend only, never frontend
- Admin account created once in Supabase dashboard → Authentication → Users → Create new user
- New npm dependencies: add to `package.json`, then run `docker compose down -v && docker compose up --build`
- New SQL changes: run in Supabase SQL editor and save as a new migration file in `Backend/supabase/migrations/`

## Security

- Never expose the Supabase service-role key on the frontend
- RLS is enabled on all three tables — anon role has minimum required permissions only
- Validate all user inputs at the database level (constraints, RPC logic), not only in the UI
