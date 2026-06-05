import { Router } from 'express'
import supabase from '../lib/supabase.js'

const router = Router()

const PHONE_REGEX = /^1[0-9]{8,9}$/

// GET /api/invitation
router.get('/invitation', async (req, res) => {
  const { data, error } = await supabase
    .from('invitation_content')
    .select('couple_names,event_date,event_time,venue_name,venue_address,story_blurb,hero_image_url')
    .eq('id', 1)
    .single()

  if (error) return res.status(500).json({ error: 'Failed to load invitation' })
  res.json(data)
})

// POST /api/rsvp/validate
router.post('/rsvp/validate', async (req, res) => {
  const { secret_key } = req.body
  if (!secret_key || typeof secret_key !== 'string') {
    return res.status(400).json({ error: 'secret_key is required' })
  }

  const { data, error } = await supabase
    .from('invite_keys')
    .select('id, family_name, seat_limit, seats_used')
    .eq('secret_key', secret_key.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Invalid key. Please check the key you received and try again.' })
  }

  if (data.seats_used >= data.seat_limit) {
    return res.status(409).json({ error: 'This key has no remaining seats. Please contact the couple.' })
  }

  res.json({
    id: data.id,
    family_name: data.family_name,
    seats_remaining: data.seat_limit - data.seats_used,
  })
})

// POST /api/rsvp/register
router.post('/rsvp/register', async (req, res) => {
  const { invite_key_id, guests } = req.body

  if (!invite_key_id || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'invite_key_id and guests array are required' })
  }

  for (const guest of guests) {
    if (!guest.full_name || typeof guest.full_name !== 'string' || !guest.full_name.trim()) {
      return res.status(400).json({ error: 'Each guest must have a full_name' })
    }
    if (!PHONE_REGEX.test(guest.phone)) {
      return res.status(400).json({ error: 'Invalid Malaysian phone number' })
    }
  }

  const formattedGuests = guests.map((g) => ({
    full_name: g.full_name.trim(),
    phone_number: `+60${g.phone}`,
  }))

  const { error } = await supabase.rpc('register_guests', {
    p_invite_key_id: invite_key_id,
    p_guests: formattedGuests,
  })

  if (error) {
    if (error.message.includes('seats_exceeded')) {
      return res.status(409).json({ error: 'Not enough seats remaining for all the people you added. Please reduce the number of attendees.' })
    }
    if (error.message.includes('invalid_key')) {
      return res.status(404).json({ error: 'This key is no longer valid. Please contact the couple.' })
    }
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }

  res.json({ success: true })
})

export default router
