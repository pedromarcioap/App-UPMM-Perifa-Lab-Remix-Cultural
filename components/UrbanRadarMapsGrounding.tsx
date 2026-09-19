import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  Navigation, 
  X, 
  Info,
  Map as MapIcon,
  Flame,
  CornerDownRight
} from 'lucide-react';

interface MapsGroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: string[];
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

interface UrbanRadarProps {
  userLocation?: { lat: number; lng: number } | null;
  onNavigateToCoords?: (coords: { lat: number; lng: number; zoom?: number }) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PALMAS_RADAR_PROMPTS = [
  {
    label: '🛹 Pistas de Skate & Street',
    query: 'Pistas de skate públicas, praças com bowls e street spots para manobras em Palmas TO'
  },
  {
    label: '🎨 Murais & Centros Culturais',
    query: 'Murais de grafite, centros culturais e pontos de arte urbana em Palmas Tocantins'
  },
  {
    label: '🎤 Taquaralto & Região Sul',
    query: 'Espaços comunitários, feiras e pontos de cultura popular em Taquaralto e Aureny Palmas'
  },
  {
    label: '🏛️ Espaço Cultural & Centro',
    query: 'Espaço Cultural José Gomes Sobrinho e monumentos na Praça dos Girassóis Palmas'
  },
  {
    label: '🌅 Orla & Pôr do Sol',
    query: 'Pontos culturais, quiosques e lazer na Orla da Praia da Graciosa em Palmas'
  }
];

export const UrbanRadarMapsGrounding: React.FC<UrbanRadarProps> = ({
  userLocation,
  onNavigateToCoords,
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<MapsGroundingChunk[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setResultText(null);
    setGroundingChunks([]);

    try {
      const response = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          latitude: userLocation?.lat || -10.2450,
          longitude: userLocation?.lng || -48.3250
        })
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta do servidor (${response.status})`);
      }

      const data = await response.json();
      setResultText(data.text || 'Nenhuma informação detalhada retornada.');
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      console.error('Erro no Radar Google Maps:', err);
      setErrorMessage(err?.message || 'Não foi possível consultar os dados do Google Maps no momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[130] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#FFB800] text-[#2D2A26] rounded-2xl">
              <Compass size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#2D2A26] text-[#FFB800] px-2 py-0.5 rounded-full">
                  Google Maps Grounding
                </span>
                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#FFB800]" /> Gemini 2.5 Flash
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#2D2A26] mt-0.5">
                Radar da Cultura de Rua em Palmas
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-black transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="pt-4 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Pesquise locais, pistas, praças e pontos culturais..."
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FFB800] transition"
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="px-5 py-3.5 bg-[#2D2A26] hover:bg-black text-[#FFB800] font-black text-xs uppercase tracking-wider rounded-2xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={15} />}
              <span>Buscar</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
            {PALMAS_RADAR_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setQuery(p.query);
                  setActivePrompt(p.label);
                  handleSearch(p.query);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 ${
                  activePrompt === p.label
                    ? 'bg-[#FFB800] text-[#2D2A26] font-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <Loader2 size={36} className="text-[#FFB800] animate-spin" />
                <MapPin size={16} className="text-[#2D2A26] absolute inset-0 m-auto" />
              </div>
              <p className="text-xs font-black uppercase text-[#2D2A26] tracking-wider">
                Consultando dados reais do Google Maps em Palmas...
              </p>
              <p className="text-[11px] text-gray-500 max-w-sm">
                Buscando coordenadas, locais verificados e referências territoriais oficiais.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {resultText && (
            <div className="space-y-4">
              {/* Grounded Text */}
              <div className="p-4 sm:p-5 bg-amber-50/70 border border-[#FFB800]/40 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#FFB800]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                    Visão de Terreno (Google Maps Grounding)
                  </span>
                </div>
                <div className="text-xs leading-relaxed text-gray-800 whitespace-pre-line font-medium">
                  {resultText}
                </div>
              </div>

              {/* Grounding Places & Links from Google Maps */}
              {groundingChunks && groundingChunks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#2D2A26] flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#FFB800]" />
                      <span>Locais Verificados no Google Maps ({groundingChunks.length})</span>
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400">Links Oficiais</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {groundingChunks.map((chunk, index) => {
                      const mapsItem = chunk.maps;
                      const webItem = chunk.web;
                      const title = mapsItem?.title || webItem?.title || `Local Verificado #${index + 1}`;
                      const uri = mapsItem?.uri || webItem?.uri;
                      const snippet = mapsItem?.placeAnswerSources?.reviewSnippets?.[0];

                      if (!uri && !title) return null;

                      return (
                        <div 
                          key={index}
                          className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#FFB800] hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-black text-[#2D2A26] line-clamp-1">
                                {title}
                              </span>
                              <span className="p-1 bg-gray-100 rounded-lg text-gray-500 shrink-0">
                                <MapPin size={12} className="text-[#FFB800]" />
                              </span>
                            </div>
                            {snippet && (
                              <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 italic">
                                "{snippet}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100">
                            {uri ? (
                              <a
                                href={uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#2D2A26] hover:text-[#FFB800] transition"
                              >
                                <span>Ver no Google Maps</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">Palmas - TO</span>
                            )}

                            {onNavigateToCoords && (
                              <button
                                onClick={() => {
                                  // Jump to Palmas center or appropriate spot
                                  onNavigateToCoords({ lat: -10.2075, lng: -48.3372, zoom: 15 });
                                  onClose();
                                }}
                                className="text-[9px] font-black uppercase text-gray-500 hover:text-black flex items-center gap-0.5"
                                title="Focar este setor no mapa"
                              >
                                <span>No Mapa</span>
                                <CornerDownRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !resultText && !errorMessage && (
            <div className="py-8 text-center space-y-2">
              <div className="inline-flex p-3 bg-gray-100 rounded-full text-gray-400">
                <MapIcon size={24} />
              </div>
              <p className="text-xs font-bold text-gray-600">
                Selecione um dos temas rápidos acima ou digite o que procura em Palmas.
              </p>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                O Radar consulta o Google Maps oficial com Gemini 2.5 Flash para trazer endereços reais, referências de bairro e links diretos do Google Maps.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 shrink-0">
          <span>Palmas • Tocantins • Brasil</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
          >
            Fechar Radar
          </button>
        </div>
      </div>
    </div>
  );
};
