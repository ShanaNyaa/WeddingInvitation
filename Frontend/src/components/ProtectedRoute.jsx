import { Navigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function ProtectedRoute({ children }) {
  if (!api.isLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
