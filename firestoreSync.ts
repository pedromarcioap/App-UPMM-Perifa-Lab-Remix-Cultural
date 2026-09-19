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
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now()
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

/**
 * Subscribe to real-time updates from Firestore
 * Single Source of Truth: Data received from snapshots is normalized and passed directly to state.
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
  const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeUser({ id: d.id, ...d.data() }));
      callbacks.onUsers(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  });

  const unsubPhotos = onSnapshot(collection(db, 'photos'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizePhoto({ id: d.id, ...d.data() }));
      callbacks.onPhotos(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'photos');
    }
  });

  const unsubSpots = onSnapshot(collection(db, 'graffitiSpots'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeGraffitiSpot({ id: d.id, ...d.data() }));
      callbacks.onSpots(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'graffitiSpots');
    }
  });

  const unsubComments = onSnapshot(collection(db, 'comments'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeComment({ id: d.id, ...d.data() }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      callbacks.onComments(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'comments');
    }
  });

  const unsubChallenges = onSnapshot(collection(db, 'challenges'), (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map(d => normalizeChallenge({ id: d.id, ...d.data() }));
      callbacks.onChallenges(items);
    }
  }, (err) => {
    if (err.code !== 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'challenges');
    }
  });

  const unsubNotifications = callbacks.onNotifications 
    ? onSnapshot(collection(db, 'notifications'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeNotification({ id: d.id, ...d.data() }));
          items.sort((a, b) => b.createdAt - a.createdAt);
          callbacks.onNotifications?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          handleFirestoreError(err, OperationType.GET, 'notifications');
        }
      })
    : () => {};

  const unsubBadges = callbacks.onBadges
    ? onSnapshot(collection(db, 'badges'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBadge({ id: d.id, ...d.data() }));
          callbacks.onBadges?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          handleFirestoreError(err, OperationType.GET, 'badges');
        }
      })
    : () => {};

  const unsubBrandedChallenges = callbacks.onBrandedChallenges
    ? onSnapshot(collection(db, 'brandedChallenges'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBrandedChallenge({ id: d.id, ...d.data() }));
          callbacks.onBrandedChallenges?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          handleFirestoreError(err, OperationType.GET, 'brandedChallenges');
        }
      })
    : () => {};

  const unsubBrandedPacks = callbacks.onBrandedPacks
    ? onSnapshot(collection(db, 'brandedPacks'), (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map(d => normalizeBrandedPack({ id: d.id, ...d.data() }));
          callbacks.onBrandedPacks?.(items);
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          handleFirestoreError(err, OperationType.GET, 'brandedPacks');
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
 * Data Mutation Operations with Exponential Backoff and Deep Undefined-Stripping
 */
export async function persistUser(user: User): Promise<void> {
  try {
    const payload = cleanUndefined(user);
    await withRetry(() => setDoc(doc(db, 'users', user.id), payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    throw error;
  }
}

export async function persistPhoto(photo: PhotoBase): Promise<void> {
  try {
    const payload = cleanUndefined(photo);
    await withRetry(() => setDoc(doc(db, 'photos', photo.id), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `photos/${photo.id}`);
    throw error;
  }
}

export async function updatePhotoInFirestore(photoId: string, updates: Partial<PhotoBase>): Promise<void> {
  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'photos', photoId), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `photos/${photoId}`);
    throw error;
  }
}

export async function deletePhotoFromFirestore(photoId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'photos', photoId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `photos/${photoId}`);
    throw error;
  }
}

export async function persistComment(comment: Comment): Promise<void> {
  try {
    const payload = cleanUndefined(comment);
    await withRetry(() => setDoc(doc(db, 'comments', comment.id), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comments/${comment.id}`);
    throw error;
  }
}

export async function persistSpot(spot: GraffitiSpot): Promise<void> {
  try {
    const payload = cleanUndefined(spot);
    await withRetry(() => setDoc(doc(db, 'graffitiSpots', spot.id), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `graffitiSpots/${spot.id}`);
    throw error;
  }
}

export async function deleteSpotFromFirestore(spotId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'graffitiSpots', spotId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `graffitiSpots/${spotId}`);
    throw error;
  }
}

export async function persistChallenge(challenge: WeeklyChallenge): Promise<void> {
  try {
    const payload = cleanUndefined(challenge);
    await withRetry(() => setDoc(doc(db, 'challenges', challenge.id), payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `challenges/${challenge.id}`);
    throw error;
  }
}

export async function deleteChallengeFromFirestore(challengeId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'challenges', challengeId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `challenges/${challengeId}`);
    throw error;
  }
}

export async function persistNotification(notification: RemixNotification): Promise<void> {
  try {
    const payload = cleanUndefined(notification);
    await withRetry(() => setDoc(doc(db, 'notifications', notification.id), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notifications/${notification.id}`);
    throw error;
  }
}

export async function updateNotificationInFirestore(notificationId: string, updates: Partial<RemixNotification>): Promise<void> {
  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'notifications', notificationId), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    throw error;
  }
}

export async function persistBadge(badge: Badge): Promise<void> {
  try {
    const payload = cleanUndefined(badge);
    await withRetry(() => setDoc(doc(db, 'badges', badge.id), payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `badges/${badge.id}`);
    throw error;
  }
}

export async function deleteBadgeFromFirestore(badgeId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'badges', badgeId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `badges/${badgeId}`);
    throw error;
  }
}

export async function persistBrandedChallenge(challenge: BrandedChallenge): Promise<void> {
  try {
    const payload = cleanUndefined(challenge);
    await withRetry(() => setDoc(doc(db, 'brandedChallenges', challenge.id), payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `brandedChallenges/${challenge.id}`);
    throw error;
  }
}

export async function updateBrandedChallengeInFirestore(challengeId: string, updates: Partial<BrandedChallenge>): Promise<void> {
  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'brandedChallenges', challengeId), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brandedChallenges/${challengeId}`);
    throw error;
  }
}

export async function deleteBrandedChallengeFromFirestore(challengeId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'brandedChallenges', challengeId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `brandedChallenges/${challengeId}`);
    throw error;
  }
}

export async function incrementBrandedChallengeSubmissionsInFirestore(challengeId: string): Promise<void> {
  try {
    await withRetry(() => updateDoc(doc(db, 'brandedChallenges', challengeId), {
      submissionsCount: increment(1)
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brandedChallenges/${challengeId}`);
  }
}

export async function persistBrandedPack(pack: BrandedAssetPack): Promise<void> {
  try {
    const payload = cleanUndefined(pack);
    await withRetry(() => setDoc(doc(db, 'brandedPacks', pack.id), payload, { merge: true }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `brandedPacks/${pack.id}`);
    throw error;
  }
}

export async function updateBrandedPackInFirestore(packId: string, updates: Partial<BrandedAssetPack>): Promise<void> {
  try {
    const payload = cleanUndefined(updates);
    await withRetry(() => updateDoc(doc(db, 'brandedPacks', packId), payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brandedPacks/${packId}`);
    throw error;
  }
}

export async function deleteBrandedPackFromFirestore(packId: string): Promise<void> {
  try {
    await withRetry(() => deleteDoc(doc(db, 'brandedPacks', packId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `brandedPacks/${packId}`);
    throw error;
  }
}

export async function incrementBrandedPackUsageInFirestore(packId: string): Promise<void> {
  try {
    await withRetry(() => updateDoc(doc(db, 'brandedPacks', packId), {
      usageCount: increment(1)
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brandedPacks/${packId}`);
  }
}



