import Anthropic from '@anthropic-ai/sdk'
import type { OnboardingData } from '../types'
import { mockFitnessPlan, mockDietPlan, getMockMotivationalMessage, getMockCoachReply } from './mockData'
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
  buildFitnessTrainerSystemPrompt,
} from './fitnessTrainerKnowledge'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
})

const MODEL = 'claude-sonnet-4-6'

// ─── Generate Fitness Plan ─────────────────────────────────────────────────
// Uses fitness-trainer skill protocols: progressive overload, periodization,
// evidence-based splits, and goal-specific training rules.

export async function generateFitnessPlan(profile: OnboardingData) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 2000))
    return mockFitnessPlan
  }

  const weekCount = Math.max(4, Math.round((profile.timeline_weeks || 8) / 2) * 2)

  // Skill-verified metrics
  const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
  const tdee = calculateTDEE(bmr, profile.days_per_week)

  const systemPrompt = `You are an expert NASM/ACE Certified Personal Trainer using evidence-based protocols.

Apply these fitness-trainer skill rules strictly:
- Progressive overload: each week increases intensity vs prior week
- Periodization: plan phases (accumulation → intensification → realization)
- Deload: include a deload week every 4–6 weeks (reduce volume 40–50%)
- Rep ranges: Strength 1–5 reps | Hypertrophy 6–15 reps | Endurance 15–30 reps
- Rest periods: Heavy compound 2–4 min | Accessory 60–90s | Cardio/circuit 30–60s
- Always match equipment to: ${profile.equipment.join(', ')}
- Goal-specific split: ${
    profile.fitness_goal === 'build_muscle' ? 'PPL or Upper/Lower — 4–6 days' :
    profile.fitness_goal === 'lose_weight' ? 'Full Body 3–4 days + cardio sessions' :
    profile.fitness_goal === 'improve_endurance' ? 'Zone 2 + interval training dominant' :
    profile.fitness_goal === 'athletic_performance' ? 'Strength + sport conditioning' :
    'Balanced full body 3 days/week'
  }
- User TDEE: ${tdee} kcal | Goal: ${profile.fitness_goal} | Level: ${profile.fitness_level}

Return ONLY valid JSON. No markdown, no explanation.`

  const prompt = `Create a ${weekCount}-week progressive workout plan for:
- Goal: ${profile.fitness_goal}
- Weight: ${profile.weight_kg}kg → Target: ${profile.target_weight_kg}kg
- Fitness level: ${profile.fitness_level}
- Days/week: ${profile.days_per_week} | Session: ${profile.session_duration} min
- Equipment: ${profile.equipment.join(', ')}
- Age: ${profile.age} | Gender: ${profile.gender}

Use this exact JSON structure:
{
  "planName": string,
  "weeklySchedule": [
    {
      "day": "Monday",
      "type": "workout" | "rest" | "active_recovery",
      "focus": string,
      "workouts": [
        {
          "name": string,
          "sets": number,
          "reps": string,
          "rest": number,
          "notes": string,
          "youtubeSearchQuery": string
        }
      ]
    }
  ],
  "progressionNotes": string,
  "weeklyGoals": string[]
}`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}

// ─── Generate Diet Plan ────────────────────────────────────────────────────
// Uses Mifflin-St Jeor BMR + skill macro tables + nutrient timing protocols.

export async function generateDietPlan(profile: OnboardingData) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500))
    return mockDietPlan
  }

  // Skill-verified Mifflin-St Jeor BMR
  const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
  const tdee = calculateTDEE(bmr, profile.days_per_week)
  const calories = calculateCalorieTarget(tdee, profile.fitness_goal)
  const { protein, carbs, fats } = calculateMacros(calories, profile.weight_kg, profile.fitness_goal)

  const systemPrompt = `You are a Precision Nutrition Level 2 Coach and Registered Sports Dietitian.

Apply these fitness-trainer skill rules strictly:
- Protein: first priority macro — distributed evenly across meals (~40g max per meal absorbed optimally)
- Pre-workout meal (1–2hr before): 30–60g carbs + 20–30g protein, minimal fat/fiber
- Post-workout meal (within 30–60 min): 30–40g protein + 40–80g carbs, low fat
- Supplement suggestions: evidence-based only (Creatine, Omega-3, Vitamin D3, Magnesium, Caffeine)
- Never recommend: unregulated fat burners, proprietary blends
- Dietary restrictions: ${profile.dietary_prefs.join(', ') || 'none'}
- Hydration goal: ${Math.round(profile.weight_kg * 40)}ml/day (skill standard: 35–45ml/kg)

Return ONLY valid JSON. No markdown, no explanation.`

  const prompt = `Create a 7-day personalized meal plan:
- Goal: ${profile.fitness_goal}
- Calculated BMR (Mifflin-St Jeor): ${bmr} kcal
- TDEE: ${tdee} kcal
- Target calories: ${calories} kcal
- Macros: Protein ${protein}g | Carbs ${carbs}g | Fats ${fats}g
- Dietary restrictions: ${profile.dietary_prefs.join(', ') || 'none'}
- Training days/week: ${profile.days_per_week}

Return this exact JSON:
{
  "dailyCalories": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "bmr": number,
  "tdee": number,
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Pre-Workout" | "Post-Workout",
          "name": string,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "ingredients": string[],
          "prepTime": number
        }
      ]
    }
  ],
  "hydrationGoal": number,
  "supplementSuggestions": string[]
}`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}

// ─── Chat with Coach ───────────────────────────────────────────────────────
// Powered by the full fitness-trainer skill as system prompt.
// Every response uses skill-verified protocols, formulas, and principles.

export async function chatWithCoach(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext: {
    profile: Partial<OnboardingData>
    planSummary?: string
    todayWorkout?: string
    recentStats?: string
  }
) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 800))
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
    return getMockCoachReply(lastUserMsg)
  }

  // Build pre-calculated metrics so the skill can reference them
  const profile = userContext.profile
  let bmr: number | undefined
  let tdee: number | undefined
  let targetCalories: number | undefined
  let macros: { protein: number; carbs: number; fats: number } | undefined

  if (profile.weight_kg && profile.height_cm && profile.age) {
    bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender || 'male')
    if (profile.days_per_week) {
      tdee = calculateTDEE(bmr, profile.days_per_week)
      if (profile.fitness_goal) {
        targetCalories = calculateCalorieTarget(tdee, profile.fitness_goal)
        macros = calculateMacros(targetCalories, profile.weight_kg, profile.fitness_goal)
      }
    }
  }

  // Full fitness-trainer skill as system prompt
  const systemPrompt = buildFitnessTrainerSystemPrompt({
    ...profile,
    planSummary: userContext.planSummary,
    todayWorkout: userContext.todayWorkout,
    recentStats: userContext.recentStats,
    bmr,
    tdee,
    targetCalories,
    macros,
  })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

// ─── Motivational Message ──────────────────────────────────────────────────

export async function generateMotivationalMessage(stats: {
  completedExercises: number
  totalExercises: number
  duration: number
  prsHit: number
}) {
  if (MOCK_MODE) return getMockMotivationalMessage()

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `Generate ONE short motivational sentence (max 20 words) for someone who just completed: ${stats.completedExercises}/${stats.totalExercises} exercises, ${stats.duration} minutes${stats.prsHit > 0 ? `, ${stats.prsHit} personal records` : ''}. Be energetic and specific. No hashtags.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : 'Incredible work today!'
}
