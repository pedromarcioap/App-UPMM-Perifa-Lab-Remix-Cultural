import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  MapPin, 
  Camera, 
  Sparkles, 
  Sword, 
  Trophy, 
  Building2, 
  ShieldCheck, 
  User as UserIcon,
  Tag,
  ArrowRight,
  Command
} from 'lucide-react';
import { PhotoBase, User, GraffitiSpot } from '../types';
import { PALMAS_NEIGHBORHOODS } from '../constants';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos?: PhotoBase[];
  users?: User[];
  spots?: GraffitiSpot[];
  graffitiSpots?: GraffitiSpot[];
  isAdmin?: boolean;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  photos = [],
  users = [],
  spots = [],
  graffitiSpots,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Fallback for spots/graffitiSpots prop naming
  const effectiveSpots = useMemo(() => {
    return graffitiSpots || spots || [];
  }, [spots, graffitiSpots]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    const safePhotos = photos || [];
    const safeUsers = users || [];
    const safeSpots = effectiveSpots || [];
    const safeSectors = PALMAS_NEIGHBORHOODS || [];

    if (!q) {
      return {
        photos: safePhotos.slice(0, 3),
        users: safeUsers.slice(0, 3),
        spots: safeSpots.slice(0, 3),
        sectors: safeSectors.slice(0, 4)
      };
    }

    const matchedPhotos = safePhotos.filter(p => 
      (p?.title || '').toLowerCase().includes(q) ||
      (p?.tags || []).some(t => (t || '').toLowerCase().includes(q)) ||
      (p?.authorName || '').toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedUsers = safeUsers.filter(u => 
      (u?.name || '').toLowerCase().includes(q) ||
      (u?.neighborhood || '').toLowerCase().includes(q) ||
      (u?.bio || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedSpots = safeSpots.filter(s =>
      (s?.title || '').toLowerCase().includes(q) ||
      (s?.neighborhood || '').toLowerCase().includes(q) ||
      (s?.address || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedSectors = safeSectors.filter(n =>
      (n || '').toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      photos: matchedPhotos,
      users: matchedUsers,
      spots: matchedSpots,
      sectors: matchedSectors
    };
  }, [query, photos, users, effectiveSpots]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#1C1B19] border border-[#3E3A35] rounded-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-[#3E3A35] flex items-center gap-3 bg-[#141311]">
          <Search size={20} className="text-[#FFB800] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por muro, artista, tag, bairro (ex: Taquari, Graffiti, Kauê)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-[#EDE8E1]/40 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-[#242220] rounded text-[#EDE8E1]/60 hover:text-white transition"
            >
              <X size={16} />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-1 bg-[#242220] text-[#EDE8E1]/60 rounded border border-[#3E3A35]">
            ESC para fechar
          </span>
        </div>

        {/* Results Body */}
        <div className="p-4 space-y-6 overflow-y-auto no-scrollbar">
          {/* Quick Actions Shortcuts */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] block px-1">
                Acesso Rápido aos Módulos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { navigate('/remix'); onClose(); }}
                  className="p-3 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] text-left transition group"
                >
                  <Sparkles size={16} className="text-[#FFB800] mb-1.5 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold block text-white">[03] Studio Remix</span>
                  <span className="text-[10px] text-[#EDE8E1]/60">Criar no canvas</span>
                </button>

                <button
                  onClick={() => { navigate('/battle'); onClose(); }}
                  className="p-3 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] text-left transition group"
                >
                  <Sword size={16} className="text-[#FF5722] mb-1.5 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold block text-white">[02] Arena 1v1</span>
                  <span className="text-[10px] text-[#EDE8E1]/60">Duelos anônimos</span>
                </button>

                <button
                  onClick={() => { navigate('/ranking'); onClose(); }}
                  className="p-3 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] text-left transition group"
                >
                  <Trophy size={16} className="text-[#FFB800] mb-1.5 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold block text-white">Pódio Semanal</span>
                  <span className="text-[10px] text-[#EDE8E1]/60">Top artistas</span>
                </button>

                {isAdmin ? (
                  <button
                    onClick={() => { navigate('/curadoria'); onClose(); }}
                    className="p-3 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] text-left transition group"
                  >
                    <ShieldCheck size={16} className="text-[#43A047] mb-1.5 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold block text-white">[05] Curadoria</span>
                    <span className="text-[10px] text-[#EDE8E1]/60">Triagem & Pix</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { navigate('/explore'); onClose(); }}
                    className="p-3 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] text-left transition group"
                  >
                    <MapPin size={16} className="text-[#00E5FF] mb-1.5 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold block text-white">Explorar Hub</span>
                    <span className="text-[10px] text-[#EDE8E1]/60">Murais & Bairros</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Matched Photos & Remixes */}
          {searchResults.photos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EDE8E1]/60 block px-1">
                Murais & Remixes ({searchResults.photos.length})
              </span>
              <div className="space-y-1.5">
                {searchResults.photos.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { navigate(`/remix/${p.id}`); onClose(); }}
                    className="p-2.5 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] flex items-center justify-between gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#3E3A35]" />
                      <div>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                          p.type === 'remix' ? 'bg-[#00E5FF] text-[#141311]' : 'bg-[#FFB800] text-[#141311]'
                        }`}>
                          {p.type === 'remix' ? 'Remix' : 'Mural'}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-0.5">{p.title}</h4>
                        <p className="text-[10px] text-[#EDE8E1]/60">{p.authorName} • {p.location?.neighborhood || 'Palmas'}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#EDE8E1]/40" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Artists */}
          {searchResults.users.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EDE8E1]/60 block px-1">
                Artistas & Fotógrafos ({searchResults.users.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.users.map(u => (
                  <div
                    key={u.id}
                    onClick={() => { navigate(`/profile/${u.id}`); onClose(); }}
                    className="p-2.5 bg-[#242220] hover:bg-[#2D2A26] rounded-xl border border-[#3E3A35] flex items-center justify-between gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={u.avatar} 
                        alt="" 
                        className="w-9 h-9 rounded-full object-cover border border-[#FFB800]"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80';
                        }} 
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{u.name}</h4>
                        <p className="text-[10px] text-[#EDE8E1]/60">{u.neighborhood || 'Palmas'} • {u.vibe} VIBE</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#FFB800] uppercase">{u.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Sectors */}
          {searchResults.sectors.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EDE8E1]/60 block px-1">
                Polos & Setores Territoriais
              </span>
              <div className="flex flex-wrap gap-2">
                {searchResults.sectors.map(sec => (
                  <button
                    key={sec}
                    onClick={() => { navigate(`/explore`); onClose(); }}
                    className="px-3 py-1.5 bg-[#242220] hover:bg-[#FFB800] hover:text-[#141311] rounded-lg border border-[#3E3A35] text-xs font-bold text-[#EDE8E1] transition flex items-center gap-1.5"
                  >
                    <MapPin size={12} />
                    <span>{sec}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
