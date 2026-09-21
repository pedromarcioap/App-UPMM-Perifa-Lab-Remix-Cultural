import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  User, 
  UserLevel, 
  PhotoBase, 
  GraffitiSpot, 
  Comment, 
  WeeklyChallenge, 
  RemixNotification, 
  Badge,
  BrandedChallenge,
  BrandedAssetPack,
  SponsorProfile,
  AssetItem
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_PHOTOS, 
  INITIAL_GRAFFITI_SPOTS, 
  INITIAL_COMMENTS, 
  INITIAL_WEEKLY_CHALLENGES,
  INITIAL_BRANDED_CHALLENGES,
  INITIAL_BRANDED_PACKS,
  BADGES
} from './constants';

/**
 * Exponential Backoff Retry Utility
 * Retries network mutations with jitter to withstand intermittent packet loss or mobile network switching.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 400
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const jitter = Math.random() * 150;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      delay *= 2;
    }
  }
  throw new Error('Número máximo de tentativas de sincronização excedido');
}

/**
 * Schema Normalizers
 * Enforce strict contract typing between raw Firestore document dictionaries and application TypeScript interfaces.
 */
export function normalizeUser(raw: any): User {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || 'Artista UPMM'),
    username: raw.username ? String(raw.username) : undefined,
    email: raw.email ? String(raw.email) : undefined,
    avatar: String(raw.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'),
    bio: String(raw.bio || ''),
    vibe: typeof raw.vibe === 'number' ? raw.vibe : 0,
    responsa: typeof raw.responsa === 'number' ? raw.responsa : 0,
    level: (raw.level as UserLevel) || UserLevel.OBSERVADOR,
    badges: Array.isArray(raw.badges) ? raw.badges.map(String) : [],
    isAdmin: Boolean(raw.isAdmin),
    hasNotifications: Boolean(raw.hasNotifications),
    readNotificationIds: Array.isArray(raw.readNotificationIds) ? raw.readNotificationIds.map(String) : [],
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined,
    instagram: raw.instagram ? String(raw.instagram) : undefined,
    joinedDate: raw.joinedDate ? String(raw.joinedDate) : undefined,
    completedChallenges: Array.isArray(raw.completedChallenges) ? raw.completedChallenges.map(String) : [],
    googleLinked: Boolean(raw.googleLinked),
    emailVerified: Boolean(raw.emailVerified)
  };
}

