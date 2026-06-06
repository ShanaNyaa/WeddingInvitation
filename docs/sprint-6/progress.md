# Sprint 6 Progress

## Status: Complete ✅

---

## Part 1 — Component Installation

All 11 shadcn/ui components installed in one pass:
`input label card badge alert alert-dialog table tabs textarea separator sonner`

Button was skipped (already present). No errors.

---

## Part 2 — Component Conversions

| File | Changes |
|------|---------|
| `AdminLoginPage.tsx` | `Card`/`CardHeader`/`CardContent`, `Label`, `Input`, `Button` |
| `AdminDashboard.tsx` | `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Button` with `LogOut` icon, `<Toaster />` |
| `InviteKeysPanel.tsx` | `Input`+`Label`, `Button`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`, `Badge` (Active/Revoked/Exhausted), `AlertDialog` for delete, `toast.success`/`toast.error` (banner state removed) |
| `RsvpsPanel.tsx` | `Table` for grouped RSVP lists, `Separator` between totals |
| `EditInvitationPanel.tsx` | `Input`+`Label`, `Textarea`, `Button`, `toast` (banner state removed), removed `Field` helper and `inputClass` constant |
| `RsvpSection.tsx` | `Input`+`Label`, `Button`, `Alert`+`AlertDescription` for errors, `Card`+`CardContent` for confirmation step |
| `GuestPage.tsx` | `Separator` between sections, theme toggle `Button`, `text-muted-foreground`/`text-destructive` semantic colours |

---

## Part 3 — Dark Theme

- Created `src/hooks/useTheme.ts` — reads `localStorage('wedding_theme')` or system `prefers-color-scheme`, toggles `dark` class on `<html>`, exposes `{ theme, toggleTheme }`
- Added Sun/Moon toggle (`Button variant="ghost" size="icon"`) to `AdminDashboard` header and `GuestPage`
- Inline script in `index.html` applies `dark` class before React mounts (prevents FOUC)
- Theme persists across page refresh via `localStorage`

---

## TypeScript

`tsc --noEmit` — **0 errors** (verified twice: after conversions and after theme changes)

---

## Notes / Decisions

- Removed `Banner` type, `banner` state, and `showBanner()` helper from `InviteKeysPanel` and `EditInvitationPanel` — replaced entirely with sonner `toast.success`/`toast.error`
- Removed the `Field` component and `inputClass` constant from `EditInvitationPanel` — shadcn `Label`+`Input` inline pattern is cleaner
- `AdminDashboard` now uses `Tabs` value `"invite-keys"` as default — no separate `activeTab` state needed
- `<Toaster />` placed once at the top of `AdminDashboard` so all admin panels share it; guest page doesn't need it (no toasts on guest side)
- `index.html` blocking script prevents dark-mode flash on page load
