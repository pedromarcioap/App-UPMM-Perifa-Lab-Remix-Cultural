import { getSupabase, getSupabaseClient } from './supabase';
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
  operation: () => PromiseLike<T>,
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
  throw new Error('Número máximo de tentativas de sincronização com Supabase excedido');
}

/**
 * Recursive Sanitizer for Supabase / JSON
 * Strips all properties with `undefined` values so Supabase queries never throw error.
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

/**
 * Schema Normalizers
 * Convert between Supabase PostgreSQL snake_case rows and App domain TypeScript interfaces.
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
    isAdmin: Boolean(raw.is_admin || raw.isAdmin),
    hasNotifications: Boolean(raw.has_notifications || raw.hasNotifications),
    readNotificationIds: Array.isArray(raw.read_notification_ids || raw.readNotificationIds) 
      ? (raw.read_notification_ids || raw.readNotificationIds).map(String) 
      : [],
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined,
    instagram: raw.instagram ? String(raw.instagram) : undefined,
    joinedDate: raw.joined_date || raw.joinedDate ? String(raw.joined_date || raw.joinedDate) : undefined,
    completedChallenges: Array.isArray(raw.completed_challenges || raw.completedChallenges) 
      ? (raw.completed_challenges || raw.completedChallenges).map(String) 
      : [],
    googleLinked: Boolean(raw.google_linked || raw.googleLinked),
    emailVerified: Boolean(raw.email_verified || raw.emailVerified)
  };
}

export function userToRow(user: User): Record<string, any> {
  return cleanUndefined({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    vibe: user.vibe,
    responsa: user.responsa,
    level: user.level,
    badges: user.badges || [],
    is_admin: Boolean(user.isAdmin),
    has_notifications: Boolean(user.hasNotifications),
    read_notification_ids: user.readNotificationIds || [],
    neighborhood: user.neighborhood,
    instagram: user.instagram,
    joined_date: user.joinedDate,
    completed_challenges: user.completedChallenges || [],
    google_linked: Boolean(user.googleLinked),
    email_verified: Boolean(user.emailVerified)
  });
}

export function normalizePhoto(raw: any): PhotoBase {
  return {
    id: String(raw.id || ''),
    userId: String(raw.user_id || raw.userId || ''),
    authorName: String(raw.author_name || raw.authorName || 'Artista Anônimo'),
    title: String(raw.title || 'Sem título'),
    imageUrl: String(raw.image_url || raw.imageUrl || ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : ['#Palmas', '#ArteDeRua'],
    vibeCount: typeof raw.vibe_count === 'number' ? raw.vibe_count : (typeof raw.vibeCount === 'number' ? raw.vibeCount : 0),
    isGoldStandard: Boolean(raw.is_gold_standard || raw.isGoldStandard),
    type: raw.type === 'remix' ? 'remix' : 'base',
    originalPhotoId: raw.original_photo_id || raw.originalPhotoId ? String(raw.original_photo_id || raw.originalPhotoId) : undefined,
    location: raw.location && typeof raw.location === 'object' ? {
      lat: typeof raw.location.lat === 'number' ? raw.location.lat : -10.2450,
      lng: typeof raw.location.lng === 'number' ? raw.location.lng : -48.3250,
      neighborhood: String(raw.location.neighborhood || 'Palmas'),
      address: raw.location.address ? String(raw.location.address) : undefined,
      landmark: raw.location.landmark ? String(raw.location.landmark) : undefined
    } : undefined,
    battleWins: typeof raw.battle_wins === 'number' ? raw.battle_wins : (typeof raw.battleWins === 'number' ? raw.battleWins : 0),
    battleLosses: typeof raw.battle_losses === 'number' ? raw.battle_losses : (typeof raw.battleLosses === 'number' ? raw.battleLosses : 0),
    battleStreak: typeof raw.battle_streak === 'number' ? raw.battle_streak : (typeof raw.battleStreak === 'number' ? raw.battleStreak : 0),
    challengeId: raw.challenge_id || raw.challengeId ? String(raw.challenge_id || raw.challengeId) : undefined,
    createdAt: typeof raw.created_at === 'number' ? raw.created_at : (typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()),
    verified: raw.verified !== undefined ? Boolean(raw.verified) : true,
    overlapRisk: Boolean(raw.overlap_risk || raw.overlapRisk)
  };
}

export function photoToRow(photo: PhotoBase): Record<string, any> {
  return cleanUndefined({
    id: photo.id,
    user_id: photo.userId,
    author_name: photo.authorName,
    title: photo.title,
    image_url: photo.imageUrl,
    tags: photo.tags || [],
    vibe_count: photo.vibeCount || 0,
    is_gold_standard: Boolean(photo.isGoldStandard),
    type: photo.type,
    original_photo_id: photo.originalPhotoId,
    location: photo.location,
    battle_wins: photo.battleWins || 0,
    battle_losses: photo.battleLosses || 0,
    battle_streak: photo.battleStreak || 0,
    challenge_id: photo.challengeId,
    created_at: photo.createdAt || Date.now(),
    verified: photo.verified !== undefined ? photo.verified : true,
    overlap_risk: Boolean(photo.overlapRisk)
  });
}

export function normalizeGraffitiSpot(raw: any): GraffitiSpot {
  return {
    id: String(raw.id || ''),
    userId: String(raw.user_id || raw.userId || ''),
    userName: String(raw.user_name || raw.userName || 'Muralista'),
    title: String(raw.title || 'Mural Urbano'),
    description: String(raw.description || ''),
    type: raw.type === 'sugerido' ? 'sugerido' : 'permitido',
    lat: typeof raw.lat === 'number' ? raw.lat : -10.2450,
    lng: typeof raw.lng === 'number' ? raw.lng : -48.3250,
    createdAt: typeof raw.created_at === 'number' ? raw.created_at : (typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()),
    address: raw.address ? String(raw.address) : undefined,
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined
  };
}

export function spotToRow(spot: GraffitiSpot): Record<string, any> {
  return cleanUndefined({
    id: spot.id,
    user_id: spot.userId,
    user_name: spot.userName,
    title: spot.title,
    description: spot.description,
    type: spot.type,
    lat: spot.lat,
    lng: spot.lng,
    created_at: spot.createdAt || Date.now(),
    address: spot.address,
    neighborhood: spot.neighborhood
  });
}

export function normalizeComment(raw: any): Comment {
  return {
    id: String(raw.id || ''),
    targetId: String(raw.target_id || raw.targetId || ''),
    targetType: raw.target_type === 'spot' || raw.targetType === 'spot' ? 'spot' : 'photo',
    userId: String(raw.user_id || raw.userId || ''),
    userName: String(raw.user_name || raw.userName || 'Comunidade'),
    userAvatar: String(raw.user_avatar || raw.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'),
    text: String(raw.text || ''),
    createdAt: typeof raw.created_at === 'number' ? raw.created_at : (typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()),
    likes: typeof raw.likes === 'number' ? raw.likes : 0
  };
}

export function commentToRow(comment: Comment): Record<string, any> {
  return cleanUndefined({
    id: comment.id,
    target_id: comment.targetId,
    target_type: comment.targetType,
    user_id: comment.userId,
    user_name: comment.userName,
    user_avatar: comment.userAvatar,
    text: comment.text,
    created_at: comment.createdAt || Date.now(),
    likes: comment.likes || 0
  });
}

export function normalizeChallenge(raw: any): WeeklyChallenge {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Desafio Urbano'),
    subtitle: String(raw.subtitle || ''),
    theme: String(raw.theme || 'Cultura de Quebrada'),
    description: String(raw.description || ''),
    bannerUrl: String(raw.banner_url || raw.bannerUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'),
    startDate: String(raw.start_date || raw.startDate || ''),
    endDate: String(raw.end_date || raw.endDate || ''),
    rewardResponsa: typeof raw.reward_responsa === 'number' ? raw.reward_responsa : (typeof raw.rewardResponsa === 'number' ? raw.rewardResponsa : 50),
    rewardBadgeId: String(raw.reward_badge_id || raw.rewardBadgeId || 'click'),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    featuredNeighborhood: raw.featured_neighborhood || raw.featuredNeighborhood ? String(raw.featured_neighborhood || raw.featuredNeighborhood) : undefined,
    status: raw.status === 'upcoming' || raw.status === 'completed' ? raw.status : 'active',
    rules: Array.isArray(raw.rules) ? raw.rules.map(String) : [],
    winnerPhotoId: raw.winner_photo_id || raw.winnerPhotoId ? String(raw.winner_photo_id || raw.winnerPhotoId) : undefined
  };
}

export function challengeToRow(challenge: WeeklyChallenge): Record<string, any> {
  return cleanUndefined({
    id: challenge.id,
    title: challenge.title,
    subtitle: challenge.subtitle,
    theme: challenge.theme,
    description: challenge.description,
    banner_url: challenge.bannerUrl,
    start_date: challenge.startDate,
    end_date: challenge.endDate,
    reward_responsa: challenge.rewardResponsa,
    reward_badge_id: challenge.rewardBadgeId,
    tags: challenge.tags || [],
    featured_neighborhood: challenge.featuredNeighborhood,
    status: challenge.status,
    rules: challenge.rules || [],
    winner_photo_id: challenge.winnerPhotoId
  });
}

export function normalizeNotification(raw: any): RemixNotification {
  return {
    id: String(raw.id || ''),
    recipientUserId: String(raw.recipient_user_id || raw.recipientUserId || ''),
    remixerId: String(raw.remixer_id || raw.remixerId || ''),
    remixerName: String(raw.remixer_name || raw.remixerName || 'Artista'),
    remixerAvatar: raw.remixer_avatar || raw.remixerAvatar ? String(raw.remixer_avatar || raw.remixerAvatar) : undefined,
    remixerNeighborhood: raw.remixer_neighborhood || raw.remixerNeighborhood ? String(raw.remixer_neighborhood || raw.remixerNeighborhood) : undefined,
    originalPhotoId: String(raw.original_photo_id || raw.originalPhotoId || ''),
    originalPhotoTitle: String(raw.original_photo_title || raw.originalPhotoTitle || ''),
    originalPhotoUrl: raw.original_photo_url || raw.originalPhotoUrl ? String(raw.original_photo_url || raw.originalPhotoUrl) : undefined,
    remixPhotoId: String(raw.remix_photo_id || raw.remixPhotoId || ''),
    remixPhotoTitle: String(raw.remix_photo_title || raw.remixPhotoTitle || ''),
    remixPhotoUrl: String(raw.remix_photo_url || raw.remixPhotoUrl || ''),
    createdAt: typeof raw.created_at === 'number' ? raw.created_at : (typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()),
    read: Boolean(raw.read)
  };
}

export function notificationToRow(notification: RemixNotification): Record<string, any> {
  return cleanUndefined({
    id: notification.id,
    recipient_user_id: notification.recipientUserId,
    remixer_id: notification.remixerId,
    remixer_name: notification.remixerName,
    remixer_avatar: notification.remixerAvatar,
    remixer_neighborhood: notification.remixerNeighborhood,
    original_photo_id: notification.originalPhotoId,
    original_photo_title: notification.originalPhotoTitle,
    original_photo_url: notification.originalPhotoUrl,
    remix_photo_id: notification.remixPhotoId,
    remix_photo_title: notification.remixPhotoTitle,
    remix_photo_url: notification.remixPhotoUrl,
    created_at: notification.createdAt || Date.now(),
    read: Boolean(notification.read)
  });
}

export function normalizeBadge(raw: any): Badge {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    icon: String(raw.icon || 'Sparkles'),
    description: String(raw.description || ''),
    category: raw.category || 'special',
    secret: Boolean(raw.secret),
    unlockCriteria: raw.unlock_criteria || raw.unlockCriteria ? String(raw.unlock_criteria || raw.unlockCriteria) : undefined,
    rewardResponsa: typeof raw.reward_responsa === 'number' ? raw.reward_responsa : (typeof raw.rewardResponsa === 'number' ? raw.rewardResponsa : 10),
    createdAt: typeof raw.created_at === 'number' ? raw.created_at : (typeof raw.createdAt === 'number' ? raw.createdAt : Date.now())
  };
}

export function badgeToRow(badge: Badge): Record<string, any> {
  return cleanUndefined({
    id: badge.id,
    name: badge.name,
    icon: badge.icon,
    description: badge.description,
    category: badge.category,
    secret: Boolean(badge.secret),
    unlock_criteria: badge.unlockCriteria,
    reward_responsa: badge.rewardResponsa,
    created_at: badge.createdAt || Date.now()
  });
}

export function normalizeSponsorProfile(raw: any): SponsorProfile {
  return {
    id: String(raw?.id || 'sponsor_default'),
    name: String(raw?.name || 'Marca Parceira'),
    logoUrl: String(raw?.logoUrl || raw?.logo_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=80'),
    brandColor: raw?.brandColor || raw?.brand_color ? String(raw.brandColor || raw.brand_color) : '#FFB800',
    websiteUrl: raw?.websiteUrl || raw?.website_url ? String(raw.websiteUrl || raw.website_url) : undefined
  };
}

export function normalizeBrandedChallenge(raw: any): BrandedChallenge {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Desafio Patrocinado'),
    description: String(raw.description || ''),
    sponsor: normalizeSponsorProfile(raw.sponsor),
    prizeDescription: String(raw.prize_description || raw.prizeDescription || 'Bolsa Cultural e Equipamentos'),
    rewardVibePoints: typeof raw.reward_vibe_points === 'number' ? raw.reward_vibe_points : (typeof raw.rewardVibePoints === 'number' ? raw.rewardVibePoints : 100),
    bannerUrl: String(raw.banner_url || raw.bannerUrl || 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80'),
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    startDate: String(raw.start_date || raw.startDate || ''),
    endDate: String(raw.end_date || raw.endDate || ''),
    submissionsCount: typeof raw.submissions_count === 'number' ? raw.submissions_count : (typeof raw.submissionsCount === 'number' ? raw.submissionsCount : 0),
    featuredNeighborhood: raw.featured_neighborhood || raw.featuredNeighborhood ? String(raw.featured_neighborhood || raw.featuredNeighborhood) : undefined,
    rules: Array.isArray(raw.rules) ? raw.rules.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : []
  };
}

export function brandedChallengeToRow(challenge: BrandedChallenge): Record<string, any> {
  return cleanUndefined({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    sponsor: challenge.sponsor,
    prize_description: challenge.prizeDescription,
    reward_vibe_points: challenge.rewardVibePoints,
    banner_url: challenge.bannerUrl,
    active: Boolean(challenge.active),
    start_date: challenge.startDate,
    end_date: challenge.endDate,
    submissions_count: challenge.submissionsCount || 0,
    featured_neighborhood: challenge.featuredNeighborhood,
    rules: challenge.rules || [],
    tags: challenge.tags || []
  });
}

export function normalizeAssetItem(raw: any): AssetItem {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || 'Sticker'),
    category: raw.category || 'Packs em Parceria',
    type: raw.type === 'animated_sticker' ? 'animated_sticker' : 'static_sticker',
    url: String(raw.url || ''),
    thumbnailUrl: raw.thumbnailUrl || raw.thumbnail_url ? String(raw.thumbnailUrl || raw.thumbnail_url) : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    aspectRatio: typeof raw.aspectRatio === 'number' ? raw.aspectRatio : (typeof raw.aspect_ratio === 'number' ? raw.aspect_ratio : 1.0),
    animationMetadata: raw.animationMetadata || raw.animation_metadata ? {
      frameCount: (raw.animationMetadata || raw.animation_metadata).frameCount,
      durationMs: (raw.animationMetadata || raw.animation_metadata).durationMs,
      loop: Boolean((raw.animationMetadata || raw.animation_metadata).loop)
    } : undefined,
    packId: raw.packId || raw.pack_id ? String(raw.packId || raw.pack_id) : undefined,
    sponsorName: raw.sponsorName || raw.sponsor_name ? String(raw.sponsorName || raw.sponsor_name) : undefined
  };
}

export function normalizeBrandedPack(raw: any): BrandedAssetPack {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Pack de Stickers'),
    sponsor: normalizeSponsorProfile(raw.sponsor),
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    startDate: String(raw.start_date || raw.startDate || ''),
    endDate: String(raw.end_date || raw.endDate || ''),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeAssetItem) : [],
    usageCount: typeof raw.usage_count === 'number' ? raw.usage_count : (typeof raw.usageCount === 'number' ? raw.usageCount : 0),
    description: raw.description ? String(raw.description) : undefined
  };
}

export function brandedPackToRow(pack: BrandedAssetPack): Record<string, any> {
  return cleanUndefined({
    id: pack.id,
    title: pack.title,
    sponsor: pack.sponsor,
    active: Boolean(pack.active),
    start_date: pack.startDate,
    end_date: pack.endDate,
    items: pack.items || [],
    usage_count: pack.usageCount || 0,
    description: pack.description
  });
}

// Initial Seeding to Supabase only executed once if tables exist and are empty
let isSeedingAttempted = false;

export async function seedInitialSupabaseData() {
  if (isSeedingAttempted) return;
  isSeedingAttempted = true;

  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data: users, error: uErr } = await client.from('profiles').select('id').limit(1);
    if (!uErr && users && users.length === 0) {
      for (const u of INITIAL_USERS) {
        try { await client.from('profiles').upsert(userToRow(u)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: photos, error: pErr } = await client.from('photos').select('id').limit(1);
    if (!pErr && photos && photos.length === 0) {
      for (const p of INITIAL_PHOTOS) {
        try { await client.from('photos').upsert(photoToRow(p)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: spots, error: sErr } = await client.from('graffiti_spots').select('id').limit(1);
    if (!sErr && spots && spots.length === 0) {
      for (const s of INITIAL_GRAFFITI_SPOTS) {
        try { await client.from('graffiti_spots').upsert(spotToRow(s)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: comments, error: cErr } = await client.from('comments').select('id').limit(1);
    if (!cErr && comments && comments.length === 0) {
      for (const c of INITIAL_COMMENTS) {
        try { await client.from('comments').upsert(commentToRow(c)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: challenges, error: chErr } = await client.from('challenges').select('id').limit(1);
    if (!chErr && challenges && challenges.length === 0) {
      for (const ch of INITIAL_WEEKLY_CHALLENGES) {
        try { await client.from('challenges').upsert(challengeToRow(ch)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: badges, error: bErr } = await client.from('badges').select('id').limit(1);
    if (!bErr && badges && badges.length === 0) {
      for (const b of BADGES) {
        try { await client.from('badges').upsert(badgeToRow(b)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: brandedCh, error: bcErr } = await client.from('branded_challenges').select('id').limit(1);
    if (!bcErr && brandedCh && brandedCh.length === 0) {
      for (const bc of INITIAL_BRANDED_CHALLENGES) {
        try { await client.from('branded_challenges').upsert(brandedChallengeToRow(bc)); } catch (_) {}
      }
    }
  } catch (_) {}

  try {
    const { data: brandedPk, error: bpErr } = await client.from('branded_packs').select('id').limit(1);
    if (!bpErr && brandedPk && brandedPk.length === 0) {
      for (const bp of INITIAL_BRANDED_PACKS) {
        try { await client.from('branded_packs').upsert(brandedPackToRow(bp)); } catch (_) {}
      }
    }
  } catch (_) {}
}

/**
 * Subscribe to real-time updates and initial fetch from Supabase
 */
