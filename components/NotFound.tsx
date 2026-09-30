import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin } from 'lucide-react';

export const NotFound: React.FC = () => {
    return (
        <div className="bg-[#1C1B19] rounded-[2.5rem] p-12 text-center border border-[#3E3A35] shadow-sm space-y-5">
            <div className="w-20 h-20 bg-[#242220] text-[#FFB800] border border-[#3E3A35] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <MapPin size={40} />
            </div>
            <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] bg-[#FFB800]/10 px-2.5 py-1 rounded-full border border-[#FFB800]/20">
                    Erro 404
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                    Essa quebrada não existe
                </h2>
                <p className="text-xs text-[#EDE8E1]/80 max-w-md mx-auto leading-relaxed font-medium">
                    O endereço que você tentou acessar não foi encontrado. Pode ter sido movido, renomeado ou nunca ter existido.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFB800] hover:bg-[#FFA000] text-[#141311] font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg hover:scale-105"
                >
                    <Home size={15} />
                    <span>Voltar ao Fluxo</span>
                </Link>
                <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#242220] hover:bg-[#2D2A26] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition border border-[#3E3A35] hover:border-[#FFB800]"
                >
                    <Compass size={15} />
                    <span>Explorar Palmas</span>
                </Link>
            </div>
        </div>
    );
};
