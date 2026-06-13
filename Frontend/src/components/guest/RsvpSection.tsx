import { useState } from 'react'
import { api, InviteKey } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

const MY_PHONE_REGEX = /^1[0-9]{8,9}$/

type Attendee = { name: string; phone: string }

function AttendeeRow({
  index,
  value,
  onChange,
}: {
  index: number
  value: Attendee
  onChange: (updated: Attendee) => void
}) {
  const phoneError =
    value.phone && !MY_PHONE_REGEX.test(value.phone)
      ? 'Enter a valid Malaysian mobile number (e.g. 123456789)'
      : null

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="flex-1 space-y-1">
        <Label>Full Name {index === 0 ? '(you)' : ''}</Label>
        <Input
          type="text"
          required
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Full name"
        />
      </div>
      <div className="flex-1 space-y-1">
        <Label>Phone Number</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l bg-muted text-sm text-muted-foreground">
            +60
          </span>
          <Input
            type="tel"
            required
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="123456789"
            className="rounded-l-none"
          />
        </div>
        {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
      </div>
    </div>
  )
}

export default function RsvpSection() {
  const [step, setStep] = useState(1)
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [inviteKey, setInviteKey] = useState<InviteKey | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', phone: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registered, setRegistered] = useState<{ full_name: string }[]>([])

  // Step 1: validate key
  async function handleValidateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setKeyError(null)
    setValidating(true)

    try {
      const data = await api.validateKey(keyInput.trim())
      setInviteKey(data)
      setStep(2)
    } catch (err) {
      setKeyError((err as Error).message)
    }
    setValidating(false)
  }

  // Step 2: submit RSVP
  async function handleSubmitRsvp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const invalid = attendees.some((a) => !MY_PHONE_REGEX.test(a.phone))
    if (invalid) {
      setSubmitError('Please fix the phone number errors above before submitting.')
      return
    }

    setSubmitting(true)

    const guests = attendees.map((a) => ({
      full_name: a.name.trim(),
      phone: a.phone,
    }))

    try {
      await api.registerGuests(inviteKey!.id, guests)
      setRegistered(guests.map((g) => ({ full_name: g.full_name })))
      setStep(3)
    } catch (err) {
      setSubmitError((err as Error).message)
    }
    setSubmitting(false)
  }

  const seatsRemaining = inviteKey ? inviteKey.seats_remaining : 0

  return (
    <section>
      <p className="text-sm text-muted-foreground mb-4">RSVP</p>

      {/* Step 1 — Key entry */}
      {step === 1 && (
        <form onSubmit={handleValidateKey} className="space-y-4 max-w-sm">
          <p className="text-sm text-muted-foreground">
            Enter the invite key you received to register your attendance.
          </p>
          <div className="space-y-2">
            <Input
              type="text"
              required
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. FAM-X7K2"
              className="font-mono tracking-widest uppercase"
            />
            {keyError && (
              <Alert variant="destructive">
                <AlertDescription>{keyError}</AlertDescription>
              </Alert>
            )}
          </div>
          <Button type="submit" disabled={validating}>
            {validating ? 'Checking…' : 'Verify Key'}
          </Button>
        </form>
      )}

      {/* Step 2 — Attendee form */}
      {step === 2 && inviteKey && (
        <form onSubmit={handleSubmitRsvp} className="space-y-5 max-w-lg">
          <div className="bg-muted border rounded px-4 py-3 text-sm">
            Registering under <span className="font-semibold">{inviteKey.family_name}</span>
            {' '}— <span className="font-semibold">{seatsRemaining}</span> seat{seatsRemaining !== 1 ? 's' : ''} remaining
          </div>

          {attendees.map((a, i) => (
            <div key={i} className="space-y-1">
              <AttendeeRow
                index={i}
                value={a}
                onChange={(updated) => {
                  const next = [...attendees]
                  next[i] = updated
                  setAttendees(next)
                }}
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => setAttendees(attendees.filter((_, idx) => idx !== i))}
                  className="text-xs text-destructive hover:underline mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {attendees.length < seatsRemaining && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAttendees([...attendees, { name: '', phone: '' }])}
            >
              + Add another person
            </Button>
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Confirming…' : 'Confirm RSVP'}
          </Button>
        </form>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <Card className="max-w-sm">
          <CardContent className="pt-6 space-y-4">
            <p className="text-lg">You're on the list! 🎉</p>
            <p className="text-sm text-muted-foreground">We look forward to celebrating with you.</p>
            <ul className="text-sm space-y-1">
              {registered.map((g, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {g.full_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
