# Sprint 7 Progress

**Status: ✅ Complete**
**Date completed: 2026-06-14**

---

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| T1 | Wedding Typography — Google Fonts trialled (Great Vibes + Playfair Display) then removed; Figtree used throughout | ✅ Done |
| T2 | Guest Page: Full-bleed hero with gradient overlay + couple name/date on top | ✅ Done |
| T3 | Guest Page: Human-readable date formatting via `Intl.DateTimeFormat` | ✅ Done |
| T4 | Guest Page: Layout polish — ✦ ornament, generous spacing, RSVP wrapped in `Card` | ✅ Done |
| T4b | RSVP attendee row: stacks vertically on mobile (375px) | ✅ Done |
| T5 | CSS `fadeInUp` entrance animations with staggered delays + `prefers-reduced-motion` | ✅ Done |
| T5b | Admin edit date/time row: stacks on mobile | ✅ Done |
| T6 | Admin header: email hidden below `sm:` breakpoint | ✅ Done |
| T7 | Admin RSVPs table: fixed overflow clipping | ✅ Done |
| T8 | Admin tabs: `w-full overflow-x-auto` on `TabsList` | ✅ Done |
| Post | Admin panels: modernised with shadcn `Card` + `CardHeader` + `CardTitle` | ✅ Done |
| Post | Admin Invite Keys: full-width card + inline form row on desktop | ✅ Done |
| Post | Admin RSVPs: two stat cards in `grid grid-cols-2`, centered text, shortened labels | ✅ Done |
| Post | Admin RSVPs: family groups as individual `Card` components with seat `Badge` | ✅ Done |
| Post | Edit Invitation: two-column grid on desktop; `max-h-96 object-contain` hero preview | ✅ Done |

---

## Files Changed

| File | Change |
|------|--------|
| `Frontend/index.html` | Google Fonts links added then removed |
| `Frontend/src/index.css` | `--font-script` removed; `--font-heading` → `var(--font-sans)`; `fadeInUp` keyframes added |
| `Frontend/src/pages/GuestPage.tsx` | Full rewrite: full-bleed hero, date formatting, ornament, staggered animations, RSVP Card |
| `Frontend/src/components/guest/RsvpSection.tsx` | Attendee row `flex-col sm:flex-row`; removed `border-t` and `font-heading` |
| `Frontend/src/components/admin/EditInvitationPanel.tsx` | Two-column desktop grid; `max-h-96 object-contain` preview |
| `Frontend/src/pages/AdminDashboard.tsx` | Email `hidden sm:inline`; `TabsList` `w-full overflow-x-auto` |
| `Frontend/src/components/admin/InviteKeysPanel.tsx` | Converted to `Card`; inline form row on desktop; table inside `Card` |
| `Frontend/src/components/admin/RsvpsPanel.tsx` | Stat grid cards (centered, shortened labels); family groups as `Card`; `Badge` for seat count |
| `PROJECT_BRIEF.md` | Sections 7 and 8 updated |

---

## Notes

- `tsc --noEmit` passes with zero errors throughout
- No new npm dependencies; no backend changes
- Google Fonts (Great Vibes, Playfair Display) were trialled and removed — Figtree is used throughout
- Hero falls back to `bg-muted` if `hero_image_url` is empty; couple name + date still visible in overlay
- All stat card labels shortened to single words ("Registered" / "Capacity") to prevent wrapping at 375px
