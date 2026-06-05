import { useState } from 'react'
import { api } from '../../lib/api'

const MY_PHONE_REGEX = /^1[0-9]{8,9}$/

function AttendeeRow({ index, value, onChange }) {
  const phoneError =
    value.phone && !MY_PHONE_REGEX.test(value.phone)
      ? 'Enter a valid Malaysian mobile number (e.g. 123456789)'
      : null

  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">
          Full Name {index === 0 ? '(you)' : ''}
        </label>
        <input
          type="text"
          required
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Full name"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l bg-gray-50 text-sm text-gray-500">
            +60
          </span>
          <input
            type="tel"
            required
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="123456789"
            className="flex-1 border border-gray-300 rounded-r px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
      </div>
    </div>
  )
}

export default function RsvpSection() {
  const [step, setStep] = useState(1)
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState(null)
  const [validating, setValidating] = useState(false)
  const [inviteKey, setInviteKey] = useState(null) // full row from invite_keys
  const [attendees, setAttendees] = useState([{ name: '', phone: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [registered, setRegistered] = useState([])

  // Step 1: validate key
  async function handleValidateKey(e) {
    e.preventDefault()
    setKeyError(null)
    setValidating(true)

    try {
      const data = await api.validateKey(keyInput.trim())
      setInviteKey(data)
      setStep(2)
    } catch (err) {
      setKeyError(err.message)
    }
    setValidating(false)
  }

  // Step 2: submit RSVP
  async function handleSubmitRsvp(e) {
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
      await api.registerGuests(inviteKey.id, guests)
      setRegistered(guests.map((g) => ({ full_name: g.full_name })))
      setStep(3)
    } catch (err) {
      setSubmitError(err.message)
    }
    setSubmitting(false)
  }

  const seatsRemaining = inviteKey ? inviteKey.seats_remaining : 0

  return (
    <section className="border-t pt-8">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">RSVP</p>

      {/* Step 1 — Key entry */}
      {step === 1 && (
        <form onSubmit={handleValidateKey} className="space-y-4 max-w-sm">
          <p className="text-sm text-gray-600">
            Enter the invite key you received to register your attendance.
          </p>
          <div>
            <input
              type="text"
              required
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. FAM-X7K2"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-400 uppercase"
            />
            {keyError && <p className="text-xs text-red-500 mt-1">{keyError}</p>}
          </div>
          <button
            type="submit"
            disabled={validating}
            className="bg-gray-800 text-white text-sm px-5 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {validating ? 'Checking…' : 'Verify Key'}
          </button>
        </form>
      )}

      {/* Step 2 — Attendee form */}
      {step === 2 && inviteKey && (
        <form onSubmit={handleSubmitRsvp} className="space-y-5 max-w-lg">
          <div className="bg-gray-50 border rounded px-4 py-3 text-sm text-gray-700">
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
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {attendees.length < seatsRemaining && (
            <button
              type="button"
              onClick={() => setAttendees([...attendees, { name: '', phone: '' }])}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add another person
            </button>
          )}

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-800 text-white text-sm px-5 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Confirming…' : 'Confirm RSVP'}
          </button>
        </form>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div className="space-y-4 max-w-sm">
          <p className="text-lg text-gray-800">You're on the list! 🎉</p>
          <p className="text-sm text-gray-500">We look forward to celebrating with you.</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {registered.map((g, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {g.full_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
