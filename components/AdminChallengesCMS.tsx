import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Calendar, 
  MapPin, 
  Tag, 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Eye, 
  Save, 
  X, 
  Award,
  AlertCircle,
  HelpCircle,
  Layers,
  Crown,
  Check,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { WeeklyChallenge, PhotoBase, User, Badge } from '../types';
import { BADGES, PALMAS_NEIGHBORHOODS, PRESET_TAGS } from '../constants';

interface AdminChallengesCMSProps {
  challenges: WeeklyChallenge[];
  photos: PhotoBase[];
  currentUser: User | null;
  onSaveChallenge: (challenge: WeeklyChallenge) => void;
  onDeleteChallenge: (challengeId: string) => void;
  onSetWinner: (challengeId: string, photoId: string) => void;
  onToggleAdminDemo?: () => void;
}

const PRESET_BANNERS = [
  { label: 'Murais Urbanos', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cerrado & Luz Solar', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Graffiti de Quebrada', url: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Palmas Noturna & Neon', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Muro Concreto & Cores', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' }
];

const DEFAULT_GUIDELINES_SUGGESTIONS = [
  'Capturar pelo menos 1 fotografia original do setor indicado.',
  'Realizar intervenção visual ou remix digital no Estúdio UPMM.',
  'Explorar a paleta de cores solar e referências visuais do Cerrado tocantinense.',
  'Incluir elementos de lambe-lambe, stencil ou caligrafia urbana (tags).',
  'Respeitar a comunidade, os moradores locais e os murais já existentes.',
  'Adicionar as tags oficiais do desafio na legenda ou ficha técnica da obra.'
];

export const AdminChallengesCMS: React.FC<AdminChallengesCMSProps> = ({
  challenges,
  photos,
  currentUser,
  onSaveChallenge,
  onDeleteChallenge,
  onSetWinner,
  onToggleAdminDemo
}) => {
  const navigate = useNavigate();

  // Active View Tab inside CMS
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'winners'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Challenge Editor Form State
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rewardResponsa, setRewardResponsa] = useState<number>(35);
  const [rewardBadgeId, setRewardBadgeId] = useState<string>('weekly_warrior');
  const [featuredNeighborhood, setFeaturedNeighborhood] = useState<string>('Taquaralto');
  const [status, setStatus] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [rules, setRules] = useState<string[]>([]);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [tags, setTags] = useState<string[]>(['#DesafioSemanal', '#Cerrado']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Winner selection state
  const [selectedChallengeForWinner, setSelectedChallengeForWinner] = useState<string>(
    challenges[0]?.id || ''
  );

  // Admin Verification
  const isAdmin = Boolean(currentUser?.isAdmin || currentUser?.email === 'pedromarcioap@gmail.com');

  // Open Editor to create fresh challenge
  const handleOpenCreateNew = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    setEditingChallengeId(null);
    setTitle('');
    setSubtitle(`Temporada 2 • Semana ${challenges.length + 1}`);
    setTheme('');
    setDescription('');
    setBannerUrl(PRESET_BANNERS[0].url);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setRewardResponsa(35);
    setRewardBadgeId('weekly_warrior');
    setFeaturedNeighborhood('Setor Taquari');
    setStatus('active');
    setRules([
      'Capturar pelo menos 1 fotografia original do setor indicado.',
      'Realizar intervenção visual ou remix digital no Estúdio UPMM.',
      'Incluir a tag oficial #DesafioSemanal na postagem.'
    ]);
    setTags(['#DesafioSemanal', '#Cerrado', '#Taquari']);
    setFormSuccessMessage(null);
    setActiveTab('editor');
  };

  // Open Editor with existing challenge data
  const handleOpenEdit = (challenge: WeeklyChallenge) => {
    setEditingChallengeId(challenge.id);
    setTitle(challenge.title);
    setSubtitle(challenge.subtitle || '');
    setTheme(challenge.theme);
    setDescription(challenge.description);
    setBannerUrl(challenge.bannerUrl);
    setStartDate(challenge.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(challenge.endDate || '');
    setRewardResponsa(challenge.rewardResponsa || 35);
    setRewardBadgeId(challenge.rewardBadgeId || 'weekly_warrior');
    setFeaturedNeighborhood(challenge.featuredNeighborhood || 'Taquaralto');
    setStatus(challenge.status);
    setRules([...challenge.rules]);
    setTags([...challenge.tags]);
    setFormSuccessMessage(null);
    setActiveTab('editor');
  };

  // Duplicate a challenge as a quick template
  const handleDuplicate = (challenge: WeeklyChallenge) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    setEditingChallengeId(null);
    setTitle(`${challenge.title} (Nova Edição)`);
    setSubtitle(`Temporada 2 • Semana ${challenges.length + 1}`);
    setTheme(challenge.theme);
    setDescription(challenge.description);
    setBannerUrl(challenge.bannerUrl);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setRewardResponsa(challenge.rewardResponsa);
    setRewardBadgeId(challenge.rewardBadgeId);
    setFeaturedNeighborhood(challenge.featuredNeighborhood || 'Taquaralto');
    setStatus('upcoming');
    setRules([...challenge.rules]);
    setTags([...challenge.tags]);
    setFormSuccessMessage(null);
    setActiveTab('editor');
  };

  // Add rule to list
  const handleAddRule = (ruleText?: string) => {
    const text = (ruleText || newRuleInput).trim();
    if (!text) return;
    if (!rules.includes(text)) {
      setRules(prev => [...prev, text]);
    }
    setNewRuleInput('');
  };

  // Remove rule
  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  // Add tag
  const handleAddTag = (tagText?: string) => {
    let t = (tagText || newTagInput).trim();
    if (!t) return;
    if (!t.startsWith('#')) t = `#${t}`;
    if (!tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setNewTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Save Challenge (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormErrorMessage('Por favor, informe o título do desafio.');
      return;
    }
    if (!description.trim()) {
      setFormErrorMessage('Por favor, adicione uma descrição detalhada para orientar os artistas.');
      return;
    }
    setFormErrorMessage(null);

    const challengeId = editingChallengeId || `ch_${Date.now()}`;
    const newChallenge: WeeklyChallenge = {
      id: challengeId,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Desafio Semanal PMW',
      theme: theme.trim() || 'Arte Urbana e Territorialidade',
      description: description.trim(),
      bannerUrl: bannerUrl.trim() || PRESET_BANNERS[0].url,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      rewardResponsa: Number(rewardResponsa) || 35,
      rewardBadgeId: rewardBadgeId || 'weekly_warrior',
      featuredNeighborhood: featuredNeighborhood || 'Taquaralto',
      status: status,
      rules: rules.length > 0 ? rules : ['Capturar registro visual e remixar no Estúdio UPMM.'],
      tags: tags.length > 0 ? tags : ['#DesafioSemanal', '#Cerrado']
    };

    onSaveChallenge(newChallenge);
    setFormSuccessMessage(`Desafio "${newChallenge.title}" gravado e sincronizado com sucesso!`);
    setTimeout(() => {
      setFormSuccessMessage(null);
      setActiveTab('list');
    }, 1200);
  };

  // Direct status toggle from the list
  const handleToggleStatus = (challenge: WeeklyChallenge, nextStatus: 'active' | 'upcoming' | 'completed') => {
    const updated: WeeklyChallenge = {
      ...challenge,
      status: nextStatus
    };
    onSaveChallenge(updated);
  };

  // Confirm delete
  const handleDelete = (challenge: WeeklyChallenge) => {
    onDeleteChallenge(challenge.id);
  };

  // Filtered challenges in CMS list
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesSearch = !searchQuery.trim() || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.featuredNeighborhood && c.featuredNeighborhood.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [challenges, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = challenges.length;
    const active = challenges.filter(c => c.status === 'active').length;
    const upcoming = challenges.filter(c => c.status === 'upcoming').length;
    const completed = challenges.filter(c => c.status === 'completed').length;
    const totalSubmissions = photos.filter(p => Boolean(p.challengeId)).length;
    return { total, active, upcoming, completed, totalSubmissions };
  }, [challenges, photos]);

  // Selected challenge for winner assignment
  const targetWinnerChallenge = challenges.find(c => c.id === selectedChallengeForWinner) || challenges[0];
  const entriesForTargetChallenge = photos.filter(p => 
    p.challengeId === targetWinnerChallenge?.id ||
    targetWinnerChallenge?.tags.some(t => p.tags.includes(t)) ||
    (targetWinnerChallenge?.featuredNeighborhood && p.location?.neighborhood?.toLowerCase().includes(targetWinnerChallenge.featuredNeighborhood.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16">
      {/* CMS Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link 
              to="/challenges"
              className="text-xs text-gray-500 hover:text-black font-bold flex items-center gap-1 transition mr-2"
            >
              <ArrowLeft size={14} />
              <span>Voltar aos Desafios</span>
            </Link>
            <div className="inline-flex items-center space-x-1.5 bg-[#2D2A26] text-[#FFB800] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>CMS / Admin Dashboard</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2D2A26]">
            Gestão de Desafios & Diretrizes
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
            Painel editorial e administrativo para cadastrar temas semanais, ajustar diretrizes e regras, tags oficiais, bairros de Palmas e premiar vencedores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Demo Admin Toggle Button for easy testing */}
          {onToggleAdminDemo && (
            <button
              type="button"
              onClick={onToggleAdminDemo}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isAdmin 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title="Alternar modo de administrador para testes da banca examinadora"
            >
              <ShieldCheck size={14} />
              <span>{isAdmin ? 'Modo Admin: Ativo' : 'Ativar Acesso Admin'}</span>
            </button>
          )}

          <Link
            to="/admin/badges"
            className="bg-amber-100 hover:bg-amber-200 text-[#2D2A26] font-black text-xs uppercase px-3.5 py-2 rounded-xl transition border border-amber-300 flex items-center gap-1.5 shadow-sm"
            title="Acessar painel CMS para gerenciar insígnias e recompensas"
          >
            <Award size={15} className="text-[#FF5722]" />
            <span>CMS Insígnias</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreateNew}
            className="bg-[#FFB800] hover:bg-[#FFA000] text-[#2D2A26] font-black text-xs uppercase px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 transform hover:scale-105"
          >
            <Plus size={15} />
            <span>Novo Desafio</span>
          </button>
        </div>
      </header>

      {/* Non-admin alert fallback */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-800">
          <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Atenção: Você está visualizando o CMS em modo de visualização editorial.</p>
            <p className="text-amber-700">
              Para aplicar alterações definitivas no banco de dados Firestore, certifique-se de estar conectado com sua conta administradora ou clique no botão acima para <strong>Ativar Acesso Admin</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Overview Statistics Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Total Desafios</span>
          <span className="text-2xl font-black text-[#2D2A26]">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ativos
          </span>
          <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Em Breve</span>
          <span className="text-2xl font-black text-amber-600">{stats.upcoming}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Concluídos</span>
          <span className="text-2xl font-black text-gray-500">{stats.completed}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-[#2D2A26] text-white p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB800] block">Obras em Disputa</span>
          <span className="text-2xl font-black text-white">{stats.totalSubmissions}</span>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => { setActiveTab('list'); setFormSuccessMessage(null); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 ${
            activeTab === 'list'
              ? 'bg-[#2D2A26] text-[#FFB800] shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Layers size={14} />
          <span>Lista de Desafios ({challenges.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'editor') handleOpenCreateNew();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 ${
            activeTab === 'editor'
              ? 'bg-[#2D2A26] text-[#FFB800] shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Edit3 size={14} />
          <span>{editingChallengeId ? 'Editar Desafio' : 'Criar Novo Desafio'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('winners')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 ${
            activeTab === 'winners'
              ? 'bg-[#2D2A26] text-[#FFB800] shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Crown size={14} />
          <span>Definir Pódio & Vencedor</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIST VIEW OF CHALLENGES                           */}
      {/* ======================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {(['all', 'active', 'upcoming', 'completed'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition shrink-0 ${
                    filterStatus === st 
                      ? 'bg-[#2D2A26] text-[#FFB800]' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st === 'active' ? 'Ativos' : st === 'upcoming' ? 'Em Breve' : 'Concluídos'}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, tema ou bairro..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFB800] font-medium"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map(challenge => {
              const entriesCount = photos.filter(p => 
                p.challengeId === challenge.id ||
                challenge.tags.some(t => p.tags.includes(t)) ||
                (challenge.featuredNeighborhood && p.location?.neighborhood?.toLowerCase().includes(challenge.featuredNeighborhood.toLowerCase()))
              ).length;

              const badgeInfo = BADGES.find(b => b.id === challenge.rewardBadgeId);
              const winnerPhoto = photos.find(p => p.id === challenge.winnerPhotoId);

              return (
                <div 
                  key={challenge.id}
                  className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Image & Status Tag */}
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-900">
                      <img 
                        src={challenge.bannerUrl} 
                        alt={challenge.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-75"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PRESET_BANNERS[0].url;
                        }}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          challenge.status === 'active' 
                            ? 'bg-emerald-500 text-white shadow' 
                            : challenge.status === 'upcoming' 
                            ? 'bg-amber-500 text-[#2D2A26] shadow' 
                            : 'bg-gray-600 text-white shadow'
                        }`}>
                          {challenge.status === 'active' ? '● Ativo' : challenge.status === 'upcoming' ? '⏳ Em Breve' : '✓ Concluído'}
                        </span>
                        {challenge.featuredNeighborhood && (
                          <span className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-bold">
                            📍 {challenge.featuredNeighborhood}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-[#FFB800] px-2.5 py-1 rounded-full text-[9px] font-black">
                        +{challenge.rewardResponsa} Responsa
                      </div>
                    </div>

                    {/* Content Info */}
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
                        {challenge.subtitle || 'Desafio Semanal PMW'}
                      </span>
                      <h3 className="text-lg font-black uppercase tracking-tight text-[#2D2A26]">
                        {challenge.title}
                      </h3>
                      <p className="text-xs text-[#FFB800] font-bold mt-0.5">
                        {challenge.theme}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>

                    {/* Diretrizes & Tags Snippet */}
                    <div className="space-y-1.5 pt-1 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase">
                        <span>{challenge.rules.length} Diretrizes cadastradas</span>
                        <span>{entriesCount} obras na disputa</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {challenge.tags.map(t => (
                          <span key={t} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Vencedor Selecionado, se houver */}
                    {winnerPhoto && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2">
                        <Crown size={15} className="text-[#FFB800] shrink-0" />
                        <div className="text-[10px] min-w-0">
                          <span className="font-black text-[#2D2A26] uppercase">Vencedor Oficial: </span>
                          <span className="text-gray-700 font-bold truncate">"{winnerPhoto.title}" por @{winnerPhoto.authorName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status Switchers */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-gray-500">
                      <span>Mudar Status Rápido:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(challenge, 'active')}
                          className={`px-2 py-0.5 rounded ${challenge.status === 'active' ? 'bg-emerald-600 text-white font-black' : 'bg-gray-100 hover:bg-emerald-100 text-gray-600'}`}
                        >
                          Ativo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(challenge, 'upcoming')}
                          className={`px-2 py-0.5 rounded ${challenge.status === 'upcoming' ? 'bg-amber-500 text-black font-black' : 'bg-gray-100 hover:bg-amber-100 text-gray-600'}`}
                        >
                          Em Breve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(challenge, 'completed')}
                          className={`px-2 py-0.5 rounded ${challenge.status === 'completed' ? 'bg-gray-700 text-white font-black' : 'bg-gray-100 hover:bg-gray-300 text-gray-600'}`}
                        >
                          Concluir
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(challenge)}
                        className="flex-1 bg-gray-100 hover:bg-[#2D2A26] hover:text-[#FFB800] text-[#2D2A26] py-2 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(challenge)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition"
                        title="Duplicar como molde para próxima semana"
                      >
                        <Copy size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChallengeForWinner(challenge.id);
                          setActiveTab('winners');
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 p-2 rounded-xl transition"
                        title="Gerenciar pódio e escolher vencedor"
                      >
                        <Crown size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(challenge)}
                        className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 p-2 rounded-xl transition"
                        title="Excluir desafio permanentemente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FULL CHALLENGE & GUIDELINES EDITOR (CMS FORM)     */}
      {/* ======================================================== */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSave} className="space-y-6">
          {formSuccessMessage && (
            <div className="bg-emerald-500 text-white p-4 rounded-2xl font-black text-xs uppercase flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{formSuccessMessage}</span>
              </span>
            </div>
          )}

          {formErrorMessage && (
            <div className="bg-red-500 text-white p-4 rounded-2xl font-black text-xs uppercase flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formErrorMessage}</span>
              </span>
              <button type="button" onClick={() => setFormErrorMessage(null)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#2D2A26]">
                  {editingChallengeId ? 'Editar Desafio Semanal' : 'Cadastrar Novo Desafio Semanal'}
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Configure título, diretrizes para os artistas, tema, recompensas de responsa e bairro de Palmas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1.5 text-gray-700"
                >
                  <Eye size={14} />
                  <span>{showLivePreview ? 'Ocultar Prévia' : 'Ver Prévia'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FFB800] hover:bg-[#FFA000] text-[#2D2A26] font-black text-xs uppercase rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Salvar Desafio</span>
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW BANNER CARD */}
            {showLivePreview && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                  <Eye size={12} className="text-[#FFB800]" /> Prévia do Card para a Comunidade:
                </span>
                <div className="bg-[#2D2A26] text-white p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <div>
                      <span className="text-[9px] font-black uppercase text-[#FFB800] tracking-widest">{subtitle || 'Temporada 2'}</span>
                      <h3 className="text-lg font-black uppercase">{title || 'Título do Desafio'}</h3>
                      <p className="text-xs text-orange-200 font-bold">{theme || 'Tema do Desafio'}</p>
                      <p className="text-[11px] text-gray-300 mt-1 max-w-lg">{description || 'Descrição detalhada para os artistas...'}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map(t => (
                          <span key={t} className="text-[9px] bg-white/10 text-amber-300 px-2 py-0.5 rounded font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#FFB800] text-[#2D2A26] px-3 py-1 rounded-xl text-xs font-black uppercase shrink-0">
                      +{rewardResponsa} Responsa
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Título */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Título do Desafio *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Ex: Cores do Taquari & Murais</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cores do Taquari & Murais"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              {/* Subtítulo / Temporada */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Subtítulo / Temporada
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Temporada 2 • Semana 4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              {/* Tema Curatorial */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Tema & Conceito Artístico
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Luz solar do cerrado tocantinense e murais comunitários"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              {/* Bairro / Território em Destaque */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Território de Palmas em Destaque</span>
                  <MapPin size={12} className="text-[#FFB800]" />
                </label>
                <select
                  value={featuredNeighborhood}
                  onChange={(e) => setFeaturedNeighborhood(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                >
                  {PALMAS_NEIGHBORHOODS.map(nh => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                  <option value="Todo o Município de Palmas">Todo o Município de Palmas</option>
                </select>
              </div>

              {/* Status do Desafio */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Status de Publicação
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`py-3 rounded-xl text-xs font-black uppercase transition border ${
                      status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ● Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('upcoming')}
                    className={`py-3 rounded-xl text-xs font-black uppercase transition border ${
                      status === 'upcoming'
                        ? 'bg-amber-500 text-[#2D2A26] border-amber-600 shadow'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ⏳ Em Breve
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('completed')}
                    className={`py-3 rounded-xl text-xs font-black uppercase transition border ${
                      status === 'completed'
                        ? 'bg-gray-700 text-white border-gray-800 shadow'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ✓ Concluído
                  </button>
                </div>
              </div>

              {/* Datas de Início e Término */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              {/* Descrição Detalhada */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Descrição e Chamada para a Comunidade *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o objetivo do desafio, o que os artistas devem registrar e como a comunidade será inspirada..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              {/* Recompensa: Responsa e Insígnia */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Pontos de Responsa Concedidos
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  step={5}
                  value={rewardResponsa}
                  onChange={(e) => setRewardResponsa(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Insígnia Exclusiva de Recompensa</span>
                  <Trophy size={12} className="text-[#FFB800]" />
                </label>
                <select
                  value={rewardBadgeId}
                  onChange={(e) => setRewardBadgeId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                >
                  {BADGES.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.icon} {b.name} ({b.description})
                    </option>
                  ))}
                </select>
              </div>

              {/* Banner da Imagem */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>URL do Banner / Capa</span>
                  <span className="text-[10px] text-gray-400 font-normal">Insira uma URL ou escolha uma foto pré-selecionada</span>
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />

                {/* Presets Rápidos de Banner */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 self-center">Sugestões:</span>
                  {PRESET_BANNERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerUrl(preset.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        bannerUrl === preset.url 
                          ? 'bg-[#2D2A26] text-[#FFB800] border-[#2D2A26]' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================== */}
            {/* GESTOR DE DIRETRIZES & REGRAS DO DESAFIO            */}
            {/* =================================================== */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#2D2A26] flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#FFB800]" />
                    <span>Diretrizes & Critérios Avaliativos ({rules.length})</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Defina o que os artistas visuais precisam cumprir para que sua obra seja validada.
                  </p>
                </div>

                <span className="text-[10px] font-bold text-gray-400">
                  {rules.length === 0 ? 'Nenhuma diretriz adicionada ainda' : `${rules.length} regras ativas`}
                </span>
              </div>

              {/* Campo para adicionar nova diretriz */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                  placeholder="Ex: Foto deve ser capturada no bairro Taquari com iluminação natural..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddRule()}
                  className="px-4 py-3 bg-[#2D2A26] text-[#FFB800] hover:bg-black font-black text-xs uppercase rounded-xl transition shrink-0"
                >
                  + Adicionar
                </button>
              </div>

              {/* Sugestões Rápidas de Diretrizes */}
              <div className="bg-amber-50/60 border border-amber-200/50 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                  Sugestões Rápidas de Diretrizes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_GUIDELINES_SUGGESTIONS.map((sug, idx) => {
                    const isAlreadyAdded = rules.includes(sug);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddRule(sug)}
                        disabled={isAlreadyAdded}
                        className={`text-[10px] px-2.5 py-1 rounded-lg transition text-left flex items-center gap-1 ${
                          isAlreadyAdded
                            ? 'bg-amber-200/60 text-amber-800 opacity-60 cursor-not-allowed'
                            : 'bg-white text-gray-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                        }`}
                      >
                        <span>+ {sug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista das Diretrizes Cadastradas */}
              <div className="space-y-2 pt-2">
                {rules.map((rule, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/80 group"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFB800] text-[#2D2A26] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gray-800 font-medium leading-tight">
                        {rule}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
                      title="Remover diretriz"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================== */}
            {/* GESTOR DE TAGS DO DESAFIO                           */}
            {/* =================================================== */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#2D2A26] flex items-center gap-1.5">
                  <Tag size={15} className="text-[#FFB800]" />
                  <span>Tags Oficiais Cadastradas</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Fotos e remixes contendo essas tags serão agrupados automaticamente na galeria deste desafio.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ex: #TaquaraltoCores (pressione Enter para adicionar)..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#FFB800] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-4 py-2.5 bg-[#2D2A26] text-[#FFB800] hover:bg-black font-black text-xs uppercase rounded-xl transition"
                >
                  + Tag
                </button>
              </div>

              {/* Presets de Tags */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-gray-400">Adicionar pré-definida:</span>
                {PRESET_TAGS.map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handleAddTag(pt)}
                    className="text-[10px] bg-gray-100 hover:bg-[#FFB800] hover:text-[#2D2A26] text-gray-600 px-2 py-0.5 rounded font-bold transition"
                  >
                    +{pt}
                  </button>
                ))}
              </div>

              {/* Tags Atuais Selecionadas */}
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map(t => (
                  <span 
                    key={t}
                    className="bg-[#2D2A26] text-[#FFB800] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-white hover:text-red-400 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#FFB800] hover:bg-[#FFA000] text-[#2D2A26] font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <Save size={16} />
                <span>Gravar Desafio Semanal</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WINNERS & PODIUM MANAGEMENT                       */}
      {/* ======================================================== */}
      {activeTab === 'winners' && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#2D2A26] flex items-center gap-2">
                <Crown size={20} className="text-[#FFB800]" />
                <span>Definição de Pódio & Obra Vencedora</span>
              </h2>
              <p className="text-xs text-gray-400">
                Selecione o desafio desejado e eleja a obra que receberá o troféu e insígnia máxima da temporada.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <select
                value={selectedChallengeForWinner}
                onChange={(e) => setSelectedChallengeForWinner(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
              >
                {challenges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {targetWinnerChallenge && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                    Desafio Selecionado:
                  </span>
                  <h3 className="text-base font-black uppercase text-[#2D2A26]">
                    {targetWinnerChallenge.title}
                  </h3>
                  <p className="text-xs text-amber-900 mt-0.5">
                    +{targetWinnerChallenge.rewardResponsa} Responsa • {entriesForTargetChallenge.length} obras inscritas
                  </p>
                </div>

                {targetWinnerChallenge.winnerPhotoId ? (
                  <div className="bg-[#2D2A26] text-[#FFB800] px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                    <Crown size={15} />
                    <span>Vencedor Já Coroado</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-bold">
                    Nenhum vencedor definitivo coroado ainda
                  </span>
                )}
              </div>

              {/* Entries list to crown winner */}
              {entriesForTargetChallenge.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                  <Trophy size={28} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-600">Nenhuma obra cadastrada para este desafio ainda.</p>
                  <p className="text-xs text-gray-400 mt-1">Quando os artistas subirem fotos ou remixes com as tags deste desafio, elas aparecerão aqui para votação ou proclamação de vitória.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {entriesForTargetChallenge.map(photo => {
                    const isWinner = targetWinnerChallenge.winnerPhotoId === photo.id;

                    return (
                      <div 
                        key={photo.id}
                        className={`rounded-2xl overflow-hidden border-2 transition-all p-3 flex flex-col justify-between ${
                          isWinner 
                            ? 'bg-amber-50 border-[#FFB800] shadow-md scale-105' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
                            <img 
                              src={photo.imageUrl} 
                              alt={photo.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {isWinner && (
                              <div className="absolute top-2 right-2 bg-[#FFB800] text-[#2D2A26] px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow flex items-center gap-1">
                                <Crown size={12} />
                                <span>Campeã</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-black text-sm uppercase tracking-tight truncate text-[#2D2A26]">
                              {photo.title}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase truncate">
                              Por @{photo.authorName} • {photo.vibeCount} Vibes • {photo.battleWins || 0}V
                            </p>
                          </div>
                        </div>

                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => onSetWinner(targetWinnerChallenge.id, photo.id)}
                            className={`w-full py-2 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 ${
                              isWinner
                                ? 'bg-[#2D2A26] text-[#FFB800]'
                                : 'bg-gray-100 hover:bg-[#FFB800] text-[#2D2A26]'
                            }`}
                          >
                            <Crown size={14} />
                            <span>{isWinner ? 'Coroada Vencedora' : 'Eleger como Vencedora'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
