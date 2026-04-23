import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProfile,
  FitnessPlan,
  WorkoutSession,
  DietPlan,
  MealLog,
  WeightLog,
  ChatMessage,
  OnboardingData,
} from '../types'

interface AppState {
  // Auth
  user: UserProfile | null
  isAuthenticated: boolean

  // Onboarding
  onboardingData: Partial<OnboardingData>
  onboardingStep: number

  // Plans
  activePlan: FitnessPlan | null
  activeDietPlan: DietPlan | null

  // Sessions
  todaySession: WorkoutSession | null
  recentSessions: WorkoutSession[]

  // Logs
  todayMealLogs: MealLog[]
  weightLogs: WeightLog[]
  waterGlasses: number

  // Chat
  chatMessages: ChatMessage[]

  // UI
  sidebarCollapsed: boolean
  unitSystem: 'metric' | 'imperial'
  streak: number

  // Actions — Auth
  setUser: (user: UserProfile | null) => void
  setAuthenticated: (val: boolean) => void

  // Actions — Onboarding
  setOnboardingData: (data: Partial<OnboardingData>) => void
  setOnboardingStep: (step: number) => void

  // Actions — Plans
  setActivePlan: (plan: FitnessPlan | null) => void
  setActiveDietPlan: (plan: DietPlan | null) => void

  // Actions — Sessions
  setTodaySession: (session: WorkoutSession | null) => void
  setRecentSessions: (sessions: WorkoutSession[]) => void

  // Actions — Logs
  setTodayMealLogs: (logs: MealLog[]) => void
  addMealLog: (log: MealLog) => void
  setWeightLogs: (logs: WeightLog[]) => void
  addWeightLog: (log: WeightLog) => void
  incrementWater: () => void
  resetWater: () => void

  // Actions — Chat
  setChatMessages: (msgs: ChatMessage[]) => void
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void

  // Actions — UI
  toggleSidebar: () => void
  setUnitSystem: (system: 'metric' | 'imperial') => void
  setStreak: (streak: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      onboardingData: {},
      onboardingStep: 1,
      activePlan: null,
      activeDietPlan: null,
      todaySession: null,
      recentSessions: [],
      todayMealLogs: [],
      weightLogs: [],
      waterGlasses: 0,
      chatMessages: [],
      sidebarCollapsed: false,
      unitSystem: 'metric',
      streak: 0,

      // Auth
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Onboarding
      setOnboardingData: (data) =>
        set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

      // Plans
      setActivePlan: (activePlan) => set({ activePlan }),
      setActiveDietPlan: (activeDietPlan) => set({ activeDietPlan }),

      // Sessions
      setTodaySession: (todaySession) => set({ todaySession }),
      setRecentSessions: (recentSessions) => set({ recentSessions }),

      // Logs
      setTodayMealLogs: (todayMealLogs) => set({ todayMealLogs }),
      addMealLog: (log) => set((state) => ({ todayMealLogs: [...state.todayMealLogs, log] })),
      setWeightLogs: (weightLogs) => set({ weightLogs }),
      addWeightLog: (log) => set((state) => ({ weightLogs: [log, ...state.weightLogs] })),
      incrementWater: () => set((state) => ({ waterGlasses: state.waterGlasses + 1 })),
      resetWater: () => set({ waterGlasses: 0 }),

      // Chat
      setChatMessages: (chatMessages) => set({ chatMessages }),
      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      // UI
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setStreak: (streak) => set({ streak }),
    }),
    {
      name: 'fitforge-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activePlan: state.activePlan,
        activeDietPlan: state.activeDietPlan,
        unitSystem: state.unitSystem,
        streak: state.streak,
        waterGlasses: state.waterGlasses,
      }),
    }
  )
)
