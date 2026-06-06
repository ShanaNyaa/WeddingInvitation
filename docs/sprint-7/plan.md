# Sprint 7 Plan — UI Modernisation + Responsive Design

> **Goal:** Transform the guest page into a genuine digital wedding invitation, and make both the guest and admin pages fully usable on phones and tablets.
> **Date started:** 2026-06-07
> **Scope:** Frontend only — zero backend or DB changes.
> **Primary success metric:** Guest page looks and feels like a wedding invitation on a 375px phone screen.

---

## Motivation

Current state (post Sprint 6):
- Guest page is functional but aesthetically plain — generic sans-serif font, ISO date string, flat hero image block, no invitation "feel."
- Admin dashboard tables overflow on narrow screens; the header email crowds the logout button on mobile.
- Both pages were built for function first. Sprint 7 adds the experience layer on top of the working foundation.

---

## Out of Scope

- No backend changes, no new API endpoints.
- No new shadcn/ui components — all primitives are already installed.
- No hero image *upload* (that is backlog item C — a separate sprint).
- No third-party animation library (Framer Motion, etc.) — use CSS/Tailwind utilities only.
- No WhatsApp share button (backlog D).

---

## Task Breakdown

### T1 — Wedding Typography (Google Fonts)
**Files:** `Frontend/index.html`, `Frontend/src/index.css`

Import two Google Fonts via `<link>` in `index.html`:
- **`Great Vibes`** — cursive/script, used for the couple name only
- **`Playfair Display`** — elegant serif, used for section headings (`h2`, `.font-heading`) and the `<h1>` couple name fallback

Add Tailwind CSS custom font utilities in `index.css`:
```css
/* inside @layer base or @theme */
--font-script: 'Great Vibes', cursive;
--font-heading: 'Playfair Display', serif;
```
Expose as Tailwind utilities (`font-script`, `font-heading`) so they can be applied with class names.

**Success criteria:**
- Couple name renders in `Great Vibes` script font on both guest page and Edit Invitation preview.
- Section headings (Date & Time, Venue, Our Story) render in `Playfair Display`.
- No layout shift or FOUT on load (fonts are loaded in `<head>` blocking-style).

---

### T2 — Guest Page: Hero Image Redesign
**Files:** `Frontend/src/pages/GuestPage.tsx`

Replace the plain `<img>` block with a full-width hero section that includes:
- Image fills full width (break out of the `max-w-2xl` container — wrap in a negative-margin or full-bleed utility).
- Fixed aspect ratio: `aspect-[4/3]` on mobile, `aspect-[16/9]` on `sm:` and above.
- `object-cover` ensures the image never stretches.
- Gradient overlay at the bottom of the hero (`bg-gradient-to-t from-black/60 to-transparent`).
- Couple names and event date displayed as text **on top of** the hero overlay (replaces the standalone couple names section below).

Remove the separate "Couple" section (`<section>`) that previously sat below the hero since the couple name is now in the hero overlay.

**Success criteria:**
- Hero displays correctly at 375px, 768px, and 1280px.
- If `hero_image_url` is empty/null, the hero falls back to a styled placeholder (solid background using the theme's `muted` token, couple name still visible).
- Couple name and date text is readable in both light and dark mode over the overlay.

---

### T3 — Guest Page: Human-Readable Date Formatting
**Files:** `Frontend/src/pages/GuestPage.tsx`

The backend returns `event_date` as an ISO string (`2026-09-05`). Format it in the frontend:

```ts
// Example output: "Saturday, 5 September 2026"
new Intl.DateTimeFormat('en-MY', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kuala_Lumpur',
}).format(new Date(content.event_date + 'T00:00:00'))
```

Note: append `T00:00:00` before constructing the `Date` to prevent timezone offset from shifting the day.

**Success criteria:**
- Date displays as `Saturday, 5 September 2026` (or equivalent for the stored date).
- No timezone off-by-one — test with a date stored as `2026-09-05`.

---

### T4 — Guest Page: Invitation Card Layout Polish
**Files:** `Frontend/src/pages/GuestPage.tsx`, `Frontend/src/components/guest/RsvpSection.tsx`

Visual upgrades to the invitation body (below the hero):

1. **Decorative ornament** — Add a small centred ornament between the hero and the first section. Use a Unicode character (`✦` or `❧`) or a thin CSS rule with dots — no image asset required.
2. **Section heading style** — Apply `font-heading` (Playfair Display) to each section label (Date & Time, Venue, Our Story, RSVP). Increase label size from `text-xs` to `text-sm`. Remove all-caps (`uppercase`) — sentence case reads more elegantly.
3. **Generous spacing** — Increase vertical rhythm: `space-y-10` instead of `space-y-8`. Add more breathing room (`py-16`) on the outer container.
4. **RSVP section visual lift** — Wrap `RsvpSection` in a subtle bordered card (`border rounded-lg p-6 bg-card`) to visually separate it from the invitation text above.
5. **Max-width on desktop** — Keep `max-w-2xl` centred on desktop but add `sm:px-0 px-5` so mobile has tighter padding.

**Success criteria:**
- Page looks like a printed invitation card when scrolled on a phone.
- No layout shifts between mobile/desktop.

---

### T5 — Guest Page: Subtle Entrance Animations
**Files:** `Frontend/src/index.css`, `Frontend/src/pages/GuestPage.tsx`

Add a simple CSS fade-in + slide-up animation using `@keyframes` in `index.css`. Do NOT add any new npm package.

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}
```

Apply staggered delays to each section:
- Hero: no animation (loads immediately).
- Ornament + first section: `animation-delay: 0.1s`
- Second section: `animation-delay: 0.2s`
- Each subsequent section: add `0.1s` to delay.
- Max delay: `0.5s` — do not animate late enough that users miss content.

**Success criteria:**
- Sections fade in gracefully on page load.
- Animation does not run on re-renders (use `key` or no re-mount conditions).
- Respects `prefers-reduced-motion`: wrap keyframe in `@media (prefers-reduced-motion: no-preference)`.

---

### T6 — Admin Dashboard: Responsive Header
**Files:** `Frontend/src/pages/AdminDashboard.tsx`

On narrow screens the header currently shows: `Admin Dashboard | [email] [theme toggle] [logout]` — the email overflows on a 375px screen.

Changes:
- Hide email text below `sm:` breakpoint: add `hidden sm:inline` to the email `<span>`.
- Ensure the header items don't wrap — use `flex-shrink-0` on the action buttons.
- No other structural changes to the dashboard header.

**Success criteria:**
- Header fits cleanly on 375px without wrapping or horizontal overflow.
- Email is visible on 640px+ screens.

---

### T7 — Admin Dashboard: Responsive Tables
**Files:** `Frontend/src/components/admin/InviteKeysPanel.tsx`, `Frontend/src/components/admin/RsvpsPanel.tsx`

Wrap each `<Table>` (the shadcn `<Table>` component) in an `overflow-x-auto` `<div>`. This is the standard pattern for responsive tables without restructuring the table markup.

```tsx
<div className="overflow-x-auto rounded-lg border">
  <Table>…</Table>
