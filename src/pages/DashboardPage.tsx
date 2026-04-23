import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dumbbell, TrendingUp, MessageCircle, Plus, Droplets, Scale,
  Flame, Clock, ChevronRight, Play, Activity,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Badge } from '../components/ui/Badge'

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
const ORANGE   = '#F5894A'

// ── Static data ───────────────────────────────────────────────────────────────
const weightData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM d'),
  weight: parseFloat((78 - i * 0.1 + Math.random() * 0.4).toFixed(1)),
}))

const weeklyData = [
  { day: 'Mon', completed: 1 },
  { day: 'Tue', completed: 1 },
  { day: 'Wed', completed: 0 },
  { day: 'Thu', completed: 1 },
  { day: 'Fri', completed: 0 },
  { day: 'Sat', completed: 1 },
  { day: 'Sun', completed: 0 },
]

const recentWorkouts = [
  { date: 'Today',      focus: 'Chest & Triceps', duration: 52, completion: 100 },
  { date: 'Yesterday',  focus: 'Back & Biceps',   duration: 48, completion: 85  },
  { date: '2 days ago', focus: 'Legs & Glutes',   duration: 60, completion: 100 },
]

const trendingPlans = [
  {
    category: 'STRENGTH',
    title:    'Beginner Workout',
    meta:     '5 exercises · 2 sets · 10 min',
    img:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=280&fit=crop&auto=format&q=75',
    tag:      'Beginner',
    tagColor: GREEN,
  },
  {
    category: 'CARDIO',
    title:    'HIIT Workout',
    meta:     '8 exercises · 3 sets · 20 min',
    img:      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=280&fit=crop&auto=format&q=75',
    tag:      'Popular',
    tagColor: ORANGE,
  },
  {
    category: 'FLEXIBILITY',
    title:    'Morning Stretch',
    meta:     '6 exercises · 1 set · 15 min',
    img:      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=280&fit=crop&auto=format&q=75',
    tag:      'Daily',
    tagColor: TEXT_SEC,
  },
]

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 4,
      padding: '7px 11px', fontFamily: 'DM Sans',
    }}>
      <p style={{ color: TEXT_MUT, fontSize: 10, marginBottom: 2 }}>{label}</p>
      <p style={{ color: TEXT_PRI, fontSize: 13, fontWeight: 700 }}>{payload[0].value}</p>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, trend, trendValue, icon }: {
  label: string; value: string | number; unit?: string
  trend?: 'up' | 'down' | 'neutral'; trendValue?: string; icon?: React.ReactNode
}) {
  const trendColor = trend === 'up' ? GREEN : trend === 'down' ? '#f87171' : TEXT_MUT
  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 4,
      padding: '16px', display: 'flex', flexDirection: 'column', gap: 9,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600 }}>
          {label}
        </span>
        {icon && <span style={{ color: TEXT_MUT, display: 'flex', opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
        <span style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: TEXT_PRI, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 12, color: TEXT_MUT, fontFamily: 'DM Sans', marginBottom: 2 }}>{unit}</span>}
      </div>
      {trendValue && (
        <span style={{ fontSize: 11, color: trendColor, fontFamily: 'DM Sans' }}>{trendValue}</span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const { activePlan, todayMealLogs, activeDietPlan, waterGlasses, incrementWater } = useAppStore()

  const todayCalories  = todayMealLogs.reduce((sum, log) => sum + log.calories, 0)
  const targetCalories = activeDietPlan?.daily_calories || 2100
  const todayWorkout   = activePlan?.plan_data?.weeklySchedule?.[
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  ]

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22 } } }

  const categories  = ['All', 'Strength', 'Cardio', 'Flexibility']
  const filteredPlans = trendingPlans.filter(p =>
    activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase()
  )

  return (
    <PageWrapper>
      <TopBar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Today's Workout"
            value={todayWorkout?.type === 'rest' ? 'REST' : todayWorkout?.focus?.split(' ')[0] || 'N/A'}
            icon={<Dumbbell size={13} />} trend="neutral"
            trendValue={todayWorkout?.type === 'rest' ? 'Recovery day' : 'Pending'}
          />
          <StatCard label="Weekly Progress" value="3" unit="/ 5" icon={<TrendingUp size={13} />} trend="up" trendValue="On track" />
          <StatCard label="Weight" value="78" unit="kg" icon={<Scale size={13} />} trend="down" trendValue="Target: 72 kg" />
          <StatCard
            label="Calories" value={todayCalories} unit={`/ ${targetCalories}`}
            icon={<Flame size={13} />} trend={todayCalories > targetCalories ? 'up' : 'neutral'}
            trendValue={`${Math.round((todayCalories / targetCalories) * 100)}% of goal`}
          />
        </motion.div>

        {/* ── Today's Workout hero ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div style={{
            background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6,
            padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600,
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Clock size={10} /> Today's Workout
                </p>
                {todayWorkout ? (
                  <>
                    <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontFamily: 'DM Sans', fontWeight: 700, color: TEXT_PRI, marginBottom: 8 }}>
                      {todayWorkout.focus || 'Rest Day'}
                    </h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge variant="accent">{todayWorkout.type}</Badge>
                      {(todayWorkout.workouts?.length ?? 0) > 0 && (
                        <span style={{ fontSize: 12, color: TEXT_MUT, fontFamily: 'DM Sans' }}>
                          {todayWorkout.workouts.length} exercises
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontFamily: 'DM Sans', fontWeight: 700, color: TEXT_MUT }}>
                    No plan yet
                  </h3>
                )}
              </div>
              <div className="flex flex-row md:flex-col gap-2" style={{ minWidth: 148 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/workout/today')}
                  disabled={!activePlan || todayWorkout?.type === 'rest'}
                  className="flex-1 md:flex-none"
                  style={{
                    background: (!activePlan || todayWorkout?.type === 'rest') ? BG_EL : BLUE,
                    color: 'white', border: 'none', borderRadius: 4, padding: '11px 18px',
                    fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
                    cursor: (!activePlan || todayWorkout?.type === 'rest') ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    opacity: (!activePlan || todayWorkout?.type === 'rest') ? 0.45 : 1,
                    boxShadow: (!activePlan || todayWorkout?.type === 'rest') ? 'none' : '0 4px 12px rgba(37,99,235,0.30)',
                  }}
                >
                  <Play size={12} fill="white" /> Start Workout
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/plan')}
                  className="flex-1 md:flex-none"
                  style={{
                    background: 'transparent', color: TEXT_SEC,
                    border: `1px solid ${BORDER}`, borderRadius: 4,
                    padding: '9px 18px', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  View Plan
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Trending Plans ────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'DM Sans', fontWeight: 700, color: TEXT_PRI, fontSize: 15 }}>Trending Plans</h2>
            <button style={{ color: BLUE, fontSize: 12, fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All <ChevronRight size={12} />
            </button>
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontFamily: 'DM Sans',
                fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                background: activeCategory === cat ? BLUE : BG_CARD,
                color: activeCategory === cat ? 'white' : TEXT_SEC,
                outline: activeCategory === cat ? 'none' : `1px solid ${BORDER}`,
                transition: 'background 0.15s',
              }}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlans.map((plan) => (
              <motion.div
                key={plan.title}
                whileHover={{ y: -2 }} transition={{ duration: 0.18 }}
                onClick={() => navigate('/plan')}
                style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${BORDER}`, cursor: 'pointer' }}
              >
                <div style={{ height: 148, position: 'relative', overflow: 'hidden', background: BG_EL }}>
                  <img
                    src={plan.img} alt={plan.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)' }} />
                  <span style={{
                    position: 'absolute', top: 10, left: 10, padding: '3px 9px', borderRadius: 9999,
                    fontSize: 10, fontFamily: 'DM Sans', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', background: 'rgba(0,0,0,0.55)', color: plan.tagColor,
                    backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>{plan.tag}</span>
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: '50%',
                    background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                  }}>
                    <Play size={11} fill="white" style={{ color: 'white', marginLeft: 1 }} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px', background: BG_CARD }}>
                  <p style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, marginBottom: 3 }}>
                    {plan.category}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontWeight: 700, color: TEXT_PRI, fontSize: 14 }}>{plan.title}</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: TEXT_MUT, marginTop: 2 }}>{plan.meta}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Charts ───────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '18px 20px' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 14 }}>
              Weight Trend — 30 Days
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={weightData}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: TEXT_MUT, fontSize: 10, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: TEXT_MUT, fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: GREEN, stroke: BG_CARD, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '18px 20px' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 14 }}>
              This Week's Workouts
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={weeklyData} barSize={18}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: TEXT_MUT, fontSize: 10, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completed" radius={[3, 3, 0, 0]}>
                  {weeklyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.completed ? BLUE : BORDER} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Recent Activity + Quick Actions ─────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Recent Activity — spans 2 of 3 cols on lg */}
          <div className="lg:col-span-2" style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '18px 20px' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 14 }}>
              Recent Activity
            </p>
            {recentWorkouts.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < recentWorkouts.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ padding: 8, borderRadius: 4, background: BG_EL, color: TEXT_MUT, display: 'flex' }}>
                    <Dumbbell size={13} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: TEXT_PRI }}>{w.focus}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: TEXT_MUT }}>{w.date} · {w.duration} min</p>
                  </div>
                </div>
                <span style={{
                  padding: '3px 9px', borderRadius: 9999, fontSize: 11, fontFamily: 'DM Sans', fontWeight: 600,
                  background: w.completion === 100 ? 'rgba(92,184,138,0.10)' : 'rgba(245,137,74,0.10)',
                  color: w.completion === 100 ? GREEN : ORANGE,
                  border: `1px solid ${w.completion === 100 ? 'rgba(92,184,138,0.25)' : 'rgba(245,137,74,0.25)'}`,
                }}>
                  {w.completion}%
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 2 }}>
              Quick Actions
            </p>
            {[
              { icon: <Scale size={14} />,    label: 'Log Weight', action: () => navigate('/progress'),      color: BLUE  },
              { icon: <Plus size={14} />,     label: 'Log Meal',   action: () => navigate('/nutrition/log'), color: GREEN },
              { icon: <Droplets size={14} />, label: 'Log Water',  action: incrementWater, color: '#60A5FA', extra: `${waterGlasses}x` },
            ].map(({ icon, label, action, color, extra }) => (
              <motion.div
                key={label} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={action}
                style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', minHeight: 48 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ padding: 7, borderRadius: 4, background: `${color}18`, color }}>{icon}</div>
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: TEXT_PRI }}>{label}</span>
                </div>
                {extra
                  ? <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: BLUE }}>{extra}</span>
                  : <ChevronRight size={13} style={{ color: TEXT_MUT }} />}
              </motion.div>
            ))}

            {/* AI Coach */}
            <motion.div
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/coach')}
              style={{ background: BLUE_DIM, border: `1px solid rgba(37,99,235,0.22)`, borderRadius: 4, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 48 }}
            >
              <div style={{ padding: 7, borderRadius: 4, background: BLUE_DIM, color: BLUE }}>
                <MessageCircle size={14} />
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: BLUE }}>AI Coach</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: TEXT_MUT }}>Ask anything…</p>
              </div>
              <Activity size={13} style={{ color: BLUE, marginLeft: 'auto', opacity: 0.5 }} />
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </PageWrapper>
  )
}
