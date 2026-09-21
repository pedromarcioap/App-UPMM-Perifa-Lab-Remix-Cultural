import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from './types';

// Environment variables
const metaEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {} as Record<string, string>;
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

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
    emailVerified: Boolean(sbUser.email_confirmed_at),
    supabaseLinked: true,
    authProvider: 'supabase'
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

/**
 * Utilitário: Converte Data URL / Base64 para Blob binário
 */
export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0]?.replace('data:', '') || 'image/jpeg';
  const raw = atob(parts[1] || parts[0]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Upload de imagem diretamente para o Supabase Storage
 */
export async function uploadImageToSupabase(
  fileOrBase64: File | Blob | string,
  bucket: 'artworks' | 'redlines' | 'avatars' = 'artworks',
  customPath?: string
): Promise<{ publicUrl: string | null; storagePath: string | null; error: string | null }> {
  const client = getSupabase();
  if (!client) {
    return {
      publicUrl: null,
      storagePath: null,
      error: 'Supabase não está configurado. Operando com armazenamento local.'
    };
  }

  try {
    let blob: Blob;
    let extension = 'jpg';

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:image/png')) extension = 'png';
      else if (fileOrBase64.startsWith('data:image/webp')) extension = 'webp';
      blob = base64ToBlob(fileOrBase64);
    } else if (fileOrBase64 instanceof File) {
      blob = fileOrBase64;
      const match = fileOrBase64.name.match(/\.([a-zA-Z0-9]+)$/);
      if (match) extension = match[1].toLowerCase();
    } else {
      blob = fileOrBase64;
    }

    const fileName = customPath || `art_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.warn(`[Supabase Storage] Aviso no upload para bucket '${bucket}':`, uploadError.message);
      return { publicUrl: null, storagePath: null, error: uploadError.message };
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      publicUrl: publicUrlData?.publicUrl || null,
      storagePath: filePath,
      error: null
    };
  } catch (err: any) {
    console.warn('[Supabase Storage] Exceção durante upload:', err);
    return {
      publicUrl: null,
      storagePath: null,
      error: err?.message || 'Falha ao realizar upload para o Supabase Storage.'
    };
  }
}

/**
 * Sincronizar Obra de Arte / Foto com a tabela relacional 'artworks'
 */
export async function persistArtworkToSupabase(photo: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não configurado.' };

  try {
    const payload = {
      id: photo.id,
      user_id: photo.userId,
      author_name: photo.authorName,
      title: photo.title,
      image_url: photo.imageUrl,
      storage_path: photo.storagePath || null,
      tags: photo.tags || [],
      vibe_count: photo.vibeCount || 0,
      is_gold_standard: Boolean(photo.isGoldStandard),
      type: photo.type || 'base',
      original_photo_id: photo.originalPhotoId || null,
      location: photo.location || {},
      battle_wins: photo.battleWins || 0,
      battle_losses: photo.battleLosses || 0,
      battle_streak: photo.battleStreak || 0,
      created_at: photo.createdAt ? new Date(photo.createdAt).toISOString() : new Date().toISOString()
    };

    const { error } = await client
      .from('artworks')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase DB] Erro ao persistir artwork relacional:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Buscar Obras da tabela relacional do Supabase
 */
export async function fetchArtworksFromSupabase(): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      authorName: row.author_name,
      title: row.title,
      imageUrl: row.image_url,
      storagePath: row.storage_path,
      tags: row.tags || [],
      vibeCount: row.vibe_count || 0,
      isGoldStandard: row.is_gold_standard,
      type: row.type,
      originalPhotoId: row.original_photo_id,
      location: row.location,
      battleWins: row.battle_wins || 0,
      battleLosses: row.battle_losses || 0,
      battleStreak: row.battle_streak || 0,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
    }));
  } catch (err) {
    console.warn('[Supabase DB] Erro ao buscar artworks:', err);
    return [];
  }
}

/**
 * Excluir Obra de Arte do Supabase
 */
export async function deleteArtworkFromSupabase(id: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('artworks')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Persistir Comentário ou Redline Peer-Review
 */
export async function persistCommentToSupabase(comment: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase não configurado.' };

  try {
    const { error } = await client
      .from('comments')
      .upsert({
        id: comment.id,
        target_id: comment.targetId,
        target_type: comment.targetType,
        user_id: comment.userId,
        user_name: comment.userName,
        user_avatar: comment.userAvatar,
        text: comment.text,
        likes: comment.likes || 0,
        redline_data: comment.redlineData || null,
        created_at: new Date(comment.createdAt).toISOString()
      }, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Buscar Análise de IA para uma obra
 */
export async function fetchArtworkAnalysisFromSupabase(artworkId: string): Promise<any | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('ai_analyses')
      .select('*')
      .eq('artwork_id', artworkId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      artworkId: data.artwork_id,
      userId: data.user_id,
      status: data.status,
      proportionScore: data.proportion_score,
      perspectiveScore: data.perspective_score,
      tonalScore: data.tonal_score,
      overallScore: data.overall_score,
      critique: data.critique,
      strengths: data.strengths || [],
      corrections: data.corrections || [],
      suggestedDrills: data.suggested_drills || [],
      redlineOverlayUrl: data.redline_overlay_url,
      modelUsed: data.model_used,
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      completedAt: data.completed_at ? new Date(data.completed_at).getTime() : undefined
    };
  } catch {
    return null;
  }
}

/**
 * Obter Status Completo da Integração Supabase
 */
export async function checkSupabaseStatus(): Promise<{
  configured: boolean;
  url: string | null;
  authActive: boolean;
  storageActive: boolean;
  databaseActive: boolean;
  sessionUserEmail: string | null;
}> {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      url: null,
      authActive: false,
      storageActive: false,
      databaseActive: false,
      sessionUserEmail: null
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      configured: false,
      url: supabaseUrl || null,
      authActive: false,
      storageActive: false,
      databaseActive: false,
      sessionUserEmail: null
    };
  }

  let authActive = false;
  let sessionUserEmail: string | null = null;
  let storageActive = false;
  let databaseActive = false;

  try {
    const { data } = await client.auth.getSession();
    authActive = true;
    if (data?.session?.user) {
      sessionUserEmail = data.session.user.email || null;
    }
  } catch {}

  try {
    const { error } = await client.storage.listBuckets();
    storageActive = !error;
  } catch {}

  try {
    const { error } = await client.from('artworks').select('id').limit(1);
    databaseActive = !error;
  } catch {}

  return {
    configured: true,
    url: supabaseUrl || null,
    authActive,
    storageActive,
    databaseActive,
    sessionUserEmail
  };
}
