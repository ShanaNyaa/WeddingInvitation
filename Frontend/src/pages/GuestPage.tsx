import { useEffect, useState } from 'react'
import { api, InvitationContent } from '../lib/api'
import RsvpSection from '../components/guest/RsvpSection'

export default function GuestPage() {
  const [content, setContent] = useState<InvitationContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <p className="text-gray-500">Loading invitation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load invitation: {error}</p>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-2xl mx-auto space-y-8">
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
        <p className="text-xs uppercase tracking-widest text-gray-400">Couple</p>
        <h1 className="text-3xl font-light text-gray-800 mt-1">{content.couple_names}</h1>
      </section>

      {/* Date & time */}
      <section>
        <p className="text-xs uppercase tracking-widest text-gray-400">Date &amp; Time</p>
        <p className="text-lg text-gray-700 mt-1">
          {content.event_date} &mdash; {content.event_time}
        </p>
      </section>

      {/* Venue */}
      <section>
        <p className="text-xs uppercase tracking-widest text-gray-400">Venue</p>
        <p className="text-lg text-gray-700 mt-1">{content.venue_name}</p>
        <p className="text-sm text-gray-500 mt-0.5">{content.venue_address}</p>
      </section>

      {/* Story */}
      {content.story_blurb && (
        <section>
          <p className="text-xs uppercase tracking-widest text-gray-400">Our Story</p>
          <p className="text-base text-gray-700 mt-1 leading-relaxed">{content.story_blurb}</p>
        </section>
      )}

      <RsvpSection />
    </div>
  )
}
