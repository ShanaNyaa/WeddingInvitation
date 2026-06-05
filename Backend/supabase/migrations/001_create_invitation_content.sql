CREATE TABLE IF NOT EXISTS invitation_content (
  id          smallint PRIMARY KEY DEFAULT 1,
  couple_names  text NOT NULL DEFAULT '',
  event_date    date,
  event_time    text NOT NULL DEFAULT '',
  venue_name    text NOT NULL DEFAULT '',
  venue_address text NOT NULL DEFAULT '',
  story_blurb   text NOT NULL DEFAULT '',
  hero_image_url text NOT NULL DEFAULT '',
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invitation_content_updated_at
  BEFORE UPDATE ON invitation_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
