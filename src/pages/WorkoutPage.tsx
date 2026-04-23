import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Play, RotateCcw, Youtube, Trophy, Flame } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { supabase } from '../api/supabase'
import { generateMotivationalMessage } from '../api/claude'
import type { SetLog, Exercise } from '../types'
import toast from 'react-hot-toast'

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(interval); onDone(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, onDone])

  const pct = (remaining / seconds) * 100
  const isLow = remaining <= 5

  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.04, 1] } : {}}
      transition={{ repeat: isLow ? Infinity : 0, duration: 0.6 }}
      className={`flex flex-col items-center gap-2 p-3 rounded border ${isLow ? 'border-red-500/50 bg-red-500/5' : 'border-border bg-bg-elevated'}`}
    >
      <p className="text-xs uppercase tracking-widest text-text-muted font-body">Rest</p>
      <span className={`font-mono text-2xl font-bold ${isLow ? 'text-red-400' : 'text-accent-primary'}`}>
        {remaining}s
      </span>
      <div className="w-full h-1 bg-bg-primary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-accent-primary'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <button onClick={onDone} className="text-xs text-text-muted hover:text-text-primary font-body underline">
        Skip
      </button>
    </motion.div>
  )
}

function ExerciseCard({
  exercise,
  index,
  isExpanded,
  onToggle,
  onSetsUpdate,
}: {
  exercise: Exercise
  index: number
  isExpanded: boolean
  onToggle: () => void
  onSetsUpdate: (index: number, sets: SetLog[]) => void
}) {
  const [sets, setSets] = useState<SetLog[]>(
    Array.from({ length: exercise.sets }, (_, i) => ({
      set: i + 1,
      reps: parseInt(exercise.reps) || 10,
      weight: 0,
      completed: false,
    }))
  )
  const [activeRest, setActiveRest] = useState<number | null>(null)

  const updateSets = (updater: (prev: SetLog[]) => SetLog[]) => {
    setSets((prev) => {
      const updated = updater(prev)
      onSetsUpdate(index, updated)
      return updated
    })
  }

  const toggleSet = (i: number) => {
    updateSets((prev) => {
      const updated = [...prev]
      updated[i] = { ...updated[i], completed: !updated[i].completed }
      if (updated[i].completed) setActiveRest(exercise.rest || 60)
      return updated
    })
  }

  const updateReps = (i: number, reps: number) => {
    updateSets((prev) => {
      const updated = [...prev]
      updated[i] = { ...updated[i], reps }
      return updated
    })
  }

  const updateWeight = (i: number, weight: number) => {
    updateSets((prev) => {
      const updated = [...prev]
      updated[i] = { ...updated[i], weight }
      return updated
    })
  }

  const completedCount = sets.filter((s) => s.completed).length
  const allDone = completedCount === sets.length

  return (
    <div className={`border rounded transition-colors duration-150 ${allDone ? 'border-success/40 bg-success/5' : 'border-border bg-bg-secondary'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted w-5">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <p className={`font-body font-semibold text-sm uppercase tracking-wider ${allDone ? 'text-success' : 'text-text-primary'}`}>
              {exercise.name}
            </p>
            <p className="font-mono text-xs text-text-muted mt-0.5">
              {exercise.sets} sets × {exercise.reps} reps · {exercise.rest}s rest
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allDone && <Check size={16} className="text-success" />}
          <Badge variant={allDone ? 'success' : 'default'}>{completedCount}/{sets.length}</Badge>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-text-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              {/* Set chips */}
              <div className="flex flex-wrap gap-2">
                {sets.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => toggleSet(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center px-4 py-2 rounded border transition-colors duration-150 ${
                      s.completed
                        ? 'border-accent-primary bg-accent-primary/20 text-accent-primary'
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    <span className="font-mono text-xs">Set {s.set}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={s.reps}
                        onChange={(e) => updateReps(i, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 bg-transparent font-mono text-xs text-center focus:outline-none"
                      />
                      <span className="font-body text-xs text-text-muted">reps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={s.weight || ''}
                        placeholder="0"
                        onChange={(e) => updateWeight(i, parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 bg-transparent font-mono text-xs text-center focus:outline-none"
                      />
                      <span className="font-body text-xs text-text-muted">kg</span>
                    </div>
                    {s.completed && <Check size={10} className="mt-1" />}
                  </motion.button>
                ))}
              </div>

              {/* Rest Timer */}
              {activeRest !== null && (
                <RestTimer seconds={activeRest} onDone={() => setActiveRest(null)} />
              )}

              {exercise.notes && (
                <p className="font-body text-xs text-text-muted italic">{exercise.notes}</p>
              )}

              {exercise.youtubeSearchQuery && (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-body transition-colors w-fit"
                >
                  <Youtube size={14} />
                  Watch Tutorial
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WorkoutPage() {
  const { activePlan, setStreak, streak } = useAppStore()
  const [expandedIdx, setExpandedIdx] = useState<number>(0)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [motivationalMsg, setMotivationalMsg] = useState('')
  const [startTime] = useState(Date.now())

  // Track set data reported by each ExerciseCard
  const exerciseDataRef = useRef<Map<number, SetLog[]>>(new Map())

  const todayWorkout = activePlan?.plan_data?.weeklySchedule?.[
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  ]
  const exercises = todayWorkout?.workouts || []

  const handleSetsUpdate = useCallback((index: number, sets: SetLog[]) => {
    exerciseDataRef.current.set(index, sets)
  }, [])

  const completedExerciseCount = Array.from(exerciseDataRef.current.values()).filter(
    (sets) => sets.every((s) => s.completed)
  ).length

  const handleComplete = useCallback(async () => {
    const duration = Math.round((Date.now() - startTime) / 60000) || 1
    setSaving(true)

    try {
      // Compute total volume from logged sets
      const totalVolume = Array.from(exerciseDataRef.current.values())
        .flat()
        .reduce((sum, s) => sum + s.weight * s.reps, 0)

      // Fetch motivational message
      generateMotivationalMessage({
        completedExercises: completedExerciseCount,
        totalExercises: exercises.length,
        duration,
        prsHit: 0,
      }).then(setMotivationalMsg).catch(() => setMotivationalMsg('Incredible work today!'))

      // Persist to Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser && activePlan) {
        const { data: session, error: sessionErr } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: authUser.id,
            plan_id: activePlan.id,
            date: new Date().toISOString().split('T')[0],
            focus: todayWorkout?.focus || 'Workout',
            status: 'completed',
            started_at: new Date(startTime).toISOString(),
            completed_at: new Date().toISOString(),
            duration_minutes: duration,
            total_volume_kg: totalVolume,
          })
          .select()
          .single()

        if (sessionErr) {
          console.error('Failed to save session:', sessionErr)
        } else if (session) {
          // Save individual exercise logs
          const logs = exercises.map((exercise, i) => {
            const loggedSets = exerciseDataRef.current.get(i) ||
              Array.from({ length: exercise.sets }, (_, j) => ({
                set: j + 1,
                reps: parseInt(exercise.reps) || 0,
                weight: 0,
                completed: false,
              }))
            return {
              session_id: session.id,
              exercise_name: exercise.name,
              sets: loggedSets,
              is_pr: false,
            }
          })

          await supabase.from('exercise_logs').insert(logs)

          // Increment streak
          setStreak(streak + 1)
        }
      }
    } catch (err) {
      console.error('Session save error:', err)
    } finally {
      setSaving(false)
      setCompleted(true)
      toast.success(`Workout done! ${Math.round((Date.now() - startTime) / 60000)} min`)
    }
  }, [startTime, activePlan, exercises, todayWorkout, completedExerciseCount, setStreak, streak])

  if (completed) {
    const duration = Math.round((Date.now() - startTime) / 60000) || 1
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Trophy size={72} className="text-warning" />
          </motion.div>
          <div>
            <h2 className="font-display text-5xl text-text-primary tracking-wider">WORKOUT COMPLETE!</h2>
            <p className="font-mono text-sm text-text-muted mt-2">{duration} min · {exercises.length} exercises</p>
          </div>
          {motivationalMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 bg-accent-primary/10 border border-accent-primary/30 rounded p-4 max-w-sm"
            >
              <Flame size={16} className="text-accent-primary flex-shrink-0 mt-0.5" fill="currentColor" />
              <p className="font-body text-sm text-text-secondary text-left">{motivationalMsg}</p>
            </motion.div>
          )}
          <div className="flex gap-3">
            <Button onClick={() => setCompleted(false)} variant="secondary">Another Set?</Button>
            <Button onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
          </div>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <TopBar />
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent-primary font-body font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
            </p>
            <h1 className="font-display text-4xl text-text-primary tracking-wider mt-1">
              {todayWorkout?.focus?.toUpperCase() || 'TODAY\'S WORKOUT'}
            </h1>
          </div>
          {workoutStarted && (
            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => setWorkoutStarted(false)}>
              Reset
            </Button>
          )}
        </div>

        {!activePlan ? (
          <Card className="text-center py-16">
            <p className="font-display text-2xl text-text-muted tracking-wider">NO PLAN FOUND</p>
            <p className="font-body text-sm text-text-muted mt-2">Complete onboarding first</p>
          </Card>
        ) : todayWorkout?.type === 'rest' ? (
          <Card className="text-center py-16">
            <p className="text-4xl mb-4">😴</p>
            <p className="font-display text-2xl text-text-primary tracking-wider">REST DAY</p>
            <p className="font-body text-sm text-text-muted mt-2">Recovery is part of progress. Take it easy today.</p>
          </Card>
        ) : (
          <>
            {/* Progress */}
            <ProgressBar
              value={(completedExerciseCount / Math.max(exercises.length, 1)) * 100}
              label={`${completedExerciseCount} of ${exercises.length} exercises`}
              showPercent
            />

            {!workoutStarted ? (
              <Button size="lg" fullWidth onClick={() => setWorkoutStarted(true)} icon={<Play size={18} />}>
                Start Workout
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                {exercises.map((exercise, i) => (
                  <ExerciseCard
                    key={i}
                    exercise={exercise}
                    index={i}
                    isExpanded={expandedIdx === i}
                    onToggle={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
                    onSetsUpdate={handleSetsUpdate}
                  />
                ))}
                <Button
                  size="lg"
                  fullWidth
                  onClick={handleComplete}
                  loading={saving}
                  icon={<Trophy size={18} />}
                  className="mt-4"
                >
                  Complete Workout
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
