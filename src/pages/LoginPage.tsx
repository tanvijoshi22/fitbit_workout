import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Chrome, Activity, Zap, TrendingUp, Shield, AlertCircle, CheckCircle, PlayCircle } from 'lucide-react'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import type { UserProfile } from '../types'

const DEMO_USER: UserProfile = {
  id: 'demo-user-001',
  email: 'demo@fitforge.app',
  name: 'Alex',
  age: 28,
  gender: 'male',
  height_cm: 178,
  weight_kg: 78,
  target_weight_kg: 72,
  fitness_goal: 'build_muscle',
  fitness_level: 'intermediate',
  equipment: ['dumbbells', 'pullup_bar', 'full_gym'],
  dietary_prefs: ['high_protein'],
  days_per_week: 5,
  session_duration: 60,
  created_at: new Date().toISOString(),
}

const features = [
  { icon: Zap, text: 'AI-powered workout plans tailored to you' },
  { icon: TrendingUp, text: 'Real-time progress tracking & analytics' },
  { icon: Shield, text: 'Personalized nutrition & diet guidance' },
]

type AuthState = 'idle' | 'loading' | 'needs_confirmation'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setAuthenticated } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [isResending, setIsResending] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthState('loading')
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Distinguish common error cases
        const msg = error.message.toLowerCase()
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          setAuthState('needs_confirmation')
          return
        }
        if (msg.includes('invalid login') || msg.includes('invalid credentials') || error.status === 400) {
          setErrorMsg('Invalid email or password. Please check your credentials and try again.')
          setAuthState('idle')
          return
        }
        throw error
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        setUser(profile)
        setAuthenticated(true)
        navigate('/dashboard')
      } else {
        setAuthenticated(true)
        navigate('/onboarding')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setErrorMsg(message)
      setAuthState('idle')
    }
  }

  const handleResendConfirmation = async () => {
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      toast.success('Confirmation email sent! Check your inbox.')
    } catch {
      toast.error('Could not resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      toast.error(message)
      setGoogleLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setUser(DEMO_USER)
    setAuthenticated(true)
    toast.success('Welcome to the demo! Exploring FitForge.')
    navigate('/dashboard')
  }

  const loading = authState === 'loading'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#030D18' }}>
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, #030D18 0%, #071E35 50%, #052940 100%)',
          backgroundImage: `
            linear-gradient(160deg, #030D18 0%, #071E35 50%, #052940 100%),
            linear-gradient(rgba(6,197,217,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,197,217,0.025) 1px, transparent 1px)
          `,
          backgroundSize: 'cover, 40px 40px, 40px 40px',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(6,197,217,0.12) 0%, transparent 55%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 80%, rgba(4,153,176,0.08) 0%, transparent 50%)',
        }} />

        {/* Decorative rings */}
        <div className="absolute top-16 right-16 w-80 h-80 rounded-full" style={{ border: '1px solid rgba(6,197,217,0.08)' }} />
        <div className="absolute top-28 right-28 w-56 h-56 rounded-full" style={{ border: '1px solid rgba(6,197,217,0.12)' }} />
        <div className="absolute bottom-24 left-8 w-52 h-52 rounded-full" style={{ border: '1px solid rgba(6,197,217,0.06)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #06C5D9, #0499B0)' }}>
              <Activity size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-3xl tracking-wider" style={{ color: '#EDF4FC' }}>FITFORGE</span>
          </div>

          {/* Hero text */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="font-body font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: '#06C5D9' }}>
                Your fitness journey starts here
              </p>
              <h2 className="font-display leading-none tracking-wide mb-6" style={{ fontSize: '5rem', color: '#EDF4FC' }}>
                VOLUME UP<br />
                <span style={{
                  background: 'linear-gradient(135deg, #06C5D9 0%, #38E8F5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>YOUR GOALS</span>
              </h2>
              <p className="font-body text-lg leading-relaxed mb-10" style={{ color: '#7A9BB8' }}>
                AI-powered plans tailored to you. Track every rep, every meal, and every milestone on your path to peak performance.
              </p>

              <div className="flex flex-col gap-3">
                {features.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{
                      background: 'rgba(6,197,217,0.1)',
                      border: '1px solid rgba(6,197,217,0.2)',
                    }}>
                      <Icon size={14} style={{ color: '#06C5D9' }} />
                    </div>
                    <span className="font-body text-sm" style={{ color: '#7A9BB8' }}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-10"
          >
            {[{ value: '50K+', label: 'Active Users' }, { value: '2M+', label: 'Workouts' }, { value: '4.9★', label: 'Rating' }].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl tracking-wide" style={{ color: '#06C5D9' }}>{value}</p>
                <p className="font-body text-xs uppercase tracking-widest" style={{ color: '#3D5A74' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ backgroundColor: '#040E1A' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2.5 mb-10 lg:hidden"
          >
            <div className="p-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #06C5D9, #0499B0)' }}>
              <Activity size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-3xl tracking-wider" style={{ color: '#EDF4FC' }}>FITFORGE</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="font-display text-3xl tracking-wider mb-1" style={{ color: '#EDF4FC' }}>
              WELCOME BACK
            </h2>
            <p className="font-body text-sm mb-8" style={{ color: '#3D5A74' }}>
              Sign in to continue your fitness journey
            </p>

            {/* Email not confirmed state */}
            <AnimatePresence mode="wait">
              {authState === 'needs_confirmation' ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl p-5 mb-6"
                  style={{
                    background: 'rgba(6,197,217,0.06)',
                    border: '1px solid rgba(6,197,217,0.25)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Mail size={18} style={{ color: '#06C5D9', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="font-body font-semibold text-sm mb-1" style={{ color: '#EDF4FC' }}>
                        Confirm your email first
                      </p>
                      <p className="font-body text-xs mb-3" style={{ color: '#7A9BB8' }}>
                        We sent a confirmation link to <span style={{ color: '#06C5D9' }}>{email}</span>. Check your inbox (and spam folder).
                      </p>
                      <button
                        onClick={handleResendConfirmation}
                        disabled={isResending}
                        className="font-body text-xs font-semibold uppercase tracking-wider transition-colors"
                        style={{ color: '#06C5D9', background: 'none', border: 'none', cursor: isResending ? 'wait' : 'pointer' }}
                      >
                        {isResending ? 'Sending…' : 'Resend confirmation email →'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl p-4 mb-5 flex items-start gap-3"
                  style={{
                    background: 'rgba(248,113,113,0.06)',
                    border: '1px solid rgba(248,113,113,0.2)',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                  <p className="font-body text-sm" style={{ color: '#f87171' }}>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 font-body font-semibold text-sm uppercase tracking-wider rounded-xl py-3 mb-6 transition-all duration-200"
              style={{
                background: 'rgba(13,33,55,0.8)',
                border: '1px solid #132B42',
                color: '#EDF4FC',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,197,217,0.5)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#06C5D9'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#132B42'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#EDF4FC'
              }}
            >
              {googleLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Chrome size={16} />
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: '#132B42' }} />
              <span className="font-body text-xs uppercase tracking-widest" style={{ color: '#3D5A74' }}>or</span>
              <div className="flex-1 h-px" style={{ background: '#132B42' }} />
            </div>

            {/* Email / Password form */}
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-body font-medium" style={{ color: '#7A9BB8' }}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3D5A74' }} />
                  <input
                    type="email"
                    placeholder="athlete@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-body rounded-xl transition-all duration-200 outline-none"
                    style={{
                      background: '#0D2137',
                      border: '1px solid #132B42',
                      color: '#EDF4FC',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#06C5D9'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,197,217,0.12), 0 0 16px rgba(6,197,217,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#132B42'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-body font-medium" style={{ color: '#7A9BB8' }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3D5A74' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-body rounded-xl transition-all duration-200 outline-none"
                    style={{
                      background: '#0D2137',
                      border: '1px solid #132B42',
                      color: '#EDF4FC',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#06C5D9'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,197,217,0.12), 0 0 16px rgba(6,197,217,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#132B42'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Sign In button with inline styles to guarantee cyan */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-body font-semibold text-base uppercase tracking-wider text-white mt-2 transition-all duration-200"
                style={{
                  background: loading ? 'rgba(6,197,217,0.4)' : 'linear-gradient(135deg, #06C5D9 0%, #0499B0 100%)',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(6,197,217,0.5), 0 0 50px rgba(6,197,217,0.15), 0 4px 20px rgba(0,0,0,0.5)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo access */}
            <div style={{ margin: '20px 0 0', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: '#132B42' }} />
                <span style={{ fontSize: 11, fontFamily: 'DM Sans', color: '#3D5A74', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#132B42' }} />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 font-body font-semibold text-sm uppercase tracking-wider rounded-xl py-3"
                style={{
                  background: 'rgba(6,197,217,0.06)',
                  border: '1px dashed rgba(6,197,217,0.35)',
                  color: '#06C5D9',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,197,217,0.1)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,197,217,0.6)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(6,197,217,0.15)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,197,217,0.06)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,197,217,0.35)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                }}
              >
                <PlayCircle size={16} />
                Try Demo — No Account Needed
              </motion.button>
            </div>

            <p className="text-center font-body text-sm mt-5" style={{ color: '#3D5A74' }}>
              No account?{' '}
              <Link to="/auth/signup" className="font-semibold transition-colors" style={{ color: '#06C5D9' }}>
                Create one free
              </Link>
            </p>

            <p className="text-center font-body text-xs mt-3" style={{ color: '#3D5A74' }}>
              Forgot password?{' '}
              <button
                type="button"
                onClick={async () => {
                  if (!email) { toast.error('Enter your email first'); return }
                  const { error } = await supabase.auth.resetPasswordForEmail(email)
                  if (error) toast.error(error.message)
                  else toast.success('Reset link sent to ' + email)
                }}
                className="font-semibold transition-colors"
                style={{ color: '#06C5D9' }}
              >
                Reset it
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
