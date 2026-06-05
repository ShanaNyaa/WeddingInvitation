import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  res.json({
    token: data.session.access_token,
    email: data.user.email,
  })
})

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  await supabase.auth.admin.signOut(req.user.id)
  res.json({ success: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ email: req.user.email })
})

export default router
