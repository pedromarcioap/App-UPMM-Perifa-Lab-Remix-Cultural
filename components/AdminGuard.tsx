import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft, Home, Sparkles } from 'lucide-react';

interface AdminGuardProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ isAdmin, children }) => {
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1C1B19] border border-[#3E3A35] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-[#FFB800] border border-[#FFB800]/40 flex items-center justify-center mx-auto shadow-inner">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <ShieldAlert size={13} />
              <span>Acesso Restrito ao Administrador</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight pt-1">
              Curadoria & CMS Bloqueado
            </h2>
            
            <p className="text-xs text-[#EDE8E1]/70 leading-relaxed max-w-sm mx-auto">
              Esta área contém dados confidenciais de governança, editais B2B, balanço financeiro de patrocínios e liquidação de repasses Pix aos artistas.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#242220] border border-[#3E3A35] text-left text-xs space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-[#FFB800] block">
              Dica de Permissão:
            </span>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Faça login com a conta administradora credenciada (<span className="text-zinc-200 font-mono">pedromarcioap@gmail.com</span>) ou ative a simulação de curadoria no rodapé do menu lateral.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 min-h-[44px] bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] rounded-xl font-bold text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Home size={14} />
              <span>Ir para o Feed</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/challenges')}
              className="flex-1 min-h-[44px] bg-[#242220] hover:bg-[#2D2A26] text-white rounded-xl font-bold text-xs uppercase tracking-wider border border-[#3E3A35] transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles size={14} className="text-[#FFB800]" />
              <span>Ver Editais</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
