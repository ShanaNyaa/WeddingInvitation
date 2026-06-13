import { useEffect, useState } from 'react'
import { api, RsvpGroup, RsvpTotals } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    <div className="space-y-4">
      {/* Stats — two cards side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Registered</p>
            <p className="text-3xl font-semibold mt-1">{totals.registered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Capacity</p>
            <p className="text-3xl font-semibold mt-1">{totals.capacity}</p>
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground italic px-1">No RSVPs yet.</p>
      ) : (
        groups.map(({ key, guests }) => (
          <Card key={key.id}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{key.family_name}</CardTitle>
                <Badge variant={guests.length >= key.seat_limit ? 'secondary' : 'outline'}>
                  {guests.length} / {key.seat_limit} seats
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-3">
              {guests.length === 0 ? (
                <p className="px-6 pb-4 text-xs text-muted-foreground italic">No registrations yet.</p>
              ) : (
                <div className="overflow-x-auto">
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
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
