# PROJECT_BRIEF.md — WeddingInvitation

> Single source of truth. Update this file at the end of every session.
> Last updated: 2026-06-06

---

## 1. Project Overview

A private wedding invitation web app. Guests view the invitation and RSVP using a secret invite key issued by the couple. Each key is scoped to a family group with a fixed seat limit. The couple manages everything from a password-protected admin dashboard.

**Live at:** `http://localhost:5173` (Docker dev) — not yet deployed to production.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React.js (TypeScript / TSX) |
| Styling | Tailwind CSS v4 |
| API Client | `fetch`-based (`src/lib/api.ts`) |
| Backend API | Express.js (Node.js, port 8080) |
| Auth | Supabase Auth (proxied through backend) |
| Database | Supabase (PostgreSQL + RLS) + service role key |
| Containerization | Docker / Docker Compose |

**Docker-first:** No Node.js required on the host. All dev runs inside containers.

---

## 3. Repository Structure

```
WeddingInvitation/
├── compose.yaml
├── PROJECT_BRIEF.md          ← this file
├── README.md
├── docs/
│   ├── sprint-1/             plan.md, progress.md
│   ├── sprint-2/             plan.md, progress.md
│   ├── sprint-3/             plan.md, progress.md
│   ├── sprint-4/             plan.md, progress.md
│   ├── sprint-5/             plan.md, progress.md
│   └── sprint-6/             plan.md, progress.md
├── .env.local                ← not committed, see .env.local.example
├── .env.local.example
├── Backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js           ← Express entry (port 8080)
│   │   ├── lib/supabase.js    ← service-role Supabase client
│   │   ├── middleware/auth.js ← JWT Bearer auth middleware
│   │   └── routes/
│   │       ├── public.js      ← /api/invitation, /api/rsvp/*
│   │       ├── auth.js        ← /api/auth/*
│   │       └── admin.js       ← /api/admin/* (protected)
│   └── supabase/
│       └── migrations/
│           ├── 001_create_invitation_content.sql
│           ├── 002_create_invite_keys.sql
│           ├── 003_create_rsvp_guests.sql
│           ├── 004_rls_policies.sql
│           └── 005_seed_invitation_content.sql
└── Frontend/
    ├── Dockerfile
    ├── package.json
    ├── index.html              ← blocking script applies dark class before React mounts
    ├── components.json         ← shadcn/ui config (style: radix-maia, base: mauve, CSS vars)
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx             ← routing (BrowserRouter)
        ├── main.tsx
        ├── index.css           ← Tailwind v4 + shadcn CSS variable theme tokens
        ├── vite-env.d.ts       ← Vite env type declarations
        ├── hooks/
        │   └── useTheme.ts     ← dark/light toggle, reads localStorage, toggles `dark` on <html>
        ├── lib/
        │   ├── api.ts          ← ALL backend calls go through here (typed)
        │   └── keyUtils.ts     ← generateSecretKey() (now also in backend)
        ├── pages/
        │   ├── GuestPage.tsx
        │   ├── AdminLoginPage.tsx
        │   └── AdminDashboard.tsx
        └── components/
            ├── ProtectedRoute.tsx
            ├── ui/             ← shadcn/ui primitives (auto-generated, do not hand-edit)
            │   └── (button, input, label, card, badge, alert, alert-dialog,
            │      table, tabs, textarea, separator, sonner)
            ├── admin/
            │   ├── InviteKeysPanel.tsx
            │   ├── RsvpsPanel.tsx
            │   └── EditInvitationPanel.tsx
            └── guest/
                └── RsvpSection.tsx
```

---

## 4. Database Schema

### `invitation_content` (single-row, id = 1)
| Column | Type |
|--------|------|
| id | smallint PK (always 1) |
| couple_names | text |
| event_date | date |
| event_time | text |
| venue_name | text |
| venue_address | text |
| story_blurb | text |
| hero_image_url | text |
| updated_at | timestamptz (auto) |

### `invite_keys`
| Column | Type |
|--------|------|
| id | uuid PK |
| family_name | text |
| secret_key | text UNIQUE |
| seat_limit | smallint |
| seats_used | smallint |
| is_active | bool |
| created_at | timestamptz |

