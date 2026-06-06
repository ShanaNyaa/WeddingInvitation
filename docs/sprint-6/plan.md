# Sprint 6 Plan — shadcn/ui Integration + Dark Theme

> **Goal:** Replace all hand-rolled Tailwind UI primitives with shadcn/ui components and add a fully functional dark/light theme toggle.
> **Date started:** 2026-06-06
> **Prerequisites:** Sprint 5 complete — TypeScript strict mode, `@/` alias, and `components.json` all verified. `Button` component already installed.

---

## Context

`components.json` is configured with:
- Style: `radix-maia`
- Base colour: `mauve` (warm neutral — suitable for a wedding aesthetic)
- CSS variables: enabled (dark mode ready)
- Icon library: `lucide`

`Button` (`@/components/ui/button.tsx`) is the only shadcn component installed so far. Everything else is still plain Tailwind.

---

## Task Breakdown

### Task 1 — Install missing shadcn/ui components

Run `npx shadcn add <component>` inside the `Frontend/` directory (or via Docker) for each component below. These are the only ones needed to cover the existing UI:

| Component | Used in |
|-----------|---------|
| `input` | AdminLoginPage, InviteKeysPanel, EditInvitationPanel, RsvpSection |
| `label` | AdminLoginPage, InviteKeysPanel, EditInvitationPanel, RsvpSection |
| `card` | AdminLoginPage (login box), GuestPage (info sections) |
| `badge` | InviteKeysPanel (key status: Active / Revoked / Exhausted) |
| `alert` | InviteKeysPanel (success/error banner), RsvpSection (error states) |
| `alert-dialog` | InviteKeysPanel (delete confirmation modal) |
| `table` | InviteKeysPanel (keys list), RsvpsPanel (RSVP list) |
| `tabs` | AdminDashboard (Invite Keys / RSVPs / Edit Invitation) |
| `textarea` | EditInvitationPanel (story_blurb field) |
| `separator` | GuestPage (section dividers) |
| `sonner` | InviteKeysPanel + EditInvitationPanel (replaces inline banner state with toast) |

> **Install command (run once per component):**
> ```bash
> cd Frontend && npx shadcn add input label card badge alert alert-dialog table tabs textarea separator sonner
> ```

---

### Task 2 — Convert `AdminLoginPage.tsx`

**Replace:**
- Raw `<div>` login card → `<Card>`, `<CardHeader>`, `<CardContent>`
- Raw `<label>` / `<input>` pairs → `<Label>` + `<Input>` from shadcn
- Raw `<button>` → `<Button>` (variant `default`, full width)
- Inline error `<p>` → keep as-is (small, no component needed)

---

### Task 3 — Convert `AdminDashboard.tsx`

