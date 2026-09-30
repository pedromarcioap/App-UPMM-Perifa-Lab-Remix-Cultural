<<<<<<< HEAD
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
=======
-- Schema Relacional do Supabase para Plataforma de Aprendizado Visual e Arte Urbana
-- Compatível com PostgreSQL 15+ e Supabase (Auth, RLS, Storage)

-- 1. Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio TEXT DEFAULT 'Artista visual em evolução contínua.',
    vibe INTEGER DEFAULT 50,
    responsa INTEGER DEFAULT 35,
    level TEXT DEFAULT 'Aprendiz',
    neighborhood TEXT DEFAULT 'Plano Diretor Sul',
    badges TEXT[] DEFAULT ARRAY['click']::TEXT[],
    instagram TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Obras e Fotografias de Referência (Artworks)
CREATE TABLE IF NOT EXISTS public.artworks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    medium TEXT DEFAULT 'digital',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    vibe_count INTEGER DEFAULT 0,
    is_gold_standard BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'base' CHECK (type IN ('base', 'remix')),
    original_photo_id TEXT REFERENCES public.artworks(id) ON DELETE SET NULL,
    location JSONB DEFAULT '{}'::JSONB,
    battle_wins INTEGER DEFAULT 0,
    battle_losses INTEGER DEFAULT 0,
    battle_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Análises Técnicas por IA Visual (Visão Multimodal e Overlays)
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    proportion_score INTEGER DEFAULT 0,
    perspective_score INTEGER DEFAULT 0,
    tonal_score INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,
    critique TEXT,
    strengths TEXT[] DEFAULT '{}'::TEXT[],
    corrections TEXT[] DEFAULT '{}'::TEXT[],
    suggested_drills TEXT[] DEFAULT '{}'::TEXT[],
    redline_overlay_url TEXT,
    model_used TEXT DEFAULT 'gemini-2.5-flash-vision',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 5. Tabela de Comentários Comunitários e Redlines (Peer-Review)
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('photo', 'spot')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    redline_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Pontos de Mural e Graffiti (Graffiti Spots)
CREATE TABLE IF NOT EXISTS public.graffiti_spots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('permitido', 'sugerido')),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    neighborhood TEXT DEFAULT 'Taquaralto',
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON public.artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_artwork_id ON public.ai_analyses(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_target_id ON public.comments(target_id);
CREATE INDEX IF NOT EXISTS idx_graffiti_spots_neighborhood ON public.graffiti_spots(neighborhood);

-- 8. Gatilho Automático para Criação de Perfil no Signup do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, username, email, avatar_url, neighborhood)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
        COALESCE(NEW.raw_user_meta_data->>'neighborhood', 'Plano Diretor Sul')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.1 Garantia de Imutabilidade e Preservação de Linhagem de Remixes
CREATE OR REPLACE FUNCTION public.enforce_remix_immutability()
RETURNS TRIGGER AS $$
BEGIN
    -- Impede a alteração do autor, tipo e da foto de referência original
    IF (OLD.type = 'remix' AND (NEW.original_photo_id IS DISTINCT FROM OLD.original_photo_id OR NEW.type <> OLD.type)) THEN
        RAISE EXCEPTION 'A linhagem e o vínculo de autoria original do remix são inalienáveis e não podem ser modificados.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_remix_immutability ON public.artworks;
CREATE TRIGGER trg_enforce_remix_immutability
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW EXECUTE PROCEDURE public.enforce_remix_immutability();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graffiti_spots ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (feed comunitário e portfólio acessível)
CREATE POLICY "Perfis visíveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Obras visíveis publicamente" ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Análises de IA visíveis publicamente" ON public.ai_analyses FOR SELECT USING (true);
CREATE POLICY "Comentários visíveis publicamente" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Pontos de graffiti visíveis publicamente" ON public.graffiti_spots FOR SELECT USING (true);

-- Políticas de Modificação por Donos Autenticados
CREATE POLICY "Usuários atualizam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários inserem suas obras" ON public.artworks FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Usuários atualizam suas obras" ON public.artworks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas obras" ON public.artworks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem comentários" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Usuários inserem pontos" ON public.graffiti_spots FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 10. Configuração dos Buckets de Armazenamento do Supabase Storage
-- Buckets: 'artworks' (obras originais), 'redlines' (overlays e anotações), 'avatars'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true),
       ('redlines', 'redlines', true),
       ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso ao Storage
CREATE POLICY "Visualização pública de arquivos de arte" ON storage.objects FOR SELECT USING (bucket_id IN ('artworks', 'redlines', 'avatars'));
CREATE POLICY "Upload permitido para usuários autenticados" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id IN ('artworks', 'redlines', 'avatars') 
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);
>>>>>>> 5dcfb1aa1fea5665ecfb067259801388532586ef
