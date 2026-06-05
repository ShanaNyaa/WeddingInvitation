import { useEffect, useState } from 'react'
import { api, RsvpGroup, RsvpTotals } from '../../lib/api'

export default function RsvpsPanel() {
  const [groups, setGroups] = useState<RsvpGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState<RsvpTotals>({ registered: 0, capacity: 0 })

  useEffect(() => {
    async function fetchData() {
      try {
        const { groups, totals } = await api.getRsvps()
        setGroups(groups)
        setTotals(totals)
      } catch (_) {}
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-sm text-gray-400">Loading RSVPs…</p>

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white border rounded p-4 inline-flex gap-6 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Registered</p>
          <p className="text-2xl font-semibold text-gray-800">{totals.registered}</p>
        </div>
        <div className="border-l pl-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Capacity</p>
          <p className="text-2xl font-semibold text-gray-800">{totals.capacity}</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No RSVPs yet.</p>
      ) : (
        groups.map(({ key, guests }) => (
          <div key={key.id} className="bg-white border rounded overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{key.family_name}</span>
              <span className="text-xs text-gray-400">{guests.length} / {key.seat_limit} seats</span>
            </div>
            {guests.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 italic">No registrations yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-400 border-b">
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Phone</th>
                    <th className="text-left px-4 py-2">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-gray-800">{g.full_name}</td>
                      <td className="px-4 py-2 text-gray-600 font-mono">{g.phone_number}</td>
                      <td className="px-4 py-2 text-gray-400 text-xs">
                        {new Date(g.registered_at).toLocaleString('en-MY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  )
}