export function normalizePhoto(raw: any): PhotoBase {
  return {
    id: String(raw.id || ''),
    userId: String(raw.userId || ''),
    authorName: String(raw.authorName || 'Artista Anônimo'),
    title: String(raw.title || 'Sem título'),
    imageUrl: String(raw.imageUrl || ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : ['#Palmas', '#ArteDeRua'],
    vibeCount: typeof raw.vibeCount === 'number' ? raw.vibeCount : 0,
    isGoldStandard: Boolean(raw.isGoldStandard),
    type: raw.type === 'remix' ? 'remix' : 'base',
    originalPhotoId: raw.originalPhotoId || raw.original_image_id ? String(raw.originalPhotoId || raw.original_image_id) : undefined,
    location: raw.location && typeof raw.location === 'object' ? {
      lat: typeof raw.location.lat === 'number' ? raw.location.lat : -10.2450,
      lng: typeof raw.location.lng === 'number' ? raw.location.lng : -48.3250,
      neighborhood: String(raw.location.neighborhood || 'Palmas'),
      address: raw.location.address ? String(raw.location.address) : undefined,
      landmark: raw.location.landmark ? String(raw.location.landmark) : undefined
    } : undefined,
    battleWins: typeof raw.battleWins === 'number' ? raw.battleWins : 0,
    battleLosses: typeof raw.battleLosses === 'number' ? raw.battleLosses : 0,
    battleStreak: typeof raw.battleStreak === 'number' ? raw.battleStreak : 0,
    challengeId: raw.challengeId ? String(raw.challengeId) : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    storagePath: raw.storagePath ? String(raw.storagePath) : undefined,
    analysis: raw.analysis || undefined,
    analysisStatus: raw.analysisStatus || (raw.analysis ? 'completed' : 'idle')
  };
}

export function normalizeGraffitiSpot(raw: any): GraffitiSpot {
  return {
    id: String(raw.id || ''),
    userId: String(raw.userId || ''),
    userName: String(raw.userName || 'Muralista'),
    title: String(raw.title || 'Mural Urbano'),
    description: String(raw.description || ''),
    type: raw.type === 'sugerido' ? 'sugerido' : 'permitido',
    lat: typeof raw.lat === 'number' ? raw.lat : -10.2450,
    lng: typeof raw.lng === 'number' ? raw.lng : -48.3250,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    address: raw.address ? String(raw.address) : undefined,
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined
  };
}

export function normalizeComment(raw: any): Comment {
  return {
    id: String(raw.id || ''),
    targetId: String(raw.targetId || ''),
    targetType: raw.targetType === 'spot' ? 'spot' : 'photo',
    userId: String(raw.userId || ''),
    userName: String(raw.userName || 'Comunidade'),
    userAvatar: String(raw.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'),
    text: String(raw.text || ''),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    likes: typeof raw.likes === 'number' ? raw.likes : 0
  };
}

export function normalizeChallenge(raw: any): WeeklyChallenge {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Desafio Urbano'),
    subtitle: String(raw.subtitle || ''),
    theme: String(raw.theme || 'Cultura de Quebrada'),
    description: String(raw.description || ''),
    bannerUrl: String(raw.bannerUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'),
    startDate: String(raw.startDate || ''),
    endDate: String(raw.endDate || ''),
    rewardResponsa: typeof raw.rewardResponsa === 'number' ? raw.rewardResponsa : 50,
    rewardBadgeId: String(raw.rewardBadgeId || 'click'),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    featuredNeighborhood: raw.featuredNeighborhood ? String(raw.featuredNeighborhood) : undefined,
    status: raw.status === 'upcoming' || raw.status === 'completed' ? raw.status : 'active',
    rules: Array.isArray(raw.rules) ? raw.rules.map(String) : [],
    winnerPhotoId: raw.winnerPhotoId ? String(raw.winnerPhotoId) : undefined
  };
}

export function normalizeNotification(raw: any): RemixNotification {
  return {
    id: String(raw.id || ''),
    recipientUserId: String(raw.recipientUserId || ''),
    remixerId: String(raw.remixerId || ''),
    remixerName: String(raw.remixerName || 'Artista'),
    remixerAvatar: raw.remixerAvatar ? String(raw.remixerAvatar) : undefined,
    remixerNeighborhood: raw.remixerNeighborhood ? String(raw.remixerNeighborhood) : undefined,
    originalPhotoId: String(raw.originalPhotoId || ''),
    originalPhotoTitle: String(raw.originalPhotoTitle || ''),
    originalPhotoUrl: raw.originalPhotoUrl ? String(raw.originalPhotoUrl) : undefined,
    remixPhotoId: String(raw.remixPhotoId || ''),
    remixPhotoTitle: String(raw.remixPhotoTitle || ''),
    remixPhotoUrl: String(raw.remixPhotoUrl || ''),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    read: Boolean(raw.read)
  };
}

export function normalizeBadge(raw: any): Badge {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    icon: String(raw.icon || 'Sparkles'),
    description: String(raw.description || ''),
    category: raw.category || 'special',
    secret: Boolean(raw.secret),
    unlockCriteria: raw.unlockCriteria ? String(raw.unlockCriteria) : undefined,
    rewardResponsa: typeof raw.rewardResponsa === 'number' ? raw.rewardResponsa : 10,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()
  };
}

export function normalizeSponsorProfile(raw: any): SponsorProfile {
  return {
    id: String(raw?.id || 'sponsor_default'),
    name: String(raw?.name || 'Marca Parceira'),
    logoUrl: String(raw?.logoUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=80'),
    brandColor: raw?.brandColor ? String(raw.brandColor) : '#FFB800',
    websiteUrl: raw?.websiteUrl ? String(raw.websiteUrl) : undefined
  };
}

export function normalizeBrandedChallenge(raw: any): BrandedChallenge {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Desafio Patrocinado'),
    description: String(raw.description || ''),
    sponsor: normalizeSponsorProfile(raw.sponsor),
    prizeDescription: String(raw.prizeDescription || 'Bolsa Cultural e Equipamentos'),
    rewardVibePoints: typeof raw.rewardVibePoints === 'number' ? raw.rewardVibePoints : 100,
    bannerUrl: String(raw.bannerUrl || 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80'),
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    startDate: String(raw.startDate || ''),
    endDate: String(raw.endDate || ''),
    submissionsCount: typeof raw.submissionsCount === 'number' ? raw.submissionsCount : 0,
    featuredNeighborhood: raw.featuredNeighborhood ? String(raw.featuredNeighborhood) : undefined,
    rules: Array.isArray(raw.rules) ? raw.rules.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : []
  };
}

export function normalizeAssetItem(raw: any): AssetItem {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || 'Sticker'),
    category: raw.category || 'Packs em Parceria',
    type: raw.type === 'animated_sticker' ? 'animated_sticker' : 'static_sticker',
    url: String(raw.url || ''),
    thumbnailUrl: raw.thumbnailUrl ? String(raw.thumbnailUrl) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    aspectRatio: typeof raw.aspectRatio === 'number' ? raw.aspectRatio : 1.0,
    animationMetadata: raw.animationMetadata ? {
      frameCount: typeof raw.animationMetadata.frameCount === 'number' ? raw.animationMetadata.frameCount : undefined,
      durationMs: typeof raw.animationMetadata.durationMs === 'number' ? raw.animationMetadata.durationMs : undefined,
      loop: Boolean(raw.animationMetadata.loop)
    } : undefined,
    packId: raw.packId ? String(raw.packId) : undefined,
    sponsorName: raw.sponsorName ? String(raw.sponsorName) : undefined
  };
}

