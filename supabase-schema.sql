-- =====================================================
-- FitForge — Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com → SQL Editor → New Query
-- =====================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INT,
  gender TEXT,
  height_cm FLOAT,
  weight_kg FLOAT,
  target_weight_kg FLOAT,
  fitness_goal TEXT,
  fitness_level TEXT,
  equipment TEXT[],
  dietary_prefs TEXT[],
  days_per_week INT,
  session_duration INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fitness Plans
CREATE TABLE IF NOT EXISTS fitness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_data JSONB,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workout Sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES fitness_plans(id) ON DELETE SET NULL,
  date DATE,
  focus TEXT,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INT,
  total_volume_kg FLOAT,
  notes TEXT
);

-- Exercise Logs
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT,
  sets JSONB,
  is_pr BOOLEAN DEFAULT false,
  notes TEXT
);

-- Diet Plans
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_data JSONB,
  daily_calories INT,
  macros JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meal Logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE,
  meal_type TEXT,
  food_name TEXT,
  calories FLOAT,
  protein FLOAT,
  carbs FLOAT,
  fats FLOAT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Weight Logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg FLOAT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Row Level Security (RLS) — users can only access their own data
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Fitness plans policies
CREATE POLICY "Users can manage own plans" ON fitness_plans FOR ALL USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users can manage own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Exercise logs policies
CREATE POLICY "Users can manage own exercise logs" ON exercise_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Diet plans policies
CREATE POLICY "Users can manage own diet plans" ON diet_plans FOR ALL USING (auth.uid() = user_id);

-- Meal logs policies
CREATE POLICY "Users can manage own meal logs" ON meal_logs FOR ALL USING (auth.uid() = user_id);

-- Weight logs policies
CREATE POLICY "Users can manage own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can manage own chat" ON chat_messages FOR ALL USING (auth.uid() = user_id);