export function subscribeToSupabase(callbacks: {
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
  const client = getSupabaseClient();
  if (!client) return () => {};

  // Fetch initial data
  const fetchAll = async () => {
    try {
      const { data: u } = await client.from('profiles').select('*');
      if (u && u.length > 0) callbacks.onUsers(u.map(normalizeUser));

      const { data: p } = await client.from('photos').select('*');
      if (p && p.length > 0) callbacks.onPhotos(p.map(normalizePhoto));

      const { data: s } = await client.from('graffiti_spots').select('*');
      if (s && s.length > 0) callbacks.onSpots(s.map(normalizeGraffitiSpot));

      const { data: c } = await client.from('comments').select('*');
      if (c && c.length > 0) {
        const sorted = c.map(normalizeComment).sort((a, b) => b.createdAt - a.createdAt);
        callbacks.onComments(sorted);
      }

      const { data: ch } = await client.from('challenges').select('*');
      if (ch && ch.length > 0) callbacks.onChallenges(ch.map(normalizeChallenge));

      if (callbacks.onNotifications) {
        const { data: n } = await client.from('notifications').select('*');
        if (n && n.length > 0) {
          const sortedNotifs = n.map(normalizeNotification).sort((a, b) => b.createdAt - a.createdAt);
          callbacks.onNotifications(sortedNotifs);
        }
      }

      if (callbacks.onBadges) {
        const { data: b } = await client.from('badges').select('*');
        if (b && b.length > 0) callbacks.onBadges(b.map(normalizeBadge));
      }

      if (callbacks.onBrandedChallenges) {
        const { data: bc } = await client.from('branded_challenges').select('*');
        if (bc) callbacks.onBrandedChallenges(bc.map(normalizeBrandedChallenge));
      }

      if (callbacks.onBrandedPacks) {
        const { data: bp } = await client.from('branded_packs').select('*');
        if (bp) callbacks.onBrandedPacks(bp.map(normalizeBrandedPack));
      }
    } catch (err) {
      console.warn('Aviso ao consultar dados iniciais do Supabase:', err);
    }
  };

  fetchAll();

  // Setup Realtime subscription
  const channel = client.channel('public:upmm_realtime_changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      fetchAll();
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Data Mutation Operations in Supabase with Retry
 */
export async function persistUser(user: User): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = userToRow(user);
    await withRetry(() => client.from('profiles').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir usuário no Supabase:', error);
    throw error;
  }
}

export async function persistPhoto(photo: PhotoBase): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = photoToRow(photo);
    await withRetry(() => client.from('photos').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir foto no Supabase:', error);
    throw error;
  }
}

export async function updatePhotoInSupabase(photoId: string, updates: Partial<PhotoBase>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const rowUpdates = cleanUndefined({
      vibe_count: updates.vibeCount,
      battle_wins: updates.battleWins,
      battle_losses: updates.battleLosses,
      battle_streak: updates.battleStreak,
      is_gold_standard: updates.isGoldStandard,
      verified: updates.verified
    });
    await withRetry(() => client.from('photos').update(rowUpdates).eq('id', photoId));
  } catch (error) {
    console.error('Erro ao atualizar foto no Supabase:', error);
    throw error;
  }
}

