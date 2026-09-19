
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Home, 
  PlusSquare, 
  User as UserIcon, 
  Camera, 
  Heart, 
  Globe,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Edit3,
  AlertTriangle,
  Search,
  Loader2,
  Sword,
  Map as MapIcon,
  GitBranch,
  Navigation,
  Trophy,
  Image as ImageIcon,
  Share2,
  MapPin,
  ExternalLink,
  Sparkles,
  Paintbrush,
  Navigation2,
  LocateFixed,
  Target,
  MessageSquare,
  Award,
  CheckCircle2,
  Crown,
  Zap,
  Flame,
  RotateCcw,
  Maximize2,
  Eye,
  Tag,
  Bell,
  Compass,
  Plus
} from 'lucide-react';
import { INITIAL_USERS, INITIAL_PHOTOS, INITIAL_GRAFFITI_SPOTS, INITIAL_COMMENTS, INITIAL_WEEKLY_CHALLENGES, COLORS, BADGES, PRESET_TAGS } from './constants';
import { User, PhotoBase, UserLevel, GraffitiSpot, Comment, WeeklyChallenge, RemixNotification, Badge } from './types';
import Editor from './components/Editor';
import { ExploreHub } from './components/ExploreHub';
import { PalmasRealMap } from './components/PalmasRealMap';
import { TopArtistas } from './components/TopArtistas';
import { BattleRanking } from './components/BattleRanking';
import { CommentsModal } from './components/CommentsModal';
import { WeeklyChallenges } from './components/WeeklyChallenges';
import { AdminChallengesCMS } from './components/AdminChallengesCMS';
import { BadgeCMS } from './components/BadgeCMS';
import { ProfileDashboard } from './components/ProfileDashboard';
import { AuthModal } from './components/AuthModal';
import { CommunitySpotlight } from './components/CommunitySpotlight';
import { AchievementCelebration } from './components/AchievementCelebration';
import { RemixPodium } from './components/RemixPodium';
import { AdminSponsorshipCMS } from './components/AdminSponsorshipCMS';
import { CuradoriaPopularCMS } from './components/CuradoriaPopularCMS';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { AdminGuard } from './components/AdminGuard';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { MobileBottomNavBar } from './components/MobileBottomNavBar';
import { PWAInstallBannerModal } from './components/PWAInstallBannerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AchievementEvent } from './types';
import { BrandedChallenge, BrandedAssetPack } from './types/assets';
import { 
  seedInitialFirestoreData, 
  subscribeToFirestore, 
  persistUser, 
  persistPhoto, 
  updatePhotoInFirestore, 
  deletePhotoFromFirestore, 
  persistComment, 
  persistSpot, 
  deleteSpotFromFirestore,
  persistChallenge,
  deleteChallengeFromFirestore,
  persistNotification,
  updateNotificationInFirestore,
  persistBadge,
  deleteBadgeFromFirestore,
  persistBrandedChallenge,
  deleteBrandedChallengeFromFirestore,
  persistBrandedPack,
  deleteBrandedPackFromFirestore,
  incrementBrandedPackUsageInFirestore
} from './firestoreSync';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getSupabaseCurrentUser, signOutSupabase, getSupabaseClient } from './supabase';

