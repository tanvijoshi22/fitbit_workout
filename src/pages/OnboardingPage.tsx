import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { supabase } from '../api/supabase'
import { useAppStore } from '../store/useAppStore'
import { generateFitnessPlan, generateDietPlan } from '../api/claude'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { FitnessGoal, FitnessLevel, Equipment, DietaryPref, OnboardingData } from '../types'
import toast from 'react-hot-toast'

const TOTAL_STEPS = 7

const goalOptions: { value: FitnessGoal; emoji: string; title: string; subtitle: string }[] = [
  { value: 'lose_weight', emoji: '🔥', title: 'Lose Weight', subtitle: 'Burn fat, get lean' },
  { value: 'build_muscle', emoji: '💪', title: 'Build Muscle', subtitle: 'Gain mass, get stronger' },
  { value: 'improve_endurance', emoji: '⚡', title: 'Improve Endurance', subtitle: 'Run farther, last longer' },
  { value: 'stay_active', emoji: '🧘', title: 'Stay Active', subtitle: 'Maintain fitness, feel good' },
  { value: 'athletic_performance', emoji: '🏋️', title: 'Athletic Performance', subtitle: 'Train like an athlete' },
]

const levelOptions: { value: FitnessLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Under 6 months experience' },
  { value: 'intermediate', label: 'Intermediate', desc: '6 months – 2 years' },
  { value: 'advanced', label: 'Advanced', desc: '2+ years of training' },
]

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'bodyweight', label: 'No Equipment' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell + Rack' },
  { value: 'resistance_bands', label: 'Resistance Bands' },
  { value: 'pullup_bar', label: 'Pull-up Bar' },
  { value: 'full_gym', label: 'Full Gym Access' },
  { value: 'cardio_machines', label: 'Cardio Machines' },
]

