import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from './types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('placeholder')
  );
};

// Lazy Singleton Client to prevent crashing when keys are not yet provided
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.warn('Falha ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return supabaseInstance;
};

// Export alias for client getter
export const getSupabaseClient = getSupabase;

// Direct export for standard usage with safety check
export const supabase = isSupabaseConfigured() ? getSupabase() : null;

// Helper: Convert Supabase User + profile metadata into App's User domain entity
export const mapSupabaseUserToAppUser = (
  sbUser: SupabaseUser,
  profileData?: any
): User => {
  const metadata = sbUser.user_metadata || {};
  const cleanUsername = (
    profileData?.username ||
    metadata.username ||
    metadata.name ||
    sbUser.email?.split('@')[0] ||
    'artista'
  ).toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');

  return {
    id: sbUser.id,
    name: profileData?.name || metadata.name || metadata.full_name || cleanUsername,
    username: cleanUsername,
    email: sbUser.email || metadata.email,
    avatar: profileData?.avatar || metadata.avatar_url || metadata.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: profileData?.bio || metadata.bio || `Artista visual conectado via Supabase.`,
    vibe: profileData?.vibe ?? 50,
    responsa: profileData?.responsa ?? 35,
    level: profileData?.level || 'Aprendiz',
    badges: profileData?.badges || ['click'],
    neighborhood: profileData?.neighborhood || metadata.neighborhood || 'Plano Diretor Sul',
    instagram: profileData?.instagram || metadata.instagram,
    joinedDate: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
    completedChallenges: profileData?.completed_challenges || [],
    emailVerified: Boolean(sbUser.email_confirmed_at)
  };
};

/**
 * Cadastrar novo usuário com Email e Senha no Supabase Auth e criar perfil relacional
 */
export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  name: string;
  username?: string;
  neighborhood?: string;
  avatar?: string;
  bio?: string;
  instagram?: string;
}): Promise<{ user: User | null; session: Session | null; error: string | null; needsEmailConfirmation?: boolean }> {
  const client = getSupabase();
  if (!client) {
    return {
      user: null,
      session: null,
      error: 'Supabase não está configurado. Defina as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: params.email.trim().toLowerCase(),
      password: params.password,
      options: {
        data: {
          name: params.name.trim(),
          username: params.username?.trim(),
          neighborhood: params.neighborhood || 'Plano Diretor Sul',
          avatar: params.avatar,
          bio: params.bio,
          instagram: params.instagram
        }
      }
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, session: null, error: 'Não foi possível criar o usuário no Supabase.' };
    }

    const appUser = mapSupabaseUserToAppUser(data.user, {
      name: params.name,
      username: params.username,
      neighborhood: params.neighborhood,
      avatar: params.avatar,
      bio: params.bio,
      instagram: params.instagram
    });

    // Tentativa defensiva de sincronizar com a tabela relacional 'profiles' se existir
    try {
      await client.from('profiles').upsert({
        id: data.user.id,
        name: params.name.trim(),
        username: appUser.username,
        email: params.email.trim().toLowerCase(),
        avatar: appUser.avatar,
        bio: appUser.bio,
        neighborhood: appUser.neighborhood,
        instagram: params.instagram,
        created_at: new Date().toISOString()
      });
    } catch (dbErr) {
      console.info('Aviso: Tabela relacional profiles do Supabase não configurada ou inacessível no momento:', dbErr);
    }

    const needsEmailConfirmation = !data.session;
    return {
      user: appUser,
      session: data.session,
      error: null,
      needsEmailConfirmation
    };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'Erro inesperado ao cadastrar usuário no Supabase.' };
  }
}

/**
 * Realizar Login com Email e Senha no Supabase Auth
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  const client = getSupabase();
  if (!client) {
    return {
      user: null,
      session: null,
      error: 'Supabase não está configurado. Defina as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, session: null, error: 'Usuário não encontrado no Supabase.' };
    }

    // Buscar perfil relacional complementar da tabela 'profiles'
    let profileData = null;
    try {
      const profileRes = await client
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      profileData = profileRes.data;
    } catch {
      // Perfil obtido dos metadados caso tabela não exista
    }

    const appUser = mapSupabaseUserToAppUser(data.user, profileData);
    return { user: appUser, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'Erro inesperado ao realizar login com o Supabase.' };
  }
}

/**
 * Logout no Supabase Auth
 */
export async function signOutSupabase(): Promise<{ error: string | null }> {
  const client = getSupabase();
  if (!client) return { error: null };
  try {
    const { error } = await client.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err?.message || 'Erro ao deslogar do Supabase.' };
  }
}

/**
 * Obter usuário atualmente autenticado na sessão do Supabase
 */
export async function getSupabaseCurrentUser(): Promise<User | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    let profileData = null;
    try {
      const profileRes = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      profileData = profileRes.data;
    } catch {
      // Ignorar fallback
    }

    return mapSupabaseUserToAppUser(session.user, profileData);
  } catch (err) {
    console.warn('Erro ao checar sessão atual do Supabase:', err);
    return null;
  }
}
