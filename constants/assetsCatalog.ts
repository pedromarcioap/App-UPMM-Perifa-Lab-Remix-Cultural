import { AssetItem } from '../types/assets';

export const ASSET_CATEGORIES = [
  'Grafite & Bombing',
  'Cultura de Rua',
  'Tipografia Urbana',
  'Texturas & Rasgos',
  'Símbolos & Badges',
  'Linhas & Setas de Intervenção',
  'Animações em Loop',
  'Packs em Parceria'
] as const;

export const ASSET_CATALOG: AssetItem[] = [
  // 1. Grafite & Bombing
  {
    id: 'asset_spray_wildstyle',
    name: 'Wildstyle PMW Drip',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><path d="M10 50 L35 15 L50 45 L75 10 L90 55 L120 20 L150 50 L135 85 L95 70 L80 90 L40 75 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><path d="M45 75 Q48 95 45 100 M85 75 Q82 92 86 98 M120 70 Q122 88 119 96" stroke="%23FF5722" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="45" r="4" fill="%23FFFFFF"/><circle cx="90" cy="50" r="4" fill="%23FFFFFF"/></svg>',
    tags: ['wildstyle', 'spray', 'bombing', 'drip', 'escorrido', 'palmas', 'grafite'],
    aspectRatio: 1.6
  },
  {
    id: 'asset_bomb_bubble',
    name: 'Bomb Letra Gorda',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 100"><ellipse cx="40" cy="50" rx="30" ry="35" fill="%23FF5722" stroke="%232D2A26" stroke-width="6"/><ellipse cx="80" cy="48" rx="28" ry="34" fill="%23FFB800" stroke="%232D2A26" stroke-width="6"/><ellipse cx="110" cy="52" rx="22" ry="30" fill="%2300BCD4" stroke="%232D2A26" stroke-width="5"/><path d="M25 35 Q35 25 50 30 M65 32 Q75 22 90 28" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/></svg>',
    tags: ['bomb', 'bubble', 'letra gorda', 'letras', 'throwup', 'grafite'],
    aspectRatio: 1.4
  },
  {
    id: 'asset_fat_cap_splash',
    name: 'Fat Cap Splash Amarelo',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="%23FFB800"/><circle cx="20" cy="30" r="10" fill="%23FFB800"/><circle cx="78" cy="25" r="8" fill="%23FFB800"/><circle cx="82" cy="70" r="11" fill="%23FFB800"/><circle cx="28" cy="76" r="9" fill="%23FFB800"/><circle cx="50" cy="88" r="6" fill="%23FF5722"/><circle cx="12" cy="55" r="5" fill="%23FF5722"/><circle cx="50" cy="50" r="12" fill="%23FF5722"/></svg>',
    tags: ['fat cap', 'splash', 'respingo', 'spray', 'amarelo', 'tinta'],
    aspectRatio: 1.0
  },
  {
    id: 'asset_lata_spray_fatcap',
    name: 'Lata Classic Fat Cap PMW',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect x="30" y="42" width="40" height="70" rx="8" fill="%232D2A26" stroke="%23FFB800" stroke-width="4"/><rect x="40" y="24" width="20" height="18" rx="4" fill="%23FF5722"/><circle cx="50" cy="18" r="6" fill="%23FFFFFF"/><line x1="32" y1="65" x2="68" y2="65" stroke="%23FFB800" stroke-width="3"/><text x="50" y="85" font-family="sans-serif" font-weight="900" font-size="10" fill="%2300E5FF" text-anchor="middle">PMW 63</text></svg>',
    tags: ['spray', 'lata', 'fat cap', 'tinta', 'aerossol', 'bombing', 'grafite'],
    aspectRatio: 0.83
  },
  {
    id: 'asset_mascara_respirador',
    name: 'Respirador Streetwear',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 40 Q50 25 75 40 L70 75 Q50 90 30 75 Z" fill="%2337474F" stroke="%232D2A26" stroke-width="4"/><circle cx="34" cy="62" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="66" cy="62" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><path d="M42 45 L58 45" stroke="%23FF5722" stroke-width="3"/></svg>',
    tags: ['respirador', 'mascara', 'grafiteiro', 'protecao', 'spray', 'bombing'],
    aspectRatio: 1.0
  },
  {
    id: 'asset_marcador_posca',
    name: 'Marcador Caligráfico 15mm',
    category: 'Grafite & Bombing',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 45"><rect x="10" y="10" width="85" height="25" rx="5" fill="%232D2A26" stroke="%23FFB800" stroke-width="3"/><rect x="95" y="13" width="22" height="19" rx="2" fill="%23FF5722"/><text x="52" y="27" font-family="sans-serif" font-weight="900" font-size="11" fill="%23FFFFFF" text-anchor="middle">POSCA 15mm</text></svg>',
    tags: ['marcador', 'posca', 'caligrafia', 'tag', 'canetao', 'marker'],
    aspectRatio: 2.88
  },

  // 2. Cultura de Rua
  {
    id: 'asset_sound_system',
    name: 'Caixa Sound System',
    category: 'Cultura de Rua',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><rect x="15" y="10" width="70" height="110" rx="8" fill="%232D2A26" stroke="%23FFB800" stroke-width="5"/><circle cx="50" cy="45" r="20" fill="%23424242" stroke="%23FF5722" stroke-width="4"/><circle cx="50" cy="45" r="8" fill="%23FFB800"/><circle cx="50" cy="92" r="18" fill="%23424242" stroke="%23FF5722" stroke-width="4"/><circle cx="50" cy="92" r="6" fill="%23FFB800"/><rect x="25" y="18" width="50" height="6" rx="2" fill="%23FFB800"/></svg>',
    tags: ['som', 'sound system', 'caixa', 'grave', 'hiphop', 'reggae', 'cultura de rua'],
    aspectRatio: 0.77
  },
  {
    id: 'asset_boombox_retro',
    name: 'Boombox Beatmaker 90s',
    category: 'Cultura de Rua',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 90"><rect x="10" y="25" width="120" height="60" rx="8" fill="%2337474F" stroke="%232D2A26" stroke-width="4"/><path d="M35 25 L35 12 L105 12 L105 25" fill="none" stroke="%23FFB800" stroke-width="6" stroke-linecap="round"/><circle cx="38" cy="55" r="20" fill="%23263238" stroke="%23FF5722" stroke-width="4"/><circle cx="102" cy="55" r="20" fill="%23263238" stroke="%23FF5722" stroke-width="4"/><rect x="62" y="42" width="16" height="24" rx="2" fill="%23ECEFF1"/><line x1="15" y1="12" x2="30" y2="4" stroke="%23FFB800" stroke-width="3"/></svg>',
    tags: ['boombox', 'radio', 'tape', 'fita', 'hiphop', 'cultura de rua', 'beat'],
    aspectRatio: 1.55
  },
  {
    id: 'asset_skate_taquaralto',
    name: 'Skate Taquaralto Crew',
    category: 'Cultura de Rua',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 50"><rect x="15" y="15" width="100" height="20" rx="10" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><line x1="30" y1="18" x2="100" y2="18" stroke="%23FF5722" stroke-width="3"/><circle cx="32" cy="38" r="6" fill="%232D2A26"/><circle cx="98" cy="38" r="6" fill="%232D2A26"/><path d="M15 25 Q10 25 8 18 M115 25 Q120 25 122 18" stroke="%232D2A26" stroke-width="4" fill="none"/></svg>',
    tags: ['skate', 'deck', 'shape', 'taquaralto', 'rua', 'cesamar', 'street'],
    aspectRatio: 2.6
  },

  // 3. Tipografia Urbana
  {
    id: 'asset_tag_resistencia',
    name: 'Tag Resistência Periférica',
    category: 'Tipografia Urbana',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 60"><text x="75" y="42" font-family="impact, sans-serif" font-weight="900" font-size="28" fill="%23FFB800" stroke="%232D2A26" stroke-width="2" text-anchor="middle" letter-spacing="1">RESISTÊNCIA</text><line x1="15" y1="52" x2="135" y2="52" stroke="%23FF5722" stroke-width="4" stroke-linecap="round"/></svg>',
    tags: ['tipografia', 'tag', 'resistencia', 'periferia', 'texto', 'luta'],
    aspectRatio: 2.5
  },
  {
    id: 'asset_carimbo_periferia',
    name: 'Carimbo Periferia Vive',
    category: 'Tipografia Urbana',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="14" fill="none" stroke="%23FF5722" stroke-width="6" stroke-dasharray="8 4"/><text x="60" y="48" font-family="sans-serif" font-weight="900" font-size="14" fill="%232D2A26" text-anchor="middle">PERIFERIA</text><text x="60" y="70" font-family="sans-serif" font-weight="900" font-size="20" fill="%23FF5722" text-anchor="middle">VIVE!</text><text x="60" y="90" font-family="sans-serif" font-weight="900" font-size="11" fill="%23FFB800" text-anchor="middle">PALMAS - TO</text></svg>',
    tags: ['carimbo', 'periferia vive', 'palmas', 'lambe', 'selo', 'tipografia'],
    aspectRatio: 1.0
  },
  {
    id: 'asset_tag_pmw63',
    name: 'Tag PMW 63 Street',
    category: 'Tipografia Urbana',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 70"><path d="M15 50 Q25 15 45 25 Q35 55 55 45 M60 20 L75 55 L90 20 M98 22 L108 55 L120 20" stroke="%23FFB800" stroke-width="6" stroke-linecap="round" fill="none"/><text x="100" y="65" font-family="monospace" font-weight="900" font-size="14" fill="%23FF5722">#63</text></svg>',
    tags: ['pmw', '63', 'tocantins', 'tag', 'caligrafia', 'marker', 'urbana'],
    aspectRatio: 1.85
  },

  // 4. Texturas & Rasgos
  {
    id: 'asset_rasgo_lambe',
    name: 'Rasgo de Lambe Antigo',
    category: 'Texturas & Rasgos',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 70"><path d="M5 10 L135 8 L130 35 L120 28 L105 45 L85 30 L65 50 L45 35 L25 55 L5 40 Z" fill="%23FFFDE7" stroke="%23FFB800" stroke-width="3"/><path d="M15 20 L125 18" stroke="%232D2A26" stroke-width="2" stroke-dasharray="4 4"/></svg>',
    tags: ['rasgo', 'papel', 'lambe', 'textura', 'cartaz', 'muro'],
    aspectRatio: 2.0
  },
  {
    id: 'asset_fita_crepe_marcada',
    name: 'Fita Crepe Marcada',
    category: 'Texturas & Rasgos',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 45"><polygon points="8,10 122,6 126,38 4,40" fill="%23FFE082" opacity="0.9" stroke="%23FFA000" stroke-width="2"/><line x1="20" y1="12" x2="30" y2="36" stroke="%232D2A26" stroke-width="2" opacity="0.3"/><line x1="60" y1="10" x2="70" y2="36" stroke="%232D2A26" stroke-width="2" opacity="0.3"/><line x1="100" y1="8" x2="110" y2="34" stroke="%232D2A26" stroke-width="2" opacity="0.3"/></svg>',
    tags: ['fita crepe', 'textura', 'colagem', 'rasgo', 'adesivo'],
    aspectRatio: 2.88
  },
  {
    id: 'asset_concreto_rachado',
    name: 'Fissura de Concreto',
    category: 'Texturas & Rasgos',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M10 20 L40 35 L35 55 L65 60 L60 85 L90 95 M40 35 L70 25 L95 40 M65 60 L105 70" fill="none" stroke="%232D2A26" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tags: ['fissura', 'concreto', 'rachadura', 'muro', 'textura', 'asfalto'],
    aspectRatio: 1.2
  },

  // 5. Símbolos & Badges
  {
    id: 'asset_coroa_3pontas',
    name: 'Coroa Street 3 Pontas',
    category: 'Símbolos & Badges',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M10 70 L90 70 L82 20 L50 48 L18 20 Z" fill="%23FFD700" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><circle cx="18" cy="16" r="4" fill="%23FF5722"/><circle cx="50" cy="14" r="5" fill="%23FF5722"/><circle cx="82" cy="16" r="4" fill="%23FF5722"/></svg>',
    tags: ['coroa', 'king', 'basquiat', 'simbolo', 'street', 'badge'],
    aspectRatio: 1.25
  },
  {
    id: 'asset_punho_cerrado',
    name: 'Punho Firme do Cerrado',
    category: 'Símbolos & Badges',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><path d="M30 45 L30 30 Q30 20 40 20 Q50 20 50 30 L50 35 Q50 20 60 20 Q70 20 70 32 L70 38 Q70 22 80 22 Q90 22 90 35 L90 70 Q90 95 65 105 L35 105 Q20 95 20 75 L20 60 Q20 45 30 45 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><line x1="30" y1="55" x2="70" y2="55" stroke="%232D2A26" stroke-width="4"/></svg>',
    tags: ['punho', 'luta', 'resistencia', 'cerrado', 'forca', 'simbolo'],
    aspectRatio: 0.9
  },
  {
    id: 'asset_sol_palmas_badge',
    name: 'Sol Forte Tocantinense',
    category: 'Símbolos & Badges',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="24" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><circle cx="50" cy="50" r="15" fill="%23FFB800"/><path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50 M22 22 L30 30 M70 70 L78 78 M78 22 L70 30 M30 70 L22 78" stroke="%23FFB800" stroke-width="5" stroke-linecap="round"/></svg>',
    tags: ['sol', 'palmas', 'tocantins', 'luz', 'calor', 'simbolo', 'badge'],
    aspectRatio: 1.0
  },

  // 6. Linhas & Setas de Intervenção
  {
    id: 'asset_seta_grafite',
    name: 'Seta de Intervenção Rápida',
    category: 'Linhas & Setas de Intervenção',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><path d="M15 35 L80 35 L65 15 L105 35 L65 55 L80 35" fill="%23FF5722" stroke="%232D2A26" stroke-width="4" stroke-linejoin="round"/></svg>',
    tags: ['seta', 'apontador', 'direcao', 'grafite', 'seta urbana', 'intervencao'],
    aspectRatio: 1.71
  },
  {
    id: 'asset_circulo_foco_giz',
    name: 'Círculo de Alvo Street',
    category: 'Linhas & Setas de Intervenção',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="38" ry="34" fill="none" stroke="%23FFB800" stroke-width="6" stroke-linecap="round" stroke-dasharray="50 15 30 10"/><ellipse cx="50" cy="50" rx="20" ry="18" fill="none" stroke="%23FF5722" stroke-width="4"/></svg>',
    tags: ['circulo', 'alvo', 'foco', 'giz', 'destaque', 'linhas'],
    aspectRatio: 1.0
  },
  {
    id: 'asset_traço_neon_wave',
    name: 'Onda Elétrica Neon',
    category: 'Linhas & Setas de Intervenção',
    type: 'static_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><path d="M10 25 Q35 5 60 25 T110 25 T135 25" fill="none" stroke="%2300E5FF" stroke-width="6" stroke-linecap="round"/><path d="M10 25 Q35 5 60 25 T110 25 T135 25" fill="none" stroke="%23FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>',
    tags: ['onda', 'neon', 'traço', 'eletrico', 'intervencao', 'linhas'],
    aspectRatio: 2.8
  },

  // 7. Animações em Loop
  {
    id: 'asset_loop_fogo_vivo',
    name: 'Chama Viva em Loop',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes flamePulse{0%,100%{transform:scale(1) translateY(0);fill:%23FF5722;}50%{transform:scale(1.08) translateY(-4px);fill:%23FF9800;}}@keyframes innerFlame{0%,100%{transform:scale(0.9);fill:%23FFEB3B;}50%{transform:scale(1.1);fill:%23FFD700;}}.f-out{transform-origin:50%25 90%25;animation:flamePulse 0.8s infinite ease-in-out;}.f-in{transform-origin:50%25 80%25;animation:innerFlame 0.8s infinite ease-in-out;}</style><path class="f-out" d="M50 15 C40 35 25 45 25 65 C25 80 35 90 50 90 C65 90 75 80 75 65 C75 45 60 35 50 15 Z" stroke="%232D2A26" stroke-width="4"/><path class="f-in" d="M50 40 C45 52 38 60 38 72 C38 80 43 85 50 85 C57 85 62 80 62 72 C62 60 55 52 50 40 Z"/></svg>',
    tags: ['fogo', 'chama', 'loop', 'animado', 'calor', 'energia'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 24, durationMs: 800, loop: true }
  },
  {
    id: 'asset_loop_raio_pulsar',
    name: 'Raio Elétrico Pulsante',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes boltGlow{0%,100%{filter:drop-shadow(0 0 2px %23FFD700);transform:scale(0.96);}50%{filter:drop-shadow(0 0 12px %23FF5722);transform:scale(1.06);}}.bolt{transform-origin:50%25 50%25;animation:boltGlow 0.6s infinite ease-in-out;}</style><polygon class="bolt" points="56,8 24,54 48,54 40,92 78,44 54,44" fill="%23FFEB3B" stroke="%23FF5722" stroke-width="4" stroke-linejoin="round"/></svg>',
    tags: ['raio', 'eletrico', 'pulse', 'loop', 'animado', 'trovao'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 20, durationMs: 600, loop: true }
  },
  {
    id: 'asset_loop_estrela_sparkle',
    name: 'Estrela Flash Sparkle',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes spinPulse{0%{transform:rotate(0deg) scale(0.9);fill:%23FFB800;}50%{transform:rotate(180deg) scale(1.15);fill:%23FFF59D;}100%{transform:rotate(360deg) scale(0.9);fill:%23FFB800;}}.star{transform-origin:50%25 50%25;animation:spinPulse 1.2s infinite linear;}</style><path class="star" d="M50 8 Q50 50 92 50 Q50 50 50 92 Q50 50 8 50 Q50 50 50 8 Z" stroke="%232D2A26" stroke-width="4"/></svg>',
    tags: ['estrela', 'sparkle', 'brilho', 'loop', 'animado', 'luz'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 36, durationMs: 1200, loop: true }
  },
  {
    id: 'asset_loop_spray_glow',
    name: 'Lata Spray Glow Loop',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sprayMist{0%,100%{opacity:0.3;transform:translateY(0);}50%{opacity:1;transform:translateY(-6px);}}.mist{animation:sprayMist 0.7s infinite alternate;}</style><rect x="35" y="35" width="30" height="52" rx="6" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><rect x="42" y="22" width="16" height="13" rx="3" fill="%23FF5722"/><circle cx="50" cy="62" r="8" fill="%23FFFFFF"/><g class="mist"><circle cx="50" cy="12" r="4" fill="%23FFB800"/><circle cx="62" cy="14" r="3" fill="%23FF5722"/><circle cx="38" cy="14" r="3" fill="%23FF5722"/></g></svg>',
    tags: ['spray', 'mist', 'glow', 'animado', 'loop', 'lata', 'grafite'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 20, durationMs: 700, loop: true }
  },
  {
    id: 'asset_loop_coracao_beat',
    name: 'Coração Pulsar Beat 808',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes heartBeat{0%,100%{transform:scale(0.92);}15%{transform:scale(1.15);}30%{transform:scale(0.96);}45%{transform:scale(1.08);}}@keyframes waveOut{0%{r:20;opacity:0.9;}100%{r:46;opacity:0;}}.hb{transform-origin:50%25 50%25;animation:heartBeat 1s infinite cubic-bezier(0.25, 1, 0.5, 1);}.pulse-ring{animation:waveOut 1s infinite ease-out;}</style><circle class="pulse-ring" cx="50" cy="50" r="20" fill="none" stroke="%23E91E63" stroke-width="3"/><path class="hb" d="M50 85 C20 58 12 30 35 20 C46 16 50 25 50 25 C50 25 54 16 65 20 C88 30 80 58 50 85 Z" fill="%23E91E63" stroke="%232D2A26" stroke-width="4"/><circle cx="40" cy="35" r="4" fill="%23FFFFFF"/></svg>',
    tags: ['coracao', 'beat', 'pulso', 'loop', 'animado', 'amor', '808'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 30, durationMs: 1000, loop: true }
  },
  {
    id: 'asset_loop_sol_giratorio',
    name: 'Sol Nascente Giratório',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sunRotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}@keyframes corePulse{0%,100%{transform:scale(0.9);}50%{transform:scale(1.1);}}.rays{transform-origin:50%25 50%25;animation:sunRotate 8s infinite linear;}.core{transform-origin:50%25 50%25;animation:corePulse 1.2s infinite ease-in-out;}</style><g class="rays"><circle cx="50" cy="50" r="32" fill="none" stroke="%23FFB800" stroke-width="6" stroke-dasharray="14 10"/><path d="M50 8 L50 20 M50 80 L50 92 M8 50 L20 50 M80 50 L92 50 M20 20 L28 28 M72 72 L80 80 M80 20 L72 28 M28 72 L20 80" stroke="%23FF5722" stroke-width="4" stroke-linecap="round"/></g><circle class="core" cx="50" cy="50" r="18" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/></svg>',
    tags: ['sol', 'tocantins', 'giratorio', 'palmas', 'calor', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 48, durationMs: 8000, loop: true }
  },
  {
    id: 'asset_loop_equalizador_beat',
    name: 'Equalizador Beat Sound System',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes bar1{0%,100%{height:20px;y:65px;}50%{height:65px;y:20px;}}@keyframes bar2{0%,100%{height:60px;y:25px;}50%{height:25px;y:60px;}}@keyframes bar3{0%,100%{height:35px;y:50px;}50%{height:70px;y:15px;}}@keyframes bar4{0%,100%{height:50px;y:35px;}50%{height:15px;y:70px;}}@keyframes bar5{0%,100%{height:25px;y:60px;}50%{height:55px;y:30px;}}.b1{animation:bar1 0.6s infinite ease-in-out;}.b2{animation:bar2 0.75s infinite ease-in-out 0.1s;}.b3{animation:bar3 0.65s infinite ease-in-out 0.2s;}.b4{animation:bar4 0.8s infinite ease-in-out 0.15s;}.b5{animation:bar5 0.7s infinite ease-in-out 0.25s;}</style><rect class="b1" x="12" y="65" width="12" height="20" rx="4" fill="%23FF5722"/><rect class="b2" x="28" y="25" width="12" height="60" rx="4" fill="%23FFB800"/><rect class="b3" x="44" y="50" width="12" height="35" rx="4" fill="%2300E5FF"/><rect class="b4" x="60" y="35" width="12" height="50" rx="4" fill="%23E91E63"/><rect class="b5" x="76" y="60" width="12" height="25" rx="4" fill="%2376FF03"/></svg>',
    tags: ['equalizador', 'som', 'grave', 'beat', 'ritmo', 'musica', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 24, durationMs: 700, loop: true }
  },
  {
    id: 'asset_loop_olho_pisca',
    name: 'Olho da Visão Neon Pisca',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><style>@keyframes blink{0%,90%,100%{transform:scaleY(1);}95%{transform:scaleY(0.08);}}@keyframes pupilGlow{0%,100%{filter:drop-shadow(0 0 2px %2300E5FF);r:7;}50%{filter:drop-shadow(0 0 8px %23FFD700);r:9;}}.eye-lid{transform-origin:50%25 50%25;animation:blink 2.8s infinite ease-in-out;}.pupil{animation:pupilGlow 1.4s infinite ease-in-out;}</style><g class="eye-lid"><path d="M10 40 Q50 10 90 40 Q50 70 10 40 Z" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="5"/><circle cx="50" cy="40" r="18" fill="%232D2A26"/><circle class="pupil" cx="50" cy="40" r="8" fill="%2300E5FF"/><circle cx="46" cy="36" r="3" fill="%23FFFFFF"/></g></svg>',
    tags: ['olho', 'visao', 'pisca', 'neon', 'ciber', 'street', 'loop', 'animado'],
    aspectRatio: 1.25,
    animationMetadata: { frameCount: 30, durationMs: 2800, loop: true }
  },
  {
    id: 'asset_loop_coroa_float',
    name: 'Coroa Street Flutuante',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes crownFloat{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-10px) rotate(2deg);}}@keyframes spark{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}.crown{transform-origin:50%25 60%25;animation:crownFloat 1.8s infinite ease-in-out;}.sp1{animation:spark 1s infinite ease-in-out;}.sp2{animation:spark 1.4s infinite ease-in-out 0.5s;}</style><g class="crown"><path d="M15 75 L85 75 L78 30 L50 52 L22 30 Z" fill="%23FFD700" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><circle cx="22" cy="24" r="5" fill="%23FF5722"/><circle cx="50" cy="22" r="6" fill="%23FF5722"/><circle cx="78" cy="24" r="5" fill="%23FF5722"/><line x1="20" y1="65" x2="80" y2="65" stroke="%232D2A26" stroke-width="3"/></g><polygon class="sp1" points="15,18 18,12 21,18 27,21 21,24 18,30 15,24 9,21" fill="%23FFB800"/><polygon class="sp2" points="80,15 83,9 86,15 92,18 86,21 83,27 80,21 74,18" fill="%23FF5722"/></svg>',
    tags: ['coroa', 'king', 'basquiat', 'flutuante', 'ouro', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 36, durationMs: 1800, loop: true }
  },
  {
    id: 'asset_loop_drip_loop',
    name: 'Drip Tinta Escorrendo',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes dropFall{0%{transform:translateY(0) scaleY(1);opacity:1;}70%{transform:translateY(28px) scaleY(1.3);opacity:1;}100%{transform:translateY(36px) scale(0.3);opacity:0;}}@keyframes dripSpread{0%,100%{transform:scaleX(0.95);}50%{transform:scaleX(1.05);}}.splat{transform-origin:50%25 30%25;animation:dripSpread 1.6s infinite ease-in-out;}.d1{animation:dropFall 1.1s infinite cubic-bezier(0.55, 0.055, 0.675, 0.19);}.d2{animation:dropFall 1.4s infinite cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.5s;}</style><g class="splat"><path d="M10 20 Q50 5 90 20 Q85 45 65 38 Q50 48 35 38 Q15 45 10 20 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><path d="M28 35 Q30 55 30 60 Q28 65 24 60 Z" fill="%23FF5722"/><path d="M70 35 Q72 58 72 65 Q68 70 66 64 Z" fill="%23FF5722"/></g><ellipse class="d1" cx="30" cy="58" rx="4" ry="7" fill="%23FF5722"/><ellipse class="d2" cx="71" cy="62" rx="4" ry="8" fill="%23FF5722"/></svg>',
    tags: ['drip', 'tinta', 'escorrido', 'spray', 'gota', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 30, durationMs: 1400, loop: true }
  },
  {
    id: 'asset_loop_fita_rodando',
    name: 'Fita K7 em Rotação',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 75"><style>@keyframes spinReel{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.reel1{transform-origin:38px 38px;animation:spinReel 2s infinite linear;}.reel2{transform-origin:72px 38px;animation:spinReel 2s infinite linear;}</style><rect x="5" y="8" width="100" height="60" rx="8" fill="%232D2A26" stroke="%23FFB800" stroke-width="4"/><rect x="20" y="20" width="70" height="34" rx="4" fill="%23FFFFFF"/><circle cx="38" cy="38" r="12" fill="%232D2A26"/><circle cx="72" cy="38" r="12" fill="%232D2A26"/><g class="reel1"><circle cx="38" cy="38" r="6" fill="%23FF5722"/><line x1="38" y1="28" x2="38" y2="48" stroke="%23FFFFFF" stroke-width="2"/><line x1="28" y1="38" x2="48" y2="38" stroke="%23FFFFFF" stroke-width="2"/></g><g class="reel2"><circle cx="72" cy="38" r="6" fill="%23FF5722"/><line x1="72" y1="28" x2="72" y2="48" stroke="%23FFFFFF" stroke-width="2"/><line x1="62" y1="38" x2="82" y2="38" stroke="%23FFFFFF" stroke-width="2"/></g><polygon points="25,68 35,55 75,55 85,68" fill="%23FF5722"/></svg>',
    tags: ['fita', 'k7', 'cassete', 'tape', 'vintage', 'musica', 'loop', 'animado'],
    aspectRatio: 1.46,
    animationMetadata: { frameCount: 40, durationMs: 2000, loop: true }
  },
  {
    id: 'asset_loop_megafone_ondas',
    name: 'Megafone Ondas Sonoras',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 90"><style>@keyframes soundWave1{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1);}}@keyframes soundWave2{0%,100%{opacity:0.1;transform:scale(0.7);}60%{opacity:1;transform:scale(1.1);}}@keyframes megaShake{0%,100%{transform:rotate(0deg);}50%{transform:rotate(-4deg) scale(1.02);}}.mega{transform-origin:22px 55px;animation:megaShake 0.6s infinite ease-in-out;}.w1{transform-origin:58px 45px;animation:soundWave1 0.8s infinite ease-in-out;}.w2{transform-origin:58px 45px;animation:soundWave2 0.8s infinite ease-in-out 0.2s;}</style><g class="mega"><polygon points="22,35 58,15 58,75 22,55" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><rect x="12" y="36" width="10" height="18" rx="3" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/><path d="M50 45 L42 75 L32 70" fill="none" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/></g><path class="w1" d="M68 30 Q78 45 68 60" fill="none" stroke="%23FF5722" stroke-width="5" stroke-linecap="round"/><path class="w2" d="M80 20 Q96 45 80 70" fill="none" stroke="%23FFB800" stroke-width="6" stroke-linecap="round"/></svg>',
    tags: ['megafone', 'protesto', 'voz', 'som', 'ondas', 'loop', 'animado'],
    aspectRatio: 1.22,
    animationMetadata: { frameCount: 20, durationMs: 800, loop: true }
  },
  {
    id: 'asset_loop_seta_bounce',
    name: 'Seta Graffiti Bounce',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 65"><style>@keyframes arrowBounce{0%,100%{transform:translateX(0);}50%{transform:translateX(14px);}}.arrow{animation:arrowBounce 0.7s infinite cubic-bezier(0.25, 1, 0.5, 1);}</style><g class="arrow"><path d="M10 24 L60 24 L50 8 L95 32 L50 56 L60 40 L10 40 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="4" stroke-linejoin="round"/><circle cx="25" cy="32" r="4" fill="%23FFB800"/><circle cx="42" cy="32" r="4" fill="%23FFB800"/></g></svg>',
    tags: ['seta', 'bounce', 'direcao', 'pulo', 'grafite', 'loop', 'animado'],
    aspectRatio: 1.69,
    animationMetadata: { frameCount: 20, durationMs: 700, loop: true }
  },
  {
    id: 'asset_loop_smiley_glitch',
    name: 'Smiley Street Glitch',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes glitchMove{0%,100%{transform:translate(0,0);}20%{transform:translate(-3px,2px);}40%{transform:translate(3px,-2px);}60%{transform:translate(-2px,-1px);}80%{transform:translate(2px,1px);}}@keyframes colorShift{0%,100%{fill:%23FFB800;}50%{fill:%23FF5722;}}.face{transform-origin:50%25 50%25;animation:glitchMove 0.8s infinite steps(2,start);}.bg-circle{animation:colorShift 1.6s infinite alternate;}</style><g class="face"><circle class="bg-circle" cx="50" cy="50" r="40" fill="%23FFB800" stroke="%232D2A26" stroke-width="5"/><line x1="30" y1="32" x2="42" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="42" y1="32" x2="30" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="58" y1="32" x2="70" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="32" x2="58" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><path d="M28 62 Q50 82 72 62" fill="none" stroke="%232D2A26" stroke-width="6" stroke-linecap="round"/></g></svg>',
    tags: ['smiley', 'glitch', 'sorriso', 'carinha', 'urbano', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 24, durationMs: 800, loop: true }
  },
  {
    id: 'asset_loop_radar_pulso',
    name: 'Pulso Vibe Sonar',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes radarWave{0%{r:10;opacity:1;stroke-width:6;}100%{r:46;opacity:0;stroke-width:1;}}.r1{animation:radarWave 1.6s infinite ease-out;}.r2{animation:radarWave 1.6s infinite ease-out 0.5s;}.r3{animation:radarWave 1.6s infinite ease-out 1.0s;}</style><circle cx="50" cy="50" r="10" fill="%23FF5722"/><circle class="r1" cx="50" cy="50" r="10" fill="none" stroke="%23FFB800"/><circle class="r2" cx="50" cy="50" r="10" fill="none" stroke="%23FF5722"/><circle class="r3" cx="50" cy="50" r="10" fill="none" stroke="%2300E5FF"/></svg>',
    tags: ['sonar', 'radar', 'pulso', 'onda', 'alvo', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 32, durationMs: 1600, loop: true }
  },
  {
    id: 'asset_loop_skate_spin',
    name: 'Roda Skate Rotação',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes wheelSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.spin-wheel{transform-origin:50%25 50%25;animation:wheelSpin 0.7s infinite linear;}</style><circle cx="50" cy="50" r="42" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="%23FF5722"/><g class="spin-wheel"><circle cx="50" cy="50" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="22" r="5" fill="%232D2A26"/><circle cx="78" cy="50" r="5" fill="%232D2A26"/><circle cx="50" cy="78" r="5" fill="%232D2A26"/><circle cx="22" cy="50" r="5" fill="%232D2A26"/><line x1="50" y1="36" x2="50" y2="64" stroke="%232D2A26" stroke-width="3"/><line x1="36" y1="50" x2="64" y2="50" stroke="%232D2A26" stroke-width="3"/></g></svg>',
    tags: ['skate', 'roda', 'giro', 'speed', 'spin', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 20, durationMs: 700, loop: true }
  },
  {
    id: 'asset_loop_fagulhas_cerrado',
    name: 'Fagulhas Brasa Cerrado',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sparkFloat1{0%{transform:translate(0,0) scale(0.6);opacity:0;}40%{opacity:1;}100%{transform:translate(-8px,-55px) scale(1.1);opacity:0;}}@keyframes sparkFloat2{0%{transform:translate(0,0) scale(0.6);opacity:0;}40%{opacity:1;}100%{transform:translate(10px,-65px) scale(1);opacity:0;}}@keyframes sparkFloat3{0%{transform:translate(0,0) scale(0.4);opacity:0;}40%{opacity:1;}100%{transform:translate(-2px,-75px) scale(1.2);opacity:0;}}.spk1{animation:sparkFloat1 1.2s infinite ease-out;}.spk2{animation:sparkFloat2 1.5s infinite ease-out 0.4s;}.spk3{animation:sparkFloat3 1.3s infinite ease-out 0.8s;}</style><ellipse cx="50" cy="85" rx="35" ry="10" fill="%232D2A26"/><circle cx="50" cy="82" r="14" fill="%23FF5722"/><circle cx="50" cy="82" r="8" fill="%23FFB800"/><polygon class="spk1" points="40,75 42,70 44,75 49,77 44,79 42,84 40,79 35,77" fill="%23FFD700"/><polygon class="spk2" points="60,75 62,70 64,75 69,77 64,79 62,84 60,79 55,77" fill="%23FF5722"/><polygon class="spk3" points="50,70 52,65 54,70 59,72 54,74 52,79 50,74 45,72" fill="%23FFF59D"/></svg>',
    tags: ['fagulha', 'fogo', 'brasa', 'cerrado', 'luz', 'particulas', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 30, durationMs: 1300, loop: true }
  },
  {
    id: 'asset_loop_disco_vinil',
    name: 'Vinil DJ Scratch 33RPM',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes vinylSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.vinyl{transform-origin:50%25 50%25;animation:vinylSpin 1.8s infinite linear;}</style><g class="vinyl"><circle cx="50" cy="50" r="45" fill="%231E1E1E" stroke="%232D2A26" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23333333" stroke-width="1.5"/><circle cx="50" cy="50" r="32" fill="none" stroke="%23444444" stroke-width="1.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="%23333333" stroke-width="1.5"/><circle cx="50" cy="50" r="16" fill="%23FF5722"/><circle cx="50" cy="50" r="8" fill="%23FFB800"/><circle cx="50" cy="50" r="3" fill="%23FFFFFF"/></g></svg>',
    tags: ['vinil', 'disco', 'dj', 'scratch', 'hiphop', 'musica', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 36, durationMs: 1800, loop: true }
  },
  {
    id: 'asset_loop_neon_pmw',
    name: 'Letreiro Neon PMW VIVE',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 65"><style>@keyframes neonFlicker{0%,19%,21%,23%,25%,54%,56%,100%{filter:drop-shadow(0 0 6px %2300E5FF) drop-shadow(0 0 14px %2300E5FF);opacity:1;}20%,24%,55%{filter:none;opacity:0.35;}}.neon-text{font-family:sans-serif;font-weight:900;font-size:20px;fill:%23FFFFFF;stroke:%2300E5FF;stroke-width:1.5;animation:neonFlicker 2s infinite;}</style><rect x="5" y="6" width="120" height="53" rx="10" fill="%23121212" stroke="%232D2A26" stroke-width="3"/><text class="neon-text" x="65" y="40" text-anchor="middle" letter-spacing="2">PMW VIVE</text></svg>',
    tags: ['neon', 'pmw vive', 'letreiro', 'brilho', 'flicker', 'loop', 'animado'],
    aspectRatio: 2.0,
    animationMetadata: { frameCount: 40, durationMs: 2000, loop: true }
  },
  {
    id: 'asset_loop_halo_neon',
    name: 'Auréola Halo Neon',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><style>@keyframes haloBob{0%,100%{transform:translateY(0) scaleY(1);}50%{transform:translateY(-8px) scaleY(1.06);}}@keyframes haloGlow{0%,100%{filter:drop-shadow(0 0 4px %23FFD700);stroke:%23FFD700;}50%{filter:drop-shadow(0 0 14px %23FF5722);stroke:%23FF5722;}}.halo{transform-origin:60px 35px;animation:haloBob 1.6s infinite ease-in-out;}.halo-ring{animation:haloGlow 1.2s infinite ease-in-out;}</style><g class="halo"><ellipse class="halo-ring" cx="60" cy="35" rx="46" ry="18" fill="none" stroke-width="6"/><ellipse cx="60" cy="35" rx="46" ry="18" fill="none" stroke="%23FFFFFF" stroke-width="2"/></g></svg>',
    tags: ['halo', 'aureola', 'anjo', 'luz', 'neon', 'glow', 'loop', 'animado'],
    aspectRatio: 1.71,
    animationMetadata: { frameCount: 30, durationMs: 1600, loop: true }
  },
  {
    id: 'asset_loop_rolo_loop',
    name: 'Rolo Pintura Rastro Vivo',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><style>@keyframes rollerPaint{0%,100%{transform:translateX(0);}50%{transform:translateX(24px);}}@keyframes paintTrail{0%,100%{width:35px;}50%{width:60px;}}.roller{animation:rollerPaint 1.2s infinite ease-in-out;}.trail{animation:paintTrail 1.2s infinite ease-in-out;}</style><rect class="trail" x="25" y="22" width="35" height="24" rx="4" fill="%23FFB800" opacity="0.8"/><g class="roller"><rect x="25" y="20" width="46" height="26" rx="6" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><path d="M71 33 L85 33 L85 62 L55 62 L55 88" fill="none" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><rect x="50" y="70" width="10" height="22" rx="3" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/></g></svg>',
    tags: ['rolo', 'tinta', 'pintura', 'grafite', 'muralismo', 'loop', 'animado'],
    aspectRatio: 1.2,
    animationMetadata: { frameCount: 24, durationMs: 1200, loop: true }
  },
  {
    id: 'asset_loop_alvo_giro',
    name: 'Mira Street Giroscópica',
    category: 'Animações em Loop',
    type: 'animated_sticker',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes spinClockwise{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}@keyframes spinCounter{0%{transform:rotate(0deg);}100%{transform:rotate(-360deg);}}.cw{transform-origin:50%25 50%25;animation:spinClockwise 3s infinite linear;}.ccw{transform-origin:50%25 50%25;animation:spinCounter 2s infinite linear;}</style><circle class="cw" cx="50" cy="50" r="38" fill="none" stroke="%23FFB800" stroke-width="5" stroke-dasharray="35 15 20 10"/><circle class="ccw" cx="50" cy="50" r="24" fill="none" stroke="%23FF5722" stroke-width="4" stroke-dasharray="25 10 15 8"/><circle cx="50" cy="50" r="8" fill="%2300E5FF"/><circle cx="50" cy="50" r="3" fill="%23FFFFFF"/></svg>',
    tags: ['mira', 'alvo', 'giro', 'radar', 'foco', 'loop', 'animado'],
    aspectRatio: 1.0,
    animationMetadata: { frameCount: 40, durationMs: 3000, loop: true }
  }
];
