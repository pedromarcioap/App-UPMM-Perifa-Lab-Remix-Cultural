import React from 'react';
import { X, Download, Copy, Check, Sparkles, Layers, Palette, Terminal } from 'lucide-react';
import { UPMMGlyph } from './UPMMBrandLogo';

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({ isOpen, onClose }) => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleDownloadSVG = () => {
    const link = document.createElement('a');
    link.href = '/logo.svg';
    link.download = 'UPMM-Brutalist-Stencil-Identity.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-[140] animate-in fade-in duration-200">
      <div className="bg-[#11100F] text-[#EDE8E1] w-full max-w-4xl rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#3E3A35] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#36322D] shrink-0">
          <div className="flex items-center gap-3">
            <UPMMGlyph size={36} showDetails={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FF5722] bg-[#242220] px-2 py-0.5 rounded border border-[#3E3A35]">
                  VAR.03 // BRUTALIST STENCIL
                </span>
                <span className="text-[9px] font-mono uppercase text-[#00E5FF]">
                  CAP_94 // STREETWEAR
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5 font-['Space_Grotesk']">
                Identidade Visual &amp; Logotipo Oficial UPMM
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-1.5 bg-[#FFB800] hover:bg-[#FFA000] text-[#11100F] rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition"
              title="Baixar Arquivo Vetorial SVG Original"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Baixar SVG</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#242220] hover:bg-[#2D2A26] rounded-xl text-zinc-400 hover:text-white transition"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
          {/* Full SVG Artwork Preview Container */}
          <div className="relative rounded-2xl overflow-hidden border border-[#36322D] bg-[#11100F] shadow-inner flex items-center justify-center p-2">
            <img
              src="/logo.svg"
              alt="UPMM Brutalist Stencil Brand Identity"
              className="w-full h-auto max-h-[380px] object-contain rounded-xl"
            />
          </div>

          {/* Color Palette Specification */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FF5722]">
              <Palette size={14} />
              <span>Paleta Cromática &amp; Pigmentos Urbanos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { name: 'Asfalto Concreto', hex: '#11100F', role: 'Fundo Base Mate', text: '#EDE8E1' },
                { name: 'Branco Titânio', hex: '#EDE8E1', role: 'Módulo U & Tipografia', text: '#11100F' },
                { name: 'Amarelo Solar', hex: '#FFB800', role: 'Módulo P & Iluminação', text: '#11100F' },
                { name: 'Terracota Queimada', hex: '#FF5722', role: 'Faixa Demarcação & Alerta', text: '#FFFFFF' },
                { name: 'Ciano Analítico', hex: '#00E5FF', role: 'Spray Cap & Redlines', text: '#11100F' }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleCopy(c.hex, c.name)}
                  className="p-3 rounded-xl border border-[#36322D] bg-[#1C1B19] hover:border-[#FFB800] transition flex flex-col justify-between text-left group"
                >
                  <div className="w-full h-8 rounded-lg mb-2 shadow-inner border border-white/10 flex items-center justify-end p-1" style={{ backgroundColor: c.hex }}>
                    {copiedColor === c.name ? <Check size={12} style={{ color: c.text }} /> : <Copy size={12} className="opacity-0 group-hover:opacity-100 transition" style={{ color: c.text }} />}
                  </div>
                  <span className="text-[11px] font-bold text-white leading-tight font-['Space_Grotesk']">{c.name}</span>
                  <span className="text-[9px] font-mono text-[#8C877E]">{c.hex}</span>
                  <span className="text-[8px] text-[#EDE8E1]/50 mt-1">{c.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manifesto & Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1C1B19] rounded-2xl border border-[#36322D] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FFB800]">
                <Layers size={14} />
                <span>Conceito &amp; Manifesto de Design</span>
              </div>
              <p className="text-xs text-[#EDE8E1]/80 leading-relaxed font-['Space_Grotesk']">
                Inspirado na sinalização pública de concreto, tipografia de estêncil de latas de tinta spray e na cultura brutalista do skate e streetwear brasileiro. Transmite força comunitária, ocupação de território e peso visual marcante.
              </p>
            </div>

            <div className="p-4 bg-[#1C1B19] rounded-2xl border border-[#36322D] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#00E5FF]">
                <Terminal size={14} />
                <span>Tipografias Oficiais</span>
              </div>
              <ul className="text-xs text-[#EDE8E1]/80 space-y-1.5 font-['JetBrains_Mono']">
                <li className="flex items-center justify-between">
                  <span>Display &amp; Wordmark:</span>
                  <span className="text-white font-bold font-['Space_Grotesk']">Space Grotesk (700 / 900)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Metadados &amp; Tags Técnicas:</span>
                  <span className="text-[#00E5FF] font-bold">JetBrains Mono (600 / 800)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
