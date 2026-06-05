import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const EMPTY = {
  couple_names: '',
  event_date: '',
  event_time: '',
  venue_name: '',
  venue_address: '',
  story_blurb: '',
  hero_image_url: '',
}

export default function EditInvitationPanel() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState(null) // { type: 'success'|'error', message }

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await api.getAdminInvitation()
        setForm({
          couple_names: data.couple_names ?? '',
          event_date: data.event_date ?? '',
          event_time: data.event_time ?? '',
          venue_name: data.venue_name ?? '',
          venue_address: data.venue_address ?? '',
          story_blurb: data.story_blurb ?? '',
          hero_image_url: data.hero_image_url ?? '',
        })
      } catch (_) {}
      setLoading(false)
    }
    fetchContent()
  }, [])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function showBanner(type, message) {
    setBanner({ type, message })
    setTimeout(() => setBanner(null), 5000)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateInvitation({
        couple_names: form.couple_names.trim(),
        event_date: form.event_date || null,
        event_time: form.event_time.trim(),
        venue_name: form.venue_name.trim(),
        venue_address: form.venue_address.trim(),
        story_blurb: form.story_blurb.trim(),
        hero_image_url: form.hero_image_url.trim(),
      })
      showBanner('success', 'Invitation updated successfully.')
    } catch (err) {
      showBanner('error', err.message)
    }
    setSaving(false)
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading content…</p>
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl">
      {/* Hero image preview */}
      {form.hero_image_url && (
        <div className="w-full rounded overflow-hidden border border-gray-200">
          <img
            src={form.hero_image_url}
            alt="Hero preview"
            className="w-full max-h-60 object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      <Field label="Hero Image URL">
        <input
          type="text"
          value={form.hero_image_url}
          onChange={(e) => set('hero_image_url', e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">Paste any public image URL. Preview updates live.</p>
      </Field>

      <Field label="Couple Names">
        <input
          type="text"
          required
          value={form.couple_names}
          onChange={(e) => set('couple_names', e.target.value)}
          placeholder="e.g. Ali & Siti"
          className={inputClass}
        />
      </Field>

      <div className="flex gap-4">
        <Field label="Event Date" className="flex-1">
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => set('event_date', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Event Time" className="flex-1">
          <input
            type="text"
            value={form.event_time}
            onChange={(e) => set('event_time', e.target.value)}
            placeholder="e.g. 11:00 AM"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Venue Name">
        <input
          type="text"
          value={form.venue_name}
          onChange={(e) => set('venue_name', e.target.value)}
          placeholder="e.g. Dewan Serbaguna"
          className={inputClass}
        />
      </Field>

      <Field label="Venue Address">
        <textarea
          rows={2}
          value={form.venue_address}
          onChange={(e) => set('venue_address', e.target.value)}
          placeholder="Full address"
          className={inputClass}
        />
      </Field>

      <Field label="Our Story">
        <textarea
          rows={4}
          value={form.story_blurb}
          onChange={(e) => set('story_blurb', e.target.value)}
          placeholder="A short paragraph about the couple…"
          className={inputClass}
        />
      </Field>

      {banner && (
        <div className={`rounded px-4 py-3 text-sm ${
          banner.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {banner.message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-gray-800 text-white text-sm px-5 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}