const dietOptions: { value: DietaryPref; label: string }[] = [
  { value: 'none', label: 'No Restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'lactose_free', label: 'Lactose-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'high_protein', label: 'High Protein' },
]

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Full Body']
const enduranceEvents = ['5K', '10K', 'Half Marathon', 'Marathon', 'Triathlon', 'Custom']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === current ? 28 : 8,
            backgroundColor: i + 1 < current ? '#06C5D9' : i + 1 === current ? '#06C5D9' : '#132B42',
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
      <span className="ml-2 font-mono text-xs text-text-muted">
        {current}/{total}
      </span>
    </div>
  )
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2 rounded-lg font-body text-sm uppercase tracking-wider transition-all duration-150 border ${
        selected
          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-glow-xs'
          : 'border-border bg-bg-elevated text-text-secondary hover:border-accent-primary/40'
      }`}
    >
      {selected && <Check size={12} className="inline mr-1.5" />}
      {children}
    </motion.button>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setUser, setActivePlan, setActiveDietPlan, onboardingData, setOnboardingData } = useAppStore()
  const [step, setStep] = useState(1)
  const [forging, setForging] = useState(false)
  const [forgingText, setForgingText] = useState('Analyzing your goals…')
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')

  const data = onboardingData as Partial<OnboardingData>

  const update = (patch: Partial<OnboardingData>) => setOnboardingData(patch)

  const toggleArrayItem = <T,>(arr: T[] | undefined, item: T): T[] => {
    const current = arr || []
    return current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }
  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleForge = async () => {
    setForging(true)
    const texts = [
      'Analyzing your goals…',
      'Building your schedule…',
      'Optimizing recovery days…',
      'Crafting your meal plan…',
      'Plan forged.',
    ]
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < texts.length) setForgingText(texts[i])
      else clearInterval(interval)
    }, 1800)

    try {
      // Try getUser first, fall back to getSession
      let authUser = (await supabase.auth.getUser()).data.user
      if (!authUser) {
        const { data: { session } } = await supabase.auth.getSession()
        authUser = session?.user ?? null
      }
      if (!authUser) throw new Error('Not authenticated')

      const profile = {
        ...data,
        unit_system: unitSystem,
      } as OnboardingData

      // Save user profile
      const { data: savedProfile, error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          target_weight_kg: profile.target_weight_kg,
          fitness_goal: profile.fitness_goal,
          fitness_level: profile.fitness_level,
          equipment: profile.equipment,
          dietary_prefs: profile.dietary_prefs,
          days_per_week: profile.days_per_week,
          session_duration: profile.session_duration,
        })
        .select()
        .single()

      if (profileError) throw profileError
      setUser(savedProfile)

      // Generate plans in parallel
      const [planData, dietData] = await Promise.all([
        generateFitnessPlan(profile),
        generateDietPlan(profile),
      ])

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + (profile.timeline_weeks || 8) * 7)

      const [{ data: savedPlan }, { data: savedDiet }] = await Promise.all([
        supabase
          .from('fitness_plans')
          .insert({
            user_id: authUser.id,
            plan_name: planData.planName,
            plan_data: planData,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            is_active: true,
          })
          .select()
          .single(),
        supabase
          .from('diet_plans')
          .insert({
            user_id: authUser.id,
            plan_data: dietData,
            daily_calories: dietData.dailyCalories,
            macros: dietData.macros,
            is_active: true,
          })
          .select()
          .single(),
      ])

      if (savedPlan) setActivePlan(savedPlan)
      if (savedDiet) setActiveDietPlan(savedDiet)

      clearInterval(interval)
      setForgingText('Plan forged.')
      await new Promise((r) => setTimeout(r, 1000))
      navigate('/dashboard')
    } catch (err: unknown) {
      clearInterval(interval)
      setForging(false)
      const message = err instanceof Error ? err.message : 'Failed to generate plan'
      toast.error(message)
    }
  }

  if (forging) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Activity size={64} className="text-accent-primary" />
        </motion.div>
        <motion.p
          key={forgingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-text-primary tracking-wider text-center"
        >
          {forgingText.toUpperCase()}
        </motion.p>
        <div className="w-64 h-1 bg-bg-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-cyan rounded-full"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 9, ease: 'easeInOut' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-1.5 rounded-lg bg-gradient-cyan"><Activity size={18} className="text-white" strokeWidth={2.5} /></div>
          <span className="font-display text-2xl text-text-primary tracking-wider">FITFORGE</span>
        </div>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">PERSONAL INFO</h2>
                  <p className="text-text-muted font-body text-sm mt-1">Tell us about yourself</p>
                </div>
                <Input label="Your Name" placeholder="e.g. Alex" value={data.name || ''} onChange={(e) => update({ name: e.target.value })} />
                <Input label="Age" type="number" min={13} max={80} placeholder="25" value={data.age || ''} onChange={(e) => update({ age: parseInt(e.target.value) })} />
                <div>
                  <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium block mb-2">Gender</label>
                  <div className="flex flex-wrap gap-2">
                    {(['male', 'female', 'non-binary', 'prefer-not-to-say'] as const).map((g) => (
                      <Chip key={g} selected={data.gender === g} onClick={() => update({ gender: g })}>
                        {g.replace(/-/g, ' ')}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {(['metric', 'imperial'] as const).map((u) => (
                      <Chip key={u} selected={unitSystem === u} onClick={() => setUnitSystem(u)}>
                        {u}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Height (${unitSystem === 'metric' ? 'cm' : 'ft'})`}
                    type="number"
                    placeholder={unitSystem === 'metric' ? '175' : '5.9'}
                    value={data.height_cm || ''}
                    onChange={(e) => update({ height_cm: parseFloat(e.target.value) })}
                  />
                  <Input
                    label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                    type="number"
                    placeholder={unitSystem === 'metric' ? '75' : '165'}
                    value={data.weight_kg || ''}
                    onChange={(e) => update({ weight_kg: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Goal ── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">YOUR GOAL</h2>
                  <p className="text-text-muted font-body text-sm mt-1">What are you training for?</p>
                </div>
                <div className="flex flex-col gap-3">
                  {goalOptions.map((g) => (
                    <motion.button
                      key={g.value}
                      type="button"
                      onClick={() => update({ fitness_goal: g.value })}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center gap-4 p-4 rounded border text-left transition-colors duration-150 ${
                        data.fitness_goal === g.value
                          ? 'border-accent-primary bg-accent-primary/10'
                          : 'border-border bg-bg-secondary hover:border-text-muted'
                      }`}
                    >
                      <span className="text-2xl">{g.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-body font-semibold text-sm uppercase tracking-wider ${data.fitness_goal === g.value ? 'text-accent-primary' : 'text-text-primary'}`}>{g.title}</p>
                        <p className="font-body text-xs text-text-muted mt-0.5">{g.subtitle}</p>
                      </div>
                      {data.fitness_goal === g.value && <Check size={18} className="text-accent-primary flex-shrink-0" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Target Details ── */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">TARGET DETAILS</h2>
                  <p className="text-text-muted font-body text-sm mt-1">Set your specific targets</p>
                </div>

                {(data.fitness_goal === 'lose_weight' || data.fitness_goal === 'build_muscle') && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={`Target Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                      type="number"
                      placeholder="70"
                      value={data.target_weight_kg || ''}
                      onChange={(e) => update({ target_weight_kg: parseFloat(e.target.value) })}
                    />
                    <Input
                      label="Timeline (weeks)"
                      type="number"
                      min={4}
                      max={52}
                      placeholder="12"
                      value={data.timeline_weeks || ''}
                      onChange={(e) => update({ timeline_weeks: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {data.fitness_goal === 'build_muscle' && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium block mb-2">Target Muscle Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroups.map((mg) => (
                        <Chip key={mg} selected={(data.muscle_groups || []).includes(mg)} onClick={() => update({ muscle_groups: toggleArrayItem(data.muscle_groups, mg) })}>
                          {mg}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {data.fitness_goal === 'improve_endurance' && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium block mb-2">Target Event</label>
                    <div className="flex flex-wrap gap-2">
                      {enduranceEvents.map((ev) => (
                        <Chip key={ev} selected={data.target_event === ev} onClick={() => update({ target_event: ev })}>
                          {ev}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium block mb-3">Workout Days / Week</label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map((d) => (
                      <Chip key={d} selected={data.days_per_week === d} onClick={() => update({ days_per_week: d })}>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium block mb-3">Session Duration</label>
                  <div className="flex gap-2">
                    {([30, 45, 60, 90] as const).map((d) => (
                      <Chip key={d} selected={data.session_duration === d} onClick={() => update({ session_duration: d })}>
                        {d} min
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Fitness Level ── */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">FITNESS LEVEL</h2>
                  <p className="text-text-muted font-body text-sm mt-1">How experienced are you?</p>
                </div>
                <div className="flex flex-col gap-3">
                  {levelOptions.map((l) => (
                    <motion.button
                      key={l.value}
                      type="button"
                      onClick={() => update({ fitness_level: l.value })}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between p-4 rounded border text-left transition-colors duration-150 ${
                        data.fitness_level === l.value
                          ? 'border-accent-primary bg-accent-primary/10'
                          : 'border-border bg-bg-secondary hover:border-text-muted'
                      }`}
                    >
                      <div>
                        <p className={`font-body font-semibold text-sm uppercase tracking-wider ${data.fitness_level === l.value ? 'text-accent-primary' : 'text-text-primary'}`}>{l.label}</p>
                        <p className="font-body text-xs text-text-muted mt-0.5">{l.desc}</p>
                      </div>
                      {data.fitness_level === l.value && <Check size={18} className="text-accent-primary" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: Equipment ── */}
            {step === 5 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">EQUIPMENT</h2>
                  <p className="text-text-muted font-body text-sm mt-1">What do you have access to?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((eq) => (
                    <Chip
                      key={eq.value}
                      selected={(data.equipment || []).includes(eq.value)}
                      onClick={() => update({ equipment: toggleArrayItem(data.equipment, eq.value) })}
                    >
                      {eq.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 6: Diet Prefs ── */}
            {step === 6 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">DIETARY PREFS</h2>
                  <p className="text-text-muted font-body text-sm mt-1">Any dietary restrictions?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map((d) => (
                    <Chip
                      key={d.value}
                      selected={(data.dietary_prefs || []).includes(d.value)}
                      onClick={() => update({ dietary_prefs: toggleArrayItem(data.dietary_prefs, d.value) })}
                    >
                      {d.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 7: Summary + Confirm ── */}
            {step === 7 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display text-4xl text-text-primary tracking-wider">YOUR PROFILE</h2>
                  <p className="text-text-muted font-body text-sm mt-1">Review and confirm your setup</p>
                </div>

                <div className="bg-bg-secondary border border-border rounded p-5 flex flex-col gap-4">
                  {[
                    { label: 'Name', value: data.name },
                    { label: 'Age', value: data.age ? `${data.age} years` : '—' },
                    { label: 'Body', value: data.weight_kg ? `${data.weight_kg}kg → ${data.target_weight_kg || '?'}kg` : '—' },
                    { label: 'Goal', value: goalOptions.find((g) => g.value === data.fitness_goal)?.title || '—' },
                    { label: 'Level', value: levelOptions.find((l) => l.value === data.fitness_level)?.label || '—' },
                    { label: 'Schedule', value: data.days_per_week ? `${data.days_per_week} days/week × ${data.session_duration} min` : '—' },
                    { label: 'Equipment', value: (data.equipment || []).join(', ') || '—' },
                    { label: 'Diet', value: (data.dietary_prefs || []).join(', ') || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-xs uppercase tracking-widest text-text-muted font-body flex-shrink-0 w-24">{label}</span>
                      <span className="font-body text-sm text-text-primary text-right capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={handleForge}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,197,217,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-gradient-cyan rounded-xl font-display text-2xl text-white tracking-wider uppercase flex items-center justify-center gap-3 shadow-glow transition-shadow duration-300 btn-glow"
                >
                  <Zap size={24} fill="currentColor" />
                  FORGE MY PLAN
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-10">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} icon={<ChevronLeft size={16} />}>
              Back
            </Button>
            <Button onClick={handleNext} icon={<ChevronRight size={16} />}>
              Next
            </Button>
          </div>
        )}
        {step === TOTAL_STEPS && (
          <div className="mt-4">
            <Button variant="ghost" onClick={handleBack} icon={<ChevronLeft size={16} />}>
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
