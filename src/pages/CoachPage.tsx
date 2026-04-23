import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Trash2, Copy, ThumbsUp, ThumbsDown, Zap,
  ChevronDown, ChevronUp, Dumbbell, Apple, FlaskConical,
} from 'lucide-react'
import { format } from 'date-fns'
import { chatWithCoach } from '../api/claude'
import {
  SUPPLEMENTS,
  TRAINING_PRINCIPLES,
  NUTRIENT_TIMING,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
} from '../api/fitnessTrainerKnowledge'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import toast from 'react-hot-toast'

const CYAN = '#06C5D9'
const BG_CARD = '#0A1C2E'
const BG_EL = '#0D2137'
const BORDER = '#132B42'
const TEXT_PRI = '#EDF4FC'
const TEXT_SEC = '#7A9BB8'
const TEXT_MUT = '#3D5A74'
const SUCCESS = '#10D9A0'
const WARNING = '#F5A623'

const QUICK_PROMPTS = [
  '🍗 What should I eat before today\'s workout?',
  '💪 Build me a 4-day training split',
  '🔥 How many calories to lose fat?',
  '📊 Calculate my TDEE and macros',
  '💊 Which supplements should I take?',
  '😴 How important is sleep for muscle gain?',
  '⚡ I have 20 mins — what\'s the priority?',
  '🤕 My shoulder hurts — what should I skip?',
]

type PanelTab = 'supplements' | 'timing' | 'principles'

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 2,
            background: i <= count
              ? 'linear-gradient(135deg, #06C5D9, #0499B0)'
              : '#132B42',
          }}
        />
      ))}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '12px 16px', background: BG_EL, border: `1px solid ${BORDER}`,
      borderRadius: 14, width: 70,
    }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: CYAN }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

// Render assistant messages with basic markdown-like formatting
function MessageContent({ content, role }: { content: string; role: string }) {
  if (role === 'user') return <span>{content}</span>

  // Split on emoji section headers like "🎯 Goal Summary"
  const lines = content.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        if (line.startsWith('###') || line.startsWith('##')) {
          return (
            <p key={i} style={{ color: CYAN, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>
              {line.replace(/^#+\s*/, '')}
            </p>
          )
        }
        if (line.match(/^[🎯📊🥗💪💊📅⚠️]/)) {
          return (
            <p key={i} style={{ color: CYAN, fontWeight: 700, fontSize: 13, marginTop: 10 }}>
              {line}
            </p>
          )
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} style={{ color: TEXT_SEC, fontSize: 13, paddingLeft: 12 }}>
              · {line.replace(/^[-•]\s*/, '')}
            </p>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} style={{ color: TEXT_PRI, fontWeight: 700, fontSize: 13 }}>
              {line.replace(/\*\*/g, '')}
            </p>
          )
        }
        if (line.trim() === '') return <div key={i} style={{ height: 4 }} />
        return <p key={i} style={{ color: TEXT_PRI, fontSize: 13, lineHeight: 1.6 }}>{line}</p>
      })}
    </div>
  )
}

