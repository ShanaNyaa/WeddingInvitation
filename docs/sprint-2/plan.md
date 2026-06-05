# Sprint 2 — Invite Key Management & RSVP Form

**Goal:** Complete the two core user flows: admin generates/manages invite keys, guests validate a key and register their family.

**Success Criteria:**
- [ ] Admin can create an invite key (family name + seat limit → generates unique key string)
- [ ] Admin can see all keys in a table (family name, key, seat limit, seats used, status)
- [ ] Admin can delete a key (with confirmation)
- [ ] Admin can regenerate a key (new secret string, same family/seat limit, old key invalidated)
- [ ] Guest can enter a key on the RSVP section — invalid/inactive keys are rejected with a clear message
- [ ] On valid key, guest sees remaining seats and a form to add attendees (name + MY phone per person)
- [ ] Submitting RSVP inserts rows into `rsvp_guests` and increments `seats_used` on `invite_keys`
- [ ] If all seats are filled, the key is marked exhausted and further registration is blocked

---

## Tasks

### T1 — Key generation utility
Create `Frontend/src/lib/keyUtils.js`:
- `generateSecretKey(familyName)` — produces a short unique string, e.g. `FAM-X7K2`
  - Format: 3-letter prefix from family name (uppercased, non-alpha stripped) + `-` + 4 random alphanumeric chars
  - Example: "Family Ahmad" → `FAM-A3X9`

### T2 — Invite Keys tab (Admin Dashboard)
Replace the placeholder in `AdminDashboard.jsx` Invite Keys tab with a full `InviteKeysPanel` component at `Frontend/src/components/admin/InviteKeysPanel.jsx`:

**Create key form (top of panel):**
- Family name input (text, required)
- Seat limit input (number, min 1, required)
- "Generate Key" button → inserts into `invite_keys`, shows the new key in a success banner so admin can copy it

**Keys table:**
| Family | Secret Key | Seats | Status | Actions |
|--------|-----------|-------|--------|---------|
| Family A | FAM-X7K2 | 2 / 3 | Active | Regenerate · Delete |

- Seats shown as `seats_used / seat_limit`
- Status: "Active" (green) or "Exhausted" (gray, when seats_used >= seat_limit) or "Revoked" (red, when is_active = false)
- **Delete**: show a confirm dialog before deleting; deleting a key cascades and removes all associated `rsvp_guests`
- **Regenerate**: generates a new secret_key string for the same row (UPDATE), resets `seats_used` to 0, sets `is_active` to true — show new key in a banner

### T3 — RSVP form (Guest Page)
Replace the RSVP placeholder in `GuestPage.jsx` with a multi-step RSVP flow component at `Frontend/src/components/guest/RsvpSection.jsx`:

**Step 1 — Key validation:**
- Single input: "Enter your invite key"
- On submit: query `invite_keys` where `secret_key = input AND is_active = true`
- Error states: key not found, key exhausted (seats_used >= seat_limit), key inactive
- On success: advance to Step 2

**Step 2 — Attendee registration:**
- Show: "Registering under [Family Name] — [X] seat(s) remaining"
- Dynamic list of attendee rows (start with 1, "Add another person" button up to seat limit):
  - Full name (text, required)
  - Phone number (text, required) — fixed `+60` prefix, user enters rest
    - Validation: matches `/^(\+60)(1[0-9]{8,9})$/` (MY mobile)
    - Display hint: e.g. `+60 12-3456789`
- "Confirm RSVP" button:
  1. Validate all fields
  2. Check remaining seats server-side (re-fetch to guard against race conditions)
  3. Insert all attendee rows into `rsvp_guests`
  4. `UPDATE invite_keys SET seats_used = seats_used + N WHERE id = key_id`
  5. Advance to Step 3

**Step 3 — Confirmation:**
- "You're on the list! 🎉" message
- Show list of registered names
- No back button (registration is final)

### T4 — RSVPs tab (Admin Dashboard)
Replace the RSVPs placeholder with `RsvpsPanel` at `Frontend/src/components/admin/RsvpsPanel.jsx`:
- Table grouped by family (invite key), showing each registered guest's name, phone, and registration time
- Shows total registered count vs total seat capacity at the top

---

## Database Notes

No new migrations needed. Sprint 2 uses existing tables.

The `seats_used` increment in T3 Step 2 must use a Supabase RPC (stored function) to avoid race conditions. Add this function via the Supabase SQL editor:

```sql
CREATE OR REPLACE FUNCTION register_guests(
  p_invite_key_id uuid,
  p_guests jsonb  -- array of {full_name, phone_number}
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat_limit  smallint;
  v_seats_used  smallint;
  v_new_count   smallint;
BEGIN
  -- Lock the row
  SELECT seat_limit, seats_used
    INTO v_seat_limit, v_seats_used
    FROM invite_keys
   WHERE id = p_invite_key_id AND is_active = true
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_key';
  END IF;

  v_new_count := v_seats_used + jsonb_array_length(p_guests);

  IF v_new_count > v_seat_limit THEN
    RAISE EXCEPTION 'seats_exceeded';
  END IF;

  -- Insert guests
  INSERT INTO rsvp_guests (invite_key_id, full_name, phone_number)
  SELECT p_invite_key_id,
         (g->>'full_name'),
         (g->>'phone_number')
    FROM jsonb_array_elements(p_guests) AS g;

  -- Update seat count
  UPDATE invite_keys
     SET seats_used = v_new_count
   WHERE id = p_invite_key_id;
END;
$$;

-- Allow anon to call this function
GRANT EXECUTE ON FUNCTION register_guests(uuid, jsonb) TO anon;
```

---

## Out of Scope for Sprint 2
- Invitation content editor (Sprint 3)
- Any visual design polish beyond functional Tailwind layout
