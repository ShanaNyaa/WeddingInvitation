# Sprint 5 — TypeScript Migration + shadcn/ui Prerequisites

**Goal:** Convert the entire frontend from JavaScript (JSX) to TypeScript (TSX), add the `@` path alias, and establish the configuration required to install shadcn/ui in the next sprint.

**Success Criteria:**
- [x] All `.jsx` files renamed to `.tsx`, all `.js` lib files renamed to `.ts`
- [x] `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` created with strict mode
- [x] `@/*` path alias configured in both `tsconfig.json` and `vite.config.ts`
- [x] `@types/node` and `typescript` added to devDependencies
- [x] Build script updated to `tsc -b && vite build`
- [x] API interfaces exported from `api.ts` (`InvitationContent`, `InviteKey`, `RsvpGroup`, etc.)
- [x] All components properly typed (props, state, event handlers)
- [x] Old `.jsx`/`.js` source files deleted

---

## Tasks

### T1 — Tooling setup
- `tsconfig.json` — project references + `@/*` alias
- `tsconfig.app.json` — strict TS for `src/`, `jsx: react-jsx`, `@/*` alias
- `tsconfig.node.json` — strict TS for `vite.config.ts`
- `vite.config.ts` — replaces `vite.config.js`; adds `resolve.alias` for `@`
- `package.json` — add `typescript ^5.5.3`, `@types/node ^22.0.0`; update build script

### T2 — Source file conversion
Rename every source file and add minimal TypeScript types:
| Old | New | Key changes |
|-----|-----|-------------|
| `main.jsx` | `main.tsx` | Non-null assertion on `getElementById` |
| `App.jsx` | `App.tsx` | No changes needed |
| `lib/api.js` | `lib/api.ts` | Exported interfaces; generic `request<T>` |
| `lib/keyUtils.js` | `lib/keyUtils.ts` | Parameter + return type |
| `lib/supabase.js` | `lib/supabase.ts` | Cast env vars to string |
| `pages/GuestPage.jsx` | `pages/GuestPage.tsx` | Typed state, null guard |
| `pages/AdminLoginPage.jsx` | `pages/AdminLoginPage.tsx` | Typed form event |
| `pages/AdminDashboard.jsx` | `pages/AdminDashboard.tsx` | `as const` tabs, typed state |
| `components/ProtectedRoute.jsx` | `components/ProtectedRoute.tsx` | `{ children: ReactNode }` |
| `components/admin/InviteKeysPanel.jsx` | `components/admin/InviteKeysPanel.tsx` | `Banner` type, typed handlers |
| `components/admin/RsvpsPanel.jsx` | `components/admin/RsvpsPanel.tsx` | Typed groups/totals state |
| `components/admin/EditInvitationPanel.jsx` | `components/admin/EditInvitationPanel.tsx` | `FormState`/`Banner` types |
| `components/guest/RsvpSection.jsx` | `components/guest/RsvpSection.tsx` | `Attendee` type, typed handlers |

### T3 — Cleanup
- Delete all old `.jsx` and `.js` source files
- Update `index.html` to reference `/src/main.tsx`
- Add `src/vite-env.d.ts` with `/// <reference types="vite/client" />`
