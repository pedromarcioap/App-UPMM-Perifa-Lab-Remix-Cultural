import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, HardDrive, ShieldCheck, Cpu, Copy, Check, RefreshCw, X } from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { SupabaseIntegrationStatus } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SupabaseIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await SupabaseService.getStatus();
      setStatus(res);
    } catch {
      // Ignorar falha transitória
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchemaNotice = () => {
    setCopied(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText('-- Schema relacional do Supabase localizado em /supabase/schema.sql\n-- Contém tabelas: profiles, artworks, ai_analyses, comments e graffiti_spots.');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#1C1A18] border border-[#3E3A35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header no estilo editorial suíço */}
        <div className="p-6 border-b border-[#3E3A35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2A26] border border-[#3E3A35] flex items-center justify-center text-[#22C55E]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight uppercase">
                Integração Supabase
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                PostgreSQL - Auth - Storage - Filas de Visão IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#2D2A26] transition cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com grid modular */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status Geral */}
          <div className="p-4 bg-[#242220] border border-[#3E3A35] rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Estado da Conexão
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-sm font-bold text-white">
                  {status?.configured ? 'Supabase Conectado' : 'Modo Offline-First com Cache Local'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {status?.url ? `Endpoint: ${status.url}` : 'Variáveis VITE_SUPABASE_URL no ambiente .env'}
              </p>
            </div>

            <button
              onClick={refreshStatus}
              disabled={loading}
              className="p-2 bg-[#2D2A26] hover:bg-[#3E3A35] border border-[#3E3A35] rounded-lg text-zinc-300 transition cursor-pointer disabled:opacity-50"
              title="Recarregar diagnóstico"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Grid de Serviços Relacionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            {/* Banco de Dados PostgreSQL */}
            <div className="p-4 bg-[#242220] border border-[#3E3A35] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wide">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Banco Relacional</span>
                </div>
                {status?.databaseActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Tabelas relacionais: <code className="text-zinc-300">profiles</code>, <code className="text-zinc-300">artworks</code>, <code className="text-zinc-300">ai_analyses</code>, <code className="text-zinc-300">comments</code>.
              </p>
            </div>

            {/* Storage de Arquivos Pesados */}
            <div className="p-4 bg-[#242220] border border-[#3E3A35] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wide">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Storage de Mídia</span>
                </div>
                {status?.storageActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Buckets CDN: <code className="text-zinc-300">artworks</code> para imagens pesadas sem limite rígido de 1 MiB.
              </p>
            </div>

            {/* Autenticação & Sessão */}
            <div className="p-4 bg-[#242220] border border-[#3E3A35] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Supabase Auth</span>
                </div>
                {status?.authActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {status?.sessionUserEmail ? `Sessão ativa: ${status.sessionUserEmail}` : 'Suporte a Login por Email e Senha com RLS.'}
              </p>
            </div>

            {/* IA Visual & Mentoria */}
            <div className="p-4 bg-[#242220] border border-[#3E3A35] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wide">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Mentoria Técnica IA</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-zinc-400">
                Análise técnica de proporção, perspectiva e valores tonais processada de forma assíncrona.
              </p>
            </div>
          </div>

          {/* DDL e Script de Inicialização */}
          <div className="p-4 bg-[#141312] border border-[#2D2A26] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Estrutura DDL Relacional (schema.sql)
              </span>
              <button
                onClick={handleCopySchemaNotice}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242220] hover:bg-[#2D2A26] border border-[#3E3A35] rounded-lg text-xs text-zinc-300 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Referência</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O arquivo <code className="text-zinc-300 bg-[#242220] px-1 py-0.5 rounded">/supabase/schema.sql</code> foi configurado com índices otimizados, gatilhos automáticos para perfis e políticas RLS de leitura e gravação seguras.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141312] border-t border-[#3E3A35] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
