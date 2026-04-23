import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { supabase } from './api/supabase'
import { useAppStore } from './store/useAppStore'

// Pages
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlanPage } from './pages/PlanPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { HistoryPage } from './pages/HistoryPage'
import { NutritionPage } from './pages/NutritionPage'
import { CoachPage } from './pages/CoachPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProgressPage } from './pages/ProgressPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
        <Route path="/workout/today" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
        <Route path="/workout/:id" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
        <Route path="/nutrition/log" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const { setUser, setAuthenticated, isAuthenticated } = useAppStore()

  useEffect(() => {
    // Restore session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setAuthenticated(true)
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setUser(profile)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthenticated(false)
      } else if (session?.user && !isAuthenticated) {
        setAuthenticated(true)
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setUser(profile)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setAuthenticated, isAuthenticated])

  return (
    <>
      <AnimatedRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D2137',
            color: '#EDF4FC',
            border: '1px solid #132B42',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10D9A0', secondary: '#0D2137' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0D2137' } },
        }}
      />
    </>
  )
}
