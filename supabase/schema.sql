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
CREATE POLICY "Upload permitido para usuários autenticados" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('artworks', 'redlines', 'avatars'));
