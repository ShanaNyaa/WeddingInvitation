import { useEffect, useState } from 'react'
import { api, InvitationContent } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import RsvpSection from '../components/guest/RsvpSection'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(new Date(isoDate + 'T00:00:00'))
}

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

  const formattedDate = content.event_date ? formatDate(content.event_date) : ''

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — full bleed */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-muted">
        {content.hero_image_url ? (
          <img
            src={content.hero_image_url}
            alt="Wedding hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Theme toggle — top right */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-white hover:text-white hover:bg-white/20"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        {/* Couple name + date in overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
          <h1 className="text-5xl sm:text-6xl font-light tracking-wide leading-tight drop-shadow-md">
            {content.couple_names}
          </h1>
          {formattedDate && (
            <p className="text-sm sm:text-base mt-2 opacity-90 drop-shadow tracking-wide">
              {formattedDate}
            </p>
          )}
        </div>
      </div>

      {/* Invitation content */}
      <div className="max-w-2xl mx-auto px-5 sm:px-0 py-16 space-y-10">
        {/* Decorative ornament */}
        <p className="text-center text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          ✦
        </p>

        {/* Date & Time */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm text-muted-foreground">Date &amp; Time</p>
          <p className="text-lg mt-1">
            {formattedDate} &mdash; {content.event_time}
          </p>
        </section>

        <Separator />

        {/* Venue */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-muted-foreground">Venue</p>
          <p className="text-lg mt-1">{content.venue_name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{content.venue_address}</p>
        </section>

        {/* Our Story */}
        {content.story_blurb && (
          <>
            <Separator />
            <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm text-muted-foreground">Our Story</p>
              <p className="text-base mt-1 leading-relaxed">{content.story_blurb}</p>
            </section>
          </>
        )}

        {/* RSVP */}
        <div className="animate-fade-in-up" style={{ animationDelay: content.story_blurb ? '0.4s' : '0.3s' }}>
          <Card>
            <CardContent className="p-6">
              <RsvpSection />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
