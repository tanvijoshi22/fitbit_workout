// ─── User & Auth ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  height_cm: number
  weight_kg: number
  target_weight_kg: number
  fitness_goal: FitnessGoal
  fitness_level: FitnessLevel
  equipment: Equipment[]
  dietary_prefs: DietaryPref[]
  days_per_week: number
  session_duration: 30 | 45 | 60 | 90
  created_at: string
}

export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_endurance'
  | 'stay_active'
  | 'athletic_performance'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export type Equipment =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'resistance_bands'
  | 'pullup_bar'
  | 'full_gym'
  | 'cardio_machines'

export type DietaryPref =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'lactose_free'
  | 'keto'
  | 'high_protein'

// ─── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingData {
  // Step 1
  name: string
  age: number
  gender: UserProfile['gender']
  height_cm: number
  weight_kg: number
  unit_system: 'metric' | 'imperial'
  // Step 2
  fitness_goal: FitnessGoal
  // Step 3
  target_weight_kg: number
  timeline_weeks: number
  muscle_groups: string[]
  target_event: string
  days_per_week: number
  session_duration: 30 | 45 | 60 | 90
  // Step 4
  fitness_level: FitnessLevel
  // Step 5
  equipment: Equipment[]
  // Step 6
  dietary_prefs: DietaryPref[]
}

// ─── Fitness Plan ───────────────────────────────────────────────────────────────

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest: number
  notes: string
  youtubeSearchQuery: string
}

export interface WorkoutDay {
  day: string
  type: 'workout' | 'rest' | 'active_recovery'
  focus: string
  workouts: Exercise[]
}

export interface FitnessPlan {
  id: string
  user_id: string
  plan_name: string
  plan_data: {
    planName: string
    weeklySchedule: WorkoutDay[]
    progressionNotes: string
    weeklyGoals: string[]
  }
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

// ─── Workout Session ────────────────────────────────────────────────────────────

export type WorkoutStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface SetLog {
  set: number
  reps: number
  weight: number
  completed: boolean
}

export interface ExerciseLog {
  id: string
  session_id: string
  exercise_name: string
  sets: SetLog[]
  is_pr: boolean
  notes: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  plan_id: string
  date: string
  focus: string
  status: WorkoutStatus
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  total_volume_kg: number | null
  notes: string | null
  exercise_logs?: ExerciseLog[]
}

// ─── Diet & Nutrition ───────────────────────────────────────────────────────────

export interface Macros {
  protein: number
  carbs: number
  fats: number
}

export interface Meal {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  ingredients: string[]
  prepTime: number
}

export interface DietDay {
  day: string
  meals: Meal[]
}

export interface DietPlan {
  id: string
  user_id: string
  plan_data: {
    dailyCalories: number
    macros: Macros
    days: DietDay[]
    hydrationGoal: number
    supplementSuggestions: string[]
  }
  daily_calories: number
  macros: Macros
  is_active: boolean
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  date: string
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  logged_at: string
}

export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
}

// ─── Chat ───────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
