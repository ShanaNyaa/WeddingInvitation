import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

function generateSecretKey(familyName) {
  const prefix = familyName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X')

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  const array = new Uint8Array(4)
  crypto.getRandomValues(array)
  for (const byte of array) {
    suffix += chars[byte % chars.length]
  }

  return `${prefix}-${suffix}`
}

// GET /api/admin/keys
router.get('/keys', async (req, res) => {
  const { data, error } = await supabase
    .from('invite_keys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: 'Failed to load keys' })
  res.json(data)
})

// POST /api/admin/keys
router.post('/keys', async (req, res) => {
  const { family_name, seat_limit } = req.body
  if (!family_name || !seat_limit) {
    return res.status(400).json({ error: 'family_name and seat_limit are required' })
  }

  const limit = parseInt(seat_limit, 10)
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: 'seat_limit must be a positive integer' })
  }

  const secret = generateSecretKey(family_name.trim())

  const { error } = await supabase.from('invite_keys').insert({
    family_name: family_name.trim(),
    secret_key: secret,
    seat_limit: limit,
  })

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ secret_key: secret })
})

// PUT /api/admin/keys/:id/regenerate
router.put('/keys/:id/regenerate', async (req, res) => {
  const { data: key, error: fetchError } = await supabase
    .from('invite_keys')
    .select('family_name')
    .eq('id', req.params.id)
    .single()

  if (fetchError || !key) return res.status(404).json({ error: 'Key not found' })

  const newSecret = generateSecretKey(key.family_name)

  const { error } = await supabase
    .from('invite_keys')
    .update({ secret_key: newSecret, seats_used: 0, is_active: true })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ secret_key: newSecret })
})

// DELETE /api/admin/keys/:id
router.delete('/keys/:id', async (req, res) => {
  const { error } = await supabase.from('invite_keys').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// GET /api/admin/rsvps
router.get('/rsvps', async (req, res) => {
  const { data: keys, error: keysError } = await supabase
    .from('invite_keys')
    .select('id, family_name, seat_limit, seats_used')
    .order('created_at', { ascending: false })

  const { data: guests, error: guestsError } = await supabase
    .from('rsvp_guests')
    .select('id, invite_key_id, full_name, phone_number, registered_at')
    .order('registered_at', { ascending: true })

  if (keysError || guestsError) return res.status(500).json({ error: 'Failed to load RSVPs' })

  const groups = keys.map((k) => ({
    key: k,
    guests: guests.filter((g) => g.invite_key_id === k.id),
  }))

  res.json({
    groups,
    totals: {
      registered: guests.length,
      capacity: keys.reduce((sum, k) => sum + k.seat_limit, 0),
    },
  })
})

// GET /api/admin/invitation
router.get('/invitation', async (req, res) => {
  const { data, error } = await supabase
    .from('invitation_content')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) return res.status(500).json({ error: 'Failed to load invitation content' })
  res.json(data)
})

// PUT /api/admin/invitation
router.put('/invitation', async (req, res) => {
  const { couple_names, event_date, event_time, venue_name, venue_address, story_blurb, hero_image_url } = req.body

  const { error } = await supabase
    .from('invitation_content')
    .update({
      couple_names: couple_names?.trim(),
      event_date: event_date || null,
      event_time: event_time?.trim(),
      venue_name: venue_name?.trim(),
      venue_address: venue_address?.trim(),
      story_blurb: story_blurb?.trim(),
      hero_image_url: hero_image_url?.trim(),
    })
    .eq('id', 1)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
