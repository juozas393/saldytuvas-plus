-- Migration: Add water and calorie tracking tables
-- Created: 2026-03-06
-- Description: Moves water and calorie tracking from local storage to Supabase

-- ============================================
-- 1. Water Entry Table
-- ============================================
CREATE TABLE IF NOT EXISTS water_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast daily lookups
CREATE INDEX idx_water_entry_user_date ON water_entry(user_id, date);

-- RLS
ALTER TABLE water_entry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water entries"
  ON water_entry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water entries"
  ON water_entry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water entries"
  ON water_entry FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. Calorie Entry Table
-- ============================================
CREATE TABLE IF NOT EXISTS calorie_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kcal INTEGER NOT NULL CHECK (kcal > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast daily lookups
CREATE INDEX idx_calorie_entry_user_date ON calorie_entry(user_id, date);

-- RLS
ALTER TABLE calorie_entry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calorie entries"
  ON calorie_entry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calorie entries"
  ON calorie_entry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calorie entries"
  ON calorie_entry FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. Add water_quick_amounts to app_user for persistence
-- ============================================
ALTER TABLE app_user
  ADD COLUMN IF NOT EXISTS water_quick_amounts INTEGER[] DEFAULT '{150, 250, 500}';
