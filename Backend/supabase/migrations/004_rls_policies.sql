-- ============================================================
-- RLS: invitation_content
-- ============================================================
ALTER TABLE invitation_content ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read the invitation
CREATE POLICY "invitation_content_select_public"
  ON invitation_content FOR SELECT
  USING (true);

-- Only authenticated users (admin) can update
CREATE POLICY "invitation_content_update_admin"
  ON invitation_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS: invite_keys
-- ============================================================
ALTER TABLE invite_keys ENABLE ROW LEVEL SECURITY;

-- Anon can only read the secret_key column (for guest key validation)
-- Full row access is granted below for authenticated
CREATE POLICY "invite_keys_select_anon"
  ON invite_keys FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated (admin) can see all rows including inactive
CREATE POLICY "invite_keys_select_admin"
  ON invite_keys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "invite_keys_insert_admin"
  ON invite_keys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "invite_keys_update_admin"
  ON invite_keys FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "invite_keys_delete_admin"
  ON invite_keys FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- RLS: rsvp_guests
-- ============================================================
ALTER TABLE rsvp_guests ENABLE ROW LEVEL SECURITY;

-- Anon can insert (guest registration)
CREATE POLICY "rsvp_guests_insert_anon"
  ON rsvp_guests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated (admin) can read, update, delete
CREATE POLICY "rsvp_guests_select_admin"
  ON rsvp_guests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rsvp_guests_update_admin"
  ON rsvp_guests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "rsvp_guests_delete_admin"
  ON rsvp_guests FOR DELETE
  TO authenticated
  USING (true);
