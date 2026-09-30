import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Target, Compass, Sliders } from 'lucide-react';
import { ArtworkAnalysis } from '../types';

interface ArtworkAnalysisBadgeProps {
  analysis?: ArtworkAnalysis;
  status?: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
}

export const ArtworkAnalysisBadge: React.FC<ArtworkAnalysisBadgeProps> = ({ analysis, status }) => {
  const [expanded, setExpanded] = useState(false);

  if (status === 'processing' || status === 'queued') {
    return (
      <div className="mt-3 px-3 py-2 bg-[#1C1B19] border border-[#3E3A35] rounded-xl flex items-center gap-2 text-xs text-zinc-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
        <span>Mentoria IA - Análise de proporção e valores em andamento...</span>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-3 bg-[#181715] border border-[#36322D] rounded-xl overflow-hidden text-xs">
      {/* Barra de Resumo Editorial */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#201E1C] transition cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold text-zinc-200 tracking-tight">Mentoria Técnica IA</span>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/40">
            {analysis.overallScore}/100
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Métricas compactas */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-400">
            <span>P: {analysis.proportionScore}%</span>
            <span>-</span>
            <span>Persp: {analysis.perspectiveScore}%</span>
            <span>-</span>
            <span>Tom: {analysis.tonalScore}%</span>
          </div>

          <div className="text-zinc-500">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Painel Expandido com Diagnóstico Suíço */}
      {expanded && (
        <div className="p-4 border-t border-[#36322D] bg-[#141312] space-y-4 animate-fade-in">
          {/* Grid de 3 Pilares */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 bg-[#1E1C1A] border border-[#2D2A26] rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase">
                <Target className="w-3 h-3 text-amber-400" />
                <span>Proporção</span>
              </div>
              <span className="text-sm font-black text-white mt-1 block">{analysis.proportionScore}%</span>
            </div>

            <div className="p-2.5 bg-[#1E1C1A] border border-[#2D2A26] rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase">
                <Compass className="w-3 h-3 text-blue-400" />
                <span>Perspectiva</span>
              </div>
              <span className="text-sm font-black text-white mt-1 block">{analysis.perspectiveScore}%</span>
            </div>

            <div className="p-2.5 bg-[#1E1C1A] border border-[#2D2A26] rounded-lg">
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase">
                <Sliders className="w-3 h-3 text-emerald-400" />
                <span>Valores</span>
              </div>
              <span className="text-sm font-black text-white mt-1 block">{analysis.tonalScore}%</span>
            </div>
          </div>

          {/* Diagnóstico da IA */}
          {analysis.critique && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Diagnóstico Técnico
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {analysis.critique}
              </p>
            </div>
          )}

          {/* Pontos Fortes e Correções */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
              <div className="p-3 bg-[#1C1B19] border border-[#2D2A26] rounded-lg space-y-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                  Pontos Fortes
                </span>
                <ul className="space-y-1 text-zinc-300 text-[11px]">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">-</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(analysis.corrections) && analysis.corrections.length > 0 && (
              <div className="p-3 bg-[#1C1B19] border border-[#2D2A26] rounded-lg space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  Ajustes Recomendados
                </span>
                <ul className="space-y-1 text-zinc-300 text-[11px]">
                  {analysis.corrections.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold shrink-0">-</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Exercícios de Evolução Contínua */}
          {Array.isArray(analysis.suggestedDrills) && analysis.suggestedDrills.length > 0 && (
            <div className="p-3 bg-[#1C1B19] border border-[#2D2A26] rounded-lg space-y-1.5 font-sans">
              <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider block">
                Exercícios Práticos Sugeridos
              </span>
              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {analysis.suggestedDrills.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold shrink-0">-</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
