import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type FormState = {
  couple_names: string
  event_date: string
  event_time: string
  venue_name: string
  venue_address: string
  story_blurb: string
  hero_image_url: string
}

const EMPTY: FormState = {
  couple_names: '',
  event_date: '',
  event_time: '',
  venue_name: '',
  venue_address: '',
  story_blurb: '',
  hero_image_url: '',
}

export default function EditInvitationPanel() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateInvitation({
        couple_names: form.couple_names.trim(),
        event_date: form.event_date || undefined,
        event_time: form.event_time.trim(),
        venue_name: form.venue_name.trim(),
        venue_address: form.venue_address.trim(),
        story_blurb: form.story_blurb.trim(),
        hero_image_url: form.hero_image_url.trim(),
      })
      toast.success('Invitation updated successfully.')
    } catch (err) {
      toast.error((err as Error).message)
    }
    setSaving(false)
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading content…</p>
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl">
      {/* Hero image preview */}
      {form.hero_image_url && (
        <div className="w-full rounded-lg overflow-hidden border">
          <img
            src={form.hero_image_url}
            alt="Hero preview"
            className="w-full max-h-60 object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="hero-image-url">Hero Image URL</Label>
        <Input
          id="hero-image-url"
          type="text"
          value={form.hero_image_url}
          onChange={(e) => set('hero_image_url', e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
        <p className="text-xs text-muted-foreground">Paste any public image URL. Preview updates live.</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="couple-names">Couple Names</Label>
        <Input
          id="couple-names"
          type="text"
          required
          value={form.couple_names}
          onChange={(e) => set('couple_names', e.target.value)}
          placeholder="e.g. Ali & Siti"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="event-date">Event Date</Label>
          <Input
            id="event-date"
            type="date"
            value={form.event_date}
            onChange={(e) => set('event_date', e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="event-time">Event Time</Label>
          <Input
            id="event-time"
            type="text"
            value={form.event_time}
            onChange={(e) => set('event_time', e.target.value)}
            placeholder="e.g. 11:00 AM"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="venue-name">Venue Name</Label>
        <Input
          id="venue-name"
          type="text"
          value={form.venue_name}
          onChange={(e) => set('venue_name', e.target.value)}
          placeholder="e.g. Dewan Serbaguna"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="venue-address">Venue Address</Label>
        <Textarea
          id="venue-address"
          rows={2}
          value={form.venue_address}
          onChange={(e) => set('venue_address', e.target.value)}
          placeholder="Full address"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="story-blurb">Our Story</Label>
        <Textarea
          id="story-blurb"
          rows={4}
          value={form.story_blurb}
          onChange={(e) => set('story_blurb', e.target.value)}
          placeholder="A short paragraph about the couple…"
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
