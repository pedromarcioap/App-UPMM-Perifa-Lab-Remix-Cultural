import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2,
  Trophy,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  Check,
  X,
  Tag,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Flame,
  HelpCircle,
  FolderPlus,
  RefreshCw,
  Gift
} from 'lucide-react';
import { BrandedChallenge, BrandedAssetPack, SponsorProfile, AssetItem, User, PhotoBase } from '../types';
import { PALMAS_NEIGHBORHOODS, PRESET_TAGS } from '../constants';

interface AdminSponsorshipCMSProps {
  brandedChallenges?: BrandedChallenge[];
  brandedPacks?: BrandedAssetPack[];
  photos?: PhotoBase[];
  currentUser?: User | null;
  onSaveBrandedChallenge?: (challenge: BrandedChallenge) => void;
  onDeleteBrandedChallenge?: (challengeId: string) => void;
  onToggleBrandedChallengeStatus?: (challengeId: string, active: boolean) => void;
  onSaveBrandedPack?: (pack: BrandedAssetPack) => void;
  onDeleteBrandedPack?: (packId: string) => void;
  onToggleBrandedPackStatus?: (packId: string, active: boolean) => void;
  onToggleAdminDemo?: () => void;
}

const PRESET_SPONSORS: SponsorProfile[] = [
  {
    id: 'sponsor_tintas_tocantins',
    name: 'Tintas Tocantins',
    logoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=80',
    brandColor: '#FF9800',
    websiteUrl: 'https://tintastocantins.com.br'
  },
  {
    id: 'sponsor_banco_criativo',
    name: 'Banco Criativo Tocantins',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=160&q=80',
    brandColor: '#00E5FF',
    websiteUrl: 'https://bancocriativotocantins.org'
  },
  {
    id: 'sponsor_sol_cerrado_wear',
    name: 'Sol do Cerrado Streetwear',
    logoUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=160&q=80',
    brandColor: '#E91E63',
    websiteUrl: 'https://soldocerradostreet.com.br'
  },
  {
    id: 'sponsor_sesc_to_cultura',
    name: 'Fecomércio / Sesc Tocantins',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=160&q=80',
    brandColor: '#4CAF50',
    websiteUrl: 'https://sescto.com.br'
  }
];

