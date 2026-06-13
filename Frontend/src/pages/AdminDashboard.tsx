import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import InviteKeysPanel from '../components/admin/InviteKeysPanel'
import RsvpsPanel from '../components/admin/RsvpsPanel'
import EditInvitationPanel from '../components/admin/EditInvitationPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { LogOut, Sun, Moon } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [userEmail] = useState(() => api.getEmail() || '')
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    try { await api.logout() } catch (_) {}
    api.clearSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Top bar */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Tab content */}
      <main className="px-6 py-8">
        <Tabs defaultValue="invite-keys">
          <TabsList className="mb-6 w-full overflow-x-auto">
            <TabsTrigger value="invite-keys">Invite Keys</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
            <TabsTrigger value="edit-invitation">Edit Invitation</TabsTrigger>
          </TabsList>
          <TabsContent value="invite-keys">
            <InviteKeysPanel />
          </TabsContent>
          <TabsContent value="rsvps">
            <RsvpsPanel />
          </TabsContent>
          <TabsContent value="edit-invitation">
            <EditInvitationPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
