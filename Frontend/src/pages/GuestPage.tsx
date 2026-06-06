import { useEffect, useState } from 'react'
import { api, InvitationContent } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import RsvpSection from '../components/guest/RsvpSection'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export default function GuestPage() {
  const [content, setContent] = useState<InvitationContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await api.getInvitation()
        setContent(data)
      } catch (err) {
        setError((err as Error).message)
      }
      setLoading(false)
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading invitation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load invitation: {error}</p>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="min-h-screen bg-background px-6 py-12 max-w-2xl mx-auto space-y-8">
      {/* Theme toggle */}
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hero image */}
      {content.hero_image_url && (
        <div className="w-full">
          <img
            src={content.hero_image_url}
            alt="Wedding hero"
            className="w-full rounded object-cover"
          />
        </div>
      )}

      {/* Couple names */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Couple</p>
        <h1 className="text-3xl font-light mt-1">{content.couple_names}</h1>
      </section>

      <Separator />

      {/* Date & time */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Date &amp; Time</p>
        <p className="text-lg mt-1">
          {content.event_date} &mdash; {content.event_time}
        </p>
      </section>

      <Separator />

      {/* Venue */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Venue</p>
        <p className="text-lg mt-1">{content.venue_name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{content.venue_address}</p>
      </section>

      {/* Story */}
      {content.story_blurb && (
        <>
          <Separator />
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Story</p>
            <p className="text-base mt-1 leading-relaxed">{content.story_blurb}</p>
          </section>
        </>
      )}

      <RsvpSection />
    </div>
  )
}
