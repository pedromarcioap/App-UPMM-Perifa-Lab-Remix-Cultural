import React from 'react';

interface UPMMGlyphProps {
  size?: number | string;
  className?: string;
  showDetails?: boolean;
}

/**
 * Glifo Estêncil Brutalista Modular (U + P + M Fusion)
 * Baseado na placa industrial de concreto, cortes técnicos de estêncil,
 * faixa chevron de demarcação urbana "REMIX CULTURAL" e spray cap 94 ciano.
 */
export const UPMMGlyph: React.FC<UPMMGlyphProps> = ({
  size = 40,
  className = '',
  showDetails = true
}) => {
  return (
    <svg
      viewBox="0 0 350 350"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UPMM Logotipo Brutalista Estêncil"
    >
      {/* Placa de Concreto Industrial */}
      <rect x="2" y="2" width="346" height="346" rx="20" fill="#1C1B19" stroke="#3E3A35" strokeWidth="4" />

      {/* Rebites Industriais */}
      <circle cx="20" cy="20" r="4" fill="#66625C" />
      <circle cx="330" cy="20" r="4" fill="#66625C" />
      <circle cx="20" cy="330" r="4" fill="#66625C" />
      <circle cx="330" cy="330" r="4" fill="#66625C" />

      {/* Módulo 1: Letra "U" em blocos estêncil (Branco Titânio) */}
      <path
        d="M40,50 H90 V140 C90,155 102,166 118,166 C134,166 146,155 146,140 V50 H196 V140 C196,182 162,216 118,216 C74,216 40,182 40,140 Z"
        fill="#EDE8E1"
      />
      {/* Fenda de estêncil no "U" */}
      <rect x="36" y="100" width="164" height="8" fill="#1C1B19" />

      {/* Módulo 2: Letra "P" em Amarelo Solar e Terracota */}
      <path
        d="M196,50 H270 C298,50 316,68 316,96 C316,124 298,142 270,142 H226 V216 H176 V50 H196 Z"
        fill="#FFB800"
      />
      {/* Contraforma do "P" */}
      <rect x="226" y="78" width="46" height="36" fill="#1C1B19" />
      {/* Fenda de estêncil no "P" */}
      <rect x="170" y="100" width="150" height="8" fill="#1C1B19" />

      {/* Módulo 3: Faixa Chevron Urbana / Demarcação */}
      <g transform="translate(40, 240)">
        <rect x="0" y="0" width="270" height="46" rx="4" fill="#FF5722" />
        <polygon points="0,0 20,0 0,46" fill="#1C1B19" />
        <polygon points="35,0 75,0 35,46" fill="#1C1B19" />
        <polygon points="90,0 130,0 90,46" fill="#1C1B19" />
        <polygon points="145,0 185,0 145,46" fill="#1C1B19" />
        <polygon points="200,0 240,0 200,46" fill="#1C1B19" />
        <polygon points="255,0 270,0 255,46" fill="#1C1B19" />
        <text
          x="135"
          y="30"
          textAnchor="middle"
          fill="#EDE8E1"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, letterSpacing: '0.04em' }}
          fontSize="16"
        >
          REMIX CULTURAL
        </text>
      </g>

      {showDetails && (
        <>
          {/* Indicador Lateral de Spray / Stencil Cap */}
          <circle cx="48" cy="316" r="6" fill="#00E5FF" />
          <text
            x="64"
            y="320"
            fill="#00E5FF"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em' }}
            fontSize="9"
          >
            CAP_94 // 400ML
          </text>
          <text
            x="310"
            y="320"
            textAnchor="end"
            fill="#66625C"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            fontSize="9"
          >
            PMW_ZONE
          </text>
        </>
      )}
    </svg>
  );
};

interface UPMMBrandLogoProps {
  variant?: 'sidebar' | 'mobile' | 'hero' | 'compact';
  className?: string;
  onClick?: () => void;
}

export const UPMMBrandLogo: React.FC<UPMMBrandLogoProps> = ({
  variant = 'sidebar',
  className = '',
  onClick
}) => {
  if (variant === 'mobile') {
    return (
      <div 
        className={`flex items-center gap-2.5 ${className}`}
        onClick={onClick}
      >
        <UPMMGlyph size={32} showDetails={false} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-lg font-black tracking-tight text-[#EDE8E1] uppercase leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              U.P.M.M
            </span>
            <span 
              className="text-[8px] font-bold tracking-widest text-[#FF5722] bg-[#242220] px-1.5 py-0.5 rounded border border-[#3E3A35] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              VAR.03
            </span>
          </div>
          <span 
            className="text-[7.5px] font-bold uppercase tracking-wider text-[#FFB800] mt-0.5 leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PERIFERIA MURAL &amp; MOVIMENTO
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`} onClick={onClick}>
        <UPMMGlyph size={28} showDetails={false} />
        <span 
          className="text-base font-black tracking-tight text-white uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          U.P.M.M
        </span>
      </div>
    );
  }

  // Variant 'sidebar' (Default)
  return (
    <div className={`space-y-3 ${className}`} onClick={onClick}>
      {/* Category metadata badge */}
      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#1C1B19] rounded border border-[#36322D]">
        <div className="w-1.5 h-3 bg-[#FF5722] rounded-sm" />
        <span 
          className="text-[9px] font-bold text-[#FF5722] tracking-wider uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          BRUTALIST STENCIL // VAR.03
        </span>
      </div>

      <div className="flex items-start gap-3">
        <UPMMGlyph size={48} />
        <div className="flex flex-col min-w-0 flex-1">
          {/* Main Wordmark with Stencil Look */}
          <div className="relative inline-block">
            <h1 
              className="text-3xl font-black text-[#EDE8E1] tracking-tight uppercase leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              U.P.M.M
            </h1>
            {/* Cut line */}
            <div className="h-[2px] bg-[#141311] w-full absolute top-[52%] left-0 pointer-events-none" />
          </div>

          <p 
            className="text-[10px] font-bold text-[#FF5722] uppercase tracking-wider mt-1 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PERIFERIA MURAL &amp; MOVIMENTO
          </p>
        </div>
      </div>
    </div>
  );
};
