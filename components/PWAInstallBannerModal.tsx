import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const PWAInstallBannerModal: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install, triggerHaptic } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  if (isInstalled || (dismissedBanner && !showModal)) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic([20, 30, 20]);
    if (isInstallable) {
      const res = await install();
      if (res) setShowModal(false);
    } else if (isIOS) {
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Floating Bottom App Bar Banner */}
      {!dismissedBanner && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[90] bg-[#1C1B19]/95 backdrop-blur-xl border border-[#FFB800]/40 p-3.5 rounded-3xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB800] text-[#141311] flex items-center justify-center font-black shrink-0 shadow-md">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black uppercase tracking-tight text-white truncate">
                  Instalar App UPMM
                </h4>
                <span className="bg-[#FFB800]/20 text-[#FFB800] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0">
                  Android & iOS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold truncate">
                Usabilidade nativa sem ocupar memória
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] px-3.5 py-2 rounded-2xl font-black text-[10px] uppercase flex items-center gap-1 shadow-lg active:scale-95 transition cursor-pointer"
            >
              <Download size={13} />
              <span>Instalar</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setDismissedBanner(true);
              }}
              className="p-2 text-zinc-500 hover:text-white rounded-full transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Guided Instructions Modal for iOS / Desktop */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#1C1B19] border border-[#3E3A35] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-[#EDE8E1]">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#FFB800] text-[#141311] rounded-2xl font-black">
                  <Smartphone size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-[#FFB800] tracking-widest">
                    Instalação Direta
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    App UPMM no seu Celular
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-[#242220] hover:bg-[#2D2A26] rounded-full text-zinc-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-[#242220] p-4 rounded-2xl border border-[#3E3A35] text-xs">
                <p className="font-bold text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FFB800]" />
                  Instruções para iPhone / iPad (Safari):
                </p>
                <ol className="space-y-2 text-zinc-300 font-medium pl-1">
                  <li className="flex items-start gap-2">
                    <span className="p-1 bg-[#2D2A26] text-[#FFB800] rounded-lg text-[10px] font-black shrink-0">1</span>
                    <span>Toque no botão <strong>Compartilhar <Share size={12} className="inline mx-0.5 text-[#FFB800]" /></strong> na barra inferior do Safari.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="p-1 bg-[#2D2A26] text-[#FFB800] rounded-lg text-[10px] font-black shrink-0">2</span>
                    <span>Role para baixo e selecione <strong>Adicionar à Tela de Início <PlusSquare size={12} className="inline mx-0.5 text-[#FFB800]" /></strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="p-1 bg-[#2D2A26] text-[#FFB800] rounded-lg text-[10px] font-black shrink-0">3</span>
                    <span>Confirme em <strong>Adicionar</strong>. O ícone oficial aparecerá na tela do celular.</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-[#242220] p-4 rounded-2xl border border-[#3E3A35] text-xs">
                <p className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Instalação no Android (Chrome / Edge):
                </p>
                <p className="text-zinc-300 font-medium">
                  Abra o menu de 3 pontos do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#FFB800] text-[#141311] py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg active:scale-95 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