**Replace:**
- Manual tab `<button>` row → shadcn `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
- Logout button → `<Button variant="ghost">` with `LogOut` lucide icon
- Add `<Toaster />` (from sonner) once at the top level so all panels can call `toast()`

---

### Task 4 — Convert `InviteKeysPanel.tsx`

**Replace:**
- `<input>` fields → `<Input>` + `<Label>`
- Create button → `<Button>`
- Inline success/error banner state → `toast.success()` / `toast.error()` (sonner)
- Keys list → `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`
- Status text → `<Badge>` with variant mapping: Active → `default`, Revoked → `destructive`, Exhausted → `secondary`
- Regenerate button → `<Button variant="outline" size="sm">`
- Delete confirmation inline pattern → `<AlertDialog>` with `<AlertDialogTrigger>`, `<AlertDialogContent>`, `<AlertDialogAction>`, `<AlertDialogCancel>`

---

### Task 5 — Convert `RsvpsPanel.tsx`

**Replace:**
- RSVP list → `<Table>` with grouped rows per invite key
- Loading / empty states → keep as text, wrap in appropriate container

---

### Task 6 — Convert `EditInvitationPanel.tsx`

**Replace:**
- All `<input>` fields → `<Input>` + `<Label>`
- `story_blurb` textarea → `<Textarea>` + `<Label>`
- Save button → `<Button>`
- Inline success/error feedback → `toast.success()` / `toast.error()` (sonner)

---

### Task 7 — Convert `RsvpSection.tsx` (guest RSVP form)

**Replace:**
- Key input + submit button → `<Input>` + `<Button>`
- Error message → `<Alert variant="destructive">` with `<AlertDescription>`
- Attendee rows: name and phone `<input>` fields → `<Input>` + `<Label>`
- Phone prefix `+60` span → keep as-is (inline adornment pattern)
- Phone error message → inline text (no component change needed)
- Submit button → `<Button>`
- Confirmation screen → `<Card>` with `<CardContent>`

---

### Task 8 — Convert `GuestPage.tsx`

**Replace:**
- Couple names / event details section → `<Card>` or styled `<div>` (keep it light — this is the public-facing wedding page)
- Section dividers → `<Separator>`
- Loading/error states → keep as text
- No heavy component changes here; the bigger visual overhaul is a future sprint (visual polish)

---

### Task 9 — Dark theme toggle

**Approach:** CSS variable–based dark mode (already wired by shadcn's `cssVariables: true`). Toggle class `dark` on `<html>`.

**Steps:**
1. Confirm `index.css` has shadcn's `:root` and `.dark` CSS variable blocks (added automatically by shadcn install).
2. Create `Frontend/src/hooks/useTheme.ts` — a small hook that:
   - Reads initial theme from `localStorage` (`wedding_theme`) or system preference (`prefers-color-scheme`)
   - Applies/removes `dark` class on `document.documentElement`
   - Exposes `{ theme, toggleTheme }`
3. Add a theme toggle `<Button variant="ghost" size="icon">` to the `AdminDashboard` header (Sun / Moon lucide icons).
4. Add the same toggle to `GuestPage` header area so guests also benefit.
5. Persist choice to `localStorage` so it survives page refresh.

> **No new dependency required** — Tailwind v4 + shadcn CSS variables handle all theming.

---

## Component Install Order (recommended)

Install all at once to avoid multiple Docker rebuilds:

```bash
npx shadcn add input label card badge alert alert-dialog table tabs textarea separator sonner
```

Then convert files in this order (lowest risk → highest):
1. `AdminLoginPage.tsx` — isolated page, easy to verify
2. `AdminDashboard.tsx` — tabs + toast setup
3. `InviteKeysPanel.tsx` — most components, most risk
4. `RsvpsPanel.tsx` — table only
5. `EditInvitationPanel.tsx` — straightforward form
6. `RsvpSection.tsx` — guest-facing, needs care
7. `GuestPage.tsx` — lightest changes
8. `useTheme.ts` + theme toggle buttons

---

## Success Criteria

- [ ] All 10 shadcn components install without errors (`components.json` unchanged, no TS errors)
- [ ] Admin login page renders with `Card` layout, `Input`, `Label`, `Button`
- [ ] Admin dashboard uses `Tabs` — all three panels still work
- [ ] InviteKeysPanel: `Table` renders all keys; `Badge` shows correct status; `AlertDialog` fires on delete; `toast` replaces banner
- [ ] RsvpsPanel: `Table` renders grouped RSVPs
- [ ] EditInvitationPanel: form saves and `toast.success` fires
- [ ] RsvpSection: 3-step flow completes end-to-end; `Alert` shows on key error
- [ ] GuestPage: `Separator` and `Card` render correctly
- [ ] Dark mode toggles correctly on both Admin and Guest pages; preference persists after refresh
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No regression in existing functionality (RSVP flow, key management, content editing)

---

## Out of Scope (deferred to Sprint 7)

- Full wedding visual design polish (typography, hero image, colour palette, animations)
- Hero image upload to Supabase Storage
- Production deployment

---

## Agent Prompt (for dev team chat)

```
Sprint 6 is ready. Context: WeddingInvitation is a Vite + React + TypeScript app styled with Tailwind v4.
shadcn/ui is installed (components.json present, Button already added).

Your task has three parts:

PART 1 — Install components
Run this inside Frontend/:
  npx shadcn add input label card badge alert alert-dialog table tabs textarea separator sonner
Verify no TS errors before moving on.

PART 2 — Convert all existing components
Follow the task list in docs/sprint-6/plan.md (Tasks 2–8).
Key rules:
- All backend calls stay in src/lib/api.ts — do not move any fetch logic
- Use @/ imports for all shadcn components
- Replace all raw <input>, <button>, <label>, <table> elements with their shadcn equivalents
- Replace inline banner state (setBanner) in InviteKeysPanel and EditInvitationPanel with sonner toast()
- Place <Toaster /> once in AdminDashboard.tsx

PART 3 — Dark theme
1. Create src/hooks/useTheme.ts (reads localStorage 'wedding_theme' or system preference, toggles 'dark' class on <html>)
2. Add a Sun/Moon toggle Button (variant="ghost" size="icon") to AdminDashboard header and GuestPage
3. Persist theme choice to localStorage

Success criteria are listed in docs/sprint-6/plan.md.
Run tsc --noEmit after all changes and fix any errors before marking done.
```
