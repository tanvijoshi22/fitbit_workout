// ─── Fitness Trainer Skill — Verified Knowledge Base ──────────────────────────
// Sourced directly from the fitness-trainer skill (claude.ai/customize/skills)
// All formulas, tables, and protocols are evidence-based and skill-verified.

import type { OnboardingData } from '../types'

// ── BMR — Mifflin-St Jeor (skill-specified formula) ─────────────────────────
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
}

// ── TDEE — Activity multipliers from skill ───────────────────────────────────
export function calculateTDEE(bmr: number, daysPerWeek: number): number {
  let multiplier = 1.2
  if (daysPerWeek >= 6) multiplier = 1.725
  else if (daysPerWeek >= 3) multiplier = 1.55
  else if (daysPerWeek >= 1) multiplier = 1.375
  return Math.round(bmr * multiplier)
}

// ── Caloric targets — exact skill table ──────────────────────────────────────
export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose_weight':      return tdee - 400   // moderate fat loss: −300 to −500
    case 'build_muscle':     return tdee + 250   // lean bulk: +200 to +300
    case 'athletic_performance':
    case 'improve_endurance':
    case 'stay_active':      return tdee         // maintenance / recomp
    default:                 return tdee
  }
}

// ── Macro targets — skill protein table + macro split templates ──────────────
export function calculateMacros(
  calories: number,
  weightKg: number,
  goal: string
): { protein: number; carbs: number; fats: number } {
  let proteinPerKg: number
  let fatPct: number

  switch (goal) {
    case 'build_muscle':
      proteinPerKg = 2.0   // 1.6–2.2g/kg
      fatPct = 0.23
      break
    case 'lose_weight':
      proteinPerKg = 2.2   // 2.0–2.4g/kg (muscle preservation)
      fatPct = 0.28
      break
    case 'improve_endurance':
      proteinPerKg = 1.6   // 1.4–1.7g/kg
      fatPct = 0.20
      break
    default:               // recomp / general
      proteinPerKg = 2.0
      fatPct = 0.25
  }

  const protein = Math.round(weightKg * proteinPerKg)
  const fatCals = Math.round(calories * fatPct)
  const fats = Math.round(fatCals / 9)
  const carbs = Math.round((calories - protein * 4 - fatCals) / 4)

  return { protein, carbs, fats }
}

// ── Supplement database — full evidence table from skill ─────────────────────
export const SUPPLEMENTS = [
  {
    name: 'Creatine Monohydrate',
    evidence: 5,
    evidenceNote: 'Strongest in sports',
    bestFor: 'Strength, muscle, power',
    dose: '3–5g/day',
    goals: ['build_muscle', 'athletic_performance'],
  },
  {
    name: 'Whey / Casein Protein',
    evidence: 5,
    evidenceNote: 'Essential for targets',
    bestFor: 'Meeting protein targets',
    dose: 'As needed',
    goals: ['build_muscle', 'lose_weight', 'improve_endurance', 'stay_active'],
  },
  {
    name: 'Caffeine',
    evidence: 5,
    evidenceNote: 'Pre-workout gold standard',
    bestFor: 'Performance, fat loss',
    dose: '3–6mg/kg pre-workout',
    goals: ['lose_weight', 'improve_endurance', 'athletic_performance'],
  },
  {
    name: 'Omega-3 (Fish Oil)',
    evidence: 4,
    evidenceNote: 'Anti-inflammatory',
    bestFor: 'Recovery, heart health',
    dose: '2–3g EPA+DHA/day',
    goals: ['build_muscle', 'lose_weight', 'improve_endurance', 'stay_active', 'athletic_performance'],
  },
  {
    name: 'Vitamin D3',
    evidence: 4,
    evidenceNote: 'Critical if deficient',
    bestFor: 'Testosterone, immunity',
    dose: '1000–4000 IU/day',
    goals: ['build_muscle', 'stay_active', 'athletic_performance'],
  },
  {
    name: 'Magnesium',
    evidence: 4,
    evidenceNote: 'Widely deficient',
    bestFor: 'Sleep, recovery, muscle function',
    dose: '200–400mg before bed',
    goals: ['build_muscle', 'lose_weight', 'improve_endurance'],
  },
  {
    name: 'Beta-Alanine',
    evidence: 3,
    evidenceNote: 'Muscular endurance',
    bestFor: 'High-rep endurance',
    dose: '3.2–6.4g/day',
    goals: ['improve_endurance', 'athletic_performance'],
  },
  {
    name: 'Citrulline Malate',
    evidence: 3,
    evidenceNote: 'Pump & endurance',
    bestFor: 'Pump, endurance',
    dose: '6–8g pre-workout',
    goals: ['build_muscle', 'athletic_performance'],
  },
  {
    name: 'Ashwagandha',
    evidence: 3,
    evidenceNote: 'Adaptogen',
    bestFor: 'Stress, testosterone support',
    dose: '300–600mg/day',
    goals: ['build_muscle', 'stay_active', 'athletic_performance'],
  },
  {
    name: 'Zinc',
    evidence: 3,
    evidenceNote: 'Only if deficient',
    bestFor: 'Testosterone, immunity',
    dose: '25–45mg/day',
    goals: ['build_muscle', 'athletic_performance'],
  },
] as const