export async function deletePhotoFromSupabase(photoId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('photos').delete().eq('id', photoId));
  } catch (error) {
    console.error('Erro ao deletar foto do Supabase:', error);
    throw error;
  }
}

export async function persistComment(comment: Comment): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = commentToRow(comment);
    await withRetry(() => client.from('comments').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir comentário no Supabase:', error);
    throw error;
  }
}

export async function persistSpot(spot: GraffitiSpot): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = spotToRow(spot);
    await withRetry(() => client.from('graffiti_spots').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir mural no Supabase:', error);
    throw error;
  }
}

export async function deleteSpotFromSupabase(spotId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('graffiti_spots').delete().eq('id', spotId));
  } catch (error) {
    console.error('Erro ao deletar mural do Supabase:', error);
    throw error;
  }
}

export async function persistChallenge(challenge: WeeklyChallenge): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = challengeToRow(challenge);
    await withRetry(() => client.from('challenges').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir desafio no Supabase:', error);
    throw error;
  }
}

export async function deleteChallengeFromSupabase(challengeId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('challenges').delete().eq('id', challengeId));
  } catch (error) {
    console.error('Erro ao deletar desafio do Supabase:', error);
    throw error;
  }
}

export async function persistNotification(notification: RemixNotification): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = notificationToRow(notification);
    await withRetry(() => client.from('notifications').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir notificação no Supabase:', error);
    throw error;
  }
}

