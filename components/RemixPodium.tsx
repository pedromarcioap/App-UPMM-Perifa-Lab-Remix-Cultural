import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Flame, 
  Sword, 
  Sparkles, 
  Paintbrush, 
  GitFork, 
  ArrowRight, 
  Layers, 
  Search, 
  Filter, 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  Zap, 
  Eye, 
  Split, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  User as UserIcon,
  ChevronRight,
  SlidersHorizontal,
  Share2,
  Camera
} from 'lucide-react';
import { PhotoBase, User, Comment } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export interface RemixPodiumProps {
  photos: PhotoBase[];
  users: User[];
  currentUser: User | null;
  comments: Comment[];
  onOpenComments: (photo: PhotoBase) => void;
  onRequireLogin: () => void;
}

type SortMetric = 'wins' | 'vibes' | 'winRate' | 'streak' | 'overall';

export const RemixPodium: React.FC<RemixPodiumProps> = ({
  photos = [],
  users = [],
  currentUser = null,
  comments = [],
  onOpenComments,
  onRequireLogin
}) => {
  const navigate = useNavigate();

  // Estados de controle e filtros
  const [sortMetric, setSortMetric] = useState<SortMetric>('wins');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [comparisonRemix, setComparisonRemix] = useState<PhotoBase | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side'>('slider');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Filtra apenas fotos do tipo 'remix' e processa métricas calculadas
  const processedRemixes = useMemo(() => {
    const remixesOnly = (photos || []).filter(p => p.type === 'remix');

    return remixesOnly.map(remix => {
      const wins = remix.battleWins || 0;
      const losses = remix.battleLosses || 0;
      const totalDuels = wins + losses;
      const winRate = totalDuels > 0 ? (wins / totalDuels) * 100 : 0;
      const streak = remix.battleStreak || 0;
      const vibes = remix.vibeCount || 0;
      const commentCount = comments.filter(c => c.targetId === remix.id).length;

      // Base original photo reference
      const basePhoto = photos.find(p => p.id === remix.originalPhotoId);

      // Remixer user profile
      const author = users.find(u => u.id === remix.userId);

      // Overall composite score for remix impact
      const overallScore = Math.round((vibes * 1.2) + (wins * 15) + (streak * 10) + (winRate * 0.5));

      return {
        ...remix,
        wins,
        losses,
        totalDuels,
        winRate,
        streak,
        vibes,
        commentCount,
        basePhoto,
        author,
        overallScore
      };
    });
  }, [photos, comments, users]);

  // Lista de bairros disponíveis nos remixes
  const availableNeighborhoods = useMemo(() => {
    const list = new Set<string>();
    processedRemixes.forEach(r => {
      if (r.location?.neighborhood) {
        list.add(r.location.neighborhood);
      }
    });
    return Array.from(list).sort();
  }, [processedRemixes]);

  // Filtragem e ordenação dos remixes
  const filteredRemixes = useMemo(() => {
    let list = [...processedRemixes];

    // Filtro por Bairro
    if (selectedNeighborhood !== 'all') {
      list = list.filter(r => r.location?.neighborhood === selectedNeighborhood);
    }

    // Busca textual por título, autor do remix, autor da foto base ou tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        (r.basePhoto && r.basePhoto.authorName.toLowerCase().includes(q)) ||
        (r.location?.neighborhood && r.location.neighborhood.toLowerCase().includes(q)) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Ordenação de acordo com a métrica selecionada
    return list.sort((a, b) => {
      if (sortMetric === 'wins') {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.vibes - a.vibes;
      }
      if (sortMetric === 'vibes') {
        if (b.vibes !== a.vibes) return b.vibes - a.vibes;
        return b.wins - a.wins;
      }
      if (sortMetric === 'winRate') {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      }
      if (sortMetric === 'streak') {
        if (b.streak !== a.streak) return b.streak - a.streak;
        return b.wins - a.wins;
      }
      if (sortMetric === 'overall') {
        return b.overallScore - a.overallScore;
      }
      return 0;
    });
  }, [processedRemixes, selectedNeighborhood, searchQuery, sortMetric]);

  // Top 3 para o Pódium e Lista do 4º lugar em diante
  const podiumTop3 = (filteredRemixes || []).slice(0, 3);
  const remainingRemixes = (filteredRemixes || []).slice(3);

  // Estatísticas gerais do ecossistema de remixes
  const stats = useMemo(() => {
    const total = processedRemixes.length;
    const totalWins = processedRemixes.reduce((acc, r) => acc + r.wins, 0);
    const totalVibes = processedRemixes.reduce((acc, r) => acc + r.vibes, 0);
    const topVibed = [...processedRemixes].sort((a, b) => b.vibes - a.vibes)[0];
    const topWinner = [...processedRemixes].sort((a, b) => b.wins - a.wins)[0];

    return {
      total,
      totalWins,
      totalVibes,
      topVibed,
      topWinner
    };
  }, [processedRemixes]);

  // Ação de compartilhar
  const handleShareRemix = (remix: PhotoBase, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/lineage/${remix.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShareId(remix.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Banner Principal do Pódium de Remixes */}
      <div className="relative bg-gradient-to-br from-[#2D2A26] via-[#1F1D1A] to-[#121110] text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/10 overflow-hidden">
        {/* Elementos decorativos urbanos de fundo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB800] text-[#2D2A26] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Crown size={12} />
                <span>Hall da Fama Periférico</span>
              </span>
              <span className="bg-white/10 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                {stats.total} Remixes Cadastrados
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span>Pódium de Remixes</span>
              <Trophy size={32} className="text-[#FFB800] shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
              As intervenções visuais mais aclamadas da quebrada tocantinense. Obras que transformaram registros de rua em arte viva com stickers, tags e loops na arena comunitária.
            </p>
          </div>

          {/* CTA de Criação de Remix */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/ranking"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase transition text-center flex items-center justify-center gap-2 border border-white/10"
            >
              <Sword size={16} />
              <span>Ranking Geral</span>
            </Link>
            <Link
              to="/"
              className="px-5 py-3 bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] rounded-2xl text-xs font-black uppercase transition shadow-lg text-center flex items-center justify-center gap-2 transform hover:scale-105"
            >
              <Paintbrush size={16} />
              <span>Criar Meu Remix</span>
            </Link>
          </div>
        </div>

        {/* Métricas Rápidas no Rodapé do Banner */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
              <Paintbrush size={11} className="text-[#FFB800]" />
              Total de Remixes
            </span>
            <span className="text-lg font-black text-white mt-0.5 block">{stats.total}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
              <Sword size={11} className="text-[#FF5722]" />
              Vitórias em Duelo
            </span>
            <span className="text-lg font-black text-white mt-0.5 block">{stats.totalWins}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
              <Flame size={11} className="text-amber-400" />
              Vibes Distribuídas
            </span>
            <span className="text-lg font-black text-white mt-0.5 block">{stats.totalVibes}</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
              <Crown size={11} className="text-[#FFB800]" />
              Líder Atual
            </span>
            <span className="text-xs font-black text-amber-300 mt-1 block truncate">
              {stats.topWinner ? `@${stats.topWinner.authorName}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Ordenação */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Barra de Busca */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar remix, artista ou obra base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FFB800]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Seletores de Critério e Bairro */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Bairro */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5 text-xs">
            <MapPin size={14} className="text-[#FFB800]" />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-transparent font-bold text-[#2D2A26] focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Bairros de Palmas</option>
              {availableNeighborhoods.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Métrica de Ordenação */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5 text-xs">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value as SortMetric)}
              className="bg-transparent font-bold text-[#2D2A26] focus:outline-none cursor-pointer"
            >
              <option value="wins">🏆 Mais Vitórias em Duelo</option>
              <option value="vibes">🔥 Mais Vibes da Quebrada</option>
              <option value="winRate">🎯 Maior Win Rate %</option>
              <option value="streak">⚡ Maior Sequência (Streak)</option>
              <option value="overall">👑 Pontuação Geral Composta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção Principal do Pódium dos 3 Primeiros Colocados */}
      {podiumTop3.length > 0 ? (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#2D2A26] flex items-center justify-center gap-2">
              <Trophy size={20} className="text-[#FFB800]" />
              <span>O Pódium dos Mestres</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Os 3 remixes no topo da classificação de {sortMetric === 'wins' ? 'vitórias na arena' : sortMetric === 'vibes' ? 'vibes' : 'desempenho'}.
            </p>
          </div>

          {/* Estrutura do Pódium com Pedestais (Ordem Visual: 2º Lugar na esquerda, 1º Lugar no Centro elevado, 3º Lugar na direita) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 sm:pt-8">
            {/* 2º LUGAR (PRATA) - ESQUERDA */}
            {podiumTop3[1] ? (
              <div className="order-2 md:order-1 flex flex-col items-center">
                {/* Card da Obra */}
                <div className="w-full bg-white rounded-[2.5rem] p-5 shadow-xl border-2 border-slate-200 hover:border-slate-400 transition-all hover:shadow-2xl flex flex-col justify-between group">
                  <div>
                    {/* Badge do 2º Lugar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <Medal size={13} className="text-slate-600" />
                        <span>2º Lugar • Prata</span>
                      </span>
                      <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {podiumTop3[1].wins} Vitórias
                      </span>
                    </div>

                    {/* Imagem do Remix */}
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3] bg-gray-100 shadow-inner group">
                      <img
                        src={podiumTop3[1].imageUrl}
                        alt={podiumTop3[1].title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      {/* Botão de Comparação Rápida */}
                      <button
                        onClick={() => setComparisonRemix(podiumTop3[1])}
                        className="absolute bottom-2.5 right-2.5 bg-black/80 hover:bg-[#FFB800] hover:text-[#2D2A26] text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1 transition shadow-lg cursor-pointer"
                        title="Comparar com a foto base original"
                      >
                        <Split size={12} />
                        <span>Antes / Depois</span>
                      </button>
                    </div>

                    {/* Informações da Obra & Remixer */}
                    <h3 className="font-black text-base uppercase tracking-tight text-[#2D2A26] truncate">
                      {podiumTop3[1].title}
                    </h3>

                    {/* Remixer */}
                    <div 
                      onClick={() => navigate(`/profile/${podiumTop3[1].userId}`)}
                      className="flex items-center gap-2 mt-2 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <img
                        src={podiumTop3[1].author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                        alt={podiumTop3[1].authorName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-800 truncate">@{podiumTop3[1].authorName}</p>
                        <p className="text-[9px] text-gray-400 font-bold truncate">
                          {podiumTop3[1].location?.neighborhood || 'Palmas, TO'}
                        </p>
                      </div>
                    </div>

                    {/* Referência da Foto Base */}
                    {podiumTop3[1].basePhoto && (
                      <div className="mt-2 text-[9px] bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between text-gray-500">
                        <span className="truncate">Base: <strong>@{podiumTop3[1].basePhoto.authorName}</strong></span>
                        <Link 
                          to={`/lineage/${podiumTop3[1].id}`}
                          className="text-[#FF5722] font-black hover:underline flex items-center gap-0.5 shrink-0 ml-1"
                        >
                          <GitFork size={10} />
                          <span>Linhagem</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Estatísticas e Ações */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Vibes</span>
                        <span className="text-xs font-black text-[#2D2A26] flex items-center justify-center gap-0.5">
                          <Flame size={10} className="text-amber-500" />
                          {podiumTop3[1].vibes}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Win Rate</span>
                        <span className="text-xs font-black text-slate-700">
                          {podiumTop3[1].winRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Streak</span>
                        <span className="text-xs font-black text-[#FF5722]">
                          ⚡{podiumTop3[1].streak}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/remix/${podiumTop3[1].id}`)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5"
                      >
                        <Paintbrush size={12} />
                        <span>Remixar</span>
                      </button>
                      <button
                        onClick={() => onOpenComments(podiumTop3[1])}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                        title="Ver Comentários"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={(e) => handleShareRemix(podiumTop3[1], e)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                        title="Compartilhar Link"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pedestal Prata (Média Altura) */}
                <div className="hidden md:flex w-full bg-gradient-to-b from-slate-200 to-slate-300 rounded-t-3xl h-24 mt-3 flex-col items-center justify-center border-t-4 border-slate-400 shadow-md">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg shadow-inner">
                    2
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider mt-1">
                    Prata
                  </span>
                </div>
              </div>
            ) : <div className="order-2 md:order-1" />}

            {/* 1º LUGAR (OURO) - CENTRO & MAIS ELEVADO */}
            {podiumTop3[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center -mt-0 md:-mt-6">
                {/* Card Dourado de Destaque Máximo */}
                <div className="w-full bg-gradient-to-b from-[#2D2A26] to-[#1a1816] text-white rounded-[2.5rem] p-6 shadow-2xl border-4 border-[#FFB800] ring-4 ring-[#FFB800]/20 flex flex-col justify-between group relative overflow-hidden">
                  {/* Efeito luminoso de topo */}
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#FFB800]/20 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Badge de Campeão Supremo */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="bg-[#FFB800] text-[#2D2A26] text-xs font-black uppercase px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                        <Crown size={15} />
                        <span>1º Lugar • Ouro Absoluto</span>
                      </span>
                      <span className="text-[10px] font-black text-[#FFB800] bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                        <Trophy size={12} />
                        <span>{podiumTop3[0].wins} Vitórias</span>
                      </span>
                    </div>

                    {/* Imagem do Remix Principal com Moldura de Ouro */}
                    <div className="relative rounded-2xl overflow-hidden mb-3.5 aspect-[4/3] bg-black/40 border border-[#FFB800]/40 shadow-2xl group">
                      <img
                        src={podiumTop3[0].imageUrl}
                        alt={podiumTop3[0].title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      {/* Selo Flutuante Rei do Remix */}
                      <div className="absolute top-3 left-3 bg-[#FFB800] text-[#2D2A26] text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                        <Sparkles size={11} />
                        <span>Líder da Quebrada</span>
                      </div>

                      {/* Botão de Comparação Rápida */}
                      <button
                        onClick={() => setComparisonRemix(podiumTop3[0])}
                        className="absolute bottom-3 right-3 bg-black/85 hover:bg-[#FFB800] hover:text-[#2D2A26] text-white text-[9.5px] font-black uppercase px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 transition shadow-xl cursor-pointer"
                        title="Comparar com a foto base original"
                      >
                        <Split size={13} />
                        <span>Antes / Depois</span>
                      </button>
                    </div>

                    {/* Título e Remixer */}
                    <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight text-white truncate">
                      {podiumTop3[0].title}
                    </h3>

                    {/* Autor do Remix */}
                    <div 
                      onClick={() => navigate(`/profile/${podiumTop3[0].userId}`)}
                      className="flex items-center gap-3 mt-2.5 p-2 rounded-2xl hover:bg-white/5 transition cursor-pointer"
                    >
                      <img
                        src={podiumTop3[0].author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                        alt={podiumTop3[0].authorName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#FFB800] shadow-md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-white truncate">@{podiumTop3[0].authorName}</p>
                          <CheckCircle2 size={13} className="text-[#FFB800]" />
                        </div>
                        <p className="text-[10px] text-amber-200/80 font-bold truncate">
                          {podiumTop3[0].location?.neighborhood || 'Palmas, TO'} • Responsa: {podiumTop3[0].author?.responsa || 100}
                        </p>
                      </div>
                    </div>

                    {/* Foto Base de Origem */}
                    {podiumTop3[0].basePhoto && (
                      <div className="mt-2.5 text-[10px] bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-gray-300">
                        <span className="truncate">Obra original de: <strong className="text-white">@{podiumTop3[0].basePhoto.authorName}</strong></span>
                        <Link 
                          to={`/lineage/${podiumTop3[0].id}`}
                          className="text-[#FFB800] font-black hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                        >
                          <GitFork size={12} />
                          <span>Ver Linhagem</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Estatísticas e Botões de Ação */}
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/10 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Vibes</span>
                        <span className="text-sm font-black text-[#FFB800] flex items-center justify-center gap-1">
                          <Flame size={12} className="text-[#FFB800]" />
                          {podiumTop3[0].vibes}
                        </span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Win Rate</span>
                        <span className="text-sm font-black text-emerald-400">
                          {podiumTop3[0].winRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Sequência</span>
                        <span className="text-sm font-black text-[#FF5722]">
                          ⚡{podiumTop3[0].streak}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/remix/${podiumTop3[0].id}`)}
                        className="flex-1 py-2.5 bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Paintbrush size={14} />
                        <span>Remixar Este Campeão</span>
                      </button>
                      <button
                        onClick={() => onOpenComments(podiumTop3[0])}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                        title="Ver Comentários"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={(e) => handleShareRemix(podiumTop3[0], e)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                        title="Compartilhar Link"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pedestal Ouro (Mais Alto) */}
                <div className="hidden md:flex w-full bg-gradient-to-b from-[#FFB800] to-amber-600 rounded-t-3xl h-36 mt-3 flex-col items-center justify-center border-t-4 border-amber-300 shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-white text-[#2D2A26] flex items-center justify-center font-black text-xl shadow-lg border-2 border-amber-400">
                    1
                  </div>
                  <span className="text-xs font-black uppercase text-[#2D2A26] tracking-wider mt-1 flex items-center gap-1">
                    <Crown size={12} />
                    <span>Ouro</span>
                  </span>
                </div>
              </div>
            )}

            {/* 3º LUGAR (BRONZE) - DIREITA */}
            {podiumTop3[2] ? (
              <div className="order-3 md:order-3 flex flex-col items-center">
                {/* Card da Obra */}
                <div className="w-full bg-white rounded-[2.5rem] p-5 shadow-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-2xl flex flex-col justify-between group">
                  <div>
                    {/* Badge do 3º Lugar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <Award size={13} className="text-amber-700" />
                        <span>3º Lugar • Bronze</span>
                      </span>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        {podiumTop3[2].wins} Vitórias
                      </span>
                    </div>

                    {/* Imagem do Remix */}
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3] bg-gray-100 shadow-inner group">
                      <img
                        src={podiumTop3[2].imageUrl}
                        alt={podiumTop3[2].title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      {/* Botão de Comparação Rápida */}
                      <button
                        onClick={() => setComparisonRemix(podiumTop3[2])}
                        className="absolute bottom-2.5 right-2.5 bg-black/80 hover:bg-[#FFB800] hover:text-[#2D2A26] text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1 transition shadow-lg cursor-pointer"
                        title="Comparar com a foto base original"
                      >
                        <Split size={12} />
                        <span>Antes / Depois</span>
                      </button>
                    </div>

                    {/* Informações da Obra & Remixer */}
                    <h3 className="font-black text-base uppercase tracking-tight text-[#2D2A26] truncate">
                      {podiumTop3[2].title}
                    </h3>

                    {/* Remixer */}
                    <div 
                      onClick={() => navigate(`/profile/${podiumTop3[2].userId}`)}
                      className="flex items-center gap-2 mt-2 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      <img
                        src={podiumTop3[2].author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                        alt={podiumTop3[2].authorName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-amber-300"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-800 truncate">@{podiumTop3[2].authorName}</p>
                        <p className="text-[9px] text-gray-400 font-bold truncate">
                          {podiumTop3[2].location?.neighborhood || 'Palmas, TO'}
                        </p>
                      </div>
                    </div>

                    {/* Referência da Foto Base */}
                    {podiumTop3[2].basePhoto && (
                      <div className="mt-2 text-[9px] bg-amber-50/50 border border-amber-100 rounded-xl p-2 flex items-center justify-between text-gray-500">
                        <span className="truncate">Base: <strong>@{podiumTop3[2].basePhoto.authorName}</strong></span>
                        <Link 
                          to={`/lineage/${podiumTop3[2].id}`}
                          className="text-[#FF5722] font-black hover:underline flex items-center gap-0.5 shrink-0 ml-1"
                        >
                          <GitFork size={10} />
                          <span>Linhagem</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Estatísticas e Ações */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Vibes</span>
                        <span className="text-xs font-black text-[#2D2A26] flex items-center justify-center gap-0.5">
                          <Flame size={10} className="text-amber-500" />
                          {podiumTop3[2].vibes}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Win Rate</span>
                        <span className="text-xs font-black text-amber-800">
                          {podiumTop3[2].winRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-xl">
                        <span className="text-[8px] font-bold text-gray-400 block uppercase">Streak</span>
                        <span className="text-xs font-black text-[#FF5722]">
                          ⚡{podiumTop3[2].streak}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/remix/${podiumTop3[2].id}`)}
                        className="flex-1 py-2 bg-[#2D2A26] hover:bg-black text-[#FFB800] rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-1.5"
                      >
                        <Paintbrush size={12} />
                        <span>Remixar</span>
                      </button>
                      <button
                        onClick={() => onOpenComments(podiumTop3[2])}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                        title="Ver Comentários"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={(e) => handleShareRemix(podiumTop3[2], e)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                        title="Compartilhar Link"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pedestal Bronze (Mais Baixo) */}
                <div className="hidden md:flex w-full bg-gradient-to-b from-amber-200 to-amber-300 rounded-t-3xl h-16 mt-3 flex-col items-center justify-center border-t-4 border-amber-400 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-base shadow-inner">
                    3
                  </div>
                  <span className="text-[9px] font-black uppercase text-amber-900 tracking-wider mt-0.5">
                    Bronze
                  </span>
                </div>
              </div>
            ) : <div className="order-3 md:order-3" />}
          </div>
        </div>
      ) : (
        /* Estado Vazio */
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-[#FFB800] flex items-center justify-center mx-auto">
            <Trophy size={32} />
          </div>
          <h3 className="text-base font-black uppercase text-[#2D2A26]">Nenhum Remix Encontrado</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Não encontramos remixes com os filtros selecionados. Tente selecionar outro bairro ou limpar os termos da busca.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedNeighborhood('all'); }}
            className="px-5 py-2.5 bg-[#2D2A26] text-[#FFB800] rounded-xl text-xs font-black uppercase hover:bg-black transition"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Lista de Remixes do 4º Lugar em Diante */}
      {remainingRemixes.length > 0 && (
        <div className="bg-[#1C1B19] rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-[#3E3A35] space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
                <Layers size={18} className="text-[#FFB800]" />
                <span>Classificação dos Remixes (#4 ao #{filteredRemixes.length})</span>
              </h3>
              <p className="text-xs text-[#EDE8E1]/70 font-medium">
                Obras de intervenção disputando espaço no Pódium.
              </p>
            </div>
            <span className="text-xs font-bold text-[#FFB800] bg-[#242220] border border-[#3E3A35] px-3 py-1 rounded-full">
              {remainingRemixes.length} obras
            </span>
          </div>

          <div className="divide-y divide-[#3E3A35]/60">
            {remainingRemixes.map((remix, index) => {
              const position = index + 4;
              return (
                <div
                  key={remix.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#242220]/60 transition p-2 rounded-2xl"
                >
                  {/* Posição e Miniatura da Obra */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="w-7 text-center font-black text-sm text-[#EDE8E1]/60 shrink-0">
                      #{position}
                    </span>

                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#242220] shrink-0 shadow-sm border border-[#3E3A35]">
                      <img
                        src={remix.imageUrl}
                        alt={remix.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-black text-sm uppercase tracking-tight text-white truncate">
                        {remix.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#EDE8E1]/70">
                        <span 
                          onClick={() => navigate(`/profile/${remix.userId}`)}
                          className="font-bold text-[#FFB800] hover:underline cursor-pointer truncate"
                        >
                          @{remix.authorName}
                        </span>
                        <span>•</span>
                        <span className="truncate">{remix.location?.neighborhood || 'Palmas'}</span>
                      </div>
                      {remix.basePhoto && (
                        <p className="text-[9px] text-[#EDE8E1]/60 mt-0.5 truncate">
                          Base de: <strong className="text-zinc-300">@{remix.basePhoto.authorName}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Métricas e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3E3A35]/50">
                    {/* Estatísticas */}
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-xs font-black text-white block">
                          {remix.wins} Vitórias
                        </span>
                        <span className="text-[9px] text-[#EDE8E1]/60 font-bold uppercase">
                          {remix.winRate.toFixed(0)}% Win Rate
                        </span>
                      </div>

                      <div className="hidden sm:block">
                        <span className="text-xs font-black text-[#FFB800] flex items-center justify-end gap-0.5">
                          <Flame size={11} />
                          {remix.vibes}
                        </span>
                        <span className="text-[9px] text-[#EDE8E1]/60 font-bold uppercase">
                          Vibes
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setComparisonRemix(remix)}
                        className="px-2.5 py-1.5 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-200 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1 cursor-pointer"
                        title="Comparar com foto original"
                      >
                        <Split size={12} />
                        <span className="hidden sm:inline">Comparar</span>
                      </button>

                      <button
                        onClick={() => navigate(`/lineage/${remix.id}`)}
                        className="p-1.5 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-zinc-200 rounded-xl transition cursor-pointer"
                        title="Ver Linhagem"
                      >
                        <GitFork size={14} />
                      </button>

                      <button
                        onClick={() => navigate(`/remix/${remix.id}`)}
                        className="px-3 py-1.5 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1 cursor-pointer"
                        title="Fazer um Remix desta obra"
                      >
                        <Paintbrush size={12} />
                        <span>Remixar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Motivacional: Como Subir no Pódium */}
      <div className="bg-[#1C1B19] border-2 border-[#FFB800]/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-black uppercase text-[#FFB800] bg-amber-500/10 border border-[#FFB800]/30 px-3 py-1 rounded-full tracking-wider inline-flex items-center justify-center md:justify-start gap-1">
            <Sparkles size={12} className="text-[#FFB800]" />
            <span>Guia da Conquista</span>
          </span>
          <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
            Quer Colocar sua Arte no Topo do Pódium?
          </h3>
          <p className="text-xs text-[#EDE8E1] max-w-xl leading-relaxed font-medium">
            Escolha qualquer registro do mural, aplique intervenções visuais no <strong className="text-[#FFB800] font-bold">Estúdio de Remix</strong> usando stickers de rua e loops animados, e entre nas disputas 1v1 da <strong className="text-[#FFB800] font-bold">Arena de Batalha</strong> para acumular vitórias e subir na classificação!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="px-5 py-3 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Camera size={14} />
            <span>Explorar Fotos para Remixar</span>
          </Link>
        </div>
      </div>

      {/* MODAL DE COMPARAÇÃO INTERATIVA ANTES / DEPOIS */}
      {comparisonRemix && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-5 bg-[#2D2A26] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center font-black">
                  <Split size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">
                    Comparativo da Obra • Antes vs. Depois
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold">
                    {comparisonRemix.title} — Remixado por @{comparisonRemix.authorName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Selector */}
                <div className="flex bg-[#1C1B19] p-1 rounded-xl border border-white/10 text-[10px] font-black uppercase">
                  <button
                    type="button"
                    onClick={() => setComparisonMode('slider')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      comparisonMode === 'slider'
                        ? 'bg-[#FFB800] text-[#141311] shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Deslizador
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparisonMode('side')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      comparisonMode === 'side'
                        ? 'bg-[#FFB800] text-[#141311] shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Lado a Lado
                  </button>
                </div>

                <button
                  onClick={() => setComparisonRemix(null)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Visualização Comparativa Lado a Lado ou Slider Interativo */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {comparisonMode === 'slider' ? (
                <BeforeAfterSlider 
                  beforeImage={photos.find(p => p.id === comparisonRemix.originalPhotoId)?.imageUrl || comparisonRemix.imageUrl}
                  afterImage={comparisonRemix.imageUrl}
                  beforeLabel="Muro Original"
                  afterLabel="Remix Vencedor"
                  title={comparisonRemix.title}
                  authorName={photos.find(p => p.id === comparisonRemix.originalPhotoId)?.authorName || 'Fotógrafo Base'}
                  remixerName={comparisonRemix.authorName}
                  neighborhood={comparisonRemix.location?.neighborhood || 'Palmas, TO'}
                  onOpenRemix={() => {
                    const id = comparisonRemix.id;
                    setComparisonRemix(null);
                    navigate(`/remix/${id}`);
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lado Esquerdo: Foto Base Original */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <Camera size={12} />
                        <span>1. Foto Base Original</span>
                      </span>
                      {comparisonRemix.originalPhotoId && (
                        <span className="text-[9px] font-bold text-gray-400">
                          @{photos.find(p => p.id === comparisonRemix.originalPhotoId)?.authorName || 'Autor Original'}
                        </span>
                      )}
                    </div>

                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                      {comparisonRemix.originalPhotoId ? (
                        <img
                          src={photos.find(p => p.id === comparisonRemix.originalPhotoId)?.imageUrl || comparisonRemix.imageUrl}
                          alt="Foto Base"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                          <Camera size={24} className="mb-1" />
                          <span className="text-xs">Registro base inicial</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-2xs">
                        Antes (Base)
                      </span>
                    </div>
                  </div>

                  {/* Lado Direito: Remix com Intervenção */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5722] flex items-center gap-1">
                        <Paintbrush size={12} />
                        <span>2. Remix & Intervenção</span>
                      </span>
                      <span className="text-[9px] font-bold text-[#FFB800] bg-[#2D2A26] px-2 py-0.5 rounded-full">
                        @{comparisonRemix.authorName}
                      </span>
                    </div>

                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border-2 border-[#FFB800] shadow-md">
                      <img
                        src={comparisonRemix.imageUrl}
                        alt={comparisonRemix.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-[#FFB800] text-[#2D2A26] text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                        Depois (Remix no Pódium)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações Complementares da Linhagem */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-black text-[#2D2A26] uppercase">
                    Metamorfose Visual da Quebrada
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Esta obra acumula <strong>{comparisonRemix.battleWins || 0} vitórias</strong> e <strong>{comparisonRemix.vibeCount || 0} vibes</strong> da comunidade em Palmas.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const id = comparisonRemix.id;
                      setComparisonRemix(null);
                      navigate(`/lineage/${id}`);
                    }}
                    className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-[#2D2A26] rounded-xl font-black uppercase text-[10px] transition flex items-center gap-1.5"
                  >
                    <GitFork size={12} />
                    <span>Ver Árvore Completa</span>
                  </button>
                  <button
                    onClick={() => {
                      const id = comparisonRemix.id;
                      setComparisonRemix(null);
                      navigate(`/remix/${id}`);
                    }}
                    className="px-4 py-2 bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] rounded-xl font-black uppercase text-[10px] transition shadow"
                  >
                    Remixar Novamente
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setComparisonRemix(null)}
                className="px-5 py-2 bg-[#2D2A26] text-white rounded-xl text-xs font-black uppercase hover:bg-black transition cursor-pointer"
              >
                Fechar Comparativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemixPodium;
