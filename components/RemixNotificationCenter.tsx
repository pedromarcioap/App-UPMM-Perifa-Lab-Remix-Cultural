import React from 'react';
import { 
  Bell, 
  GitBranch, 
  Sparkles, 
  ArrowRight, 
  CheckCheck, 
  Clock, 
  Paintbrush, 
  X, 
  ExternalLink,
  Layers,
  Heart,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RemixNotification } from '../types';

interface RemixNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: RemixNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSimulateRemix?: () => void;
}

export const RemixNotificationModal: React.FC<RemixNotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onSimulateRemix
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white text-[#2D2A26] w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#2D2A26] to-[#1E1C1A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center shadow-lg font-black relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF5722] rounded-full border-2 border-[#2D2A26] animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase tracking-tight">Notificações de Remix</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#FF5722] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {unreadCount} nova{unreadCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-300">
                Sempre que outro artista remixar uma foto original sua, o registro e o link de linhagem aparecem aqui.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="hidden sm:flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-[#FFB800] font-bold px-3 py-1.5 rounded-xl uppercase transition"
                title="Marcar todas as notificações como lidas"
              >
                <CheckCheck size={12} />
                <span>Marcar lidas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Notification List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="w-16 h-16 bg-amber-50 text-[#FFB800] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <GitBranch size={28} />
              </div>
              <h4 className="text-base font-black uppercase text-gray-800">Nenhum remix registrado ainda</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Suas fotos originais registradas em Taquaralto, Aureny e por toda Palmas ainda não receberam releituras. Assim que a comunidade remixar sua arte, você será notificado com acesso direto à linhagem!
              </p>
              {onSimulateRemix && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onSimulateRemix}
                    className="inline-flex items-center gap-1.5 bg-[#FFB800] hover:bg-black hover:text-white text-[#2D2A26] px-4 py-2.5 rounded-2xl font-black text-xs uppercase shadow transition"
                  >
                    <Sparkles size={14} />
                    <span>Simular Remix Comunitário na sua Arte</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {unreadCount > 0 && (
                <div className="sm:hidden flex justify-end">
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[10px] text-gray-600 hover:text-black font-bold uppercase flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    <span>Marcar todas como lidas</span>
                  </button>
                </div>
              )}

              {notifications.map((notif) => (
                <RemixNotificationCard
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={onMarkAsRead}
                  onCloseModal={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
            <GitBranch size={13} className="text-[#FFB800]" />
            <span>Árvore de Linhagem registra o DNA criativo das periferias de Palmas.</span>
          </div>

          <div className="flex items-center gap-2">
            {onSimulateRemix && (
              <button
                type="button"
                onClick={onSimulateRemix}
                className="text-[10px] font-black uppercase text-[#2D2A26] hover:text-[#FF5722] px-2.5 py-1 rounded-lg transition border border-gray-200 hover:bg-gray-100"
                title="Gerar remix simulado para testar em tempo real"
              >
                + Testar Novo Remix
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-[#2D2A26] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RemixNotificationCard: React.FC<{
  notification: RemixNotification;
  onMarkAsRead: (id: string) => void;
  onCloseModal?: () => void;
}> = ({ notification, onMarkAsRead, onCloseModal }) => {
  const timeFormatted = formatTimeAgo(notification.createdAt);

  return (
    <div 
      className={`p-4 rounded-3xl border transition-all ${
        !notification.read 
          ? 'bg-amber-50/70 border-[#FFB800]/50 shadow-sm' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Remixer User Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <img 
              src={notification.remixerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'} 
              alt={notification.remixerName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#FFB800]"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFB800] text-[#2D2A26] rounded-full flex items-center justify-center text-[9px] shadow font-black">
              <Paintbrush size={9} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs uppercase text-gray-900 truncate">
                {notification.remixerName}
              </span>
              {notification.remixerNeighborhood && (
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-bold uppercase truncate">
                  {notification.remixerNeighborhood}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-600 font-medium leading-tight">
              Remixou sua obra base <span className="font-black text-gray-900 underline">"{notification.originalPhotoTitle}"</span>
            </p>
          </div>
        </div>

        {/* Read status & Time */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <Clock size={11} />
            <span>{timeFormatted}</span>
          </span>
          {!notification.read && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-pulse" title="Não lida" />
          )}
        </div>
      </div>

      {/* Visual Artwork Comparison: Original vs Remix */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 bg-white/90 p-2.5 rounded-2xl border border-gray-100">
        {/* Original Base */}
        <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-gray-50 border border-gray-100/80">
          <img 
            src={notification.originalPhotoUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80'} 
            alt={notification.originalPhotoTitle}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
            }}
            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-200"
          />
          <div className="min-w-0">
            <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block">
              Sua Foto Base
            </span>
            <p className="text-[10px] font-bold text-gray-800 truncate">
              {notification.originalPhotoTitle}
            </p>
          </div>
        </div>

        {/* New Remix */}
        <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-amber-50/60 border border-[#FFB800]/30">
          <img 
            src={notification.remixPhotoUrl} 
            alt={notification.remixPhotoTitle}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80';
            }}
            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#FFB800]/50"
          />
          <div className="min-w-0">
            <span className="text-[8px] font-black uppercase tracking-wider text-[#FF5722] block">
              Novo Remix
            </span>
            <p className="text-[10px] font-bold text-gray-900 truncate">
              {notification.remixPhotoTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Action Links: Direct link to Árvore de Linhagem! */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Direct Link to Lineage Tree */}
          <Link
            to={`/lineage/${notification.originalPhotoId}`}
            onClick={() => {
              onMarkAsRead(notification.id);
              onCloseModal?.();
            }}
            className="inline-flex items-center gap-1.5 bg-[#FFB800] hover:bg-[#2D2A26] hover:text-[#FFB800] text-[#2D2A26] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-tight shadow-sm transition hover:scale-102"
          >
            <GitBranch size={13} />
            <span>Ver Árvore de Linhagem</span>
            <ArrowRight size={12} />
          </Link>

          {/* View Remix directly in Lineage or Fluxo */}
          <Link
            to={`/lineage/${notification.remixPhotoId}`}
            onClick={() => {
              onMarkAsRead(notification.id);
              onCloseModal?.();
            }}
            className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition"
          >
            <Eye size={12} />
            <span>Ver Remix</span>
          </Link>
        </div>

        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="text-[10px] text-gray-400 hover:text-black font-bold uppercase transition flex items-center gap-1"
          >
            <CheckCheck size={12} />
            <span>Marcar lida</span>
          </button>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}
