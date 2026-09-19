import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Sword, 
  Flame, 
  Percent, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Camera, 
  Paintbrush, 
  Search, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  MessageSquare, 
  GitFork, 
  ExternalLink,
  Crown,
  Medal,
  Award,
  Zap,
  MapPin,
  TrendingUp,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { PhotoBase, User, Comment } from '../types';
import { BADGES } from '../constants';
import { RemixPodium } from './RemixPodium';

interface BattleRankingProps {
  photos: PhotoBase[];
  users: User[];
  currentUser: User | null;
  comments: Comment[];
  onOpenComments: (photo: PhotoBase) => void;
  onRequireLogin: () => void;
  initialTab?: 'all' | 'base' | 'remix' | 'artists' | 'podium';
}

type TabType = 'all' | 'base' | 'remix' | 'artists' | 'podium';
type SortMetric = 'wins' | 'winRate' | 'duels' | 'streak' | 'vibes';

export const BattleRanking: React.FC<BattleRankingProps> = ({
  photos = [],
  users = [],
  currentUser = null,
  comments = [],
  onOpenComments,
  onRequireLogin,
  initialTab = 'all'
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sortMetric, setSortMetric] = useState<SortMetric>('wins');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');

  // Compute calculated battle metrics for each photo
  const processedPhotos = useMemo(() => {
    return (photos || []).map(photo => {
      const wins = photo.battleWins || 0;
      const losses = photo.battleLosses || 0;
      const totalDuels = wins + losses;
      const winRate = totalDuels > 0 ? (wins / totalDuels) * 100 : 0;
      const streak = photo.battleStreak || 0;
      const commentCount = (comments || []).filter(c => c.targetId === photo.id).length;

      return {
        ...photo,
        wins,
        losses,
        totalDuels,
        winRate,
        streak,
        commentCount
      };
    });
  }, [photos, comments]);

  // Extract distinct neighborhoods for filtering
  const neighborhoods = useMemo(() => {
    const list = new Set<string>();
    photos.forEach(p => {
      if (p.location?.neighborhood) {
        list.add(p.location.neighborhood);
      }
    });
    return Array.from(list).sort();
  }, [photos]);

  // Filter and sort photos
  const filteredRankedPhotos = useMemo(() => {
    let list = processedPhotos;

    // Filter by type
    if (activeTab === 'base') {
      list = list.filter(p => p.type === 'base');
    } else if (activeTab === 'remix') {
      list = list.filter(p => p.type === 'remix');
    }

    // Filter by neighborhood
    if (selectedNeighborhood !== 'all') {
      list = list.filter(p => p.location?.neighborhood === selectedNeighborhood);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        (p.location?.neighborhood && p.location.neighborhood.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by metric
    return list.sort((a, b) => {
      if (sortMetric === 'wins') {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      }
      if (sortMetric === 'winRate') {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      }
      if (sortMetric === 'duels') {
        return b.totalDuels - a.totalDuels;
      }
      if (sortMetric === 'streak') {
        if (b.streak !== a.streak) return b.streak - a.streak;
        return b.wins - a.wins;
      }
      if (sortMetric === 'vibes') {
        return b.vibeCount - a.vibeCount;
      }
      return 0;
    });
  }, [processedPhotos, activeTab, selectedNeighborhood, searchQuery, sortMetric]);

  // Overall battle summary stats
  const battleStats = useMemo(() => {
    const totalWins = processedPhotos.reduce((acc, p) => acc + p.wins, 0);
    const totalPhotosCount = processedPhotos.filter(p => p.type === 'base').length;
    const totalRemixesCount = processedPhotos.filter(p => p.type === 'remix').length;
    
    // Top base photo
    const topBase = [...processedPhotos].filter(p => p.type === 'base').sort((a, b) => b.wins - a.wins)[0];
    // Top remix
    const topRemix = [...processedPhotos].filter(p => p.type === 'remix').sort((a, b) => b.wins - a.wins)[0];

    return {
      totalDuels: Math.round(totalWins / 1.5) || totalWins,
      totalPhotosCount,
      totalRemixesCount,
      topBase,
      topRemix
    };
  }, [processedPhotos]);

  // Artists ranking computed when 'artists' tab is active
  const rankedArtists = useMemo(() => {
    return users.map(user => {
      const userPhotos = processedPhotos.filter(p => p.userId === user.id);
      const baseCount = userPhotos.filter(p => p.type === 'base').length;
      const remixCount = userPhotos.filter(p => p.type === 'remix').length;
      const totalWorks = userPhotos.length;
      const totalWins = userPhotos.reduce((acc, p) => acc + p.wins, 0);
      const totalDuels = userPhotos.reduce((acc, p) => acc + p.totalDuels, 0);
      const avgWinRate = totalDuels > 0 ? (totalWins / totalDuels) * 100 : 0;
      
      const badgesCount = user.badges ? user.badges.length : 0;
      const overallScore = user.responsa + (badgesCount * 25) + (totalWorks * 5) + (totalWins * 3);

      return {
        ...user,
        badgesCount,
        baseCount,
        remixCount,
        totalWorks,
        totalWins,
        totalDuels,
        avgWinRate,
        overallScore
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [users, processedPhotos]);

  const top3 = (filteredRankedPhotos || []).slice(0, 3);
  const remainingPhotos = (filteredRankedPhotos || []).slice(3);

  return (
    <div className="space-y-8">
      {/* Top Header Section */}
      <div className="bg-[#2D2A26] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-[#FFB800]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#FFB800]/20 text-[#FFB800] px-3.5 py-1 rounded-full border border-[#FFB800]/40">
              <Sword size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Arena de Batalhas 1v1 • Palmas - TO
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white">
              Ranking da Batalha
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl font-medium">
              Classificação oficial das fotos e remixes mais votados pela comunidade da quebrada. Cada voto em duelo direto decide quem sobe no pódio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/battle"
              className="bg-[#FFB800] text-[#2D2A26] px-6 py-3.5 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition flex items-center justify-center space-x-2 border-2 border-[#FFB800]"
            >
              <Sword size={16} />
              <span>Votar na Batalha</span>
            </Link>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
              Líder Geral
            </span>
            <p className="text-sm font-black text-[#FFB800] truncate mt-0.5">
              {processedPhotos.sort((a, b) => b.wins - a.wins)[0]?.title || '—'}
            </p>
            <span className="text-[10px] text-gray-400">
              {processedPhotos.sort((a, b) => b.wins - a.wins)[0]?.wins || 0} vitórias
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
              Top Foto Base
            </span>
            <p className="text-sm font-black text-white truncate mt-0.5">
              {battleStats.topBase?.title || '—'}
            </p>
            <span className="text-[10px] text-[#FFB800] font-bold">
              {battleStats.topBase?.winRate.toFixed(0)}% de vitórias
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
              Top Remix
            </span>
            <p className="text-sm font-black text-white truncate mt-0.5">
              {battleStats.topRemix?.title || '—'}
            </p>
            <span className="text-[10px] text-[#FFB800] font-bold">
              {battleStats.topRemix?.winRate.toFixed(0)}% de vitórias
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
              Disputas Ativas
            </span>
            <p className="text-sm font-black text-white truncate mt-0.5">
              {processedPhotos.length} Obras
            </p>
            <span className="text-[10px] text-gray-400">
              {battleStats.totalPhotosCount} fotos • {battleStats.totalRemixesCount} remixes
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center space-x-2 ${
              activeTab === 'all'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Flame size={15} />
            <span>Geral da Arena ({processedPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('base')}
            className={`px-4 py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center space-x-2 ${
              activeTab === 'base'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Camera size={15} />
            <span>Fotos Base ({battleStats.totalPhotosCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('remix')}
            className={`px-4 py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center space-x-2 ${
              activeTab === 'remix'
                ? 'bg-[#FFB800] text-[#2D2A26] shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Paintbrush size={15} />
            <span>Remixes ({battleStats.totalRemixesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('podium')}
            className={`px-4 py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center space-x-2 ${
              activeTab === 'podium'
                ? 'bg-gradient-to-r from-amber-500 to-[#FFB800] text-[#2D2A26] shadow-md font-black'
                : 'bg-amber-100/70 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Trophy size={15} className="text-amber-700" />
            <span>Pódium Remixes</span>
            <span className="bg-[#2D2A26] text-[#FFB800] text-[8px] px-1.5 py-0.5 rounded-full font-black">TOP</span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2.5 rounded-2xl font-black uppercase text-xs transition flex items-center space-x-2 ${
              activeTab === 'artists'
                ? 'bg-[#2D2A26] text-[#FFB800] shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Crown size={15} />
            <span>Top Artistas ({users.length})</span>
          </button>
        </div>

        {activeTab !== 'artists' && activeTab !== 'podium' && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase text-gray-400">Ordenar:</span>
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value as SortMetric)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D2A26] focus:outline-none focus:border-[#FFB800]"
            >
              <option value="wins">🏆 Mais Vitórias</option>
              <option value="winRate">🎯 Maior Win Rate %</option>
              <option value="streak">⚡ Maior Sequência (Streak)</option>
              <option value="duels">⚔️ Mais Batalhas</option>
              <option value="vibes">🔥 Mais Vibes</option>
            </select>
          </div>
        )}
      </div>

      {/* Filter and Search Bar for Photos/Remixes */}
      {activeTab !== 'artists' && activeTab !== 'podium' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar obra, artista ou tag no ranking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FFB800]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={15} className="text-gray-400" />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#2D2A26] focus:outline-none focus:border-[#FFB800]"
            >
              <option value="all">Todos os Bairros de Palmas</option>
              {neighborhoods.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content Switcher */}
      {activeTab === 'podium' ? (
        <RemixPodium
          photos={photos}
          users={users}
          currentUser={currentUser}
          comments={comments}
          onOpenComments={onOpenComments}
          onRequireLogin={onRequireLogin}
        />
      ) : activeTab === 'artists' ? (
        /* Top Artistas Tab view */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(rankedArtists || []).slice(0, 3).map((artist, idx) => (
              <div 
                key={artist.id}
                onClick={() => navigate(`/profile/${artist.id}`)}
                className={`p-6 rounded-[2.5rem] relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 ${
                  idx === 0 
                    ? 'bg-gradient-to-b from-[#2D2A26] to-[#1F1D1A] text-white border-[#FFB800] shadow-2xl' 
                    : 'bg-white text-[#2D2A26] border-gray-100 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                    idx === 0 ? 'bg-[#FFB800] text-[#2D2A26]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idx === 0 ? '🥇 1º Lugar' : idx === 1 ? '🥈 2º Lugar' : '🥉 3º Lugar'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB800]">
                    {artist.totalWins} Vitórias em Batalha
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={artist.avatar}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
                    }}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#FFB800]"
                    alt={artist.name}
                  />
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{artist.name}</h3>
                    <p className={`text-[10px] font-bold uppercase ${idx === 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                      {artist.level}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100/10">
                  <div>
                    <span className={`text-[9px] uppercase font-bold block ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Responsa</span>
                    <span className="font-black text-sm">{artist.responsa}</span>
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase font-bold block ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Obras</span>
                    <span className="font-black text-sm">{artist.totalWorks}</span>
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase font-bold block ${idx === 0 ? 'text-gray-400' : 'text-gray-400'}`}>Aprov.</span>
                    <span className="font-black text-sm text-[#FFB800]">{artist.avgWinRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#2D2A26] mb-4">
              Todos os Artistas de Palmas
            </h4>
            <div className="divide-y divide-gray-100">
              {rankedArtists.map((artist, i) => (
                <div 
                  key={artist.id}
                  onClick={() => navigate(`/profile/${artist.id}`)}
                  className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition px-2 rounded-xl"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 text-center font-black text-xs text-gray-400">
                      #{i + 1}
                    </span>
                    <img
                      src={artist.avatar}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#FFB800]"
                      alt={artist.name}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{artist.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{artist.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-black text-[#2D2A26] block">
                        {artist.totalWins} Vitórias
                      </span>
                      <span className="text-[9px] text-[#FFB800] font-black uppercase">
                        {artist.avgWinRate.toFixed(0)}% Win Rate
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Photos & Remixes Battle Ranking */
        <div className="space-y-8">
          {activeTab === 'remix' && (
            <div className="bg-gradient-to-r from-[#2D2A26] to-[#1F1D1A] text-white rounded-3xl p-5 border border-[#FFB800]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center font-black shrink-0 shadow-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-2">
                    <span>Pódium Olímpico de Remixes</span>
                    <span className="bg-[#FFB800] text-[#2D2A26] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Destaque</span>
                  </h4>
                  <p className="text-xs text-gray-300">
                    Veja os 3 melhores remixes com pedestais 3D, estatísticas de batalha e comparativo antes vs. depois!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('podium')}
                className="px-5 py-2.5 bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] font-black text-xs uppercase rounded-xl transition shadow shrink-0 cursor-pointer"
              >
                Ver Pódium Completo
              </button>
            </div>
          )}

          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
                  <Trophy size={18} className="text-[#FFB800]" />
                  <span>Pódio da Arena (Top 3)</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Mais Votadas em Duelo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2nd Place (Silver) */}
                {top3[1] && (
                  <div className="order-2 md:order-1 bg-white rounded-[2.5rem] p-5 shadow-xl border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                          <Medal size={12} className="text-slate-400" />
                          2º Lugar • Prata
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#FFB800] bg-[#2D2A26] px-2.5 py-0.5 rounded-full">
                          {top3[1].type === 'remix' ? '🎨 Remix' : '📸 Foto Base'}
                        </span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3]">
                        <img
                          src={top3[1].imageUrl}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          alt={top3[1].title}
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl p-2 text-white flex items-center justify-between">
                          <span className="text-[10px] font-bold truncate">@{top3[1].authorName}</span>
                          <span className="text-[10px] font-black text-[#FFB800]">
                            {top3[1].winRate.toFixed(0)}% Win
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-base uppercase tracking-tight truncate text-[#2D2A26]">
                        {top3[1].title}
                      </h4>
                      {top3[1].location && (
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {top3[1].location.neighborhood}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500">Recorde de Duelos:</span>
                        <span className="font-black text-[#2D2A26]">
                          {top3[1].wins}V - {top3[1].losses}D
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-400 h-full rounded-full" 
                          style={{ width: `${top3[1].winRate}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onOpenComments(top3[1])}
                          className="text-[10px] font-bold text-gray-400 hover:text-[#2D2A26] flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> {top3[1].commentCount} Comentários
                        </button>
                        <Link
                          to={`/lineage/${top3[1].id}`}
                          className="text-[10px] font-black text-[#2D2A26] hover:text-[#FFB800] flex items-center gap-1"
                        >
                          Linhagem <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {top3[0] && (
                  <div className="order-1 md:order-2 bg-[#2D2A26] text-white rounded-[2.5rem] p-6 shadow-2xl border-2 border-[#FFB800] flex flex-col justify-between hover:shadow-2xl transition group relative md:-translate-y-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFB800] text-[#2D2A26] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Crown size={12} />
                      Campeão da Arena
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3 mt-1">
                        <span className="bg-[#FFB800]/20 text-[#FFB800] text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 border border-[#FFB800]/30">
                          <Trophy size={12} />
                          1º Lugar • Ouro
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#2D2A26] bg-[#FFB800] px-2.5 py-0.5 rounded-full">
                          {top3[0].type === 'remix' ? '🎨 Remix' : '📸 Foto Base'}
                        </span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3] border-2 border-[#FFB800]/40">
                        <img
                          src={top3[0].imageUrl}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          alt={top3[0].title}
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-[#2D2A26]/80 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between border border-[#FFB800]/30">
                          <span className="text-xs font-black text-[#FFB800] truncate">@{top3[0].authorName}</span>
                          <span className="text-xs font-black text-white bg-green-500/30 px-2 py-0.5 rounded-lg">
                            {top3[0].winRate.toFixed(0)}% Win Rate
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-lg uppercase tracking-tight truncate text-white">
                        {top3[0].title}
                      </h4>
                      {top3[0].location && (
                        <p className="text-xs font-bold text-gray-300 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-[#FFB800]" /> {top3[0].location.neighborhood} • {top3[0].location.landmark || 'Palmas'}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-300">Total de Vitórias na Arena:</span>
                        <span className="font-black text-[#FFB800] text-sm">
                          {top3[0].wins} Vitórias ({top3[0].losses}D)
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#FFB800] h-full rounded-full" 
                          style={{ width: `${top3[0].winRate}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onOpenComments(top3[0])}
                          className="text-[10px] font-bold text-gray-300 hover:text-white flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> {top3[0].commentCount} Comentários
                        </button>
                        <Link
                          to={`/lineage/${top3[0].id}`}
                          className="text-[10px] font-black text-[#FFB800] hover:underline flex items-center gap-1"
                        >
                          Ver Linhagem Completa <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {top3[2] && (
                  <div className="order-3 bg-white rounded-[2.5rem] p-5 shadow-xl border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                          <Medal size={12} className="text-amber-600" />
                          3º Lugar • Bronze
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#FFB800] bg-[#2D2A26] px-2.5 py-0.5 rounded-full">
                          {top3[2].type === 'remix' ? '🎨 Remix' : '📸 Foto Base'}
                        </span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3]">
                        <img
                          src={top3[2].imageUrl}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          alt={top3[2].title}
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl p-2 text-white flex items-center justify-between">
                          <span className="text-[10px] font-bold truncate">@{top3[2].authorName}</span>
                          <span className="text-[10px] font-black text-[#FFB800]">
                            {top3[2].winRate.toFixed(0)}% Win
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-base uppercase tracking-tight truncate text-[#2D2A26]">
                        {top3[2].title}
                      </h4>
                      {top3[2].location && (
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {top3[2].location.neighborhood}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500">Recorde de Duelos:</span>
                        <span className="font-black text-[#2D2A26]">
                          {top3[2].wins}V - {top3[2].losses}D
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-600 h-full rounded-full" 
                          style={{ width: `${top3[2].winRate}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onOpenComments(top3[2])}
                          className="text-[10px] font-bold text-gray-400 hover:text-[#2D2A26] flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> {top3[2].commentCount} Comentários
                        </button>
                        <Link
                          to={`/lineage/${top3[2].id}`}
                          className="text-[10px] font-black text-[#2D2A26] hover:text-[#FFB800] flex items-center gap-1"
                        >
                          Linhagem <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Classification Table / List */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight text-[#2D2A26]">
                  Classificação Geral das Visões ({filteredRankedPhotos.length})
                </h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  Resultados diretos computados pelas votações da Arena
                </p>
              </div>

              <span className="text-[10px] bg-gray-100 text-gray-600 font-black uppercase px-3 py-1 rounded-full self-start sm:self-auto">
                Critério: {sortMetric === 'wins' ? 'Vitórias' : sortMetric === 'winRate' ? 'Win Rate %' : sortMetric === 'streak' ? 'Streak' : 'Duelos'}
              </span>
            </div>

            <div className="space-y-3">
              {filteredRankedPhotos.map((photo, index) => {
                const isTop3 = index < 3;
                return (
                  <div
                    key={photo.id}
                    className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isTop3 
                        ? 'bg-amber-50/40 border border-[#FFB800]/30' 
                        : 'bg-gray-50/70 hover:bg-gray-100/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        index === 0 ? 'bg-[#FFB800] text-[#2D2A26]' :
                        index === 1 ? 'bg-slate-300 text-slate-800' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        #{index + 1}
                      </div>

                      <img
                        src={photo.imageUrl}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=200&q=80';
                        }}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border"
                        alt={photo.title}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                            photo.type === 'remix' ? 'bg-[#2D2A26] text-[#FFB800]' : 'bg-[#FFB800] text-[#2D2A26]'
                          }`}>
                            {photo.type === 'remix' ? 'Remix' : 'Base'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold truncate whitespace-nowrap">
                            por @{photo.authorName}
                          </span>
                          {photo.streak && photo.streak >= 2 ? (
                            <span className="text-[8px] bg-red-100 text-red-600 font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                              <Zap size={9} /> {photo.streak}x Streak
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-black text-sm uppercase tracking-tight truncate text-[#2D2A26] mt-0.5">
                          {photo.title}
                        </h4>

                        {photo.location && (
                          <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                            <MapPin size={10} /> {photo.location.neighborhood}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Battle Metrics & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200/50">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-2 justify-start sm:justify-end">
                          <span className="font-black text-xs text-[#2D2A26] whitespace-nowrap">
                            {photo.wins}V - {photo.losses}D
                          </span>
                          <span className="text-[10px] font-black text-[#FFB800] bg-[#2D2A26] px-2.5 py-0.5 rounded-md whitespace-nowrap inline-flex items-center">
                            {photo.winRate.toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          {photo.totalDuels} duelos na arena • {photo.vibeCount} vibes
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onOpenComments(photo)}
                          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white hover:bg-gray-200 text-gray-600 border border-gray-200 transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                          title="Comentários"
                        >
                          <MessageSquare size={16} />
                        </button>

                        <Link
                          to={`/lineage/${photo.id}`}
                          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white hover:bg-gray-200 text-gray-600 border border-gray-200 transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                          title="Ver Linhagem"
                        >
                          <GitFork size={16} />
                        </Link>

                        <Link
                          to="/battle"
                          className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FFB800] text-[#2D2A26] hover:bg-[#2D2A26] hover:text-[#FFB800] transition font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        >
                          <Sword size={14} />
                          <span>Duelo</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredRankedPhotos.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-bold text-sm">Nenhuma obra encontrada para esse filtro.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedNeighborhood('all');
                      setActiveTab('all');
                    }}
                    className="mt-2 text-xs font-black uppercase text-[#FFB800] underline"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
