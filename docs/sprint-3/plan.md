# Sprint 3 — Invitation Content Editor

**Goal:** Allow the admin to edit all invitation content fields live from the dashboard. The guest page reflects changes immediately on next load.

**Success Criteria:**
- [ ] Admin Dashboard → Edit Invitation tab shows a form pre-filled with current `invitation_content` values
- [ ] Admin can update any field and save — changes persist in Supabase
- [ ] Guest page reflects updated content on next load (no redeployment needed)
- [ ] Hero image previews when a valid URL is entered

---

## Tasks

### T1 — EditInvitationPanel component
Create `Frontend/src/components/admin/EditInvitationPanel.jsx`:

- On mount, fetch the single row from `invitation_content` (id = 1)
- Form fields:
  | Field | Input type | Notes |
  |-------|-----------|-------|
  | Couple Names | text | e.g. "Ali & Siti" |
  | Event Date | date | native date picker |
  | Event Time | text | e.g. "11:00 AM" |
  | Venue Name | text | |
  | Venue Address | textarea | |
  | Our Story | textarea | longer paragraph |
  | Hero Image URL | text | shows live preview below input |

- "Save Changes" button → `UPDATE invitation_content SET ... WHERE id = 1`
- Show success/error banner after save
- Hero image live preview: render `<img>` when the URL field is non-empty

### T2 — Wire into AdminDashboard
Replace the "Edit Invitation" tab placeholder in `AdminDashboard.jsx` with `<EditInvitationPanel />`.

---

## Out of Scope for Sprint 3
- Image file upload (URL-based is sufficient for now)
- Any visual redesign of the guest page
