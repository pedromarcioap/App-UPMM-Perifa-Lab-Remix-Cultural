// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Navigation2, 
  Paintbrush, 
  Search, 
  LocateFixed, 
  X, 
  Layers, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  GitFork,
  Eye,
  Flame,
  ArrowRight,
  MessageSquare,
  Compass
} from 'lucide-react';
import { PhotoBase, GraffitiSpot, User, Comment } from '../types';
import L from 'leaflet';
import { UrbanRadarMapsGrounding } from './UrbanRadarMapsGrounding';

export interface TerritoryQuickJump {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  zoom: number;
  description: string;
}

export const PALMAS_TERRITORIES: TerritoryQuickJump[] = [
  {
    id: 't-all',
    name: 'Toda Palmas',
    neighborhood: 'Palmas (Geral)',
    lat: -10.2500,
    lng: -48.3200,
    zoom: 12,
    description: 'Visão panorâmica de toda a capital e quebradas'
  },
  {
    id: 't-taquaralto',
    name: 'Taquaralto',
    neighborhood: 'Taquaralto',
    lat: -10.3235,
    lng: -48.3038,
    zoom: 15,
    description: 'Polo cultural e comercial da Região Sul de Palmas'
  },
  {
    id: 't-aureny',
    name: 'Jardim Aureny III',
    neighborhood: 'Jardim Aureny III',
    lat: -10.2741,
    lng: -48.3182,
    zoom: 15,
    description: 'Muralismo urbano e tradição comunitária'
  },
  {
    id: 't-morada',
    name: 'Morada do Sol',
    neighborhood: 'Morada do Sol',
    lat: -10.2982,
    lng: -48.3125,
    zoom: 15,
    description: 'Expressão periférica e cores vibrantes'
  },
  {
    id: 't-taquari',
    name: 'Setor Taquari',
    neighborhood: 'Setor Taquari',
    lat: -10.3392,
    lng: -48.2865,
    zoom: 15,
    description: 'Encontro da arte periférica com o cerrado tocantinense'
  },
  {
    id: 't-espaco',
    name: 'Espaço Cultural',
    neighborhood: 'Plano Diretor Sul',
    lat: -10.2075,
    lng: -48.3372,
    zoom: 16,
    description: 'Complexo artístico José Gomes Sobrinho'
  },
  {
    id: 't-graciosa',
    name: 'Orla Graciosa',
    neighborhood: 'Orla Graciosa',
    lat: -10.1985,
    lng: -48.3650,
    zoom: 15,
    description: 'Pier, orla do Lago de Palmas e pôr do sol clássico'
  },
  {
    id: 't-girassois',
    name: 'Praça dos Girassóis',
    neighborhood: 'Plano Diretor',
    lat: -10.1840,
    lng: -48.3330,
    zoom: 15,
    description: 'Centro cívico e marco zero da capital'
  }
];

interface PalmasRealMapProps {
  photos: PhotoBase[];
  graffitiSpots: GraffitiSpot[];
  currentUser: User | null;
  selectedPhotoId?: string | null;
  onSelectPhoto: (photo: PhotoBase) => void;
  onOpenGraffitiModal: (coords: { lat: number; lng: number; neighborhood: string; address: string }) => void;
  isMarkingMode: boolean;
  setIsMarkingMode: (val: boolean) => void;
  onRequireLogin: () => void;
  comments?: Comment[];
  onOpenComments?: (targetId: string, targetType: 'photo' | 'spot') => void;
}

