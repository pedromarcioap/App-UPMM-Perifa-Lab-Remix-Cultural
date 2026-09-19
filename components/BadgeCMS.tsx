import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  Filter, 
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge, User } from '../types';

interface BadgeCMSProps {
  badges: Badge[];
  currentUser: User | null;
  onSaveBadge: (badge: Badge) => void;
  onDeleteBadge: (badgeId: string) => void;
  onClose?: () => void;
}

const BADGE_CATEGORIES = [
  { id: 'all', label: 'Todas as Categorias' },
  { id: 'reputation', label: 'Reputação & Responsa' },
  { id: 'creation', label: 'Criação & Remix' },
  { id: 'battle', label: 'Arena de Batalhas' },
  { id: 'territory', label: 'Território & Mapeamento' },
  { id: 'special', label: 'Especiais & Desafios' }
];

const PRESET_ICONS = [
  '👑', '📸', '🧪', '🤝', '📍', '⚔️', '🏆', '🎨', 
  '🌴', '⚡', '🗺️', '🥊', '✍️', '📢', '🔥', '🛡️', 
  '💎', '🎯', '🛹', '📻', '💣', '🌟', '🔆', '🚀'
];

export const BadgeCMS: React.FC<BadgeCMSProps> = ({
  badges,
  currentUser,
  onSaveBadge,
  onDeleteBadge,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Partial<Badge> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtered list of badges
  const filteredBadges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return badges.filter(b => {
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (q) {
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesDesc = b.description.toLowerCase().includes(q);
        const matchesCrit = (b.unlockCriteria || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCrit) return false;
      }
      return true;
    });
  }, [badges, selectedCategory, searchTerm]);

  const handleOpenCreate = () => {
    setEditingBadge({
      id: `badge_${Date.now()}`,
      name: '',
      icon: '🏆',
      category: 'creation',
      description: '',
      unlockCriteria: 'Concluir intervenção na comunidade',
      rewardResponsa: 25,
      secret: false,
      createdAt: Date.now()
    });
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOpenEdit = (b: Badge) => {
    setEditingBadge({ ...b });
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge) return;

    if (!editingBadge.name?.trim()) {
      setErrorMsg('Informe o nome oficial da insígnia.');
      return;
    }

    if (!editingBadge.description?.trim()) {
      setErrorMsg('Informe uma descrição do significado da insígnia.');
      return;
    }

    const finalBadge: Badge = {
      id: editingBadge.id || `badge_${Date.now()}`,
      name: editingBadge.name.trim(),
      icon: editingBadge.icon || '🏆',
      category: (editingBadge.category as any) || 'special',
      description: editingBadge.description.trim(),
      unlockCriteria: editingBadge.unlockCriteria?.trim() || 'Concluir desafio comunitário',
      rewardResponsa: Number(editingBadge.rewardResponsa) || 20,
      secret: Boolean(editingBadge.secret),
      createdAt: editingBadge.createdAt || Date.now()
    };

    onSaveBadge(finalBadge);
    setSuccessMsg(`Insígnia "${finalBadge.name}" salva com sucesso no banco de dados!`);
    setTimeout(() => {
      setIsEditing(false);
      setEditingBadge(null);
      setSuccessMsg(null);
    }, 600);
  };

  const handleDelete = (badgeId: string, _badgeName: string) => {
    onDeleteBadge(badgeId);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-[#2D2A26] text-white p-6 sm:p-8 shadow-xl border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {onClose ? (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Link
                to="/admin/challenges"
                className="p-2 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
                aria-label="Voltar para Gestão de Desafios"
                title="Voltar ao CMS de Desafios"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center font-black shadow-lg">
              <Award size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Administração & Gamificação
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {badges.length} Insígnias Registradas
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
                CMS de Insígnias de Recompensa
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleOpenCreate}
              className="w-full md:w-auto bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] font-black text-xs uppercase px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Nova Insígnia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Filter bar */}
        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar insígnia por nome, critério..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FFB800]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
            {BADGE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#2D2A26] text-[#FFB800] shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => {
            return (
              <div 
                key={badge.id}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-[#FFB800]/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {badge.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {badge.category || 'special'}
                        </span>
                        <h3 className="font-black text-sm uppercase text-[#2D2A26] mt-0.5">
                          {badge.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(badge)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition"
                        title="Editar Insígnia"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(badge.id, badge.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Excluir Insígnia"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mt-3">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">Critério:</span>
                    <span className="font-bold text-gray-700 truncate max-w-[180px] block">
                      {badge.unlockCriteria || 'Critério padrão'}
                    </span>
                  </div>
                  <span className="bg-[#FFB800]/20 text-[#2D2A26] px-2.5 py-1 rounded-xl font-black text-xs">
                    +{badge.rewardResponsa || 20} Responsa
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && editingBadge && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black uppercase text-[#2D2A26] flex items-center gap-2">
                <Award size={20} className="text-[#FFB800]" />
                <span>{editingBadge.name ? `Editar: ${editingBadge.name}` : 'Criar Nova Insígnia'}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                <Check size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Icon selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Ícone Representativo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-[#FFB800] flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {editingBadge.icon || '🏆'}
                  </div>
                  <div className="flex-1 overflow-x-auto pb-1 flex gap-1.5 no-scrollbar">
                    {PRESET_ICONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditingBadge({ ...editingBadge, icon: emoji })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition shrink-0 ${
                          editingBadge.icon === emoji
                            ? 'bg-[#2D2A26] text-white scale-110 shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Nome da Insígnia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mestre do Bombing, Guardião do Mirante..."
                  value={editingBadge.name || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Categoria
                </label>
                <select
                  value={editingBadge.category || 'creation'}
                  onChange={(e) => setEditingBadge({ ...editingBadge, category: e.target.value as any })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
                >
                  <option value="creation">Criação & Remix</option>
                  <option value="reputation">Reputação & Responsa</option>
                  <option value="battle">Arena de Batalhas</option>
                  <option value="territory">Território & Mapeamento</option>
                  <option value="special">Especiais & Desafios</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Descrição do Significado *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explicar o impacto cultural e artístico desta conquista..."
                  value={editingBadge.description || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {/* Unlock criteria */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Critério de Desbloqueio
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vencer 5 batalhas na arena, Mapear 2 muros..."
                  value={editingBadge.unlockCriteria || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, unlockCriteria: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {/* Responsa bonus */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Bônus de Pontos de Responsa
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={editingBadge.rewardResponsa || 20}
                  onChange={(e) => setEditingBadge({ ...editingBadge, rewardResponsa: Number(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2D2A26] hover:bg-black text-[#FFB800] rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                >
                  Salvar Insígnia no CMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
