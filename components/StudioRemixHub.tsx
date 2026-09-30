import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Paintbrush, ArrowRight, Lock } from 'lucide-react';
import { PhotoBase, User } from '../types';

interface StudioRemixHubProps {
    photos: PhotoBase[];
    currentUser: User | null;
    onRequireLogin: (reason: string, returnTo: string) => void;
}

export const StudioRemixHub: React.FC<StudioRemixHubProps> = ({
    photos,
    currentUser,
    onRequireLogin
}) => {
    const navigate = useNavigate();
    const baseWalls = photos.filter(p => p.type === 'base');

    const handleSelectWall = (photoId: string) => {
        if (!currentUser) {
            onRequireLogin(
                'Para abrir o Studio Remix e criar sua visão, conecte-se com seu perfil ou Google.',
                `/remix/${photoId}`
            );
            return;
        }
        void navigate(`/remix/${photoId}`);
    };

    return (
        <div className="space-y-6">
            <header className="bg-[#18181B] border border-[#27272A] rounded-[2.5rem] p-5 sm:p-6 shadow-xl text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#00E5FF] text-[#141311] flex items-center justify-center font-black shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/20">
                            Studio Remix
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                            Escolha um muro base para remixar
                        </h2>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 font-medium mt-3 max-w-xl">
                    Selecione uma obra registrada na quebrada para abrir o editor e criar a sua intervenção visual. Remixes herdam a localização da obra original.
                </p>
            </header>

            {baseWalls.length === 0 ? (
                <div className="bg-[#1C1B19] rounded-[2.5rem] p-12 text-center border border-[#3E3A35] space-y-4">
                    <div className="w-16 h-16 bg-[#242220] text-[#FFB800] border border-[#3E3A35] rounded-3xl flex items-center justify-center mx-auto">
                        <Camera size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Nenhum muro base cadastrado</h3>
                    <p className="text-xs text-[#EDE8E1]/80 max-w-md mx-auto leading-relaxed font-medium">
                        Assim que a comunidade registrar as primeiras obras, elas aparecerão aqui para você remixar.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {baseWalls.map(photo => (
                        <button
                            key={photo.id}
                            type="button"
                            onClick={() => handleSelectWall(photo.id)}
                            className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#242220] border border-[#3E3A35] hover:border-[#00E5FF] transition-all cursor-pointer text-left shadow hover:shadow-xl"
                            aria-label={`Remixar ${photo.title}`}
                        >
                            <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=600&q=80';
                                }}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#141311]/90 border border-[#3E3A35] text-white px-2.5 py-1.5 rounded-xl">
                                <Camera size={11} />
                                <span className="text-[8px] font-black uppercase tracking-wider">Foto Base</span>
                            </div>
                            {!currentUser && (
                                <div className="absolute top-3 right-3 bg-black/70 text-[#00E5FF] p-1.5 rounded-xl border border-[#00E5FF]/30">
                                    <Lock size={13} />
                                </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-3.5">
                                <h4 className="font-black text-sm uppercase tracking-tight text-white truncate">{photo.title}</h4>
                                <p className="text-[10px] text-[#EDE8E1]/70 font-bold truncate">por @{photo.authorName}</p>
                                <span className="mt-2 inline-flex items-center gap-1 bg-[#00E5FF] text-[#141311] font-black text-[9px] uppercase px-2.5 py-1.5 rounded-xl transition group-hover:bg-white">
                                    <Paintbrush size={11} />
                                    <span>Remixar</span>
                                    <ArrowRight size={11} />
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
