-- Migration: Add budget management tables
-- Created: 2026-03-06
-- Description: Budget and spending tracking with Supabase

-- Budget table already existed from old schema.
-- Added user_id column to link to auth.users for RLS.
ALTER TABLE budget ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;

-- spending_entry table (new)
CREATE TABLE IF NOT EXISTS spending_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  store TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Maistas',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spending_user_date ON spending_entry(user_id, date);
ALTER TABLE spending_entry ENABLE ROW LEVEL SECURITY;

CREATE POLICY spending_sel ON spending_entry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY spending_ins ON spending_entry FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY spending_upd ON spending_entry FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY spending_del ON spending_entry FOR DELETE USING (auth.uid() = user_id);