export function normalizeBrandedPack(raw: any): BrandedAssetPack {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Pack de Stickers'),
    sponsor: normalizeSponsorProfile(raw.sponsor),
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    startDate: String(raw.startDate || ''),
    endDate: String(raw.endDate || ''),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeAssetItem) : [],
    usageCount: typeof raw.usageCount === 'number' ? raw.usageCount : 0,
    description: raw.description ? String(raw.description) : undefined
  };
}

/**
 * Recursive Sanitizer for Firestore
 * Strips all properties with `undefined` values so Firestore setDoc/updateDoc never throws "Unsupported field value: undefined".
 */
export function cleanUndefined<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanUndefined(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Initial Seeding to Firestore only executed once if collections are empty
let isSeedingAttempted = false;

export async function seedInitialFirestoreData() {
  if (isSeedingAttempted) return;
  isSeedingAttempted = true;

  try {
    const usersSnap = await getDocs(collection(db, 'users')).catch(() => null);
    if (usersSnap && usersSnap.empty) {
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), cleanUndefined(u)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const photosSnap = await getDocs(collection(db, 'photos')).catch(() => null);
    if (photosSnap && photosSnap.empty) {
      for (const p of INITIAL_PHOTOS) {
        await setDoc(doc(db, 'photos', p.id), cleanUndefined(p)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const spotsSnap = await getDocs(collection(db, 'graffitiSpots')).catch(() => null);
    if (spotsSnap && spotsSnap.empty) {
      for (const s of INITIAL_GRAFFITI_SPOTS) {
        await setDoc(doc(db, 'graffitiSpots', s.id), cleanUndefined(s)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const commentsSnap = await getDocs(collection(db, 'comments')).catch(() => null);
    if (commentsSnap && commentsSnap.empty) {
      for (const c of INITIAL_COMMENTS) {
        await setDoc(doc(db, 'comments', c.id), cleanUndefined(c)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const challengesSnap = await getDocs(collection(db, 'challenges')).catch(() => null);
    if (challengesSnap && challengesSnap.empty) {
      for (const ch of INITIAL_WEEKLY_CHALLENGES) {
        await setDoc(doc(db, 'challenges', ch.id), cleanUndefined(ch)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const badgesSnap = await getDocs(collection(db, 'badges')).catch(() => null);
    if (badgesSnap && badgesSnap.empty) {
      for (const b of BADGES) {
        await setDoc(doc(db, 'badges', b.id), cleanUndefined(b)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const brandedChallengesSnap = await getDocs(collection(db, 'brandedChallenges')).catch(() => null);
    if (brandedChallengesSnap && brandedChallengesSnap.empty) {
      for (const bc of INITIAL_BRANDED_CHALLENGES) {
        await setDoc(doc(db, 'brandedChallenges', bc.id), cleanUndefined(bc)).catch(() => {});
      }
    }
  } catch (_) {}

  try {
    const brandedPacksSnap = await getDocs(collection(db, 'brandedPacks')).catch(() => null);
    if (brandedPacksSnap && brandedPacksSnap.empty) {
      for (const bp of INITIAL_BRANDED_PACKS) {
        await setDoc(doc(db, 'brandedPacks', bp.id), cleanUndefined(bp)).catch(() => {});
      }
    }
  } catch (_) {}
}

const CACHE_KEYS = {
  USERS: 'upmm_cached_users',
  PHOTOS: 'upmm_cached_photos',
  SPOTS: 'upmm_cached_spots',
  COMMENTS: 'upmm_cached_comments',
  CHALLENGES: 'upmm_cached_challenges',
  NOTIFICATIONS: 'upmm_cached_notifications',
  BADGES: 'upmm_cached_badges',
  BRANDED_CHALLENGES: 'upmm_cached_branded_challenges',
  BRANDED_PACKS: 'upmm_cached_branded_packs'
};

export function getCachedCollection<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function setCachedCollection<T>(key: string, data: T[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Erro ao atualizar cache local:', e);
  }
}

/**
 * Subscribe to real-time updates from Firestore
 * Single Source of Truth: Data received from snapshots is normalized, cached locally, and passed to state.
 */
export function subscribeToFirestore(callbacks: {
  onUsers: (users: User[]) => void;
  onPhotos: (photos: PhotoBase[]) => void;
  onSpots: (spots: GraffitiSpot[]) => void;
  onComments: (comments: Comment[]) => void;
  onChallenges: (challenges: WeeklyChallenge[]) => void;
  onNotifications?: (notifications: RemixNotification[]) => void;
  onBadges?: (badges: Badge[]) => void;
  onBrandedChallenges?: (brandedChallenges: BrandedChallenge[]) => void;
  onBrandedPacks?: (brandedPacks: BrandedAssetPack[]) => void;
}) {
  // 1. Hidratação imediata via cache ou dados iniciais de Palmas
  const initialUsers = getCachedCollection<User>(CACHE_KEYS.USERS, INITIAL_USERS);
  const initialPhotos = getCachedCollection<PhotoBase>(CACHE_KEYS.PHOTOS, INITIAL_PHOTOS);
  const initialSpots = getCachedCollection<GraffitiSpot>(CACHE_KEYS.SPOTS, INITIAL_GRAFFITI_SPOTS);
  const initialComments = getCachedCollection<Comment>(CACHE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const initialChallenges = getCachedCollection<WeeklyChallenge>(CACHE_KEYS.CHALLENGES, INITIAL_WEEKLY_CHALLENGES);
  const initialBrandedChallenges = getCachedCollection<BrandedChallenge>(CACHE_KEYS.BRANDED_CHALLENGES, INITIAL_BRANDED_CHALLENGES);
  const initialBrandedPacks = getCachedCollection<BrandedAssetPack>(CACHE_KEYS.BRANDED_PACKS, INITIAL_BRANDED_PACKS);

  callbacks.onUsers(initialUsers);
  callbacks.onPhotos(initialPhotos);
  callbacks.onSpots(initialSpots);
  callbacks.onComments(initialComments);
  callbacks.onChallenges(initialChallenges);
  if (callbacks.onBadges) callbacks.onBadges(BADGES);
  if (callbacks.onBrandedChallenges) callbacks.onBrandedChallenges(initialBrandedChallenges);
  if (callbacks.onBrandedPacks) callbacks.onBrandedPacks(initialBrandedPacks);

  // 2. Ouvintes remotos do Firestore com atualização de cache contínua
  const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeUser({ id: d.id, ...d.data() }));
      setCachedCollection(CACHE_KEYS.USERS, items);
      callbacks.onUsers(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      console.warn('[Firestore Sync] Conexão remota de usuários em modo offline:', err.message);
    }
  });

  const unsubPhotos = onSnapshot(collection(db, 'photos'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizePhoto({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCachedCollection(CACHE_KEYS.PHOTOS, items);
      callbacks.onPhotos(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      console.warn('[Firestore Sync] Conexão remota de fotos em modo offline:', err.message);
    }
  });

  const unsubSpots = onSnapshot(collection(db, 'graffitiSpots'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeGraffitiSpot({ id: d.id, ...d.data() }));
      setCachedCollection(CACHE_KEYS.SPOTS, items);
      callbacks.onSpots(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      console.warn('[Firestore Sync] Conexão remota de spots em modo offline:', err.message);
    }
  });

  const unsubComments = onSnapshot(collection(db, 'comments'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeComment({ id: d.id, ...d.data() }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      setCachedCollection(CACHE_KEYS.COMMENTS, items);
      callbacks.onComments(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      console.warn('[Firestore Sync] Conexão remota de comentários em modo offline:', err.message);
    }
  });

  const unsubChallenges = onSnapshot(collection(db, 'challenges'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeChallenge({ id: d.id, ...d.data() }));
      setCachedCollection(CACHE_KEYS.CHALLENGES, items);
      callbacks.onChallenges(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      console.warn('[Firestore Sync] Conexão remota de desafios em modo offline:', err.message);
    }
  });

  const unsubNotifications = callbacks.onNotifications 
    ? onSnapshot(collection(db, 'notifications'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeNotification({ id: d.id, ...d.data() }));
          items.sort((a, b) => b.createdAt - a.createdAt);
          setCachedCollection(CACHE_KEYS.NOTIFICATIONS, items);
          callbacks.onNotifications?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('[Firestore Sync] Conexão remota de notificações em modo offline:', err.message);
        }
      })
    : () => {};

  const unsubBadges = callbacks.onBadges
    ? onSnapshot(collection(db, 'badges'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBadge({ id: d.id, ...d.data() }));
          setCachedCollection(CACHE_KEYS.BADGES, items);
          callbacks.onBadges?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('[Firestore Sync] Conexão remota de badges em modo offline:', err.message);
        }
      })
    : () => {};

  const unsubBrandedChallenges = callbacks.onBrandedChallenges
    ? onSnapshot(collection(db, 'brandedChallenges'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBrandedChallenge({ id: d.id, ...d.data() }));
          setCachedCollection(CACHE_KEYS.BRANDED_CHALLENGES, items);
          callbacks.onBrandedChallenges?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('[Firestore Sync] Conexão remota de desafios parceiros em modo offline:', err.message);
        }
      })
    : () => {};

  const unsubBrandedPacks = callbacks.onBrandedPacks
    ? onSnapshot(collection(db, 'brandedPacks'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBrandedPack({ id: d.id, ...d.data() }));
          setCachedCollection(CACHE_KEYS.BRANDED_PACKS, items);
          callbacks.onBrandedPacks?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('[Firestore Sync] Conexão remota de packs parceiros em modo offline:', err.message);
        }
      })
    : () => {};

  return () => {
    unsubUsers();
    unsubPhotos();
    unsubSpots();
    unsubComments();
    unsubChallenges();
    unsubNotifications();
    unsubBadges();
    unsubBrandedChallenges();
    unsubBrandedPacks();
  };
}

/**
 * Data Mutation Operations com Persistência Offline-First e Sincronização Resiliente
 */
export async function persistUser(user: User): Promise<void> {
  const current = getCachedCollection<User>(CACHE_KEYS.USERS, INITIAL_USERS);
  const updated = [user, ...current.filter(u => u.id !== user.id)];
  setCachedCollection(CACHE_KEYS.USERS, updated);

  try {
    const payload = cleanUndefined(user);
    await withRetry(() => setDoc(doc(db, 'users', user.id), payload, { merge: true }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Perfil do usuário salvo no armazenamento local (${user.id}):`, error);
  }
}

export async function persistPhoto(photo: PhotoBase): Promise<void> {
  const current = getCachedCollection<PhotoBase>(CACHE_KEYS.PHOTOS, INITIAL_PHOTOS);
  const updated = [photo, ...current.filter(p => p.id !== photo.id)];
  setCachedCollection(CACHE_KEYS.PHOTOS, updated);

  try {
    const payload = cleanUndefined(photo);
    await withRetry(() => setDoc(doc(db, 'photos', photo.id), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Foto salva com sucesso no armazenamento local (${photo.id}):`, error);
  }
}

export async function updatePhotoInFirestore(photoId: string, updates: Partial<PhotoBase>): Promise<void> {
  const current = getCachedCollection<PhotoBase>(CACHE_KEYS.PHOTOS, INITIAL_PHOTOS);
  const updated = current.map(p => p.id === photoId ? { ...p, ...updates } : p);
  setCachedCollection(CACHE_KEYS.PHOTOS, updated);

  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'photos', photoId), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Foto atualizada no armazenamento local (${photoId}):`, error);
  }
}

export async function deletePhotoFromFirestore(photoId: string): Promise<void> {
  const current = getCachedCollection<PhotoBase>(CACHE_KEYS.PHOTOS, INITIAL_PHOTOS);
  const updated = current.filter(p => p.id !== photoId);
  setCachedCollection(CACHE_KEYS.PHOTOS, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'photos', photoId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Foto excluída no armazenamento local (${photoId}):`, error);
  }
}

export async function persistComment(comment: Comment): Promise<void> {
  const current = getCachedCollection<Comment>(CACHE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const updated = [comment, ...current.filter(c => c.id !== comment.id)];
  setCachedCollection(CACHE_KEYS.COMMENTS, updated);

  try {
    const payload = cleanUndefined(comment);
    await withRetry(() => setDoc(doc(db, 'comments', comment.id), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Comentário salvo no armazenamento local (${comment.id}):`, error);
  }
}

export async function persistSpot(spot: GraffitiSpot): Promise<void> {
  const current = getCachedCollection<GraffitiSpot>(CACHE_KEYS.SPOTS, INITIAL_GRAFFITI_SPOTS);
  const updated = [spot, ...current.filter(s => s.id !== spot.id)];
  setCachedCollection(CACHE_KEYS.SPOTS, updated);

  try {
    const payload = cleanUndefined(spot);
    await withRetry(() => setDoc(doc(db, 'graffitiSpots', spot.id), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Ponto de graffiti salvo no armazenamento local (${spot.id}):`, error);
  }
}

export async function deleteSpotFromFirestore(spotId: string): Promise<void> {
  const current = getCachedCollection<GraffitiSpot>(CACHE_KEYS.SPOTS, INITIAL_GRAFFITI_SPOTS);
  const updated = current.filter(s => s.id !== spotId);
  setCachedCollection(CACHE_KEYS.SPOTS, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'graffitiSpots', spotId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Ponto de graffiti removido no armazenamento local (${spotId}):`, error);
  }
}

export async function persistChallenge(challenge: WeeklyChallenge): Promise<void> {
  const current = getCachedCollection<WeeklyChallenge>(CACHE_KEYS.CHALLENGES, INITIAL_WEEKLY_CHALLENGES);
  const updated = [challenge, ...current.filter(c => c.id !== challenge.id)];
  setCachedCollection(CACHE_KEYS.CHALLENGES, updated);

  try {
    const payload = cleanUndefined(challenge);
    await withRetry(() => setDoc(doc(db, 'challenges', challenge.id), payload, { merge: true }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Desafio semanal salvo no armazenamento local (${challenge.id}):`, error);
  }
}

export async function deleteChallengeFromFirestore(challengeId: string): Promise<void> {
  const current = getCachedCollection<WeeklyChallenge>(CACHE_KEYS.CHALLENGES, INITIAL_WEEKLY_CHALLENGES);
  const updated = current.filter(c => c.id !== challengeId);
  setCachedCollection(CACHE_KEYS.CHALLENGES, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'challenges', challengeId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Desafio semanal removido no armazenamento local (${challengeId}):`, error);
  }
}

export async function persistNotification(notification: RemixNotification): Promise<void> {
  const current = getCachedCollection<RemixNotification>(CACHE_KEYS.NOTIFICATIONS, []);
  const updated = [notification, ...current.filter(n => n.id !== notification.id)];
  setCachedCollection(CACHE_KEYS.NOTIFICATIONS, updated);

  try {
    const payload = cleanUndefined(notification);
    await withRetry(() => setDoc(doc(db, 'notifications', notification.id), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Notificação salva no armazenamento local:`, error);
  }
}

export async function updateNotificationInFirestore(notificationId: string, updates: Partial<RemixNotification>): Promise<void> {
  const current = getCachedCollection<RemixNotification>(CACHE_KEYS.NOTIFICATIONS, []);
  const updated = current.map(n => n.id === notificationId ? { ...n, ...updates } : n);
  setCachedCollection(CACHE_KEYS.NOTIFICATIONS, updated);

  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'notifications', notificationId), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Notificação atualizada no armazenamento local:`, error);
  }
}

export async function persistBadge(badge: Badge): Promise<void> {
  const current = getCachedCollection<Badge>(CACHE_KEYS.BADGES, BADGES);
  const updated = [badge, ...current.filter(b => b.id !== badge.id)];
  setCachedCollection(CACHE_KEYS.BADGES, updated);

  try {
    const payload = cleanUndefined(badge);
    await withRetry(() => setDoc(doc(db, 'badges', badge.id), payload, { merge: true }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Badge salva no armazenamento local:`, error);
  }
}

export async function deleteBadgeFromFirestore(badgeId: string): Promise<void> {
  const current = getCachedCollection<Badge>(CACHE_KEYS.BADGES, BADGES);
  const updated = current.filter(b => b.id !== badgeId);
  setCachedCollection(CACHE_KEYS.BADGES, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'badges', badgeId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Badge removida no armazenamento local:`, error);
  }
}

export async function persistBrandedChallenge(challenge: BrandedChallenge): Promise<void> {
  const current = getCachedCollection<BrandedChallenge>(CACHE_KEYS.BRANDED_CHALLENGES, INITIAL_BRANDED_CHALLENGES);
  const updated = [challenge, ...current.filter(c => c.id !== challenge.id)];
  setCachedCollection(CACHE_KEYS.BRANDED_CHALLENGES, updated);

  try {
    const payload = cleanUndefined(challenge);
    await withRetry(() => setDoc(doc(db, 'brandedChallenges', challenge.id), payload, { merge: true }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Desafio parceiro salvo no armazenamento local:`, error);
  }
}

export async function updateBrandedChallengeInFirestore(challengeId: string, updates: Partial<BrandedChallenge>): Promise<void> {
  const current = getCachedCollection<BrandedChallenge>(CACHE_KEYS.BRANDED_CHALLENGES, INITIAL_BRANDED_CHALLENGES);
  const updated = current.map(c => c.id === challengeId ? { ...c, ...updates } : c);
  setCachedCollection(CACHE_KEYS.BRANDED_CHALLENGES, updated);

  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'brandedChallenges', challengeId), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Desafio parceiro atualizado no armazenamento local:`, error);
  }
}

export async function deleteBrandedChallengeFromFirestore(challengeId: string): Promise<void> {
  const current = getCachedCollection<BrandedChallenge>(CACHE_KEYS.BRANDED_CHALLENGES, INITIAL_BRANDED_CHALLENGES);
  const updated = current.filter(c => c.id !== challengeId);
  setCachedCollection(CACHE_KEYS.BRANDED_CHALLENGES, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'brandedChallenges', challengeId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Desafio parceiro removido no armazenamento local:`, error);
  }
}