export async function updateNotificationInSupabase(notificationId: string, updates: Partial<RemixNotification>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const rowUpdates = cleanUndefined({
      read: updates.read
    });
    await withRetry(() => client.from('notifications').update(rowUpdates).eq('id', notificationId));
  } catch (error) {
    console.error('Erro ao atualizar notificação no Supabase:', error);
    throw error;
  }
}

export async function persistBadge(badge: Badge): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = badgeToRow(badge);
    await withRetry(() => client.from('badges').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir insígnia no Supabase:', error);
    throw error;
  }
}

export async function deleteBadgeFromSupabase(badgeId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('badges').delete().eq('id', badgeId));
  } catch (error) {
    console.error('Erro ao deletar insígnia do Supabase:', error);
    throw error;
  }
}

export async function persistBrandedChallenge(challenge: BrandedChallenge): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = brandedChallengeToRow(challenge);
    await withRetry(() => client.from('branded_challenges').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir desafio patrocinado no Supabase:', error);
    throw error;
  }
}

export async function updateBrandedChallengeInSupabase(challengeId: string, updates: Partial<BrandedChallenge>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const rowUpdates = cleanUndefined({
      submissions_count: updates.submissionsCount,
      active: updates.active
    });
    await withRetry(() => client.from('branded_challenges').update(rowUpdates).eq('id', challengeId));
  } catch (error) {
    console.error('Erro ao atualizar desafio patrocinado no Supabase:', error);
    throw error;
  }
}