const PRESET_BANNERS = [
  { label: 'Cores Vibrantes & Spray', url: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mural & Arte Urbana', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Luz Solar & Cerrado', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Arte Digital & Hologramas', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cultura de Rua & Comunidade', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80' }
];

export const AdminSponsorshipCMS: React.FC<AdminSponsorshipCMSProps> = ({
  brandedChallenges = [],
  brandedPacks = [],
  photos = [],
  currentUser = null,
  onSaveBrandedChallenge,
  onDeleteBrandedChallenge,
  onToggleBrandedChallengeStatus,
  onSaveBrandedPack,
  onDeleteBrandedPack,
  onToggleBrandedPackStatus,
  onToggleAdminDemo
}) => {
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'metrics' | 'challenges' | 'packs' | 'ethics'>('metrics');
  const [subTabChallenge, setSubTabChallenge] = useState<'list' | 'create'>('list');
  const [subTabPack, setSubTabPack] = useState<'list' | 'create'>('list');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // --- FORM STATE: BRANDED CHALLENGE ---
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [chTitle, setChTitle] = useState('');
  const [chDescription, setChDescription] = useState('');
  const [chPrizeDescription, setChPrizeDescription] = useState('');
  const [chRewardVibe, setChRewardVibe] = useState<number>(200);
  const [chBannerUrl, setChBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [chStartDate, setChStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [chEndDate, setChEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [chActive, setChActive] = useState<boolean>(true);
  const [chNeighborhood, setChNeighborhood] = useState('Taquaralto');
  const [chRules, setChRules] = useState<string[]>([
    'Remixes criados no Estúdio UPMM com foco na temática da marca parceira',
    'Utilizar ao menos 1 sticker da coleção patrocinada',
    'Respeito total às normas comunitárias e valorização da cultura tocantinense'
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [chTags, setChTags] = useState<string[]>(['#DesafioPatrocinado', '#PalmasCriativa', '#ArteUrbana']);
  const [newTagInput, setNewTagInput] = useState('');

  // Sponsor for challenge
  const [chSponsorName, setChSponsorName] = useState(PRESET_SPONSORS[0].name);
  const [chSponsorLogo, setChSponsorLogo] = useState(PRESET_SPONSORS[0].logoUrl);
  const [chSponsorColor, setChSponsorColor] = useState(PRESET_SPONSORS[0].brandColor || '#FFB800');
  const [chSponsorUrl, setChSponsorUrl] = useState(PRESET_SPONSORS[0].websiteUrl || '');

  // --- FORM STATE: BRANDED PACK ---
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [packTitle, setPackTitle] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packActive, setPackActive] = useState<boolean>(true);
  const [packStartDate, setPackStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [packEndDate, setPackEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [packItems, setPackItems] = useState<AssetItem[]>([]);

  // Sponsor for pack
  const [packSponsorName, setPackSponsorName] = useState(PRESET_SPONSORS[0].name);
  const [packSponsorLogo, setPackSponsorLogo] = useState(PRESET_SPONSORS[0].logoUrl);
  const [packSponsorColor, setPackSponsorColor] = useState(PRESET_SPONSORS[0].brandColor || '#FFB800');
  const [packSponsorUrl, setPackSponsorUrl] = useState(PRESET_SPONSORS[0].websiteUrl || '');

  // Sub-item creation inside Pack Form
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerUrl, setNewStickerUrl] = useState('');
  const [newStickerType, setNewStickerType] = useState<'static_sticker' | 'animated_sticker'>('static_sticker');
  const [newStickerTags, setNewStickerTags] = useState<string>('spray, tocantins, street');
  const [newStickerAspectRatio, setNewStickerAspectRatio] = useState<number>(1.0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- CALCULATED METRICS ---
  const totalSubmissions = useMemo(() => {
    return (brandedChallenges || []).reduce((acc, c) => acc + (c.submissionsCount || 0), 0);
  }, [brandedChallenges]);

  const totalAssetUsage = useMemo(() => {
    return (brandedPacks || []).reduce((acc, p) => acc + (p.usageCount || 0), 0);
  }, [brandedPacks]);

  const totalStickersInPacks = useMemo(() => {
    return (brandedPacks || []).reduce((acc, p) => acc + (p.items?.length || 0), 0);
  }, [brandedPacks]);

  const activeChallengesCount = useMemo(() => {
    return (brandedChallenges || []).filter(c => c.active).length;
  }, [brandedChallenges]);

  const activePacksCount = useMemo(() => {
    return (brandedPacks || []).filter(p => p.active).length;
  }, [brandedPacks]);

  // Unique sponsors count
  const uniqueSponsorsCount = useMemo(() => {
    const names = new Set<string>();
    (brandedChallenges || []).forEach(c => c.sponsor?.name && names.add(c.sponsor.name));
    (brandedPacks || []).forEach(p => p.sponsor?.name && names.add(p.sponsor.name));
    return names.size;
  }, [brandedChallenges, brandedPacks]);

  // Reset Challenge Form
  const resetChallengeForm = () => {
    setEditingChallengeId(null);
    setChTitle('');
    setChDescription('');
    setChPrizeDescription('');
    setChRewardVibe(200);
    setChBannerUrl(PRESET_BANNERS[0].url);
    setChStartDate(new Date().toISOString().split('T')[0]);
    setChEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setChActive(true);
    setChNeighborhood('Taquaralto');
    setChRules([
      'Remixes criados no Estúdio UPMM com foco na temática da marca parceira',
      'Utilizar ao menos 1 sticker da coleção patrocinada',
      'Respeito total às normas comunitárias e valorização da cultura tocantinense'
    ]);
    setChTags(['#DesafioPatrocinado', '#PalmasCriativa', '#ArteUrbana']);
    setChSponsorName(PRESET_SPONSORS[0].name);
    setChSponsorLogo(PRESET_SPONSORS[0].logoUrl);
    setChSponsorColor(PRESET_SPONSORS[0].brandColor || '#FFB800');
    setChSponsorUrl(PRESET_SPONSORS[0].websiteUrl || '');
  };

  // Load Challenge for Editing
  const handleEditChallenge = (challenge: BrandedChallenge) => {
    setEditingChallengeId(challenge.id);
    setChTitle(challenge.title);
    setChDescription(challenge.description);
    setChPrizeDescription(challenge.prizeDescription);
    setChRewardVibe(challenge.rewardVibePoints);
    setChBannerUrl(challenge.bannerUrl);
    setChStartDate(challenge.startDate);
    setChEndDate(challenge.endDate);
    setChActive(challenge.active);
    setChNeighborhood(challenge.featuredNeighborhood || 'Taquaralto');
    setChRules(challenge.rules || []);
    setChTags(challenge.tags || []);
    setChSponsorName(challenge.sponsor.name);
    setChSponsorLogo(challenge.sponsor.logoUrl);
    setChSponsorColor(challenge.sponsor.brandColor || '#FFB800');
    setChSponsorUrl(challenge.sponsor.websiteUrl || '');
    setSubTabChallenge('create');
    setActiveTab('challenges');
  };

  // Save Challenge Handler
  const handleSaveChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chTitle.trim()) {
      showToast('Por favor, informe o título do desafio');
      return;
    }
    if (!chPrizeDescription.trim()) {
      showToast('Por favor, descreva a premiação comunitária garantida');
      return;
    }
    if (!chSponsorName.trim()) {
      showToast('Por favor, informe o nome do patrocinador');
      return;
    }

    const challengeId = editingChallengeId || `branded_challenge_${Date.now()}`;
    const sponsorProfile: SponsorProfile = {
      id: `sponsor_${chSponsorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: chSponsorName.trim(),
      logoUrl: chSponsorLogo.trim() || PRESET_SPONSORS[0].logoUrl,
      brandColor: chSponsorColor,
      websiteUrl: chSponsorUrl.trim() || undefined
    };

    const newOrUpdatedChallenge: BrandedChallenge = {
      id: challengeId,
      title: chTitle.trim(),
      description: chDescription.trim(),
      sponsor: sponsorProfile,
      prizeDescription: chPrizeDescription.trim(),
      rewardVibePoints: Number(chRewardVibe) || 100,
      bannerUrl: chBannerUrl.trim() || PRESET_BANNERS[0].url,
      active: chActive,
      startDate: chStartDate,
      endDate: chEndDate,
      submissionsCount: editingChallengeId 
        ? (brandedChallenges.find(c => c.id === editingChallengeId)?.submissionsCount || 0)
        : 0,
      featuredNeighborhood: chNeighborhood,
      rules: chRules,
      tags: chTags
    };

    onSaveBrandedChallenge(newOrUpdatedChallenge);
    showToast(editingChallengeId ? 'Desafio patrocinado atualizado com sucesso!' : 'Novo desafio patrocinado criado com sucesso!');
    resetChallengeForm();
    setSubTabChallenge('list');
  };

  // Reset Pack Form
  const resetPackForm = () => {
    setEditingPackId(null);
    setPackTitle('');
    setPackDescription('');
    setPackActive(true);
    setPackStartDate(new Date().toISOString().split('T')[0]);
    setPackEndDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPackItems([]);
    setPackSponsorName(PRESET_SPONSORS[0].name);
    setPackSponsorLogo(PRESET_SPONSORS[0].logoUrl);
    setPackSponsorColor(PRESET_SPONSORS[0].brandColor || '#FFB800');
    setPackSponsorUrl(PRESET_SPONSORS[0].websiteUrl || '');
    setNewStickerName('');
    setNewStickerUrl('');
  };

  // Load Pack for Editing
  const handleEditPack = (pack: BrandedAssetPack) => {
    setEditingPackId(pack.id);
    setPackTitle(pack.title);
    setPackDescription(pack.description || '');
    setPackActive(pack.active);
    setPackStartDate(pack.startDate);
    setPackEndDate(pack.endDate);
    setPackItems(pack.items || []);
    setPackSponsorName(pack.sponsor.name);
    setPackSponsorLogo(pack.sponsor.logoUrl);
    setPackSponsorColor(pack.sponsor.brandColor || '#FFB800');
    setPackSponsorUrl(pack.sponsor.websiteUrl || '');
    setSubTabPack('create');
    setActiveTab('packs');
  };

  // Add Item to Pack Form
  const handleAddStickerToPack = () => {
    if (!newStickerName.trim()) {
      showToast('Informe o nome do sticker');
      return;
    }
    if (!newStickerUrl.trim()) {
      showToast('Informe a URL ou SVG do sticker');
      return;
    }

    const tagsArray = newStickerTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const newItem: AssetItem = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newStickerName.trim(),
      category: 'Packs em Parceria',
      type: newStickerType,
      url: newStickerUrl.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['patrocinado', 'sticker', packSponsorName.toLowerCase()],
      aspectRatio: newStickerAspectRatio,
      sponsorName: packSponsorName
    };

    setPackItems(prev => [...prev, newItem]);
    setNewStickerName('');
    setNewStickerUrl('');
    showToast('Sticker adicionado à coleção!');
  };

  // Remove Item from Pack Form
  const handleRemoveStickerFromPack = (itemId: string) => {
    setPackItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Save Pack Handler
  const handleSavePackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packTitle.trim()) {
      showToast('Informe o título do pack');
      return;
    }
    if (!packSponsorName.trim()) {
      showToast('Informe o patrocinador do pack');
      return;
    }
    if (packItems.length === 0) {
      showToast('Adicione pelo menos 1 sticker à coleção do pack');
      return;
    }

    const packId = editingPackId || `branded_pack_${Date.now()}`;
    const sponsorProfile: SponsorProfile = {
      id: `sponsor_${packSponsorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: packSponsorName.trim(),
      logoUrl: packSponsorLogo.trim() || PRESET_SPONSORS[0].logoUrl,
      brandColor: packSponsorColor,
      websiteUrl: packSponsorUrl.trim() || undefined
    };

    // Ensure all items carry packId and sponsorName
    const formattedItems: AssetItem[] = packItems.map(item => ({
      ...item,
      packId,
      sponsorName: packSponsorName
    }));

    const newOrUpdatedPack: BrandedAssetPack = {
      id: packId,
      title: packTitle.trim(),
      sponsor: sponsorProfile,
      active: packActive,
      startDate: packStartDate,
      endDate: packEndDate,
      items: formattedItems,
      usageCount: editingPackId
        ? (brandedPacks.find(p => p.id === editingPackId)?.usageCount || 0)
        : 0,
      description: packDescription.trim() || undefined
    };

    onSaveBrandedPack(newOrUpdatedPack);
    showToast(editingPackId ? 'Pack de stickers atualizado com sucesso!' : 'Novo pack de stickers criado com sucesso!');
    resetPackForm();
    setSubTabPack('list');
  };

  // Sample SVG Sticker Presets for fast addition
  const SAMPLE_STICKER_PRESETS = [
    {
      name: 'Logo Badge Circular Estilizado',
      type: 'static_sticker' as const,
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232D2A26" stroke="%23FF9800" stroke-width="5"/><circle cx="50" cy="50" r="32" fill="%23FF9800"/><text x="50" y="55" font-family="sans-serif" font-weight="900" font-size="12" fill="%232D2A26" text-anchor="middle">PARCERIA</text></svg>',
      aspectRatio: 1.0,
      tags: 'selo, badge, parceria, circular'
    },
    {
      name: 'Lata de Tinta Street PMW',
      type: 'static_sticker' as const,
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><rect x="30" y="45" width="40" height="75" rx="8" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><rect x="40" y="26" width="20" height="20" rx="4" fill="%232D2A26"/><circle cx="50" cy="20" r="6" fill="%23FFFFFF"/><text x="50" y="75" font-family="sans-serif" font-weight="900" font-size="8" fill="%23FFFFFF" text-anchor="middle">SPRAY</text></svg>',
      aspectRatio: 0.77,
      tags: 'spray, tinta, lata, street'
    },
    {
      name: 'Tag de Fomento Cultural Neon',
      type: 'static_sticker' as const,
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 70"><rect x="5" y="5" width="140" height="60" rx="10" fill="%2300E5FF" fill-opacity="0.2" stroke="%2300E5FF" stroke-width="3"/><text x="75" y="32" font-family="sans-serif" font-weight="900" font-size="11" fill="%2300E5FF" text-anchor="middle">APOIO CULTURAL</text><text x="75" y="50" font-family="sans-serif" font-weight="900" font-size="9" fill="%23FFFFFF" text-anchor="middle">PALMAS - TO</text></svg>',
      aspectRatio: 2.14,
      tags: 'apoio, fomento, neon, tag'
    }
  ];

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FACC15] text-[#18181B] font-black text-xs uppercase px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border-2 border-amber-400 animate-bounce">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-[#18181B] border-b border-zinc-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/challenges')}
              className="p-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Voltar ao CMS Geral"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFB800] to-[#FF5722] text-[#18181B] flex items-center justify-center font-black shadow-lg">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white uppercase">Gestão Comercial & Patrocínios B2B</h1>
                <span className="text-[10px] bg-amber-500/20 text-[#FFB800] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                  UPMM Monetização Ética
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Gerencie desafios patrocinados, packs de stickers de marcas parceiras e métricas de impacto comunitário.
              </p>
            </div>
          </div>

          {/* Quick Actions / Link to client view */}
          <div className="flex items-center gap-2">
            <Link
              to="/challenges"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold uppercase transition flex items-center gap-1.5"
            >
              <Eye size={15} />
              <span>Ver no App</span>
            </Link>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-zinc-800/80 overflow-x-auto py-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-[#FFB800] text-[#18181B] shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BarChart3 size={15} />
            <span>Dashboard & Métricas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-[#FFB800] text-[#18181B] shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Trophy size={15} />
            <span>Desafios Patrocinados ({brandedChallenges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'packs'
                ? 'bg-[#FFB800] text-[#18181B] shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers size={15} />
            <span>Packs de Stickers ({brandedPacks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ethics')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ethics'
                ? 'bg-[#FFB800] text-[#18181B] shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Diretrizes de Monetização</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD DE MÉTRICAS B2B */}
        {/* ========================================================= */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Desafios Ativos</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#FFB800] flex items-center justify-center">
                    <Trophy size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{activeChallengesCount}</span>
                  <span className="text-xs text-zinc-500">/ {brandedChallenges.length} total</span>
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Desafios temáticos remunerados e com bolsas ativas.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Packs de Stickers</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{activePacksCount}</span>
                  <span className="text-xs text-zinc-500">({totalStickersInPacks} stickers)</span>
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Coleções ativas no Estúdio UPMM para uso livre.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stickers Inseridos</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Zap size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">{totalAssetUsage}</span>
                  <span className="text-xs text-zinc-500">usos em remixes</span>
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Total de aplicações de assets de parceiros nas artes.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>

              <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submissões Criativas</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{totalSubmissions}</span>
                  <span className="text-xs text-zinc-500">artes inscritas</span>
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Obras submetidas aos desafios de marcas parceiras.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

            {/* Top Sponsors Performance & Value Realized */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Partner Brands Grid */}
              <div className="lg:col-span-2 bg-[#18181B] border border-zinc-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <Building2 size={16} className="text-[#FFB800]" />
                      <span>Marcas Parceiras & Fomento Cultural</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Empresas e instituições apoiando financeiramente a cena de Palmas ({uniqueSponsorsCount} parceiros cadastrados).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {PRESET_SPONSORS.map(sponsor => {
                    const sponsorChallenges = (brandedChallenges || []).filter(c => c.sponsor?.name === sponsor.name);
                    const sponsorPacks = (brandedPacks || []).filter(p => p.sponsor?.name === sponsor.name);
                    const totalPackUsage = (sponsorPacks || []).reduce((acc, p) => acc + (p.usageCount || 0), 0);

                    return (
                      <div
                        key={sponsor.id}
                        className="bg-[#202024] hover:bg-[#27272A] border border-zinc-800/80 rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-700 bg-zinc-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-white">{sponsor.name}</h4>
                              {sponsor.brandColor && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/40 shadow-xs"
                                  style={{ backgroundColor: sponsor.brandColor }}
                                  title={`Cor da marca: ${sponsor.brandColor}`}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 flex-wrap">
                              <span>🏆 {sponsorChallenges.length} Desafios</span>
                              <span>📦 {sponsorPacks.length} Packs de Stickers</span>
                              <span className="text-emerald-400 font-bold">⚡ {totalPackUsage} Usos em Artes</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {sponsor.websiteUrl && (
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <ExternalLink size={13} />
                              <span>Site Oficial</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Community Impact Summary Card */}
              <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <Gift size={16} className="text-[#FFB800]" />
                    <span>Fomento Direto à Comunidade</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Como as marcas parceiras investem na cena visual sem publicidade agressiva:
                  </p>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
                      <span className="text-amber-400 font-black text-xs uppercase block">100% Gratuito para o Usuário</span>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Os artistas nunca pagam para usar stickers, remixar ou participar de batalhas.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
                      <span className="text-emerald-400 font-black text-xs uppercase block">Bolsas & Equipamentos</span>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Patrocinadores financiam tablets, latas de spray profissionais e prêmios em dinheiro direto aos vencedores.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
                      <span className="text-blue-400 font-black text-xs uppercase block">Transparência & Respeito</span>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Sem pop-ups invasivos ou anúncios no feed. As marcas aparecem como incentivadoras da cultura urbana.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('challenges');
                      setSubTabChallenge('create');
                    }}
                    className="w-full py-3 bg-[#FFB800] hover:bg-amber-400 text-[#18181B] font-black uppercase text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Criar Novo Desafio Patrocinado</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GESTÃO DE DESAFIOS PATROCINADOS (CRUD) */}
        {/* ========================================================= */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Sub-navigation for Challenges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] p-4 rounded-3xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubTabChallenge('list')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    subTabChallenge === 'list'
                      ? 'bg-[#FFB800] text-[#18181B]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Lista de Desafios ({brandedChallenges.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetChallengeForm();
                    setSubTabChallenge('create');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
                    subTabChallenge === 'create'
                      ? 'bg-[#FFB800] text-[#18181B]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Plus size={14} />
                  <span>{editingChallengeId ? 'Editar Desafio' : 'Novo Desafio Patrocinado'}</span>
                </button>
              </div>

              {subTabChallenge === 'list' && (
                <div className="flex items-center gap-2">
                  <select
                    value={filterActive}
                    onChange={(e: any) => setFilterActive(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Somente Ativos</option>
                    <option value="inactive">Somente Inativos</option>
                  </select>
                </div>
              )}
            </div>

            {/* LIST VIEW */}
            {subTabChallenge === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandedChallenges
                  .filter(c => {
                    if (filterActive === 'active') return c.active;
                    if (filterActive === 'inactive') return !c.active;
                    return true;
                  })
                  .map(challenge => (
                    <div
                      key={challenge.id}
                      className="bg-[#18181B] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition hover:border-zinc-700"
                    >
                      {/* Banner header with Sponsor Badge */}
                      <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                        <img
                          src={challenge.bannerUrl}
                          alt={challenge.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-[#18181B]/40 to-transparent" />

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                            <img
                              src={challenge.sponsor.logoUrl}
                              alt={challenge.sponsor.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-[11px] font-black uppercase text-white">
                              {challenge.sponsor.name}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md ${
                              challenge.active
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            {challenge.active ? 'Ativo no App' : 'Inativo / Rascunho'}
                          </span>
                        </div>

                        {/* Bottom tags on image */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                          <span className="text-xs bg-[#FFB800] text-[#18181B] font-black px-2.5 py-1 rounded-lg shadow uppercase">
                            +{challenge.rewardVibePoints} Vibes
                          </span>
                          <span className="text-[11px] text-zinc-300 font-bold bg-black/60 px-2 py-0.5 rounded-md">
                            {challenge.submissionsCount} submissões
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-base font-black text-white leading-snug">
                            {challenge.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">
                            {challenge.description}
                          </p>

                          {/* Guaranteed Prize Callout */}
                          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase">
                              <Award size={13} />
                              <span>Premiação Comunitária Garantida</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-200 mt-0.5">
                              {challenge.prizeDescription}
                            </p>
                          </div>

                          {/* Date Range & Neighborhood */}
                          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-[#FFB800]" />
                              <span>{challenge.startDate} até {challenge.endDate}</span>
                            </span>
                            {challenge.featuredNeighborhood && (
                              <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {challenge.featuredNeighborhood}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleBrandedChallengeStatus(challenge.id, !challenge.active)}
                            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 ${
                              challenge.active
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400'
                            }`}
                          >
                            <RefreshCw size={14} />
                            <span>{challenge.active ? 'Pausar Desafio' : 'Ativar Desafio'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditChallenge(challenge)}
                              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-black uppercase transition flex items-center gap-1.5"
                            >
                              <Edit3 size={14} />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja remover o desafio "${challenge.title}"?`)) {
                                  onDeleteBrandedChallenge(challenge.id);
                                  showToast('Desafio removido!');
                                }
                              }}
                              className="min-h-[40px] p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                              title="Remover Desafio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* CREATE / EDIT FORM VIEW */}
            {subTabChallenge === 'create' && (
              <form onSubmit={handleSaveChallengeSubmit} className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                      <Trophy size={18} className="text-[#FFB800]" />
                      <span>{editingChallengeId ? 'Editar Desafio Patrocinado' : 'Cadastrar Novo Desafio Patrocinado'}</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure os dados da campanha parceira, prêmios e período de vigência.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetChallengeForm();
                      setSubTabChallenge('list');
                    }}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Challenge Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Título do Desafio *</label>
                      <input
                        type="text"
                        value={chTitle}
                        onChange={(e) => setChTitle(e.target.value)}
                        placeholder="Ex: Desafio Tintas Tocantins • Cores do Cerrado Vivo"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Descrição / Briefing Criativo *</label>
                      <textarea
                        rows={3}
                        value={chDescription}
                        onChange={(e) => setChDescription(e.target.value)}
                        placeholder="Explique o tema criativo e o objetivo artístico do desafio para a comunidade..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-amber-400 mb-1">
                        Descrição da Premiação Comunitária *
                      </label>
                      <input
                        type="text"
                        value={chPrizeDescription}
                        onChange={(e) => setChPrizeDescription(e.target.value)}
                        placeholder="Ex: R$ 2.000 em Bolsa Cultural + Kit com 24 Latas de Spray Premium"
                        className="w-full bg-zinc-900 border border-amber-500/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Recompensa Vibe Points</label>
                        <input
                          type="number"
                          value={chRewardVibe}
                          onChange={(e) => setChRewardVibe(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Bairro / Setor em Destaque</label>
                        <select
                          value={chNeighborhood}
                          onChange={(e) => setChNeighborhood(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        >
                          {PALMAS_NEIGHBORHOODS.map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Data de Início</label>
                        <input
                          type="date"
                          value={chStartDate}
                          onChange={(e) => setChStartDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Data de Encerramento</label>
                        <input
                          type="date"
                          value={chEndDate}
                          onChange={(e) => setChEndDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sponsor Data & Banner */}
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#FFB800]" />
                        <span>Dados da Marca Patrocinadora</span>
                      </h4>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1">Predefinição Rápida de Parceiro</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_SPONSORS.map(sp => (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => {
                                setChSponsorName(sp.name);
                                setChSponsorLogo(sp.logoUrl);
                                setChSponsorColor(sp.brandColor || '#FFB800');
                                setChSponsorUrl(sp.websiteUrl || '');
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition ${
                                chSponsorName === sp.name
                                  ? 'bg-amber-500/20 border-[#FFB800] text-white'
                                  : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <img src={sp.logoUrl} alt={sp.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-md object-cover" />
                              <span className="text-xs font-bold truncate">{sp.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Nome do Patrocinador *</label>
                          <input
                            type="text"
                            value={chSponsorName}
                            onChange={(e) => setChSponsorName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Cor da Marca (HEX)</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={chSponsorColor}
                              onChange={(e) => setChSponsorColor(e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={chSponsorColor}
                              onChange={(e) => setChSponsorColor(e.target.value)}
                              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-white uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">URL do Logo</label>
                          <input
                            type="url"
                            value={chSponsorLogo}
                            onChange={(e) => setChSponsorLogo(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Site / Link da Marca</label>
                          <input
                            type="url"
                            value={chSponsorUrl}
                            onChange={(e) => setChSponsorUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banner Selector */}
                    <div>
                      <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Banner do Desafio</label>
                      <input
                        type="url"
                        value={chBannerUrl}
                        onChange={(e) => setChBannerUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white mb-2"
                      />
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {PRESET_BANNERS.map((b, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setChBannerUrl(b.url)}
                            className={`relative h-14 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                              chBannerUrl === b.url ? 'border-[#FFB800]' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={b.url} alt={b.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <div>
                        <span className="text-xs font-black uppercase text-white block">Status da Campanha</span>
                        <span className="text-[11px] text-zinc-400">Ativar exibição imediata no feed de desafios</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setChActive(!chActive)}
                        className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                          chActive ? 'bg-emerald-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            chActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      resetChallengeForm();
                      setSubTabChallenge('list');
                    }}
                    className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black uppercase text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-[#FFB800] hover:bg-amber-400 text-[#18181B] font-black uppercase text-xs transition shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{editingChallengeId ? 'Atualizar Desafio' : 'Salvar Desafio Patrocinado'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GESTÃO DE PACKS DE STICKERS PATROCINADOS (CRUD) */}
        {/* ========================================================= */}
        {activeTab === 'packs' && (
          <div className="space-y-6">
            {/* Sub-navigation for Packs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] p-4 rounded-3xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubTabPack('list')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    subTabPack === 'list'
                      ? 'bg-[#FFB800] text-[#18181B]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Lista de Packs ({brandedPacks.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetPackForm();
                    setSubTabPack('create');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
                    subTabPack === 'create'
                      ? 'bg-[#FFB800] text-[#18181B]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Plus size={14} />
                  <span>{editingPackId ? 'Editar Pack' : 'Novo Pack de Stickers'}</span>
                </button>
              </div>
            </div>

            {/* PACKS LIST VIEW */}
            {subTabPack === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandedPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 group hover:border-zinc-700 transition"
                  >
                    <div>
                      {/* Top Bar with Sponsor Info */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={pack.sponsor.logoUrl}
                            alt={pack.sponsor.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-700 bg-zinc-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                Coleção Oficial
                              </span>
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: pack.sponsor.brandColor || '#FFB800' }}
                              />
                            </div>
                            <h4 className="font-black text-sm text-white">{pack.sponsor.name}</h4>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            pack.active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {pack.active ? 'Disponível no Estúdio' : 'Inativo'}
                        </span>
                      </div>

                      {/* Pack Title & Description */}
                      <h3 className="text-base font-black text-white mt-3 leading-snug">
                        {pack.title}
                      </h3>
                      {pack.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {pack.description}
                        </p>
                      )}

                      {/* Stickers Preview Strip */}
                      <div className="mt-4 p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-2">
                          <span>Assets da Coleção ({pack.items?.length || 0})</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Zap size={12} />
                            <span>{pack.usageCount} utilizações em remixes</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {pack.items?.slice(0, 6).map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="h-14 bg-zinc-800 rounded-xl flex items-center justify-center p-1.5 border border-zinc-700/60"
                              title={item.name}
                            >
                              <img
                                src={item.thumbnailUrl || item.url}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleBrandedPackStatus(pack.id, !pack.active)}
                        className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 ${
                          pack.active
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
                            : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400'
                        }`}
                      >
                        <RefreshCw size={13} />
                        <span>{pack.active ? 'Pausar Pack' : 'Ativar Pack'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditPack(pack)}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-black uppercase transition flex items-center gap-1.5"
                        >
                          <Edit3 size={13} />
                          <span>Gerenciar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja remover o pack "${pack.title}"?`)) {
                              onDeleteBrandedPack(pack.id);
                              showToast('Pack de stickers removido!');
                            }
                          }}
                          className="min-h-[40px] p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Remover Pack"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CREATE / EDIT PACK FORM VIEW */}
            {subTabPack === 'create' && (
              <form onSubmit={handleSavePackSubmit} className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                      <Layers size={18} className="text-[#FFB800]" />
                      <span>{editingPackId ? 'Editar Pack de Stickers' : 'Novo Pack de Stickers Patrocinado'}</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure a coleção de stickers SVG/PNG que ficará disponível na gaveta do Estúdio UPMM.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetPackForm();
                      setSubTabPack('list');
                    }}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Pack Meta & Sponsor */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Título do Pack *</label>
                      <input
                        type="text"
                        value={packTitle}
                        onChange={(e) => setPackTitle(e.target.value)}
                        placeholder="Ex: Pack Especial Tintas Tocantins • Street Drip & Caps"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-zinc-300 mb-1">Descrição da Coleção</label>
                      <textarea
                        rows={2}
                        value={packDescription}
                        onChange={(e) => setPackDescription(e.target.value)}
                        placeholder="Conte o que este pack traz (ex: latas exclusivas, texturas, tags e caligrafias)..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FFB800]"
                      />
                    </div>

                    {/* Sponsor selection */}
                    <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#FFB800]" />
                        <span>Patrocinador da Coleção</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_SPONSORS.map(sp => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => {
                              setPackSponsorName(sp.name);
                              setPackSponsorLogo(sp.logoUrl);
                              setPackSponsorColor(sp.brandColor || '#FFB800');
                              setPackSponsorUrl(sp.websiteUrl || '');
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition ${
                              packSponsorName === sp.name
                                ? 'bg-amber-500/20 border-[#FFB800] text-white'
                                : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <img src={sp.logoUrl} alt={sp.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-md object-cover" />
                            <span className="text-xs font-bold truncate">{sp.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Nome da Marca *</label>
                          <input
                            type="text"
                            value={packSponsorName}
                            onChange={(e) => setPackSponsorName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Cor de Destaque</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={packSponsorColor}
                              onChange={(e) => setPackSponsorColor(e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={packSponsorColor}
                              onChange={(e) => setPackSponsorColor(e.target.value)}
                              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-white uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                      <div>
                        <span className="text-xs font-black uppercase text-white block">Status do Pack</span>
                        <span className="text-[11px] text-zinc-400">Exibir imediatamente na gaveta de assets</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPackActive(!packActive)}
                        className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                          packActive ? 'bg-emerald-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            packActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Right: Sticker Items Manager */}
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-[#FFB800] flex items-center gap-1.5">
                        <FolderPlus size={15} />
                        <span>Adicionar Sticker à Coleção</span>
                      </h4>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1">Nome do Sticker *</label>
                        <input
                          type="text"
                          value={newStickerName}
                          onChange={(e) => setNewStickerName(e.target.value)}
                          placeholder="Ex: Lata Dourada Sol do Cerrado"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1">URL da Imagem ou SVG Inline (Data URL) *</label>
                        <textarea
                          rows={2}
                          value={newStickerUrl}
                          onChange={(e) => setNewStickerUrl(e.target.value)}
                          placeholder="https://... ou data:image/svg+xml;utf8,<svg>...</svg>"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      {/* Quick preset stickers button */}
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block mb-1">Ou escolha um modelo rápido:</span>
                        <div className="flex gap-2">
                          {SAMPLE_STICKER_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNewStickerName(preset.name);
                                setNewStickerUrl(preset.url);
                                setNewStickerType(preset.type);
                                setNewStickerTags(preset.tags);
                                setNewStickerAspectRatio(preset.aspectRatio);
                              }}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold truncate max-w-[140px]"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Tags (separadas por vírgula)</label>
                          <input
                            type="text"
                            value={newStickerTags}
                            onChange={(e) => setNewStickerTags(e.target.value)}
                            placeholder="spray, tocantins, gold"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 mb-1">Proporção (Largura/Altura)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newStickerAspectRatio}
                            onChange={(e) => setNewStickerAspectRatio(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddStickerToPack}
                        className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-[#FFB800] border border-amber-500/40 rounded-xl font-black uppercase text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Adicionar Este Sticker</span>
                      </button>
                    </div>

                    {/* Current Items in Pack List */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-300 mb-2 flex items-center justify-between">
                        <span>Stickers no Pack ({packItems.length})</span>
                        <span className="text-[11px] text-zinc-500 font-normal">Mínimo 1 necessário</span>
                      </h4>

                      {packItems.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-xs">
                          Nenhum sticker adicionado ainda. Use o formulário acima para incluir assets.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {packItems.map(item => (
                            <div
                              key={item.id}
                              className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center p-1 shrink-0 border border-zinc-700/60">
                                  <img
                                    src={item.thumbnailUrl || item.url}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white block">{item.name}</span>
                                  <span className="text-[10px] text-zinc-400">Tags: {item.tags.join(', ')}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveStickerFromPack(item.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                title="Remover sticker"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      resetPackForm();
                      setSubTabPack('list');
                    }}
                    className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black uppercase text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-[#FFB800] hover:bg-amber-400 text-[#18181B] font-black uppercase text-xs transition shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{editingPackId ? 'Atualizar Pack' : 'Salvar Pack de Stickers'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DIRETRIZES DE MONETIZAÇÃO ÉTICA */}
        {/* ========================================================= */}
        {activeTab === 'ethics' && (
          <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#FFB800]" />
                <span>Manifesto & Diretrizes de Parceria B2B UPMM</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Como a plataforma equilibra a sustentabilidade financeira, o fomento aos artistas de Palmas e a preservação total da identidade urbana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-[#FFB800] font-black uppercase text-xs flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>1. Não-Intrusão Visual</span>
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Não existem banners piscantes, pop-ups que interrompem o fluxo criativo ou propagandas que poluem as fotos e o feed comunitário.
                </p>
              </div>

              <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-emerald-400 font-black uppercase text-xs flex items-center gap-1.5">
                  <Gift size={14} />
                  <span>2. Retorno Direto ao Artista</span>
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Todo investimento de marca parceira deve conter uma cota de premiação ou bolsa cultural destinada diretamente aos artistas participantes de Palmas e região.
                </p>
              </div>

              <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-blue-400 font-black uppercase text-xs flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>3. Valor Agregado ao Estúdio</span>
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Os packs de stickers devem ser esteticamente relevantes para a cultura de rua, graffiti, tipografia e memória tocantinense.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3">
              <HelpCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase text-amber-300">Como apresentar um novo parceiro comercial?</h4>
                <p className="text-[11px] text-zinc-300 mt-1">
                  Empresas interessadas em patrocinar desafios temáticos ou criar coleções de stickers podem entrar em contato com o conselho curatorial da UPMM pelo email oficial de fomento cultural.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSponsorshipCMS;
