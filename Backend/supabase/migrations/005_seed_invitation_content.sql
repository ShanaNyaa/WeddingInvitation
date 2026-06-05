-- Seed the single row for invitation_content.
-- Uses INSERT ... ON CONFLICT so it is safe to re-run.
INSERT INTO invitation_content (
  id,
  couple_names,
  event_date,
  event_time,
  venue_name,
  venue_address,
  story_blurb,
  hero_image_url
) VALUES (
  1,
  'Groom & Bride',
  '2026-12-31',
  '11:00 AM',
  'Venue Name',
  'Venue Address, City, State',
  'A short story about the couple goes here.',
  ''
)
ON CONFLICT (id) DO NOTHING;