export async function deleteBrandedChallengeFromSupabase(challengeId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('branded_challenges').delete().eq('id', challengeId));
  } catch (error) {
    console.error('Erro ao deletar desafio patrocinado do Supabase:', error);
    throw error;
  }
}

export async function incrementBrandedChallengeSubmissionsInSupabase(challengeId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { data } = await client.from('branded_challenges').select('submissions_count').eq('id', challengeId).single();
    const current = data?.submissions_count || 0;
    await withRetry(() => client.from('branded_challenges').update({ submissions_count: current + 1 }).eq('id', challengeId));
  } catch (error) {
    console.error('Erro ao incrementar submissões de desafio patrocinado no Supabase:', error);
  }
}

export async function persistBrandedPack(pack: BrandedAssetPack): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = brandedPackToRow(pack);
    await withRetry(() => client.from('branded_packs').upsert(payload));
  } catch (error) {
    console.error('Erro ao persistir pack patrocinado no Supabase:', error);
    throw error;
  }
}

export async function updateBrandedPackInSupabase(packId: string, updates: Partial<BrandedAssetPack>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const rowUpdates = cleanUndefined({
      usage_count: updates.usageCount,
      active: updates.active
    });
    await withRetry(() => client.from('branded_packs').update(rowUpdates).eq('id', packId));
  } catch (error) {
    console.error('Erro ao atualizar pack patrocinado no Supabase:', error);
    throw error;
  }
}

export async function deleteBrandedPackFromSupabase(packId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await withRetry(() => client.from('branded_packs').delete().eq('id', packId));
  } catch (error) {
    console.error('Erro ao deletar pack patrocinado do Supabase:', error);
    throw error;
  }
}

export async function incrementBrandedPackUsageInSupabase(packId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { data } = await client.from('branded_packs').select('usage_count').eq('id', packId).single();
    const current = data?.usage_count || 0;
    await withRetry(() => client.from('branded_packs').update({ usage_count: current + 1 }).eq('id', packId));
  } catch (error) {
    console.error('Erro ao incrementar uso do pack patrocinado no Supabase:', error);
  }
}
