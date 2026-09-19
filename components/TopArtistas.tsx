import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Info,
  Medal,
  Star,
  CheckCircle2,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import { User, PhotoBase, Badge } from '../types';
import { BADGES } from '../constants';

interface TopArtistasProps {
  users: User[];
  photos: PhotoBase[];
  currentUser: User | null;
  onSelectArtist?: (userId: string) => void;
}

type SortCriteria = 'overall' | 'responsa' | 'badges' | 'vibes';

export const TopArtistas: React.FC<TopArtistasProps> = ({
  users,
  photos,
  currentUser,
  onSelectArtist
}) => {
  const navigate = useNavigate();
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('overall');

  // Compute artist statistics
  const rankedArtists = useMemo(() => {
    return users.map(user => {
      const userPhotos = photos.filter(p => p.userId === user.id);
      const baseCount = userPhotos.filter(p => p.type === 'base').length;
      const remixCount = userPhotos.filter(p => p.type === 'remix').length;
      const totalWorks = userPhotos.length;
      
      // Calculate overall score (Responsa + 25 pts per badge + works bonus)
      const badgesCount = user.badges ? user.badges.length : 0;
      const overallScore = user.responsa + (badgesCount * 25) + (totalWorks * 5);

      return {
        ...user,
        badgesCount,
        baseCount,
        remixCount,
        totalWorks,
        overallScore
      };
    }).sort((a, b) => {
      if (sortCriteria === 'overall') return b.overallScore - a.overallScore;
      if (sortCriteria === 'responsa') return b.responsa - a.responsa;
      if (sortCriteria === 'badges') return b.badgesCount - a.badgesCount;
      if (sortCriteria === 'vibes') return b.vibe - a.vibe;
      return 0;
    });
  }, [users, photos, sortCriteria]);

  const top3 = rankedArtists.slice(0, 3);
  const others = rankedArtists.slice(3);

  const getBadgeDetails = (badgeId: string): Badge => {
    const found = BADGES.find(b => b.id === badgeId);
    return found || { id: badgeId, name: badgeId, icon: '⭐', description: 'Conquista urbana' };
  };

  const handleArtistClick = (userId: string) => {
    if (onSelectArtist) {
      onSelectArtist(userId);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const maxResponsa = Math.max(...rankedArtists.map(a => a.responsa), 100);

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#FFB800]/20 text-[#2D2A26] px-3.5 py-1 rounded-full mb-3 border border-[#FFB800]/30">
            <Trophy size={14} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Ranking Oficial da Quebrada PMW
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[#2D2A26]">
            Top Artistas
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-1 max-w-xl leading-relaxed">
            Classificação viva baseada no acúmulo de <span className="text-[#2D2A26] font-black">Responsa</span> na cena e no número de <span className="text-amber-600 font-black">Conquistas (Badges)</span> desbloqueadas em Palmas.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl shrink-0 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setSortCriteria('overall')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition whitespace-nowrap ${
              sortCriteria === 'overall'
                ? 'bg-[#2D2A26] text-[#FFB800] shadow-sm'
                : 'text-gray-500 hover:text-[#2D2A26]'
            }`}
          >
            Geral (Responsa + Badges)
          </button>
          <button
            onClick={() => setSortCriteria('responsa')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition whitespace-nowrap ${
              sortCriteria === 'responsa'
                ? 'bg-[#2D2A26] text-[#FFB800] shadow-sm'
                : 'text-gray-500 hover:text-[#2D2A26]'
            }`}
          >
            Mais Responsa
          </button>
          <button
            onClick={() => setSortCriteria('badges')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition whitespace-nowrap ${
              sortCriteria === 'badges'
                ? 'bg-[#2D2A26] text-[#FFB800] shadow-sm'
                : 'text-gray-500 hover:text-[#2D2A26]'
            }`}
          >
            Mais Badges
          </button>
          <button
            onClick={() => setSortCriteria('vibes')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition whitespace-nowrap ${
              sortCriteria === 'vibes'
                ? 'bg-[#2D2A26] text-[#FFB800] shadow-sm'
                : 'text-gray-500 hover:text-[#2D2A26]'
            }`}
          >
            Mais Vibes
          </button>
        </div>
      </header>

      {/* Podium for Top 3 Artists */}
      {top3.length >= 3 && (
        <section className="bg-gradient-to-b from-gray-50/80 to-white p-6 sm:p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#FFB800]" /> Pódio dos Mestres
            </h3>
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
              Palmas - TO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
            {/* 2º Lugar - Prata */}
            <div 
              onClick={() => handleArtistClick(top3[1].id)}
              className="order-2 md:order-1 bg-white p-6 rounded-[2.5rem] border-2 border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center relative"
            >
              <div className="absolute -top-4 bg-gray-200 text-gray-700 font-black text-xs px-3 py-1 rounded-full shadow border-2 border-white flex items-center gap-1">
                🥈 2º Lugar
              </div>

              <div className="relative mt-2 mb-3">
                <img 
                  src={top3[1].avatar} 
                  alt={top3[1].name} 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 shadow-md group-hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 bg-gray-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  #{2}
                </span>
              </div>

              <h4 className="font-black text-base text-[#2D2A26] group-hover:text-amber-600 transition">
                {top3[1].name}
              </h4>
              <span className="text-[9px] font-black uppercase bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full mt-1">
                {top3[1].level}
              </span>

              {/* Stats pill */}
              <div className="mt-4 w-full grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Responsa</span>
                  <span className="text-sm font-black text-[#2D2A26]">{top3[1].responsa} pts</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Badges</span>
                  <span className="text-sm font-black text-amber-600">{top3[1].badgesCount} 🏅</span>
                </div>
              </div>

              {/* Badges preview */}
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {(top3[1].badges || []).slice(0, 3).map(bId => {
                  const b = getBadgeDetails(bId);
                  return (
                    <span key={bId} title={`${b.name}: ${b.description}`} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-md shadow-2xs">
                      {b.icon}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 text-[10px] font-black uppercase text-gray-400 group-hover:text-[#2D2A26] flex items-center gap-1 transition">
                <span>Ver Portfólio</span>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* 1º Lugar - Ouro (Elevado) */}
            <div 
              onClick={() => handleArtistClick(top3[0].id)}
              className="order-1 md:order-2 bg-white p-7 rounded-[3rem] border-4 border-[#FFB800] shadow-2xl hover:scale-102 transition-all cursor-pointer group flex flex-col items-center text-center relative -translate-y-2 md:-translate-y-4"
            >
              <div className="absolute -top-5 bg-[#FFB800] text-[#2D2A26] font-black text-xs px-4 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-bounce">
                👑 1º Lugar • Mestre
              </div>

              <div className="relative mt-2 mb-3">
                <img 
                  src={top3[0].avatar} 
                  alt={top3[0].name} 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#FFB800] shadow-xl group-hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#2D2A26] text-[#FFB800] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                  #1
                </span>
              </div>

              <h4 className="font-black text-lg text-[#2D2A26] group-hover:text-amber-600 transition">
                {top3[0].name}
              </h4>
              <span className="text-[9px] font-black uppercase bg-[#2D2A26] text-[#FFB800] px-3 py-1 rounded-full mt-1">
                {top3[0].level}
              </span>

              {/* Stats pill */}
              <div className="mt-4 w-full grid grid-cols-2 gap-2 bg-[#FFB800]/10 p-3 rounded-2xl border border-[#FFB800]/30">
                <div>
                  <span className="text-[9px] font-black text-amber-800 uppercase block">Responsa</span>
                  <span className="text-base font-black text-[#2D2A26]">{top3[0].responsa} pts</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-amber-800 uppercase block">Badges</span>
                  <span className="text-base font-black text-amber-600">{top3[0].badgesCount} 👑</span>
                </div>
              </div>

              {/* Badges preview */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {(top3[0].badges || []).map(bId => {
                  const b = getBadgeDetails(bId);
                  return (
                    <span 
                      key={bId} 
                      title={`${b.name}: ${b.description}`} 
                      className="text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs font-bold text-amber-900"
                    >
                      {b.icon} {b.name}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 text-[11px] font-black uppercase text-amber-600 group-hover:text-[#2D2A26] flex items-center gap-1 transition">
                <span>Ver Portfólio de Ouro</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* 3º Lugar - Bronze */}
            <div 
              onClick={() => handleArtistClick(top3[2].id)}
              className="order-3 bg-white p-6 rounded-[2.5rem] border-2 border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center relative"
            >
              <div className="absolute -top-4 bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full shadow border-2 border-white flex items-center gap-1">
                🥉 3º Lugar
              </div>

              <div className="relative mt-2 mb-3">
                <img 
                  src={top3[2].avatar} 
                  alt={top3[2].name} 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-4 border-amber-300 shadow-md group-hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  #{3}
                </span>
              </div>

              <h4 className="font-black text-base text-[#2D2A26] group-hover:text-amber-600 transition">
                {top3[2].name}
              </h4>
              <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full mt-1">
                {top3[2].level}
              </span>

              {/* Stats pill */}
              <div className="mt-4 w-full grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Responsa</span>
                  <span className="text-sm font-black text-[#2D2A26]">{top3[2].responsa} pts</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Badges</span>
                  <span className="text-sm font-black text-amber-700">{top3[2].badgesCount} 🏅</span>
                </div>
              </div>

              {/* Badges preview */}
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {(top3[2].badges || []).slice(0, 3).map(bId => {
                  const b = getBadgeDetails(bId);
                  return (
                    <span key={bId} title={`${b.name}: ${b.description}`} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-md shadow-2xs">
                      {b.icon}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 text-[10px] font-black uppercase text-gray-400 group-hover:text-[#2D2A26] flex items-center gap-1 transition">
                <span>Ver Portfólio</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard Table / Detailed List */}
      <section className="bg-white p-6 sm:p-8 rounded-[3rem] border border-gray-100 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Tabela Completa de Classificação
            </h3>
            <p className="text-xs text-gray-400 font-bold">
              Artistas e ativistas visuais de Palmas ranqueados por mérito comunitário
            </p>
          </div>
          <div className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {rankedArtists.length} Artistas
          </div>
        </div>

        <div className="space-y-3">
          {rankedArtists.map((artist, index) => {
            const isCurrentUser = currentUser?.id === artist.id;
            const rank = index + 1;
            const responsaPercent = Math.min(100, Math.round((artist.responsa / maxResponsa) * 100));

            return (
              <div
                key={artist.id}
                onClick={() => handleArtistClick(artist.id)}
                className={`p-4 sm:p-5 rounded-[2rem] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isCurrentUser
                    ? 'border-[#FFB800] bg-[#FFB800]/5 shadow-md'
                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/70 hover:shadow-md'
                }`}
              >
                {/* Left info */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Position number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    rank === 1 ? 'bg-[#FFB800] text-[#2D2A26] shadow-sm' :
                    rank === 2 ? 'bg-gray-200 text-gray-700' :
                    rank === 3 ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  {/* Avatar */}
                  <img 
                    src={artist.avatar} 
                    alt={artist.name} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition"
                  />

                  {/* Name, bio, level */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-[#2D2A26] group-hover:text-amber-600 transition truncate">
                        {artist.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[8px] font-black uppercase bg-[#2D2A26] text-[#FFB800] px-2 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                      <span className="text-[8px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {artist.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate max-w-sm font-medium mt-0.5">
                      {artist.bio}
                    </p>
                  </div>
                </div>

                {/* Right stats and badges */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pl-11 sm:pl-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  {/* Responsa Meter */}
                  <div className="text-right sm:w-28">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      <ShieldCheck size={12} className="text-amber-600" />
                      <span className="text-xs font-black text-[#2D2A26]">
                        {artist.responsa} <span className="text-[9px] text-gray-400 font-bold uppercase">pts</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#FFB800] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${responsaPercent}%` }} 
                      />
                    </div>
                  </div>

                  {/* Badges won */}
                  <div className="flex items-center gap-1">
                    {artist.badges.map(bId => {
                      const b = getBadgeDetails(bId);
                      return (
                        <div 
                          key={bId}
                          title={`${b.name}: ${b.description}`}
                          className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-[#FFB800]/20 flex items-center justify-center text-xs transition shadow-2xs cursor-help"
                        >
                          {b.icon}
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Works */}
                  <div className="hidden md:flex flex-col items-center w-14 text-center">
                    <span className="text-xs font-black text-[#2D2A26]">{artist.totalWorks}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Obras</span>
                  </div>

                  {/* View Action */}
                  <div className="text-gray-300 group-hover:text-[#2D2A26] transition">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guide: How to Earn Responsa and Badges */}
      <section className="bg-[#2D2A26] text-white p-7 sm:p-9 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-2 text-[#FFB800]">
            <Award size={20} />
            <h3 className="text-xl font-black uppercase tracking-tight">
              Como Conquistar Responsa e Badges em Palmas
            </h3>
          </div>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            A Responsa na UPMM não se compra: é conquistada pela contribuição comunitária para a preservação e valorização da arte urbana e da memória visual periférica de Palmas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-2xl block">📸</span>
              <h5 className="font-bold text-xs text-[#FFB800]">Primeiro Click</h5>
              <p className="text-[10px] text-gray-300 leading-normal">
                Suba fotos reais de muros e paisagens urbanas de Palmas (+15 Responsa).
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-2xl block">🧪</span>
              <h5 className="font-bold text-[#FFB800] text-xs">Alquimista</h5>
              <p className="text-[10px] text-gray-300 leading-normal">
                Remixe obras no editor mantendo os créditos e a linhagem original (+10 Responsa).
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-2xl block">🤝</span>
              <h5 className="font-bold text-[#FFB800] text-xs">Voz da Quebrada</h5>
              <p className="text-[10px] text-gray-300 leading-normal">
                Deixe comentários construtivos e apoie outros artistas nas obras (+3 Responsa por comentário).
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-2xl block">📍</span>
              <h5 className="font-bold text-[#FFB800] text-xs">Mapeador de Muros</h5>
              <p className="text-[10px] text-gray-300 leading-normal">
                Mapeie ou comente em muros autorizados e sugeridos no Mapa da Visão (+20 Responsa).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
