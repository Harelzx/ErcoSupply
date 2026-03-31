-- =============================================
-- ErcoSupply Database Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Quarter configs
CREATE TABLE quarter_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  quarter INT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  target_month_1 NUMERIC(12,2) DEFAULT 0,
  target_month_2 NUMERIC(12,2) DEFAULT 0,
  target_month_3 NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, year, quarter)
);

-- 3. Day overrides
CREATE TABLE day_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quarter_config_id UUID NOT NULL REFERENCES quarter_configs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_type TEXT CHECK (day_type IN ('regular', 'half', 'closed')),
  actual_income NUMERIC(12,2) DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quarter_config_id, date)
);

-- 4. Indexes
CREATE INDEX idx_quarter_configs_user ON quarter_configs(user_id);
CREATE INDEX idx_day_overrides_user ON day_overrides(user_id);
CREATE INDEX idx_day_overrides_config ON day_overrides(quarter_config_id);
CREATE INDEX idx_day_overrides_date ON day_overrides(date);

-- 5. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarter_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "users own quarter_configs" ON quarter_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own day_overrides" ON day_overrides FOR ALL USING (auth.uid() = user_id);

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
