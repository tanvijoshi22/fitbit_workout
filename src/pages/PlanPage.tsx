import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Dumbbell, Coffee, Activity, Check, Youtube, Play } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { WorkoutDay } from '../types'

// ── Design tokens (blue-navy palette) ────────────────────────────────────────
const BLUE     = '#2563EB'
const BLUE_DIM = 'rgba(37,99,235,0.10)'
const BG_CARD  = '#101D33'
const BG_EL    = '#0C1525'
const BORDER   = '#1A2D42'
const TEXT_PRI = '#EDF4FC'
const TEXT_SEC = '#7A9BB8'
const TEXT_MUT = '#3D5A74'
const GREEN    = '#5CB88A'

// ── YouTube video lookup ──────────────────────────────────────────────────────
const VIDEO_MAP: Array<[RegExp, string]> = [
  [/bench.?press/i,                  'rT7DgCr-3pg'],
  [/squat/i,                         'ultWZbUMPL8'],
  [/deadlift/i,                      'op9kVnSso6Q'],
  [/pull.?up|chin.?up/i,            'eGo4IYlbE5g'],
  [/push.?up/i,                      'IODxDxX7oi4'],
  [/curl/i,                          'ykJmrZ5v0Oo'],
  [/overhead|shoulder.?press|ohp/i,  'qEwKCR5JCog'],
  [/plank/i,                         'ASdvSqalmh4'],
  [/lunge/i,                         'QOVaHwm-Q6U'],
  [/burpee/i,                        'dZgVxmf6jkA'],
  [/row/i,                           '6YLYA9oEDjc'],
  [/tricep|dip/i,                    '0326dy_-CzM'],
  [/leg.?press/i,                    'IZxyjW7MPJQ'],
  [/lat.?pulldown/i,                 'CAwf7n6Luuc'],
  [/calf/i,                          'gwLzBv3kKK4'],
  [/hip.?thrust|glute.?bridge/i,    'LM8XHLYJoYs'],
  [/russian.?twist|crunch|core/i,   'Xyd_fa5zoEU'],
]

function getVideoId(exerciseName: string, query = ''): string {
  const text = `${exerciseName} ${query}`
  for (const [pattern, id] of VIDEO_MAP) {
    if (pattern.test(text)) return id
  }
  return 'ultWZbUMPL8'
}

// ── Day helpers ───────────────────────────────────────────────────────────────
function dayTypeIcon(type: WorkoutDay['type']) {
  if (type === 'rest') return <Coffee size={14} style={{ color: TEXT_MUT }} />
  if (type === 'active_recovery') return <Activity size={14} style={{ color: '#F5894A' }} />
  return <Dumbbell size={14} style={{ color: BLUE }} />
}

