const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('wedding_admin_token')
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('wedding_admin_token')
    localStorage.removeItem('wedding_admin_email')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Public
  getInvitation: () => request('/api/invitation'),
  validateKey: (secret_key) =>
    request('/api/rsvp/validate', { method: 'POST', body: JSON.stringify({ secret_key }) }),
  registerGuests: (invite_key_id, guests) =>
    request('/api/rsvp/register', { method: 'POST', body: JSON.stringify({ invite_key_id, guests }) }),

  // Auth
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  // Admin — invite keys
  getKeys: () => request('/api/admin/keys'),
  createKey: (family_name, seat_limit) =>
    request('/api/admin/keys', { method: 'POST', body: JSON.stringify({ family_name, seat_limit }) }),
  regenerateKey: (id) =>
    request(`/api/admin/keys/${id}/regenerate`, { method: 'PUT' }),
  deleteKey: (id) =>
    request(`/api/admin/keys/${id}`, { method: 'DELETE' }),

  // Admin — RSVPs
  getRsvps: () => request('/api/admin/rsvps'),

  // Admin — invitation content
  getAdminInvitation: () => request('/api/admin/invitation'),
  updateInvitation: (fields) =>
    request('/api/admin/invitation', { method: 'PUT', body: JSON.stringify(fields) }),

  // Session helpers
  saveSession: (token, email) => {
    localStorage.setItem('wedding_admin_token', token)
    localStorage.setItem('wedding_admin_email', email)
  },
  clearSession: () => {
    localStorage.removeItem('wedding_admin_token')
    localStorage.removeItem('wedding_admin_email')
  },
  getEmail: () => localStorage.getItem('wedding_admin_email'),
  isLoggedIn: () => !!localStorage.getItem('wedding_admin_token'),
}
