import { useEffect, useState } from 'react'
import { api, RsvpGroup, RsvpTotals } from '../../lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

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

  if (loading) return <p className="text-sm text-muted-foreground">Loading RSVPs…</p>

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="border rounded-lg p-4 inline-flex gap-6 text-sm bg-card">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Registered</p>
          <p className="text-2xl font-semibold">{totals.registered}</p>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Capacity</p>
          <p className="text-2xl font-semibold">{totals.capacity}</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No RSVPs yet.</p>
      ) : (
        groups.map(({ key, guests }) => (
          <div key={key.id} className="border rounded-lg overflow-hidden bg-card">
            <div className="px-4 py-3 bg-muted border-b flex items-center justify-between">
              <span className="text-sm font-medium">{key.family_name}</span>
              <span className="text-xs text-muted-foreground">{guests.length} / {key.seat_limit} seats</span>
            </div>
            {guests.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground italic">No registrations yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.full_name}</TableCell>
                      <TableCell className="font-mono">{g.phone_number}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(g.registered_at).toLocaleString('en-MY')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ))
      )}
    </div>
  )
}