</div>
```

Also: on `RsvpsPanel`, the inner guest table per family group should get the same treatment.

**Success criteria:**
- On a 375px viewport, both tables are horizontally scrollable — no content is clipped.
- Border radius and border are preserved around the scroll container.

---

### T8 — Admin Dashboard: Responsive Tabs
**Files:** `Frontend/src/pages/AdminDashboard.tsx`

The `<TabsList>` with three triggers ("Invite Keys", "RSVPs", "Edit Invitation") can overflow on a 375px screen.

Add `overflow-x-auto` and `w-full` to the `<TabsList>`:
```tsx
<TabsList className="mb-6 w-full overflow-x-auto">
```

Or make each trigger shrink equally with `flex-1` on the triggers if all three fit. Test which approach looks cleaner.

**Success criteria:**
- All three tab triggers are accessible on a 375px screen without horizontal page overflow.

---

## Priority Order

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P0 | T1 — Typography | Transforms the entire aesthetic | Low |
| P0 | T3 — Date formatting | Fixes an obvious UX problem | Very low |
| P1 | T2 — Hero redesign | Biggest visual transformation | Medium |
| P1 | T4 — Invitation layout polish | Brings the page together | Low-medium |
| P2 | T7 — Admin responsive tables | Functional fix for mobile admin | Low |
| P2 | T6 — Admin responsive header | Functional fix for mobile admin | Very low |
| P2 | T8 — Admin responsive tabs | Functional fix for mobile admin | Very low |
| P3 | T5 — Entrance animations | Delight detail | Low |

Start with T1 + T3 — they are the easiest and have the most impact on perceived quality. T2 follows, then T4. Admin responsive fixes (T6/T7/T8) are quick and can be batched together.

---

## Test Plan (Ivy / QA)

Test on four viewport widths using browser DevTools device simulation:

| Viewport | Device |
|----------|--------|
| 375px | iPhone SE / budget Android |
| 390px | iPhone 14 Pro |
| 768px | iPad (portrait) |
| 1280px | Desktop |

**Checklist per viewport:**
- [ ] Guest page hero displays correctly (no overflow, correct aspect ratio)
- [ ] Couple name renders in `Great Vibes` script
- [ ] Date shows in human-readable format (`Saturday, 5 September 2026`)
- [ ] All guest page sections visible with no horizontal overflow
- [ ] RSVP 3-step flow fully operable (enter key → confirm guests → done)
- [ ] Entrance animations play on first load; respect `prefers-reduced-motion`
- [ ] Admin header fits on 375px (email hidden)
- [ ] Admin tabs accessible on 375px
- [ ] Invite Keys table horizontally scrollable on 375px
- [ ] RSVPs table horizontally scrollable on 375px
- [ ] Light mode checked — all text readable on light background

**Edge cases:**
- Hero image with a very tall portrait aspect ratio (e.g. 1:2) — `object-cover` + `aspect-[4/3]` should crop it, not stretch.
- Hero image URL is empty/null — fallback placeholder visible, no broken `<img>` tag.
- Long couple name (>20 chars) — fits in hero overlay without overflow.

---

## Definition of Done

- [ ] All 8 tasks implemented and committed.
- [ ] No TypeScript errors (`tsc --noEmit` passes).
- [ ] No Tailwind class errors.
- [ ] QA checklist above fully green.
- [ ] `docs/sprint-7/progress.md` updated with final status.
- [ ] `PROJECT_BRIEF.md` sections 7 and 8 updated.
