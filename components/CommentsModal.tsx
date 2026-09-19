import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Heart, 
  Sparkles, 
  MapPin, 
  Clock, 
  User as UserIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Comment, User } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'photo' | 'spot';
  targetTitle: string;
  targetSubtitle?: string;
  targetImage?: string;
  targetBadge?: string;
  comments: Comment[];
  onAddComment: (targetId: string, targetType: 'photo' | 'spot', text: string) => void;
  currentUser: User | null;
  onRequireLogin: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  targetSubtitle,
  targetImage,
  targetBadge,
  comments,
  onAddComment,
  currentUser,
  onRequireLogin
}) => {
  const [inputText, setInputText] = useState('');
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const targetComments = comments
    .filter(c => c.targetId === targetId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    onAddComment(targetId, targetType, inputText.trim());
    setInputText('');
  };

  const handleQuickReaction = (reaction: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    setInputText(prev => prev ? `${prev} ${reaction}` : reaction);
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'agora';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  const quickReactions = targetType === 'spot' 
    ? ['🎨 Bora pintar!', '🤝 Apoio o mutirão!', '📍 Muro de responsa!', '🧱 Parede perfeita!']
    : ['🔥 Ficou pesado!', '👏 Respeito ao traço!', '✨ Visão autêntica!', '👁️ Estética pura!'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[120] overflow-y-auto">
      <div 
        className="bg-[#1C1B19] text-[#EDE8E1] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto border border-[#3E3A35]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#3E3A35] bg-[#242220]/70 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {targetImage ? (
              <img 
                src={targetImage} 
                alt="" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=200&q=80';
                }}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#3E3A35] shadow-sm shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center shrink-0 border border-[#FFB800]/30">
                <MapPin size={22} className="text-[#FFB800]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                  targetType === 'spot'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#FFB800] text-[#141311]'
                }`}>
                  {targetBadge || (targetType === 'spot' ? 'Muro / Ponto' : 'Obra Visual')}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">
                  {targetComments.length} {targetComments.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </div>
              <h3 className="text-base font-black text-white truncate">{targetTitle}</h3>
              {targetSubtitle && (
                <p className="text-[11px] text-zinc-400 truncate font-medium">{targetSubtitle}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-[#242220] hover:bg-[#2D2A26] rounded-full transition shadow-sm shrink-0 ml-2 text-zinc-400 hover:text-white cursor-pointer"
            title="Fechar comentários"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Reactions Bar */}
        <div className="px-5 py-2.5 bg-[#242220]/40 border-b border-[#3E3A35] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles size={10} className="text-[#FFB800]" /> Rápidas:
          </span>
          {quickReactions.map((reaction, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickReaction(reaction)}
              className="text-[10px] font-bold bg-[#242220] hover:bg-[#FFB800] hover:text-[#141311] border border-[#3E3A35] text-zinc-300 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer shadow-2xs"
            >
              {reaction}
            </button>
          ))}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-[220px] no-scrollbar">
          {targetComments.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#242220] flex items-center justify-center text-zinc-500 border border-[#3E3A35]">
                <MessageSquare size={28} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Nenhum comentário ainda</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  {targetType === 'spot' 
                    ? 'Inicie a conversa sobre a pintura, autorização ou combine um mutirão neste muro!'
                    : 'Compartilhe sua visão, crítica construtiva ou elogio sobre esta obra periférica.'}
                </p>
              </div>
            </div>
          ) : (
            targetComments.map((comment) => {
              const isLiked = likedComments[comment.id];
              const likesCount = (comment.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div 
                  key={comment.id}
                  className="bg-[#242220] hover:bg-[#2A2825] p-4 rounded-2xl border border-[#3E3A35] transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80';
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-[#FFB800]"
                      />
                      <div>
                        <span className="text-xs font-black text-white">@{comment.userName}</span>
                        <div className="flex items-center space-x-1 text-[9px] text-zinc-400">
                          <Clock size={9} />
                          <span>{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => toggleLikeComment(comment.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                        isLiked 
                          ? 'bg-red-950/60 text-red-400 border border-red-800/60' 
                          : 'text-zinc-400 hover:text-red-400 hover:bg-[#1C1B19]'
                      }`}
                    >
                      <Heart size={12} className={isLiked ? 'fill-current text-red-500' : ''} />
                      <span>{likesCount}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                    {comment.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input Footer */}
        <div className="p-4 sm:p-5 border-t border-[#3E3A35] bg-[#1C1B19] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center space-x-2.5">
              {currentUser ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#FFB800] shrink-0" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#242220] border border-[#3E3A35] flex items-center justify-center text-zinc-400 shrink-0">
                  <UserIcon size={16} />
                </div>
              )}

              <div className="flex-1 relative">
                <input 
                  type="text"
                  placeholder={
                    currentUser 
                      ? (targetType === 'spot' ? 'Deixe um comentário sobre este muro em Palmas...' : 'Deixe sua visão sobre esta obra...')
                      : 'Faça login para comentar e ganhar Responsa...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => {
                    if (!currentUser) onRequireLogin();
                  }}
                  className="w-full pl-4 pr-12 py-3 bg-[#242220] rounded-2xl border border-[#3E3A35] text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB800] transition"
                />

                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#FFB800] text-[#141311] px-3 rounded-xl font-black text-xs flex items-center justify-center hover:bg-[#EAB308] transition disabled:opacity-40 disabled:hover:bg-[#FFB800] cursor-pointer"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-zinc-400 px-1 pt-1">
              <span className="flex items-center gap-1 font-bold text-[#FFB800]">
                <CheckCircle2 size={10} /> +3 de Responsa por comentário construtivo
              </span>
              <span>Pressione Enter para enviar</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