export function CoachPage() {
  const { chatMessages, addChatMessage, clearChat, user, activePlan, onboardingData } = useAppStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelTab>('supplements')
  const [showPanel, setShowPanel] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, loading])

  // Pre-calculate user metrics for display
  const profile = onboardingData
  const bmr = profile.weight_kg && profile.height_cm && profile.age
    ? calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender || 'male')
    : null
  const tdee = bmr && profile.days_per_week ? calculateTDEE(bmr, profile.days_per_week) : null
  const targetCals = tdee && profile.fitness_goal ? calculateCalorieTarget(tdee, profile.fitness_goal) : null
  const macros = targetCals && profile.weight_kg && profile.fitness_goal
    ? calculateMacros(targetCals, profile.weight_kg, profile.fitness_goal)
    : null

  const goalSupplements = SUPPLEMENTS.filter(
    (s) => !profile.fitness_goal || s.goals.includes(profile.fitness_goal as never)
  )

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)

    const userMsg = {
      id: crypto.randomUUID(),
      user_id: user?.id || '',
      role: 'user' as const,
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    addChatMessage(userMsg)

    try {
      const history = [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content }))
      const todaySchedule = activePlan?.plan_data?.weeklySchedule?.[
        new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
      ]

      const reply = await chatWithCoach(history, {
        profile: onboardingData,
        planSummary: activePlan?.plan_data?.planName,
        todayWorkout: todaySchedule?.focus,
      })

      addChatMessage({
        id: crypto.randomUUID(),
        user_id: user?.id || '',
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      })
    } catch {
      toast.error('Coach unavailable — check your API key in .env')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', gap: 0 }} className="lg:h-[calc(100vh-4rem)]">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="font-display" style={{ fontSize: '2.2rem', color: TEXT_PRI, letterSpacing: '0.06em', lineHeight: 1 }}>
                FITFORGE COACH
              </h1>
              {/* Skill badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20,
                background: 'rgba(6,197,217,0.1)',
                border: '1px solid rgba(6,197,217,0.3)',
                boxShadow: '0 0 10px rgba(6,197,217,0.1)',
              }}>
                <Zap size={11} fill={CYAN} style={{ color: CYAN }} />
                <span style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 700, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  fitness-trainer skill
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: TEXT_MUT, fontFamily: 'DM Sans' }}>
              NASM/ACE • Precision Nutrition L2 • Sports Dietitian — evidence-based only
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowPanel(!showPanel)}
              style={{
                padding: '8px 12px', borderRadius: 10, background: BG_EL, border: `1px solid ${BORDER}`,
                color: TEXT_SEC, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500,
              }}
            >
              {showPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Reference
            </button>
            {chatMessages.length > 0 && (
              <button
                onClick={() => { clearChat(); toast.success('Chat cleared') }}
                style={{
                  padding: '8px 12px', borderRadius: 10, background: BG_EL, border: `1px solid ${BORDER}`,
                  color: TEXT_MUT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500,
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Your Metrics bar (from skill formulas) ── */}
        {bmr && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 14, flexShrink: 0, flexWrap: 'wrap',
          }}>
            {[
              { label: 'BMR', value: `${bmr} kcal`, note: 'Mifflin-St Jeor' },
              { label: 'TDEE', value: `${tdee} kcal`, note: 'daily burn' },
              { label: 'Target', value: `${targetCals} kcal`, note: 'goal-adjusted' },
              macros && { label: 'Protein', value: `${macros.protein}g`, note: `${Math.round(macros.protein / (profile.weight_kg || 1) * 10) / 10}g/kg` },
              macros && { label: 'Carbs', value: `${macros.carbs}g`, note: 'daily' },
              macros && { label: 'Fats', value: `${macros.fats}g`, note: 'daily' },
            ].filter(Boolean).map((m) => m && (
              <div key={m.label} style={{
                padding: '8px 14px', borderRadius: 10, background: BG_CARD,
                border: `1px solid ${BORDER}`, flex: '1 1 auto', minWidth: 80, textAlign: 'center',
              }}>
                <p style={{ fontSize: 9, color: TEXT_MUT, fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.label}</p>
                <p style={{ fontSize: 15, fontFamily: 'JetBrains Mono', fontWeight: 700, color: CYAN, margin: '2px 0' }}>{m.value}</p>
                <p style={{ fontSize: 9, color: TEXT_MUT, fontFamily: 'DM Sans' }}>{m.note}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, gap: 14, overflow: 'hidden', minHeight: 0 }}>

          {/* ── Chat column ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', minWidth: 0 }}>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {chatMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center' }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(6,197,217,0.08)', border: `1px solid rgba(6,197,217,0.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 24px rgba(6,197,217,0.1)',
                  }}>
                    <Dumbbell size={30} style={{ color: CYAN }} />
                  </div>
                  <div>
                    <p className="font-display" style={{ fontSize: '1.6rem', color: TEXT_PRI, letterSpacing: '0.06em' }}>READY TO COACH</p>
                    <p style={{ fontSize: 13, color: TEXT_MUT, fontFamily: 'DM Sans', marginTop: 6 }}>
                      Powered by your fitness-trainer skill — ask about workouts, nutrition, or supplements
                    </p>
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{
                      maxWidth: '82%', display: 'flex', flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6,
                    }}>
                      <div style={{
                        padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: 13, fontFamily: 'DM Sans', lineHeight: 1.6,
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #06C5D9, #0499B0)'
                          : BG_EL,
                        border: msg.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                        color: TEXT_PRI,
                        boxShadow: msg.role === 'user'
                          ? '0 0 16px rgba(6,197,217,0.35), 0 4px 12px rgba(0,0,0,0.3)'
                          : '0 2px 12px rgba(0,0,0,0.3)',
                      }}>
                        <MessageContent content={msg.content} role={msg.role} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.6 }}>
                        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: TEXT_MUT }}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied') }}>
                          <Copy size={11} style={{ color: TEXT_MUT }} />
                        </button>
                        {msg.role === 'assistant' && (
                          <>
                            <button><ThumbsUp size={11} style={{ color: TEXT_MUT }} /></button>
                            <button><ThumbsDown size={11} style={{ color: TEXT_MUT }} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flexShrink: 0 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  style={{
                    flexShrink: 0, padding: '7px 12px', background: BG_EL,
                    border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12,
                    fontFamily: 'DM Sans', color: TEXT_SEC, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,197,217,0.4)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = CYAN
                    }
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = BORDER
                    ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_SEC
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach… workouts, nutrition, supplements, recovery (Enter to send)"
                rows={1}
                style={{
                  flex: 1, background: BG_EL, border: `1px solid ${BORDER}`, borderRadius: 14,
                  padding: '12px 16px', fontSize: 13, fontFamily: 'DM Sans', color: TEXT_PRI,
                  resize: 'none', minHeight: 48, maxHeight: 120, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = CYAN
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,197,217,0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = BORDER
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <motion.button
                whileHover={{ scale: input.trim() && !loading ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  padding: '0 20px', borderRadius: 14, border: 'none',
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #06C5D9, #0499B0)' : BG_EL,
                  color: 'white', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                  fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
                  boxShadow: input.trim() && !loading ? '0 0 16px rgba(6,197,217,0.4)' : 'none',
                  opacity: !input.trim() || loading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={15} />
                Send
              </motion.button>
            </div>
          </div>

          {/* ── Reference Panel ── */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
                  background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 16,
                  overflow: 'hidden',
                }}
                className="hidden lg:flex"
              >
                {/* Panel tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
                  {([
                    { id: 'supplements', icon: <FlaskConical size={12} />, label: 'Supps' },
                    { id: 'timing', icon: <Apple size={12} />, label: 'Timing' },
                    { id: 'principles', icon: <Zap size={12} />, label: 'Rules' },
                  ] as { id: PanelTab; icon: React.ReactNode; label: string }[]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePanel(tab.id)}
                      style={{
                        flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
                        background: activePanel === tab.id ? BG_EL : 'transparent',
                        color: activePanel === tab.id ? CYAN : TEXT_MUT,
                        fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        borderBottom: activePanel === tab.id ? `2px solid ${CYAN}` : '2px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

                  {/* Supplements tab */}
                  {activePanel === 'supplements' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 10, color: TEXT_MUT, fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                        Evidence-based only · {goalSupplements.length} for your goal
                      </p>
                      {goalSupplements.map((s) => (
                        <div key={s.name} style={{
                          padding: '10px 12px', background: BG_EL, borderRadius: 10,
                          border: `1px solid ${BORDER}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontFamily: 'DM Sans', fontWeight: 700, color: TEXT_PRI }}>{s.name}</span>
                            <StarRating count={s.evidence} />
                          </div>
                          <p style={{ fontSize: 11, color: TEXT_SEC, fontFamily: 'DM Sans', marginBottom: 2 }}>{s.bestFor}</p>
                          <p style={{ fontSize: 11, color: CYAN, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{s.dose}</p>
                        </div>
                      ))}
                      <p style={{ fontSize: 9, color: TEXT_MUT, fontFamily: 'DM Sans', textAlign: 'center', marginTop: 4 }}>
                        ⚠️ Food first, supplements second. Not medical advice.
                      </p>
                    </div>
                  )}

                  {/* Nutrient timing tab */}
                  {activePanel === 'timing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { title: '⚡ Pre-Workout', color: WARNING, data: NUTRIENT_TIMING.preWorkout, fields: ['window', 'carbs', 'protein', 'avoid'] },
                        { title: '🔄 Intra-Workout', color: CYAN, data: NUTRIENT_TIMING.intraWorkout, fields: ['window', 'carbs', 'note'] },
                        { title: '🥩 Post-Workout', color: SUCCESS, data: NUTRIENT_TIMING.postWorkout, fields: ['window', 'protein', 'carbs', 'avoid'] },
                      ].map(({ title, color, data, fields }) => (
                        <div key={title} style={{ padding: '10px 12px', background: BG_EL, borderRadius: 10, border: `1px solid ${BORDER}` }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'DM Sans', marginBottom: 6 }}>{title}</p>
                          {fields.map((f) => {
                            const val = (data as Record<string, string>)[f]
                            if (!val) return null
                            return (
                              <div key={f} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                                <span style={{ fontSize: 10, color: TEXT_MUT, fontFamily: 'DM Sans', textTransform: 'capitalize', minWidth: 48 }}>{f}:</span>
                                <span style={{ fontSize: 10, color: TEXT_SEC, fontFamily: 'DM Sans', flex: 1 }}>{val}</span>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Principles tab */}
                  {activePanel === 'principles' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 10, color: TEXT_MUT, fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                        7 core principles from the skill
                      </p>
                      {TRAINING_PRINCIPLES.map((p, i) => (
                        <div key={p.title} style={{ padding: '10px 12px', background: BG_EL, borderRadius: 10, border: `1px solid ${BORDER}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'linear-gradient(135deg, #06C5D9, #0499B0)',
                              fontSize: 10, fontWeight: 700, color: 'white', fontFamily: 'JetBrains Mono', flexShrink: 0,
                            }}>{i + 1}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRI, fontFamily: 'DM Sans' }}>{p.title}</span>
                          </div>
                          <p style={{ fontSize: 11, color: TEXT_SEC, fontFamily: 'DM Sans', lineHeight: 1.5, paddingLeft: 28 }}>{p.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
