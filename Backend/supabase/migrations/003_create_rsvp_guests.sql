CREATE TABLE IF NOT EXISTS rsvp_guests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_key_id   uuid NOT NULL REFERENCES invite_keys(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  phone_number    text NOT NULL,
  registered_at   timestamptz NOT NULL DEFAULT now()
);
