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

> ~~Implemented and then removed~~ — Google Fonts (Great Vibes + Playfair Display) were added and subsequently removed. The app uses the existing Figtree variable font throughout.

**Current state:** No custom Google Fonts. `--font-heading` resolves to `var(--font-sans)` (Figtree). Section labels use `text-sm text-muted-foreground`. Couple name uses `font-light tracking-wide`.

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

1. **Decorative ornament** — Add a small centred ornament between the hero and the first section. Two options:
   - **Unicode character** (`✦` or `❧`) centred in a `<p>` — no component needed.
   - **Separator line** — use the already-installed shadcn `<Separator>` component rather than a hand-rolled CSS rule: `<Separator className="my-6" />`.
   Do NOT write a custom CSS rule when `<Separator>` is already available.
2. **Section heading style** — Apply `font-heading` (Playfair Display) to each section label (Date & Time, Venue, Our Story, RSVP). Increase label size from `text-xs` to `text-sm`. Remove all-caps (`uppercase`) — sentence case reads more elegantly.
3. **Generous spacing** — Increase vertical rhythm: `space-y-10` instead of `space-y-8`. Add more breathing room (`py-16`) on the outer container.
4. **RSVP section visual lift** — Wrap `RsvpSection` in the already-installed shadcn `<Card>` + `<CardContent>` primitive to visually separate it from the invitation text above. Do NOT use raw `border rounded-lg p-6 bg-card` utility classes — use the component for consistency:
   ```tsx
   <Card>
     <CardContent className="p-6">
       <RsvpSection … />
     </CardContent>
   </Card>
   ```
5. **Max-width on desktop** — Keep `max-w-2xl` centred on desktop but add `sm:px-0 px-5` so mobile has tighter padding. The ~300px of blank space on either side at 1280px is **intentional** — this is the wedding invitation card aesthetic. Do not widen the content column.

**Success criteria:**
- Page looks like a printed invitation card when scrolled on a phone.
- No layout shifts between mobile/desktop.

---

### T4b — Guest RSVP: Responsive Attendee Row
**Files:** `Frontend/src/components/guest/RsvpSection.tsx`

`AttendeeRow` currently uses `flex gap-3 items-start` — placing Full Name and Phone Number side by side on **all** screen sizes. On a 375px screen both fields are ~160px wide; the Phone field is even tighter because of the `+60` prefix. This is the most-used mobile interaction on the entire site and it is the most broken at 375px.

Change the row layout to stack vertically on mobile:
```tsx
// Before
<div className="flex gap-3 items-start">

// After
<div className="flex flex-col sm:flex-row gap-3 items-start">
```

**Success criteria:**
- On 375px, Name field and Phone field each occupy full width, stacked vertically.
- On 640px+, they sit side by side as before.
- The `+60` prefix and phone input remain on the same row at all breakpoints (they are inside a single `flex` div that is not changed).

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

### T5b — Admin Edit Form: Responsive Date + Time Row
**Files:** `Frontend/src/components/admin/EditInvitationPanel.tsx`

The Event Date and Event Time inputs sit in a `flex gap-4` row at all screen sizes. On 375px, a native date picker and a text input side by side are uncomfortably narrow.

```tsx
// Before
<div className="flex gap-4">

// After
<div className="flex flex-col sm:flex-row gap-4">
```

**Success criteria:**
- On 375px, Date and Time inputs each occupy full width, stacked.
- On 640px+, they sit side by side as before.

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

**InviteKeysPanel** — the table wrapper already has `overflow-x-auto rounded-lg border`. Verify this is in place and do not double-wrap. No change needed unless it was removed.

**RsvpsPanel** — the per-family group container uses `overflow-hidden`, which **clips** table content instead of scrolling it. Replace `overflow-hidden` with `overflow-x-auto` on each family group wrapper:

```tsx
// Before
<div className="border rounded-lg overflow-hidden bg-card">

// After
<div className="border rounded-lg overflow-x-auto bg-card">
```

The inner `<Table>` does not need an additional wrapper — the fix is on the existing container.

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
| P1 | T4b — RSVP attendee row stacking | Critical UX fix — most-used mobile flow | Very low |
| P2 | T7 — Admin responsive tables | Functional fix for mobile admin | Low |
| P2 | T5b — Admin edit date/time row | Functional fix for mobile admin | Very low |
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
- [x] Guest page hero displays correctly (no overflow, correct aspect ratio)
- [x] Couple name renders with `font-light tracking-wide` (Google Fonts removed)
- [x] Date shows in human-readable format (`Saturday, 5 September 2026`)
- [x] All guest page sections visible with no horizontal overflow
- [x] RSVP attendee row stacks vertically on 375px (name + phone each full width)
- [x] RSVP 3-step flow fully operable (enter key → confirm guests → done)
- [x] Entrance animations play on first load; respect `prefers-reduced-motion`
- [x] Admin header fits on 375px (email hidden)
- [x] Admin tabs accessible on 375px
- [x] Invite Keys table horizontally scrollable on 375px
- [x] RSVPs table horizontally scrollable on 375px
- [x] Light mode checked — all text readable on light background

**Edge cases:**
- Hero image with a very tall portrait aspect ratio (e.g. 1:2) — `object-cover` + `aspect-[4/3]` should crop it, not stretch.
- Hero image URL is empty/null — fallback placeholder visible, no broken `<img>` tag.
- Long couple name (>20 chars) — fits in hero overlay without overflow.

---

## Definition of Done

- [x] All 10 tasks implemented and committed.
- [x] No TypeScript errors (`tsc --noEmit` passes).
- [x] No Tailwind class errors.
- [x] QA checklist above fully green.
- [x] `docs/sprint-7/progress.md` updated with final status.
- [x] `PROJECT_BRIEF.md` sections 7 and 8 updated.
