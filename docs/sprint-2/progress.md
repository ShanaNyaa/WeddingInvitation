# Sprint 2 — Progress

## Status: Complete

## Tasks

- [x] T1 — `keyUtils.js` — `generateSecretKey()` using `crypto.getRandomValues` (no Math.random)
- [x] T2 — `InviteKeysPanel` — create key form, keys table, regenerate, delete with confirm dialog
- [x] T3 — `RsvpSection` — 3-step flow: key validation → attendee form (MY phone) → confirmation
- [x] T4 — `RsvpsPanel` — grouped by family, total registered vs capacity summary

## Decisions Made

- Phone validation regex `^1[0-9]{8,9}$` applied client-side; `+60` prefix fixed in UI and prepended before storing
- `register_guests` RPC handles atomic seat increment + guest insert (race condition safe)
- Key input auto-uppercased in the RSVP form so guests don't need to worry about case
- Regenerating a key resets `seats_used` to 0 and reactivates `is_active = true` to support last-minute seat adjustments

## Up Next (Sprint 3)

- Invitation content editor in Admin Dashboard → Edit Invitation tab
- Admin can update couple names, date, time, venue, story, hero image URL live from the dashboard
