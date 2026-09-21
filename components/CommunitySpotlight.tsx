import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Crown, 
  Flame, 
  Trophy, 
  Sparkles, 
  Paintbrush, 
  Camera, 
  MapPin, 
  ArrowRight, 
  GitBranch, 
  Heart, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Award,
  Zap,
  Globe
} from 'lucide-react';
import { PhotoBase, User, Comment } from '../types';
import { BADGES } from '../constants';

interface CommunitySpotlightProps {
  photos: PhotoBase[];
  users: User[];
  currentUser: User | null;
  comments: Comment[];
  onLike: (photoId: string) => void;
  onOpenComments: (photo: PhotoBase) => void;
  onRequireLogin: (reason?: string) => void;
  isAdmin?: boolean;
}

export const CommunitySpotlight: React.FC<CommunitySpotlightProps> = ({
  photos,
  users,
  currentUser,
  comments,
  onLike,
  onOpenComments,
  onRequireLogin,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'artwork' | 'remix' | 'artists'>('all');
  const [pinnedPhotoId, setPinnedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('upmm_pinned_spotlight');
      if (saved) setPinnedPhotoId(saved);
    } catch {}
  }, []);

  // Highlighted main artwork (pinned > highest vibe > gold standard > first)
  const heroPhoto = useMemo(() => {
    if (pinnedPhotoId) {
      const pinned = photos.find(p => p.id === pinnedPhotoId);
      if (pinned) return pinned;
    }
    const gold = photos.find(p => p.isGoldStandard);
    if (gold) return gold;
    const sorted = [...photos].sort((a, b) => (b.vibeCount || 0) - (a.vibeCount || 0));
    return sorted[0] || photos[0];
  }, [photos, pinnedPhotoId]);

  // Featured top remix
  const topRemix = useMemo(() => {
    const remixes = photos.filter(p => p.type === 'remix');
    remixes.sort((a, b) => (b.vibeCount || 0) - (a.vibeCount || 0));
    return remixes[0] || photos.find(p => p.type === 'remix');
  }, [photos]);

  // Top artists in the spotlight
  const spotlightArtists = useMemo(() => {
    const sortedUsers = [...users].sort((a, b) => (b.responsa || 0) - (a.responsa || 0));
    return sortedUsers.slice(0, 3);
  }, [users]);

  // Handle pin by admin
  const handleTogglePin = (photoId: string) => {
    const next = pinnedPhotoId === photoId ? null : photoId;
    setPinnedPhotoId(next);
    try {
      if (next) {
        localStorage.setItem('upmm_pinned_spotlight', next);
      } else {
        localStorage.removeItem('upmm_pinned_spotlight');
      }
    } catch {}
  };

  const heroAuthor = users.find(u => u.id === heroPhoto?.userId);
  const heroCommentsCount = comments.filter(c => c.targetId === heroPhoto?.id).length;

  if (!heroPhoto) return null;

  return (
    <section className="bg-gradient-to-b from-[#2D2A26] to-[#1E1C1A] text-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-[#FFB800]/40 relative overflow-hidden space-y-4 sm:space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FFB800] text-[#2D2A26] px-3 py-1 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest mb-1.5 shadow">
            <Star size={12} className="fill-[#2D2A26]" />
            <span>Curadoria Oficial da Quebrada</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>Destaque da Comunidade</span>
            <Sparkles size={20} className="text-[#FFB800] animate-pulse" />
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-300 max-w-xl font-medium mt-1">
            As criações mais impactantes, os remixes mais originais e as vozes visuais que inspiram as periferias de Palmas nesta temporada.
          </p>
        </div>

        {/* Filter pills / segmented control without scroll */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full md:w-auto p-1 bg-black/30 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase text-center transition-all ${
              activeFilter === 'all'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('artwork')}
            className={`px-2 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase text-center transition-all ${
              activeFilter === 'artwork'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Obra da Semana
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('artists')}
            className={`px-2 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase text-center transition-all ${
              activeFilter === 'artists'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Artistas em Alta
          </button>
        </div>
      </div>

      {/* Hero Showcase: Obra de Ouro em Evidência */}
      {(activeFilter === 'all' || activeFilter === 'artwork') && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-3.5 sm:p-6 border border-white/10">
          {/* Visual Showcase (Photo) */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-black/40 group">
            <img 
              src={heroPhoto.imageUrl} 
              alt={heroPhoto.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlaid Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <span className="bg-[#FFB800] text-[#2D2A26] font-black text-[10px] px-3 py-1 rounded-full uppercase shadow flex items-center gap-1.5">
                <Crown size={13} />
                <span>Obra em Evidência</span>
              </span>
              {heroPhoto.type === 'remix' ? (
                <span className="bg-purple-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase backdrop-blur-sm flex items-center gap-1">
                  <Paintbrush size={11} />
                  <span>Remix da Comunidade</span>
                </span>
              ) : (
                <span className="bg-[#2D2A26]/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase backdrop-blur-sm flex items-center gap-1">
                  <Camera size={11} />
                  <span>Foto Base Original</span>
                </span>
              )}
            </div>

            {/* Admin Pin Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleTogglePin(heroPhoto.id)}
                className={`absolute top-3 right-3 z-10 p-2 rounded-xl text-xs font-black uppercase transition flex items-center gap-1 shadow-lg ${
                  pinnedPhotoId === heroPhoto.id 
                    ? 'bg-[#FF5722] text-white ring-2 ring-white' 
                    : 'bg-[#2D2A26]/80 text-gray-300 hover:text-white'
                }`}
                title="Fixar esta obra no Destaque da Comunidade"
              >
                <Star size={14} className={pinnedPhotoId === heroPhoto.id ? 'fill-white' : ''} />
                <span className="text-[10px]">{pinnedPhotoId === heroPhoto.id ? 'Fixado' : 'Fixar Destaque'}</span>
              </button>
            )}

            {/* Bottom Gradient for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl font-bold flex items-center gap-1 text-[#FFB800]">
                  <Flame size={13} />
                  <span>{heroPhoto.vibeCount || 0} Vibes</span>
                </span>
                {heroPhoto.location && (
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl font-medium text-gray-200 flex items-center gap-1">
                    <MapPin size={12} className="text-[#FFB800]" />
                    <span>{heroPhoto.location.neighborhood}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details and Editorial Story */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">
                  Escolha dos Criadores • Palmas - TO
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                {heroPhoto.title}
              </h3>

              {/* Author info */}
              <div className="mt-3 flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <img 
                  src={heroAuthor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'} 
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FFB800]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs uppercase text-white truncate">
                      {heroPhoto.authorName}
                    </h4>
                    {heroAuthor?.level && (
                      <span className="text-[8px] bg-[#FFB800]/20 text-[#FFB800] px-1.5 py-0.2 rounded font-black uppercase">
                        {heroAuthor.level}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">
                    {heroAuthor?.neighborhood || 'Palmas'} • {heroAuthor?.responsa || 40} Responsa
                  </p>
                </div>
                <Link
                  to={`/profile/${heroPhoto.userId}`}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase transition shrink-0"
                >
                  Perfil
                </Link>
              </div>

              {/* Tags */}
              {heroPhoto.tags && heroPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {heroPhoto.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-[#FFB800] bg-white/5 px-2.5 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions (Mobile Ergonomic) */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onRequireLogin('Faça login para remixar a obra em destaque da comunidade.');
                    return;
                  }
                  navigate(`/remix/${heroPhoto.id}`);
                }}
                className="w-full sm:w-auto sm:flex-1 min-h-[44px] bg-[#FFB800] hover:bg-white active:scale-95 text-[#2D2A26] font-black text-xs uppercase px-4 py-2.5 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Paintbrush size={15} />
                <span>Remixar Obra</span>
              </button>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={() => navigate(`/lineage/${heroPhoto.id}`)}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase rounded-2xl transition border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Explorar linhagem de criações"
                >
                  <GitBranch size={14} className="text-[#FFB800]" />
                  <span className="inline sm:inline">Linhagem</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLike(heroPhoto.id)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl transition border border-white/10 flex items-center justify-center cursor-pointer"
                  title="Mandar Vibe"
                >
                  <Heart size={16} className="text-[#FF5722]" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenComments(heroPhoto)}
                  className="min-h-[44px] px-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase rounded-2xl transition border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
                  title="Ver e adicionar comentários"
                >
                  <MessageSquare size={15} className="text-[#FFB800]" />
                  <span className="text-[10px]">{heroCommentsCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Artists Showcase */}
      {(activeFilter === 'all' || activeFilter === 'artists') && (
        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-[#FFB800]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#FFB800]">
                Artistas Visuais em Evidência
              </h3>
            </div>
            <Link
              to="/ranking"
              className="text-[10px] font-bold uppercase text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <span>Ver Ranking Completo</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {spotlightArtists.map((artist, idx) => (
              <div
                key={artist.id}
                onClick={() => navigate(`/profile/${artist.id}`)}
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all cursor-pointer group flex items-center space-x-3"
              >
                <div className="relative">
                  <img 
                    src={artist.avatar} 
                    alt={artist.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FFB800] group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#FFB800] text-[#2D2A26] rounded-full text-[9px] font-black flex items-center justify-center shadow">
                    #{idx + 1}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs uppercase text-white truncate group-hover:text-[#FFB800] transition-colors">
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    {artist.neighborhood || 'Palmas - TO'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-amber-300 bg-white/10 px-1.5 py-0.2 rounded">
                      {artist.responsa} Responsa
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {(artist.badges || []).length} {(artist.badges || []).length === 1 ? 'insígnia' : 'insígnias'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
