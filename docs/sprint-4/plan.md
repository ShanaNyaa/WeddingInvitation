# Sprint 4 — Express Backend API

**Goal:** Introduce an Express.js backend so the frontend no longer calls Supabase directly. All DB access is proxied through the backend using the service-role key, removing any Supabase credentials from the browser.

**Success Criteria:**
- [x] Express API running in its own Docker container (port 8080)
- [x] Frontend calls `api.js` exclusively — zero Supabase SDK usage in frontend code
- [x] Public endpoints: invitation content, RSVP key validation, guest registration
- [x] Auth endpoints: login, logout, me (Supabase Auth proxied)
- [x] Admin endpoints: invite keys CRUD, RSVPs, invitation content — all protected by Bearer JWT
- [x] Key generation moved server-side — never exposed to the browser
- [x] Root `.env.local` holds all secrets; only `VITE_API_URL` reaches the browser

---

## Tasks

### T1 — Backend scaffolding
- `Backend/package.json` — Express + cors + @supabase/supabase-js
- `Backend/Dockerfile` — node:lts-alpine, port 8080, `node --watch` for HMR
- `Backend/src/index.js` — Express app, CORS restricted to `localhost:5173`
- `Backend/src/lib/supabase.js` — service-role Supabase client (reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- `Backend/src/middleware/auth.js` — `requireAuth` middleware: validates Bearer JWT via `supabase.auth.getUser(token)`

### T2 — Public routes (`Backend/src/routes/public.js`)
| Endpoint | Description |
|----------|-------------|
| `GET /api/invitation` | Returns public invitation fields (no secrets) |
| `POST /api/rsvp/validate` | Validates secret key → `{ id, family_name, seats_remaining }` |
| `POST /api/rsvp/register` | Calls `register_guests` RPC; validates phone server-side |

### T3 — Auth routes (`Backend/src/routes/auth.js`)
| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | `signInWithPassword` → `{ token, email }` |
| `POST /api/auth/logout` | Signs out user (Bearer required) |
| `GET /api/auth/me` | Returns `{ email }` for a valid token |

### T4 — Admin routes (`Backend/src/routes/admin.js`)
All protected by `requireAuth`. Key generation (`XXX-XXXX` format) moved here using `crypto.getRandomValues`.

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/keys` | List all invite keys |
| `POST /api/admin/keys` | Create key (server generates secret) |
| `PUT /api/admin/keys/:id/regenerate` | Issue new secret, reset seats_used |
| `DELETE /api/admin/keys/:id` | Delete key |
| `GET /api/admin/rsvps` | All guests grouped by key + totals |
| `GET /api/admin/invitation` | Full invitation row |
| `PUT /api/admin/invitation` | Update invitation fields |

### T5 — Frontend API client (`Frontend/src/lib/api.js`)
Single `fetch`-based module replacing all direct Supabase calls:
- `request()` helper: attaches Bearer token, handles 401 auto-logout
- `api.saveSession()` / `api.clearSession()` — manage JWT in `localStorage`
- All components updated: `GuestPage`, `RsvpSection`, `AdminLoginPage`, `AdminDashboard`, `InviteKeysPanel`, `RsvpsPanel`, `EditInvitationPanel`, `ProtectedRoute`
- `@supabase/supabase-js` removed from `Frontend/package.json`

### T6 — Compose + env
- `compose.yaml`: backend service added (port 8080), DNS set to `8.8.8.8`/`8.8.4.4` to fix Docker container DNS resolution
- `.env.local` moved from `Frontend/` to project root; shared by both services
- Env vars: `VITE_API_URL=http://localhost:8080`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Out of Scope for Sprint 4
- Rate limiting / request throttling
- HTTPS / TLS (handled at deployment layer)
- Input sanitisation beyond phone regex and trim (DB constraints cover the rest)
