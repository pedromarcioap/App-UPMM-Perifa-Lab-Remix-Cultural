
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Trash2,
  Loader2,
  Type,
  Sparkles,
  Image as ImageIcon,
  Zap,
  Layers,
  Search,
  Target,
  Check,
  Move,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  Rocket,
  Download,
  Share2,
  MessageCircle,
  X,
  Flame,
  Trophy,
  Eye
} from 'lucide-react';
import { PhotoBase, User, Sticker } from '../types';
import { STICKERS, ANIMATED_STICKERS, COLORS, STREET_FONTS } from '../constants';
import { AssetDrawer } from './AssetDrawer';
import { AssetItem, BrandedAssetPack } from '../types/assets';
import { ASSET_CATALOG } from '../constants/assetsCatalog';
import { uploadImageToSupabase, isSupabaseConfigured } from '../supabase';

// Performance & Memory Guards for Canvas & Mobile
const MAX_ASSET_DIMENSION = 512; // Downscale large assets to max 512px to prevent GPU out-of-memory
const MAX_CACHE_ENTRIES = 40;   // Prevent memory leaks by evicting stale textures
const MAX_LAYERS_LIMIT = 15;    // Defensive ceiling of simultaneous layers

export type TextPresetId = 'tag-branca' | 'neon-roxo' | 'pixo-preto' | 'cartaz-lambe';

export interface UrbanTextPreset {
  id: TextPresetId;
  name: string;
  desc: string;
  fontFamily: string;
  previewText: string;
}

export const URBAN_TEXT_PRESETS: UrbanTextPreset[] = [
  {
    id: 'tag-branca',
    name: 'Tag Branca',
    desc: 'Canetão Posca, branco com contorno preto pesado',
    fontFamily: "'Permanent Marker', cursive, sans-serif",
    previewText: 'TAG BRANCA'
  },
  {
    id: 'neon-roxo',
    name: 'Neon Roxo',
    desc: 'Glow roxo neon elétrico com spray urbano',
    fontFamily: "'Bungee', cursive, sans-serif",
    previewText: 'NEON ROXO'
  },
  {
    id: 'pixo-preto',
    name: 'Pixo Preto',
    desc: 'Caligrafia de rua agressiva, preta com traço branco',
    fontFamily: "'Sedgwick Ave', cursive, sans-serif",
    previewText: 'PIXO PRETO'
  },
  {
    id: 'cartaz-lambe',
    name: 'Cartaz Lambe',
    desc: 'Letras pretas em bloco sobre tarja kraft amarela',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    previewText: 'CARTAZ LAMBE'
  }
];

interface Layer {
  id: string;
  type: 'sticker' | 'animated-sticker' | 'text';
  content: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  fontFamily?: string;
  stylePreset?: TextPresetId;
  opacity?: number;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
  blur: number;
}

