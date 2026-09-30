-- Script SQL para criação de tabelas e políticas RLS no Supabase (PostgreSQL)
-- Execute este script no SQL Editor do seu Painel do Supabase

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  avatar TEXT,
  bio TEXT,
  vibe INT DEFAULT 0,
  responsa INT DEFAULT 0,
  level TEXT DEFAULT 'Observador',
  badges JSONB DEFAULT '[]'::jsonb,
  is_admin BOOLEAN DEFAULT FALSE,
  has_notifications BOOLEAN DEFAULT FALSE,
  read_notification_ids JSONB DEFAULT '[]'::jsonb,
  neighborhood TEXT,
  instagram TEXT,
  joined_date TEXT,
  completed_challenges JSONB DEFAULT '[]'::jsonb,
  google_linked BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Fotos e Remixes (Photos)
CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  vibe_count INT DEFAULT 0,
  is_gold_standard BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'base',
  original_photo_id TEXT,
  location JSONB,
  battle_wins INT DEFAULT 0,
  battle_losses INT DEFAULT 0,
  battle_streak INT DEFAULT 0,
  challenge_id TEXT,
  created_at BIGINT,
  verified BOOLEAN DEFAULT TRUE,
  overlap_risk BOOLEAN DEFAULT FALSE
);

-- 4. Tabela de Murais e Pontos de Grafite (Graffiti Spots)
CREATE TABLE IF NOT EXISTS public.graffiti_spots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'permitido',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at BIGINT,
  address TEXT,
  neighborhood TEXT
);

-- 5. Tabela de Comentários (Comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  text TEXT NOT NULL,
  created_at BIGINT,
  likes INT DEFAULT 0
);

-- 6. Tabela de Desafios Semanais (Challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  start_date TEXT,
  end_date TEXT,
  reward_responsa INT DEFAULT 50,
  reward_badge_id TEXT DEFAULT 'click',
  tags JSONB DEFAULT '[]'::jsonb,
  featured_neighborhood TEXT,
  status TEXT DEFAULT 'active',
  rules JSONB DEFAULT '[]'::jsonb,
  winner_photo_id TEXT
);

-- 7. Tabela de Notificações de Linhagem (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipient_user_id TEXT NOT NULL,
  remixer_id TEXT NOT NULL,
  remixer_name TEXT NOT NULL,
  remixer_avatar TEXT,
  remixer_neighborhood TEXT,
  original_photo_id TEXT NOT NULL,
  original_photo_title TEXT NOT NULL,
  original_photo_url TEXT,
  remix_photo_id TEXT NOT NULL,
  remix_photo_title TEXT NOT NULL,
  remix_photo_url TEXT NOT NULL,
  created_at BIGINT,
  read BOOLEAN DEFAULT FALSE
);

-- 8. Tabela de Insígnias / Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'special',
  secret BOOLEAN DEFAULT FALSE,
  unlock_criteria TEXT,
  reward_responsa INT DEFAULT 10,
  created_at BIGINT
);

-- 9. Tabela de Desafios Patrocinados (Branded Challenges)
CREATE TABLE IF NOT EXISTS public.branded_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sponsor JSONB NOT NULL,
  prize_description TEXT,
  reward_vibe_points INT DEFAULT 100,
  banner_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  start_date TEXT,
  end_date TEXT,
  submissions_count INT DEFAULT 0,
  featured_neighborhood TEXT,
  rules JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb
);

-- 10. Tabela de Packs de Assets Patrocinados (Branded Packs)
CREATE TABLE IF NOT EXISTS public.branded_packs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sponsor JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  start_date TEXT,
  end_date TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  usage_count INT DEFAULT 0,
  description TEXT
);

-- Habilitar Row Level Security (RLS) com políticas de leitura/escrita permitidas para a API da aplicação
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graffiti_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branded_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branded_packs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para prototipagem/operação fluida da comunidade
CREATE POLICY "Permitir leitura pública de perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de perfis" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de fotos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de fotos" ON public.photos FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de murais" ON public.graffiti_spots FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de murais" ON public.graffiti_spots FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de comentários" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de comentários" ON public.comments FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de desafios" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de desafios" ON public.challenges FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de notificações" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de notificações" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de insígnias" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de insígnias" ON public.badges FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de desafios de marcas" ON public.branded_challenges FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de desafios de marcas" ON public.branded_challenges FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de packs patrocinados" ON public.branded_packs FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de packs patrocinados" ON public.branded_packs FOR ALL USING (true);

-- Habilitar Public Realtime nas tabelas do Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.graffiti_spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.branded_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.branded_packs;
