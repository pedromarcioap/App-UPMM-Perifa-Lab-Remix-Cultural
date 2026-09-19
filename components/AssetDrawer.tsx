import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Zap, 
  Layers, 
  Tag, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  Plus,
  Move,
  Info,
  Check
} from 'lucide-react';
import { List } from 'react-window';
import { AssetItem, AssetCategory, AssetType, BrandedAssetPack } from '../types/assets';
import { ASSET_CATALOG, ASSET_CATEGORIES } from '../constants/assetsCatalog';

export interface AssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: AssetItem) => void;
  catalog?: AssetItem[];
  brandedPacks?: BrandedAssetPack[];
  onTrackAssetUsage?: (packId: string) => void;
}

interface RowPropsData {
  items: AssetItem[];
  columns: number;
  onSelect: (asset: AssetItem) => void;
  onTagClick: (tag: string) => void;
  onDragStart: (e: React.DragEvent, asset: AssetItem) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

// Card individual de asset com suporte a arrastar e soltar (Drag-and-Drop) e clique rápido
const AssetCard: React.FC<{
  asset: AssetItem;
  onSelect: () => void;
  onTagClick: (tag: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}> = ({ asset, onSelect, onTagClick, onDragStart, onDragEnd }) => {
  const isAnimated = asset.type === 'animated_sticker';
  const isSponsored = Boolean(asset.sponsorName || asset.packId || asset.category === 'Packs em Parceria');

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`group relative bg-white border rounded-2xl p-2.5 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:shadow-md select-none overflow-hidden h-[210px] ${
        isSponsored 
          ? 'border-amber-400/70 hover:border-amber-500 bg-gradient-to-b from-amber-50/40 to-white' 
          : 'border-gray-200 hover:border-[#FFB800] hover:bg-amber-50/50'
      }`}
      title={isSponsored ? `Pack Oficial Parceria: ${asset.sponsorName || 'Parceiro Local'}` : `Arrastar para o canvas ou clicar para inserir`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-1 z-10 w-full">
        <div className="flex items-center gap-1 overflow-hidden">
          {isAnimated ? (
            <span className="bg-[#FF5722] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <Zap size={9} />
              <span>Loop</span>
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md">
              Sticker
            </span>
          )}
          {isSponsored && (
            <span className="bg-amber-400 text-amber-950 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate shadow-2xs">
              <Sparkles size={8} />
              <span className="truncate">{asset.sponsorName || 'Parceria'}</span>
            </span>
          )}
        </div>

        {/* Drag handle icon cue */}
        <div className="flex items-center gap-1 text-gray-400 group-hover:text-[#FFB800] transition shrink-0">
          <span className="text-[7.5px] font-bold uppercase opacity-0 group-hover:opacity-100 transition hidden sm:inline">
            Arrastar
          </span>
          <GripVertical size={13} />
        </div>
      </div>

      {/* Asset Preview (SVG / Image) */}
      <div className="flex-1 w-full flex items-center justify-center p-1.5 my-1 relative">
        <img
          src={asset.thumbnailUrl || asset.url}
          alt={asset.name}
          referrerPolicy="no-referrer"
          className="max-h-24 max-w-full object-contain transition-transform duration-200 group-hover:scale-105 pointer-events-none"
          loading="lazy"
        />

        {/* Center Insertion Overlay on Hover */}
        <div className="absolute inset-0 bg-[#2D2A26]/80 backdrop-blur-2xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
          <div className="w-8 h-8 rounded-full bg-[#FFB800] text-[#2D2A26] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
            <Plus size={18} strokeWidth={3} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider text-center text-amber-200">
            Centralizar no Canvas
          </span>
          <span className="text-[7px] text-gray-300 font-medium flex items-center gap-0.5">
            <Move size={8} /> ou solte no canvas
          </span>
        </div>
      </div>

      {/* Bottom Info & Tag Chips */}
      <div className="w-full pt-1.5 border-t border-gray-100 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-[#2D2A26] truncate max-w-[110px]" title={asset.name}>
            {asset.name}
          </p>
          <span className="text-[7.5px] font-bold uppercase text-gray-400 truncate max-w-[60px]">
            {isSponsored ? (asset.sponsorName || 'Parceria') : asset.category.split('&')[0]}
          </span>
        </div>

        {/* Clickable tag chips */}
        <div className="flex items-center gap-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {(asset.tags || []).slice(0, 2).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="text-[7.5px] font-semibold text-gray-500 hover:text-black hover:bg-gray-200 bg-gray-100 px-1 py-0.2 rounded transition truncate max-w-[65px]"
              title={`Filtrar por #${tag}`}
            >
              #{tag}
            </button>
          ))}
          {asset.tags.length > 2 && (
            <span className="text-[7.5px] text-gray-400">+{asset.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Linha Virtualizada renderizado pelo react-window List
const VirtualRow: React.ComponentProps<typeof List<RowPropsData>>['rowComponent'] = ({
  index,
  style,
  items,
  columns,
  onSelect,
  onTagClick,
  onDragStart,
  onDragEnd
}) => {
  const startIndex = index * columns;
  const rowItems = items.slice(startIndex, startIndex + columns);

  return (
    <div 
      style={style} 
      className="px-4 py-1.5 box-border"
    >
      <div 
        className="w-full grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {rowItems.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onSelect={() => onSelect(asset)}
            onTagClick={onTagClick}
            onDragStart={(e) => onDragStart(e, asset)}
            onDragEnd={onDragEnd}
          />
        ))}
        {/* Espaçador para manter grid alinhado quando a última linha tem menos itens */}
        {rowItems.length < columns &&
          Array.from({ length: columns - rowItems.length }).map((_, i) => (
            <div key={`spacer-${i}`} className="invisible h-[210px]" />
          ))}
      </div>
    </div>
  );
};

