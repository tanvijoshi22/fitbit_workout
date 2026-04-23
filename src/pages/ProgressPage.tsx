import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp, Scale, Target, Minus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { WeightLog } from '../types'
import toast from 'react-hot-toast'

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-elevated border border-border rounded px-3 py-2">
        <p className="font-mono text-xs text-text-muted">{label}</p>
        <p className="font-mono text-sm text-accent-primary font-bold">
          {payload[0].value.toFixed(1)} kg
        </p>
      </div>
    )
  }
  return null
}

export function ProgressPage() {
  const { user, setUser, weightLogs, addWeightLog, setWeightLogs } = useAppStore()
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  // Fetch weight logs from Supabase on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return
        const { data } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', authUser.id)
          .order('logged_at', { ascending: false })
          .limit(90)
        if (data) setWeightLogs(data)
      } catch {
        // noop — show whatever is in local store
      } finally {
        setFetchLoading(false)
      }
    }
    fetchLogs()
  }, [setWeightLogs])

  const latestWeight = weightLogs[0]?.weight_kg ?? user?.weight_kg ?? 0
  const targetWeight = user?.target_weight_kg ?? 0
  const startWeight = user?.weight_kg ?? latestWeight

  const isGoalLoss = startWeight >= targetWeight
  const delta = latestWeight - startWeight
  const goalDelta = targetWeight - startWeight
  const progressPct =
    goalDelta !== 0
      ? Math.min(100, Math.max(0, (delta / goalDelta) * 100))
      : 0

  const toGo = Math.abs(latestWeight - targetWeight)
  const trend = weightLogs.length >= 2
    ? weightLogs[0].weight_kg - weightLogs[1].weight_kg
    : 0

  // Build chart data — last 30 entries, chronological
  const chartData = [...weightLogs]
    .slice(0, 30)
    .reverse()
    .map((log) => ({
      date: format(new Date(log.logged_at), 'MMM d'),
      weight: log.weight_kg,
    }))

  const handleLog = async () => {
    const w = parseFloat(weight)
    if (!w || w < 20 || w > 500) {
      toast.error('Enter a valid weight (20–500 kg)')
      return
    }
    setSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('weight_logs')
        .insert({ user_id: authUser.id, weight_kg: w })
        .select()
        .single()
      if (error) throw error

      addWeightLog(data as WeightLog)

      // Update user's current weight
      const { data: updatedUser } = await supabase
        .from('users')
        .update({ weight_kg: w })
        .eq('id', authUser.id)
        .select()
        .single()
      if (updatedUser) setUser(updatedUser)

      setWeight('')
      toast.success(`Logged ${w} kg!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }

  return (
    <PageWrapper>
      <TopBar />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 max-w-2xl"
      >
        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl text-text-primary tracking-wider"
        >
          PROGRESS
        </motion.h1>

        {/* ── Stat Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <Scale size={16} className="text-accent-primary mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {latestWeight > 0 ? latestWeight.toFixed(1) : '—'}
            </p>
            <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">Current</p>
            {trend !== 0 && (
              <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-mono ${
                trend < 0 ? 'text-success' : 'text-warning'
              }`}>
                {trend < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {Math.abs(trend).toFixed(1)}
              </div>
            )}
          </Card>
          <Card className="text-center py-4">
            <Target size={16} className="text-accent-primary mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {targetWeight > 0 ? targetWeight.toFixed(1) : '—'}
            </p>
            <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">Target</p>
          </Card>
          <Card className="text-center py-4">
            <Minus size={16} className="text-accent-primary mx-auto mb-2" />
            <p className={`font-mono text-2xl font-bold ${toGo < 1 ? 'text-success' : 'text-text-primary'}`}>
              {targetWeight > 0 ? toGo.toFixed(1) : '—'}
            </p>
            <p className="text-xs uppercase tracking-wider text-text-muted font-body mt-1">
              {isGoalLoss ? 'To Lose' : 'To Gain'}
            </p>
          </Card>
        </motion.div>

        {/* ── Goal Progress ── */}
        {targetWeight > 0 && latestWeight > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-3">
                GOAL PROGRESS
              </p>
              <ProgressBar
                value={progressPct}
                label={`${progressPct.toFixed(0)}% toward target`}
                showPercent
                color={progressPct >= 100 ? 'success' : 'accent'}
              />
              {progressPct >= 100 && (
                <p className="font-body text-sm text-success mt-2">
                  Goal reached! Consider updating your target.
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* ── Log Weight ── */}
        <motion.div variants={itemVariants}>
          <Card variant="accent-border">
            <p className="text-xs uppercase tracking-widest text-accent-primary font-body font-medium mb-4">
              LOG WEIGHT
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  min={20}
                  max={500}
                  placeholder={latestWeight > 0 ? latestWeight.toFixed(1) : '75.0'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLog()}
                />
              </div>
              <Button onClick={handleLog} loading={saving} disabled={!weight} className="mb-0.5">
                Log
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Weight Chart ── */}
        {chartData.length > 1 && (
          <motion.div variants={itemVariants}>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">
                WEIGHT TREND
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#555550', fontSize: 10, fontFamily: 'DM Sans' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#555550', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {targetWeight > 0 && (
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#39D353"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{ value: 'Goal', fill: '#39D353', fontSize: 10, fontFamily: 'DM Sans' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#06C5D9"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#06C5D9', stroke: '#030D18', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* ── Recent Log ── */}
        <motion.div variants={itemVariants}>
          <Card>
            <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">
              WEIGHT LOG
            </p>
            {fetchLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded animate-shimmer" />
                ))}
              </div>
            ) : weightLogs.length === 0 ? (
              <p className="font-body text-sm text-text-muted text-center py-8">
                No weight logs yet — log your first weigh-in above.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {weightLogs.slice(0, 20).map((log, i) => {
                  const prev = weightLogs[i + 1]
                  const diff = prev ? log.weight_kg - prev.weight_kg : null
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-body font-medium text-sm text-text-primary">
                          {format(new Date(log.logged_at), 'EEEE, MMM d')}
                        </p>
                        <p className="font-mono text-xs text-text-muted">
                          {format(new Date(log.logged_at), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {diff !== null && (
                          <span className={`font-mono text-xs ${diff < 0 ? 'text-success' : diff > 0 ? 'text-warning' : 'text-text-muted'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        )}
                        <span className="font-mono text-lg font-bold text-text-primary">
                          {log.weight_kg.toFixed(1)}
                          <span className="text-xs text-text-muted ml-1 font-normal">kg</span>
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
