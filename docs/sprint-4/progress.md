# Sprint 4 — Progress

## Status: Complete

## Tasks

- [x] T1 — Backend scaffolding: `package.json`, `Dockerfile`, `index.js`, `lib/supabase.js`, `middleware/auth.js`
- [x] T2 — Public routes: `GET /api/invitation`, `POST /api/rsvp/validate`, `POST /api/rsvp/register`
- [x] T3 — Auth routes: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [x] T4 — Admin routes: keys CRUD, RSVPs, invitation content — all Bearer-protected
- [x] T5 — Frontend `api.js` client; all components migrated off Supabase SDK; SDK removed from `package.json`
- [x] T6 — `compose.yaml` updated (backend service, root `.env.local`, DNS fix)

## Decisions Made

- Port `8080` chosen for backend (matches the original placeholder in `compose.yaml`)
- `node --watch` used in the backend container for hot-reload during dev (no nodemon dependency)
- Docker DNS set explicitly to `8.8.8.8` / `8.8.4.4` — required on Windows because Docker's default resolver fails to reach external hostnames inside Alpine containers
- `ProtectedRoute` simplified to a synchronous `localStorage` check (`api.isLoggedIn()`) — no more async session loading spinner
- Admin JWT stored as `wedding_admin_token` + `wedding_admin_email` in `localStorage`; cleared automatically on any 401 response
- `keyUtils.js` kept in frontend (unused in prod flow) but key generation is now authoritative server-side only

## All Sprints

| Sprint | Status | Scope |
|--------|--------|-------|
| Sprint 1 | ✅ | DB schema, routing, page shells, Supabase Auth |
| Sprint 2 | ✅ | Invite key management, RSVP form with MY phone |
| Sprint 3 | ✅ | Invitation content editor |
| Sprint 4 | ✅ | Express backend API — frontend no longer hits DB directly |
