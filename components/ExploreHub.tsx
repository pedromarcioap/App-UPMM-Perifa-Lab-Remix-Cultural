import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, 
  Flame, 
  Trophy, 
  Sword, 
  Crown, 
  Sparkles, 
  ArrowRight,
  Compass
} from 'lucide-react';
import { PhotoBase, GraffitiSpot, WeeklyChallenge, User, Comment } from '../types';
import { PalmasRealMap } from './PalmasRealMap';
import { WeeklyChallenges } from './WeeklyChallenges';
import { BattleRanking } from './BattleRanking';
import { RemixPodium } from './RemixPodium';

export interface ExploreHubProps {
  photos: PhotoBase[];
  graffitiSpots: GraffitiSpot[];
  challenges: WeeklyChallenge[];
  users: User[];
  currentUser: User | null;
  comments: Comment[];
  onRequireLogin: (reason?: string) => void;
  onLike: (photoId: string) => void;
  onShare: (photo: PhotoBase) => void;
  onOpenComments: (target: any) => void;
  onAddSpot: (spot: GraffitiSpot) => void;
  onVoteBattle: (winnerId: string, loserId: string) => void;
  onOpenUploadForChallenge: (challenge: WeeklyChallenge) => void;
  isAdmin: boolean;
  VibeBattleComponent?: React.ComponentType<{
    photos: PhotoBase[];
    onVoteBattle: (winnerId: string, loserId: string) => void;
    onRequireLogin: (reason?: string) => void;
    currentUser: User | null;
  }>;
}

export type ExploreTab = 'challenges' | 'map' | 'ranking' | 'podium' | 'battle';

export const ExploreHub: React.FC<ExploreHubProps> = ({
  photos,
  graffitiSpots,
  challenges,
  users,
  currentUser,
  comments,
  onRequireLogin,
  onLike,
  onShare,
  onOpenComments,
  onAddSpot,
  onVoteBattle,
  onOpenUploadForChallenge,
  isAdmin,
  VibeBattleComponent
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromQuery = searchParams.get('tab') as ExploreTab | null;
  const [activeTab, setActiveTab] = useState<ExploreTab>(tabFromQuery || 'challenges');

  useEffect(() => {
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const activeChallengeCount = challenges.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header com Navegação Consolidada de 1 Toque */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-[2.5rem] p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-[#18181B] flex items-center justify-center font-black shadow-lg">
              <Compass size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-full border border-[#FACC15]/20">
                  Explorar Palmas
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase">
                  Território & Batalha
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                Cena Urbana & Murais
              </h2>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 self-start sm:self-auto">
            <span className="bg-[#27272A] text-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-1.5">
              <Flame size={14} className="text-[#FF5722]" />
              <span>{activeChallengeCount} Desafio{activeChallengeCount === 1 ? '' : 's'} Ativo{activeChallengeCount === 1 ? '' : 's'}</span>
            </span>
            <span className="bg-[#27272A] text-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-1.5">
              <MapIcon size={14} className="text-[#FACC15]" />
              <span>{graffitiSpots.length} Pontos de Arte</span>
            </span>
          </div>
        </div>

        {/* 4 Abas Principais em Barra Deslizante com Touch Targets de 48px */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('challenges')}
            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white shadow-lg scale-102 ring-2 ring-[#FF5722]/30'
                : 'bg-[#27272A] text-zinc-400 hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <Flame size={16} />
            <span>Desafios da Semana</span>
            {activeChallengeCount > 0 && (
              <span className="bg-black/30 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {activeChallengeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('map')}
            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#FACC15] text-[#18181B] shadow-lg scale-102 ring-2 ring-[#FACC15]/30'
                : 'bg-[#27272A] text-zinc-400 hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <MapIcon size={16} />
            <span>Mapa da Visão (GPS)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('ranking')}
            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'ranking'
                ? 'bg-[#FACC15] text-[#18181B] shadow-lg scale-102 ring-2 ring-[#FACC15]/30'
                : 'bg-[#27272A] text-zinc-400 hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <Trophy size={16} />
            <span>Ranking Geral</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('podium')}
            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'podium'
                ? 'bg-gradient-to-r from-amber-400 to-[#FACC15] text-[#18181B] shadow-lg scale-102 ring-2 ring-[#FACC15]/30'
                : 'bg-[#27272A] text-zinc-400 hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <Crown size={16} />
            <span>Pódium de Remixes</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('battle')}
            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'battle'
                ? 'bg-red-600 text-white shadow-lg scale-102 ring-2 ring-red-500/30'
                : 'bg-[#27272A] text-zinc-400 hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <Sword size={16} />
            <span>Arena 1v1</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico da Aba Selecionada */}
      <div>
        {activeTab === 'challenges' && (
          <WeeklyChallenges
            challenges={challenges}
            photos={photos}
            currentUser={currentUser}
            onRequireLogin={onRequireLogin}
            onOpenUploadForChallenge={onOpenUploadForChallenge}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'map' && (
          <PalmasRealMap
            photos={photos}
            graffitiSpots={graffitiSpots}
            currentUser={currentUser}
            onSelectPhoto={() => {}}
            onOpenGraffitiModal={() => {}}
            isMarkingMode={false}
            setIsMarkingMode={() => {}}
            onRequireLogin={onRequireLogin}
            comments={comments}
            onOpenComments={(targetId, targetType) => onOpenComments({ targetId, targetType, title: 'Ponto no Mapa' })}
          />
        )}

        {activeTab === 'ranking' && (
          <BattleRanking
            photos={photos}
            users={users}
            currentUser={currentUser}
            comments={comments}
            onOpenComments={(photo) => onOpenComments(photo)}
            onRequireLogin={onRequireLogin}
            initialTab="all"
          />
        )}

        {activeTab === 'podium' && (
          <RemixPodium
            photos={photos}
            users={users}
            currentUser={currentUser}
            comments={comments}
            onRequireLogin={onRequireLogin}
            onOpenComments={(photo) => onOpenComments(photo)}
          />
        )}

        {activeTab === 'battle' && VibeBattleComponent && (
          <VibeBattleComponent
            photos={photos}
            onVoteBattle={onVoteBattle}
            onRequireLogin={onRequireLogin}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};
