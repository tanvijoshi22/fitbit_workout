import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, setUser, setAuthenticated, unitSystem, setUnitSystem } = useAppStore()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      setUser(data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthenticated(false)
    navigate('/')
  }

  return (
    <PageWrapper>
      <TopBar />
      <div className="flex flex-col gap-6 max-w-lg">
        <h1 className="font-display text-4xl text-text-primary tracking-wider">SETTINGS</h1>

        {/* Profile */}
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">PROFILE</p>
          <div className="flex flex-col gap-4">
            <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </Card>

        {/* Units */}
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">UNITS</p>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnitSystem(u)}
                className={`flex-1 py-2.5 rounded border font-body text-sm uppercase tracking-wider transition-colors duration-150 ${
                  unitSystem === u
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border bg-bg-elevated text-text-muted hover:text-text-primary'
                }`}
              >
                {u === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
              </button>
            ))}
          </div>
        </Card>

        {/* API Status */}
        <Card variant="elevated">
          <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">API STATUS</p>
          <div className="flex flex-col gap-2">
            {[
              { name: 'Anthropic Claude', envKey: 'VITE_ANTHROPIC_API_KEY' },
              { name: 'YouTube Data API', envKey: 'VITE_YOUTUBE_API_KEY' },
              { name: 'Supabase', envKey: 'VITE_SUPABASE_URL' },
            ].map(({ name, envKey }) => {
              const val = (import.meta.env as Record<string, string>)[envKey] || ''
              const connected = val.length > 0 && !val.startsWith('your_')
              return (
                <div key={name} className="flex items-center justify-between">
                  <span className="font-body text-sm text-text-secondary">{name}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                    connected
                      ? 'border-success/30 text-success bg-success/5'
                      : 'border-warning/30 text-warning bg-warning/5'
                  }`}>
                    {connected ? 'Connected' : 'Missing Key'}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="font-body text-xs text-text-muted mt-3">
            Edit <code className="text-accent-primary">.env</code> file to add your API keys
          </p>
        </Card>

        {/* Danger Zone */}
        <Card>
          <p className="text-xs uppercase tracking-widest text-red-400 font-body font-medium mb-4">ACCOUNT</p>
          <Button variant="danger" onClick={handleLogout} fullWidth>
            Log Out
          </Button>
        </Card>
      </div>
    </PageWrapper>
  )
}
