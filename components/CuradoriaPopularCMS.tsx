import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  MapPin, 
  Building2, 
  Award, 
  Clock, 
  Eye, 
  Sparkles, 
  FileText, 
  Send, 
  RefreshCw, 
  Search, 
  Filter, 
  Check, 
  X, 
  Zap, 
  Flame, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Hash,
  Copy
} from 'lucide-react';
import { User, PhotoBase, GraffitiSpot, WeeklyChallenge } from '../types';
import { BrandedChallenge, BrandedAssetPack } from '../types/assets';
import { PALMAS_NEIGHBORHOODS } from '../constants';

interface CuradoriaPopularCMSProps {
  photos?: PhotoBase[];
  users?: User[];
  spots?: GraffitiSpot[];
  graffitiSpots?: GraffitiSpot[];
  challenges?: WeeklyChallenge[];
  brandedChallenges?: BrandedChallenge[];
  brandedPacks?: BrandedAssetPack[];
  currentUser?: User | null;
  isAdmin?: boolean;
  onApprovePhoto?: (photoId: string) => void;
  onRejectPhoto?: (photoId: string, reason?: string) => void;
  onFlagOverlap?: (photoId: string) => void;
  onRequireLogin?: () => void;
  onSaveBrandedChallenge?: (challenge: BrandedChallenge) => void;
  onToggleAdminDemo?: () => void;
}

interface ModerationItem {
  id: string;
  type: 'base_mural' | 'remix_redline';
  title: string;
  authorName: string;
  authorAvatar?: string;
  neighborhood: string;
  imageUrl: string;
  originalImageUrl?: string;
  submittedAt: string;
  authorizationDocUrl?: string;
  authorizationStatus: 'autorizado_sindico' | 'muro_livre' | 'aguardando_termo';
  overlapRiskScore: number; // 0-100%
  status: 'pending' | 'approved' | 'rejected' | 'under_jury';
  communityVotes: {
    curatorId: string;
    curatorName: string;
    vote: 'approve' | 'reject';
    comment?: string;
  }[];
  b2bGrantEligible?: boolean;
  b2bGrantValue?: number;
  sponsorName?: string;
}

const INITIAL_TRIAGEM_ITEMS: ModerationItem[] = [];