// Interface para locais descobertos via Gemini + Google Maps Grounding
interface DiscoveredSpot {
  title: string;
  uri: string;
  lat: number;
  lng: number;
  description: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('upmm_current_user_id');
      if (savedId) {
        const found = INITIAL_USERS.find(u => u.id === savedId);
        if (found) return found;
      }
    } catch {}
    return INITIAL_USERS[0] || null;
  });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [photos, setPhotos] = useState<PhotoBase[]>(INITIAL_PHOTOS);
  const [graffitiSpots, setGraffitiSpots] = useState<GraffitiSpot[]>(INITIAL_GRAFFITI_SPOTS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activeCommentTarget, setActiveCommentTarget] = useState<{
    targetId: string;
    targetType: 'photo' | 'spot';
    title: string;
    subtitle?: string;
    image?: string;
    badge?: string;
  } | null>(null);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(INITIAL_WEEKLY_CHALLENGES);
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [brandedChallenges, setBrandedChallenges] = useState<BrandedChallenge[]>([]);
  const [brandedPacks, setBrandedPacks] = useState<BrandedAssetPack[]>([]);
  const [selectedChallengeForUpload, setSelectedChallengeForUpload] = useState<WeeklyChallenge | null>(null);
  const [notifications, setNotifications] = useState<RemixNotification[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);
  const [isAdminDemoMode, setIsAdminDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('upmm_admin_mode') === 'true';
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Global Universal Search Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsUniversalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAdminDemo = () => {
    setIsAdminDemoMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('upmm_admin_mode', String(next));
      } catch {}
      return next;
    });
  };

  const isAdmin = Boolean(
    currentUser?.isAdmin || 
    currentUser?.email === 'pedromarcioap@gmail.com' || 
    isAdminDemoMode
  );

  // Sistema de Notificação Festiva (Toast + Modal com Confete)
  const [celebratingAchievement, setCelebratingAchievement] = useState<AchievementEvent | null>(null);
  const [toastAchievement, setToastAchievement] = useState<AchievementEvent | null>(null);

  const triggerAchievement = useCallback((event: AchievementEvent) => {
    setToastAchievement(event);
    setCelebratingAchievement(event);
  }, []);

  // Observador de Subida de Nível e Novas Insígnias do Usuário Ativo
  const prevBadgesRef = useRef<string[]>([]);
  const prevLevelRef = useRef<UserLevel | null>(null);

  useEffect(() => {
    if (!currentUser) {
      prevBadgesRef.current = [];
      prevLevelRef.current = null;
      return;
    }

    // Se é a primeira carga do usuário na sessão, inicializa referências sem disparar
    if (prevBadgesRef.current.length === 0 && prevLevelRef.current === null) {
      prevBadgesRef.current = currentUser.badges || [];
      prevLevelRef.current = currentUser.level;
      return;
    }

    // 1. Detectar nova insígnia conquistada
    if (currentUser.badges && currentUser.badges.length > prevBadgesRef.current.length) {
      const newBadgeId = currentUser.badges.find(b => !prevBadgesRef.current.includes(b));
      if (newBadgeId) {
        const badgeDef = BADGES.find(b => b.id === newBadgeId);
        triggerAchievement({
          id: `badge_${newBadgeId}_${Date.now()}`,
          type: 'badge',
          title: badgeDef ? badgeDef.name : 'Nova Insígnia Desbloqueada!',
          subtitle: `Conquista: ${badgeDef ? badgeDef.name : newBadgeId}`,
          icon: badgeDef ? badgeDef.icon : '🏅',
          description: badgeDef ? badgeDef.description : 'Você conquistou uma nova insígnia na cena periférica de Palmas!',
          rewardResponsa: 25,
          badgeId: newBadgeId
        });
      }
    }

    // 2. Detectar subida de nível
    if (prevLevelRef.current && prevLevelRef.current !== currentUser.level) {
      triggerAchievement({
        id: `level_${currentUser.level}_${Date.now()}`,
        type: 'level_up',
        title: `Subiu de Nível: ${currentUser.level}!`,
        subtitle: 'Evolução de Responsa na Quebrada',
        icon: '👑',
        description: `Parabéns! Sua vivência e contribuição na cena visual te consagraram como ${currentUser.level}!`,
        rewardResponsa: 50,
        newLevel: currentUser.level
      });
    }

    prevBadgesRef.current = currentUser.badges || [];
    prevLevelRef.current = currentUser.level;
  }, [currentUser?.badges, currentUser?.level, triggerAchievement]);

  // Firestore Real-Time Synchronization & Auth State Listener
  useEffect(() => {
    // 1. Seed initial data to Firestore if empty
    seedInitialFirestoreData();

    // 2. Real-time subscription to Firestore collections (Single Source of Truth)
    const unsubscribeFirestore = subscribeToFirestore({
      onUsers: (firestoreUsers) => {
        if (firestoreUsers.length > 0) {
          setUsers(firestoreUsers);
          setCurrentUser(prev => {
            const savedId = typeof window !== 'undefined' ? localStorage.getItem('upmm_current_user_id') : null;
            const targetId = prev?.id || savedId || firestoreUsers[0]?.id;
            const matched = firestoreUsers.find(u => u.id === targetId);
            return matched || prev || firestoreUsers[0] || null;
          });
        }
      },
      onPhotos: (firestorePhotos) => {
        if (firestorePhotos.length > 0) {
          setPhotos(firestorePhotos);
        }
      },
      onSpots: (firestoreSpots) => {
        if (firestoreSpots.length > 0) {
          setGraffitiSpots(firestoreSpots);
        }
      },
      onComments: (firestoreComments) => {
        if (firestoreComments.length > 0) {
          setComments(firestoreComments);
        }
      },
      onChallenges: (firestoreChallenges) => {
        if (firestoreChallenges.length > 0) {
          setChallenges(firestoreChallenges);
        }
      },
      onBadges: (firestoreBadges) => {
        if (firestoreBadges.length > 0) {
          setBadges(firestoreBadges);
        }
      },
      onNotifications: (firestoreNotifications) => {
        if (firestoreNotifications.length > 0) {
          setNotifications(firestoreNotifications);
        }
      },
      onBrandedChallenges: (firestoreBrandedChallenges) => {
        if (firestoreBrandedChallenges) {
          setBrandedChallenges(firestoreBrandedChallenges);
        }
      },
      onBrandedPacks: (firestoreBrandedPacks) => {
        if (firestoreBrandedPacks) {
          setBrandedPacks(firestoreBrandedPacks);
        }
      }
    });

    // 3. Listen to Firebase Auth state for real Google sessions
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUsers(prevUsers => {
          const matched = prevUsers.find(u => u.id === fbUser.uid || (fbUser.email && u.email === fbUser.email));
          const isUserAdmin = fbUser.email === 'pedromarcioap@gmail.com';
          if (matched) {
            const userWithAdmin = isUserAdmin ? { ...matched, isAdmin: true } : matched;
            setCurrentUser(userWithAdmin);
            try { localStorage.setItem('upmm_current_user_id', userWithAdmin.id); } catch {}
          } else {
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Artista Conectado',
              username: (fbUser.email?.split('@')[0] || 'artista').toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
              email: fbUser.email || '',
              avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
              bio: 'Artista periférico e visual de Palmas - TO autenticado com Google.',
              vibe: 100,
              responsa: 45,
              level: UserLevel.CRIADOR,
              badges: ['click', 'community'],
              isAdmin: isUserAdmin,
              neighborhood: 'Taquaralto',
              googleLinked: true,
              joinedDate: new Date().toLocaleDateString('pt-BR'),
              completedChallenges: []
            };
            setCurrentUser(newUser);
            try { localStorage.setItem('upmm_current_user_id', newUser.id); } catch {}
            persistUser(newUser);
            return [...prevUsers, newUser];
          }
          return prevUsers;
        });
      }
    });

    // 4. Listen to Supabase Auth session if configured
    const sb = getSupabaseClient();
    let sbSubscription: { unsubscribe: () => void } | null = null;
    if (sb) {
      getSupabaseCurrentUser().then(sbUser => {
        if (sbUser) {
          setUsers(prevUsers => {
            const matched = prevUsers.find(u => u.id === sbUser.id || (sbUser.email && u.email === sbUser.email));
            if (matched) {
              setCurrentUser(matched);
            } else {
              setCurrentUser(sbUser);
              return [...prevUsers, sbUser];
            }
            return prevUsers;
          });
        }
      }).catch(() => {});

      const { data } = sb.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await getSupabaseCurrentUser();
          if (user) {
            setCurrentUser(user);
            try { localStorage.setItem('upmm_current_user_id', user.id); } catch {}
          }
        }
      });
      sbSubscription = data?.subscription || null;
    }

    return () => {
      unsubscribeFirestore();
      unsubscribeAuth();
      if (sbSubscription) {
        sbSubscription.unsubscribe();
      }
    };
  }, []);

  const handleSelectUser = (userOrId: string | User) => {
    let target: User | undefined;
    if (typeof userOrId === 'string') {
      target = users.find(u => u.id === userOrId) || INITIAL_USERS.find(u => u.id === userOrId);
    } else {
      target = userOrId;
    }
    if (target) {
      setCurrentUser(target);
      try {
        localStorage.setItem('upmm_current_user_id', target.id);
      } catch {}
    }
    setIsLoginModalOpen(false);
    setAuthModalReason(null);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('upmm_current_user_id');
    } catch {}
    if (auth.currentUser) {
      try {
        await auth.signOut();
      } catch (e) {
        console.warn('Erro ao deslogar do Firebase Auth:', e);
      }
    }
    try {
      await signOutSupabase();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login', reason: string | null = null) => {
    setAuthModalTab(tab);
    setAuthModalReason(reason);
    setIsLoginModalOpen(true);
  };

  const handleAddComment = (targetId: string, targetType: 'photo' | 'spot', text: string) => {
    if (!currentUser) {
      openAuthModal('login', 'Para comentar nas fotos e murais da quebrada, conecte-se.');
      return;
    }

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      targetId,
      targetType,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      createdAt: Date.now(),
      likes: 0
    };

    setComments(prev => [newComment, ...prev]);
    persistComment(newComment);

    // Reward commenting with +3 Responsa and Community badge
    const updatedResponsa = currentUser.responsa + 3;
    const updatedBadges = Array.from(new Set([...currentUser.badges, 'community']));
    const updatedUser: User = {
      ...currentUser,
      responsa: updatedResponsa,
      badges: updatedBadges,
      level: updatedResponsa >= 80 ? UserLevel.ATIVISTA : (updatedResponsa >= 30 ? UserLevel.CRIADOR : UserLevel.OBSERVADOR)
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    persistUser(updatedUser);
  };

  const openCommentsForPhoto = (photo: PhotoBase) => {
    setActiveCommentTarget({
      targetId: photo.id,
      targetType: 'photo',
      title: photo.title,
      subtitle: `por @${photo.authorName} • ${photo.location?.neighborhood || 'Palmas, TO'}`,
      image: photo.imageUrl,
      badge: photo.type === 'remix' ? 'Remix' : 'Foto Base'
    });
  };

  const openCommentsForSpot = (spot: GraffitiSpot) => {
    setActiveCommentTarget({
      targetId: spot.id,
      targetType: 'spot',
      title: spot.title,
      subtitle: `${spot.neighborhood || 'Palmas, TO'} • Mapeado por @${spot.userName}`,
      badge: spot.type === 'permitido' ? 'Muro Permitido' : 'Muro Sugerido'
    });
  };

  const handleOpenComments = (targetId: string, targetType: 'photo' | 'spot') => {
    if (targetType === 'photo') {
      const photo = photos.find(p => p.id === targetId);
      if (photo) {
        openCommentsForPhoto(photo);
        return;
      }
    } else {
      const spot = graffitiSpots.find(s => s.id === targetId);
      if (spot) {
        openCommentsForSpot(spot);
        return;
      }
    }
  };

  // Compute remix notifications for the current user (from Firestore notifications and discovered from remixes)
  const currentUserRemixNotifications = useMemo(() => {
    if (!currentUser) return [];

    const passed = notifications.filter(n => n.recipientUserId === currentUser.id);
    const existingRemixIds = new Set(passed.map(n => n.remixPhotoId));

    // Discover from all photos if any remix has originalPhotoId pointing to a base photo of currentUser
    const userOriginalPhotos = photos.filter(p => p.userId === currentUser.id && p.type === 'base');
    const userOriginalPhotoIds = new Set(userOriginalPhotos.map(p => p.id));

    const discovered: RemixNotification[] = [];
    photos.forEach(p => {
      if (p.type === 'remix' && p.originalPhotoId && userOriginalPhotoIds.has(p.originalPhotoId) && p.userId !== currentUser.id) {
        if (!existingRemixIds.has(p.id)) {
          const original = userOriginalPhotos.find(o => o.id === p.originalPhotoId);
          const remixer = users.find(u => u.id === p.userId);
          const notifId = `notif_${p.id}`;
          discovered.push({
            id: notifId,
            recipientUserId: currentUser.id,
            remixerId: p.userId,
            remixerName: p.authorName || remixer?.name || 'Artista da Quebrada',
            remixerAvatar: remixer?.avatar,
            remixerNeighborhood: remixer?.neighborhood || p.location?.neighborhood,
            originalPhotoId: original?.id || p.originalPhotoId,
            originalPhotoTitle: original?.title || 'Foto Original',
            originalPhotoUrl: original?.imageUrl,
            remixPhotoId: p.id,
            remixPhotoTitle: p.title,
            remixPhotoUrl: p.imageUrl,
            createdAt: p.createdAt || (Date.now() - 1000 * 60 * 60 * 2),
            read: Boolean(currentUser.readNotificationIds?.includes(notifId))
          });
        }
      }
    });

    const combined = [...passed, ...discovered];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined;
  }, [currentUser, notifications, photos, users]);

  const unreadRemixCount = useMemo(() => {
    if (!currentUser) return 0;
    return currentUserRemixNotifications.filter(n => !n.read && !currentUser.readNotificationIds?.includes(n.id)).length;
  }, [currentUser, currentUserRemixNotifications]);

  const handleMarkNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    updateNotificationInFirestore(notifId, { read: true });

    if (currentUser) {
      const readList = currentUser.readNotificationIds || [];
      if (!readList.includes(notifId)) {
        const nextRead = [...readList, notifId];
        const remainingUnread = currentUserRemixNotifications.some(n => n.id !== notifId && !n.read && !nextRead.includes(n.id));
        const updatedUser: User = {
          ...currentUser,
          readNotificationIds: nextRead,
          hasNotifications: remainingUnread
        };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        persistUser(updatedUser);
      }
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.recipientUserId === currentUser.id ? { ...n, read: true } : n));
    notifications.filter(n => n.recipientUserId === currentUser.id).forEach(n => {
      updateNotificationInFirestore(n.id, { read: true });
    });

    const allNotifIds = currentUserRemixNotifications.map(n => n.id);
    const updatedUser: User = {
      ...currentUser,
      hasNotifications: false,
      readNotificationIds: Array.from(new Set([...(currentUser.readNotificationIds || []), ...allNotifIds]))
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    persistUser(updatedUser);
  };

  // Simular Novo Remix para demonstração prática e verificação das notificações
  const handleSimulateRemix = () => {
    if (!currentUser) {
      openAuthModal('login', 'Conecte-se para receber ou simular notificações de remixes no seu perfil.');
      return;
    }

    // Achar foto base do usuário atual ou primeira foto base disponível
    let targetBase = photos.find(p => p.userId === currentUser.id && p.type === 'base');
    if (!targetBase) {
      // Se o usuário ainda não tiver foto base, atribuir uma matriz para teste
      targetBase = photos.find(p => p.type === 'base') || photos[0];
    }

    if (!targetBase) return;

    const remixerNames = ['Preto Real', 'B-Girl Palmas', 'Grafiteira do Aureny', 'Mestre das Tintas', 'Slam Tocantins'];
    const randomRemixerName = remixerNames[Math.floor(Math.random() * remixerNames.length)];
    const randomRemixerId = `user_sim_${Date.now()}`;
    const newRemixId = `remix_sim_${Date.now()}`;

    const simulatedRemix: PhotoBase = {
      id: newRemixId,
      userId: randomRemixerId,
      authorName: randomRemixerName,
      title: `Releitura Urbana: ${targetBase.title}`,
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      tags: ['Remix', 'Quebrada', 'Intervenção', 'Linhagem'],
      vibeCount: 15,
      type: 'remix',
      originalPhotoId: targetBase.id,
      battleWins: 2,
      battleLosses: 0,
      battleStreak: 2,
      location: targetBase.location,
      createdAt: Date.now()
    };

    setPhotos(prev => [simulatedRemix, ...prev]);
    persistPhoto(simulatedRemix);

    const newNotification: RemixNotification = {
      id: `notif_${Date.now()}`,
      recipientUserId: currentUser.id,
      remixerId: randomRemixerId,
      remixerName: randomRemixerName,
      remixerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      remixerNeighborhood: targetBase.location?.neighborhood || 'Taquaralto',
      originalPhotoId: targetBase.id,
      originalPhotoTitle: targetBase.title,
      originalPhotoUrl: targetBase.imageUrl,
      remixPhotoId: simulatedRemix.id,
      remixPhotoTitle: simulatedRemix.title,
      remixPhotoUrl: simulatedRemix.imageUrl,
      createdAt: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    persistNotification(newNotification);

    const updatedUser: User = {
      ...currentUser,
      hasNotifications: true
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    persistUser(updatedUser);

    // Disparar celebração festiva com link para a árvore de linhagem
    triggerAchievement({
      id: `remix_event_${Date.now()}`,
      type: 'level',
      title: 'Sua Arte foi Remixada!',
      subtitle: `@${randomRemixerName} criou um remix da sua foto`,
      icon: '🔔',
      description: `"${targetBase.title}" acaba de ganhar uma nova ramificação na árvore de linhagem coletiva de Palmas!`,
      rewardResponsa: 20
    });
  };

  const requireLogin = (action: () => void, reason: string = 'Para realizar esta ação e acumular pontos na comunidade, conecte-se.') => {
    if (!currentUser) {
      openAuthModal('login', reason);
      return;
    }
    action();
  };

  const handleLike = (photoId: string) => {
    requireLogin(async () => {
      // Snapshot state for optimistic rollback
      const previousPhotos = [...photos];
      const previousUser = currentUser ? { ...currentUser } : null;

      let nextVibes = 1;
      setPhotos(prev => prev.map(p => {
        if (p.id === photoId) {
          nextVibes = (p.vibeCount || 0) + 1;
          return { ...p, vibeCount: nextVibes };
        }
        return p;
      }));

      let updatedUser: User | null = null;
      if (currentUser) {
        updatedUser = { ...currentUser, vibe: (currentUser.vibe || 0) + 1 };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser!.id ? updatedUser! : u));
      }

      try {
        await updatePhotoInFirestore(photoId, { vibeCount: nextVibes });
        if (updatedUser) {
          await persistUser(updatedUser);
        }
      } catch (err) {
        console.warn("Falha na sincronização do like com Firestore. Revertendo estado local:", err);
        setPhotos(previousPhotos);
        if (previousUser) {
          setCurrentUser(previousUser);
          setUsers(prev => prev.map(u => u.id === previousUser.id ? previousUser : u));
        }
      }
    });
  };

  const handleVoteBattle = (winnerId: string, loserId: string) => {
    requireLogin(async () => {
      // Snapshot state for optimistic rollback
      const previousPhotos = [...photos];
      const previousUser = currentUser ? { ...currentUser } : null;

      let winnerWins = 1;
      let winnerStreak = 1;
      let loserLosses = 1;

      setPhotos(prev => prev.map(p => {
        if (p.id === winnerId) {
          winnerWins = (p.battleWins || 0) + 1;
          winnerStreak = (p.battleStreak || 0) + 1;
          return {
            ...p,
            vibeCount: (p.vibeCount || 0) + 1,
            battleWins: winnerWins,
            battleStreak: winnerStreak
          };
        }
        if (p.id === loserId) {
          loserLosses = (p.battleLosses || 0) + 1;
          return {
            ...p,
            battleLosses: loserLosses,
            battleStreak: 0
          };
        }
        return p;
      }));

      let updatedUser: User | null = null;
      if (currentUser) {
        const newBadges = Array.from(new Set([...currentUser.badges, 'battle_juror']));
        updatedUser = { 
          ...currentUser, 
          responsa: (currentUser.responsa || 0) + 5,
          vibe: (currentUser.vibe || 0) + 1,
          badges: newBadges
        };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser!.id ? updatedUser! : u));
      }

      try {
        await updatePhotoInFirestore(winnerId, { 
          battleWins: winnerWins, 
          battleStreak: winnerStreak 
        });
        await updatePhotoInFirestore(loserId, { 
          battleLosses: loserLosses, 
          battleStreak: 0 
        });
        if (updatedUser) {
          await persistUser(updatedUser);
        }
      } catch (err) {
        console.warn("Falha na sincronização do voto de batalha com Firestore. Revertendo estado local:", err);
        setPhotos(previousPhotos);
        if (previousUser) {
          setCurrentUser(previousUser);
          setUsers(prev => prev.map(u => u.id === previousUser.id ? previousUser : u));
        }
      }
    });
  };

  const handleShare = async (photo: PhotoBase) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/lineage/${photo.id}`;
    const shareData = {
      title: `UPMM - ${photo.title}`,
      text: `Confira essa visão de @${photo.authorName} na UPMM!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const handleAddRemix = (remix: PhotoBase) => {
    const originalPhoto = photos.find(p => p.id === remix.originalPhotoId);
    const remixWithLocation: PhotoBase = {
      ...remix,
      location: remix.location || (originalPhoto?.location ? { ...originalPhoto.location } : undefined)
    };
    setPhotos(prev => [remixWithLocation, ...prev]);
    persistPhoto(remixWithLocation);

    // Create RemixNotification for original photo owner
    if (originalPhoto && originalPhoto.userId) {
      const newNotification: RemixNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipientUserId: originalPhoto.userId,
        remixerId: currentUser?.id || remix.userId,
        remixerName: currentUser?.name || remix.authorName || 'Artista da Quebrada',
        remixerAvatar: currentUser?.avatar,
        remixerNeighborhood: currentUser?.neighborhood || 'Palmas, TO',
        originalPhotoId: originalPhoto.id,
        originalPhotoTitle: originalPhoto.title,
        originalPhotoUrl: originalPhoto.imageUrl,
        remixPhotoId: remix.id,
        remixPhotoTitle: remix.title,
        remixPhotoUrl: remix.imageUrl,
        createdAt: Date.now(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      persistNotification(newNotification);

      // Flag user hasNotifications
      setUsers(prev => prev.map(u => {
        if (u.id === originalPhoto.userId) {
          const updated = { ...u, hasNotifications: true };
          persistUser(updated);
          return updated;
        }
        return u;
      }));
    }

    if (currentUser) {
      const updatedCurrentUser = { 
        ...currentUser, 
        badges: Array.from(new Set([...currentUser.badges, 'alchemist'])),
        responsa: currentUser.responsa + 10
      };
      
      setUsers(prev => prev.map(u => {
        if (u.id === updatedCurrentUser.id) return updatedCurrentUser;
        return u;
      }));
      
      setCurrentUser(updatedCurrentUser);
      persistUser(updatedCurrentUser);
      navigate(`/profile/${currentUser.id}`);
    }
  };

  const handleAddSpot = (spot: GraffitiSpot) => {
    setGraffitiSpots(prev => [spot, ...prev]);
    persistSpot(spot);

    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        badges: Array.from(new Set([...currentUser.badges, 'spot_scout'])),
        responsa: currentUser.responsa + 20
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      persistUser(updatedUser);
    }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    persistUser(updatedUser);
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    persistUser(newUser);
    triggerAchievement({
      id: `welcome_${newUser.id}_${Date.now()}`,
      type: 'badge',
      title: 'Perfil Criado & E-mail Validado!',
      subtitle: 'Insígnia: Primeiro Clique',
      icon: '📸',
      description: `Parabéns @${newUser.name}! Seu cadastro foi validado por e-mail com sucesso. Você recebeu a insígnia oficial de Primeiro Clique e +35 Responsa para começar na cena!`,
      rewardResponsa: 35,
      badgeId: 'click'
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setComments(prev => prev.filter(c => c.targetId !== photoId));
    deletePhotoFromFirestore(photoId);
  };

  const handleEditPhoto = (photoId: string, updatedData: { title: string; tags: string[]; neighborhood?: string }) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        const updatedPhoto = {
          ...p,
          title: updatedData.title,
          tags: updatedData.tags,
          location: p.location ? {
            ...p.location,
            neighborhood: updatedData.neighborhood || p.location.neighborhood
          } : undefined
        };
        updatePhotoInFirestore(photoId, updatedPhoto);
        return updatedPhoto;
      }
      return p;
    }));
  };

  const handleDeleteSpot = (spotId: string) => {
    setGraffitiSpots(prev => prev.filter(s => s.id !== spotId));
    setComments(prev => prev.filter(c => c.targetId !== spotId));
    deleteSpotFromFirestore(spotId);
  };

  const handleOpenUploadForChallenge = (challenge: WeeklyChallenge) => {
    setSelectedChallengeForUpload(challenge);
    setIsUploadModalOpen(true);
  };

  const handleSaveChallenge = (challenge: WeeklyChallenge) => {
    setChallenges(prev => {
      const exists = prev.some(c => c.id === challenge.id);
      if (exists) {
        return prev.map(c => c.id === challenge.id ? challenge : c);
      }
      return [challenge, ...prev];
    });
    persistChallenge(challenge);
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
    deleteChallengeFromFirestore(challengeId);
  };

  const handleSetChallengeWinner = (challengeId: string, photoId: string) => {
    const targetChallenge = challenges.find(c => c.id === challengeId);
    if (!targetChallenge) return;
    const nextWinner = targetChallenge.winnerPhotoId === photoId ? undefined : photoId;
    const updatedChallenge = { ...targetChallenge, winnerPhotoId: nextWinner };

    setChallenges(prev => prev.map(c => c.id === challengeId ? updatedChallenge : c));
    persistChallenge(updatedChallenge);

    // If a winner was crowned, reward the photo and creator
    if (nextWinner) {
      const winnerPhoto = photos.find(p => p.id === photoId);
      if (winnerPhoto) {
        const nextVibe = (winnerPhoto.vibeCount || 0) + 50;
        updatePhotoInFirestore(photoId, { vibeCount: nextVibe });
        setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, vibeCount: nextVibe } : p));

        const author = users.find(u => u.id === winnerPhoto.userId);
        if (author) {
          const rewardBadge = targetChallenge.rewardBadgeId || 'weekly_warrior';
          const updatedBadges = Array.from(new Set([...author.badges, rewardBadge, 'top_artist']));
          const updatedAuthor: User = {
            ...author,
            responsa: author.responsa + (targetChallenge.rewardResponsa || 50),
            badges: updatedBadges,
            hasNotifications: true
          };
          setUsers(prev => prev.map(u => u.id === updatedAuthor.id ? updatedAuthor : u));
          persistUser(updatedAuthor);
          if (currentUser?.id === updatedAuthor.id) {
            setCurrentUser(updatedAuthor);
          }
        }
      }
    }
  };

  const handleSaveBadge = (badge: Badge) => {
    setBadges(prev => {
      const exists = prev.some(b => b.id === badge.id);
      if (exists) return prev.map(b => b.id === badge.id ? badge : b);
      return [...prev, badge];
    });
    persistBadge(badge);
  };

  const handleDeleteBadge = (badgeId: string) => {
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    deleteBadgeFromFirestore(badgeId);
  };

  const handleSaveBrandedChallenge = (challenge: BrandedChallenge) => {
    setBrandedChallenges(prev => {
      const exists = prev.some(c => c.id === challenge.id);
      if (exists) return prev.map(c => c.id === challenge.id ? challenge : c);
      return [...prev, challenge];
    });
    persistBrandedChallenge(challenge);
  };

  const handleDeleteBrandedChallenge = (challengeId: string) => {
    setBrandedChallenges(prev => prev.filter(c => c.id !== challengeId));
    deleteBrandedChallengeFromFirestore(challengeId);
  };

  const handleSaveBrandedPack = (pack: BrandedAssetPack) => {
    setBrandedPacks(prev => {
      const exists = prev.some(p => p.id === pack.id);
      if (exists) return prev.map(p => p.id === pack.id ? pack : p);
      return [...prev, pack];
    });
    persistBrandedPack(pack);
  };

  const handleDeleteBrandedPack = (packId: string) => {
    setBrandedPacks(prev => prev.filter(p => p.id !== packId));
    deleteBrandedPackFromFirestore(packId);
  };

  const handleTrackAssetUsage = (packId: string) => {
    incrementBrandedPackUsageInFirestore(packId);
  };

  const isEditorRoute = location.pathname.startsWith('/remix');

  return (
    <div 
      className={`min-h-screen bg-[#141311] ${isEditorRoute ? 'pb-0' : 'pb-28 sm:pb-24'} lg:pb-0 lg:pl-64 text-[#EDE8E1]`}
      style={{ paddingBottom: isEditorRoute ? '0px' : 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* PWA Direct Installation Banner and Guide Modal */}
      <PWAInstallBannerModal />

      {/* Barra de Cabeçalho Fixa no Topo para Celulares & Mobile Native Shell (oculta na rota do editor de remix para liberar 100% da tela) */}
      {!isEditorRoute && (
        <header className="lg:hidden sticky top-0 z-30 bg-[#141311]/95 backdrop-blur-md border-b border-[#3E3A35] px-4 py-2.5 flex items-center justify-between text-white shadow-sm">
          <Link to="/" className="flex items-center space-x-2" title="UPMM PERIFA LAB">
            <span className="text-xl font-display uppercase tracking-wider text-[#FFB800]">UPMM</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#242220] text-[#EDE8E1] px-2 py-0.5 rounded border border-[#3E3A35]">
              PERIFA LAB
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsUniversalSearchOpen(true)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#242220] hover:bg-[#2D2A26] text-[#FFB800] rounded-xl border border-[#3E3A35] transition"
              title="Buscar Obras, Muros e Artistas (⌘K)"
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>

            {currentUser ? (
              <Link
                to={`/profile/${currentUser.id}`}
                className="relative p-1 rounded-full border border-[#3E3A35] bg-[#242220] min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Meu Perfil"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon size={18} className="text-[#FFB800]" />
                )}
                {unreadRemixCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5722] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadRemixCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                onClick={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                className="px-3 py-1.5 min-h-[44px] bg-[#FFB800] text-[#141311] rounded-xl font-black text-xs uppercase flex items-center gap-1 shadow-sm"
              >
                <LogIn size={14} />
                <span>Entrar</span>
              </button>
            )}
            {isAdmin && (
              <Link
                to="/curadoria"
                className="text-[9px] font-black uppercase px-2 py-1 rounded-xl bg-amber-500/20 text-[#FFB800] border border-[#FFB800]/30 flex items-center gap-1"
              >
                <ShieldCheck size={11} />
                <span className="hidden sm:inline">Curador</span>
              </Link>
            )}
          </div>
        </header>
      )}

      {/* Barra Lateral Brutalista Editorial Fixa (Desktop) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-[#141311] border-r border-[#3E3A35] text-white p-5 z-50 overflow-y-auto no-scrollbar">
        {/* Brand Logo & Editorial Header */}
        <div className="mb-6">
          <Link to="/" className="block group">
            <h1 className="text-2xl font-display tracking-wider text-[#FFB800] uppercase leading-none">
              UPMM PERIFA LAB
            </h1>
            <p className="text-[9px] font-sans uppercase tracking-widest text-[#EDE8E1]/60 font-semibold mt-1">
              Cultura Urbana • Remix Territorial
            </p>
          </Link>

          {/* Quick Universal Search Trigger (⌘K) */}
          <button
            onClick={() => setIsUniversalSearchOpen(true)}
            className="mt-4 w-full flex items-center justify-between px-3 py-2 bg-[#1C1B19] hover:bg-[#242220] border border-[#3E3A35] hover:border-[#FFB800] rounded-xl text-xs text-[#EDE8E1]/70 transition group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="text-[#FFB800]" />
              <span className="font-medium">Busca Universal</span>
            </span>
            <span className="text-[9px] font-mono uppercase bg-[#242220] px-1.5 py-0.5 rounded text-[#EDE8E1]/60 group-hover:text-white border border-[#3E3A35]">
              ⌘K
            </span>
          </button>
        </div>

        {/* 5 Canonical Modules Navigation */}
        <nav className="space-y-1.5 flex-1 text-xs">
          <div className="text-[9px] font-mono font-bold uppercase text-[#EDE8E1]/40 px-2 pt-1 pb-1">
            Módulos Centrais
          </div>

          {/* [01] O FLUXO */}
          <Link 
            to="/" 
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              location.pathname === '/' 
                ? 'bg-[#FFB800] text-[#141311] font-bold shadow' 
                : 'text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-[10px] opacity-70">[01]</span>
              <span className="font-bold tracking-tight">O Fluxo</span>
            </div>
            <Home size={15} />
          </Link>

          {/* [02] ARENA & PÓDIO */}
          <Link 
            to="/battle" 
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              location.pathname === '/battle' || location.pathname === '/ranking' || location.pathname === '/podium-remixes'
                ? 'bg-[#FFB800] text-[#141311] font-bold shadow' 
                : 'text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-[10px] opacity-70">[02]</span>
              <span className="font-bold tracking-tight">Arena & Pódio</span>
            </div>
            <Sword size={15} className="text-[#FF5722]" />
          </Link>

          {/* [03] STUDIO REMIX */}
          <Link 
            to={photos.length > 0 ? `/remix/${photos[0].id}` : '/remix'} 
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              location.pathname.startsWith('/remix')
                ? 'bg-[#FFB800] text-[#141311] font-bold shadow' 
                : 'text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-[10px] opacity-70">[03]</span>
              <span className="font-bold tracking-tight">Studio Remix</span>
            </div>
            <Sparkles size={15} className="text-[#00E5FF]" />
          </Link>

          {/* [04] PERFIL & WALLET */}
          {currentUser ? (
            <Link 
              to={`/profile/${currentUser.id}`} 
              className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                location.pathname.startsWith('/profile')
                  ? 'bg-[#FFB800] text-[#141311] font-bold shadow' 
                  : 'text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[10px] opacity-70">[04]</span>
                <span className="font-bold tracking-tight">Perfil & Wallet</span>
              </div>
              {unreadRemixCount > 0 ? (
                <span className="w-2 h-2 bg-[#FF5722] rounded-full animate-ping" />
              ) : (
                <UserIcon size={15} />
              )}
            </Link>
          ) : (
            <button
              onClick={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white transition text-left"
            >
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[10px] opacity-70">[04]</span>
                <span className="font-bold tracking-tight">Perfil & Wallet</span>
              </div>
              <LogIn size={15} />
            </button>
          )}

          {/* [05] CURADORIA POPULAR & CMS (Visível estritamente para Administradores / Curadores) */}
          {isAdmin && (
            <Link 
              to="/curadoria" 
              className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                location.pathname === '/curadoria' || location.pathname.startsWith('/admin')
                  ? 'bg-[#FFB800] text-[#141311] font-bold shadow' 
                  : 'text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[10px] opacity-70">[05]</span>
                <span className="font-bold tracking-tight">Curadoria & CMS</span>
              </div>
              <ShieldCheck size={15} className="text-[#43A047]" />
            </Link>
          )}

          {/* Seção Territorial & Desafios */}
          <div className="text-[9px] font-mono font-bold uppercase text-[#EDE8E1]/40 px-2 pt-3 pb-1">
            Território & Fomento
          </div>

          <Link to="/explore" className="flex items-center justify-between p-2.5 rounded-xl text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white transition">
            <div className="flex items-center space-x-2.5">
              <Compass size={14} className="text-[#FFB800]" />
              <span>Explorar Hub</span>
            </div>
          </Link>

          <Link to="/challenges" className="flex items-center justify-between p-2.5 rounded-xl text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white transition">
            <div className="flex items-center space-x-2.5">
              <Flame size={14} className="text-[#FF5722]" />
              <span>Editais & Desafios</span>
            </div>
            <span className="text-[8px] bg-[#FF5722] text-white px-1.5 py-0.2 rounded font-mono font-bold">
              B2B
            </span>
          </Link>

          <Link to="/map" className="flex items-center justify-between p-2.5 rounded-xl text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white transition">
            <div className="flex items-center space-x-2.5">
              <MapIcon size={14} className="text-[#00E5FF]" />
              <span>Mapa da Visão</span>
            </div>
          </Link>

          <Link to="/podium-remixes" className="flex items-center justify-between p-2.5 rounded-xl text-[#EDE8E1]/80 hover:bg-[#1C1B19] hover:text-white transition">
            <div className="flex items-center space-x-2.5">
              <Crown size={14} className="text-[#FFB800]" />
              <span>Pódio de Remixes</span>
            </div>
          </Link>
        </nav>

        {/* User Info & Switcher Footer */}
        <div className="pt-4 border-t border-[#3E3A35] space-y-3">
          {currentUser ? (
            <div className="space-y-2">
              <Link 
                to={`/profile/${currentUser.id}`}
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-[#1C1B19] hover:bg-[#242220] border border-[#3E3A35] hover:border-[#FFB800] transition group cursor-pointer block"
                title="Ver Meu Perfil e Carteira de Responsa"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
                  }}
                  className="w-9 h-9 rounded-full object-cover border border-[#FFB800] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold truncate text-white group-hover:text-[#FFB800] transition">{currentUser.name}</p>
                    <span className="text-[9px] font-black text-[#FFB800] bg-[#141311] px-1.5 py-0.2 rounded border border-[#3E3A35]">
                      {currentUser.responsa || 0} pts
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase truncate">{currentUser.neighborhood || 'Palmas - TO'}</p>
                </div>
              </Link>

              <div className="flex items-center justify-between pt-1 px-1">
                <button 
                  type="button"
                  onClick={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                  className="flex items-center space-x-1.5 text-zinc-400 hover:text-white transition text-left text-[11px] font-bold"
                >
                  <UserIcon size={12} className="text-[#FFB800]" /> <span>Entrar em Outro Perfil</span>
                </button>
                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 transition text-left text-[11px] font-bold cursor-pointer"
                >
                  <LogOut size={12} /> <span>Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} 
                className="w-full py-2.5 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] rounded-xl font-bold text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn size={14} />
                <span>Entrar no Perfil</span>
              </button>

              <button 
                type="button"
                onClick={() => { setAuthModalTab('register'); setIsLoginModalOpen(true); }} 
                className="w-full py-1.5 text-[#EDE8E1]/70 hover:text-white text-[10px] font-bold uppercase transition block text-center"
              >
                + Criar Perfil de Artista
              </button>
            </div>
          )}

          {/* Quick Admin Toggle Helper */}
          <div className="pt-1">
            <button
              onClick={toggleAdminDemo}
              className={`w-full text-left text-[9px] uppercase font-mono px-2 py-1.5 rounded-lg transition flex items-center justify-between border cursor-pointer ${
                isAdminDemoMode 
                  ? 'bg-amber-500/20 text-[#FFB800] border-[#FFB800]/40' 
                  : 'text-[#EDE8E1]/50 hover:text-[#EDE8E1] border-[#3E3A35] bg-[#1C1B19]'
              }`}
            >
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className={isAdmin ? "text-[#FFB800]" : "text-zinc-600"} />
                <span>{isAdmin ? 'Curador / Admin Ativo' : 'Simular Curador'}</span>
              </span>
              <span className="underline font-bold">Alternar</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={isEditorRoute ? "w-full p-0 max-w-none h-[100dvh] lg:h-auto lg:p-4 lg:max-w-6xl mx-auto" : "max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8"}>
        <Routes>
          <Route path="/" element={<Feed photos={photos} onLike={handleLike} onShare={handleShare} currentUser={currentUser} onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} comments={comments} onOpenComments={openCommentsForPhoto} users={users} isAdmin={isAdmin} />} />
          <Route 
            path="/challenges" 
            element={
              <WeeklyChallenges 
                challenges={challenges} 
                photos={photos} 
                currentUser={currentUser} 
                onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} 
                onOpenUploadForChallenge={handleOpenUploadForChallenge}
                isAdmin={isAdmin}
                brandedChallenges={brandedChallenges}
              />
            } 
          />
          <Route 
            path="/admin/challenges" 
            element={
              <AdminGuard isAdmin={isAdmin}>
                <AdminChallengesCMS 
                  challenges={challenges}
                  photos={photos}
                  currentUser={currentUser}
                  onSaveChallenge={handleSaveChallenge}
                  onDeleteChallenge={handleDeleteChallenge}
                  onSetWinner={handleSetChallengeWinner}
                  onToggleAdminDemo={toggleAdminDemo}
                />
              </AdminGuard>
            } 
          />
          <Route 
            path="/admin/badges" 
            element={
              <AdminGuard isAdmin={isAdmin}>
                <BadgeCMS 
                  badges={badges}
                  currentUser={currentUser}
                  onSaveBadge={handleSaveBadge}
                  onDeleteBadge={handleDeleteBadge}
                />
              </AdminGuard>
            } 
          />
          <Route 
            path="/admin/sponsorships" 
            element={
              <AdminGuard isAdmin={isAdmin}>
                <AdminSponsorshipCMS 
                  brandedChallenges={brandedChallenges}
                  brandedPacks={brandedPacks}
                  photos={photos}
                  currentUser={currentUser}
                  onSaveBrandedChallenge={handleSaveBrandedChallenge}
                  onDeleteBrandedChallenge={handleDeleteBrandedChallenge}
                  onToggleBrandedChallengeStatus={(id, active) => {
                    const ch = brandedChallenges.find(c => c.id === id);
                    if (ch) handleSaveBrandedChallenge({ ...ch, active });
                  }}
                  onSaveBrandedPack={handleSaveBrandedPack}
                  onDeleteBrandedPack={handleDeleteBrandedPack}
                  onToggleBrandedPackStatus={(id, active) => {
                    const pk = brandedPacks.find(p => p.id === id);
                    if (pk) handleSaveBrandedPack({ ...pk, active });
                  }}
                  onToggleAdminDemo={toggleAdminDemo}
                />
              </AdminGuard>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ExploreHub 
                photos={photos}
                graffitiSpots={graffitiSpots}
                challenges={challenges}
                users={users}
                currentUser={currentUser}
                comments={comments}
                onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                onLike={handleLike}
                onShare={handleShare}
                onOpenComments={openCommentsForPhoto}
                onAddSpot={handleAddSpot}
                onVoteBattle={handleVoteBattle}
                onOpenUploadForChallenge={(ch) => {
                  if (!currentUser) {
                    setAuthModalTab('login');
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setSelectedChallengeForUpload(ch);
                  setIsUploadModalOpen(true);
                }}
                isAdmin={isAdmin}
                VibeBattleComponent={VibeBattle}
              />
            } 
          />
          <Route path="/map" element={<MapView photos={photos} graffitiSpots={graffitiSpots} onAddSpot={handleAddSpot} currentUser={currentUser} onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} comments={comments} onOpenComments={handleOpenComments} />} />
          <Route path="/ranking" element={<BattleRanking photos={photos} users={users} currentUser={currentUser} comments={comments} onOpenComments={openCommentsForPhoto} onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} initialTab="all" />} />
          <Route 
            path="/podium-remixes" 
            element={
              <RemixPodium 
                photos={photos} 
                users={users} 
                currentUser={currentUser} 
                comments={comments} 
                onOpenComments={openCommentsForPhoto} 
                onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} 
              />
            } 
          />
          <Route path="/remix-podium" element={<Navigate to="/podium-remixes" replace />} />
          <Route path="/top-artistas" element={<BattleRanking photos={photos} users={users} currentUser={currentUser} comments={comments} onOpenComments={openCommentsForPhoto} onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }} initialTab="artists" />} />
          <Route path="/battle" element={<VibeBattle photos={photos} onVoteBattle={handleVoteBattle} onRequireLogin={(reason) => openAuthModal('login', reason || 'Para votar na Batalha 1v1 e pontuar no Ranking da Quebrada, entre com seu perfil ou Google.')} currentUser={currentUser} />} />
          <Route path="/lineage/:photoId" element={<LineageView photos={photos} comments={comments} onOpenComments={openCommentsForPhoto} />} />
          <Route 
            path="/profile" 
            element={
              <ProfileDashboard 
                users={users} 
                photos={photos} 
                spots={graffitiSpots} 
                currentUser={currentUser} 
                onUpdateProfile={handleUpdateProfile} 
                onDeletePhoto={handleDeletePhoto} 
                onEditPhoto={handleEditPhoto} 
                onDeleteSpot={handleDeleteSpot} 
                onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                notifications={notifications}
                onMarkNotificationAsRead={handleMarkNotificationAsRead}
                onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                onSimulateRemix={handleSimulateRemix}
              />
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProfileDashboard 
                users={users} 
                photos={photos} 
                spots={graffitiSpots} 
                currentUser={currentUser} 
                onUpdateProfile={handleUpdateProfile} 
                onDeletePhoto={handleDeletePhoto} 
                onEditPhoto={handleEditPhoto} 
                onDeleteSpot={handleDeleteSpot} 
                onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                notifications={notifications}
                onMarkNotificationAsRead={handleMarkNotificationAsRead}
                onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                onSimulateRemix={handleSimulateRemix}
              />
            } 
          />
          <Route 
            path="/curadoria" 
            element={
              <AdminGuard isAdmin={isAdmin}>
                <CuradoriaPopularCMS 
                  photos={photos}
                  users={users}
                  graffitiSpots={graffitiSpots}
                  currentUser={currentUser}
                  onApprovePhoto={(id) => {
                    updatePhotoInFirestore(id, { verified: true });
                    setPhotos(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
                  }}
                  onRejectPhoto={(id) => {
                    deletePhotoFromFirestore(id);
                    setPhotos(prev => prev.filter(p => p.id !== id));
                  }}
                  onFlagOverlap={(id) => {
                    updatePhotoInFirestore(id, { overlapRisk: true });
                    setPhotos(prev => prev.map(p => p.id === id ? { ...p, overlapRisk: true } : p));
                  }}
                  onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
                  onToggleAdminDemo={toggleAdminDemo}
                  isAdmin={isAdmin}
                />
              </AdminGuard>
            } 
          />
          <Route 
            path="/remix/:photoId" 
            element={
              currentUser ? (
                <Editor 
                  photos={photos} 
                  onSave={handleAddRemix} 
                  user={currentUser} 
                  brandedPacks={brandedPacks}
                  onTrackAssetUsage={handleTrackAssetUsage}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/remix" 
            element={
              currentUser ? (
                photos.length > 0 ? (
                  <Navigate to={`/remix/${photos[0].id}`} replace />
                ) : (
                  <div className="p-8 text-center text-zinc-400">Nenhum muro base cadastrado para remixar.</div>
                )
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </main>

      {/* Mobile App Native Bottom Navigation Bar (oculta no estúdio de remix para evitar sobreposição nos controles criativos) */}
      {!isEditorRoute && (
        <div className="lg:hidden">
          <MobileBottomNavBar 
            currentUser={currentUser}
            unreadRemixCount={unreadRemixCount}
            onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
            onRequireLogin={() => { setAuthModalTab('login'); setIsLoginModalOpen(true); }}
          />
        </div>
      )}

      {/* Quick Create Bottom Sheet (+ FAB) */}
      {isQuickCreateOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsQuickCreateOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-[#18181B] border-t sm:border border-[#27272A] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1.5rem))] text-white shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FACC15] tracking-widest bg-[#FACC15]/10 px-2.5 py-0.5 rounded-full border border-[#FACC15]/20">
                  Criar na Quebrada
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                  Qual é a sua visão de hoje?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Actions with 48px touch targets */}
            <div className="space-y-3 pt-2">
              {/* Option 1: Tirar ou Subir Foto */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickCreateOpen(false);
                  if (!currentUser) {
                    setAuthModalReason('Faça login para registrar e subir fotos autorais da quebrada!');
                    setAuthModalTab('login');
                    setIsLoginModalOpen(true);
                  } else {
                    setIsUploadModalOpen(true);
                  }
                }}
                className="w-full min-h-[56px] p-4 bg-[#27272A] hover:bg-[#3F3F46] active:scale-98 rounded-2xl border border-zinc-700/60 flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#FACC15] text-[#18181B] flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition">
                    <Camera size={22} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">
                      Tirar ou Subir Foto Real
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Fotografe o muro, a rua ou paisagem da sua quebrada (+15 Responsa)
                    </p>
                  </div>
                </div>
                <span className="text-zinc-500 group-hover:text-white transition">&rarr;</span>
              </button>

              {/* Option 2: Remixar Foto do Fluxo */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickCreateOpen(false);
                  navigate('/');
                  setTimeout(() => {
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full min-h-[56px] p-4 bg-gradient-to-r from-purple-900/50 to-zinc-900 hover:from-purple-900/70 hover:to-zinc-800 active:scale-98 rounded-2xl border border-purple-500/30 flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition shadow-lg">
                    <Paintbrush size={22} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">
                      Remixar Foto no Estúdio
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Escolha uma foto no feed e lance grafites, tags e loops (+15 Responsa)
                    </p>
                  </div>
                </div>
                <span className="text-zinc-500 group-hover:text-white transition">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Comments Modal for Photos, Remixes, Muros Permitidos e Sugestões */}
      {activeCommentTarget && (
        <CommentsModal 
          isOpen={true}
          onClose={() => setActiveCommentTarget(null)}
          targetId={activeCommentTarget.targetId}
          targetType={activeCommentTarget.targetType}
          targetTitle={activeCommentTarget.title}
          targetSubtitle={activeCommentTarget.subtitle}
          targetImage={activeCommentTarget.image}
          targetBadge={activeCommentTarget.badge}
          comments={comments}
          onAddComment={handleAddComment}
          currentUser={currentUser}
          onRequireLogin={() => {
            setActiveCommentTarget(null);
            setAuthModalTab('login');
            setIsLoginModalOpen(true);
          }}
        />
      )}

      {isUploadModalOpen && currentUser && (
        <UploadModal 
          challenge={selectedChallengeForUpload}
          onClose={() => { setSelectedChallengeForUpload(null); setIsUploadModalOpen(false); }} 
          onUpload={(p) => { 
            setPhotos([p, ...photos]); 
            persistPhoto(p);
            const isChallenge = Boolean(selectedChallengeForUpload);
            const addedResponsa = isChallenge ? (selectedChallengeForUpload?.rewardResponsa || 35) : 15;
            const newBadges = new Set([...currentUser.badges, 'click']);
            if (isChallenge && selectedChallengeForUpload?.rewardBadgeId) {
              newBadges.add(selectedChallengeForUpload.rewardBadgeId);
            }
            const completedList = isChallenge && selectedChallengeForUpload 
              ? Array.from(new Set([...(currentUser.completedChallenges || []), selectedChallengeForUpload.id]))
              : (currentUser.completedChallenges || []);

            const updatedUser: User = {
              ...currentUser,
              badges: Array.from(newBadges),
              responsa: currentUser.responsa + addedResponsa,
              completedChallenges: completedList
            };
            setCurrentUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            persistUser(updatedUser);
            setSelectedChallengeForUpload(null);
            setIsUploadModalOpen(false); 
          }} 
          user={currentUser} 
        />
      )}
      {isLoginModalOpen && (
        <AuthModal 
          users={users} 
          currentUser={currentUser}
          initialTab={authModalTab}
          reason={authModalReason}
          onSelectUser={handleSelectUser} 
          onRegisterUser={handleRegisterUser}
          onClose={() => {
            setIsLoginModalOpen(false);
            setAuthModalReason(null);
          }} 
        />
      )}

      {/* Sistema de Notificação Festiva (Toast e Modal com Confete) */}
      <AchievementCelebration
        achievement={celebratingAchievement}
        toastAchievement={toastAchievement}
        onCloseModal={() => setCelebratingAchievement(null)}
        onCloseToast={() => setToastAchievement(null)}
        onOpenModal={(ach) => setCelebratingAchievement(ach)}
        onViewProfile={() => {
          if (currentUser) {
            navigate(`/profile/${currentUser.id}`);
          } else {
            navigate('/ranking');
          }
        }}
      />

      {/* Busca Universal de Obras, Artistas e Muros (⌘K) */}
      <UniversalSearchModal 
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        photos={photos}
        users={users}
        graffitiSpots={graffitiSpots}
        isAdmin={isAdmin}
        onSelectPhoto={(photoId) => {
          setIsUniversalSearchOpen(false);
          navigate(`/lineage/${photoId}`);
        }}
        onSelectUser={(userId) => {
          setIsUniversalSearchOpen(false);
          navigate(`/profile/${userId}`);
        }}
        onSelectSpot={() => {
          setIsUniversalSearchOpen(false);
          navigate('/map');
        }}
      />
    </div>
  );
};

/* --- Mapa da Visão Real de Palmas --- */
const MapView: React.FC<{ 
  photos: PhotoBase[], 
  graffitiSpots: GraffitiSpot[],
  onAddSpot: (spot: GraffitiSpot) => void,
  currentUser: User | null,
  onRequireLogin: () => void,
  comments: Comment[],
  onOpenComments: (targetId: string, targetType: 'photo' | 'spot') => void
}> = ({ photos, graffitiSpots, onAddSpot, currentUser, onRequireLogin, comments, onOpenComments }) => {
  const [searchParams] = useSearchParams();
  const selectedPhotoId = searchParams.get('photoId');
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);
  const [spotSuccessMsg, setSpotSuccessMsg] = useState<string | null>(null);
  const [pendingSpotData, setPendingSpotData] = useState<{ 
    lat: number; 
    lng: number; 
    neighborhood: string; 
    address: string; 
  } | null>(null);

  const handleOpenGraffitiModal = (data: { lat: number; lng: number; neighborhood: string; address: string }) => {
    setPendingSpotData(data);
    setIsSpotModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      {spotSuccessMsg && (
        <div className="fixed top-6 right-6 z-[120] bg-[#2D2A26] border-2 border-[#FFB800] text-white px-5 py-4 rounded-3xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4">
          <div className="p-2.5 bg-[#FFB800] text-[#2D2A26] rounded-2xl font-black">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wider text-[#FFB800]">Ponto Sinalizado no Mapa!</p>
            <p className="text-xs text-gray-200">{spotSuccessMsg}</p>
          </div>
          <button 
            onClick={() => setSpotSuccessMsg(null)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <PalmasRealMap 
        photos={photos}
        graffitiSpots={graffitiSpots}
        currentUser={currentUser}
        selectedPhotoId={selectedPhotoId}
        onSelectPhoto={(_p) => {}}
        onOpenGraffitiModal={handleOpenGraffitiModal}
        isMarkingMode={isMarkingMode}
        setIsMarkingMode={setIsMarkingMode}
        onRequireLogin={onRequireLogin}
        comments={comments}
        onOpenComments={onOpenComments}
      />

      {isSpotModalOpen && pendingSpotData && (
        <GraffitiSpotModal 
          spotData={pendingSpotData}
          onClose={() => {
            setIsSpotModalOpen(false);
            setPendingSpotData(null);
          }} 
          onSubmit={(s) => {
            onAddSpot({
              ...s,
              id: `spot_${Date.now()}`,
              userId: currentUser?.id || 'user_pmw_anon',
              userName: currentUser?.name || 'Artista Visual',
              createdAt: Date.now()
            });
            setIsSpotModalOpen(false);
            setPendingSpotData(null);
            setSpotSuccessMsg(`Ponto "${s.title}" registrado com sucesso em ${s.neighborhood}! +20 Responsa`);
            setTimeout(() => setSpotSuccessMsg(null), 5000);
          }}
        />
      )}
    </div>
  );
};

const GraffitiSpotModal: React.FC<{ 
  spotData: { lat: number; lng: number; neighborhood: string; address: string };
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ spotData, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'permitido' | 'sugerido'>('permitido');
  const [neighborhood, setNeighborhood] = useState(spotData.neighborhood);
  const [address, setAddress] = useState(spotData.address);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto">
      <div className="bg-[#1C1B19] border border-[#3E3A35] text-[#EDE8E1] w-full max-w-md rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[9px] font-black uppercase text-[#FFB800] bg-[#242220] border border-[#3E3A35] px-2 py-0.5 rounded-full">
              GPS: {spotData.lat.toFixed(4)}, {spotData.lng.toFixed(4)}
            </span>
            <h3 className="text-2xl font-black uppercase tracking-tighter mt-1 text-white">Novo Ponto de Arte PMW</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-[#242220] hover:bg-[#2D2A26] rounded-full text-zinc-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Situação do Local</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setType('permitido')} 
                className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase transition shadow-md ${
                  type === 'permitido' ? 'bg-emerald-600 text-white scale-102 shadow-emerald-900/30' : 'bg-[#242220] text-zinc-400 hover:bg-[#2D2A26]'
                }`}
              >
                ✓ Permitido / Autorizado
              </button>
              <button 
                type="button"
                onClick={() => setType('sugerido')} 
                className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase transition shadow-md ${
                  type === 'sugerido' ? 'bg-blue-600 text-white scale-102 shadow-blue-900/30' : 'bg-[#242220] text-zinc-400 hover:bg-[#2D2A26]'
                }`}
              >
                ★ Sugerido para Pintar
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Título do Ponto *</label>
            <input 
              type="text" 
              autoFocus
              placeholder="Ex: Muro Coletivo da Av. Tocantins" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800] transition" 
            />
            {!title.trim() && (
              <p className="text-[10px] text-amber-400 font-medium ml-1">Informe um nome ou título para o ponto</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Bairro / Território</label>
              <input 
                type="text" 
                value={neighborhood} 
                onChange={(e) => setNeighborhood(e.target.value)} 
                className="w-full p-3 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800] transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Endereço Real</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full p-3 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800] transition" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">
              Descrição e Condições <span className="text-zinc-500 font-normal lowercase">(opcional)</span>
            </label>
            <textarea 
              placeholder="Detalhes: estado do muro, quem autorizou ou referências visuais no local..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 h-24 focus:outline-none focus:border-[#FFB800] transition resize-none" 
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 font-black uppercase text-xs text-zinc-400 hover:text-red-400 transition">
              Cancelar
            </button>
            <button 
              disabled={!title.trim()}
              onClick={() => {
                if (!title.trim()) return;
                const fallbackDesc = type === 'permitido'
                  ? `Muro autorizado para graffiti e arte urbana em ${neighborhood || 'Palmas'}.`
                  : `Sugestão de espaço com potencial para intervenção artística em ${neighborhood || 'Palmas'}.`;
                onSubmit({ 
                  title: title.trim(), 
                  description: description.trim() || fallbackDesc, 
                  type, 
                  lat: spotData.lat, 
                  lng: spotData.lng,
                  neighborhood: neighborhood.trim() || spotData.neighborhood,
                  address: address.trim() || spotData.address
                });
              }} 
              className="flex-[2] bg-[#FFB800] text-[#2D2A26] py-3.5 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition disabled:opacity-50 cursor-pointer"
            >
              Confirmar Ponto em Palmas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Outros Componentes --- */
const SkeletonFeed: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
    {[1, 2, 3, 4].map(idx => (
      <div key={idx} className="bg-[#1C1B19] rounded-[2.5rem] overflow-hidden border border-[#3E3A35] shadow-sm flex flex-col justify-between">
        <div>
          <div className="w-full aspect-[4/5] bg-[#242220]" />
          <div className="p-5 pb-4 space-y-3">
            <div className="h-5 bg-[#242220] rounded-xl w-3/4" />
            <div className="h-3 bg-[#242220]/60 rounded-lg w-1/3" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 bg-[#242220]/60 rounded-lg w-16" />
              <div className="h-5 bg-[#242220]/60 rounded-lg w-20" />
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#3E3A35] mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 sm:gap-3 items-center">
            <div className="h-12 bg-[#242220] rounded-2xl w-full" />
            <div className="grid grid-cols-4 gap-1.5 justify-items-center w-full sm:w-auto">
              <div className="w-12 h-12 bg-[#242220] rounded-xl" />
              <div className="w-12 h-12 bg-[#242220] rounded-xl" />
              <div className="w-12 h-12 bg-[#242220] rounded-xl" />
              <div className="w-12 h-12 bg-[#242220] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Feed: React.FC<{ 
  photos: PhotoBase[], 
  onLike: (id: string) => void, 
  onShare: (photo: PhotoBase) => void, 
  currentUser: User | null, 
  onRequireLogin: () => void,
  comments: Comment[],
  onOpenComments: (photo: PhotoBase) => void,
  users: User[],
  isAdmin?: boolean
}> = ({ photos, onLike, onShare, currentUser, onRequireLogin, comments, onOpenComments, users, isAdmin }) => {
  const navigate = useNavigate();
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Helper to normalize tags (remove #, lowercase, trim)
  const normalizeTag = (t: string) => t.toLowerCase().replace(/^#/, '').trim();

  // Dynamically extract all registered tags from community photos and remixes with their count
  const registeredTagsWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach(p => {
      (p.tags || []).forEach(t => {
        const norm = normalizeTag(t);
        if (norm) {
          const display = t.startsWith('#') ? t : `#${t}`;
          let matchedKey = '';
          for (const key of counts.keys()) {
            if (normalizeTag(key) === norm) {
              matchedKey = key;
              break;
            }
          }
          if (matchedKey) {
            counts.set(matchedKey, (counts.get(matchedKey) || 0) + 1);
          } else {
            counts.set(display, 1);
          }
        }
      });
    });
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [photos]);

  // Filter photos & remixes by matching tags
  const filteredPhotos = useMemo(() => {
    const query = normalizeTag(tagSearchQuery);
    if (!query) return photos;
    return photos.filter(photo => {
      const photoTags = photo.tags || [];
      return photoTags.some(t => normalizeTag(t).includes(query));
    });
  }, [photos, tagSearchQuery]);

  // Count photos vs remixes in current filtered set
  const filteredRemixesCount = filteredPhotos.filter(p => p.type === 'remix').length;
  const filteredBasesCount = filteredPhotos.filter(p => p.type !== 'remix').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">O Fluxo</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estética periférica real de Palmas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link 
            to="/challenges" 
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white hover:scale-105 text-[10px] font-black uppercase px-3.5 py-2 rounded-2xl transition shadow-sm"
          >
            <Flame size={13} />
            <span>Desafios Semanais</span>
          </Link>
          <Link 
            to="/podium-remixes" 
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-[#FFB800] text-[#2D2A26] hover:scale-105 text-[10px] font-black uppercase px-3.5 py-2 rounded-2xl transition shadow-sm font-black"
          >
            <Crown size={13} />
            <span>Pódium Remixes</span>
          </Link>
          <Link 
            to="/battle" 
            className="inline-flex items-center gap-1.5 bg-[#FFB800] text-[#2D2A26] hover:scale-105 text-[10px] font-black uppercase px-3.5 py-2 rounded-2xl transition shadow-sm"
          >
            <Sword size={13} />
            <span>Arena de Batalha</span>
          </Link>
          <Link 
            to="/ranking" 
            className="inline-flex items-center gap-1.5 bg-[#2D2A26] text-[#FFB800] hover:bg-black text-[10px] font-black uppercase px-3.5 py-2 rounded-2xl transition shadow-sm"
          >
            <Trophy size={13} />
            <span>Ranking</span>
          </Link>
        </div>
      </header>

      {/* Destaque da Comunidade */}
      <CommunitySpotlight
        photos={photos}
        users={users}
        currentUser={currentUser}
        comments={comments}
        onLike={onLike}
        onOpenComments={onOpenComments}
        onRequireLogin={onRequireLogin}
        isAdmin={isAdmin}
      />

      {/* Barra de Busca de Tags no Topo do Fluxo */}
      <section className="bg-[#1C1B19] p-4 sm:p-5 rounded-[2.5rem] shadow-sm border border-[#3E3A35] space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 flex items-center space-x-1 pointer-events-none">
              <Search size={16} className="text-zinc-400" />
              <Tag size={15} className="text-[#FFB800]" />
            </div>
            <input 
              type="text"
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              placeholder="Filtrar fotos e remixes por tags (ex: #Cerrado, #Graffiti, Taquaralto, #Rua)..."
              className="w-full pl-14 pr-10 py-3.5 bg-[#242220] hover:bg-[#2A2825] focus:bg-[#242220] border border-[#3E3A35] focus:border-[#FFB800] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:outline-none transition shadow-inner"
            />
            {tagSearchQuery && (
              <button 
                type="button"
                onClick={() => setTagSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-[#2D2A26] transition"
                title="Limpar filtro de tags"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {tagSearchQuery && (
            <button 
              type="button"
              onClick={() => setTagSearchQuery('')}
              className="shrink-0 px-4 py-3 bg-[#242220] hover:bg-[#2D2A26] text-zinc-300 hover:text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 self-end sm:self-auto border border-[#3E3A35]"
            >
              <X size={14} />
              <span>Limpar Busca</span>
            </button>
          )}
        </div>

        {/* Tags Cadastradas da Comunidade - Botões Rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <Tag size={11} className="text-[#FFB800]" /> Tags:
          </span>
          <button
            type="button"
            onClick={() => setTagSearchQuery('')}
            className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition shrink-0 ${
              !tagSearchQuery.trim()
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-sm'
                : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            Todas ({photos.length})
          </button>
          {registeredTagsWithCount.map(({ tag, count }) => {
            const isSelected = normalizeTag(tagSearchQuery) === normalizeTag(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setTagSearchQuery('');
                  } else {
                    setTagSearchQuery(tag);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#FFB800] text-[#2D2A26] font-black shadow-sm scale-105'
                    : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] hover:text-white border border-[#3E3A35]'
                }`}
              >
                <span>{tag}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-black/20 text-[#2D2A26]' : 'bg-[#1C1B19] text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Resumo do Filtro Ativo */}
        {tagSearchQuery.trim() && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-bold text-zinc-400 pt-2 border-t border-[#3E3A35] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] animate-pulse" />
              <span>
                Filtro por tag <span className="text-[#FFB800] font-black bg-[#242220] border border-[#FFB800]/40 px-2 py-0.5 rounded-md">"{tagSearchQuery}"</span>: {filteredPhotos.length} {filteredPhotos.length === 1 ? 'obra encontrada' : 'obras encontradas'} ({filteredBasesCount} fotos base, {filteredRemixesCount} remixes)
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setTagSearchQuery('')}
              className="text-xs text-[#FFB800] hover:text-white font-black uppercase text-left sm:text-right transition flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Restaurar Fluxo Completo</span>
            </button>
          </div>
        )}
      </section>

      {/* Featured Banners: Desafio Semanal Ativo & Podium da Arena (visíveis quando não há busca restritiva com 0 resultados) */}
      {!tagSearchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/challenges')}
            className="bg-gradient-to-r from-[#FF5722] via-[#E64A19] to-[#D84315] text-white p-5 rounded-[2.5rem] shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-2xl transition-all border border-orange-300/30 group"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#FF5722] flex items-center justify-center shrink-0 shadow font-black group-hover:scale-110 transition">
                <Flame size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-200">
                    Desafio Semanal PMW
                  </span>
                  <span className="text-[8px] bg-black/30 px-2 py-0.5 rounded-full text-white uppercase font-bold">
                    +35 Responsa
                  </span>
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight truncate text-white">
                  Cores do Taquari & Murais
                </h4>
                <p className="text-[10px] text-orange-100 truncate">
                  Suba fotos ou remix no Taquari e desbloqueie insígnias exclusivas!
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="bg-white text-[#D84315] font-black text-[10px] uppercase px-3 py-2 rounded-xl group-hover:bg-[#FFB800] group-hover:text-[#2D2A26] transition shadow flex items-center gap-1">
                <span>Bora</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/ranking')}
            className="bg-gradient-to-r from-[#2D2A26] via-[#35322E] to-[#2D2A26] text-white p-5 rounded-[2.5rem] shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-2xl transition-all border border-[#FFB800]/40 group"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center shrink-0 shadow font-black group-hover:rotate-6 transition">
                <Trophy size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">
                    Ranking da Arena PMW
                  </span>
                  <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300 uppercase font-bold">
                    Fotos & Remixes
                  </span>
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight truncate text-white">
                  Pódio das Batalhas 1v1
                </h4>
                <p className="text-[10px] text-gray-300 truncate">
                  Fotos e remixes mais votados pela comunidade!
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="bg-[#FFB800] text-[#2D2A26] font-black text-[10px] uppercase px-3 py-2 rounded-xl group-hover:bg-white transition shadow flex items-center gap-1">
                <span>Ver</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Fotos e Remixes Filtrados ou Estado Vazio */}
      {photos.length === 0 ? (
        <SkeletonFeed />
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-[#1C1B19] rounded-[2.5rem] p-12 text-center border border-[#3E3A35] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#242220] text-[#FFB800] border border-[#3E3A35] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Tag size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Nenhuma obra com a tag "{tagSearchQuery}"
            </h3>
            <p className="text-xs text-[#EDE8E1]/80 max-w-md mx-auto leading-relaxed font-medium">
              Não encontramos nenhuma foto ou remix cadastrado com essa tag no momento. Tente buscar por outras tags como {(registeredTagsWithCount || []).slice(0, 4).map(t => t.tag).join(', ')} ou limpe a busca para ver o fluxo completo.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setTagSearchQuery('')}
              className="px-6 py-3.5 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg inline-flex items-center gap-2 hover:scale-105 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Limpar Filtro de Tags</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPhotos.map(photo => {
            const photoCommentsCount = comments.filter(c => c.targetId === photo.id).length;

            return (
              <div key={photo.id} className="bg-[#1C1B19] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-[#3E3A35] flex flex-col justify-between">
                <div>
                  <div 
                    onClick={() => {
                      if (currentUser) {
                        navigate(`/remix/${photo.id}`);
                      } else {
                        onRequireLogin();
                      }
                    }}
                    className="relative w-full aspect-[4/5] bg-[#242220] overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2 z-10">
                      {photo.type === 'remix' ? (
                        <div className="bg-purple-700/90 text-white px-2.5 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5 backdrop-blur-sm">
                          <Paintbrush size={11} />
                          <span className="text-[8px] font-black uppercase tracking-wider">Remix</span>
                        </div>
                      ) : (
                        <div className="bg-[#242220]/90 border border-[#3E3A35] text-white px-2.5 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5 backdrop-blur-sm">
                          <Camera size={11} />
                          <span className="text-[8px] font-black uppercase tracking-wider">Foto Base</span>
                        </div>
                      )}
                      {photo.isGoldStandard && (
                        <div className="bg-[#FFB800] text-[#2D2A26] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center space-x-1">
                          <Globe size={11} />
                          <span className="text-[8px] font-black uppercase">Ouro</span>
                        </div>
                      )}
                      {photo.location && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/map?photoId=${photo.id}`);
                          }}
                          title="Ver localização real no Mapa de Palmas"
                          className="bg-[#141311]/90 hover:bg-[#141311] border border-[#3E3A35] text-white px-2.5 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5 backdrop-blur-sm transition hover:scale-105 cursor-pointer"
                        >
                          <Navigation size={10} className="text-[#FFB800]" />
                          <span className="text-[8px] font-black uppercase">{photo.location.neighborhood}</span>
                        </button>
                      )}
                    </div>

                    {/* Desktop Hover Quick Actions Overlay */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex-col items-center justify-center space-y-2.5 px-6 text-center backdrop-blur-sm">
                      <button onClick={() => currentUser ? navigate(`/remix/${photo.id}`) : onRequireLogin()} className="w-full bg-[#FFB800] text-[#2D2A26] py-3 rounded-2xl font-black uppercase text-xs hover:scale-105 transition cursor-pointer">Remixar Visão</button>
                      <button onClick={() => navigate(`/lineage/${photo.id}`)} className="w-full bg-[#242220] border border-[#3E3A35] text-white hover:border-[#FFB800] py-2.5 rounded-2xl font-black uppercase text-xs hover:scale-105 transition flex items-center justify-center space-x-2 cursor-pointer"><GitBranch size={14} /><span>Ver Linhagem</span></button>
                      <button 
                        onClick={() => onOpenComments(photo)} 
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center justify-center space-x-2 backdrop-blur-sm cursor-pointer"
                      >
                        <MessageSquare size={13} className="text-[#FFB800]" />
                        <span>Comentários ({photoCommentsCount})</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base leading-tight truncate text-white">{photo.title}</h3>
                        <Link to={`/profile/${photo.userId}`} className="text-[10px] text-[#FFB800] font-bold uppercase truncate block mt-0.5">por @{photo.authorName}</Link>
                      </div>
                    </div>

                    {/* Tags cadastradas na foto/remix com clique direto para filtrar */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {photo.tags.map((tag, idx) => {
                          const displayTag = tag.startsWith('#') ? tag : `#${tag}`;
                          const isTagActive = normalizeTag(tagSearchQuery) === normalizeTag(tag);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTagSearchQuery(tag);
                              }}
                              title={`Filtrar o Fluxo por ${displayTag}`}
                              className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                                isTagActive 
                                  ? 'bg-[#FFB800] text-[#2D2A26] shadow-sm scale-105' 
                                  : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] hover:text-[#FFB800] border border-[#3E3A35]'
                              }`}
                            >
                              <Tag size={9} />
                              <span>{displayTag}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Área de Ações Alinhada em Grid */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#3E3A35] mt-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5 sm:gap-3 items-center">
                    {/* Botão de Ação Primária: Remix Imediato em 1 Toque */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                        if (currentUser) {
                          navigate(`/remix/${photo.id}`);
                        } else {
                          onRequireLogin();
                        }
                      }}
                      className="w-full sm:w-auto h-12 min-h-[48px] px-4 py-2.5 bg-[#FFB800] hover:bg-[#EAB308] active:scale-95 text-[#141311] rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition cursor-pointer"
                      title="Remixar esta obra no Estúdio UPMM"
                    >
                      <Paintbrush size={17} className="text-[#141311] shrink-0" />
                      <span className="truncate">Remixar Agora</span>
                    </button>

                    {/* Grade de Botões de Ação Secundária */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 justify-items-center w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => navigate(`/lineage/${photo.id}`)}
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#242220] active:scale-90 transition cursor-pointer"
                        title="Ver Linhagem e Versões Desta Foto"
                        aria-label="Ver linhagem"
                      >
                        <GitBranch size={19} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => onOpenComments(photo)} 
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-[#242220] active:scale-90 transition group/comm cursor-pointer"
                        title="Ver ou adicionar comentários"
                        aria-label="Comentários"
                      >
                        <MessageSquare size={18} className="group-hover/comm:text-[#FFB800] transition" />
                        <span className="text-[9px] font-black text-zinc-400 mt-0.5 leading-none">{photoCommentsCount}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => onShare(photo)} 
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#FFB800] hover:bg-[#242220] active:scale-90 transition cursor-pointer" 
                        title="Compartilhar Obra"
                        aria-label="Compartilhar"
                      >
                        <Share2 size={19} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                          onLike(photo.id);
                        }} 
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex flex-col items-center justify-center hover:bg-[#242220] active:scale-90 transition cursor-pointer" 
                        title="Dar Vibe"
                        aria-label="Dar Vibe"
                      >
                        <Heart size={19} className={photo.vibeCount > 0 ? "text-red-500 fill-current" : "text-zinc-500 hover:text-red-400"} />
                        <span className="text-[9px] font-black text-zinc-400 mt-0.5 leading-none">{photo.vibeCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const VibeBattle: React.FC<{ 
  photos: PhotoBase[], 
  onVoteBattle: (winnerId: string, loserId: string) => void, 
  onRequireLogin: (reason?: string) => void, 
  currentUser: User | null 
}> = ({ photos, onVoteBattle, onRequireLogin, currentUser }) => {
  const navigate = useNavigate();
  const [battleFilter, setBattleFilter] = useState<'all' | 'base' | 'remix'>('all');
  const [pair, setPair] = useState<[PhotoBase, PhotoBase] | null>(null);
  const [votedWinnerId, setVotedWinnerId] = useState<string | null>(null);
  const [sessionVotes, setSessionVotes] = useState<number>(0);
  const [lastBattleSummary, setLastBattleSummary] = useState<{ winnerTitle: string; winRate: number } | null>(null);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);

  // States for clear unauthenticated and inspection UX
  const [inspectPhoto, setInspectPhoto] = useState<PhotoBase | null>(null);
  const [unauthVotePrompt, setUnauthVotePrompt] = useState<{ winner: PhotoBase; loser: PhotoBase } | null>(null);

  // Filter pool of photos for duels
  const pool = useMemo(() => {
    if (battleFilter === 'base') return photos.filter(p => p.type === 'base');
    if (battleFilter === 'remix') return photos.filter(p => p.type === 'remix');
    return photos;
  }, [photos, battleFilter]);

  const getNewPair = () => {
    if (pool.length < 2) return;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setPair([shuffled[0], shuffled[1]]);
    setVotedWinnerId(null);
  };

  useEffect(() => {
    getNewPair();
  }, [battleFilter]);

  useEffect(() => {
    if (!pair && pool.length >= 2) {
      getNewPair();
    }
  }, [pool, pair]);

  const executeVote = (winner: PhotoBase, loser: PhotoBase) => {
    setVotedWinnerId(winner.id);
    const newWins = (winner.battleWins || 0) + 1;
    const newTotal = newWins + (winner.battleLosses || 0);
    const calculatedWinRate = Math.round((newWins / newTotal) * 100);

    setLastBattleSummary({
      winnerTitle: winner.title,
      winRate: calculatedWinRate
    });

    onVoteBattle(winner.id, loser.id);
    setSessionVotes(prev => prev + 1);

    setTimeout(() => {
      getNewPair();
      setLastBattleSummary(null);
    }, 1400);
  };

  const handleCardClick = (winner: PhotoBase, loser: PhotoBase) => {
    if (votedWinnerId) return;

    if (!currentUser) {
      // Open clear prompt explaining they are voting and giving choice to view photo or login
      setUnauthVotePrompt({ winner, loser });
      return;
    }

    executeVote(winner, loser);
  };

  // Keyboard Shortcuts Listener ([A], [B], [S])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;
      if (!pair || votedWinnerId) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleCardClick(pair[0], pair[1]);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleCardClick(pair[1], pair[0]);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        getNewPair();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pair, votedWinnerId, currentUser]);

  if (!pair || pool.length < 2) {
    return (
      <div className="text-center py-20 bg-[#1C1B19] rounded-[3rem] p-8 shadow-xl border border-[#3E3A35] space-y-4">
        <div className="w-16 h-16 bg-[#242220] border border-[#3E3A35] text-[#FFB800] rounded-2xl flex items-center justify-center mx-auto">
          <Sword size={32} />
        </div>
        <h3 className="text-2xl font-black uppercase text-white">Poucas fotos para duelo nesta categoria</h3>
        <p className="text-xs text-[#EDE8E1]/80 max-w-sm mx-auto">
          Experimente alternar o filtro para "Geral" ou subir mais fotos e remixes para a Arena!
        </p>
        <button
          onClick={() => setBattleFilter('all')}
          className="bg-[#FFB800] text-[#141311] px-6 py-3 rounded-2xl font-black uppercase text-xs shadow hover:scale-105 transition cursor-pointer"
        >
          Ver Todas as Obras
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col items-center max-w-3xl mx-auto relative">
      {/* Header & Arena Info */}
      <header className="text-center space-y-3 w-full">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center space-x-1.5 bg-red-500/20 text-red-400 px-3.5 py-1 rounded-full border border-red-500/30">
            <Sword size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">Arena de Vibes 1v1</span>
          </div>

          <Link
            to="/ranking"
            className="inline-flex items-center space-x-1.5 bg-[#242220] text-[#FFB800] hover:bg-[#2D2A26] border border-[#3E3A35] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition shadow-sm"
          >
            <Trophy size={13} />
            <span>Ver Ranking da Batalha</span>
          </Link>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white">
          Qual tem mais visão?
        </h2>
        <p className="text-xs text-[#EDE8E1]/80 max-w-md mx-auto font-medium">
          Seu voto decide a classificação das fotos e remixes de Palmas. Escolha a obra com maior impacto visual e identidade urbana!
        </p>

        {/* Clear Notice for Unauthenticated Visitors */}
        {!currentUser && (
          <div className="w-full bg-[#1C1B19] border border-[#FFB800]/60 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFB800] text-[#141311] flex items-center justify-center shrink-0 shadow font-black">
                <Eye size={18} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-white tracking-tight">
                  Modo Visitante Ativo
                </p>
                <p className="text-[11px] text-[#EDE8E1]/70">
                  Você pode explorar os duelos e ampliar as fotos. Para votar e somar pontos no Ranking oficial de Palmas, conecte-se!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRequireLogin('Para votar nas batalhas da quebrada e pontuar no Ranking, entre com sua conta ou Google.')}
              className="bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] text-xs font-black uppercase px-4 py-2.5 rounded-2xl shrink-0 transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn size={13} />
              <span>Entrar para Votar</span>
            </button>
          </div>
        )}

        {/* Filter Tabs & Blind Duel Toggle */}
        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <button
            onClick={() => setBattleFilter('all')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer active:scale-95 ${
              battleFilter === 'all'
                ? 'bg-[#FFB800] text-[#141311] shadow-sm'
                : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            ⚔️ Geral ({photos.length})
          </button>
          <button
            onClick={() => setBattleFilter('base')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer active:scale-95 ${
              battleFilter === 'base'
                ? 'bg-[#FFB800] text-[#141311] shadow-sm'
                : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            📸 Só Fotos Base
          </button>
          <button
            onClick={() => setBattleFilter('remix')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer active:scale-95 ${
              battleFilter === 'remix'
                ? 'bg-[#FFB800] text-[#141311] shadow-sm'
                : 'bg-[#242220] text-zinc-300 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            🎨 Só Remixes
          </button>

          {/* Blind Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsBlindMode(prev => !prev)}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center gap-1.5 border ${
              isBlindMode 
                ? 'bg-[#FFB800] text-[#141311] border-[#FFB800] shadow-sm' 
                : 'bg-[#242220] text-zinc-300 border-[#3E3A35] hover:bg-[#2D2A26]'
            }`}
            title="Oculta o autor da obra para garantir avaliação 100% cega e imparcial"
          >
            <Eye size={13} />
            <span>{isBlindMode ? 'Duelo Cego: ON' : 'Duelo Cego: OFF'}</span>
          </button>
        </div>

        {/* Keyboard Shortcut Hints for Desktop */}
        <div className="hidden sm:flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-400">
          <span>Atalhos de Teclado:</span>
          <span className="bg-[#242220] px-2 py-0.5 rounded border border-[#3E3A35] text-zinc-200 font-bold">[A] Votar Esquerda</span>
          <span className="bg-[#242220] px-2 py-0.5 rounded border border-[#3E3A35] text-zinc-200 font-bold">[B] Votar Direita</span>
          <span className="bg-[#242220] px-2 py-0.5 rounded border border-[#3E3A35] text-zinc-200 font-bold">[S] Pular</span>
        </div>

        {/* Session Stats Banner */}
        {sessionVotes > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-[#FFB800] border border-[#FFB800]/40 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Zap size={12} className="text-[#FFB800]" />
            <span>{sessionVotes} {sessionVotes === 1 ? 'duelo votado' : 'duelos votados'} (+{sessionVotes * 5} Responsa)</span>
          </div>
        )}
      </header>

      {/* Duel Cards Container */}
      <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch relative">
        {/* Floating VS Badge in the center (Desktop) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-[#1C1B19] text-[#FFB800] font-black text-sm uppercase tracking-wider border-2 border-[#FFB800] shadow-2xl pointer-events-none">
          VS
        </div>

        {pair.map((photo, idx) => {
          const opponent = idx === 0 ? pair[1] : pair[0];
          const isVotedWinner = votedWinnerId === photo.id;
          const isVotedLoser = votedWinnerId !== null && votedWinnerId !== photo.id;
          const wins = photo.battleWins || 0;
          const losses = photo.battleLosses || 0;
          const totalDuels = wins + losses;
          const winRate = totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0;

          return (
            <React.Fragment key={photo.id}>
              {idx === 1 && (
                <div className="md:hidden flex items-center justify-center -my-1 z-20 shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB800] text-[#141311] font-black text-xs uppercase border-2 border-[#141311] shadow-xl">
                    VS
                  </div>
                </div>
              )}
              <div 
                className={`flex-1 w-full group relative overflow-hidden rounded-3xl md:rounded-[2.5rem] transition-all duration-500 border-2 bg-[#1C1B19] ${
                  isVotedWinner 
                    ? 'border-[#FFB800] scale-[1.02] z-10 shadow-2xl ring-4 ring-[#FFB800]/30' 
                    : isVotedLoser 
                    ? 'opacity-40 grayscale scale-95 border-transparent' 
                    : 'border-[#3E3A35] hover:border-[#FFB800] shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Type Badge Top Left */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg ${
                    photo.type === 'remix' ? 'bg-[#2D2A26] text-[#FFB800]' : 'bg-[#FFB800] text-[#2D2A26]'
                  }`}>
                    {photo.type === 'remix' ? '🎨 Remix' : '📸 Foto Base'}
                  </span>
                  {photo.battleStreak && photo.battleStreak >= 2 ? (
                    <span className="text-[9px] font-black uppercase bg-red-500 text-white px-2 py-1 rounded-full shadow flex items-center gap-1 animate-pulse">
                      <Zap size={10} /> {photo.battleStreak}x
                    </span>
                  ) : null}
                </div>

                {/* Dedicated Zoom/Inspect Button Top Right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectPhoto(photo);
                  }}
                  className="absolute top-3.5 right-3.5 z-20 p-2.5 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md transition shadow-md flex items-center justify-center hover:scale-110 min-h-[40px] min-w-[40px] cursor-pointer"
                  title="Ampliar e ver detalhes da obra"
                >
                  <Maximize2 size={15} />
                </button>

                {/* Photo Image (Clickable) */}
                <div 
                  onClick={() => handleCardClick(photo, opponent)}
                  className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden bg-[#141311] cursor-pointer"
                >
                  <img 
                    src={photo.imageUrl} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={photo.title} 
                  />

                  {/* Winner Celebration Banner */}
                  {isVotedWinner && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center z-20 animate-in fade-in">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FFB800] text-[#2D2A26] rounded-full flex items-center justify-center mb-2 shadow-xl animate-bounce">
                        <Crown size={26} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#FFB800]">
                        Vitória na Batalha!
                      </span>
                      <h4 className="text-base sm:text-xl font-black uppercase line-clamp-1">{photo.title}</h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-200 mt-1 font-bold">
                        +1 vitória computada (+5 Responsa)
                      </p>
                    </div>
                  )}

                  {/* Bottom Overlay with Author & Battle Record */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-base sm:text-lg uppercase tracking-tight leading-tight truncate">
                          {photo.title}
                        </h3>
                        <p className="text-xs font-bold text-[#FFB800] mt-0.5">
                          {isBlindMode ? '🔒 Artista Oculto (Duelo Cego)' : `por @${photo.authorName}`}
                        </p>
                      </div>
                      {/* Hotkey Indicator Pill */}
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FFB800] text-[#141311] shadow">
                        {idx === 0 ? '[A]' : '[B]'}
                      </span>
                    </div>

                    {/* Territory in Palmas */}
                    {photo.location && (
                      <p className="text-[10px] text-gray-300 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={10} className="text-[#FFB800] shrink-0" /> {photo.location.neighborhood}
                      </p>
                    )}

                    {/* Stats and Clear Explicit Action Button */}
                    <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-black uppercase text-gray-300 whitespace-nowrap">
                          {wins}V
                        </span>
                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold text-gray-200 whitespace-nowrap inline-flex items-center justify-center">
                          {winRate}%
                        </span>
                      </div>

                      {currentUser ? (
                        <span className="min-h-[42px] text-[10px] font-black uppercase text-[#2D2A26] bg-[#FFB800] hover:bg-[#EAB308] active:scale-95 px-3 sm:px-4 py-2 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer">
                          <Zap size={13} className="shrink-0" />
                          <span>Votar {idx === 0 ? '[A]' : '[B]'}</span>
                        </span>
                      ) : (
                        <span className="min-h-[42px] text-[10px] font-bold uppercase text-white bg-white/20 hover:bg-[#FFB800] hover:text-[#2D2A26] active:scale-95 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-md transition flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer">
                          <LogIn size={13} className="shrink-0" />
                          <span>Entrar p/ Votar</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Controls: Skip duel and link to ranking */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full pt-2">
        <button
          type="button"
          onClick={() => getNewPair()}
          className="min-h-[48px] inline-flex items-center justify-center space-x-2 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-200 hover:text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase transition w-full sm:w-auto cursor-pointer active:scale-98"
        >
          <RotateCcw size={14} />
          <span>Pular este duelo</span>
        </button>

        <Link
          to="/ranking"
          className="min-h-[48px] inline-flex items-center justify-center space-x-2 bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition shadow-md w-full sm:w-auto cursor-pointer active:scale-98"
        >
          <Trophy size={14} />
          <span>Ver Ranking de Fotos & Remixes</span>
        </Link>
      </div>

      {/* UNCOMMITTED VOTE PROMPT MODAL (Shown when visitor clicks to vote) */}
      {unauthVotePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-150">
          <div className="bg-[#1C1B19] text-[#EDE8E1] w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-[#3E3A35] space-y-4">
            <div className="flex justify-between items-start border-b border-[#3E3A35] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center font-black">
                  <Sword size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FF5722]">
                    Batalha de Visões
                  </span>
                  <h4 className="text-lg font-black uppercase text-white">
                    Votar nesta obra?
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setUnauthVotePrompt(null)}
                className="p-2 bg-[#242220] hover:bg-[#2D2A26] rounded-full text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Thumbnail preview of chosen photo */}
            <div className="flex items-center space-x-3.5 bg-[#242220] p-3 rounded-2xl border border-[#3E3A35]">
              <img
                src={unauthVotePrompt.winner.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-[#FFB800] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-black text-xs uppercase text-white truncate">
                  {unauthVotePrompt.winner.title}
                </p>
                <p className="text-[11px] font-bold text-zinc-400">
                  por @{unauthVotePrompt.winner.authorName}
                </p>
                <p className="text-[10px] text-[#FFB800] font-black uppercase">
                  {unauthVotePrompt.winner.location?.neighborhood || 'Palmas, TO'}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Para que o seu voto seja computado no <strong className="text-white">Ranking Oficial de Palmas</strong> e você ganhe <strong className="text-[#FFB800]">+5 pontos de Responsa</strong>, é necessário estar conectado a um perfil.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = unauthVotePrompt;
                  setUnauthVotePrompt(null);
                  onRequireLogin(`Para votar em "${target.winner.title}" e somar pontos no Ranking, faça login ou entre com o Google.`);
                }}
                className="w-full py-3.5 bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <LogIn size={15} />
                <span>Fazer Login ou Entrar com Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const photoToInspect = unauthVotePrompt.winner;
                  setUnauthVotePrompt(null);
                  setInspectPhoto(photoToInspect);
                }}
                className="w-full py-3 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-200 font-bold text-xs uppercase rounded-2xl transition flex items-center justify-center gap-2"
              >
                <Maximize2 size={14} />
                <span>Só Quero Ver a Foto Ampliada</span>
              </button>

              <button
                type="button"
                onClick={() => setUnauthVotePrompt(null)}
                className="w-full py-2 text-center text-xs font-bold text-zinc-500 hover:text-zinc-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-RESOLUTION LIGHTBOX INSPECTOR (No login required!) */}
      {inspectPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[120] animate-in fade-in duration-200">
          <div className="bg-[#1C1B19] text-[#EDE8E1] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#3E3A35] flex flex-col max-h-[92vh]">
            {/* Lightbox Header */}
            <div className="flex justify-between items-center p-5 border-b border-[#3E3A35] shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  inspectPhoto.type === 'remix' ? 'bg-purple-700 text-white' : 'bg-[#FFB800] text-[#2D2A26]'
                }`}>
                  {inspectPhoto.type === 'remix' ? '🎨 Remix' : '📸 Foto Base'}
                </span>
                <h4 className="font-black text-base uppercase text-white truncate max-w-xs sm:max-w-md">
                  {inspectPhoto.title}
                </h4>
              </div>
              <button
                onClick={() => setInspectPhoto(null)}
                className="p-2.5 bg-[#242220] hover:bg-[#2D2A26] rounded-full text-zinc-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* High-res Image View */}
            <div className="relative bg-black/40 flex-1 overflow-hidden min-h-[260px] max-h-[50vh] flex items-center justify-center">
              <img
                src={inspectPhoto.imageUrl}
                alt={inspectPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details & Action Footer */}
            <div className="p-5 bg-[#1C1B19] space-y-4 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold text-zinc-400">
                    Criado por <span className="text-white font-black">@{inspectPhoto.authorName}</span>
                  </p>
                  {inspectPhoto.location && (
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-[#FFB800]" /> {inspectPhoto.location.neighborhood} • Palmas, TO
                    </p>
                  )}
                </div>

                {/* Duels Record */}
                <div className="flex items-center gap-2">
                  <div className="bg-[#242220] border border-[#FFB800]/40 px-3 py-1 rounded-xl text-center">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Vitórias</span>
                    <span className="text-xs font-black text-[#FFB800]">{inspectPhoto.battleWins || 0}</span>
                  </div>
                  <div className="bg-[#242220] border border-[#3E3A35] px-3 py-1 rounded-xl text-center">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Derrotas</span>
                    <span className="text-xs font-black text-zinc-300">{inspectPhoto.battleLosses || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {pair && (pair[0].id === inspectPhoto.id || pair[1].id === inspectPhoto.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      const opponent = pair[0].id === inspectPhoto.id ? pair[1] : pair[0];
                      setInspectPhoto(null);
                      handleCardClick(inspectPhoto, opponent);
                    }}
                    className="flex-1 py-3.5 bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>{currentUser ? 'Votar nesta obra agora' : 'Entrar e Votar nesta obra'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectPhoto(null)}
                  className="px-5 py-3.5 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-300 font-bold text-xs uppercase rounded-2xl transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LineageView: React.FC<{ 
  photos: PhotoBase[], 
  comments?: Comment[], 
  onOpenComments?: (photo: PhotoBase) => void 
}> = ({ photos, comments = [], onOpenComments }) => {
  const { photoId } = useParams();
  const currentPhoto = photos.find(p => p.id === photoId);
  if (!currentPhoto) return null;
  const basePhoto = currentPhoto.type === 'base' ? currentPhoto : photos.find(p => p.id === currentPhoto.originalPhotoId);
  const remixes = photos.filter(p => p.originalPhotoId === basePhoto?.id);
  return (
    <div className="space-y-12 flex flex-col items-center">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-white">Árvore de Linhagem</h2>
      {basePhoto && (
        <div className="p-4 bg-[#1C1B19] rounded-3xl shadow-2xl border-2 border-[#FFB800] text-center">
          <img 
            src={basePhoto.imageUrl} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-56 h-56 rounded-2xl object-cover shadow-sm mx-auto" 
            alt={basePhoto.title} 
          />
          <p className="font-bold text-sm mt-2 text-white">{basePhoto.title}</p>
          <p className="text-[10px] text-zinc-400 font-bold">por @{basePhoto.authorName}</p>
          {onOpenComments && (
            <button
              onClick={() => onOpenComments(basePhoto)}
              className="mt-2.5 inline-flex items-center gap-1.5 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
            >
              <MessageSquare size={12} className="text-[#FFB800]" />
              <span>Comentários ({comments.filter(c => c.targetId === basePhoto.id).length})</span>
            </button>
          )}
        </div>
      )}
      <div className="w-1 h-12 bg-[#FFB800]" />
      <div className="flex flex-wrap justify-center gap-8">
        {remixes.map(remix => (
          <div key={remix.id} className="text-center p-3 bg-[#1C1B19] rounded-2xl border border-[#3E3A35] shadow-md">
            <img 
              src={remix.imageUrl} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-28 h-28 rounded-xl object-cover shadow-sm" 
              alt={remix.title} 
            />
            <p className="text-[10px] font-bold mt-1.5 truncate max-w-[110px] text-white">{remix.title}</p>
            <p className="text-[8px] text-zinc-400 font-bold">por @{remix.authorName}</p>
            {onOpenComments && (
              <button
                onClick={() => onOpenComments(remix)}
                className="mt-1.5 inline-flex items-center gap-1 bg-purple-950/60 border border-purple-800/50 text-purple-300 hover:bg-purple-900/60 px-2 py-1 rounded-lg text-[9px] font-bold transition cursor-pointer"
              >
                <MessageSquare size={10} />
                <span>{comments.filter(c => c.targetId === remix.id).length}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PALMAS_NEIGHBORHOODS = [
  { 
    name: 'Taquaralto', 
    address: 'Av. Tocantins, Taquaralto, Palmas - TO',
    landmark: 'Comércio Popular de Taquaralto',
    lat: -10.3235, 
    lng: -48.3038 
  },
  { 
    name: 'Jardim Aureny III', 
    address: 'Av. Transversal, Jardim Aureny III, Palmas - TO',
    landmark: 'Feira Coberta do Aureny III',
    lat: -10.2741, 
    lng: -48.3182 
  },
  { 
    name: 'Morada do Sol', 
    address: 'Rua 15, Setor Morada do Sol, Palmas - TO',
    landmark: 'Praça Central do Morada do Sol',
    lat: -10.2982, 
    lng: -48.3125 
  },
  { 
    name: 'Setor Taquari', 
    address: 'Av. LO-19, Setor Taquari, Palmas - TO',
    landmark: 'Parque e Quadras do Taquari',
    lat: -10.3392, 
    lng: -48.2865 
  },
  { 
    name: 'Espaço Cultural (301 Sul)', 
    address: 'Área Verde 301 Sul, Av. Teotônio Segurado, Palmas - TO',
    landmark: 'Pista de Skate do Espaço Cultural',
    lat: -10.2075, 
    lng: -48.3372 
  },
  { 
    name: 'Praia da Graciosa', 
    address: 'Orla da Praia da Graciosa, Palmas - TO',
    landmark: 'Píer da Praia da Graciosa',
    lat: -10.1985, 
    lng: -48.3650 
  },
  { 
    name: 'Praça dos Girassóis', 
    address: 'Praça dos Girassóis, Centro, Palmas - TO',
    landmark: 'Monumento aos Dezoito do Forte',
    lat: -10.1840, 
    lng: -48.3330 
  }
];

const UploadModal: React.FC<{ 
  onClose: () => void, 
  onUpload: (p: PhotoBase) => void, 
  user: User,
  challenge?: WeeklyChallenge | null
}> = ({ onClose, onUpload, user, challenge }) => {
  const [activeSource, setActiveSource] = useState<'upload' | 'pexels'>('upload');
  const [preview, setPreview] = useState<string>('');
  const [title, setTitle] = useState(challenge ? `Desafio: ${challenge.title}` : '');
  const [selectedTerritory, setSelectedTerritory] = useState(() => {
    if (challenge?.neighborhood) {
      const match = PALMAS_NEIGHBORHOODS.find(n => n.name.toLowerCase().includes(challenge.neighborhood!.toLowerCase()));
      if (match) return match;
    }
    return PALMAS_NEIGHBORHOODS[0];
  });
  const [customAddress, setCustomAddress] = useState(selectedTerritory.address);
  const [landmark, setLandmark] = useState(selectedTerritory.landmark);
  const [pexelsQuery, setPexelsQuery] = useState(challenge ? challenge.title.split(' ')[0] : '');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleTerritoryChange = (name: string) => {
    const item = PALMAS_NEIGHBORHOODS.find(n => n.name === name) || PALMAS_NEIGHBORHOODS[0];
    setSelectedTerritory(item);
    setCustomAddress(item.address);
    setLandmark(item.landmark);
  };

  const handlePexelsSearch = async () => { 
    if (!pexelsQuery.trim()) return; 
    setIsSearching(true); 
    try { 
      const res = await fetch(`/api/pexels/search?query=${encodeURIComponent(pexelsQuery.trim())}&per_page=12`); 
      const data = await res.json(); 
      setPexelsResults(data.photos || []); 
    } catch (e) { 
      console.error("Erro ao buscar no proxy do Pexels:", e); 
    } finally { 
      setIsSearching(false); 
    } 
  };

  const handleSubmit = () => {
    if (!preview || !title) return;
    // Pequeno offset aleatório para que múltiplas fotos no mesmo território não fiquem exatamente no mesmo pixel
    const jitter = () => (Math.random() - 0.5) * 0.0025;
    const finalTags = ['#Palmas', `#${selectedTerritory.name.replace(/\s+/g, '')}`, '#ArteDeRua'];
    if (challenge) {
      challenge.tags.forEach(t => {
        if (!finalTags.includes(t)) finalTags.push(t);
      });
      finalTags.push('#DesafioSemanal');
    }
    const finalPhoto: PhotoBase = {
      id: `photo_${Date.now()}`,
      userId: user.id,
      authorName: user.name,
      title,
      imageUrl: preview,
      tags: finalTags,
      vibeCount: 0,
      type: 'base',
      challengeId: challenge?.id,
      location: {
        lat: selectedTerritory.lat + jitter(),
        lng: selectedTerritory.lng + jitter(),
        neighborhood: selectedTerritory.name,
        address: customAddress,
        landmark: landmark
      }
    };
    onUpload(finalPhoto);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto">
      <div className="bg-[#1C1B19] text-[#EDE8E1] border border-[#3E3A35] w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {challenge && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[#FF5722] via-[#FF8A65] to-[#FFB800] text-[#141311] rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🔥</span>
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-black/70 block">Desafio Ativo</span>
                <h4 className="text-xs font-black uppercase text-black">{challenge.title}</h4>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] bg-black/80 text-[#FFB800] px-2.5 py-1 rounded-full font-black uppercase">
                +{challenge.rewardResponsa} Responsa
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-black uppercase text-[#FFB800] bg-[#242220] border border-[#3E3A35] px-2.5 py-1 rounded-full">
              Geolocalização Palmas - TO
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mt-1 text-white">
              {challenge ? 'Submeter Obra do Desafio' : 'Lançar Nova Visão - PMW'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#242220] hover:bg-[#2D2A26] rounded-full text-zinc-400 hover:text-white transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex space-x-3 sm:space-x-4 mb-6">
          <button 
            type="button"
            onClick={() => setActiveSource('upload')} 
            className={`flex-1 py-3.5 min-h-[48px] rounded-2xl font-black uppercase text-[10px] sm:text-xs transition flex items-center justify-center cursor-pointer ${
              activeSource === 'upload' ? 'bg-[#FFB800] text-[#141311] shadow-md' : 'bg-[#242220] text-zinc-400 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            Meu Arquivo Local
          </button>
          <button 
            type="button"
            onClick={() => setActiveSource('pexels')} 
            className={`flex-1 py-3.5 min-h-[48px] rounded-2xl font-black uppercase text-[10px] sm:text-xs transition flex items-center justify-center cursor-pointer ${
              activeSource === 'pexels' ? 'bg-[#FFB800] text-[#141311] shadow-md' : 'bg-[#242220] text-zinc-400 hover:bg-[#2D2A26] border border-[#3E3A35]'
            }`}
          >
            Buscar Foto / Visão
          </button>
        </div>

        <div className="space-y-4">
          {activeSource === 'upload' ? (
            !preview ? (
              <label className="block w-full h-44 border-2 border-dashed border-[#3E3A35] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer bg-[#242220] hover:bg-[#2A2825] transition">
                <Camera size={36} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-400 mt-2">Clique ou arraste uma foto</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => { 
                    if (e.target.files?.[0]) { 
                      const r = new FileReader(); 
                      r.onload = (ev) => setPreview(ev.target?.result as string); 
                      r.readAsDataURL(e.target.files[0]); 
                    } 
                  }} 
                />
              </label>
            ) : (
              <div className="relative">
                <img src={preview} referrerPolicy="no-referrer" className="w-full h-44 object-cover rounded-[2rem]" alt="" />
                <button 
                  type="button"
                  onClick={() => setPreview('')}
                  className="absolute top-3 right-3 bg-black/80 text-white p-2 rounded-full hover:bg-black"
                >
                  <X size={14} />
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Pesquisar imagem (ex: street art, hip hop, skate)..." 
                  value={pexelsQuery} 
                  onChange={(e) => setPexelsQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handlePexelsSearch()}
                  className="flex-1 p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800]" 
                />
                <button 
                  type="button"
                  onClick={handlePexelsSearch} 
                  className="bg-[#FFB800] text-[#141311] px-5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#EAB308] transition"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                {pexelsResults.map(p => (
                  <button 
                    key={p.id} 
                    type="button"
                    onClick={() => { 
                      setPreview(p.src.large); 
                      setTitle(`Visão: ${p.photographer}`); 
                    }}
                    className="hover:opacity-80 transition cursor-pointer"
                  >
                    <img src={p.src.medium} referrerPolicy="no-referrer" className="aspect-square object-cover rounded-xl w-full" alt="" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Título da Obra</label>
            <input 
              type="text" 
              placeholder="Ex: Grafite da Resistência na Av. Tocantins" 
              className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800]" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Território de Palmas</label>
              <select 
                className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white focus:outline-none focus:border-[#FFB800]" 
                value={selectedTerritory.name} 
                onChange={(e) => handleTerritoryChange(e.target.value)}
              >
                {PALMAS_NEIGHBORHOODS.map(n => (
                  <option key={n.name} value={n.name} className="bg-[#1C1B19] text-white">{n.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Ponto de Referência</label>
              <input 
                type="text" 
                value={landmark} 
                onChange={(e) => setLandmark(e.target.value)} 
                className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block ml-1">Endereço Real Localizável</label>
            <input 
              type="text" 
              value={customAddress} 
              onChange={(e) => setCustomAddress(e.target.value)} 
              placeholder="Endereço exato em Palmas"
              className="w-full p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] font-bold text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800]" 
            />
          </div>
        </div>

        <button 
          disabled={!preview || !title} 
          onClick={handleSubmit} 
          className="w-full bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] py-4 min-h-[48px] mt-6 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-102 active:scale-95 transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
        >
          Publicar Visão com Localização Real em Palmas
        </button>
      </div>
    </div>
  );
};

export default App;
