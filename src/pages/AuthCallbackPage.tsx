import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { Activity } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser, setAuthenticated } = useAppStore()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setAuthenticated(true)
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile)
          navigate('/dashboard')
        } else {
          navigate('/onboarding')
        }
      } else {
        navigate('/')
      }
    }

    handleCallback()
  }, [navigate, setUser, setAuthenticated])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-2xl bg-gradient-cyan animate-pulse">
          <Activity size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <p className="font-body text-text-secondary uppercase tracking-widest text-sm">
          Signing you in…
        </p>
      </div>
    </div>
  )
}
