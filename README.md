# WeddingInvitation

A private wedding invitation web application built with React + Vite and Supabase. Guests RSVP using a secret invite key issued by the couple (admin). Each key is scoped to a named family group with a fixed seat limit.

---

## How It Works

### Two Roles

| Role | Access |
|------|--------|
| **Admin** (the couple) | Supabase-authenticated dashboard to manage invite keys, view RSVPs, and edit invitation content |
| **Guest** (invited families) | Public invitation page with RSVP form gated behind a secret key |

---

### Admin Flow

1. Navigate to `/admin` and log in with a Supabase-managed account (email + password).
2. **Manage invite keys:**
   - Create a key for a family group — enter family name and seat limit; the system generates a short random key (e.g. `FAM-X7K2`)
   - Share the key externally (WhatsApp, email, etc.)
   - Delete or regenerate a key at any time, even after it has been partially or fully used (e.g. to accommodate last-minute seat changes)
3. **Monitor RSVPs** — view all registered guests grouped by family key, with seat usage at a glance.
4. **Edit invitation content** — update all text (couple names, date, venue, story, etc.) and images directly from the dashboard; the guest-facing page reflects changes immediately.

---

### Guest Flow

1. Open the invitation page — the full invitation content (date, venue, story, etc.) is visible to everyone.
2. Scroll to the **RSVP** section at the bottom.
3. Enter the secret key received from the couple.
4. The system validates the key and shows how many seats remain for that family.
5. Fill in the details for each attending family member (up to the seat limit):
   - Full name
   - Malaysian phone number (formatted: `+60` prefix, validated format)
6. Submit — registration is confirmed and the seats are marked as used.

---

### Invite Key Rules

- Each key is tied to exactly one family group with a fixed seat limit.
- Once all seats under a key are filled, the key is exhausted and no further registrations are accepted.
- The admin can **delete or regenerate** a key at any time — including after it has been used — to handle last-minute seat adjustments or access issues.
- Regenerating a key issues a new secret string for the same family group; the old key immediately becomes invalid.
- A single person counts as one seat; the family member who holds the key registers themselves plus any additional attendees up to the limit.

---

### Invitation Content (CMS-lite)

- The guest-facing page has a **fixed skeleton** (layout, sections, placeholder image slots).
- All editable fields (couple names, event date, venue name & address, story blurb, hero image URL, etc.) are stored in a Supabase table and fetched at runtime.
- The admin dashboard exposes a simple form to update any of these fields — no redeployment needed.

---

### Phone Number Format

- RSVP form accepts **Malaysian mobile numbers only**.
- Input is validated against the pattern `+60 1X-XXXXXXXX` (Maxis, Celcom, Digi, U Mobile, etc.).
- The `+60` country code prefix is fixed in the UI; the user enters the remaining digits.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React.js (TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend API | Express.js (Node.js) |
| Auth | Supabase Auth (proxied through backend) |
| Database | Supabase (PostgreSQL + RLS) |
| Containerization | Docker / Docker Compose |

---

## Running the Project

> Docker Desktop is the only local dependency required.

```bash
# First run or after Dockerfile / package.json changes
docker compose up --build

# Subsequent runs
docker compose up

# Full reset (clears node_modules volumes)
docker compose down -v && docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`

---

## Environment Variables

Create `.env.local` in the project root (never commit this file — copy from `.env.local.example`):

```env
# Frontend — exposed to the browser (Vite)
VITE_API_URL=http://localhost:8080

# Backend — server-side only, never sent to the browser
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> `SUPABASE_SERVICE_ROLE_KEY` is the legacy `service_role` JWT from Supabase → API Keys. It bypasses RLS — keep it secret.
> Admin credentials are managed entirely through Supabase Auth — no password env var needed.
> Create the admin account once via the Supabase dashboard (Authentication → Users → Create new user).