export const AssetDrawer: React.FC<AssetDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  catalog = ASSET_CATALOG,
  brandedPacks = [],
  onTrackAssetUsage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AssetType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(18);
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  // Combina o catálogo padrão com os itens dos packs de parceiros ativos
  const fullCatalog = useMemo(() => {
    const brandedItems: AssetItem[] = [];
    brandedPacks.forEach(pack => {
      if (pack.active && pack.items && pack.items.length > 0) {
        pack.items.forEach(item => {
          brandedItems.push({
            ...item,
            category: 'Packs em Parceria',
            packId: pack.id,
            sponsorName: pack.sponsor?.name || 'Parceiro Oficial'
          });
        });
      }
    });

    // Se já existem no catálogo base, evitar duplicatas por id
    const existingIds = new Set(catalog.map(i => i.id));
    const uniqueBranded = brandedItems.filter(i => !existingIds.has(i.id));

    return [...uniqueBranded, ...catalog];
  }, [catalog, brandedPacks]);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 480, height: 420 });

  // Monitorar redimensionamento do container para adaptar react-window
  useEffect(() => {
    if (!isOpen || !listContainerRef.current) return;
    
    const updateSize = () => {
      if (listContainerRef.current) {
        const { clientWidth, clientHeight } = listContainerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDimensions({
            width: clientWidth,
            height: clientHeight
          });
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(listContainerRef.current);

    return () => observer.disconnect();
  }, [isOpen]);

  // Lista de tags populares extraídas do catálogo tipado
  const popularTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    fullCatalog.forEach(item => {
      item.tags.forEach(tag => {
        const t = tag.trim().toLowerCase();
        if (t && t.length > 2) {
          tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
        }
      });
    });
    return Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag]) => tag);
  }, [fullCatalog]);

  // Filtragem composta por busca textual, categoria, tipo e tag
  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return fullCatalog.filter(item => {
      // Filtro de Categoria
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Filtro de Tipo (Estático vs Loop Animado)
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      // Filtro de Tag ativa
      if (selectedTag && !item.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }
      // Busca textual por nome, tags, patrocinador ou categoria
      if (query) {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesSponsor = item.sponsorName ? item.sponsorName.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesTags && !matchesCat && !matchesSponsor) return false;
      }
      return true;
    });
  }, [fullCatalog, searchTerm, selectedCategory, typeFilter, selectedTag]);

  // Resetar paginação ao alterar qualquer critério de filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, typeFilter, selectedTag, pageSize]);

  // Cálculo da Paginação
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Fatiamento da página atual para virtualização
  const paginatedAssets = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredAssets.slice(startIndex, startIndex + pageSize);
  }, [filteredAssets, validCurrentPage, pageSize]);

  // Cálculo de colunas responsivas para o grid virtualizado
  const columns = containerDimensions.width < 430 ? 2 : 3;
  const rowCount = Math.ceil(paginatedAssets.length / columns);
  const rowHeight = 224; // Altura precisa para os cards com gap

  // Contagem por Categoria para os botões de filtro
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: fullCatalog.length };
    fullCatalog.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [fullCatalog]);

  // Dispara seleção e registra métrica de uso do pack patrocinado
  const handleSelect = (asset: AssetItem) => {
    if (asset.packId && onTrackAssetUsage) {
      onTrackAssetUsage(asset.packId);
    }
    onSelectAsset(asset);
  };

  // Handler de Drag Start: serializa o asset tipado para transferência HTML5
  const handleDragStart = (e: React.DragEvent, asset: AssetItem) => {
    if (asset.packId && onTrackAssetUsage) {
      onTrackAssetUsage(asset.packId);
    }
    const assetJson = JSON.stringify(asset);
    e.dataTransfer.setData('application/json', assetJson);
    e.dataTransfer.setData('upmm/asset', assetJson);
    e.dataTransfer.setData('text/plain', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDraggingAny(true);
  };

  const handleDragEnd = () => {
    setIsDraggingAny(false);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setSearchTerm('');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
    setSelectedCategory('all');
    setTypeFilter('all');
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex justify-end transition-colors duration-200 ${
        isDraggingAny ? 'bg-black/20 pointer-events-none' : 'bg-black/75 backdrop-blur-xs'
      }`}
    >
      {/* Backdrop para fechar a gaveta (desativado temporariamente durante drag para permitir soltar no canvas) */}
      <div 
        className={`absolute inset-0 ${isDraggingAny ? 'pointer-events-none' : 'cursor-pointer'}`}
        onClick={isDraggingAny ? undefined : onClose} 
      />

      {/* Container Principal da Gaveta */}
      <div 
        className="relative w-full max-w-xl bg-white h-full flex flex-col shadow-2xl border-l border-gray-200 z-10 animate-in slide-in-from-right duration-300 pointer-events-auto"
        role="dialog"
        aria-label="Catálogo de Assets e Stickers"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#2D2A26] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB800] text-[#2D2A26] flex items-center justify-center font-black shadow-md">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FFB800] bg-white/10 px-2 py-0.5 rounded-full">
                  Catálogo de Intervenção
                </span>
                <span className="text-[9px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                  {filteredAssets.length} de {catalog.length}
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-white mt-0.5">
                Stickers & Loops Animados
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Fechar Gaveta"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Busca & Filtro de Tipos */}
        <div className="p-3.5 border-b border-gray-100 bg-gray-50/80 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, tag (ex: spray, bomb, cerrado, neon)..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tag Ativa & Chips de Tags Populares */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 font-bold uppercase flex items-center gap-1">
                <Tag size={11} />
                <span>Tags Populares:</span>
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[9px] font-black uppercase text-[#FF5722] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X size={10} />
                  <span>Limpar #{selectedTag}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {popularTags.map(tag => {
                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#2D2A26] text-[#FFB800] shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro de Tipos (Todos / Estáticos / Loops) */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
            <div className="flex items-center gap-1.5 text-[10px]">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-black uppercase transition cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#2D2A26] text-[#FFB800]'
                    : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Todos ({filteredAssets.length})
              </button>
              <button
                onClick={() => setTypeFilter('static_sticker')}
                className={`px-2.5 py-1 rounded-lg font-black uppercase transition cursor-pointer ${
                  typeFilter === 'static_sticker'
                    ? 'bg-[#2D2A26] text-[#FFB800]'
                    : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Estáticos
              </button>
              <button
                onClick={() => setTypeFilter('animated_sticker')}
                className={`px-2.5 py-1 rounded-lg font-black uppercase transition flex items-center gap-1 cursor-pointer ${
                  typeFilter === 'animated_sticker'
                    ? 'bg-[#FF5722] text-white shadow-xs'
                    : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Zap size={11} />
                <span>Loops Animados</span>
              </button>
            </div>

            {/* Seletor de Itens por Página */}
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="hidden sm:inline font-bold">Por pág:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-[#FFB800]"
              >
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
              </select>
            </div>
          </div>

          {/* Categorias com Scroll Horizontal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap transition shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#FFB800] text-[#2D2A26] shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas ({categoryCounts.all || 0})
            </button>
            {ASSET_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FFB800] text-[#2D2A26] shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Área Central: Lista Virtualizada com react-window */}
        <div ref={listContainerRef} className="flex-1 w-full bg-gray-50/50 overflow-hidden relative">
          {filteredAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#FFB800] flex items-center justify-center mb-3">
                <Search size={24} />
              </div>
              <h4 className="text-sm font-black uppercase text-[#2D2A26]">Nenhum asset encontrado</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Não encontramos stickers com os filtros atuais. Tente buscar por outros termos ou limpar os filtros.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-[#2D2A26] hover:bg-black text-[#FFB800] rounded-xl text-xs font-black uppercase transition cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <List<RowPropsData>
              className="no-scrollbar"
              style={{ width: containerDimensions.width, height: containerDimensions.height }}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowComponent={VirtualRow}
              rowProps={{
                items: paginatedAssets,
                columns,
                onSelect: handleSelect,
                onTagClick: handleTagClick,
                onDragStart: handleDragStart,
                onDragEnd: handleDragEnd
              }}
            />
          )}
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition cursor-pointer text-gray-700"
                title="Primeira página"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition cursor-pointer text-gray-700"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-600">
                Página <span className="font-black text-[#2D2A26]">{validCurrentPage}</span> de {totalPages}
              </span>
              <span className="text-[10px] text-gray-400">
                ({filteredAssets.length} assets)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition cursor-pointer text-gray-700"
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition cursor-pointer text-gray-700"
                title="Última página"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Rodapé com Dica de Drag-and-Drop & Centralização */}
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-[#2D2A26] text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FFB800] text-[#2D2A26] flex items-center justify-center shrink-0">
              <Move size={13} />
            </div>
            <p className="text-[10px] font-bold text-gray-300 leading-tight">
              <strong className="text-white">Arraste e solte</strong> diretamente sobre o canvas para posicionar no centro, ou clique no card para adicionar instantaneamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#FFB800] hover:bg-amber-400 text-[#2D2A26] rounded-xl text-[10px] font-black uppercase transition shrink-0 cursor-pointer shadow-xs"
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDrawer;
