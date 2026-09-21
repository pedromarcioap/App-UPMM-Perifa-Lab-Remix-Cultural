
export enum UserLevel {
  OBSERVADOR = 'Observador',
  CRIADOR = 'Criador',
  ATIVISTA = 'Ativista Visual'
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category?: 'reputation' | 'creation' | 'battle' | 'territory' | 'special';
  secret?: boolean;
  unlockCriteria?: string;
  rewardResponsa?: number;
  createdAt?: number;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  password?: string;
  avatar: string;
  bio: string;
  vibe: number;
  responsa: number;
  level: UserLevel;
  badges: string[];
  isAdmin?: boolean;
  hasNotifications?: boolean;
  readNotificationIds?: string[];
  neighborhood?: string;
  instagram?: string;
  joinedDate?: string;
  completedChallenges?: string[];
  googleLinked?: boolean;
  supabaseLinked?: boolean;
  authProvider?: 'supabase' | 'firebase' | 'local';
  emailVerified?: boolean;
}

export interface AchievementEvent {
  id: string;
  type: 'badge' | 'level_up' | 'welcome';
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  rewardResponsa?: number;
  badgeId?: string;
  newLevel?: UserLevel;
}

export interface PhotoLocation {
  lat: number;
  lng: number;
  neighborhood: string;
  address?: string;
  landmark?: string;
}

export interface PhotoBase {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  imageUrl: string;
  tags: string[];
  vibeCount: number;
  isGoldStandard?: boolean;
  type: 'base' | 'remix';
  originalPhotoId?: string;
  location?: PhotoLocation;
  battleWins?: number;
  battleLosses?: number;
  battleStreak?: number;
  challengeId?: string;
  createdAt?: number;
  verified?: boolean;
  overlapRisk?: boolean;
  storagePath?: string;
  analysis?: ArtworkAnalysis;
  analysisStatus?: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
}

export interface GraffitiSpot {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: 'permitido' | 'sugerido';
  lat: number;
  lng: number;
  createdAt: number;
  address?: string;
  neighborhood?: string;
}

export interface Sticker {
  id: string;
  url: string;
  name: string;
  category?: 'tag' | 'spray' | 'cerrado' | 'urban' | 'shapes';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  rewardResponsa: number;
  rewardBadgeId: string;
  tags: string[];
  featuredNeighborhood?: string;
  status: 'active' | 'upcoming' | 'completed';
  rules: string[];
  winnerPhotoId?: string;
}

export interface Comment {
  id: string;
  targetId: string;
  targetType: 'photo' | 'spot';
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: number;
  likes?: number;
}

export interface RemixNotification {
  id: string;
  recipientUserId: string; // ID do dono da foto base original
  remixerId: string;
  remixerName: string;
  remixerAvatar?: string;
  remixerNeighborhood?: string;
  originalPhotoId: string;
  originalPhotoTitle: string;
  originalPhotoUrl?: string;
  remixPhotoId: string;
  remixPhotoTitle: string;
  remixPhotoUrl: string;
  createdAt: number;
  read: boolean;
}

export interface ArtworkAnalysis {
  id: string;
  artworkId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  proportionScore: number;
  perspectiveScore: number;
  tonalScore: number;
  overallScore: number;
  critique: string;
  strengths: string[];
  corrections: string[];
  suggestedDrills: string[];
  redlineOverlayUrl?: string;
  modelUsed?: string;
  createdAt: number;
  completedAt?: number;
}

export interface SupabaseIntegrationStatus {
  configured: boolean;
  url?: string;
  authActive: boolean;
  storageActive: boolean;
  databaseActive: boolean;
  sessionUserEmail?: string;
}

export * from './types/assets';

