export type AssetType = 'static_sticker' | 'animated_sticker';

export type AssetCategory =
  | 'Grafite & Bombing'
  | 'Cultura de Rua'
  | 'Tipografia Urbana'
  | 'Texturas & Rasgos'
  | 'Símbolos & Badges'
  | 'Linhas & Setas de Intervenção'
  | 'Animações em Loop'
  | 'Packs em Parceria';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  tags: string[]; // array para busca textual rápida
  aspectRatio: number; // width / height (ex: 1.0 para quadrado)
  animationMetadata?: {
    frameCount?: number;
    durationMs?: number;
    loop?: boolean;
  };
  packId?: string; // ID do pack patrocinado opcional
  sponsorName?: string; // Nome do patrocinador para exibição
}

export interface SponsorProfile {
  id: string;
  name: string;
  logoUrl: string;
  brandColor?: string;
  websiteUrl?: string;
}

export interface BrandedAssetPack {
  id: string;
  title: string;
  sponsor: SponsorProfile;
  active: boolean;
  startDate: string;
  endDate: string;
  items: AssetItem[];
  usageCount: number; // Quantas vezes stickers deste pack foram usados em remixes
  description?: string;
}

export interface BrandedChallenge {
  id: string;
  title: string;
  description: string;
  sponsor: SponsorProfile;
  prizeDescription: string; // Ex: 'Kit de Equipamentos Criativos + R$ 1.500 em Bolsa Cultural'
  rewardVibePoints: number;
  bannerUrl: string;
  active: boolean;
  startDate: string;
  endDate: string;
  submissionsCount: number;
  featuredNeighborhood?: string;
  rules?: string[];
  tags?: string[];
}
