import { useState, useEffect } from 'react'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { supabase } from '../api/supabase'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import type { WorkoutSession } from '../types'

// Fallback demo data shown when there's no real history yet
const demoSessions: WorkoutSession[] = [
  { id: 'd1', user_id: '', plan_id: '', date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), focus: 'Chest & Triceps', status: 'completed', started_at: null, completed_at: null, duration_minutes: 52, total_volume_kg: 4200, notes: null },
  { id: 'd2', user_id: '', plan_id: '', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), focus: 'Back & Biceps', status: 'completed', started_at: null, completed_at: null, duration_minutes: 48, total_volume_kg: 3800, notes: null },
  { id: 'd3', user_id: '', plan_id: '', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), focus: 'Legs & Glutes', status: 'completed', started_at: null, completed_at: null, duration_minutes: 60, total_volume_kg: 6100, notes: null },
  { id: 'd4', user_id: '', plan_id: '', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), focus: 'Shoulders', status: 'completed', started_at: null, completed_at: null, duration_minutes: 45, total_volume_kg: 2900, notes: null },
  { id: 'd5', user_id: '', plan_id: '', date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), focus: 'Chest & Triceps', status: 'completed', started_at: null, completed_at: null, duration_minutes: 55, total_volume_kg: 4500, notes: null },
  { id: 'd6', user_id: '', plan_id: '', date: format(subDays(new Date(), 8), 'yyyy-MM-dd'), focus: 'Back & Biceps', status: 'completed', started_at: null, completed_at: null, duration_minutes: 50, total_volume_kg: 4000, notes: null },
  { id: 'd7', user_id: '', plan_id: '', date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), focus: 'Legs & Glutes', status: 'completed', started_at: null, completed_at: null, duration_minutes: 62, total_volume_kg: 6500, notes: null },
  { id: 'd8', user_id: '', plan_id: '', date: format(subDays(new Date(), 13), 'yyyy-MM-dd'), focus: 'Shoulders', status: 'completed', started_at: null, completed_at: null, duration_minutes: 44, total_volume_kg: 2700, notes: null },
  { id: 'd9', user_id: '', plan_id: '', date: format(subDays(new Date(), 15), 'yyyy-MM-dd'), focus: 'Chest & Triceps', status: 'completed', started_at: null, completed_at: null, duration_minutes: 50, total_volume_kg: 4100, notes: null },
]

function HeatMap({ sessions }: { sessions: WorkoutSession[] }) {
  const today = new Date()
  const days = Array.from({ length: 84 }, (_, i) => subDays(today, 83 - i))
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  const hasWorkout = (date: Date) =>
    sessions.some((s) => isSameDay(parseISO(s.date), date))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const worked = hasWorkout(day)
              const isToday = isSameDay(day, today)
              return (
                <motion.div
                  key={di}
                  title={format(day, 'MMM d, yyyy')}
                  whileHover={{ scale: 1.3 }}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${
                    isToday
                      ? 'border border-accent-primary bg-accent-primary/30'
                      : worked
                      ? 'bg-accent-primary opacity-80'
                      : 'bg-bg-elevated'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-text-muted font-body">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.1, 0.3, 0.6, 1].map((o) => (
            <div key={o} className="w-3 h-3 rounded-sm bg-accent-primary" style={{ opacity: o }} />
          ))}
        </div>
        <span>More</span>
        <span className="ml-auto">Last 12 weeks</span>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const [view, setView] = useState<'list' | 'heatmap'>('heatmap')
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setSessions(demoSessions)
          setIsDemo(true)
          return
        }

        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(100)

        if (error) throw error

        if (data && data.length > 0) {
          setSessions(data)
          setIsDemo(false)
        } else {
          // No real sessions yet — show demo data so the UI isn't empty
          setSessions(demoSessions)
          setIsDemo(true)
        }
      } catch {
        setSessions(demoSessions)
        setIsDemo(true)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const totalWorkouts = sessions.length
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((s, w) => s + (w.duration_minutes || 0), 0) / sessions.length)
    : 0
  const totalVolume = sessions.reduce((s, w) => s + (w.total_volume_kg || 0), 0)

  return (
    <PageWrapper>
      <TopBar />
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-text-primary tracking-wider">HISTORY</h1>
          <div className="flex gap-1 bg-bg-elevated border border-border rounded p-1">
            {(['heatmap', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-body transition-colors duration-150 ${
                  view === v ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {isDemo && !loading && (
          <div className="bg-warning/10 border border-warning/30 rounded px-4 py-2">
            <p className="font-body text-xs text-warning">
              Showing sample data — your workout history will appear here after you complete sessions.
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded" />)
          ) : (
            <>
              <Card className="text-center">
                <div className="text-accent-primary flex justify-center mb-2"><Dumbbell size={16} /></div>
                <p className="font-mono text-2xl font-bold text-text-primary">{totalWorkouts}</p>
                <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">Total</p>
              </Card>
              <Card className="text-center">
                <div className="text-accent-primary flex justify-center mb-2"><Clock size={16} /></div>
                <p className="font-mono text-2xl font-bold text-text-primary">{avgDuration > 0 ? `${avgDuration}m` : '—'}</p>
                <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">Avg Time</p>
              </Card>
              <Card className="text-center">
                <div className="text-accent-primary flex justify-center mb-2"><TrendingUp size={16} /></div>
                <p className="font-mono text-2xl font-bold text-text-primary">
                  {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(0)}k` : '—'}
                </p>
                <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">Volume kg</p>
              </Card>
            </>
          )}
        </div>

        {/* Heatmap */}
        {view === 'heatmap' && (
          <Card>
            <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">
              WORKOUT CALENDAR
            </p>
            {loading ? (
              <Skeleton className="h-24 rounded" />
            ) : (
              <HeatMap sessions={sessions} />
            )}
          </Card>
        )}

        {/* Session List */}
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">
            {view === 'list' ? 'ALL SESSIONS' : 'RECENT SESSIONS'}
          </p>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="font-body text-sm text-text-muted text-center py-8">
              No workouts yet — complete your first session!
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {(view === 'list' ? sessions : sessions.slice(0, 8)).map((session, i) => {
                const date = parseISO(session.date)
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center w-12 flex-shrink-0">
                        <p className="font-mono text-xs text-text-muted uppercase">{format(date, 'MMM')}</p>
                        <p className="font-mono text-xl font-bold text-text-primary leading-none">{format(date, 'd')}</p>
                      </div>
                      <div>
                        <p className="font-body font-semibold text-sm text-text-primary">{session.focus}</p>
                        <p className="font-body text-xs text-text-muted">
                          {session.duration_minutes ? `${session.duration_minutes} min` : '—'}
                          {session.total_volume_kg && session.total_volume_kg > 0
                            ? ` · ${(session.total_volume_kg / 1000).toFixed(1)}k kg`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Done</Badge>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
