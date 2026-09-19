import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Camera, ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  authorName?: string;
  remixerName?: string;
  neighborhood?: string;
  onOpenRemix?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Muro Original',
  afterLabel = 'Remix Autoral',
  title = 'Transformação Territorial',
  authorName = 'Fotógrafo da Quebrada',
  remixerName = 'Artista Urbano',
  neighborhood = 'Setor Taquari',
  onOpenRemix
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3E3A35] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFB800] text-[#141311] px-2 py-0.5 rounded">
              Antes & Depois
            </span>
            <span className="text-[10px] font-bold text-[#EDE8E1]/60 uppercase">{neighborhood}</span>
          </div>
          <h3 className="text-xl font-display uppercase text-white mt-1">{title}</h3>
          <p className="text-xs text-[#EDE8E1]/70">
            Registro de <strong className="text-white">{authorName}</strong> remixado por <strong className="text-[#FFB800]">{remixerName}</strong>
          </p>
        </div>

        {onOpenRemix && (
          <button
            onClick={onOpenRemix}
            className="self-start sm:self-auto px-4 py-2 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Sparkles size={14} />
            <span>Remixar Esta Base</span>
          </button>
        )}
      </div>

      {/* Interactive Slider Workspace */}
      <div 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#3E3A35] bg-[#141311]"
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped Overlay) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <span className="text-[9px] font-black uppercase tracking-wider bg-[#141311]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
            <Camera size={11} className="text-[#FFB800]" />
            <span>{beforeLabel}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span className="text-[9px] font-black uppercase tracking-wider bg-[#141311]/80 backdrop-blur-sm text-[#FFB800] px-2.5 py-1 rounded-lg border border-[#FFB800]/30 flex items-center gap-1">
            <Sparkles size={11} />
            <span>{afterLabel}</span>
          </span>
        </div>

        {/* Divider Handle Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-[#FFB800] shadow-[0_0_12px_rgba(255,184,0,0.8)] z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#141311] border-2 border-[#FFB800] text-[#FFB800] flex items-center justify-center shadow-2xl">
            <ArrowLeftRight size={14} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#EDE8E1]/60 font-sans uppercase">
        <span>← Deslize para a esquerda (Muro Bruto)</span>
        <span>Deslize para a direita (Remix com Stickers) →</span>
      </div>
    </div>
  );
};