### `rsvp_guests`
| Column | Type |
|--------|------|
| id | uuid PK |
| invite_key_id | uuid FK → invite_keys |
| full_name | text |
| phone_number | text (+60XXXXXXXXX) |
| registered_at | timestamptz |

### RPC: `register_guests(p_invite_key_id uuid, p_guests jsonb)`
Atomic guest insert + seat counter increment. Raises `invalid_key` or `seats_exceeded` on failure. Callable by anon role.

---

## 5. Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | GuestPage | Public |
| `/admin/login` | AdminLoginPage | Public |
| `/admin` | AdminDashboard | Protected (Supabase session) |
| `*` | Redirect to `/` | — |

---

## 6. Key Conventions

- All backend calls go through `src/lib/api.ts` only — never `fetch` directly in components
- Frontend has zero Supabase dependency — no anon key exposed to the browser
- TypeScript strict mode enabled; all components in `.tsx`, all modules in `.ts`
- `@/*` path alias maps to `./src/*` — use for all internal imports when adding shadcn components
- Key generation happens server-side in `Backend/src/routes/admin.js`
- Functional components only — no class components
- Tailwind utility classes — no inline styles
- Phone validation regex: `^1[0-9]{8,9}$` (client-side display; server stores as `+60XXXXXXXXX`)
- Admin JWT stored in `localStorage` (`wedding_admin_token` + `wedding_admin_email`); cleared on logout or 401
- Admin account created once via Supabase dashboard → Authentication → Users
- Dark/light theme toggle on both guest page and admin dashboard; preference stored in `localStorage` (`wedding_theme`); `useTheme.ts` hook manages state; `index.html` blocking script prevents FOUC

---

## 7. Current State (as of 2026-06-06)

All sprints complete and verified end-to-end.

| Sprint | Scope | Status |
|--------|-------|--------|
| Sprint 1 | DB schema + RLS, routing skeleton, page shells, Supabase Auth | ✅ Done |
| Sprint 2 | Invite key management UI, RSVP form (3-step with MY phone) | ✅ Done |
| Sprint 3 | Invitation content editor (CMS-lite) in admin dashboard | ✅ Done |
| Sprint 4 | Express backend API — frontend no longer calls Supabase directly | ✅ Done |
| Sprint 5 | TypeScript migration + `@` path alias — prerequisite for shadcn/ui | ✅ Done |
| Sprint 6 | shadcn/ui integration (all panels) + dark/light theme toggle | ✅ Done |

The app is fully functional locally. Not yet deployed to a public host.

---

## 8. Potential Enhancements (Future Sprints)

Rough priority order — none committed yet:

| # | Enhancement | Notes |
|---|-------------|-------|
| A | **Production deployment** | Deploy frontend (Vercel/Netlify) + backend (Railway/Render/Fly.io); point to live Supabase project |
| B | **Wedding aesthetic polish** | Custom fonts, hero animations, colour palette — shadcn/ui primitives are in place as the foundation |
| C | **Hero image upload** | Replace URL input with direct file upload to Supabase Storage |
| D | **WhatsApp share button** | One-tap share of invite key + invitation link for each family row |
| E | **RSVP edit / cancellation** | Allow guests to update or cancel registration before a cutoff date |
| F | **Admin export** | Download full RSVP list as CSV |
| G | **Multiple events** | Support more than one wedding event (e.g. nikah + reception) with separate RSVP flows |
| H | **Dietary / notes field** | Add optional dietary preference or notes field to RSVP form |
| I | **Email confirmation** | Send guest a confirmation email via Supabase Edge Function + Resend |
| J | **Seat count on guest page** | Show "X people coming so far" social proof counter on the invitation page |

---

## 9. How to Resume in a New Session

1. Read this file (`PROJECT_BRIEF.md`) — sections 1–7 for context, section 8 for backlog
2. Run `docker compose up` to start the dev server
3. Pick an enhancement from section 8, create `docs/sprint-N/plan.md`, and build