export const CuradoriaPopularCMS: React.FC<CuradoriaPopularCMSProps> = ({
  photos = [],
  users = [],
  spots = [],
  challenges = [],
  brandedChallenges = [],
  brandedPacks = [],
  currentUser = null,
  isAdmin = false,
  onApprovePhoto,
  onRejectPhoto,
  onSaveBrandedChallenge,
  onToggleAdminDemo
}) => {
  const [activeTab, setActiveTab] = useState<'triagem' | 'anti_atropelo' | 'liquidacao' | 'radar'>('triagem');
  const [items, setItems] = useState<ModerationItem[]>(INITIAL_TRIAGEM_ITEMS);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [pixBatchStatus, setPixBatchStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Indicators calculations
  const pendingCount = items.filter(i => i.status === 'pending' || i.status === 'under_jury').length;
  const approvedTotal = items.filter(i => i.status === 'approved').length;
  const openBudgetB2B = 0;

  const handleApprove = (item: ModerationItem) => {
    setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'approved' } : it));
    if (onApprovePhoto) onApprovePhoto(item.id);
    setFeedbackToast(`Obra "${item.title}" aprovada pela Curadoria Popular! Hash de validação emitido.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleReject = (item: ModerationItem) => {
    setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'rejected' } : it));
    if (onRejectPhoto) onRejectPhoto(item.id, 'Reprovado por consenso comunitário');
    setFeedbackToast(`Submissão "${item.title}" arquivada com justificativa enviada ao criador.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleReleasePixBatch = () => {
    setPixBatchStatus('processing');
    setTimeout(() => {
      const generatedHash = `#HASH-PIX-${Math.floor(10000 + Math.random() * 90000)}-TO-GUARÁ`;
      setPixBatchStatus('completed');
      setLastTxHash(generatedHash);
      setFeedbackToast(`Lote Pix de R$ 7.700 liberado aos artistas! Hash público: ${generatedHash}`);
      setTimeout(() => setFeedbackToast(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Breadcrumb & Rebranding */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3E3A35] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFB800] text-[#141311] px-2.5 py-0.5 rounded">
              [05] BACKOFFICE COMUNITÁRIO
            </span>
            <span className="text-[10px] font-bold text-[#43A047] uppercase flex items-center gap-1">
              <ShieldCheck size={12} /> Governança Popular Ativa
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-tight text-white">
            Painel de Curadoria Popular & CMS
          </h2>
          <p className="text-xs text-[#EDE8E1]/70 font-sans max-w-xl">
            Mesa de triagem lado a lado, sistema anti-atropelo com conselho de líderes comunitários e liquidação orçamentária direta de bolsas via Pix (Tinta Guará do Brasil).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onToggleAdminDemo && (
            <button
              onClick={onToggleAdminDemo}
              className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl transition border flex items-center gap-1.5 ${
                isAdmin 
                  ? 'bg-[#FFB800] text-[#141311] border-[#FFB800]' 
                  : 'bg-[#242220] text-[#EDE8E1] border-[#3E3A35] hover:border-[#FFB800]'
              }`}
            >
              <UserCheck size={13} />
              <span>{isAdmin ? 'Modo Curador / Admin Ativo' : 'Ativar Acesso Moderador'}</span>
            </button>
          )}
          <Link
            to="/admin/sponsorships"
            className="text-[10px] font-black uppercase px-3 py-2 rounded-xl bg-[#242220] hover:bg-[#2D2A26] text-[#FFB800] border border-[#3E3A35] transition flex items-center gap-1.5"
          >
            <Building2 size={13} />
            <span>Gestão B2B & Editais</span>
          </Link>
        </div>
      </header>

      {/* Real-time Indicator Cards (Brutalist Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C1B19] border border-[#3E3A35] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722]">Fila de Triagem</span>
            <Clock size={16} className="text-[#FF5722]" />
          </div>
          <div className="text-3xl font-display text-white mt-2">{pendingCount} Obras</div>
          <p className="text-[10px] text-[#EDE8E1]/60 font-sans mt-1">Aguardando auditoria do conselho</p>
        </div>

        <div className="bg-[#1C1B19] border border-[#3E3A35] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#43A047]">Muros Catalogados</span>
            <CheckCircle2 size={16} className="text-[#43A047]" />
          </div>
          <div className="text-3xl font-display text-white mt-2">+{approvedTotal} Murais</div>
          <p className="text-[10px] text-[#EDE8E1]/60 font-sans mt-1">Patrimônio territorial preservado</p>
        </div>

        <div className="bg-[#1C1B19] border border-[#3E3A35] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">Verbas em Fomento (B2B)</span>
            <DollarSign size={16} className="text-[#FFB800]" />
          </div>
          <div className="text-3xl font-display text-white mt-2">R$ {openBudgetB2B.toLocaleString('pt-BR')}</div>
          <p className="text-[10px] text-[#EDE8E1]/60 font-sans mt-1">Fundo Tinta Guará & Banco Criativo</p>
        </div>

        <div className="bg-[#1C1B19] border border-[#3E3A35] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">Índice Anti-Atropelo</span>
            <ShieldCheck size={16} className="text-[#00E5FF]" />
          </div>
          <div className="text-3xl font-display text-white mt-2">98.4%</div>
          <p className="text-[10px] text-[#EDE8E1]/60 font-sans mt-1">Integridade e respeito à autoria</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#3E3A35] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('triagem')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'triagem'
              ? 'bg-[#FFB800] text-[#141311] shadow'
              : 'bg-[#1C1B19] text-[#EDE8E1]/70 hover:text-white border border-[#3E3A35]'
          }`}
        >
          [01] Mesa de Triagem ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('anti_atropelo')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'anti_atropelo'
              ? 'bg-[#FFB800] text-[#141311] shadow'
              : 'bg-[#1C1B19] text-[#EDE8E1]/70 hover:text-white border border-[#3E3A35]'
          }`}
        >
          <AlertTriangle size={13} className="text-[#FF5722]" />
          <span>[02] Sistema Anti-Atropelo</span>
        </button>

        <button
          onClick={() => setActiveTab('liquidacao')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'liquidacao'
              ? 'bg-[#FFB800] text-[#141311] shadow'
              : 'bg-[#1C1B19] text-[#EDE8E1]/70 hover:text-white border border-[#3E3A35]'
          }`}
        >
          <Zap size={13} className="text-[#43A047]" />
          <span>[03] Liquidação Pix B2B</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'radar'
              ? 'bg-[#FFB800] text-[#141311] shadow'
              : 'bg-[#1C1B19] text-[#EDE8E1]/70 hover:text-white border border-[#3E3A35]'
          }`}
        >
          <MapPin size={13} className="text-[#00E5FF]" />
          <span>[04] Radar Territorial</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="bg-[#FFB800] text-[#141311] p-4 rounded-xl font-bold text-xs flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="p-1 hover:bg-black/10 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* TAB 1: MESA DE TRIAGEM (LADO A LADO) */}
      {activeTab === 'triagem' && (
        items.length === 0 ? (
          <div className="bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#242220] border border-[#3E3A35] flex items-center justify-center mx-auto text-[#FFB800]">
              <ShieldCheck size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-display uppercase text-white">Fila de Triagem Vazia</h3>
              <p className="text-xs text-[#EDE8E1]/60">
                Nenhuma obra ou submissão pendente de moderação no momento. As novas submissões comunitárias aparecerão aqui em tempo real.
              </p>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Pending Items */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#EDE8E1]/60 px-1">
              <span>Submissões Recentes</span>
              <span>{items.length} itens</span>
            </div>

            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'bg-[#242220] border-[#FFB800] ring-1 ring-[#FFB800]/50'
                      : 'bg-[#1C1B19] border-[#3E3A35] hover:border-[#EDE8E1]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        item.type === 'base_mural' ? 'bg-[#FFB800] text-[#141311]' : 'bg-[#00E5FF] text-[#141311]'
                      }`}>
                        {item.type === 'base_mural' ? 'Muro Bruto' : 'Redline / Remix'}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-[#EDE8E1]/60 mt-0.5">{item.authorName} • {item.neighborhood}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      item.status === 'approved' 
                        ? 'bg-[#43A047]/20 text-[#43A047]' 
                        : item.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.b2bGrantEligible && (
                    <div className="mt-2.5 pt-2 border-t border-[#3E3A35] flex items-center justify-between text-[10px] text-[#FFB800] font-bold">
                      <span>Bolsa {item.sponsorName}</span>
                      <span>R$ {item.b2bGrantValue?.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Comparison Desk & Action Area */}
          {selectedItem ? (
            <div className="lg:col-span-8 bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3E3A35] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">
                      Auditoria de Obra
                    </span>
                    <span className="text-[10px] text-[#EDE8E1]/60 font-mono">ID: {selectedItem.id}</span>
                  </div>
                  <h3 className="text-xl font-display uppercase text-white mt-0.5">{selectedItem.title}</h3>
                  <p className="text-xs text-[#EDE8E1]/70">
                    Submetido por <strong className="text-white">{selectedItem.authorName}</strong> ({selectedItem.neighborhood}) — {selectedItem.submittedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(selectedItem)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    <span>Recusar</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedItem)}
                    className="px-5 py-2 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle2 size={14} />
                    <span>Aprovar para o Fluxo</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Workspace */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original / Doc Container */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E1]/80">
                    <span>{selectedItem.originalImageUrl ? 'Foto Base Original' : 'Termo de Autorização do Muro'}</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 bg-[#242220] rounded text-[#43A047] font-black">
                      {selectedItem.authorizationStatus === 'autorizado_sindico' ? 'Assinado por Síndico' : 'Muro Livre'}
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-[#141311] rounded-2xl overflow-hidden border border-[#3E3A35] relative group">
                    <img
                      src={selectedItem.originalImageUrl || selectedItem.authorizationDocUrl || selectedItem.imageUrl}
                      alt="Referência ou Termo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-xs text-white font-bold bg-[#141311]/80 px-3 py-1.5 rounded-lg">
                        Ver documento completo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submitted Artwork */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#EDE8E1]/80">
                    <span>Proposta de Intervenção</span>
                    <span className="text-[9px] uppercase px-2 py-0.5 bg-[#FFB800]/20 text-[#FFB800] rounded font-black">
                      Score Risco: {selectedItem.overlapRiskScore}%
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-[#141311] rounded-2xl overflow-hidden border border-[#3E3A35] relative">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Community Jury Votes & Feedback */}
              <div className="bg-[#141311] border border-[#3E3A35] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[#EDE8E1]">
                  <span>Votos do Conselho Comunitário de Líderes ({selectedItem.communityVotes.length})</span>
                  <span className="text-[#43A047] flex items-center gap-1">
                    <ShieldCheck size={12} /> Decisão Coletiva
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedItem.communityVotes.map((vote, idx) => (
                    <div key={idx} className="bg-[#1C1B19] p-3 rounded-xl border border-[#3E3A35] flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-white">{vote.curatorName}</span>
                        <p className="text-[#EDE8E1]/70 text-[11px] mt-0.5">{vote.comment}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                        vote.vote === 'approve' ? 'bg-[#43A047]/20 text-[#43A047]' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {vote.vote === 'approve' ? 'Favorável' : 'Contrário'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        )
      )}

      {/* TAB 2: SISTEMA ANTI-ATROPELO */}
      {activeTab === 'anti_atropelo' && (
        <div className="bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3E3A35] pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722]">
                Detecção Algorítmica de Sobreposição
              </span>
              <h3 className="text-xl font-display uppercase text-white mt-0.5">
                Mecanismo de Proteção ao Patrimônio de Rua
              </h3>
              <p className="text-xs text-[#EDE8E1]/70">
                Evita o "atropelo" de murais históricos ou tags consagradas sem anuência dos artistas pioneiros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141311] border border-amber-500/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Alerta de Conflito em Taquaralto
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-black">Score 68%</span>
              </div>
              <p className="text-xs text-[#EDE8E1]/80">
                A foto submetida em <strong>Av. Tocantins</strong> coincide em 92% com coordenadas de um mural tombado do artista <strong>Calebe Art (2024)</strong>.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button 
                  onClick={() => setFeedbackToast('Enviado para deliberação da assembleia de Taquaralto.')}
                  className="px-3.5 py-1.5 bg-[#FFB800] text-[#141311] text-xs font-black uppercase rounded-lg shadow"
                >
                  Acionar Mediação Popular
                </button>
                <button 
                  onClick={() => setFeedbackToast('Mural mantido como matriz histórica intangível.')}
                  className="px-3.5 py-1.5 bg-[#242220] hover:bg-[#2D2A26] text-[#EDE8E1] text-xs font-black uppercase rounded-lg border border-[#3E3A35]"
                >
                  Manter Matriz Intangível
                </button>
              </div>
            </div>

            <div className="bg-[#141311] border border-[#43A047]/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#43A047] uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Muro Desobstruído • Setor Taquari
                </span>
                <span className="text-[10px] bg-[#43A047]/20 text-[#43A047] px-2 py-0.5 rounded font-black">Livre</span>
              </div>
              <p className="text-xs text-[#EDE8E1]/80">
                Galpão comunitário previamente mapeado como "Livre para Intervenção". Autorização assinada pelo presidente da associação de moradores.
              </p>
              <div className="pt-2">
                <span className="text-[10px] bg-[#242220] text-[#43A047] px-2.5 py-1 rounded border border-[#43A047]/30 font-bold">
                  ✓ Certificação Hash Atribuída
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIQUIDAÇÃO ORÇAMENTÁRIA & LOTE PIX B2B */}
      {activeTab === 'liquidacao' && (
        <div className="bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3E3A35] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">
                  Transparência Financeira
                </span>
                <span className="text-[9px] bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded font-black uppercase">
                  Parceria Tinta Guará
                </span>
              </div>
              <h3 className="text-xl font-display uppercase text-white mt-0.5">
                Liquidação de Bolsas Culturais via Pix
              </h3>
              <p className="text-xs text-[#EDE8E1]/70">
                Garante que os recursos corporativos de ESG cheguem sem intermediários na mão dos artistas da periferia.
              </p>
            </div>

            <button
              onClick={handleReleasePixBatch}
              disabled={pixBatchStatus === 'processing'}
              className="px-5 py-3 bg-[#43A047] hover:bg-[#388E3C] text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {pixBatchStatus === 'processing' ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processando Lote Pix...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Liberar Lote Pix (R$ 7.700)</span>
                </>
              )}
            </button>
          </div>

          {/* Public Transaction Hash Card */}
          {lastTxHash && (
            <div className="bg-[#141311] border border-[#FFB800] p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#EDE8E1]">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-[#FFB800]" />
                <span>Comprovante Público de Governança: <strong className="text-white font-mono">{lastTxHash}</strong></span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(lastTxHash);
                  setFeedbackToast('Hash copiado para a área de transferência!');
                }}
                className="p-1.5 hover:bg-[#242220] rounded text-[#FFB800]"
                title="Copiar Hash"
              >
                <Copy size={14} />
              </button>
            </div>
          )}

          {/* Artists Payouts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#3E3A35] text-[#EDE8E1]/60 uppercase text-[10px] font-black">
                  <th className="pb-3">Artista Premiado</th>
                  <th className="pb-3">Obra / Intervenção</th>
                  <th className="pb-3">Edital Patrocinador</th>
                  <th className="pb-3">Bolsa Líquida</th>
                  <th className="pb-3">Status do Pix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3E3A35]/50">
                <tr>
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="" className="w-7 h-7 rounded-full object-cover border border-[#FFB800]" />
                    <span>Marcos Aureny</span>
                  </td>
                  <td className="py-3.5 text-[#EDE8E1]">Mural da Resistência (Taquari)</td>
                  <td className="py-3.5 text-[#FFB800] font-bold">Tinta Guará do Brasil</td>
                  <td className="py-3.5 font-mono font-bold text-white">R$ 4.500,00</td>
                  <td className="py-3.5">
                    <span className="text-[9px] bg-[#43A047]/20 text-[#43A047] px-2 py-0.5 rounded font-black uppercase">
                      Liquidado
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="" className="w-7 h-7 rounded-full object-cover border border-[#00E5FF]" />
                    <span>Kauê Cerrado</span>
                  </td>
                  <td className="py-3.5 text-[#EDE8E1]">Redline Geométrico (Aureny III)</td>
                  <td className="py-3.5 text-[#00E5FF] font-bold">Banco Criativo TO</td>
                  <td className="py-3.5 font-mono font-bold text-white">R$ 3.200,00</td>
                  <td className="py-3.5">
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black uppercase">
                      Em Fila de Lote
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RADAR TERRITORIAL */}
      {activeTab === 'radar' && (
        <div className="bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-6 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">
              Georreferenciamento de Impacto
            </span>
            <h3 className="text-xl font-display uppercase text-white mt-0.5">
              Polos Territoriais de Arte Urbana em Palmas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Setor Taquari', count: 18, murals: 42, budget: 'R$ 6.500' },
              { name: 'Taquaralto', count: 24, murals: 68, budget: 'R$ 8.000' },
              { name: 'Jardim Aureny III', count: 15, murals: 35, budget: 'R$ 4.000' },
              { name: 'Morada do Sol', count: 11, murals: 22, budget: 'R$ 2.500' },
              { name: 'Plano Diretor Sul', count: 19, murals: 51, budget: 'R$ 5.500' },
              { name: 'Taquaruçu', count: 8, murals: 16, budget: 'R$ 1.800' }
            ].map(sector => (
              <div key={sector.name} className="bg-[#141311] border border-[#3E3A35] p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{sector.name}</h4>
                  <span className="text-[10px] text-[#FFB800] font-mono font-bold">{sector.budget}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#EDE8E1]/60">
                  <span>{sector.murals} murais catalogados</span>
                  <span>{sector.count} remixes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
