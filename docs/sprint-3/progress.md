# Sprint 3 — Progress

## Status: Complete

## Tasks

- [x] T1 — `EditInvitationPanel` — form pre-filled from Supabase, all fields editable, hero image live preview, save with success/error banner
- [x] T2 — Wired into `AdminDashboard` Edit Invitation tab

## Decisions Made

- `event_date` stored as `null` if cleared (nullable date column)
- Hero image `<img>` has an `onError` handler so a broken URL doesn't break the layout
- All text fields trimmed before saving

## All Sprints Complete

| Sprint | Status | Scope |
|--------|--------|-------|
| Sprint 1 | ✅ | DB schema, routing, page shells, Supabase auth |
| Sprint 2 | ✅ | Invite key management, RSVP form with MY phone |
| Sprint 3 | ✅ | Invitation content editor |