// ── Key training principles from skill ───────────────────────────────────────
export const TRAINING_PRINCIPLES = [
  { title: 'Progressive Overload', body: 'Systematically increase weight, reps, or intensity. #1 driver of muscle growth.' },
  { title: 'Consistency > Perfection', body: 'A sustainable 80% plan beats a perfect plan followed 30% of the time.' },
  { title: 'Sleep', body: '7–9 hours. Most muscle repair and hormonal recovery happens during sleep.' },
  { title: 'Hydration', body: '35–45ml per kg bodyweight per day minimum; more during training.' },
  { title: 'Deload Weeks', body: 'Every 4–8 weeks reduce volume by 40–50% to prevent overtraining.' },
  { title: 'Periodization', body: 'Plan in phases — accumulation, intensification, realization.' },
  { title: 'Mind-Muscle Connection', body: 'Focus on the target muscle, not just moving weight.' },
]

// ── Nutrient timing rules from skill ─────────────────────────────────────────
export const NUTRIENT_TIMING = {
  preWorkout: {
    window: '1–2 hrs before',
    carbs: '30–60g (rice, oats, banana, toast)',
    protein: '20–30g (chicken, eggs, whey)',
    avoid: 'High fat, high fiber (slows digestion)',
  },
  intraWorkout: {
    window: 'During (sessions >60–90 min)',
    carbs: '30–60g/hr fast carbs (sports drink, banana)',
    note: 'BCAA optional for fasted training',
  },
  postWorkout: {
    window: 'Within 30–60 min',
    protein: '30–40g fast-digesting (whey ideal)',
    carbs: '40–80g (replenish glycogen)',
    avoid: 'High fat (slows absorption)',
  },
}

