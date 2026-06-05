CREATE TABLE IF NOT EXISTS invite_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  secret_key  text NOT NULL UNIQUE,
  seat_limit  smallint NOT NULL CHECK (seat_limit > 0),
  seats_used  smallint NOT NULL DEFAULT 0 CHECK (seats_used >= 0),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