const Editor: React.FC<{ 
  photos: PhotoBase[]; 
  onSave: (remix: PhotoBase) => void; 
  user: User;
  brandedPacks?: BrandedAssetPack[];
  onTrackAssetUsage?: (packId: string) => void;
}> = ({ photos, onSave, user, brandedPacks = [], onTrackAssetUsage }) => {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const basePhoto = photos.find(p => p.id === photoId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 1,
    contrast: 1,
    saturate: 1,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
    blur: 0
  });

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'filters' | 'stickers' | 'animated' | 'text'>('filters');
  const [mobileEditorTab, setMobileEditorTab] = useState<'canvas' | 'tools'>('canvas');
  const [stickerFilter, setStickerFilter] = useState<'all' | 'tag' | 'spray' | 'cerrado' | 'urban' | 'shapes'>('all');
  const [animatedFilter, setAnimatedFilter] = useState<'all' | 'urban' | 'spray' | 'shapes' | 'cerrado'>('all');
  const [inputText, setInputText] = useState('');
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(STREET_FONTS[1].family);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [canvasToast, setCanvasToast] = useState<string | null>(null);
  const [publishedRemix, setPublishedRemix] = useState<PhotoBase | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  
  type RenderableAsset = HTMLImageElement | HTMLCanvasElement;
  const dragStartPos = useRef({ x: 0, y: 0 });
  const layerStartPos = useRef({ x: 0, y: 0 });
  const imageCache = useRef<Map<string, RenderableAsset>>(new Map());
  const lastRenderTime = useRef<number>(0);
  const lastUserInteraction = useRef<number>(Date.now());
  const isDocumentVisible = useRef<boolean>(true);

  // Track document visibility to pause animation loops when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisible.current = !document.hidden;
      if (!document.hidden) {
        lastUserInteraction.current = Date.now();
        drawCanvas();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Limpeza explícita de memória de GPU e instâncias de Canvas na desmontagem do componente
  useEffect(() => {
    return () => {
      if (imageCache.current) {
        imageCache.current.forEach((asset) => {
          if (asset instanceof HTMLCanvasElement) {
            asset.width = 0;
            asset.height = 0;
          }
        });
        imageCache.current.clear();
      }
    };
  }, []);

  const touchActivity = () => {
    lastUserInteraction.current = Date.now();
  };

  useEffect(() => {
    if (!basePhoto) {
        navigate('/');
    }
  }, [basePhoto, navigate]);

  if (!basePhoto) return null;

  // Downscale high-resolution assets via offscreen canvas before main rendering
  const downscaleAssetIfNeeded = (img: HTMLImageElement): RenderableAsset => {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h || (w <= MAX_ASSET_DIMENSION && h <= MAX_ASSET_DIMENSION)) {
      return img;
    }

    const scale = Math.min(MAX_ASSET_DIMENSION / w, MAX_ASSET_DIMENSION / h);
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    try {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'medium';
        offCtx.drawImage(img, 0, 0, targetW, targetH);
        return offCanvas;
      }
    } catch (_) {}

    return img;
  };

  const loadImage = (src: string): Promise<RenderableAsset> => {
    if (imageCache.current.has(src)) return Promise.resolve(imageCache.current.get(src)!);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        img.src = src;
      } else {
        try {
          const url = new URL(src);
          // Only add cache buster if not a known high-perf CDN that might block it
          if (!src.includes('media.giphy.com')) {
            url.searchParams.set('upmm_cache', Date.now().toString());
          }
          img.src = url.toString();
        } catch (e) {
          img.src = src;
        }
      }

      img.onload = () => {
        // Evict oldest cache entry if limit reached to protect mobile memory
        if (imageCache.current.size >= MAX_CACHE_ENTRIES) {
          const firstKey = imageCache.current.keys().next().value;
          if (firstKey) imageCache.current.delete(firstKey);
        }
        const processed = downscaleAssetIfNeeded(img);
        imageCache.current.set(src, processed);
        resolve(processed);
      };
      img.onerror = () => {
        // Fallback without crossOrigin if CORS was the issue
        if (img.crossOrigin) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            if (imageCache.current.size >= MAX_CACHE_ENTRIES) {
              const firstKey = imageCache.current.keys().next().value;
              if (firstKey) imageCache.current.delete(firstKey);
            }
            const processed = downscaleAssetIfNeeded(fallbackImg);
            imageCache.current.set(src, processed);
            resolve(processed);
          };
          fallbackImg.onerror = (e) => {
            console.error(`Falha ao carregar mídia: ${src.substring(0, 50)}...`, e);
            reject(new Error(`Erro ao processar imagem.`));
          };
          fallbackImg.src = src;
          return;
        }
        reject(new Error(`Erro ao processar imagem.`));
      };
    });
  };

  const drawCanvas = async (hideSelection = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      await document.fonts.ready;
      const baseImg = await loadImage(basePhoto.imageUrl);
      
      if (canvas.width !== 1000) {
        canvas.width = 1000;
        canvas.height = 1000 * (baseImg.height / baseImg.width);
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with filters
      ctx.save();
      const filterString = `
        brightness(${filters.brightness}) 
        contrast(${filters.contrast}) 
        saturate(${filters.saturate}) 
        sepia(${filters.sepia}) 
        grayscale(${filters.grayscale}) 
        hue-rotate(${filters.hueRotate}deg)
        blur(${filters.blur}px)
      `.trim();
      
      ctx.filter = filterString;
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw layers
      for (const layer of layers) {
        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        
        if (layer.type === 'sticker' || layer.type === 'animated-sticker') {
          try {
            const stickerImg = await loadImage(layer.content);
            ctx.drawImage(stickerImg, -layer.size / 2, -layer.size / 2, layer.size, layer.size);
          } catch (e) {
            // Draw placeholder for missing assets
            ctx.fillStyle = 'rgba(255,184,0,0.2)';
            ctx.fillRect(-layer.size/2, -layer.size/2, layer.size, layer.size);
          }
        } else if (layer.type === 'text') {
          const preset = layer.stylePreset || 'tag-branca';
          const fontFamily = layer.fontFamily || STREET_FONTS[1].family;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (preset === 'neon-roxo') {
            ctx.font = `900 ${layer.size}px "Bungee", cursive, sans-serif`;
            ctx.shadowColor = '#C084FC';
            ctx.shadowBlur = 24;
            ctx.strokeStyle = '#581C87';
            ctx.lineWidth = Math.max(3, layer.size * 0.14);
            ctx.lineJoin = 'round';
            ctx.strokeText(layer.content, 0, 0);
            ctx.fillStyle = '#F3E8FF';
            ctx.fillText(layer.content, 0, 0);
            ctx.shadowBlur = 0; // reset
          } else if (preset === 'pixo-preto') {
            ctx.font = `900 ${layer.size}px "Sedgwick Ave", cursive, sans-serif`;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(2, layer.size * 0.08);
            ctx.lineJoin = 'miter';
            ctx.strokeText(layer.content, 0, 0);
            ctx.fillStyle = '#09090B';
            ctx.fillText(layer.content, 0, 0);
          } else if (preset === 'cartaz-lambe') {
            ctx.font = `900 ${layer.size}px "Bebas Neue", Impact, sans-serif`;
            const textMetrics = ctx.measureText(layer.content);
            const textW = textMetrics.width;
            const textH = layer.size * 1.15;
            
            // Fundo de tarja amarela/kraft de cartaz lambe
            ctx.fillStyle = '#FEF08A';
            ctx.fillRect(-textW / 2 - 20, -textH / 2, textW + 40, textH);
            ctx.strokeStyle = '#CA8A04';
            ctx.lineWidth = 3;
            ctx.strokeRect(-textW / 2 - 20, -textH / 2, textW + 40, textH);
            
            ctx.fillStyle = '#18181B';
            ctx.fillText(layer.content, 0, 2);
          } else {
            // Tag Branca / Padrão Posca
            ctx.font = `900 ${layer.size}px "Permanent Marker", cursive, sans-serif`;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(4, layer.size * 0.16);
            ctx.lineJoin = 'round';
            ctx.strokeText(layer.content, 0, 0);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(layer.content, 0, 0);
          }
        }

        if (!hideSelection && selectedLayerId === layer.id) {
          ctx.strokeStyle = COLORS.primary;
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.strokeRect(-layer.size / 2 - 12, -layer.size / 2 - 12, layer.size + 24, layer.size + 24);
        }
        ctx.restore();
      }
    } catch (err) {
      console.error("Erro na renderização:", err);
    }
  };

  // Animation Loop for GIF support on canvas with 24-30 FPS throttling and Idle Freezing
  useEffect(() => {
    let isCancelled = false;
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33.3ms

    // Static rendering if no animated layers exist to save CPU & battery
    const hasAnimated = layers.some(l => l.type === 'animated-sticker');
    if (!hasAnimated) {
      drawCanvas();
      return;
    }

    const loop = (timestamp: number) => {
      if (isCancelled) return;

      if (isDocumentVisible.current) {
        const timeSinceLastFrame = timestamp - lastRenderTime.current;
        const timeSinceInteraction = Date.now() - lastUserInteraction.current;

        // When user is idle for > 8 seconds, throttle to 10 FPS (~100ms) to conserve mobile power
        const currentInterval = timeSinceInteraction > 8000 ? 100 : FRAME_INTERVAL;

        if (timeSinceLastFrame >= currentInterval) {
          lastRenderTime.current = timestamp;
          drawCanvas();
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [filters, layers, selectedLayerId]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    touchActivity();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clickedLayer = [...layers].reverse().find(layer => {
      const dist = Math.sqrt(Math.pow(x - layer.x, 2) + Math.pow(y - layer.y, 2));
      return dist < layer.size / 1.5;
    });

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      setIsCanvasDragging(true);
      dragStartPos.current = { x, y };
      layerStartPos.current = { x: clickedLayer.x, y: clickedLayer.y };
      
      if (clickedLayer.type === 'text' && clickedLayer.fontFamily) {
        setSelectedFont(clickedLayer.fontFamily);
      }
    } else {
      setSelectedLayerId(null);
    }
  };

  // Suporte Nativo a Toque Tátil para Dispositivos Móveis e Celulares
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    touchActivity();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const clickedLayer = [...layers].reverse().find(layer => {
      const dist = Math.sqrt(Math.pow(x - layer.x, 2) + Math.pow(y - layer.y, 2));
      return dist < layer.size / 1.4;
    });

    if (clickedLayer) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      setSelectedLayerId(clickedLayer.id);
      setIsCanvasDragging(true);
      dragStartPos.current = { x, y };
      layerStartPos.current = { x: clickedLayer.x, y: clickedLayer.y };
      
      if (clickedLayer.type === 'text' && clickedLayer.fontFamily) {
        setSelectedFont(clickedLayer.fontFamily);
      }
    } else {
      setSelectedLayerId(null);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!isCanvasDragging || !selectedLayerId) return;
    if (e.touches.length === 0) return;
    touchActivity();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const dx = x - dragStartPos.current.x;
    const dy = y - dragStartPos.current.y;

    setLayers(prev => prev.map(l => 
      l.id === selectedLayerId ? { ...l, x: layerStartPos.current.x + dx, y: layerStartPos.current.y + dy } : l
    ));
  };

  const handleCanvasTouchEnd = () => {
    setIsCanvasDragging(false);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isCanvasDragging || !selectedLayerId) return;
    touchActivity();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dx = x - dragStartPos.current.x;
    const dy = y - dragStartPos.current.y;

    setLayers(prev => prev.map(l => 
      l.id === selectedLayerId ? { ...l, x: layerStartPos.current.x + dx, y: layerStartPos.current.y + dy } : l
    ));
  };

  const handleAddSticker = (url: string, isAnimated = false) => {
    touchActivity();
    if (layers.length >= MAX_LAYERS_LIMIT) {
      setCanvasToast(`Limite de ${MAX_LAYERS_LIMIT} camadas atingido para preservar a fluidez.`);
      setTimeout(() => setCanvasToast(null), 3000);
      return;
    }
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type: isAnimated ? 'animated-sticker' : 'sticker',
      content: url,
      x: 500,
      y: 500,
      size: 250,
      rotation: 0,
      opacity: 1
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Posicionar imediatamente no centro geométrico do canvas sobre a foto base
  const handleSelectAsset = (asset: AssetItem) => {
    touchActivity();
    if (layers.length >= MAX_LAYERS_LIMIT) {
      setCanvasToast(`Limite de ${MAX_LAYERS_LIMIT} camadas atingido para preservar a fluidez.`);
      setTimeout(() => setCanvasToast(null), 3000);
      return;
    }

    const canvas = canvasRef.current;
    const centerX = canvas ? Math.round(canvas.width / 2) : 500;
    const centerY = canvas ? Math.round(canvas.height / 2) : 500;

    const newLayer: Layer = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: asset.type === 'animated_sticker' ? 'animated-sticker' : 'sticker',
      content: asset.url,
      x: centerX,
      y: centerY,
      size: 260,
      rotation: 0,
      opacity: 1
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setIsAssetDrawerOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileEditorTab('canvas');
    }

    setCanvasToast(`"${asset.name}" posicionado no centro do canvas!`);
    setTimeout(() => setCanvasToast(null), 2500);
  };

  // Handler de Soltar (Drop) diretamente sobre o canvas: insere o asset centralizado
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    touchActivity();
    setIsDragOverCanvas(false);

    if (layers.length >= MAX_LAYERS_LIMIT) {
      setCanvasToast(`Limite defensivo de ${MAX_LAYERS_LIMIT} camadas atingido.`);
      setTimeout(() => setCanvasToast(null), 3000);
      return;
    }

    try {
      const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('upmm/asset');
      let asset: AssetItem | null = null;

      if (rawData) {
        asset = JSON.parse(rawData);
      } else {
        const assetId = e.dataTransfer.getData('text/plain');
        if (assetId) {
          asset = ASSET_CATALOG.find(a => a.id === assetId) || null;
        }
      }

      if (!asset) return;

      const canvas = canvasRef.current;
      const centerX = canvas ? Math.round(canvas.width / 2) : 500;
      const centerY = canvas ? Math.round(canvas.height / 2) : 500;

      const newLayer: Layer = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: asset.type === 'animated_sticker' ? 'animated-sticker' : 'sticker',
        content: asset.url,
        x: centerX,
        y: centerY,
        size: 260,
        rotation: 0,
        opacity: 1
      };

      setLayers(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      setIsAssetDrawerOpen(false);

      setCanvasToast(`"${asset.name}" solto e centralizado no canvas!`);
      setTimeout(() => setCanvasToast(null), 2500);
    } catch (err) {
      console.warn("Erro ao processar asset solto no canvas:", err);
    }
  };

  const handleRotateSelected = (delta: number) => {
    if (!selectedLayerId) return;
    touchActivity();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, rotation: (l.rotation + delta) % 360 } : l));
  };

  const handleMoveLayerOrder = (direction: 'forward' | 'backward') => {
    if (!selectedLayerId) return;
    touchActivity();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === selectedLayerId);
      if (idx === -1) return prev;
      const newLayers = [...prev];
      const [layer] = newLayers.splice(idx, 1);
      if (direction === 'forward') {
        newLayers.push(layer);
      } else {
        newLayers.unshift(layer);
      }
      return newLayers;
    });
  };

  const handleScaleSelected = (factor: number) => {
    if (!selectedLayerId) return;
    touchActivity();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    setLayers(prev => prev.map(l => {
      if (l.id !== selectedLayerId) return l;
      const newSize = Math.max(50, Math.min(800, Math.round(l.size * factor)));
      return { ...l, size: newSize };
    }));
  };

  const handleDeleteSelected = () => {
    if (!selectedLayerId) return;
    touchActivity();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    setLayers(prev => prev.filter(l => l.id !== selectedLayerId));
    setSelectedLayerId(null);
    setCanvasToast('Camada removida do canvas.');
    setTimeout(() => setCanvasToast(null), 2000);
  };

  const handleApplyPresetText = (presetId: TextPresetId) => {
    touchActivity();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);

    const preset = URBAN_TEXT_PRESETS.find(p => p.id === presetId)!;

    // Se já houver uma camada de texto selecionada, atualiza o estilo dela diretamente
    if (selectedLayerId) {
      const activeLayer = layers.find(l => l.id === selectedLayerId);
      if (activeLayer && activeLayer.type === 'text') {
        setLayers(prev => prev.map(l => l.id === selectedLayerId ? {
          ...l,
          stylePreset: presetId,
          fontFamily: preset.fontFamily
        } : l));
        setCanvasToast(`Estilo "${preset.name}" aplicado!`);
        setTimeout(() => setCanvasToast(null), 2000);
        return;
      }
    }

    if (layers.length >= MAX_LAYERS_LIMIT) {
      setCanvasToast(`Limite de ${MAX_LAYERS_LIMIT} camadas atingido para preservar a fluidez.`);
      setTimeout(() => setCanvasToast(null), 3000);
      return;
    }

    const canvas = canvasRef.current;
    const centerX = canvas ? Math.round(canvas.width / 2) : 500;
    const centerY = canvas ? Math.round(canvas.height / 2) : 500;

    const content = inputText.trim() ? inputText.toUpperCase() : preset.previewText;

    const newLayer: Layer = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'text',
      content,
      x: centerX,
      y: centerY,
      size: 110,
      rotation: 0,
      fontFamily: preset.fontFamily,
      stylePreset: presetId,
      opacity: 1
    };

    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setInputText('');
    setCanvasToast(`"${preset.name}" posicionado no centro!`);
    setTimeout(() => setCanvasToast(null), 2500);
  };

  const handleAddText = () => {
    touchActivity();
    if (!inputText.trim()) return;
    if (layers.length >= MAX_LAYERS_LIMIT) {
      setCanvasToast(`Limite de ${MAX_LAYERS_LIMIT} camadas atingido para preservar a fluidez.`);
      setTimeout(() => setCanvasToast(null), 3000);
      return;
    }
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: inputText.toUpperCase(),
      x: 500,
      y: 500,
      size: 110,
      rotation: 0,
      fontFamily: selectedFont,
      stylePreset: 'tag-branca',
      opacity: 1
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    setInputText('');
  };

  const handleFontChange = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    if (selectedLayerId) {
      setLayers(layers.map(l => l.id === selectedLayerId && l.type === 'text' ? { ...l, fontFamily } : l));
    }
  };

  const handleSave = async () => {
    setIsRendering(true);
    await drawCanvas(true); // Final render without selection UI
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsRendering(false);
      return;
    }
    
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      let finalImageUrl = dataUrl;
      let storagePath: string | undefined = undefined;

      // 1. Tenta upload em Blob/File para Supabase Storage se configurado
      if (isSupabaseConfigured()) {
        try {
          const uploadResult = await uploadImageToSupabase(dataUrl, 'artworks');
          if (uploadResult.publicUrl) {
            finalImageUrl = uploadResult.publicUrl;
            storagePath = uploadResult.storagePath || undefined;
          }
        } catch (uploadErr) {
          console.warn('[Editor] Fallback para imagem inline após falha no Storage:', uploadErr);
        }
      }

      const remixId = `remix_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newRemix: PhotoBase = {
        id: remixId,
        userId: user.id,
        authorName: user.name,
        title: `Remix de ${basePhoto.title}`,
        imageUrl: finalImageUrl,
        storagePath: storagePath,
        tags: Array.from(new Set([...basePhoto.tags, 'Remix', 'Quebrada'])),
        vibeCount: 1,
        type: 'remix',
        originalPhotoId: basePhoto.id,
        location: basePhoto.location ? { ...basePhoto.location } : undefined,
        createdAt: Date.now()
      };

      onSave(newRemix);

      // Microinteração háptica ao publicar com sucesso
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([35, 50, 35]);
      }

      setPublishedRemix(newRemix);
      setIsCelebrationOpen(true);
    } catch (e) {
      console.error("Erro ao salvar remix:", e);
      setCanvasToast("Erro ao processar imagem para salvar. Tente reduzir o número de camadas.");
      setTimeout(() => setCanvasToast(null), 4000);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] lg:h-[calc(100vh-40px)] bg-[#1C1B19] rounded-none lg:rounded-3xl overflow-hidden shadow-2xl border-0 lg:border border-[#3E3A35]">
      <header className="p-2.5 sm:p-4 border-b border-[#3E3A35] flex justify-between items-center bg-[#141311] text-white shrink-0 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#FFB800]">Estúdio de Remix</h2>
          <p className="text-[9px] font-bold text-gray-400 truncate max-w-[140px] sm:max-w-xs">@{basePhoto.authorName} • {basePhoto.title}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Indicador defensivo de camadas em tempo real */}
          <div 
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border transition ${
              layers.length >= MAX_LAYERS_LIMIT 
                ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                : layers.length >= 10 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-white/10 text-gray-300 border-white/10'
            }`}
            title={`Limite máximo recomendado de ${MAX_LAYERS_LIMIT} camadas ativas no canvas`}
          >
            <span className="text-gray-400 text-[9px]">Camadas:</span>
            <span className={layers.length >= MAX_LAYERS_LIMIT ? 'text-red-400 font-black' : 'text-[#FFB800]'}>
              {layers.length}/{MAX_LAYERS_LIMIT}
            </span>
          </div>

          <button 
            type="button"
            onClick={() => setIsAssetDrawerOpen(true)}
            className="bg-white/10 hover:bg-[#FFB800] hover:text-[#2D2A26] text-white px-2.5 sm:px-3.5 py-2 rounded-xl font-black uppercase text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer min-h-[40px]"
            title="Abrir Gaveta de Assets (Grafite, Bombing, Cultura de Rua, Rasgos e Loops)"
          >
            <Layers size={15} />
            <span className="hidden sm:inline">Gaveta de Assets</span>
            <span className="bg-[#FFB800] text-[#2D2A26] text-[9px] font-black px-1.5 py-0.2 rounded-md">
              {ASSET_CATALOG.length}
            </span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isRendering}
            className="min-h-[40px] sm:min-h-[48px] bg-[#FACC15] hover:bg-[#EAB308] active:scale-95 text-[#18181B] px-3 sm:px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center space-x-1.5 sm:space-x-2 transition shadow-lg hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Lançar Remix e publicar na comunidade com crédito de coautoria"
          >
            <Rocket size={15} className="text-[#18181B]" />
            <span>Lançar<span className="hidden xs:inline"> Remix</span></span>
          </button>
        </div>
      </header>

      {/* Mobile Mode Switcher: Canvas vs Ferramentas */}
      <div className="lg:hidden flex items-center justify-between p-2 bg-[#141311] border-b border-[#3E3A35] shrink-0">
        <div className="flex items-center gap-1.5 w-full">
          <button
            type="button"
            onClick={() => setMobileEditorTab('canvas')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px] ${
              mobileEditorTab === 'canvas'
                ? 'bg-[#FFB800] text-[#141311] shadow'
                : 'bg-[#242220] text-zinc-400 hover:text-white'
            }`}
          >
            <Eye size={15} />
            <span>Ver Canvas ({layers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileEditorTab('tools')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px] ${
              mobileEditorTab === 'tools'
                ? 'bg-[#FFB800] text-[#141311] shadow'
                : 'bg-[#242220] text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles size={15} />
            <span>Ferramentas</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div 
          className={`flex-1 p-2 sm:p-4 flex items-center justify-center relative overflow-hidden transition-colors ${
            mobileEditorTab === 'tools' ? 'hidden lg:flex' : 'flex'
          } ${
            isDragOverCanvas ? 'bg-amber-950/40' : 'bg-[#141311]'
          }`}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => setIsCanvasDragging(false)}
          onMouseLeave={() => setIsCanvasDragging(false)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (!isDragOverCanvas) setIsDragOverCanvas(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOverCanvas(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragOverCanvas(false);
            }
          }}
          onDrop={handleCanvasDrop}
        >
          <div className="relative shadow-2xl max-w-full max-h-full bg-[#1C1B19] rounded-xl overflow-hidden border border-[#3E3A35]">
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleCanvasMouseDown}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchCancel={handleCanvasTouchEnd}
              className={`max-w-full max-h-[66vh] sm:max-h-[72vh] lg:max-h-[76vh] cursor-crosshair rounded-lg transition-all touch-none select-none ${
                isDragOverCanvas ? 'ring-4 ring-[#FFB800] ring-offset-4' : ''
              }`}
            />
            {/* Overlay visual quando o usuário arrasta um sticker/loop para soltar no canvas */}
            {isDragOverCanvas && (
              <div className="absolute inset-0 bg-[#2D2A26]/85 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center text-white z-30 pointer-events-none p-6 text-center animate-in fade-in zoom-in-95 duration-150 border-4 border-dashed border-[#FFB800]">
                <div className="w-16 h-16 rounded-full bg-[#FFB800] text-[#2D2A26] flex items-center justify-center mb-3 shadow-xl animate-bounce">
                  <Target size={36} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-black uppercase tracking-wider text-[#FFB800]">
                  Solte para Centralizar
                </h4>
                <p className="text-xs font-bold text-gray-200 mt-1 max-w-xs">
                  O sticker será inserido automaticamente no centro geométrico do seu canvas de intervenção.
                </p>
              </div>
            )}

            {/* Quick-Toolbar Flutuante sobre o Canvas para Manipulação Rápida em 1 Toque (Totalmente Responsiva) */}
            {selectedLayerId && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-35 bg-[#18181B]/95 backdrop-blur-md border border-[#27272A] rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 text-white animate-in slide-in-from-bottom-3 duration-150 max-w-[calc(100vw-1.5rem)] overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleRotateSelected(-15)}
                  title="Girar 15° anti-horário"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <RotateCw size={17} className="-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotateSelected(15)}
                  title="Girar 15° horário"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <RotateCw size={17} />
                </button>
                <div className="w-[1px] h-6 bg-zinc-700/80 mx-0.5" />
                <button
                  type="button"
                  onClick={() => handleScaleSelected(0.85)}
                  title="Diminuir elemento"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <ZoomOut size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScaleSelected(1.15)}
                  title="Aumentar elemento"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <ZoomIn size={17} />
                </button>
                <div className="w-[1px] h-6 bg-zinc-700/80 mx-0.5" />
                <button
                  type="button"
                  onClick={() => handleMoveLayerOrder('backward')}
                  title="Mover para trás"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowDown size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveLayerOrder('forward')}
                  title="Mover para frente"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <ArrowUp size={17} />
                </button>
                <div className="w-[1px] h-6 bg-zinc-700/80 mx-0.5" />
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  title="Excluir elemento"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white active:scale-90 transition cursor-pointer"
                >
                  <Trash2 size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayerId(null)}
                  title="Concluir ajuste"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#18181B] active:scale-90 font-black transition cursor-pointer"
                >
                  <Check size={18} strokeWidth={3} />
                </button>
              </div>
            )}

            {isRendering && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center rounded-lg z-20">
                <Loader2 className="text-[#FFB800] animate-spin mb-4" size={48} />
                <p className="text-white font-black uppercase tracking-widest text-xs">Revelando sua Visão...</p>
              </div>
            )}
          </div>

          {/* Feedback Toast flutuante de sucesso ao inserir/soltar asset */}
          {canvasToast && (
            <div className="absolute top-4 z-40 bg-[#2D2A26] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#FFB800] flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
              <div className="w-6 h-6 rounded-full bg-[#FFB800] text-[#2D2A26] flex items-center justify-center shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
              <span className="text-xs font-black uppercase tracking-wide text-amber-100">
                {canvasToast}
              </span>
            </div>
          )}
          {/* Mobile Floating Button to quickly toggle to tools - hidden while manipulating a layer */}
          {!selectedLayerId && (
            <button
              type="button"
              onClick={() => setMobileEditorTab('tools')}
              className="lg:hidden absolute bottom-3 right-3 z-30 bg-[#FFB800] text-[#141311] px-4 py-2.5 rounded-2xl font-black text-xs uppercase shadow-2xl flex items-center gap-1.5 active:scale-95 transition border-2 border-[#141311] cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Ferramentas</span>
            </button>
          )}
        </div>

        <div className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#3E3A35] flex flex-col bg-[#1C1B19] text-[#EDE8E1] overflow-hidden ${
          mobileEditorTab === 'canvas' ? 'hidden lg:flex' : 'flex flex-1'
        }`}>
          {/* Mobile Back-to-Canvas Bar */}
          <div className="lg:hidden p-2.5 bg-[#141311] border-b border-[#3E3A35] flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#FFB800]" /> Painel de Ferramentas
            </span>
            <button
              type="button"
              onClick={() => setMobileEditorTab('canvas')}
              className="text-xs font-black text-[#FFB800] hover:text-white uppercase flex items-center gap-1 px-3 py-1.5 bg-[#242220] rounded-xl cursor-pointer"
            >
              <Eye size={13} />
              <span>Ver Canvas</span>
            </button>
          </div>

          <div className="flex border-b border-[#3E3A35] shrink-0 bg-[#141311]">
            {(['filters', 'stickers', 'animated', 'text'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'text-[#FFB800] bg-[#1C1B19] border-b-2 border-[#FFB800]' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#242220]'
                }`}
              >
                {tab === 'filters' && <Sparkles size={14} className="mx-auto mb-1" />}
                {tab === 'stickers' && <ImageIcon size={14} className="mx-auto mb-1" />}
                {tab === 'animated' && <Zap size={14} className="mx-auto mb-1" />}
                {tab === 'text' && <Type size={14} className="mx-auto mb-1" />}
                {tab === 'filters' ? 'Filtros' : tab === 'stickers' ? 'Stickers' : tab === 'animated' ? 'Loops' : 'Texto'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))]">
            {activeTab === 'filters' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'brightness', label: 'Brilho', min: 0.5, max: 2, step: 0.01 },
                    { key: 'contrast', label: 'Contraste', min: 0.5, max: 2, step: 0.01 },
                    { key: 'saturate', label: 'Saturação', min: 0, max: 3, step: 0.01 },
                    { key: 'blur', label: 'Desfoque', min: 0, max: 10, step: 0.1 },
                    { key: 'sepia', label: 'Sépia', min: 0, max: 1, step: 0.01 },
                    { key: 'grayscale', label: 'P&B', min: 0, max: 1, step: 0.01 },
                    { key: 'hueRotate', label: 'Matiz', min: 0, max: 360, step: 1 },
                  ].map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                        <span>{f.label}</span>
                        <span className="text-[#FFB800]">{filters[f.key as keyof FilterSettings]}</span>
                      </div>
                      <input 
                        type="range" 
                        min={f.min} max={f.max} step={f.step} 
                        value={filters[f.key as keyof FilterSettings]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) }))}
                        className="w-full accent-[#FFB800] cursor-pointer"
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => setFilters({ brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0, hueRotate: 0, blur: 0 })}
                    className="w-full text-[10px] font-black uppercase text-zinc-400 hover:text-red-400 transition py-2.5 bg-[#242220] rounded-xl border border-[#3E3A35] cursor-pointer"
                  >
                    Limpar Todos Efeitos
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="space-y-4">
                {/* Banner de Acesso à Gaveta de Assets Completa */}
                <div className="bg-[#242220] text-white p-3 rounded-2xl border border-[#3E3A35] flex items-center justify-between shadow-md">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-[#FFB800] tracking-wider block">Catálogo Oficial</span>
                    <h4 className="text-xs font-black uppercase tracking-tight text-white">Gaveta de Assets</h4>
                    <p className="text-[10px] text-zinc-400">Grafite, Bombing, Texturas & Setas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssetDrawerOpen(true)}
                    className="bg-[#FFB800] hover:bg-white text-[#141311] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition shrink-0 shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers size={13} />
                    <span>Abrir ({ASSET_CATALOG.length})</span>
                  </button>
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'tag', label: 'Tags' },
                    { id: 'spray', label: 'Spray' },
                    { id: 'cerrado', label: 'Cerrado' },
                    { id: 'urban', label: 'Rua' },
                    { id: 'shapes', label: 'Símbolos' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickerFilter(c.id as any)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        stickerFilter === c.id
                          ? 'bg-[#FFB800] text-[#141311] shadow-xs'
                          : 'bg-[#242220] text-zinc-400 hover:text-white hover:bg-[#2D2A26]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {STICKERS.filter(s => stickerFilter === 'all' || s.category === stickerFilter).map(sticker => (
                    <button 
                      key={sticker.id}
                      onClick={() => {
                        handleAddSticker(sticker.url);
                        if (window.innerWidth < 1024) setMobileEditorTab('canvas');
                      }}
                      title={sticker.name}
                      className="aspect-square p-2 bg-[#242220] rounded-2xl hover:bg-[#2D2A26] active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-[#3E3A35] hover:border-[#FFB800] group cursor-pointer"
                    >
                      <img 
                        src={sticker.url} 
                        alt={sticker.name} 
                        referrerPolicy="no-referrer" 
                        className="w-10 h-10 object-contain transition group-hover:scale-110" 
                      />
                      <span className="text-[8px] font-bold text-zinc-400 group-hover:text-white truncate w-full text-center">
                        {sticker.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'animated' && (
              <div className="space-y-4">
                {/* Banner de Acesso aos Loops da Gaveta de Assets */}
                <div className="bg-gradient-to-r from-[#242220] to-purple-950 text-white p-3 rounded-2xl border border-purple-500/40 flex items-center justify-between shadow-md">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider">Animações em Loop</span>
                      <span className="bg-[#FFB800] text-[#141311] text-[8px] font-black px-1.5 py-0.2 rounded-full">
                        {ANIMATED_STICKERS.length} LOOPS
                      </span>
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-white">Loops Vivos</h4>
                    <p className="text-[10px] text-zinc-400">Intervenções animadas em repetição</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssetDrawerOpen(true)}
                    className="bg-[#FFB800] hover:bg-white text-[#141311] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition shrink-0 shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={13} />
                    <span>Biblioteca</span>
                  </button>
                </div>

                {/* Filtros de Categoria para Loops Animados */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'urban', label: 'Urbano & Som' },
                    { id: 'spray', label: 'Spray & Drip' },
                    { id: 'shapes', label: 'Formas & Ritmo' },
                    { id: 'cerrado', label: 'Cerrado' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setAnimatedFilter(c.id as any)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        animatedFilter === c.id
                          ? 'bg-[#FF5722] text-white shadow-xs'
                          : 'bg-[#242220] text-zinc-400 hover:text-white hover:bg-[#2D2A26]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Grid de Loops Animados */}
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {ANIMATED_STICKERS.filter(s => animatedFilter === 'all' || s.category === animatedFilter).map(sticker => (
                    <button 
                      key={sticker.id}
                      onClick={() => {
                        handleAddSticker(sticker.url, true);
                        if (window.innerWidth < 1024) setMobileEditorTab('canvas');
                      }}
                      title={`Adicionar loop: ${sticker.name}`}
                      className="relative p-2.5 bg-[#242220] rounded-2xl hover:bg-[#2D2A26] border border-[#3E3A35] hover:border-purple-400 transition flex flex-col items-center justify-between gap-1.5 group cursor-pointer aspect-square overflow-hidden"
                    >
                      <div className="absolute top-2 left-2 bg-[#FF5722] text-white text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs z-10">
                        <Zap size={8} />
                        <span>Loop</span>
                      </div>
                      <div className="flex-1 w-full flex items-center justify-center pt-2">
                        <img 
                          src={sticker.url} 
                          alt={sticker.name} 
                          referrerPolicy="no-referrer" 
                          className="w-14 h-14 object-contain transition group-hover:scale-110 duration-200" 
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-300 group-hover:text-white truncate w-full text-center">
                        {sticker.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Presets Tipográficos da Quebrada
                    </p>
                    <span className="text-[9px] font-bold text-[#FFB800] bg-[#242220] px-2 py-0.5 rounded-full border border-[#3E3A35]">
                      1 Toque
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {URBAN_TEXT_PRESETS.map(preset => {
                      const isActive = layers.find(l => l.id === selectedLayerId)?.stylePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            handleApplyPresetText(preset.id);
                            if (window.innerWidth < 1024) setMobileEditorTab('canvas');
                          }}
                          className={`min-h-[52px] p-3 rounded-2xl border transition-all flex flex-col justify-between text-left group hover:scale-102 active:scale-95 cursor-pointer shadow-sm ${
                            isActive 
                              ? 'border-[#FFB800] bg-[#242220] shadow-md' 
                              : 'border-[#3E3A35] bg-[#242220] hover:border-[#FFB800]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200">
                              {preset.name}
                            </span>
                            <span className="text-[9px] font-black text-[#FFB800] group-hover:translate-x-0.5 transition">
                              + Inserir
                            </span>
                          </div>
                          <span 
                            style={{ fontFamily: preset.fontFamily }} 
                            className="text-base font-black truncate mt-1 text-white"
                          >
                            {preset.previewText}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium line-clamp-1 mt-0.5">
                            {preset.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#3E3A35]">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    Texto Personalizado <span className="lowercase font-normal text-zinc-500">(opcional)</span>
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Sua tag, frase ou gíria..."
                      className="flex-1 p-3.5 bg-[#242220] rounded-2xl border border-[#3E3A35] focus:outline-none focus:border-[#FFB800] font-bold text-xs text-white placeholder-zinc-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyPresetText('tag-branca');
                          if (window.innerWidth < 1024) setMobileEditorTab('canvas');
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        handleApplyPresetText('tag-branca');
                        if (window.innerWidth < 1024) setMobileEditorTab('canvas');
                      }}
                      className="min-h-[48px] px-4 bg-[#FFB800] text-[#141311] hover:bg-white rounded-2xl font-black uppercase text-xs transition shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Type size={14} />
                      <span>Lançar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedLayerId && (
              <div className="pt-4 border-t border-[#3E3A35] space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FFB800]">Ajustar Camada</h4>
                    {layers.find(l => l.id === selectedLayerId)?.type === 'animated-sticker' && (
                      <span className="bg-[#FFB800]/10 text-[#FFB800] text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Animado</span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setLayers(layers.filter(l => l.id !== selectedLayerId));
                      setSelectedLayerId(null);
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-400">
                      <span>Tamanho</span>
                      <span className="text-[#FFB800]">{layers.find(l => l.id === selectedLayerId)?.size}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" max="700" step="1" 
                      value={layers.find(l => l.id === selectedLayerId)?.size || 200}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, size: val } : l));
                      }}
                      className="w-full accent-[#FFB800] cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-400">
                      <span>Giro</span>
                      <span className="text-[#FFB800]">{layers.find(l => l.id === selectedLayerId)?.rotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" max="180" step="1" 
                      value={layers.find(l => l.id === selectedLayerId)?.rotation || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, rotation: val } : l));
                      }}
                      className="w-full accent-[#FFB800] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-400">
                      <span>Opacidade</span>
                      <span className="text-[#FFB800]">{Math.round((layers.find(l => l.id === selectedLayerId)?.opacity || 1) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01" 
                      value={layers.find(l => l.id === selectedLayerId)?.opacity || 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, opacity: val } : l));
                      }}
                      className="w-full accent-[#FFB800] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Festivo de Celebração e Compartilhamento com Crédito de Coautoria Automático */}
      {isCelebrationOpen && publishedRemix && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181B] border border-[#27272A] w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Top Badge & Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#FACC15] text-[#18181B] flex items-center justify-center font-black shadow">
                  <Trophy size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/15 px-2.5 py-0.5 rounded-full border border-[#FACC15]/30">
                    Lançamento Concluído!
                  </span>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Visão Periférica Remixada</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCelebrationOpen(false);
                  navigate(`/profile/${user.id}`);
                }}
                className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Title & Co-Authorship */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {publishedRemix.title}
              </h3>
              <p className="text-xs text-zinc-300 font-bold mt-1">
                Coautoria oficial: <span className="text-[#FACC15]">@{basePhoto.authorName}</span> & <span className="text-white">@{user.name}</span>
              </p>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-zinc-800 shadow-inner">
              <img
                src={publishedRemix.imageUrl}
                alt={publishedRemix.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-[#18181B]/90 backdrop-blur-sm border border-[#FACC15]/40 text-[#FACC15] px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-lg">
                <Flame size={14} className="text-[#FF5722]" />
                <span>+15 Responsa Conquistada</span>
              </div>
            </div>

            {/* Direct Share Buttons with >=48px Touch Targets */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Espalhe a Visão na Quebrada:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={() => {
                    const shareText = `Confira meu novo remix periférico "${publishedRemix.title}" com coautoria de @${basePhoto.authorName} na UPMM Periferia!`;
                    const url = `${window.location.origin}${window.location.pathname}#/lineage/${publishedRemix.id}`;
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + url)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs uppercase tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Zap da Galera</span>
                </button>

                {/* Web Share / Link */}
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}#/lineage/${publishedRemix.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: publishedRemix.title,
                        text: `Meu novo remix com @${basePhoto.authorName} na UPMM`,
                        url
                      }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(url);
                      setCanvasToast('Link copiado para a área de transferência!');
                      setTimeout(() => setCanvasToast(null), 3000);
                    }
                  }}
                  className="min-h-[48px] px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-98 text-white font-black text-xs uppercase tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Share2 size={18} />
                  <span>Compartilhar Link</span>
                </button>
              </div>

              {/* Direct Download */}
              <a
                href={publishedRemix.imageUrl}
                download={`${publishedRemix.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.jpg`}
                className="min-h-[48px] w-full px-4 py-3 bg-[#27272A] hover:bg-[#3F3F46] active:scale-98 text-zinc-200 hover:text-white font-black text-xs uppercase tracking-wide rounded-2xl flex items-center justify-center gap-2 transition border border-zinc-700/60"
              >
                <Download size={18} />
                <span>Baixar Imagem (.JPG)</span>
              </a>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => {
                  setIsCelebrationOpen(false);
                  navigate('/');
                }}
                className="flex-1 min-h-[48px] py-3 rounded-2xl font-black uppercase text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition text-center cursor-pointer"
              >
                Voltar ao Fluxo
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCelebrationOpen(false);
                  navigate(`/profile/${user.id}`);
                }}
                className="flex-1 min-h-[48px] py-3 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-[#18181B] font-black uppercase text-xs tracking-wider transition shadow-xl text-center cursor-pointer"
              >
                Ver no Meu Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gaveta de Assets Urbano Completo com Pesquisa, Categorias e Paginação Sob Demanda */}
      <AssetDrawer
        isOpen={isAssetDrawerOpen}
        onClose={() => setIsAssetDrawerOpen(false)}
        onSelectAsset={handleSelectAsset}
        brandedPacks={brandedPacks}
        onTrackAssetUsage={onTrackAssetUsage}
      />
    </div>
  );
};

export default Editor;
