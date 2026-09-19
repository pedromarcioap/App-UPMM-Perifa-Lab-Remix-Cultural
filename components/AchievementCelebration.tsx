import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  X, 
  Share2, 
  ArrowRight, 
  Zap, 
  Flame, 
  Crown, 
  CheckCircle2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { AchievementEvent } from '../types';

interface AchievementCelebrationProps {
  achievement: AchievementEvent | null;
  toastAchievement: AchievementEvent | null;
  onCloseModal: () => void;
  onCloseToast: () => void;
  onOpenModal: (achievement: AchievementEvent) => void;
  onViewProfile?: () => void;
}

// Chime synthesizer using Web Audio API for instantaneous celebratory feedback
const playCelebrationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a 4-note ascending triumph chord: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
    });
  } catch (e) {
    // Audio might be blocked before first user gesture, fail silently
    console.debug('Audio chime skipped:', e);
  }
};

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  toastAchievement,
  onCloseModal,
  onCloseToast,
  onOpenModal,
  onViewProfile
}) => {
  const [copiedShare, setCopiedShare] = React.useState(false);

  // Trigger confetti and sound whenever festive modal opens
  useEffect(() => {
    if (achievement) {
      playCelebrationChime();

      // Confetti burst 1: Center blast
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFB800', '#FF5722', '#2D2A26', '#9C27B0', '#00E676']
      });

      // Confetti burst 2 & 3: Side cannons
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 },
          colors: ['#FFB800', '#FF5722', '#FFD54F']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 },
          colors: ['#9C27B0', '#FFB800', '#00E676']
        });
      }, 250);

      return () => clearTimeout(timer1);
    }
  }, [achievement]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toastAchievement) {
      const timer = setTimeout(() => {
        onCloseToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastAchievement, onCloseToast]);

  const handleShare = () => {
    if (!achievement) return;
    const shareText = `🔥 Acabei de desbloquear a conquista "${achievement.title}" no UPMM Periferia Art Studio! Venha conferir a arte visual de Palmas: ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  return (
    <>
      {/* 1. TOAST NOTIFICATION (SLIDES IN AT TOP-RIGHT) */}
      <AnimatePresence>
        {toastAchievement && !achievement && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed top-5 right-5 z-[150] max-w-sm w-[92vw] sm:w-auto"
          >
            <div 
              onClick={() => onOpenModal(toastAchievement)}
              className="bg-[#2D2A26] text-white p-4 rounded-3xl border-2 border-[#FFB800] shadow-2xl flex items-center space-x-3.5 cursor-pointer hover:scale-102 transition-transform group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center text-2xl font-black shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                {toastAchievement.icon || '🏆'}
              </div>

              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles size={12} className="text-[#FFB800] animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB800]">
                    {toastAchievement.type === 'level_up' ? 'Subiu de Nível!' : 'Nova Insígnia!'}
                  </span>
                  {toastAchievement.rewardResponsa && (
                    <span className="text-[9px] bg-white/15 text-amber-200 px-1.5 py-0.2 rounded font-bold">
                      +{toastAchievement.rewardResponsa} Responsa
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm uppercase text-white truncate">
                  {toastAchievement.title}
                </h4>
                <p className="text-[11px] text-gray-300 truncate">
                  {toastAchievement.subtitle || toastAchievement.description}
                </p>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenModal(toastAchievement);
                  }}
                  className="bg-[#FFB800] hover:bg-white text-[#2D2A26] text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl transition shadow"
                >
                  Ver
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseToast();
                  }}
                  className="p-1 text-gray-400 hover:text-white transition"
                  title="Fechar notificação"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FESTIVE CELEBRATION MODAL (FULL EXPERIENCE) */}
      <AnimatePresence>
        {achievement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#2D2A26] text-white rounded-[2.5rem] border-2 border-[#FFB800] shadow-2xl p-6 sm:p-8 text-center overflow-hidden z-10 my-auto"
            >
              {/* Radial glow background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                type="button"
                onClick={onCloseModal}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition z-20"
                title="Fechar"
              >
                <X size={20} />
              </button>

              {/* Top Pill */}
              <div className="inline-flex items-center gap-1.5 bg-[#FFB800]/20 text-[#FFB800] px-3.5 py-1 rounded-full border border-[#FFB800]/30 text-[10px] font-black uppercase tracking-widest mb-4">
                <Crown size={12} className="text-[#FFB800]" />
                <span>
                  {achievement.type === 'level_up' ? 'Evolução de Perfil' : 'Conquista Desbloqueada'}
                </span>
              </div>

              {/* Giant Icon with Pulsing Rings */}
              <div className="relative my-4 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#FFB800] via-[#FFA000] to-[#FF5722] text-[#2D2A26] flex items-center justify-center text-5xl sm:text-6xl font-black shadow-2xl shadow-[#FFB800]/30 border-4 border-white/20 relative z-10"
                >
                  {achievement.icon || '🏆'}
                </motion.div>
                <div className="absolute w-36 h-36 rounded-full border-2 border-[#FFB800]/30 animate-ping opacity-30 pointer-events-none" />
              </div>

              {/* Title and Subtitle */}
              <div className="space-y-1.5 mt-2">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {achievement.title}
                </h2>
                <p className="text-sm font-bold text-[#FFB800] uppercase tracking-wide">
                  {achievement.subtitle}
                </p>
                <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed pt-1">
                  {achievement.description}
                </p>
              </div>

              {/* Responsa / Level Bonus Pill */}
              {achievement.rewardResponsa && (
                <div className="mt-5 bg-white/10 border border-white/10 rounded-2xl p-3 max-w-xs mx-auto flex items-center justify-center space-x-2">
                  <Flame size={16} className="text-[#FF5722]" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    +{achievement.rewardResponsa} Pontos de Responsa
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full bg-[#FFB800] hover:bg-white text-[#2D2A26] font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-xl transition-all transform hover:scale-102 flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>{copiedShare ? 'Link Copiado para o Mural!' : 'Compartilhar Conquista'}</span>
                </button>

                <div className="flex gap-2">
                  {onViewProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseModal();
                        onViewProfile();
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase py-3 rounded-2xl transition border border-white/10"
                    >
                      Ver no Meu Perfil
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase py-3 rounded-2xl transition"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
