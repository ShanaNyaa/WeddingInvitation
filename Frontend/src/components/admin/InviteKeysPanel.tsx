import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, InviteKey } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function InviteKeysPanel() {
  const [keys, setKeys] = useState<InviteKey[]>([])
  const [loading, setLoading] = useState(true)
  const [familyName, setFamilyName] = useState('')
  const [seatLimit, setSeatLimit] = useState('')
  const [creating, setCreating] = useState(false)

  async function fetchKeys() {
    try {
      const data = await api.getKeys()
      setKeys(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    try {
      const data = await api.createKey(familyName, parseInt(seatLimit, 10))
      toast.success(`Key created: ${data.secret_key} — share this with ${familyName.trim()}`)
      setFamilyName('')
      setSeatLimit('')
      fetchKeys()
    } catch (err) {
      toast.error((err as Error).message)
    }
    setCreating(false)
  }

  async function handleRegenerate(key: InviteKey) {
    try {
      const data = await api.regenerateKey(key.id)
      toast.success(`New key for ${key.family_name}: ${data.secret_key}`)
      fetchKeys()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteKey(id)
      fetchKeys()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  function statusBadge(key: InviteKey) {
    if (!key.is_active) return <Badge variant="destructive">Revoked</Badge>
    if (key.seats_used >= key.seat_limit) return <Badge variant="secondary">Exhausted</Badge>
    return <Badge>Active</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Generate key form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Generate New Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="family-name">Family Name</Label>
              <Input
                id="family-name"
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Family Ahmad"
              />
            </div>
            <div className="w-full sm:w-28 space-y-1.5">
              <Label htmlFor="seat-limit">Seats</Label>
              <Input
                id="seat-limit"
                type="number"
                required
                min="1"
                value={seatLimit}
                onChange={(e) => setSeatLimit(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? 'Generating…' : 'Generate Key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Keys table */}
      {loading ? (
        <p className="text-sm text-muted-foreground px-1">Loading keys…</p>
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground italic px-1">No keys yet. Generate one above.</p>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium">Invite Keys</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family</TableHead>
                    <TableHead>Secret Key</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.family_name}</TableCell>
                      <TableCell className="font-mono text-sm">{key.secret_key}</TableCell>
                      <TableCell>{key.seats_used} / {key.seat_limit}</TableCell>
                      <TableCell>{statusBadge(key)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleRegenerate(key)}>
                            Regenerate
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete invite key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  All registered guests under this key will also be removed. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(key.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
