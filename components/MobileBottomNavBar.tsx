import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sword, User as UserIcon, Plus, Compass } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { User } from '../types';

interface MobileBottomNavBarProps {
  currentUser: User | null;
  unreadRemixCount: number;
  onOpenQuickCreate: () => void;
  onRequireLogin: () => void;
}

export const MobileBottomNavBar: React.FC<MobileBottomNavBarProps> = ({
  currentUser,
  unreadRemixCount,
  onOpenQuickCreate,
  onRequireLogin
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerHaptic } = usePWAInstall();

  const handleTabClick = (path: string) => {
    triggerHaptic(12);
  };

  const isHome = location.pathname === '/';
  const isExplore = location.pathname.startsWith('/explore') || location.pathname === '/map' || location.pathname === '/challenges';
  const isBattle = location.pathname.startsWith('/battle') || location.pathname.startsWith('/ranking') || location.pathname.startsWith('/podium');
  const isProfile = location.pathname.startsWith('/profile');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#141311]/95 backdrop-blur-2xl border-t border-[#3E3A35] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around relative">

        {/* [1] O FLUXO (Home) */}
        <Link
          to="/"
          onClick={() => handleTabClick('/')}
          className={`flex flex-col items-center justify-center w-14 h-12 min-w-[44px] min-h-[44px] rounded-2xl transition cursor-pointer active:scale-90 ${isHome ? 'text-[#FFB800] font-black' : 'text-zinc-400 hover:text-white'
            }`}
        >
          <Home size={20} className={isHome ? 'scale-110 transition' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Fluxo</span>
          {isHome && <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full mt-0.5" />}
        </Link>

        {/* [2] EXPLORAR */}
        <Link
          to="/explore"
          onClick={() => handleTabClick('/explore')}
          className={`flex flex-col items-center justify-center w-14 h-12 min-w-[44px] min-h-[44px] rounded-2xl transition cursor-pointer active:scale-90 ${isExplore ? 'text-[#FFB800] font-black' : 'text-zinc-400 hover:text-white'
            }`}
        >
          <Compass size={20} className={isExplore ? 'scale-110 transition' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Explorar</span>
          {isExplore && <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full mt-0.5" />}
        </Link>

        {/* [3] CENTRAL FAB (CRIAR / NOVO REMIX) */}
        <div className="relative -top-4">
          <button
            onClick={() => {
              triggerHaptic([15, 30, 15]);
              if (!currentUser) {
                onRequireLogin();
              } else {
                onOpenQuickCreate();
              }
            }}
            className="w-14 h-14 min-w-[56px] min-h-[56px] bg-[#FFB800] text-[#141311] rounded-full shadow-2xl flex items-center justify-center border-4 border-[#141311] hover:scale-105 active:scale-90 transition cursor-pointer font-black"
            title="Criar / Subir Visão ou Remix"
            aria-label="Criar Novo Arte/Remix"
          >
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>

        {/* [4] ARENA & BATALHA */}
        <Link
          to="/battle"
          onClick={() => handleTabClick('/battle')}
          className={`flex flex-col items-center justify-center w-14 h-12 min-w-[44px] min-h-[44px] rounded-2xl transition cursor-pointer active:scale-90 ${isBattle ? 'text-[#FFB800] font-black' : 'text-zinc-400 hover:text-white'
            }`}
        >
          <Sword size={20} className={isBattle ? 'scale-110 transition' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Arena</span>
          {isBattle && <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full mt-0.5" />}
        </Link>

        {/* [5] PERFIL / WALLET */}
        <button
          onClick={() => {
            triggerHaptic(12);
            if (currentUser) {
              void navigate(`/profile/${currentUser.id}`);
            } else {
              onRequireLogin();
            }
          }}
          className={`flex flex-col items-center justify-center w-14 h-12 min-w-[44px] min-h-[44px] rounded-2xl transition cursor-pointer active:scale-90 relative ${isProfile ? 'text-[#FFB800] font-black' : 'text-zinc-400 hover:text-white'
            }`}
        >
          <div className="relative">
            <UserIcon size={20} className={isProfile ? 'scale-110 transition' : ''} />
            {unreadRemixCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5722] rounded-full border-2 border-[#141311] animate-pulse" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Perfil</span>
          {isProfile && <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full mt-0.5" />}
        </button>

      </div>
    </nav>
  );
};
