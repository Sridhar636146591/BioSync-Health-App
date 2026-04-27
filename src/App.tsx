import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { LogEntryPage } from '@/components/log/LogEntryPage'
import { InsightsPage } from '@/components/insights/InsightsPage'
import { HistoryPage } from '@/components/history/HistoryPage'
import { SquadPage } from '@/components/squad/SquadPage'
import { Body3DPage } from '@/components/body3d/Body3DPage'
import { PredictionsPage } from '@/components/predictions/PredictionsPage'
import { DietPage } from '@/components/diet/DietPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { SignupPage } from '@/components/auth/SignupPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { seedDemoData } from '@/lib/store'

// Simple auth check
function isAuthenticated() {
  const auth = localStorage.getItem('biosync_auth')
  return auth ? JSON.parse(auth).isAuthenticated : false
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

// Public route wrapper (redirects to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Only seed demo data if user is logged in and has no data
    const auth = localStorage.getItem('biosync_auth')
    if (auth) {
      const { user } = JSON.parse(auth)
      // Check if user already has health data
      const userHealthKey = `vitalis-health-data-${user.email}`
      const existingData = localStorage.getItem(userHealthKey)
      
      // Only seed if no data exists
      if (!existingData) {
        seedDemoData()
      }
    }
    setAuthChecked(true)
  }, [])

  if (!authChecked) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/log" element={<ProtectedRoute><AppLayout><LogEntryPage /></AppLayout></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><AppLayout><InsightsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
        <Route path="/squad" element={<ProtectedRoute><AppLayout><SquadPage /></AppLayout></ProtectedRoute>} />
        <Route path="/body" element={<ProtectedRoute><AppLayout><Body3DPage /></AppLayout></ProtectedRoute>} />
        <Route path="/diet" element={<ProtectedRoute><AppLayout><DietPage /></AppLayout></ProtectedRoute>} />
        <Route path="/predictions" element={<ProtectedRoute><AppLayout><PredictionsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
