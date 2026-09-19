import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Trash2, 
  MapPin, 
  Camera, 
  Layers, 
  Sword, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Save,
  Tag,
  Instagram,
  Plus,
  ArrowRight,
  Award,
  Upload,
  Bell,
  GitBranch,
  CheckCheck
} from 'lucide-react';
import { User, PhotoBase, GraffitiSpot, Badge, UserLevel, RemixNotification } from '../types';
import { BADGES, PALMAS_NEIGHBORHOODS } from '../constants';
import { RemixNotificationModal, RemixNotificationCard } from './RemixNotificationCenter';

interface ProfileDashboardProps {
  users: User[];
  photos: PhotoBase[];
  spots: GraffitiSpot[];
  currentUser: User | null;
  onUpdateProfile: (updatedUser: User) => void;
  onDeletePhoto: (photoId: string) => void;
  onEditPhoto: (photoId: string, updatedData: { title: string; tags: string[]; neighborhood?: string }) => void;
  onDeleteSpot: (spotId: string) => void;
  onRequireLogin: () => void;
  notifications?: RemixNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onSimulateRemix?: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  users = [],
  photos = [],
  spots = [],
  currentUser = null,
  onUpdateProfile,
  onDeletePhoto,
  onEditPhoto,
  onDeleteSpot,
  onRequireLogin,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSimulateRemix
}) => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Determine profile user
  const profileUserId = userId || currentUser?.id;
  const profileUser = (users || []).find(u => u.id === profileUserId) || currentUser;

  const isOwner = currentUser?.id === profileUser?.id;

  // Active Tab for content management
  const [activeTab, setActiveTab] = useState<'bases' | 'remixes' | 'received-remixes' | 'spots' | 'badges' | 'battles'>('bases');
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('Taquaralto');
  const [editInstagram, setEditInstagram] = useState('');
  const [editLevel, setEditLevel] = useState<UserLevel>(UserLevel.CRIADOR);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        setAvatarUploadError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit Photo Modal state
  const [editingPhoto, setEditingPhoto] = useState<PhotoBase | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoTags, setEditPhotoTags] = useState('');
  const [editPhotoNeighborhood, setEditPhotoNeighborhood] = useState('');

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'photo' | 'spot'; title: string } | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!profileUser) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] p-8 shadow-sm space-y-4">
        <h3 className="text-2xl font-black uppercase">Artista não encontrado</h3>
        <p className="text-xs text-gray-500">O perfil que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#FFB800] text-[#2D2A26] px-6 py-2.5 rounded-2xl font-black uppercase text-xs shadow"
        >
          Voltar ao Fluxo
        </button>
      </div>
    );
  }

  // Filter user contents
  const userPhotos = (photos || []).filter(p => p.userId === profileUser.id);
  const userBases = userPhotos.filter(p => p.type === 'base');
  const userRemixes = userPhotos.filter(p => p.type === 'remix');
  const userSpots = (spots || []).filter(s => s.userId === profileUser.id);

  // Calculate battle stats for this user's creations
  const totalWins = userPhotos.reduce((acc, p) => acc + (p.battleWins || 0), 0);
  const totalLosses = userPhotos.reduce((acc, p) => acc + (p.battleLosses || 0), 0);
  const totalDuels = totalWins + totalLosses;
  const userWinRate = totalDuels > 0 ? Math.round((totalWins / totalDuels) * 100) : 0;

  // Remix Notifications calculation: all remixes created from this profile's original base photos
  const userOriginalBases = useMemo(() => {
    return (photos || []).filter(p => p.userId === profileUser.id && p.type === 'base');
  }, [photos, profileUser.id]);

  const userOriginalBaseIds = useMemo(() => {
    return new Set(userOriginalBases.map(p => p.id));
  }, [userOriginalBases]);

  const userRemixNotifications: RemixNotification[] = useMemo(() => {
    // 1. From external notifications prop
    const passed = (notifications || []).filter(n => n.recipientUserId === profileUser.id);
    const existingRemixIds = new Set(passed.map(n => n.remixPhotoId));

    // 2. Discover from all photos array (any remix based on profileUser's original photos)
    const discovered: RemixNotification[] = [];
    photos.forEach(p => {
      if (p.type === 'remix' && p.originalPhotoId && userOriginalBaseIds.has(p.originalPhotoId) && p.userId !== profileUser.id) {
        if (!existingRemixIds.has(p.id)) {
          const original = userOriginalBases.find(o => o.id === p.originalPhotoId);
          const remixer = users.find(u => u.id === p.userId);
          const notifId = `notif_${p.id}`;
          discovered.push({
            id: notifId,
            recipientUserId: profileUser.id,
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
            read: Boolean(profileUser.readNotificationIds?.includes(notifId))
          });
        }
      }
    });

    const combined = [...passed, ...discovered];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined;
  }, [notifications, profileUser, photos, userOriginalBases, userOriginalBaseIds, users]);

  const unreadRemixCount = useMemo(() => {
    return userRemixNotifications.filter(n => !n.read && !profileUser.readNotificationIds?.includes(n.id)).length;
  }, [userRemixNotifications, profileUser.readNotificationIds]);

  const handleMarkAsReadInternal = (notifId: string) => {
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(notifId);
    }
    const currentRead = profileUser.readNotificationIds || [];
    if (!currentRead.includes(notifId)) {
      const updatedUser: User = {
        ...profileUser,
        readNotificationIds: [...currentRead, notifId],
        hasNotifications: userRemixNotifications.some(n => n.id !== notifId && !n.read && !currentRead.includes(n.id))
      };
      onUpdateProfile(updatedUser);
    }
  };

  const handleMarkAllAsReadInternal = () => {
    if (onMarkAllNotificationsAsRead) {
      onMarkAllNotificationsAsRead();
    }
    const allIds = userRemixNotifications.map(n => n.id);
    const updatedUser: User = {
      ...profileUser,
      readNotificationIds: Array.from(new Set([...(profileUser.readNotificationIds || []), ...allIds])),
      hasNotifications: false
    };
    onUpdateProfile(updatedUser);
  };

  // Open Edit Profile Modal
  const handleOpenEditProfile = () => {
    setEditName(profileUser.name);
    setEditBio(profileUser.bio);
    setEditAvatar(profileUser.avatar);
    setEditNeighborhood(profileUser.neighborhood || 'Taquaralto');
    setEditInstagram(profileUser.instagram || '');
    setEditLevel(profileUser.level);
    setIsEditProfileOpen(true);
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updated: User = {
      ...profileUser,
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || profileUser.avatar,
      neighborhood: editNeighborhood,
      instagram: editInstagram.trim() ? (editInstagram.startsWith('@') ? editInstagram : `@${editInstagram}`) : undefined,
      level: editLevel
    };

    onUpdateProfile(updated);
    setIsEditProfileOpen(false);
    showNotice('Perfil atualizado com sucesso!');
  };

  // Open Edit Photo Modal
  const handleOpenEditPhoto = (photo: PhotoBase) => {
    setEditingPhoto(photo);
    setEditPhotoTitle(photo.title);
    setEditPhotoTags(photo.tags.join(' '));
    setEditPhotoNeighborhood(photo.location?.neighborhood || 'Taquaralto');
  };

  // Save Photo Edit
  const handleSavePhotoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editPhotoTitle.trim()) return;

    const parsedTags = editPhotoTags
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    onEditPhoto(editingPhoto.id, {
      title: editPhotoTitle.trim(),
      tags: parsedTags.length > 0 ? parsedTags : editingPhoto.tags,
      neighborhood: editPhotoNeighborhood
    });

    setEditingPhoto(null);
    showNotice(`Obra "${editPhotoTitle}" atualizada com sucesso!`);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'photo') {
      onDeletePhoto(deleteTarget.id);
      showNotice(`Obra "${deleteTarget.title}" removida do catálogo.`);
    } else if (deleteTarget.type === 'spot') {
      onDeleteSpot(deleteTarget.id);
      showNotice(`Ponto de arte "${deleteTarget.title}" removido do mapa.`);
    }

    setDeleteTarget(null);
  };

  const showNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Success Notification Banner */}
      {successNotice && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-black uppercase tracking-wider animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-[#2D2A26] text-white p-6 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="relative shrink-0">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-[#FFB800] object-cover shadow-xl" 
            />
            {isOwner && (
              <button
                onClick={handleOpenEditProfile}
                title="Editar foto e perfil"
                className="absolute bottom-1 right-1 bg-[#FFB800] text-[#2D2A26] p-2.5 rounded-full shadow-lg hover:scale-110 transition"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                {profileUser.name}
              </h1>
              <span className="text-xs bg-[#FFB800] text-[#2D2A26] font-black px-3 py-1 rounded-full uppercase">
                {profileUser.level}
              </span>
              {isOwner && (
                <span className="text-[9px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full uppercase">
                  Meu Perfil
                </span>
              )}
              {isOwner && unreadRemixCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="text-[10px] bg-[#FF5722] hover:bg-[#E64A19] text-white font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 shadow-md animate-pulse"
                  title="Notificações de novos remixes da sua arte"
                >
                  <Bell size={12} className="animate-bounce" />
                  <span>{unreadRemixCount} novo{unreadRemixCount === 1 ? '' : 's'} remix{unreadRemixCount === 1 ? '' : 'es'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-gray-300">
              <div className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-[#FFB800]" />
                <span className="font-bold">{profileUser.neighborhood || 'Palmas - TO'}</span>
              </div>
              {profileUser.instagram && (
                <a 
                  href={`https://instagram.com/${profileUser.instagram.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#FFB800] transition"
                >
                  <Instagram size={13} />
                  <span>{profileUser.instagram}</span>
                </a>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              {profileUser.bio}
            </p>

            {/* Reputation, Vibes, and Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <div className="bg-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#FFB800]" />
                <span className="text-xs font-black">{profileUser.responsa}</span>
                <span className="text-[9px] uppercase text-gray-400 font-bold">Responsa</span>
              </div>

              <div className="bg-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-black">{profileUser.vibe}</span>
                <span className="text-[9px] uppercase text-gray-400 font-bold">Vibes</span>
              </div>

              <div className="bg-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sword size={14} className="text-red-400" />
                <span className="text-xs font-black">{totalWins}V</span>
                <span className="text-[9px] uppercase text-gray-400 font-bold">em Batalhas</span>
              </div>

              <Link
                to="/ranking"
                className="bg-[#FFB800] hover:bg-white text-[#2D2A26] px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase transition flex items-center gap-1 shadow"
              >
                <Trophy size={12} />
                <span>Ver no Ranking</span>
              </Link>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className={`relative px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase transition flex items-center gap-1.5 border shadow ${
                    unreadRemixCount > 0
                      ? 'bg-[#FF5722] hover:bg-[#E64A19] text-white border-[#FF5722]'
                      : 'bg-white/10 hover:bg-[#FFB800] hover:text-[#2D2A26] text-white border-white/10'
                  }`}
                  title="Notificações de Remixes das suas Obras Originais"
                >
                  <div className="relative">
                    <Bell size={13} className={unreadRemixCount > 0 ? 'animate-wiggle' : ''} />
                    {unreadRemixCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFB800] rounded-full animate-ping" />
                    )}
                  </div>
                  <span>Notificações</span>
                  {unreadRemixCount > 0 && (
                    <span className="bg-[#FFB800] text-[#2D2A26] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {unreadRemixCount}
                    </span>
                  )}
                </button>
              )}

              {isOwner && (
                <button
                  onClick={handleOpenEditProfile}
                  className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase transition flex items-center gap-1.5 border border-white/10"
                >
                  <Edit3 size={12} />
                  <span>Editar Dados</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Unlocked Badges Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">
              Insígnias & Conquistas Desbloqueadas ({profileUser.badges.length})
            </span>
            <button
              onClick={() => setActiveTab('badges')}
              className="text-[10px] text-gray-400 hover:text-white uppercase font-bold transition"
            >
              Ver Todas as Badges &rarr;
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profileUser.badges.map(bId => {
              const b = BADGES.find(x => x.id === bId) || { id: bId, name: bId, icon: '⭐', description: 'Conquista' };
              return (
                <div 
                  key={bId}
                  title={`${b.name}: ${b.description}`}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-xl text-gray-100 border border-white/10 transition cursor-help group"
                >
                  <span className="text-sm group-hover:scale-125 transition-transform">{b.icon}</span>
                  <span className="text-[10px] font-bold">{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Remix Notification Alert Banner for Owner with Direct Link to Lineage Tree */}
      {isOwner && unreadRemixCount > 0 && userRemixNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-[#FFB800] via-amber-400 to-[#FF5722] p-4 sm:p-5 rounded-[2.5rem] shadow-lg text-[#2D2A26] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-[#2D2A26] animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-[#2D2A26] text-[#FFB800] rounded-2xl flex items-center justify-center shrink-0 shadow-md relative">
              <Bell size={22} className="animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black uppercase tracking-tight">
                  {unreadRemixCount === 1 
                    ? 'Novo Remix Criado da sua Foto!' 
                    : `${unreadRemixCount} Novos Remixes Criados da sua Foto!`}
                </h4>
                <span className="bg-[#2D2A26] text-[#FFB800] text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <GitBranch size={10} />
                  <span>Árvore de Linhagem</span>
                </span>
              </div>
              <p className="text-xs font-bold text-[#2D2A26]/90 mt-0.5">
                <span className="underline font-black">{userRemixNotifications[0]?.remixerName}</span> remixou sua foto original <span className="font-black">"{userRemixNotifications[0]?.originalPhotoTitle}"</span>. Veja como sua arte gerou novas ramificações!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <Link
              to={`/lineage/${userRemixNotifications[0]?.originalPhotoId}`}
              onClick={() => handleMarkAsReadInternal(userRemixNotifications[0]?.id)}
              className="flex-1 sm:flex-none bg-[#2D2A26] hover:bg-black text-[#FFB800] hover:text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-1.5"
            >
              <GitBranch size={14} />
              <span>Ver Árvore de Linhagem</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsNotificationsModalOpen(true)}
              className="bg-white/80 hover:bg-white text-[#2D2A26] px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow transition"
            >
              Ver Todas ({userRemixNotifications.length})
            </button>
          </div>
        </div>
      )}

      {/* Content Management Navigation Tabs */}
      <div className="flex space-x-2 sm:space-x-4 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('bases')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all ${
            activeTab === 'bases' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          📸 Fotos Base ({userBases.length})
        </button>

        <button 
          onClick={() => setActiveTab('remixes')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all ${
            activeTab === 'remixes' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🎨 Remixes Feitos ({userRemixes.length})
        </button>

        <button 
          onClick={() => setActiveTab('received-remixes')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-1.5 ${
            activeTab === 'received-remixes' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Bell size={13} className={unreadRemixCount > 0 ? 'text-[#FF5722]' : ''} />
          <span>Remixes da sua Arte ({userRemixNotifications.length})</span>
          {unreadRemixCount > 0 && (
            <span className="bg-[#FF5722] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {unreadRemixCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('spots')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all ${
            activeTab === 'spots' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          📍 Muros Mapeados ({userSpots.length})
        </button>

        <button 
          onClick={() => setActiveTab('badges')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all ${
            activeTab === 'badges' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          🏆 Todas as Badges ({BADGES.length})
        </button>

        <button 
          onClick={() => setActiveTab('battles')} 
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all ${
            activeTab === 'battles' 
              ? 'bg-[#2D2A26] text-[#FFB800] shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          ⚔️ Histórico da Arena
        </button>
      </div>

      {/* TAB 1: Minhas Fotos Base */}
      {activeTab === 'bases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                Registros Visuais Originais
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase">
                Fotos capturadas na quebrada que servem de matriz para a comunidade remixar
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => navigate('/')}
                className="bg-[#FFB800] text-[#2D2A26] font-black text-xs uppercase px-4 py-2 rounded-xl hover:scale-105 transition shadow flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Subir Nova Foto</span>
              </button>
            )}
          </div>

          {userBases.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 space-y-3">
              <Camera size={36} className="mx-auto text-gray-300" />
              <h4 className="text-lg font-black uppercase text-gray-700">Nenhuma foto base cadastrada</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Fotografe os murais, cenários e a arquitetura periférica de Palmas para começar sua jornada!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userBases.map(photo => {
                const wins = photo.battleWins || 0;
                const losses = photo.battleLosses || 0;

                return (
                  <div key={photo.id} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <div className="absolute top-3 left-3 bg-[#2D2A26]/90 backdrop-blur-md text-[#FFB800] font-black text-[9px] px-2.5 py-1 rounded-full uppercase">
                        📸 Base
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#2D2A26] font-black text-[9px] px-2.5 py-1 rounded-full uppercase shadow">
                        {wins}V - {losses}D
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-black text-sm uppercase truncate text-[#2D2A26]">
                          {photo.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">
                          {photo.location?.neighborhood || 'Palmas - TO'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(photo.tags || []).slice(0, 3).map(t => (
                            <span key={t} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(`/remix/${photo.id}`)}
                          className="bg-[#2D2A26] text-[#FFB800] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition"
                        >
                          Remixar
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/lineage/${photo.id}`)}
                            title="Ver Linhagem"
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                          >
                            <ExternalLink size={13} />
                          </button>

                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleOpenEditPhoto(photo)}
                                title="Editar dados da obra"
                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: photo.id, type: 'photo', title: photo.title })}
                                title="Excluir foto base"
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Meus Remixes */}
      {activeTab === 'remixes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                Remixes & Intervenções Visuais
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase">
                Obras transformadas com colagens, stickers, filtros e caligrafia no Editor
              </p>
            </div>
          </div>

          {userRemixes.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 space-y-3">
              <Layers size={36} className="mx-auto text-gray-300" />
              <h4 className="text-lg font-black uppercase text-gray-700">Nenhum remix criado ainda</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Explore as fotos base no Fluxo e crie sua primeira intervenção visual urbana!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#FFB800] text-[#2D2A26] px-5 py-2.5 rounded-xl font-black uppercase text-xs shadow"
              >
                Explorar Fotos do Fluxo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userRemixes.map(remix => {
                const wins = remix.battleWins || 0;
                const losses = remix.battleLosses || 0;

                return (
                  <div key={remix.id} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={remix.imageUrl} 
                        alt={remix.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <div className="absolute top-3 left-3 bg-[#FFB800] text-[#2D2A26] font-black text-[9px] px-2.5 py-1 rounded-full uppercase shadow">
                        🎨 Remix
                      </div>
                      <div className="absolute top-3 right-3 bg-[#2D2A26]/90 backdrop-blur-md text-[#FFB800] font-black text-[9px] px-2.5 py-1 rounded-full uppercase">
                        {wins}V - {losses}D
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-black text-sm uppercase truncate text-[#2D2A26]">
                          {remix.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">
                          Remix de matriz • {remix.vibeCount} Vibes
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(`/lineage/${remix.id}`)}
                          className="bg-gray-100 hover:bg-[#2D2A26] hover:text-[#FFB800] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          <span>Ver Linhagem</span>
                        </button>

                        {isOwner && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditPhoto(remix)}
                              title="Editar título e tags"
                              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: remix.id, type: 'photo', title: remix.title })}
                              title="Excluir remix"
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: Remixes da sua Arte & Árvore de Linhagem */}
      {activeTab === 'received-remixes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                  Remixes Feitos da sua Arte
                </h3>
                {unreadRemixCount > 0 && (
                  <span className="bg-[#FF5722] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                    {unreadRemixCount} novo{unreadRemixCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase">
                Cada releitura expande sua arte na árvore de linhagem. Acesse os links para explorar a genealogia visual.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadRemixCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsReadInternal}
                  className="bg-gray-100 hover:bg-gray-200 text-[#2D2A26] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5"
                >
                  <CheckCheck size={14} className="text-green-600" />
                  <span>Marcar todas como lidas</span>
                </button>
              )}
              {isOwner && onSimulateRemix && (
                <button
                  type="button"
                  onClick={onSimulateRemix}
                  className="bg-[#FFB800] hover:bg-[#2D2A26] hover:text-[#FFB800] text-[#2D2A26] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow transition flex items-center gap-1.5"
                  title="Simular um novo remix feito pela comunidade para testar a notificação"
                >
                  <Sparkles size={14} />
                  <span>+ Testar Novo Remix</span>
                </button>
              )}
            </div>
          </div>

          {userRemixNotifications.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-[#FFB800] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <GitBranch size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black uppercase text-gray-700">Nenhum remix registrado ainda</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Assim que outros artistas de Palmas ou do Fluxo criarem um remix a partir de uma de suas fotos originais, você receberá a notificação com link direto para a árvore de linhagem aqui!
                </p>
              </div>
              {isOwner && onSimulateRemix && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onSimulateRemix}
                    className="bg-[#2D2A26] hover:bg-black text-[#FFB800] px-5 py-3 rounded-2xl font-black text-xs uppercase shadow-md transition inline-flex items-center gap-2"
                  >
                    <Sparkles size={15} />
                    <span>Simular Novo Remix Comunitário Agora</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRemixNotifications.map((notif) => (
                <RemixNotificationCard
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={handleMarkAsReadInternal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Meus Muros Mapeados */}
      {activeTab === 'spots' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                Pontos de Graffiti Mapeados em Palmas
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase">
                Muros autorizados e espaços urbanos sinalizados no mapa interativo
              </p>
            </div>
            <Link
              to="/map"
              className="bg-[#2D2A26] text-[#FFB800] px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black transition flex items-center gap-1.5 shadow"
            >
              <MapPin size={14} />
              <span>Abrir Mapa Real</span>
            </Link>
          </div>

          {userSpots.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 space-y-3">
              <MapPin size={36} className="mx-auto text-gray-300" />
              <h4 className="text-lg font-black uppercase text-gray-700">Nenhum muro sinalizado</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Vá ao mapa de Palmas e use a ferramenta "Marcar Ponto de Graffiti" para colaborar com a cena visual da cidade!
              </p>
              <Link
                to="/map"
                className="inline-block bg-[#FFB800] text-[#2D2A26] px-5 py-2.5 rounded-xl font-black uppercase text-xs shadow"
              >
                Ir para o Mapa
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userSpots.map(spot => (
                <div key={spot.id} className="bg-white rounded-[2rem] p-5 shadow-md border border-gray-100 flex flex-col justify-between space-y-4 hover:shadow-xl transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        spot.type === 'permitido' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {spot.type === 'permitido' ? '✓ Muro Autorizado' : '💡 Ponto Sugerido'}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">
                        GPS: {spot.lat.toFixed(3)}, {spot.lng.toFixed(3)}
                      </span>
                    </div>

                    <h4 className="font-black text-base uppercase text-[#2D2A26]">
                      {spot.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {spot.description}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      📍 {spot.neighborhood || 'Palmas - TO'} • {spot.address}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to="/map"
                      className="text-xs font-black uppercase text-[#FFB800] hover:underline flex items-center gap-1"
                    >
                      <span>Ver no Mapa</span>
                      <ArrowRight size={12} />
                    </Link>

                    {isOwner && (
                      <button
                        onClick={() => setDeleteTarget({ id: spot.id, type: 'spot', title: spot.title })}
                        title="Remover ponto de arte"
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Conquistas & Badges */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
              Painel de Conquistas da Quebrada
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Conquiste novas insígnias criando remixes, votando na arena, mapeando muros e vencendo desafios
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map(badge => {
              const isUnlocked = profileUser.badges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-[2rem] border-2 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 to-white border-[#FFB800] shadow-md'
                      : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{badge.icon}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isUnlocked ? 'bg-[#FFB800] text-[#2D2A26]' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isUnlocked ? 'Desbloqueada' : 'Bloqueada'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm uppercase text-[#2D2A26]">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/50 text-[9px] font-black uppercase text-gray-400">
                    {isUnlocked ? '✓ Conquista Ativa no Perfil' : 'Como desbloquear: cumpra o requisito'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Histórico de Batalhas */}
      {activeTab === 'battles' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
              Desempenho na Arena de Batalhas 1v1
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Histórico de votos e aproveitamento das suas obras nos duelos da comunidade
            </p>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Vitórias Totais
              </span>
              <h4 className="text-4xl font-black text-emerald-600 mt-1">
                {totalWins}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">
                Duelos vencidos na arena
              </p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Aproveitamento
              </span>
              <h4 className="text-4xl font-black text-[#FFB800] mt-1">
                {userWinRate}%
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">
                Taxa de vitórias ({totalDuels} duelos totais)
              </p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Responsa Acumulada
              </span>
              <h4 className="text-4xl font-black text-[#2D2A26] mt-1">
                {profileUser.responsa}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">
                Pontos de reputação comunitária
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-3">
            <Sword size={32} className="mx-auto text-red-500" />
            <h4 className="text-base font-black uppercase">Quer colocar sua visão em duelo?</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Vote nos duelos ativos para acumular mais +5 pontos de Responsa por voto e garantir a insígnia de Júri!
            </p>
            <Link
              to="/battle"
              className="inline-block bg-[#2D2A26] text-[#FFB800] px-6 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-black transition shadow"
            >
              Ir para a Arena de Duelos
            </Link>
          </div>
        </div>
      )}

      {/* MODAL: Edit Profile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[120] animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#2D2A26]">
                Editar Perfil de Artista
              </h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Nome Artístico / Vulgo
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                />
              </div>

              {/* Foto do Perfil com Upload do Dispositivo */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Foto do Perfil (Carregar do Dispositivo)
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#FFB800] shadow-md bg-white">
                    <img 
                      src={editAvatar} 
                      alt="Prévia" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input 
                      type="file" 
                      ref={avatarFileInputRef} 
                      onChange={handleAvatarFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white hover:bg-gray-100 text-[#2D2A26] border border-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Upload size={14} className="text-[#FF5722]" />
                      <span>Carregar Foto do Celular/PC</span>
                    </button>
                    {avatarUploadError && (
                      <p className="text-[10px] text-red-500 font-bold">{avatarUploadError}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5">
                  <input
                    type="url"
                    placeholder="Ou cole a URL direta de uma imagem"
                    value={editAvatar.startsWith('data:') ? '' : editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FFB800] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Bairro em Palmas
                  </label>
                  <select
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                  >
                    <option value="Taquaralto">Taquaralto</option>
                    <option value="Jardim Aureny III">Jardim Aureny III</option>
                    <option value="Morada do Sol">Morada do Sol</option>
                    <option value="Setor Taquari">Setor Taquari</option>
                    <option value="301 Sul / Espaço Cultural">301 Sul / Espaço Cultural</option>
                    <option value="Plano Diretor Sul">Plano Diretor Sul</option>
                    <option value="Plano Diretor Norte">Plano Diretor Norte</option>
                    <option value="Praia da Graciosa">Praia da Graciosa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Nível de Atuação
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as UserLevel)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                  >
                    <option value={UserLevel.CRIADOR}>Criador</option>
                    <option value={UserLevel.ATIVISTA}>Ativista Visual</option>
                    <option value={UserLevel.OBSERVADOR}>Observador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Bio / Visão Periférica
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#FFB800] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Instagram / Contato
                </label>
                <input
                  type="text"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  placeholder="@seuperfil"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-black uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFB800] hover:bg-black hover:text-white text-[#2D2A26] py-3 rounded-2xl text-xs font-black uppercase transition shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Photo */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[120] animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                Editar Obra Visual
              </h3>
              <button 
                onClick={() => setEditingPhoto(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePhotoEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Título da Obra
                </label>
                <input
                  type="text"
                  required
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Tags (separadas por espaço)
                </label>
                <input
                  type="text"
                  value={editPhotoTags}
                  onChange={(e) => setEditPhotoTags(e.target.value)}
                  placeholder="#Taquaralto #Graffiti #PMW"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Bairro / Localidade
                </label>
                <input
                  type="text"
                  value={editPhotoNeighborhood}
                  onChange={(e) => setEditPhotoNeighborhood(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FFB800] outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-black uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFB800] text-[#2D2A26] hover:bg-black hover:text-white py-3 rounded-2xl text-xs font-black uppercase transition shadow"
                >
                  Salvar Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[130] animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-xl font-black uppercase text-[#2D2A26]">
              Confirmar Exclusão?
            </h3>

            <p className="text-xs text-gray-500">
              Tem certeza de que deseja excluir <span className="font-bold text-[#2D2A26]">"{deleteTarget.title}"</span>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-black uppercase"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-xs font-black uppercase transition shadow-lg"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Remix Notifications Center */}
      <RemixNotificationModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={userRemixNotifications}
        onMarkAsRead={handleMarkAsReadInternal}
        onMarkAllAsRead={handleMarkAllAsReadInternal}
      />
    </div>
  );
};