function dayTypeBadge(type: WorkoutDay['type']) {
  if (type === 'rest') return <Badge variant="default">Rest</Badge>
  if (type === 'active_recovery') return <Badge variant="warning">Recovery</Badge>
  return <Badge variant="accent">Workout</Badge>
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function PlanPage() {
  const { activePlan } = useAppStore()
  const schedule = activePlan?.plan_data?.weeklySchedule || []

  const [expandedDay, setExpandedDay]         = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean[]>>({})
  const [expandedTutorial, setExpandedTutorial]     = useState<string | null>(null)

  function toggleExercise(dayName: string, index: number, total: number) {
    setCompletedExercises(prev => {
      const arr = prev[dayName] ? [...prev[dayName]] : Array(total).fill(false)
      arr[index] = !arr[index]
      return { ...prev, [dayName]: arr }
    })
  }

  function isDone(dayName: string, index: number) {
    return completedExercises[dayName]?.[index] ?? false
  }

  function completionCount(dayName: string) {
    return (completedExercises[dayName] ?? []).filter(Boolean).length
  }

  function toggleTutorial(key: string) {
    setExpandedTutorial(prev => prev === key ? null : key)
  }

  return (
    <PageWrapper>
      <TopBar />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontFamily: 'DM Sans', fontWeight: 700, fontSize: 22, color: TEXT_PRI,
            }}>
              {activePlan?.plan_data?.planName || 'My Plan'}
            </h1>
            {activePlan && (
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: TEXT_MUT, marginTop: 3 }}>
                {activePlan.start_date} → {activePlan.end_date}
              </p>
            )}
          </div>
          {activePlan && (
            <Button variant="secondary" size="sm">Regenerate</Button>
          )}
        </div>

        {!activePlan ? (
          <div style={{
            background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6,
            padding: '56px 24px', textAlign: 'center',
          }}>
            <Dumbbell size={32} style={{ color: TEXT_MUT, margin: '0 auto 14px' }} />
            <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 16, color: TEXT_MUT }}>No plan yet</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: TEXT_MUT, marginTop: 4 }}>
              Complete onboarding to generate your plan
            </p>
          </div>
        ) : (
          <>
            {/* Weekly strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {schedule.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '8px 4px', borderRadius: 4, cursor: 'pointer',
                    border: `1px solid ${expandedDay === day.day ? BLUE : BORDER}`,
                    background: expandedDay === day.day ? BLUE_DIM : BG_CARD,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontFamily: 'DM Sans', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: TEXT_MUT }}>
                    {day.day.slice(0, 3)}
                  </span>
                  {dayTypeIcon(day.type)}
                  <span style={{
                    fontFamily: 'DM Sans', fontSize: 10, color: TEXT_MUT,
                    textAlign: 'center', lineHeight: 1.2, display: 'none',
                  }} className="md:block">
                    {day.type === 'rest' ? 'Rest' : day.focus?.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Progression notes */}
            {activePlan.plan_data.progressionNotes && (
              <div style={{
                background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '14px 16px',
              }}>
                <p style={{
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: BLUE, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 6,
                }}>
                  Progression Notes
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: TEXT_SEC, lineHeight: 1.6 }}>
                  {activePlan.plan_data.progressionNotes}
                </p>
              </div>
            )}

            {/* Day list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {schedule.map((day) => {
                const totalExercises = day.workouts?.length ?? 0
                const doneCount = completionCount(day.day)
                const allDone = totalExercises > 0 && doneCount === totalExercises

                return (
                  <div key={day.day}>
                    {/* Day header row */}
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '13px 16px',
                        background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: expandedDay === day.day ? '4px 4px 0 0' : 4,
                        cursor: 'pointer', transition: 'border-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {dayTypeIcon(day.type)}
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13, color: TEXT_PRI }}>
                            {day.day}
                          </p>
                          <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: TEXT_MUT, marginTop: 1 }}>
                            {day.type === 'rest' ? 'Recovery' : day.focus}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Completion badge */}
                        {totalExercises > 0 && (
                          <span style={{
                            fontSize: 11, fontFamily: 'DM Sans', fontWeight: 600,
                            color: allDone ? GREEN : TEXT_MUT, padding: '2px 7px',
                            borderRadius: 9999,
                            background: allDone ? 'rgba(92,184,138,0.12)' : 'transparent',
                          }}>
                            {doneCount}/{totalExercises}
                          </span>
                        )}
                        {dayTypeBadge(day.type)}
                        <motion.div
                          animate={{ rotate: expandedDay === day.day ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ChevronDown size={14} style={{ color: TEXT_MUT }} />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded exercises */}
                    <AnimatePresence>
                      {expandedDay === day.day && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            border: `1px solid ${BORDER}`, borderTop: 'none',
                            borderRadius: '0 0 4px 4px', background: BG_EL,
                            padding: '4px 16px 8px',
                          }}>
                            {day.type === 'rest' || day.type === 'active_recovery' || !day.workouts?.length ? (
                              <p style={{
                                fontFamily: 'DM Sans', fontSize: 13, color: TEXT_MUT,
                                padding: '16px 0', textAlign: 'center',
                              }}>
                                {day.type === 'rest' ? 'Rest and recover today.' : 'Light activity — stretching or a walk.'}
                              </p>
                            ) : (
                              day.workouts.map((exercise, i) => {
                                const done       = isDone(day.day, i)
                                const tutKey     = `${day.day}-${i}`
                                const showTut    = expandedTutorial === tutKey
                                const videoId    = getVideoId(exercise.name, exercise.youtubeSearchQuery)

                                return (
                                  <div key={i} style={{
                                    borderBottom: i < day.workouts.length - 1 ? `1px solid ${BORDER}` : 'none',
                                  }}>
                                    {/* Exercise row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0' }}>
                                      {/* Checkbox */}
                                      <button
                                        onClick={() => toggleExercise(day.day, i, day.workouts.length)}
                                        style={{
                                          width: 20, height: 20, borderRadius: 3, flexShrink: 0,
                                          border: done ? 'none' : `1.5px solid ${BORDER}`,
                                          background: done ? BLUE : 'transparent',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          cursor: 'pointer', transition: 'background 0.15s',
                                        }}
                                      >
                                        {done && <Check size={11} style={{ color: 'white' }} strokeWidth={3} />}
                                      </button>

                                      {/* Exercise info */}
                                      <div style={{ flex: 1, opacity: done ? 0.38 : 1, transition: 'opacity 0.2s' }}>
                                        <p style={{
                                          fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: TEXT_PRI,
                                          textDecoration: done ? 'line-through' : 'none',
                                        }}>
                                          {exercise.name}
                                        </p>
                                        {exercise.notes && (
                                          <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: TEXT_MUT, marginTop: 2 }}>
                                            {exercise.notes}
                                          </p>
                                        )}
                                      </div>

                                      {/* Sets × reps + rest */}
                                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{
                                          fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12,
                                          color: done ? TEXT_MUT : BLUE,
                                          transition: 'color 0.2s',
                                        }}>
                                          {exercise.sets} × {exercise.reps}
                                        </p>
                                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: TEXT_MUT, marginTop: 1 }}>
                                          {exercise.rest}s rest
                                        </p>
                                      </div>

                                      {/* Tutorial toggle */}
                                      <button
                                        onClick={() => toggleTutorial(tutKey)}
                                        style={{
                                          flexShrink: 0,
                                          display: 'flex', alignItems: 'center', gap: 4,
                                          padding: '5px 8px', borderRadius: 3, cursor: 'pointer',
                                          border: `1px solid ${showTut ? BLUE : BORDER}`,
                                          background: showTut ? BLUE_DIM : 'transparent',
                                          color: showTut ? BLUE : TEXT_MUT,
                                          transition: 'all 0.15s',
                                        }}
                                      >
                                        {showTut
                                          ? <Play size={10} fill="currentColor" />
                                          : <Youtube size={11} />}
                                        <span style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 600 }}>
                                          Tutorial
                                        </span>
                                      </button>
                                    </div>

                                    {/* Inline tutorial iframe */}
                                    <AnimatePresence>
                                      {showTut && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.22 }}
                                          style={{ overflow: 'hidden', marginBottom: 12 }}
                                        >
                                          <div style={{
                                            borderRadius: 4, overflow: 'hidden',
                                            border: `1px solid ${BORDER}`,
                                            aspectRatio: '16 / 9',
                                          }}>
                                            <iframe
                                              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                              title={`${exercise.name} tutorial`}
                                              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                            />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