export async function incrementBrandedChallengeSubmissionsInFirestore(challengeId: string): Promise<void> {
  try {
    await withRetry(() => updateDoc(doc(db, 'brandedChallenges', challengeId), {
      submissionsCount: increment(1)
    }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Submissão contabilizada localmente.`);
  }
}

export async function persistBrandedPack(pack: BrandedAssetPack): Promise<void> {
  const current = getCachedCollection<BrandedAssetPack>(CACHE_KEYS.BRANDED_PACKS, INITIAL_BRANDED_PACKS);
  const updated = [pack, ...current.filter(p => p.id !== pack.id)];
  setCachedCollection(CACHE_KEYS.BRANDED_PACKS, updated);

  try {
    const payload = cleanUndefined(pack);
    await withRetry(() => setDoc(doc(db, 'brandedPacks', pack.id), payload, { merge: true }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Pack parceiro salvo no armazenamento local:`, error);
  }
}

export async function updateBrandedPackInFirestore(packId: string, updates: Partial<BrandedAssetPack>): Promise<void> {
  const current = getCachedCollection<BrandedAssetPack>(CACHE_KEYS.BRANDED_PACKS, INITIAL_BRANDED_PACKS);
  const updated = current.map(p => p.id === packId ? { ...p, ...updates } : p);
  setCachedCollection(CACHE_KEYS.BRANDED_PACKS, updated);

  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'brandedPacks', packId), payload), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Pack parceiro atualizado no armazenamento local:`, error);
  }
}

export async function deleteBrandedPackFromFirestore(packId: string): Promise<void> {
  const current = getCachedCollection<BrandedAssetPack>(CACHE_KEYS.BRANDED_PACKS, INITIAL_BRANDED_PACKS);
  const updated = current.filter(p => p.id !== packId);
  setCachedCollection(CACHE_KEYS.BRANDED_PACKS, updated);

  try {
    await withRetry(() => deleteDoc(doc(db, 'brandedPacks', packId)), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Pack parceiro removido no armazenamento local:`, error);
  }
}

export async function incrementBrandedPackUsageInFirestore(packId: string): Promise<void> {
  try {
    await withRetry(() => updateDoc(doc(db, 'brandedPacks', packId), {
      usageCount: increment(1)
    }), 2, 250);
  } catch (error) {
    console.warn(`[Modo Local] Uso do pack computado localmente.`);
  }
}



