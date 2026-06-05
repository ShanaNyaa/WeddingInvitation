import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function InviteKeysPanel() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [familyName, setFamilyName] = useState('')
  const [seatLimit, setSeatLimit] = useState('')
  const [creating, setCreating] = useState(false)
  const [banner, setBanner] = useState(null) // { type: 'success'|'error', message }
  const [confirmDelete, setConfirmDelete] = useState(null) // key id

  async function fetchKeys() {
    try {
      const data = await api.getKeys()
      setKeys(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  function showBanner(type, message) {
    setBanner({ type, message })
    setTimeout(() => setBanner(null), 6000)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const data = await api.createKey(familyName, parseInt(seatLimit, 10))
      showBanner('success', `Key created: ${data.secret_key} — share this with ${familyName.trim()}`)
      setFamilyName('')
      setSeatLimit('')
      fetchKeys()
    } catch (err) {
      showBanner('error', err.message)
    }
    setCreating(false)
  }

  async function handleRegenerate(key) {
    try {
      const data = await api.regenerateKey(key.id)
      showBanner('success', `New key for ${key.family_name}: ${data.secret_key}`)
      fetchKeys()
    } catch (err) {
      showBanner('error', err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteKey(id)
      fetchKeys()
    } catch (err) {
      showBanner('error', err.message)
    }
    setConfirmDelete(null)
  }

  function statusLabel(key) {
    if (!key.is_active) return { label: 'Revoked', className: 'text-red-500' }
    if (key.seats_used >= key.seat_limit) return { label: 'Exhausted', className: 'text-gray-400' }
    return { label: 'Active', className: 'text-green-500' }
  }

  return (
    <div className="space-y-6">
      {/* Create key form */}
      <form onSubmit={handleCreate} className="bg-white border rounded p-6 space-y-4 max-w-lg">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Generate New Key</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Family Name</label>
            <input
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Family Ahmad"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">Seat Limit</label>
            <input
              type="number"
              required
              min="1"
              value={seatLimit}
              onChange={(e) => setSeatLimit(e.target.value)}
              placeholder="e.g. 3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {creating ? 'Generating…' : 'Generate Key'}
        </button>
      </form>

      {/* Banner */}
      {banner && (
        <div className={`rounded px-4 py-3 text-sm font-mono ${
          banner.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {banner.message}
        </div>
      )}

      {/* Keys table */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading keys…</p>
      ) : keys.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No keys yet. Generate one above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b">
                <th className="pb-2 pr-4">Family</th>
                <th className="pb-2 pr-4">Secret Key</th>
                <th className="pb-2 pr-4">Seats</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const status = statusLabel(key)
                return (
                  <tr key={key.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-gray-800">{key.family_name}</td>
                    <td className="py-3 pr-4 font-mono text-gray-700">{key.secret_key}</td>
                    <td className="py-3 pr-4 text-gray-600">{key.seats_used} / {key.seat_limit}</td>
                    <td className={`py-3 pr-4 font-medium ${status.className}`}>{status.label}</td>
                    <td className="py-3 flex gap-3">
                      <button
                        onClick={() => handleRegenerate(key)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={() => setConfirmDelete(key.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full space-y-4">
            <p className="text-sm text-gray-700">
              Delete this key? All registered guests under this key will also be removed. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
