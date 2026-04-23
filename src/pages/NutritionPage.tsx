import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Droplets, Plus } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { useAppStore } from '../store/useAppStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { TopBar } from '../components/layout/TopBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { generateDietPlan } from '../api/claude'
import { supabase } from '../api/supabase'
import type { OnboardingData } from '../types'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MACRO_COLORS = { protein: '#06C5D9', carbs: '#38E8F5', fats: '#F5A623' }

function MacroRing({ protein, carbs, fats }: { protein: number; carbs: number; fats: number }) {
  const total = protein + carbs + fats
  const data = [
    { name: 'Protein', value: protein, color: MACRO_COLORS.protein },
    { name: 'Carbs', value: carbs, color: MACRO_COLORS.carbs },
    { name: 'Fats', value: fats, color: MACRO_COLORS.fats },
  ]

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}g`, name]}
              contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '4px', fontFamily: 'DM Sans' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="font-body text-xs text-text-secondary uppercase tracking-wider w-14">{name}</span>
            <span className="font-mono text-sm font-bold text-text-primary">{Math.round((value / total) * 100)}%</span>
            <span className="font-mono text-xs text-text-muted">{value}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NutritionPage() {
  const { activeDietPlan, setActiveDietPlan, onboardingData, todayMealLogs, waterGlasses, incrementWater } = useAppStore()
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const macros = activeDietPlan?.plan_data?.macros || { protein: 150, carbs: 200, fats: 60 }
  const targetCalories = activeDietPlan?.daily_calories || 2100
  const todayCalories = todayMealLogs.reduce((s, l) => s + l.calories, 0)
  const hydrationGoal = activeDietPlan?.plan_data?.hydrationGoal || 8
  const dayPlan = activeDietPlan?.plan_data?.days?.[selectedDay]

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      const dietData = await generateDietPlan(onboardingData as OnboardingData)
      const { data: saved } = await supabase
        .from('diet_plans')
        .insert({
          user_id: authUser.id,
          plan_data: dietData,
          daily_calories: dietData.dailyCalories,
          macros: dietData.macros,
          is_active: true,
        })
        .select()
        .single()
      if (saved) { setActiveDietPlan(saved); toast.success('Diet plan generated!') }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageWrapper>
      <TopBar />
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-4xl text-text-primary tracking-wider">NUTRITION</h1>

        {!activeDietPlan ? (
          <Card className="text-center py-16">
            <p className="font-display text-2xl text-text-muted tracking-wider mb-4">NO DIET PLAN YET</p>
            <Button onClick={handleGenerate} loading={generating}>Generate My Diet Plan</Button>
          </Card>
        ) : (
          <>
            {/* Macro Ring + Calorie Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-4">DAILY MACROS</p>
                <MacroRing protein={macros.protein} carbs={macros.carbs} fats={macros.fats} />
              </Card>
              <Card className="flex flex-col justify-between">
                <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium">CALORIES TODAY</p>
                <div className="text-center my-4">
                  <p className="font-mono text-5xl font-bold text-text-primary">{todayCalories}</p>
                  <p className="font-body text-sm text-text-muted mt-1">of {targetCalories} kcal</p>
                </div>
                <ProgressBar value={(todayCalories / targetCalories) * 100} color={todayCalories > targetCalories ? 'warning' : 'accent'} />

                {/* Water Tracker */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-400" />
                    <span className="font-body text-sm text-text-secondary">Water</span>
                    <span className="font-mono text-sm font-bold text-blue-400">{waterGlasses}/{hydrationGoal}</span>
                  </div>
                  <button onClick={incrementWater} className="w-7 h-7 rounded border border-blue-400/30 bg-blue-400/10 text-blue-400 flex items-center justify-center hover:bg-blue-400/20 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </Card>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded font-body text-sm uppercase tracking-wider transition-colors duration-150 border ${
                    selectedDay === i
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border bg-bg-elevated text-text-muted hover:text-text-primary'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Meal Cards */}
            {dayPlan ? (
              <div className="flex flex-col gap-3">
                {dayPlan.meals.map((meal, i) => {
                  const key = `${meal.type}-${i}`
                  const isOpen = expandedMeal === key
                  return (
                    <div key={key} className="border border-border rounded bg-bg-secondary">
                      <button
                        onClick={() => setExpandedMeal(isOpen ? null : key)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-widest text-accent-primary font-body font-medium">{meal.type}</p>
                          <p className="font-body font-semibold text-sm text-text-primary mt-0.5">{meal.name}</p>
                          <p className="font-mono text-xs text-text-muted mt-1">{meal.calories} kcal · P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-text-primary">{meal.calories}</span>
                          <span className="font-body text-xs text-text-muted">kcal</span>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={16} className="text-text-muted" />
                          </motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-border pt-3">
                              <p className="text-xs uppercase tracking-widest text-text-muted font-body mb-2">Ingredients</p>
                              <div className="flex flex-wrap gap-1.5">
                                {meal.ingredients.map((ing, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-bg-elevated border border-border rounded text-xs font-body text-text-secondary">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                              <p className="font-body text-xs text-text-muted mt-3">Prep time: {meal.prepTime} min</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Card className="text-center py-8">
                <p className="font-body text-text-muted text-sm">No meal plan for this day</p>
              </Card>
            )}

            {/* Supplement Suggestions */}
            {activeDietPlan.plan_data.supplementSuggestions?.length > 0 && (
              <Card variant="elevated">
                <p className="text-xs uppercase tracking-widest text-text-secondary font-body font-medium mb-3">SUPPLEMENT SUGGESTIONS</p>
                <div className="flex flex-wrap gap-2">
                  {activeDietPlan.plan_data.supplementSuggestions.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-bg-primary border border-border rounded text-xs font-body text-text-secondary">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
