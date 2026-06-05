const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export interface InvitationContent {
  couple_names: string
  event_date: string
  event_time: string
  venue_name: string
  venue_address: string
  story_blurb: string | null
  hero_image_url: string | null
}

export interface InviteKey {
  id: string
  family_name: string
  secret_key: string
  seat_limit: number
  seats_used: number
  is_active: boolean
  created_at: string
  seats_remaining: number
}

export interface RsvpGuest {
  id: string
  full_name: string
  phone_number: string
  registered_at: string
}

export interface RsvpGroup {
  key: InviteKey
  guests: RsvpGuest[]
}

export interface RsvpTotals {
  registered: number
  capacity: number
}

function getToken(): string | null {
  return localStorage.getItem('wedding_admin_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('wedding_admin_token')
    localStorage.removeItem('wedding_admin_email')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

export const api = {
  // Public
  getInvitation: () => request<InvitationContent>('/api/invitation'),
  validateKey: (secret_key: string) =>
    request<InviteKey>('/api/rsvp/validate', { method: 'POST', body: JSON.stringify({ secret_key }) }),
  registerGuests: (invite_key_id: string, guests: { full_name: string; phone: string }[]) =>
    request<void>('/api/rsvp/register', { method: 'POST', body: JSON.stringify({ invite_key_id, guests }) }),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; email: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ email: string }>('/api/auth/me'),

  // Admin — invite keys
  getKeys: () => request<InviteKey[]>('/api/admin/keys'),
  createKey: (family_name: string, seat_limit: number) =>
    request<InviteKey>('/api/admin/keys', { method: 'POST', body: JSON.stringify({ family_name, seat_limit }) }),
  regenerateKey: (id: string) =>
    request<InviteKey>(`/api/admin/keys/${id}/regenerate`, { method: 'PUT' }),
  deleteKey: (id: string) =>
    request<void>(`/api/admin/keys/${id}`, { method: 'DELETE' }),

  // Admin — RSVPs
  getRsvps: () => request<{ groups: RsvpGroup[]; totals: RsvpTotals }>('/api/admin/rsvps'),

  // Admin — invitation content
  getAdminInvitation: () => request<InvitationContent>('/api/admin/invitation'),
  updateInvitation: (fields: Partial<InvitationContent>) =>
    request<void>('/api/admin/invitation', { method: 'PUT', body: JSON.stringify(fields) }),

  // Session helpers
  saveSession: (token: string, email: string): void => {
    localStorage.setItem('wedding_admin_token', token)
    localStorage.setItem('wedding_admin_email', email)
  },
  clearSession: (): void => {
    localStorage.removeItem('wedding_admin_token')
    localStorage.removeItem('wedding_admin_email')
  },
  getEmail: (): string | null => localStorage.getItem('wedding_admin_email'),
  isLoggedIn: (): boolean => !!localStorage.getItem('wedding_admin_token'),
}
