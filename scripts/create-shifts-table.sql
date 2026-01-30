-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  location_address VARCHAR NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  pay_amount DECIMAL(10, 2) NOT NULL,
  required_workers INTEGER DEFAULT 1,
  required_rating DECIMAL(3, 1) DEFAULT 0,
  tools_required TEXT[],
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_client_id ON public.shifts(client_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_category ON public.shifts(category);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(date);

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name VARCHAR,
  company_description TEXT,
  rating DECIMAL(3, 1) DEFAULT 0,
  completed_shifts INTEGER DEFAULT 0,
  total_workers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create worker_categories table
CREATE TABLE IF NOT EXISTS public.worker_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  icon VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.worker_categories (name, icon, description) VALUES
  ('Монтажник', 'wrench', 'Монтаж и установка конструкций'),
  ('Декоратор', 'palette', 'Декоративное оформление'),
  ('Электрик', 'zap', 'Электромонтажные работы'),
  ('Сварщик', 'flame', 'Сварочные работы'),
  ('Альпинист', 'mountain', 'Высотные работы'),
  ('Бутафор', 'box', 'Бутафория и реквизит')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shifts - clients can view their own shifts
CREATE POLICY "Clients can view own shifts" ON public.shifts
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create shifts" ON public.shifts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own shifts" ON public.shifts
  FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for client_profiles
CREATE POLICY "Users can view own profile" ON public.client_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.client_profiles
  FOR UPDATE USING (auth.uid() = user_id);
