import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import InviteKeysPanel from '../components/admin/InviteKeysPanel'
import RsvpsPanel from '../components/admin/RsvpsPanel'
import EditInvitationPanel from '../components/admin/EditInvitationPanel'

const TABS = ['Invite Keys', 'RSVPs', 'Edit Invitation'] as const
type Tab = typeof TABS[number]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [userEmail] = useState(() => api.getEmail() || '')
  const [activeTab, setActiveTab] = useState<Tab>('Invite Keys')

  async function handleLogout() {
    try { await api.logout() } catch (_) {}
    api.clearSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b px-6 flex gap-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-gray-800 text-gray-800 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="px-6 py-8">
        {activeTab === 'Invite Keys' && <InviteKeysPanel />}
        {activeTab === 'RSVPs' && <RsvpsPanel />}
        {activeTab === 'Edit Invitation' && <EditInvitationPanel />}
      </main>
    </div>
  )
}