export const PalmasRealMap: React.FC<PalmasRealMapProps> = ({
  photos,
  graffitiSpots,
  currentUser,
  selectedPhotoId,
  onSelectPhoto,
  onOpenGraffitiModal,
  isMarkingMode,
  setIsMarkingMode,
  onRequireLogin,
  comments = [],
  onOpenComments
}) => {
  const navigate = useNavigate();

  const [activeTerritory, setActiveTerritory] = useState<string>('t-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'base' | 'remix' | 'spots'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  
  // Selected items for modal or info window
  const [activePhoto, setActivePhoto] = useState<PhotoBase | null>(null);
  const [activeSpot, setActiveSpot] = useState<GraffitiSpot | null>(null);
  const [comparisonView, setComparisonView] = useState<'remix' | 'base' | 'side-by-side'>('remix');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'base' | 'remix'>('all');

  // Helper functions for remix relations
  const getRemixesForPhoto = (photoId: string) => 
    photos.filter(p => p.type === 'remix' && p.originalPhotoId === photoId);

  const getOriginalForRemix = (remix: PhotoBase) =>
    photos.find(p => p.id === remix.originalPhotoId);

  const basePhotos = photos.filter(p => p.type !== 'remix' && p.location);
  const remixPhotos = photos.filter(p => p.type === 'remix' && p.location);
  
  // Target coordinates to pan either Leaflet or Google Maps
  const [targetView, setTargetView] = useState<{ lat: number; lng: number; zoom?: number } | null>({
    lat: -10.2500,
    lng: -48.3200,
    zoom: 12
  });

  // Leaflet map container ref
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Sync selected photo from parent prop
  useEffect(() => {
    if (selectedPhotoId) {
      const found = photos.find(p => p.id === selectedPhotoId);
      if (found && found.location) {
        setActivePhoto(found);
        setComparisonView('remix');
        setTargetView({ lat: found.location.lat, lng: found.location.lng, zoom: 16 });
      }
    }
  }, [selectedPhotoId, photos]);

  // Helper to determine neighborhood from coordinates in Palmas
  const getPalmasNeighborhood = (lat: number, _lng: number): { neighborhood: string; address: string } => {
    if (lat <= -10.315) {
      return {
        neighborhood: 'Taquaralto',
        address: 'Região Sul de Palmas (Taquaralto / Taquari), Palmas - TO'
      };
    }
    if (lat <= -10.265) {
      return {
        neighborhood: 'Jardim Aureny III',
        address: 'Setor Aureny III / Morada do Sol, Palmas - TO'
      };
    }
    if (lat <= -10.210) {
      return {
        neighborhood: 'Plano Diretor Sul',
        address: 'Quadras Sul, Av. Teotônio Segurado, Palmas - TO'
      };
    }
    return {
      neighborhood: 'Plano Diretor Norte',
      address: 'Quadras Norte / Orla Graciosa, Palmas - TO'
    };
  };

  // User location tracking
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setTargetView({ lat: coords.lat, lng: coords.lng, zoom: 15 });
        },
        () => {
          // Fallback to Palmas Center if denied
          setTargetView({ lat: -10.2450, lng: -48.3250, zoom: 13 });
        }
      );
    }
  };

  // Territory Jump
  const handleSelectTerritory = (t: TerritoryQuickJump) => {
    setActiveTerritory(t.id);
    setTargetView({ lat: t.lat, lng: t.lng, zoom: t.zoom });
  };

  // References to keep event callbacks completely fresh without stale closures
  const isMarkingModeRef = useRef(isMarkingMode);
  isMarkingModeRef.current = isMarkingMode;

  // Map Click Handler for marking spots
  const handleTriggerSpotCreation = (lat: number, lng: number) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    const info = getPalmasNeighborhood(lat, lng);
    onOpenGraffitiModal({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      neighborhood: info.neighborhood,
      address: `${info.address} [${lat.toFixed(4)}, ${lng.toFixed(4)}]`
    });
    setIsMarkingMode(false);
  };

  const handleTriggerSpotCreationRef = useRef(handleTriggerSpotCreation);
  handleTriggerSpotCreationRef.current = handleTriggerSpotCreation;

  // Update cursor and map style when marking mode toggles
  useEffect(() => {
    if (leafletMapRef.current) {
      const container = leafletMapRef.current.getContainer();
      if (isMarkingMode) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }
  }, [isMarkingMode]);

  // -------------------------------------------------------------
  // LEAFLET INITIALIZATION & UPDATES
  // -------------------------------------------------------------
  useEffect(() => {
    if (!leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [-10.2500, -48.3200],
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap authentic tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Palmas, Tocantins'
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      leafletMarkersLayerRef.current = markersLayer;

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isMarkingModeRef.current) {
          handleTriggerSpotCreationRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      leafletMapRef.current = map;
    }

    return () => {
      // Keep map instance unless unmounted
    };
  }, []);

  // Update Leaflet markers whenever photos, spots, or filters change
  useEffect(() => {
    if (!leafletMapRef.current || !leafletMarkersLayerRef.current) return;

    const markersLayer = leafletMarkersLayerRef.current;
    markersLayer.clearLayers();

    // 1. Photos & Remixes
    const photosToRender = photos.filter(p => {
      if (!p.location) return false;
      if (filterType === 'all') return true;
      if (filterType === 'base') return p.type !== 'remix';
      if (filterType === 'remix') return p.type === 'remix';
      return false;
    });

    if (filterType === 'all' || filterType === 'base' || filterType === 'remix') {
      photosToRender.forEach((photo) => {
        const isRemix = photo.type === 'remix';
        const localRemixes = getRemixesForPhoto(photo.id);
        const isSelected = activePhoto?.id === photo.id;

        // Apply a small offset for remixes sharing exact spot with base so both pins are visible & clickable
        const lat = isRemix ? photo.location!.lat + 0.0007 : photo.location!.lat;
        const lng = isRemix ? photo.location!.lng + 0.0007 : photo.location!.lng;

        const borderColor = isSelected ? '#2D2A26' : (isRemix ? '#9333EA' : '#FFB800');
        const badgeText = isRemix 
          ? '★ REMIX' 
          : (localRemixes.length > 0 ? `✨ ${localRemixes.length} ${localRemixes.length === 1 ? 'remix' : 'remixes'}` : (photo.location?.neighborhood || 'Palmas'));
        const badgeBg = isRemix ? '#9333EA' : (localRemixes.length > 0 ? '#1E1B4B' : '#2D2A26');
        const badgeColor = isRemix ? '#FFFFFF' : (localRemixes.length > 0 ? '#E9D5FF' : '#FFB800');

        const photoIcon = L.divIcon({
          className: isRemix ? 'custom-remix-pin' : 'custom-photo-pin',
          html: `
            <div style="transform: translate(-50%, -50%); cursor: pointer; position: relative;">
              <div style="
                background: white; 
                padding: 3px; 
                border-radius: 14px; 
                border: 3px solid ${borderColor}; 
                box-shadow: 0 10px 25px -5px ${isRemix ? 'rgba(147, 51, 234, 0.45)' : 'rgba(0,0,0,0.3)'};
                transition: transform 0.2s;
                transform: scale(${isSelected ? 1.25 : 1});
                width: 50px;
                height: 50px;
                overflow: hidden;
                position: relative;
              ">
                <img src="${photo.imageUrl}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" />
                ${isRemix ? `<div style="position: absolute; top: 2px; right: 2px; background: #9333EA; color: white; border-radius: 4px; padding: 1px 3px; font-size: 7px; font-weight: 900; line-height: 1;">REMIX</div>` : ''}
              </div>
              <div style="
                position: absolute;
                bottom: -9px;
                left: 50%;
                transform: translateX(-50%);
                background: ${badgeBg};
                color: ${badgeColor};
                font-size: 8px;
                font-weight: 900;
                padding: 1.5px 7px;
                border-radius: 9999px;
                white-space: nowrap;
                text-transform: uppercase;
                box-shadow: 0 2px 5px rgba(0,0,0,0.35);
                border: 1px solid rgba(255,255,255,0.25);
              ">${badgeText}</div>
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        });

        const marker = L.marker([lat, lng], { icon: photoIcon });
        marker.on('click', (e) => {
          if (isMarkingModeRef.current) {
            L.DomEvent.stopPropagation(e);
            handleTriggerSpotCreationRef.current(lat, lng);
            return;
          }
          setActivePhoto(photo);
          setComparisonView('remix');
          setActiveSpot(null);
          onSelectPhoto(photo);
        });
        marker.addTo(markersLayer);
      });
    }

    // 2. Graffiti spots
    if (filterType === 'all' || filterType === 'spots') {
      graffitiSpots.forEach((spot) => {
        const isPermitted = spot.type === 'permitido';
        const spotIcon = L.divIcon({
          className: 'custom-spot-pin',
          html: `
            <div style="transform: translate(-50%, -50%); cursor: pointer;">
              <div style="
                background: ${isPermitted ? '#10B981' : '#3B82F6'}; 
                color: white; 
                width: 38px; 
                height: 38px; 
                border-radius: 50%; 
                border: 3px solid white;
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 10px 20px -3px rgba(0,0,0,0.35);
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
                  <path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon });
        marker.on('click', (e) => {
          if (isMarkingModeRef.current) {
            L.DomEvent.stopPropagation(e);
            handleTriggerSpotCreationRef.current(spot.lat, spot.lng);
            return;
          }
          setActiveSpot(spot);
          setActivePhoto(null);
        });
        marker.addTo(markersLayer);
      });
    }

    // 3. User GPS pin
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-gps-pin',
        html: `
          <div style="transform: translate(-50%, -50%);">
            <div style="width: 24px; height: 24px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
              <div style="width: 12px; height: 12px; background: #2563EB; border: 2px solid white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(markersLayer);
    }
  }, [photos, graffitiSpots, filterType, activePhoto, userLocation, onSelectPhoto]);

  // Pan Leaflet map to targetView
  useEffect(() => {
    if (leafletMapRef.current && targetView) {
      leafletMapRef.current.flyTo([targetView.lat, targetView.lng], targetView.zoom || 14, {
        duration: 1.2
      });
    }
  }, [targetView]);

  // Filtered photos based on search query
  const filteredPhotos = photos.filter(p => {
    if (!p.location) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const original = p.originalPhotoId ? photos.find(o => o.id === p.originalPhotoId) : null;
    return (
      p.title.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.location.neighborhood.toLowerCase().includes(q) ||
      (p.location.address && p.location.address.toLowerCase().includes(q)) ||
      (p.type === 'remix' && ('remix'.includes(q) || 'releituras'.includes(q))) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (original && (original.title.toLowerCase().includes(q) || original.authorName.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#FFB800] text-[#2D2A26] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Mapa Real de Palmas
            </span>
            <span className="text-xs text-gray-400 font-bold uppercase">Tocantins - BR</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mt-1">Mapa da Visão PMW</h2>
          <p className="text-xs font-black uppercase text-gray-400 tracking-widest">
            Encontre onde as fotos foram feitas e marque pontos livres para a arte
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Radar Google Maps with Gemini Grounding */}
          <button
            onClick={() => setIsRadarOpen(true)}
            className="px-4 py-3 bg-[#2D2A26] hover:bg-black text-[#FFB800] rounded-2xl shadow-xl font-black uppercase text-xs flex items-center space-x-2 transition border border-[#FFB800]/40 hover:scale-105"
            title="Radar Google Maps (Gemini 2.5 Flash Grounding)"
          >
            <Compass size={16} className="text-[#FFB800]" />
            <span>Radar Google Maps</span>
          </button>

          {/* Mark Point Button */}
          <button 
            onClick={() => {
              if (!currentUser) {
                onRequireLogin();
                return;
              }
              const nextMode = !isMarkingMode;
              setIsMarkingMode(nextMode);
              if (nextMode) {
                setActivePhoto(null);
                setActiveSpot(null);
              }
            }}
            className={`px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center justify-center space-x-2 transition shadow-xl ${
              isMarkingMode ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FFB800] text-[#2D2A26] hover:scale-105'
            }`}
          >
            {isMarkingMode ? <X size={16} /> : <Paintbrush size={16} />}
            <span>{isMarkingMode ? 'Cancelar Marcação' : 'Sinalizar Ponto'}</span>
          </button>

          {/* GPS Locate button */}
          <button 
            onClick={handleLocateMe} 
            className="bg-[#242220] text-white p-3 rounded-2xl shadow-xl hover:bg-[#2D2A26] transition border border-[#3E3A35] cursor-pointer"
            title="Minha Localização GPS"
          >
            <LocateFixed size={20} className="text-[#FFB800]" />
          </button>
        </div>
      </header>

      {/* Territory Quick-Jump Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[10px] font-black uppercase text-zinc-400 whitespace-nowrap pl-1">Territórios:</span>
        {PALMAS_TERRITORIES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelectTerritory(t)}
            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all border cursor-pointer ${
              activeTerritory === t.id
                ? 'bg-[#FFB800] text-[#141311] border-[#FFB800] shadow-md scale-105 font-black'
                : 'bg-[#1C1B19] text-zinc-300 border-[#3E3A35] hover:border-[#FFB800]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Search & Layer Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#FFB800] transition">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar foto, endereço real, quadra ou território em Palmas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#1C1B19] text-white rounded-2xl border border-[#3E3A35] shadow-lg focus:outline-none focus:border-[#FFB800] font-bold text-xs placeholder-zinc-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex bg-[#1C1B19] p-1.5 rounded-2xl border border-[#3E3A35] shadow-lg overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition cursor-pointer ${
              filterType === 'all' ? 'bg-[#FFB800] text-[#141311]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tudo ({photos.filter(p => p.location).length + graffitiSpots.length})
          </button>
          <button
            onClick={() => setFilterType('base')}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition cursor-pointer ${
              filterType === 'base' ? 'bg-[#FFB800] text-[#141311]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Fotos Base ({basePhotos.length})
          </button>
          <button
            onClick={() => setFilterType('remix')}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'remix' ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40' : 'text-purple-400 hover:bg-purple-950/40'
            }`}
          >
            <Sparkles size={11} />
            <span>Remixes ({remixPhotos.length})</span>
          </button>
          <button
            onClick={() => setFilterType('spots')}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition cursor-pointer ${
              filterType === 'spots' ? 'bg-[#FFB800] text-[#141311]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Muros ({graffitiSpots.length})
          </button>
        </div>
      </div>

      {/* Marking mode banner */}
      {isMarkingMode && (
        <div className="bg-[#2D2A26] text-white p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-[#FFB800]">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#FFB800] text-[#2D2A26] rounded-2xl font-black shrink-0">
              <Paintbrush size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">
                  Localização Real PMW
                </span>
                <span className="text-[8px] bg-red-500 text-white font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                  Modo Ativo
                </span>
              </div>
              <h4 className="font-black uppercase text-sm text-white">Sinalizar Ponto de Arte Urbana</h4>
              <p className="text-[11px] text-gray-300">
                Clique ou toque em qualquer quadra, rua ou praça no mapa abaixo para registrar um muro permitido ou sugestão.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Quick GPS shortcut */}
            <button
              type="button"
              onClick={() => {
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      handleTriggerSpotCreation(pos.coords.latitude, pos.coords.longitude);
                    },
                    () => {
                      handleTriggerSpotCreation(-10.2450, -48.3250);
                    }
                  );
                } else {
                  handleTriggerSpotCreation(-10.2450, -48.3250);
                }
              }}
              className="bg-white/10 hover:bg-white/20 text-[#FFB800] hover:text-white px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1.5 border border-[#FFB800]/30"
              title="Marcar nas coordenadas do seu GPS atual"
            >
              <LocateFixed size={14} />
              <span>Usar Meu GPS</span>
            </button>

            {/* Territory selector shortcut */}
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const territory = PALMAS_TERRITORIES.find(t => t.id === val);
                if (territory && territory.id !== 't-all') {
                  handleTriggerSpotCreation(territory.lat, territory.lng);
                }
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase transition border border-white/20 focus:outline-none focus:border-[#FFB800]"
            >
              <option value="" className="text-black">Ou escolha um bairro...</option>
              {PALMAS_TERRITORIES.filter(t => t.id !== 't-all').map(t => (
                <option key={t.id} value={t.id} className="text-black">
                  {t.name}
                </option>
              ))}
            </select>

            <button 
              type="button"
              onClick={() => setIsMarkingMode(false)}
              className="px-4 py-2.5 bg-white/10 hover:bg-red-500/80 text-white rounded-xl text-[10px] font-black uppercase transition border border-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MAP VIEW CONTAINER */}
      <div className="relative h-[65vh] min-h-[500px] w-full rounded-[3rem] overflow-hidden border-4 border-[#3E3A35] shadow-2xl bg-[#141311]">
        {/* ================= LEAFLET / OSM REAL TILES ENGINE ================= */}
        <div ref={leafletContainerRef} className="w-full h-full z-10" />

        {/* Floating Indicator when Marking Mode is Active */}
        {isMarkingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 w-full max-w-md">
            <div className="bg-[#1C1B19]/95 backdrop-blur-md text-[#FFB800] px-5 py-3 rounded-2xl shadow-2xl border-2 border-[#FFB800] flex items-center justify-center gap-2 text-center text-xs font-black uppercase tracking-wider animate-bounce">
              <Paintbrush size={16} className="shrink-0 text-white animate-pulse" />
              <span>Toque em qualquer ponto do mapa de Palmas</span>
            </div>
          </div>
        )}

        {/* Selected Photo Floating Inspector Card */}
        {activePhoto && activePhoto.location && (() => {
          const isRemix = activePhoto.type === 'remix';
          const originalPhoto = isRemix ? getOriginalForRemix(activePhoto) : null;
          const remixesOfThisPhoto = !isRemix ? getRemixesForPhoto(activePhoto.id) : [];

          return (
            <div className={`absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 md:left-6 md:right-auto md:w-[420px] max-h-[60vh] md:max-h-[80vh] overflow-y-auto z-30 bg-[#1C1B19]/95 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border-2 transition-all scrollbar-thin text-[#EDE8E1] ${
              isRemix ? 'border-purple-500 shadow-purple-500/20' : 'border-[#FFB800]'
            }`}>
              {/* Header Badges */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-[#FFB800] text-[#141311] px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    {activePhoto.location.neighborhood}
                  </span>
                  {isRemix ? (
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                      <Sparkles size={10} />
                      <span>Remix Criativo</span>
                    </span>
                  ) : (
                    <span className="bg-[#242220] border border-[#3E3A35] text-amber-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                      Foto Base Original
                    </span>
                  )}
                  {activePhoto.isGoldStandard && (
                    <span className="bg-[#FFB800] text-[#141311] px-2 py-1 rounded-full text-[9px] font-black uppercase">
                      Padrão Ouro
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setActivePhoto(null)}
                  className="p-1.5 bg-[#242220] hover:bg-[#2D2A26] rounded-full transition shrink-0 ml-2 text-zinc-400 hover:text-white cursor-pointer"
                  title="Fechar"
                >
                  <X size={14} />
                </button>
              </div>

              {/* REMIX VIEW: Mode Switcher Tabs */}
              {isRemix && originalPhoto && (
                <div className="mb-3 bg-[#242220] p-1 rounded-2xl flex text-[9px] font-black uppercase border border-[#3E3A35]">
                  <button
                    onClick={() => setComparisonView('remix')}
                    className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                      comparisonView === 'remix' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles size={10} />
                    <span>Ver Remix</span>
                  </button>
                  <button
                    onClick={() => setComparisonView('base')}
                    className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                      comparisonView === 'base' ? 'bg-[#FFB800] text-[#141311] shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>Foto Base</span>
                  </button>
                  <button
                    onClick={() => setComparisonView('side-by-side')}
                    className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                      comparisonView === 'side-by-side' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>Lado a Lado</span>
                  </button>
                </div>
              )}

              {/* Media Preview based on view mode */}
              {isRemix && comparisonView === 'side-by-side' && originalPhoto ? (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="space-y-1">
                    <div className="relative rounded-2xl overflow-hidden border border-[#3E3A35] shadow-sm aspect-square bg-black">
                      <img 
                        src={originalPhoto.imageUrl} 
                        alt={originalPhoto.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 left-1 bg-black/80 text-[#FFB800] text-[8px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Base
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-400 truncate">@{originalPhoto.authorName}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 shadow-md aspect-square bg-black">
                      <img 
                        src={activePhoto.imageUrl} 
                        alt={activePhoto.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                        Remix
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-purple-400 truncate">@{activePhoto.authorName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="relative w-28 h-28 shrink-0">
                    <img 
                      src={isRemix && comparisonView === 'base' && originalPhoto ? originalPhoto.imageUrl : activePhoto.imageUrl} 
                      alt={activePhoto.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80';
                      }}
                      className={`w-full h-full object-cover rounded-2xl shadow-md border-2 ${
                        isRemix ? 'border-purple-400' : 'border-[#FFB800]'
                      }`}
                    />
                    {isRemix && comparisonView === 'base' && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[#FFB800] text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md">
                        Base Original
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-white truncate">{activePhoto.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold">
                      {isRemix ? `Remix por @${activePhoto.authorName}` : `Fotógrafo: @${activePhoto.authorName}`}
                    </p>
                    {isRemix && originalPhoto && (
                      <div 
                        onClick={() => {
                          setActivePhoto(originalPhoto);
                          setComparisonView('remix');
                        }}
                        className="mt-1 bg-purple-950/40 hover:bg-purple-900/50 p-1.5 rounded-xl border border-purple-800/60 cursor-pointer transition"
                      >
                        <p className="text-[9px] text-purple-300 font-bold flex items-center gap-1 truncate">
                          <GitFork size={10} className="shrink-0 text-purple-400" />
                          <span className="truncate">Base: {originalPhoto.title}</span>
                        </p>
                        <span className="text-[8px] text-purple-400 underline font-semibold">Ver base original &rarr;</span>
                      </div>
                    )}
                    {activePhoto.tags && activePhoto.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {activePhoto.tags.map(t => (
                          <span key={t} className="text-[8px] bg-[#242220] border border-[#3E3A35] text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Authentic Street Address & Coordinates */}
              <div className="mt-3 p-3 bg-[#242220] rounded-2xl border border-[#3E3A35] text-left">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#FFB800] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-white leading-tight">
                      {activePhoto.location.address || 'Endereço em Palmas, TO'}
                    </p>
                    {activePhoto.location.landmark && (
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        Ref: {activePhoto.location.landmark}
                      </p>
                    )}
                    <p className="text-[8px] text-zinc-500 mt-1 font-mono">
                      GPS: {activePhoto.location.lat.toFixed(4)}, {activePhoto.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* REMIXES ON THIS EXACT SPOT SECTION (When inspecting a base photo) */}
              {!isRemix && (
                <div className="mt-4 pt-3 border-t border-[#3E3A35]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles size={14} className="text-purple-400" />
                      <h5 className="text-[11px] font-black uppercase text-white">
                        Remixes Deste Local ({remixesOfThisPhoto.length})
                      </h5>
                    </div>
                    {remixesOfThisPhoto.length > 0 && (
                      <span className="text-[8px] font-black uppercase text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full">
                        PMW Reinterpretada
                      </span>
                    )}
                  </div>

                  {remixesOfThisPhoto.length > 0 ? (
                    <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
                      {remixesOfThisPhoto.map((remix) => (
                        <div 
                          key={remix.id}
                          onClick={() => {
                            setActivePhoto(remix);
                            setComparisonView('remix');
                          }}
                          className="group shrink-0 w-28 bg-[#242220] hover:bg-[#2A2825] p-2 rounded-2xl border border-[#3E3A35] transition cursor-pointer"
                          title={`Ver remix: ${remix.title}`}
                        >
                          <div className="relative w-full h-20 rounded-xl overflow-hidden mb-1.5 shadow-sm">
                            <img 
                              src={remix.imageUrl} 
                              alt={remix.title} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                            />
                            <span className="absolute top-1 right-1 bg-purple-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-sm">
                              Remix
                            </span>
                          </div>
                          <p className="text-[9px] font-black text-white truncate">{remix.title}</p>
                          <p className="text-[8px] text-zinc-400 truncate">por @{remix.authorName}</p>
                          <div className="flex items-center justify-between mt-1 text-[8px] font-bold text-purple-400">
                            <span>★ {remix.vibeCount}</span>
                            <span className="underline">Ver</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#242220] p-2.5 rounded-2xl text-center border border-[#3E3A35]">
                      <p className="text-[10px] text-zinc-300 font-semibold">Nenhum remix registrado neste local de Palmas ainda.</p>
                      <p className="text-[9px] text-[#FFB800] font-black uppercase mt-0.5">Seja o primeiro a expressar sua arte aqui!</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onRequireLogin();
                        } else {
                          navigate(`/remix/${activePhoto.id}`);
                        }
                      }}
                      className="w-full bg-[#FFB800] text-[#141311] py-2.5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center space-x-2 shadow hover:bg-[#EAB308] transition cursor-pointer"
                    >
                      <Paintbrush size={12} />
                      <span>Remixar Esta Foto no Editor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* REMIX ACTIONS (When inspecting a remix) */}
              {isRemix && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (originalPhoto) {
                        navigate(`/lineage/${originalPhoto.id}`);
                      } else {
                        navigate(`/lineage/${activePhoto.id}`);
                      }
                    }}
                    className="bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] text-purple-300 py-2.5 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <GitFork size={12} />
                    <span>Ver Árvore</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onRequireLogin();
                      } else {
                        navigate(`/remix/${originalPhoto ? originalPhoto.id : activePhoto.id}`);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center space-x-1.5 shadow-md transition cursor-pointer"
                  >
                    <Paintbrush size={12} />
                    <span>Criar Novo Remix</span>
                  </button>
                </div>
              )}

              {/* Navigation & Maps Actions & Comments */}
              <div className="mt-3 pt-3 border-t border-[#3E3A35] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenComments) {
                      onOpenComments(activePhoto.id, 'photo');
                    }
                  }}
                  className="w-full bg-[#242220] hover:bg-[#2D2A26] text-white py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center space-x-2 transition cursor-pointer border border-[#3E3A35]"
                >
                  <MessageSquare size={13} className="text-[#FFB800]" />
                  <span>
                    Ver Comentários ({comments.filter(c => c.targetId === activePhoto.id).length})
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activePhoto.location.lat},${activePhoto.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#FFB800] text-[#141311] py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center space-x-1.5 shadow-md hover:bg-white transition"
                  >
                    <Navigation2 size={12} />
                    <span>Traçar Rota</span>
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${activePhoto.location.lat},${activePhoto.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#242220] text-zinc-300 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center space-x-1.5 shadow-md hover:bg-[#2D2A26] border border-[#3E3A35] transition"
                  >
                    <ExternalLink size={12} />
                    <span>Abrir no Maps</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Selected Graffiti Spot Inspector Card */}
        {activeSpot && (
          <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-96 z-30 bg-[#1C1B19]/95 backdrop-blur-md p-5 rounded-[2.5rem] shadow-2xl border-2 border-blue-500/80 transition-all text-[#EDE8E1]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${
                  activeSpot.type === 'permitido' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  Muro {activeSpot.type}
                </span>
                <span className="text-[9px] font-bold text-zinc-400">por @{activeSpot.userName}</span>
              </div>
              <button 
                onClick={() => setActiveSpot(null)}
                className="p-1.5 bg-[#242220] hover:bg-[#2D2A26] rounded-full transition text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <h4 className="font-black text-sm text-white">{activeSpot.title}</h4>
            <p className="text-[10px] text-zinc-300 mt-1 leading-relaxed">{activeSpot.description}</p>

            <div className="mt-3 p-3 bg-[#242220] rounded-2xl border border-[#3E3A35]">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-zinc-200">
                    {activeSpot.address || `${activeSpot.neighborhood || 'Palmas - TO'}`}
                  </p>
                  <p className="text-[8px] text-zinc-500 font-mono mt-0.5">
                    GPS: {activeSpot.lat.toFixed(4)}, {activeSpot.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenComments) {
                    onOpenComments(activeSpot.id, 'spot');
                  }
                }}
                className="flex-1 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-800/60 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <MessageSquare size={13} className="text-blue-400" />
                <span>Comentários ({comments.filter(c => c.targetId === activeSpot.id).length})</span>
              </button>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeSpot.lat},${activeSpot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FFB800] text-[#141311] py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center space-x-1.5 shadow-md hover:bg-[#EAB308] transition"
              >
                <Navigation2 size={12} />
                <span>Como Chegar ao Muro</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Real Palmas Photo Directory (Locatable addresses list with Remix awareness) */}
      <div className="bg-[#1C1B19] p-6 md:p-8 rounded-[3rem] shadow-xl border border-[#3E3A35]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">Obras e Remixes Localizáveis em Palmas</h3>
            <p className="text-xs text-zinc-400 font-bold">Clique em uma obra ou remix para focar sua localização exata no mapa de Palmas</p>
          </div>

          {/* Directory Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#242220] p-1 rounded-2xl border border-[#3E3A35]">
            <button
              onClick={() => setDirectoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                directoryFilter === 'all' ? 'bg-[#FFB800] text-[#141311] shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({filteredPhotos.length})
            </button>
            <button
              onClick={() => setDirectoryFilter('base')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
                directoryFilter === 'base' ? 'bg-[#FFB800] text-[#141311] shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fotos Base ({filteredPhotos.filter(p => p.type !== 'remix').length})
            </button>
            <button
              onClick={() => setDirectoryFilter('remix')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1 cursor-pointer ${
                directoryFilter === 'remix' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:bg-purple-950/40'
              }`}
            >
              <Sparkles size={11} />
              <span>Remixes ({filteredPhotos.filter(p => p.type === 'remix').length})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos
            .filter(p => {
              if (directoryFilter === 'all') return true;
              if (directoryFilter === 'base') return p.type !== 'remix';
              if (directoryFilter === 'remix') return p.type === 'remix';
              return true;
            })
            .map((photo) => {
              const isSelected = activePhoto?.id === photo.id;
              const isRemix = photo.type === 'remix';
              const localRemixes = getRemixesForPhoto(photo.id);
              const original = isRemix ? getOriginalForRemix(photo) : null;

              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    setActivePhoto(photo);
                    setComparisonView('remix');
                    setActiveSpot(null);
                    setTargetView({ lat: photo.location!.lat, lng: photo.location!.lng, zoom: 16 });
                    onSelectPhoto(photo);
                  }}
                  className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center space-x-4 ${
                    isSelected 
                      ? (isRemix ? 'border-purple-500 bg-purple-950/40 shadow-lg scale-102' : 'border-[#FFB800] bg-[#FFB800]/15 shadow-lg scale-102')
                      : (isRemix ? 'border-purple-900/50 hover:border-purple-500 bg-[#242220]' : 'border-[#3E3A35] hover:border-[#FFB800] bg-[#242220] hover:bg-[#2A2825]')
                  }`}
                >
                  <div className="relative w-16 h-16 shrink-0 bg-black rounded-2xl overflow-hidden border border-[#3E3A35]">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-full h-full object-cover rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                    {isRemix && (
                      <span className="absolute top-1 right-1 bg-purple-600 text-white text-[7px] font-black uppercase px-1 rounded shadow">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-black uppercase bg-[#FFB800] text-[#141311] px-2 py-0.5 rounded-full font-bold">
                        {photo.location?.neighborhood}
                      </span>
                      {isRemix ? (
                        <span className="text-[8px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Remix
                        </span>
                      ) : (
                        localRemixes.length > 0 && (
                          <span className="text-[8px] font-black uppercase bg-purple-950/60 border border-purple-800/60 text-purple-300 px-2 py-0.5 rounded-full">
                            ✨ {localRemixes.length} remixes
                          </span>
                        )
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-white truncate mt-1">{photo.title}</h4>
                    <p className="text-[9px] text-zinc-400 truncate">
                      {isRemix ? `por @${photo.authorName} (base: @${original?.authorName || 'Artista'})` : `por @${photo.authorName}`}
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#3E3A35]">
                      <p className="text-[9px] text-zinc-400 truncate flex items-center gap-1 font-mono text-[8px] min-w-0">
                        <MapPin size={9} className={isRemix ? 'text-purple-400 shrink-0' : 'text-[#FFB800] shrink-0'} />
                        <span className="truncate">{photo.location?.address || photo.location?.neighborhood}</span>
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenComments) onOpenComments(photo.id, 'photo');
                        }}
                        className="text-[9px] text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 ml-2 font-bold px-1.5 py-0.5 rounded-md hover:bg-[#2D2A26] transition cursor-pointer"
                        title="Ver ou adicionar comentários"
                      >
                        <MessageSquare size={10} className="text-[#FFB800]" />
                        <span>{comments.filter(c => c.targetId === photo.id).length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Legend and Info Box */}
      <div className="bg-[#1C1B19] p-6 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between border border-[#3E3A35] gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-[#FFB800]/20 p-3 rounded-2xl text-[#FFB800] border border-[#FFB800]/30">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-black uppercase text-xs text-white">Mapeamento Cultural Real & Remixes de Palmas</h4>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">
              Obras originais e releituras artísticas geolocalizadas em Taquaralto, Aureny, Taquari, Morada do Sol, Graciosa e Plano Diretor
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-[#242220] px-3 py-2 rounded-xl border border-[#3E3A35]">
            <div className="w-3 h-3 bg-[#FFB800] rounded-full" />
            <span className="text-[9px] font-black uppercase text-zinc-300">Foto Base Original</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-950/60 px-3 py-2 rounded-xl border border-purple-800/60">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-[9px] font-black uppercase text-purple-300">Remix no Local</span>
          </div>
          <div className="flex items-center space-x-2 bg-[#242220] px-3 py-2 rounded-xl border border-[#3E3A35]">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-[9px] font-black uppercase text-zinc-300">Muro Autorizado</span>
          </div>
          <div className="flex items-center space-x-2 bg-[#242220] px-3 py-2 rounded-xl border border-[#3E3A35]">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-[9px] font-black uppercase text-zinc-300">Muro Sugerido</span>
          </div>
        </div>
      </div>

      {/* Urban Radar with Google Maps Grounding Modal */}
      <UrbanRadarMapsGrounding 
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        userLocation={userLocation}
        onNavigateToCoords={(coords) => {
          setTargetView(coords);
        }}
      />
    </div>
  );
};
