import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Sparkles } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[110] bg-[#FF5722] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
      <WifiOff size={14} className="animate-pulse" />
      <span>Modo Offline — Navegando com cache local do PWA</span>
    </div>
  );
};
