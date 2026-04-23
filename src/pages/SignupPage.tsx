import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Chrome, Activity } from 'lucide-react'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function SignupPage() {
  const navigate = useNavigate()
  const { setAuthenticated } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error

      if (data.session) {
        // Email confirmation is disabled — session is available immediately
        setAuthenticated(true)
        toast.success('Account created! Let\'s set up your profile.')
        navigate('/onboarding')
      } else {
        // Email confirmation is enabled — sign in immediately after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          toast('Account created! Check your email to confirm, then log in.', { icon: '📧' })
          navigate('/')
          return
        }
        if (signInData.session) {
          setAuthenticated(true)
          toast.success('Account created! Let\'s set up your profile.')
          navigate('/onboarding')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google signup failed'
      toast.error(message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <div className="p-1.5 rounded-xl bg-gradient-cyan">
            <Activity size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-3xl text-text-primary tracking-wider">FITFORGE</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-card"
        >
          <h2 className="font-display text-3xl text-text-primary tracking-wider mb-1">
            START YOUR JOURNEY
          </h2>
          <p className="text-text-muted font-body text-sm mb-8">
            Create your account and forge your plan
          </p>

          <Button
            variant="secondary"
            fullWidth
            loading={googleLoading}
            onClick={handleGoogleLogin}
            icon={<Chrome size={16} />}
            className="mb-6"
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs font-body uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              prefix={<User size={15} />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefix={<Mail size={15} />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Lock size={15} />}
              minLength={8}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm font-body mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-accent-primary hover:text-accent-secondary transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