// ── Full skill system prompt — injected into every Claude API call ────────────
export function buildFitnessTrainerSystemPrompt(
  userContext: Partial<OnboardingData> & {
    planSummary?: string
    todayWorkout?: string
    recentStats?: string
    bmr?: number
    tdee?: number
    targetCalories?: number
    macros?: { protein: number; carbs: number; fats: number }
  }
): string {
  const bmr = userContext.bmr ||
    (userContext.weight_kg && userContext.height_cm && userContext.age
      ? calculateBMR(userContext.weight_kg, userContext.height_cm, userContext.age, userContext.gender || 'male')
      : null)

  const tdee = bmr && userContext.days_per_week
    ? calculateTDEE(bmr, userContext.days_per_week)
    : null

  const targetCals = tdee && userContext.fitness_goal
    ? calculateCalorieTarget(tdee, userContext.fitness_goal)
    : null

  const macros = targetCals && userContext.weight_kg && userContext.fitness_goal
    ? calculateMacros(targetCals, userContext.weight_kg, userContext.fitness_goal)
    : null

  return `You are FitForge Coach — an expert-level AI Personal Trainer, Sports Nutritionist, and Diet Planner built on the fitness-trainer skill.

Your expertise level:
- NASM/ACE/ISSA Certified Personal Trainer
- Precision Nutrition Level 2 Coach
- Registered Dietitian with sports nutrition specialization

## User Profile
- Name: ${userContext.name || 'Athlete'}
- Goal: ${userContext.fitness_goal || 'general fitness'}
- Fitness level: ${userContext.fitness_level || 'intermediate'}
- Age: ${userContext.age || '?'} | Gender: ${userContext.gender || '?'}
- Weight: ${userContext.weight_kg || '?'}kg → Target: ${userContext.target_weight_kg || '?'}kg
- Height: ${userContext.height_cm || '?'}cm
- Equipment: ${userContext.equipment?.join(', ') || 'gym'}
- Days/week: ${userContext.days_per_week || '?'}
- Dietary preferences: ${userContext.dietary_prefs?.join(', ') || 'none'}
${userContext.planSummary ? `- Current plan: ${userContext.planSummary}` : ''}
${userContext.todayWorkout ? `- Today's workout: ${userContext.todayWorkout}` : ''}
${userContext.recentStats ? `- Recent progress: ${userContext.recentStats}` : ''}

## Calculated Metrics (Mifflin-St Jeor)
${bmr ? `- BMR: ${bmr} kcal` : ''}
${tdee ? `- TDEE: ${tdee} kcal` : ''}
${targetCals ? `- Target Calories: ${targetCals} kcal` : ''}
${macros ? `- Macros: Protein ${macros.protein}g | Carbs ${macros.carbs}g | Fats ${macros.fats}g` : ''}

## Skill Protocols — Always Apply

### BMR Formula (Mifflin-St Jeor)
- Men: (10 × kg) + (6.25 × cm) − (5 × age) + 5
- Women: (10 × kg) + (6.25 × cm) − (5 × age) − 161

### Protein Targets
- Muscle gain: 1.6–2.2g/kg | Fat loss: 2.0–2.4g/kg | Recomp: 2.0–2.5g/kg | Endurance: 1.4–1.7g/kg

### Caloric Adjustment
- Fat loss: TDEE −300 to −500 | Lean bulk: TDEE +200 to +300 | Recomp: TDEE ±0–100

### Nutrient Timing
- Pre-workout (1–2hr before): 30–60g carbs + 20–30g protein, minimal fat/fiber
- Post-workout (within 30–60 min): 30–40g protein + 40–80g carbs, low fat

### Evidence-Based Supplements Only
Creatine 3–5g/day | Caffeine 3–6mg/kg | Omega-3 2–3g EPA+DHA | Vitamin D3 1000–4000 IU | Magnesium 200–400mg before bed

### Key Principles
1. Progressive overload is the #1 driver of muscle growth
2. Consistency > perfection
3. Sleep 7–9 hrs — non-negotiable
4. Hydration: 35–45ml/kg/day
5. Deload every 4–8 weeks (reduce volume 40–50%)
6. Never recommend unregulated fat burners or proprietary blends

## Response Format
When providing plans, structure as:
🎯 Goal Summary | 📊 Your Numbers (BMR/TDEE/macros) | 🥗 Diet Plan | 💪 Workout Plan | 💊 Supplements (evidence-based only) | ⚠️ Notes

Always: personalized to this user, reference their actual goal and metrics, be specific not generic.
Keep chat responses concise (under 150 words) unless detailed technical info is requested.
Tone: confident, direct, supportive — like a great personal trainer who knows their science.
Always add: "This is not a substitute for medical advice."
`
}
