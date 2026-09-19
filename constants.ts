
import { 
  User, 
  PhotoBase, 
  UserLevel, 
  Sticker, 
  Badge, 
  GraffitiSpot, 
  Comment, 
  WeeklyChallenge,
  BrandedChallenge,
  BrandedAssetPack,
  SponsorProfile,
  AssetItem
} from './types';

export const COLORS = {
  primary: '#FFB800',
  dark: '#2D2A26',
  black: '#000000',
  beige: '#FDFCFB',
  white: '#FFFFFF'
};

export const BADGES: Badge[] = [
  { id: 'top_artist', name: 'Mestre da Visão', icon: '👑', description: 'Líder de responsa e impacto no ranking geral de Palmas.', category: 'reputation' },
  { id: 'click', name: 'Primeiro Click', icon: '📸', description: 'Realizou o primeiro registro visual da quebrada.', category: 'creation' },
  { id: 'alchemist', name: 'Alquimista', icon: '🧪', description: 'Fez sua primeira intervenção ou remix periférico.', category: 'creation' },
  { id: 'community', name: 'Voz da Quebrada', icon: '🤝', description: 'Participou com comentários e trocas construtivas.', category: 'reputation' },
  { id: 'spot_scout', name: 'Mapeador de Muros', icon: '📍', description: 'Mapeou locais de graffiti e pontos de expressão urbana.', category: 'territory' },
  { id: 'battle_juror', name: 'Júri da Batalha', icon: '⚔️', description: 'Votou e decidiu duelos na Arena de Batalhas 1v1.', category: 'battle' },
  { id: 'weekly_warrior', name: 'Desafiante Semanal', icon: '🏆', description: 'Participou ativamente dos Desafios Semanais temáticos de Palmas.', category: 'special' },
  { id: 'master_remixer', name: 'Mestre do Remix', icon: '🎨', description: 'Criou mais de 5 intervenções visuais e remixes estilizados.', category: 'creation' },
  { id: 'cerrado_roots', name: 'Raízes do Cerrado', icon: '🌴', description: 'Valorizou a luz, cores solares e a identidade cultural tocantinense.', category: 'territory' },
  { id: 'urban_legend', name: 'Lenda Urbana', icon: '⚡', description: 'Conquistou mais de 500 vibes em suas produções pela cidade.', category: 'reputation' },
  { id: 'map_master', name: 'Cartógrafo da Rua', icon: '🗺️', description: 'Sinalizou 3 ou mais muros e murais autorizados no mapa.', category: 'territory' },
  { id: 'battle_titan', name: 'Titã da Arena', icon: '🥊', description: 'Acumulou 10 ou mais vitórias nas batalhas da comunidade.', category: 'battle' },
  { id: 'tagger_pro', name: 'Tag de Ouro', icon: '✍️', description: 'Usou stickers, tipografia urbana e lambes com maestria.', category: 'creation' },
  { id: 'social_connector', name: 'Voz Ativa', icon: '📢', description: 'Conectou múltiplos artistas com feedbacks e trocas criativas.', category: 'reputation' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_pmw_3',
    name: 'DJ Cerrado Beat',
    username: 'djcerrado',
    email: 'djcerrado@periferia.pmw',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Produtor sonoro e ativista visual no Setor Taquari. A voz do Tocantins.',
    vibe: 580,
    responsa: 120,
    level: UserLevel.ATIVISTA,
    badges: ['top_artist', 'click', 'alchemist', 'community'],
    isAdmin: false,
    hasNotifications: false,
    neighborhood: 'Setor Taquari'
  },
  {
    id: 'user_pmw_1',
    name: 'Calebe Art',
    username: 'calebeart',
    email: 'calebe@periferia.pmw',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Grafiteiro e fotógrafo no Taquaralto. Registrando a resistência do cerrado.',
    vibe: 342,
    responsa: 95,
    level: UserLevel.ATIVISTA,
    badges: ['click', 'alchemist', 'community', 'spot_scout'],
    isAdmin: true,
    hasNotifications: false,
    neighborhood: 'Taquaralto'
  },
  {
    id: 'user_pmw_4',
    name: 'Bia Muralha',
    username: 'biamuralha',
    email: 'bia@periferia.pmw',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Muralista e ilustradora urbana. Pintando murais autorizados no Cesamar e Plano Diretor.',
    vibe: 310,
    responsa: 78,
    level: UserLevel.CRIADOR,
    badges: ['click', 'community', 'spot_scout'],
    isAdmin: false,
    hasNotifications: false,
    neighborhood: 'Plano Diretor Sul'
  },
  {
    id: 'user_pmw_5',
    name: 'Kadu Spray',
    username: 'kaduspray',
    email: 'kadu@periferia.pmw',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: 'Pintor de letras e caligrafia urbana no Setor Morada do Sol.',
    vibe: 240,
    responsa: 60,
    level: UserLevel.CRIADOR,
    badges: ['click', 'alchemist'],
    isAdmin: false,
    hasNotifications: false,
    neighborhood: 'Morada do Sol'
  },
  {
    id: 'user_pmw_2',
    name: 'Rayane Visão',
    username: 'rayanevisao',
    email: 'rayane@periferia.pmw',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Moradora do Aureny III. Minha lente foca no que ninguém vê.',
    vibe: 220,
    responsa: 48,
    level: UserLevel.CRIADOR,
    badges: ['click', 'community'],
    isAdmin: false,
    hasNotifications: false,
    neighborhood: 'Jardim Aureny III'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm_1',
    targetId: 'photo_pmw_1',
    targetType: 'photo',
    userId: 'user_pmw_2',
    userName: 'Rayane Visão',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    text: 'Essa luz do Taquari é única demais! A curva do mirante com o cerrado dá toda a poesia periférica.',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    likes: 4
  },
  {
    id: 'comm_2',
    targetId: 'photo_pmw_1',
    targetType: 'photo',
    userId: 'user_pmw_3',
    userName: 'DJ Cerrado Beat',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    text: 'Cerrado vivo! O contraste da poeira vermelha com o céu dourado de Palmas ficou cinematográfico.',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    likes: 6
  },
  {
    id: 'comm_3',
    targetId: 'photo_pmw_3',
    targetType: 'photo',
    userId: 'user_pmw_4',
    userName: 'Bia Muralha',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    text: 'Esse mural coletivo na Av. Tocantins inspirou toda a molecada de Taquaralto. Respeito máximo pela autoria!',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    likes: 5
  },
  {
    id: 'comm_4',
    targetId: 'remix_taquaralto_1',
    targetType: 'photo',
    userId: 'user_pmw_1',
    userName: 'Calebe Art',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    text: 'Ficou peso pesado esse remix @Rayane Visão! A sobreposição das cores com a base original deu uma nova vida ao muro.',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    likes: 3
  },
  {
    id: 'comm_5',
    targetId: 'spot_1',
    targetType: 'spot',
    userId: 'user_pmw_1',
    userName: 'Calebe Art',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    text: 'O dono do galpão assinou a liberação por escrito. Muro de alvenaria lisa, altura de 3m. Vamos organizar mutirão no fim de semana!',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    likes: 7
  },
  {
    id: 'comm_6',
    targetId: 'spot_1',
    targetType: 'spot',
    userId: 'user_pmw_4',
    userName: 'Bia Muralha',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    text: 'Tô com primer e latas de spray preto e amarelo sobrando. Contem comigo pro mutirão coletivo!',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    likes: 4
  },
  {
    id: 'comm_7',
    targetId: 'spot_2',
    targetType: 'spot',
    userId: 'user_pmw_2',
    userName: 'Rayane Visão',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    text: 'Os pilares do viaduto no Aureny III são muito cinzas e pedem arte urgente. Estamos recolhendo apoio dos comerciantes da feira.',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    likes: 8
  },
  {
    id: 'comm_8',
    targetId: 'spot_3',
    targetType: 'spot',
    userId: 'user_pmw_5',
    userName: 'Kadu Spray',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    text: 'A pista do Cesamar é o templo da street art em Palmas. Espaço sempre aberto para troca de ideia e novos tags.',
    createdAt: Date.now() - 1000 * 60 * 60 * 10,
    likes: 5
  }
];

export const INITIAL_GRAFFITI_SPOTS: GraffitiSpot[] = [
  {
    id: 'spot_1',
    userId: 'user_pmw_1',
    userName: 'Calebe Art',
    title: 'Muro da Liberdade - Taquaralto',
    description: 'Proprietário autorizou pintura livre de temas sociais e identidade do cerrado.',
    type: 'permitido',
    lat: -10.3235,
    lng: -48.3038,
    neighborhood: 'Taquaralto',
    address: 'Av. Tocantins, Quadra 32, Taquaralto, Palmas - TO, 77064-580',
    createdAt: Date.now()
  },
  {
    id: 'spot_2',
    userId: 'user_pmw_2',
    userName: 'Rayane Visão',
    title: 'Pilares do Viaduto Aureny III',
    description: 'Ponto de alto fluxo na entrada do bairro, sugerido para intervenção e muralismo coletivo.',
    type: 'sugerido',
    lat: -10.2741,
    lng: -48.3182,
    neighborhood: 'Jardim Aureny III',
    address: 'Av. Transversal com Rodovia TO-050, Jardim Aureny III, Palmas - TO, 77054-610',
    createdAt: Date.now()
  },
  {
    id: 'spot_3',
    userId: 'user_pmw_1',
    userName: 'Calebe Art',
    title: 'Pista de Skate & Muro Cesamar',
    description: 'Espaço tradicional de encontro da arte urbana e skate park de Palmas.',
    type: 'permitido',
    lat: -10.2175,
    lng: -48.3248,
    neighborhood: 'Plano Diretor Sul',
    address: 'Parque Cesamar, Quadra 110 Sul, Palmas - TO, 77020-120',
    createdAt: Date.now()
  }
];

export const INITIAL_PHOTOS: PhotoBase[] = [
  {
    id: 'photo_pmw_1',
    userId: 'user_pmw_1',
    authorName: 'Calebe Art',
    title: 'Pôr do Sol no Taquari',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    tags: ['Cerrado', 'Quebrada'],
    vibeCount: 245,
    isGoldStandard: true,
    type: 'base',
    battleWins: 28,
    battleLosses: 12,
    battleStreak: 2,
    location: { 
      lat: -10.3392, 
      lng: -48.2865, 
      neighborhood: 'Setor Taquari',
      address: 'Av. LO-19 com Alameda 05, Setor Taquari, Palmas - TO, 77066-024',
      landmark: 'Mirante Natural do Taquari'
    }
  },
  {
    id: 'photo_pmw_2',
    userId: 'user_pmw_2',
    authorName: 'Rayane Visão',
    title: 'Geometria do Aureny III',
    imageUrl: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80',
    tags: ['Arquitetura', 'Cotidiano'],
    vibeCount: 189,
    type: 'base',
    battleWins: 18,
    battleLosses: 14,
    battleStreak: 1,
    location: { 
      lat: -10.2741, 
      lng: -48.3182, 
      neighborhood: 'Jardim Aureny III',
      address: 'Av. Transversal, nº 210, Jardim Aureny III, Palmas - TO, 77054-610',
      landmark: 'Próximo à Feira Coberta do Aureny III'
    }
  },
  {
    id: 'photo_pmw_3',
    userId: 'user_pmw_1',
    authorName: 'Calebe Art',
    title: 'Mural Coletivo Taquaralto',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    tags: ['Graffiti', 'Resistência'],
    vibeCount: 310,
    isGoldStandard: true,
    type: 'base',
    battleWins: 35,
    battleLosses: 10,
    battleStreak: 3,
    location: { 
      lat: -10.3235, 
      lng: -48.3038, 
      neighborhood: 'Taquaralto',
      address: 'Av. Tocantins, Quadra 32, Taquaralto, Palmas - TO, 77064-580',
      landmark: 'Corredor Cultural Taquaralto'
    }
  },
  {
    id: 'photo_pmw_4',
    userId: 'user_pmw_2',
    authorName: 'Rayane Visão',
    title: 'Cores da Quebrada Sul',
    imageUrl: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&w=1200&q=80',
    tags: ['Cores', 'Cultura'],
    vibeCount: 142,
    type: 'base',
    battleWins: 14,
    battleLosses: 16,
    battleStreak: 0,
    location: { 
      lat: -10.2982, 
      lng: -48.3125, 
      neighborhood: 'Morada do Sol',
      address: 'Rua 15 esquina com Av. Contorno, Setor Morada do Sol, Palmas - TO, 77058-230',
      landmark: 'Praça da Juventude Morada do Sol'
    }
  },
  {
    id: 'photo_pmw_5',
    userId: 'user_pmw_2',
    authorName: 'Rayane Visão',
    title: 'Mural no Espaço Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    tags: ['Muralismo', 'Plano Diretor'],
    vibeCount: 278,
    isGoldStandard: true,
    type: 'base',
    battleWins: 31,
    battleLosses: 9,
    battleStreak: 4,
    location: {
      lat: -10.2075,
      lng: -48.3372,
      neighborhood: 'Plano Diretor Sul',
      address: 'Área Verde 301 Sul, Av. Teotônio Segurado, Palmas - TO, 77015-002',
      landmark: 'Espaço Cultural José Gomes Sobrinho'
    }
  },
  {
    id: 'photo_pmw_6',
    userId: 'user_pmw_1',
    authorName: 'Calebe Art',
    title: 'Pôr do Sol na Praia da Graciosa',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    tags: ['Orla', 'Lago'],
    vibeCount: 412,
    isGoldStandard: true,
    type: 'base',
    battleWins: 42,
    battleLosses: 8,
    battleStreak: 5,
    location: {
      lat: -10.1985,
      lng: -48.3650,
      neighborhood: 'Orla Graciosa',
      address: 'Praia da Graciosa, Orla Oeste, Palmas - TO, 77001-000',
      landmark: 'Pier da Praia da Graciosa'
    }
  },
  {
    id: 'remix_taquaralto_1',
    userId: 'user_pmw_2',
    authorName: 'Rayane Visão',
    title: 'Remix Cores da Sul - Taquaralto',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Graffiti', 'Remix', 'Taquaralto', 'Resistência'],
    vibeCount: 245,
    type: 'remix',
    originalPhotoId: 'photo_pmw_3',
    battleWins: 25,
    battleLosses: 11,
    battleStreak: 2,
    location: {
      lat: -10.3228,
      lng: -48.3032,
      neighborhood: 'Taquaralto',
      address: 'Av. Tocantins, Quadra 32, Taquaralto, Palmas - TO',
      landmark: 'Corredor Cultural Taquaralto'
    }
  },
  {
    id: 'remix_aureny_1',
    userId: 'user_pmw_1',
    authorName: 'Calebe Art',
    title: 'Intervenção Geométrica - Aureny III',
    imageUrl: 'https://images.unsplash.com/photo-1569091791842-7cfb64e04797?auto=format&fit=crop&w=1200&q=80',
    tags: ['Arquitetura', 'Remix', 'AurenyIII', 'StreetArt'],
    vibeCount: 198,
    type: 'remix',
    originalPhotoId: 'photo_pmw_2',
    battleWins: 21,
    battleLosses: 13,
    battleStreak: 1,
    location: {
      lat: -10.2745,
      lng: -48.3175,
      neighborhood: 'Jardim Aureny III',
      address: 'Av. Transversal, nº 210, Jardim Aureny III, Palmas - TO',
      landmark: 'Próximo à Feira Coberta do Aureny III'
    }
  },
  {
    id: 'remix_espaco_1',
    userId: 'user_pmw_1',
    authorName: 'Calebe Art',
    title: 'Remix Pátio Urbano - Espaço Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Muralismo', 'Remix', 'PlanoDiretor', 'Spray'],
    vibeCount: 360,
    type: 'remix',
    originalPhotoId: 'photo_pmw_5',
    battleWins: 38,
    battleLosses: 8,
    battleStreak: 4,
    location: {
      lat: -10.2080,
      lng: -48.3365,
      neighborhood: 'Plano Diretor Sul',
      address: 'Área Verde 301 Sul, Av. Teotônio Segurado, Palmas - TO',
      landmark: 'Pista de Skate do Espaço Cultural'
    }
  },
  {
    id: 'remix_graciosa_1',
    userId: 'user_pmw_2',
    authorName: 'Rayane Visão',
    title: 'Remix Luz Dourada - Praia da Graciosa',
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
    tags: ['Orla', 'Remix', 'Graciosa', 'Lago'],
    vibeCount: 489,
    type: 'remix',
    originalPhotoId: 'photo_pmw_6',
    battleWins: 48,
    battleLosses: 6,
    battleStreak: 6,
    location: {
      lat: -10.1990,
      lng: -48.3645,
      neighborhood: 'Orla Graciosa',
      address: 'Praia da Graciosa, Orla Oeste, Palmas - TO',
      landmark: 'Pier da Praia da Graciosa'
    }
  }
];

export const STICKERS: Sticker[] = [
  { 
    id: 's1', 
    name: 'Street Tag', 
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M15 80 L85 80 L80 45 L65 65 L50 25 L35 65 L20 45 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="18" r="6" fill="%23FFB800"/><circle cx="20" cy="38" r="5" fill="%23FFB800"/><circle cx="80" cy="38" r="5" fill="%23FFB800"/></svg>' 
  },
  { 
    id: 's_tag_pmw', 
    name: 'Tag PMW 063', 
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><rect width="120" height="60" rx="12" fill="%232D2A26"/><text x="60" y="38" font-family="sans-serif" font-weight="900" font-size="22" fill="%23FFB800" text-anchor="middle" letter-spacing="2">PMW 063</text><circle cx="15" cy="15" r="3" fill="%23FFB800"/><circle cx="105" cy="15" r="3" fill="%23FFB800"/></svg>' 
  },
  { 
    id: 's_cria_sul', 
    name: 'Cria da Sul', 
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"><path d="M5 10 L115 5 L110 45 L10 40 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/><text x="60" y="32" font-family="sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF" text-anchor="middle">CRIA DA SUL</text></svg>' 
  },
  { 
    id: 's_graffiti_king', 
    name: 'Graffiti King', 
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 75 L80 75 L90 35 L68 55 L50 20 L32 55 L10 35 Z" fill="%23FFD700" stroke="%232D2A26" stroke-width="4"/><circle cx="50" cy="12" r="5" fill="%23FF5722"/><circle cx="10" cy="27" r="4" fill="%23FF5722"/><circle cx="90" cy="27" r="4" fill="%23FF5722"/><text x="50" y="70" font-family="sans-serif" font-weight="900" font-size="11" fill="%232D2A26" text-anchor="middle">KING</text></svg>' 
  },
  { 
    id: 's2', 
    name: 'Spray Blast', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="35" y="38" width="30" height="52" rx="6" fill="%232D2A26"/><rect x="42" y="24" width="16" height="12" rx="3" fill="%23FFB800"/><rect x="46" y="16" width="8" height="8" rx="2" fill="%232D2A26"/><path d="M54 20 L80 10 M54 22 L85 20 M54 24 L78 30" stroke="%23FFB800" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="64" r="7" fill="%23FFB800"/></svg>' 
  },
  { 
    id: 's_lata_spray', 
    name: 'Lata de Spray', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="32" width="40" height="58" rx="8" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><rect x="40" y="18" width="20" height="14" rx="4" fill="%232D2A26"/><rect x="44" y="10" width="12" height="8" rx="2" fill="%23FF5722"/><line x1="30" y1="56" x2="70" y2="56" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="74" r="6" fill="%232D2A26"/></svg>' 
  },
  { 
    id: 's_drip', 
    name: 'Drip de Tinta', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 20 Q30 25 50 20 T90 20 L90 35 C85 45 78 55 75 75 C72 88 64 88 64 70 C64 50 58 45 52 65 C48 80 40 85 38 65 C35 50 30 40 22 55 C18 62 12 55 10 35 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/></svg>' 
  },
  { 
    id: 's_fat_cap', 
    name: 'Fat Cap NY', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="6"/><circle cx="50" cy="50" r="24" fill="%23FF5722"/><circle cx="50" cy="50" r="10" fill="%232D2A26"/><line x1="50" y1="12" x2="50" y2="26" stroke="%232D2A26" stroke-width="4"/><line x1="50" y1="74" x2="50" y2="88" stroke="%232D2A26" stroke-width="4"/></svg>' 
  },
  { 
    id: 's_rolo_pintura', 
    name: 'Rolo de Pintura', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="15" width="50" height="24" rx="6" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><path d="M75 27 L85 27 L85 55 L55 55 L55 85" fill="none" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><rect x="50" y="65" width="10" height="25" rx="3" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/></svg>' 
  },
  { 
    id: 's_sol_palmas', 
    name: 'Sol de Palmas', 
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="24" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50 M22 22 L29 29 M71 71 L78 78 M78 22 L71 29 M29 71 L22 78" stroke="%23FF5722" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="14" fill="%23FF5722"/></svg>' 
  },
  { 
    id: 's_buriti', 
    name: 'Palmeira Buriti', 
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88 L50 45" stroke="%238B5A2B" stroke-width="6" stroke-linecap="round"/><path d="M50 45 C40 25 15 35 12 40" fill="none" stroke="%232E7D32" stroke-width="5" stroke-linecap="round"/><path d="M50 45 C35 15 45 10 50 10 C55 10 65 15 50 45" fill="none" stroke="%232E7D32" stroke-width="5" stroke-linecap="round"/><path d="M50 45 C60 25 85 35 88 40" fill="none" stroke="%232E7D32" stroke-width="5" stroke-linecap="round"/><path d="M50 45 C30 35 25 50 22 55" fill="none" stroke="%232E7D32" stroke-width="5" stroke-linecap="round"/><path d="M50 45 C70 35 75 50 78 55" fill="none" stroke="%232E7D32" stroke-width="5" stroke-linecap="round"/></svg>' 
  },
  { 
    id: 's_ipe_amarelo', 
    name: 'Flor do Ipê', 
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="35" r="15" fill="%23FFD700" stroke="%232D2A26" stroke-width="3"/><circle cx="65" cy="48" r="15" fill="%23FFD700" stroke="%232D2A26" stroke-width="3"/><circle cx="58" cy="68" r="15" fill="%23FFD700" stroke="%232D2A26" stroke-width="3"/><circle cx="42" cy="68" r="15" fill="%23FFD700" stroke="%232D2A26" stroke-width="3"/><circle cx="35" cy="48" r="15" fill="%23FFD700" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="52" r="10" fill="%23FF5722"/></svg>' 
  },
  { 
    id: 's_coracao_cerrado', 
    name: 'Coração Cerrado', 
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 85 C15 55 10 25 35 18 C45 15 50 25 50 25 C50 25 55 15 65 18 C90 25 85 55 50 85 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><path d="M50 30 L50 70 M35 45 L65 45" stroke="%23FFB800" stroke-width="4" stroke-linecap="round"/></svg>' 
  },
  { 
    id: 's3', 
    name: 'Quebrada Star', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 63,38 94,38 69,57 78,88 50,70 22,88 31,57 6,38 37,38" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><polygon points="50,26 58,44 76,44 62,56 67,75 50,63 33,75 38,56 24,44 42,44" fill="%23FF5722"/></svg>' 
  },
  { 
    id: 's4', 
    name: 'Raio Vibe', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="55,10 25,52 48,52 40,90 75,44 52,44" fill="%23FFB800" stroke="%232D2A26" stroke-width="4" stroke-linejoin="round"/></svg>' 
  },
  { 
    id: 's_boombox', 
    name: 'Boombox 90s', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="45" rx="6" fill="%232D2A26" stroke="%23FFB800" stroke-width="3"/><path d="M30 35 L30 22 L70 22 L70 35" fill="none" stroke="%23FFB800" stroke-width="4"/><circle cx="32" cy="58" r="14" fill="%23FF5722" stroke="%23FFFFFF" stroke-width="2"/><circle cx="68" cy="58" r="14" fill="%23FF5722" stroke="%23FFFFFF" stroke-width="2"/><rect x="46" y="48" width="8" height="18" fill="%23FFB800"/></svg>' 
  },
  { 
    id: 's_fita_k7', 
    name: 'Fita K7 HipHop', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><rect x="10" y="10" width="80" height="50" rx="6" fill="%232D2A26" stroke="%23FFB800" stroke-width="3"/><rect x="22" y="20" width="56" height="25" rx="3" fill="%23FFFFFF"/><circle cx="36" cy="32" r="6" fill="%232D2A26"/><circle cx="64" cy="32" r="6" fill="%232D2A26"/><polygon points="26,60 32,48 68,48 74,60" fill="%23FF5722"/></svg>' 
  },
  { 
    id: 's_megafone', 
    name: 'Megafone Perifa', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="25,40 55,20 55,80 25,60" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><rect x="15" y="40" width="10" height="20" rx="3" fill="%23FF5722"/><path d="M55 35 L45 70 L35 65" fill="none" stroke="%232D2A26" stroke-width="4"/><path d="M65 35 Q75 50 65 65 M72 25 Q88 50 72 75" fill="none" stroke="%23FF5722" stroke-width="4" stroke-linecap="round"/></svg>' 
  },
  { 
    id: 's_selo_responsa', 
    name: 'Selo 100% Responsa', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="%23FFB800" stroke-width="5" stroke-dasharray="6,4"/><circle cx="50" cy="50" r="32" fill="%232D2A26"/><text x="50" y="46" font-family="sans-serif" font-weight="900" font-size="12" fill="%23FFB800" text-anchor="middle">100%</text><text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="8" fill="%23FFFFFF" text-anchor="middle">RESPONSA</text></svg>' 
  },
  { 
    id: 's_seta_street', 
    name: 'Seta Graffiti', 
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M10 25 L60 25 L50 10 L90 30 L50 50 L60 35 L10 35 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="3" stroke-linejoin="round"/></svg>' 
  },
  { 
    id: 's_olho_visao', 
    name: 'Olho da Visão', 
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M10 30 Q50 5 90 30 Q50 55 10 30 Z" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="4"/><circle cx="50" cy="30" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="30" r="6" fill="%232D2A26"/></svg>' 
  },
  {
    id: 's_tag_taquaralto',
    name: 'Tag Taquaralto',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><rect x="5" y="5" width="130" height="40" rx="8" fill="%232D2A26" stroke="%23FFB800" stroke-width="2"/><text x="70" y="30" font-family="sans-serif" font-weight="900" font-size="14" fill="%23FFB800" text-anchor="middle" letter-spacing="1">TAQUARALTO</text><line x1="20" y1="36" x2="120" y2="36" stroke="%23FF5722" stroke-width="2"/></svg>'
  },
  {
    id: 's_tag_aureny',
    name: 'Tag Aureny III',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 50"><path d="M5 8 L125 5 L120 45 L8 42 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><text x="65" y="31" font-family="sans-serif" font-weight="900" font-size="15" fill="%232D2A26" text-anchor="middle">AURENY III</text></svg>'
  },
  {
    id: 's_tag_periferia_viva',
    name: 'Periferia Viva',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><rect x="4" y="6" width="132" height="38" rx="6" fill="%23FF5722"/><text x="70" y="30" font-family="sans-serif" font-weight="900" font-size="13" fill="%23FFFFFF" text-anchor="middle">PERIFERIA VIVA</text></svg>'
  },
  {
    id: 's_skinny_cap',
    name: 'Skinny Cap Traço Fino',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="%232D2A26" stroke="%23FFB800" stroke-width="4"/><circle cx="50" cy="50" r="22" fill="%23FFFFFF"/><circle cx="50" cy="50" r="6" fill="%232D2A26"/><line x1="50" y1="16" x2="50" y2="28" stroke="%23FFB800" stroke-width="3"/><line x1="50" y1="72" x2="50" y2="84" stroke="%23FFB800" stroke-width="3"/></svg>'
  },
  {
    id: 's_stencil_punho',
    name: 'Stencil Resistência',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="36" y="35" width="28" height="38" rx="4" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="28" r="14" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/><rect x="42" y="70" width="16" height="20" fill="%232D2A26"/></svg>'
  },
  {
    id: 's_splash_street',
    name: 'Respingo Neon',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="%23FFB800"/><circle cx="22" cy="35" r="8" fill="%23FF5722"/><circle cx="78" cy="40" r="9" fill="%23FFB800"/><circle cx="36" cy="80" r="7" fill="%23FF5722"/><circle cx="72" cy="74" r="6" fill="%23FFB800"/><circle cx="50" cy="18" r="5" fill="%23FF5722"/></svg>'
  },
  {
    id: 's_arara_tocantins',
    name: 'Arara do Cerrado',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 70 Q35 20 70 20 Q85 25 80 45 Q70 70 30 85 Z" fill="%230288D1" stroke="%232D2A26" stroke-width="3"/><path d="M35 50 Q55 35 75 45 Q65 70 35 80 Z" fill="%23FFB800"/><circle cx="68" cy="30" r="4" fill="%23FFFFFF"/><circle cx="68" cy="30" r="2" fill="%23000000"/><path d="M78 30 L88 35 L76 40 Z" fill="%232D2A26"/></svg>'
  },
  {
    id: 's_pequi_raiz',
    name: 'Pequi do Tocantins',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="32" ry="30" fill="%234CAF50" stroke="%232D2A26" stroke-width="4"/><ellipse cx="50" cy="55" rx="20" ry="18" fill="%23FFD700"/><circle cx="44" cy="52" r="7" fill="%23FF9800"/><circle cx="56" cy="56" r="6" fill="%23FF9800"/><path d="M50 25 C50 15 58 12 62 10" stroke="%23795548" stroke-width="5" stroke-linecap="round"/></svg>'
  },
  {
    id: 's_lago_palmas',
    name: 'Ondas do Lago',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><path d="M10 25 Q35 10 60 25 T110 25 L110 38 Q85 23 60 38 T10 38 Z" fill="%2303A9F4" stroke="%232D2A26" stroke-width="3"/><path d="M10 40 Q35 25 60 40 T110 40 L110 52 Q85 37 60 52 T10 52 Z" fill="%230288D1" stroke="%232D2A26" stroke-width="3"/></svg>'
  },
  {
    id: 's_skate_deck',
    name: 'Shape de Skate',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"><rect x="10" y="15" width="100" height="20" rx="10" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="28" cy="25" r="4" fill="%23FF5722"/><circle cx="92" cy="25" r="4" fill="%23FF5722"/><line x1="28" y1="36" x2="38" y2="42" stroke="%232D2A26" stroke-width="3"/><line x1="82" y1="36" x2="92" y2="42" stroke="%232D2A26" stroke-width="3"/><circle cx="38" cy="42" r="5" fill="%232D2A26"/><circle cx="82" cy="42" r="5" fill="%232D2A26"/></svg>'
  },
  {
    id: 's_headphone',
    name: 'Fone Beatmaker',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 55 C25 25 75 25 75 55" fill="none" stroke="%232D2A26" stroke-width="6" stroke-linecap="round"/><rect x="16" y="48" width="16" height="30" rx="6" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><rect x="68" y="48" width="16" height="30" rx="6" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><line x1="24" y1="56" x2="24" y2="70" stroke="%232D2A26" stroke-width="3"/><line x1="76" y1="56" x2="76" y2="70" stroke="%232D2A26" stroke-width="3"/></svg>'
  },
  {
    id: 's_lambe_arte',
    name: 'Lambe Arte & Luta',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><rect x="6" y="6" width="108" height="58" fill="%23FFFDE7" stroke="%232D2A26" stroke-width="4"/><text x="60" y="32" font-family="sans-serif" font-weight="900" font-size="14" fill="%23D32F2F" text-anchor="middle">ARTE É LUTA</text><text x="60" y="50" font-family="sans-serif" font-weight="900" font-size="10" fill="%232D2A26" text-anchor="middle">PALMAS - TO</text></svg>'
  },
  {
    id: 's_mic_batalha',
    name: 'Microfone da Rima',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="42" y="16" width="16" height="28" rx="8" fill="%239E9E9E" stroke="%232D2A26" stroke-width="3"/><line x1="42" y1="24" x2="58" y2="24" stroke="%232D2A26" stroke-width="2"/><line x1="42" y1="32" x2="58" y2="32" stroke="%232D2A26" stroke-width="2"/><path d="M36 32 C36 50 64 50 64 32" fill="none" stroke="%232D2A26" stroke-width="3"/><line x1="50" y1="50" x2="50" y2="72" stroke="%232D2A26" stroke-width="4"/><rect x="40" y="72" width="20" height="8" rx="3" fill="%23FFB800" stroke="%232D2A26" stroke-width="2"/></svg>'
  },
  {
    id: 's_coroa_basquiat',
    name: 'Coroa Street 3 Pontas',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M12 70 L88 70 L80 25 L50 48 L20 25 Z" fill="%23FFD700" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/></svg>'
  },
  {
    id: 's_estrela_brilho',
    name: 'Estrela Flash',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 8 Q50 50 92 50 Q50 50 50 92 Q50 50 8 50 Q50 50 50 8 Z" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/></svg>'
  },
  {
    id: 's_fita_colagem',
    name: 'Fita Crepe Lambe',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><path d="M10 8 L110 5 L106 32 L6 35 Z" fill="%23FFF59D" opacity="0.85" stroke="%23FBC02D" stroke-width="2"/></svg>'
  },
  {
    id: 's_tag_setor_sul',
    name: 'Tag Setor Sul',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><rect x="5" y="6" width="130" height="38" rx="8" fill="%232D2A26" stroke="%2300E5FF" stroke-width="2"/><text x="70" y="30" font-family="sans-serif" font-weight="900" font-size="14" fill="%2300E5FF" text-anchor="middle">SETOR SUL</text><line x1="25" y1="36" x2="115" y2="36" stroke="%23FF5722" stroke-width="2"/></svg>'
  },
  {
    id: 's_tag_bertaville',
    name: 'Tag Bertaville',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><path d="M6 10 L134 5 L128 44 L10 40 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/><text x="70" y="31" font-family="sans-serif" font-weight="900" font-size="13" fill="%23FFFFFF" text-anchor="middle">BERTAVILLE</text></svg>'
  },
  {
    id: 's_tag_santa_barbara',
    name: 'Tag Sta. Bárbara',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50"><rect x="5" y="6" width="140" height="38" rx="6" fill="%232D2A26" stroke="%23FFD700" stroke-width="3"/><text x="75" y="30" font-family="sans-serif" font-weight="900" font-size="13" fill="%23FFD700" text-anchor="middle">STA. BÁRBARA</text></svg>'
  },
  {
    id: 's_tag_lago_sul',
    name: 'Tag Lago Sul',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 50"><rect x="5" y="6" width="120" height="38" rx="8" fill="%230288D1" stroke="%23FFFFFF" stroke-width="2"/><text x="65" y="30" font-family="sans-serif" font-weight="900" font-size="14" fill="%23FFFFFF" text-anchor="middle">LAGO SUL</text></svg>'
  },
  {
    id: 's_tag_canaa',
    name: 'Tag Jardim Canaã',
    category: 'tag',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50"><path d="M8 8 L132 10 L126 42 L12 40 Z" fill="%2343A047" stroke="%232D2A26" stroke-width="3"/><text x="70" y="30" font-family="sans-serif" font-weight="900" font-size="13" fill="%23FFFFFF" text-anchor="middle">JD. CANAÃ</text></svg>'
  },
  {
    id: 's_spray_mascara',
    name: 'Respirador Street',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 40 Q50 25 75 40 L70 75 Q50 90 30 75 Z" fill="%2337474F" stroke="%232D2A26" stroke-width="4"/><circle cx="34" cy="62" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="66" cy="62" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><path d="M42 45 L58 45" stroke="%23FF5722" stroke-width="3"/></svg>'
  },
  {
    id: 's_posca_15mm',
    name: 'Marcador Posca 15mm',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect x="10" y="10" width="80" height="20" rx="4" fill="%232D2A26" stroke="%23FFB800" stroke-width="2"/><rect x="90" y="12" width="20" height="16" rx="2" fill="%23FF5722"/><text x="50" y="24" font-family="sans-serif" font-weight="900" font-size="9" fill="%23FFFFFF" text-anchor="middle">POSCA 15mm</text></svg>'
  },
  {
    id: 's_carimbo_arte_livre',
    name: 'Selo Arte Não É Crime',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" fill="none" stroke="%23E53935" stroke-width="4" stroke-dasharray="6 3"/><circle cx="55" cy="55" r="38" fill="%232D2A26"/><text x="55" y="50" font-family="sans-serif" font-weight="900" font-size="10" fill="%23E53935" text-anchor="middle">ARTE DE RUA</text><text x="55" y="65" font-family="sans-serif" font-weight="900" font-size="12" fill="%23FFFFFF" text-anchor="middle">NÃO É CRIME</text></svg>'
  },
  {
    id: 's_lobo_guara_street',
    name: 'Lobo Guará Street',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="30,20 45,45 20,50" fill="%23E65100" stroke="%232D2A26" stroke-width="3"/><polygon points="70,20 80,50 55,45" fill="%23E65100" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="60" r="28" fill="%23FF9800" stroke="%232D2A26" stroke-width="4"/><polygon points="50,68 42,60 58,60" fill="%232D2A26"/><circle cx="38" cy="52" r="4" fill="%232D2A26"/><circle cx="62" cy="52" r="4" fill="%232D2A26"/></svg>'
  }
];

export const ANIMATED_STICKERS: Sticker[] = [
  { 
    id: 'as1', 
    name: 'Chama Viva em Loop', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes flamePulse{0%,100%{transform:scale(1) translateY(0);fill:%23FF5722;}50%{transform:scale(1.08) translateY(-4px);fill:%23FF9800;}}@keyframes innerFlame{0%,100%{transform:scale(0.9);fill:%23FFEB3B;}50%{transform:scale(1.1);fill:%23FFD700;}}.f-out{transform-origin:50%25 90%25;animation:flamePulse 0.8s infinite ease-in-out;}.f-in{transform-origin:50%25 80%25;animation:innerFlame 0.8s infinite ease-in-out;}</style><path class="f-out" d="M50 15 C40 35 25 45 25 65 C25 80 35 90 50 90 C65 90 75 80 75 65 C75 45 60 35 50 15 Z" stroke="%232D2A26" stroke-width="4"/><path class="f-in" d="M50 40 C45 52 38 60 38 72 C38 80 43 85 50 85 C57 85 62 80 62 72 C62 60 55 52 50 40 Z"/></svg>' 
  },
  { 
    id: 'as2', 
    name: 'Raio Neon Elétrico', 
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes boltGlow{0%,100%{filter:drop-shadow(0 0 2px %23FFD700);transform:scale(0.96);}50%{filter:drop-shadow(0 0 12px %23FF5722);transform:scale(1.06);}}.bolt{transform-origin:50%25 50%25;animation:boltGlow 0.6s infinite ease-in-out;}</style><polygon class="bolt" points="56,8 24,54 48,54 40,92 78,44 54,44" fill="%23FFEB3B" stroke="%23FF5722" stroke-width="4" stroke-linejoin="round"/></svg>' 
  },
  { 
    id: 'as3', 
    name: 'Spray Glow & Névoa', 
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sprayMist{0%,100%{opacity:0.3;transform:translateY(0);}50%{opacity:1;transform:translateY(-6px);}}.mist{animation:sprayMist 0.7s infinite alternate;}</style><rect x="35" y="35" width="30" height="52" rx="6" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><rect x="42" y="22" width="16" height="13" rx="3" fill="%23FF5722"/><circle cx="50" cy="62" r="8" fill="%23FFFFFF"/><g class="mist"><circle cx="50" cy="12" r="4" fill="%23FFB800"/><circle cx="62" cy="14" r="3" fill="%23FF5722"/><circle cx="38" cy="14" r="3" fill="%23FF5722"/></g></svg>' 
  },
  { 
    id: 'as4', 
    name: 'Coração Pulsar 808', 
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes heartBeat{0%,100%{transform:scale(0.92);}15%{transform:scale(1.15);}30%{transform:scale(0.96);}45%{transform:scale(1.08);}}@keyframes waveOut{0%{r:20;opacity:0.9;}100%{r:46;opacity:0;}}.hb{transform-origin:50%25 50%25;animation:heartBeat 1s infinite cubic-bezier(0.25, 1, 0.5, 1);}.pulse-ring{animation:waveOut 1s infinite ease-out;}</style><circle class="pulse-ring" cx="50" cy="50" r="20" fill="none" stroke="%23E91E63" stroke-width="3"/><path class="hb" d="M50 85 C20 58 12 30 35 20 C46 16 50 25 50 25 C50 25 54 16 65 20 C88 30 80 58 50 85 Z" fill="%23E91E63" stroke="%232D2A26" stroke-width="4"/><circle cx="40" cy="35" r="4" fill="%23FFFFFF"/></svg>' 
  },
  {
    id: 'as5',
    name: 'Estrela Flash Sparkle',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes spinPulse{0%{transform:rotate(0deg) scale(0.9);fill:%23FFB800;}50%{transform:rotate(180deg) scale(1.15);fill:%23FFF59D;}100%{transform:rotate(360deg) scale(0.9);fill:%23FFB800;}}.star{transform-origin:50%25 50%25;animation:spinPulse 1.2s infinite linear;}</style><path class="star" d="M50 8 Q50 50 92 50 Q50 50 50 92 Q50 50 8 50 Q50 50 50 8 Z" stroke="%232D2A26" stroke-width="4"/></svg>'
  },
  {
    id: 'as6',
    name: 'Sol Nascente Giratório',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sunRotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}@keyframes corePulse{0%,100%{transform:scale(0.9);}50%{transform:scale(1.1);}}.rays{transform-origin:50%25 50%25;animation:sunRotate 8s infinite linear;}.core{transform-origin:50%25 50%25;animation:corePulse 1.2s infinite ease-in-out;}</style><g class="rays"><circle cx="50" cy="50" r="32" fill="none" stroke="%23FFB800" stroke-width="6" stroke-dasharray="14 10"/><path d="M50 8 L50 20 M50 80 L50 92 M8 50 L20 50 M80 50 L92 50 M20 20 L28 28 M72 72 L80 80 M80 20 L72 28 M28 72 L20 80" stroke="%23FF5722" stroke-width="4" stroke-linecap="round"/></g><circle class="core" cx="50" cy="50" r="18" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/></svg>'
  },
  {
    id: 'as_eq_beat',
    name: 'Equalizador Beatbox 808',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes bar1{0%,100%{height:20px;y:65px;}50%{height:65px;y:20px;}}@keyframes bar2{0%,100%{height:60px;y:25px;}50%{height:25px;y:60px;}}@keyframes bar3{0%,100%{height:35px;y:50px;}50%{height:70px;y:15px;}}@keyframes bar4{0%,100%{height:50px;y:35px;}50%{height:15px;y:70px;}}@keyframes bar5{0%,100%{height:25px;y:60px;}50%{height:55px;y:30px;}}.b1{animation:bar1 0.6s infinite ease-in-out;}.b2{animation:bar2 0.75s infinite ease-in-out 0.1s;}.b3{animation:bar3 0.65s infinite ease-in-out 0.2s;}.b4{animation:bar4 0.8s infinite ease-in-out 0.15s;}.b5{animation:bar5 0.7s infinite ease-in-out 0.25s;}</style><rect class="b1" x="12" y="65" width="12" height="20" rx="4" fill="%23FF5722"/><rect class="b2" x="28" y="25" width="12" height="60" rx="4" fill="%23FFB800"/><rect class="b3" x="44" y="50" width="12" height="35" rx="4" fill="%2300E5FF"/><rect class="b4" x="60" y="35" width="12" height="50" rx="4" fill="%23E91E63"/><rect class="b5" x="76" y="60" width="12" height="25" rx="4" fill="%2376FF03"/></svg>'
  },
  {
    id: 'as_olho_pisca',
    name: 'Olho da Visão Neon',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><style>@keyframes blink{0%,90%,100%{transform:scaleY(1);}95%{transform:scaleY(0.08);}}@keyframes pupilGlow{0%,100%{filter:drop-shadow(0 0 2px %2300E5FF);r:7;}50%{filter:drop-shadow(0 0 8px %23FFD700);r:9;}}.eye-lid{transform-origin:50%25 50%25;animation:blink 2.8s infinite ease-in-out;}.pupil{animation:pupilGlow 1.4s infinite ease-in-out;}</style><g class="eye-lid"><path d="M10 40 Q50 10 90 40 Q50 70 10 40 Z" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="5"/><circle cx="50" cy="40" r="18" fill="%232D2A26"/><circle class="pupil" cx="50" cy="40" r="8" fill="%2300E5FF"/><circle cx="46" cy="36" r="3" fill="%23FFFFFF"/></g></svg>'
  },
  {
    id: 'as_coroa_float',
    name: 'Coroa Street Flutuante',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes crownFloat{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-10px) rotate(2deg);}}@keyframes spark{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}.crown{transform-origin:50%25 60%25;animation:crownFloat 1.8s infinite ease-in-out;}.sp1{animation:spark 1s infinite ease-in-out;}.sp2{animation:spark 1.4s infinite ease-in-out 0.5s;}</style><g class="crown"><path d="M15 75 L85 75 L78 30 L50 52 L22 30 Z" fill="%23FFD700" stroke="%232D2A26" stroke-width="5" stroke-linejoin="round"/><circle cx="22" cy="24" r="5" fill="%23FF5722"/><circle cx="50" cy="22" r="6" fill="%23FF5722"/><circle cx="78" cy="24" r="5" fill="%23FF5722"/><line x1="20" y1="65" x2="80" y2="65" stroke="%232D2A26" stroke-width="3"/></g><polygon class="sp1" points="15,18 18,12 21,18 27,21 21,24 18,30 15,24 9,21" fill="%23FFB800"/><polygon class="sp2" points="80,15 83,9 86,15 92,18 86,21 83,27 80,21 74,18" fill="%23FF5722"/></svg>'
  },
  {
    id: 'as_drip_loop',
    name: 'Drip Tinta Escorrendo',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes dropFall{0%{transform:translateY(0) scaleY(1);opacity:1;}70%{transform:translateY(28px) scaleY(1.3);opacity:1;}100%{transform:translateY(36px) scale(0.3);opacity:0;}}@keyframes dripSpread{0%,100%{transform:scaleX(0.95);}50%{transform:scaleX(1.05);}}.splat{transform-origin:50%25 30%25;animation:dripSpread 1.6s infinite ease-in-out;}.d1{animation:dropFall 1.1s infinite cubic-bezier(0.55, 0.055, 0.675, 0.19);}.d2{animation:dropFall 1.4s infinite cubic-bezier(0.55, 0.055, 0.675, 0.19) 0.5s;}</style><g class="splat"><path d="M10 20 Q50 5 90 20 Q85 45 65 38 Q50 48 35 38 Q15 45 10 20 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><path d="M28 35 Q30 55 30 60 Q28 65 24 60 Z" fill="%23FF5722"/><path d="M70 35 Q72 58 72 65 Q68 70 66 64 Z" fill="%23FF5722"/></g><ellipse class="d1" cx="30" cy="58" rx="4" ry="7" fill="%23FF5722"/><ellipse class="d2" cx="71" cy="62" rx="4" ry="8" fill="%23FF5722"/></svg>'
  },
  {
    id: 'as_fita_rodando',
    name: 'Fita K7 em Rotação',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 75"><style>@keyframes spinReel{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.reel1{transform-origin:38px 38px;animation:spinReel 2s infinite linear;}.reel2{transform-origin:72px 38px;animation:spinReel 2s infinite linear;}</style><rect x="5" y="8" width="100" height="60" rx="8" fill="%232D2A26" stroke="%23FFB800" stroke-width="4"/><rect x="20" y="20" width="70" height="34" rx="4" fill="%23FFFFFF"/><circle cx="38" cy="38" r="12" fill="%232D2A26"/><circle cx="72" cy="38" r="12" fill="%232D2A26"/><g class="reel1"><circle cx="38" cy="38" r="6" fill="%23FF5722"/><line x1="38" y1="28" x2="38" y2="48" stroke="%23FFFFFF" stroke-width="2"/><line x1="28" y1="38" x2="48" y2="38" stroke="%23FFFFFF" stroke-width="2"/></g><g class="reel2"><circle cx="72" cy="38" r="6" fill="%23FF5722"/><line x1="72" y1="28" x2="72" y2="48" stroke="%23FFFFFF" stroke-width="2"/><line x1="62" y1="38" x2="82" y2="38" stroke="%23FFFFFF" stroke-width="2"/></g><polygon points="25,68 35,55 75,55 85,68" fill="%23FF5722"/></svg>'
  },
  {
    id: 'as_megafone_ondas',
    name: 'Megafone Ondas Sonoras',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 90"><style>@keyframes soundWave1{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1);}}@keyframes soundWave2{0%,100%{opacity:0.1;transform:scale(0.7);}60%{opacity:1;transform:scale(1.1);}}@keyframes megaShake{0%,100%{transform:rotate(0deg);}50%{transform:rotate(-4deg) scale(1.02);}}.mega{transform-origin:22px 55px;animation:megaShake 0.6s infinite ease-in-out;}.w1{transform-origin:58px 45px;animation:soundWave1 0.8s infinite ease-in-out;}.w2{transform-origin:58px 45px;animation:soundWave2 0.8s infinite ease-in-out 0.2s;}</style><g class="mega"><polygon points="22,35 58,15 58,75 22,55" fill="%23FFB800" stroke="%232D2A26" stroke-width="4"/><rect x="12" y="36" width="10" height="18" rx="3" fill="%23FF5722" stroke="%232D2A26" stroke-width="3"/><path d="M50 45 L42 75 L32 70" fill="none" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/></g><path class="w1" d="M68 30 Q78 45 68 60" fill="none" stroke="%23FF5722" stroke-width="5" stroke-linecap="round"/><path class="w2" d="M80 20 Q96 45 80 70" fill="none" stroke="%23FFB800" stroke-width="6" stroke-linecap="round"/></svg>'
  },
  {
    id: 'as_seta_bounce',
    name: 'Seta Graffiti Bounce',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 65"><style>@keyframes arrowBounce{0%,100%{transform:translateX(0);}50%{transform:translateX(14px);}}.arrow{animation:arrowBounce 0.7s infinite cubic-bezier(0.25, 1, 0.5, 1);}</style><g class="arrow"><path d="M10 24 L60 24 L50 8 L95 32 L50 56 L60 40 L10 40 Z" fill="%23FF5722" stroke="%232D2A26" stroke-width="4" stroke-linejoin="round"/><circle cx="25" cy="32" r="4" fill="%23FFB800"/><circle cx="42" cy="32" r="4" fill="%23FFB800"/></g></svg>'
  },
  {
    id: 'as_smiley_glitch',
    name: 'Smiley Street Glitch',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes glitchMove{0%,100%{transform:translate(0,0);}20%{transform:translate(-3px,2px);}40%{transform:translate(3px,-2px);}60%{transform:translate(-2px,-1px);}80%{transform:translate(2px,1px);}}@keyframes colorShift{0%,100%{fill:%23FFB800;}50%{fill:%23FF5722;}}.face{transform-origin:50%25 50%25;animation:glitchMove 0.8s infinite steps(2,start);}.bg-circle{animation:colorShift 1.6s infinite alternate;}</style><g class="face"><circle class="bg-circle" cx="50" cy="50" r="40" fill="%23FFB800" stroke="%232D2A26" stroke-width="5"/><line x1="30" y1="32" x2="42" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="42" y1="32" x2="30" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="58" y1="32" x2="70" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="32" x2="58" y2="44" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><path d="M28 62 Q50 82 72 62" fill="none" stroke="%232D2A26" stroke-width="6" stroke-linecap="round"/></g></svg>'
  },
  {
    id: 'as_radar_pulso',
    name: 'Pulso Vibe Sonar',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes radarWave{0%{r:10;opacity:1;stroke-width:6;}100%{r:46;opacity:0;stroke-width:1;}}.r1{animation:radarWave 1.6s infinite ease-out;}.r2{animation:radarWave 1.6s infinite ease-out 0.5s;}.r3{animation:radarWave 1.6s infinite ease-out 1.0s;}</style><circle cx="50" cy="50" r="10" fill="%23FF5722"/><circle class="r1" cx="50" cy="50" r="10" fill="none" stroke="%23FFB800"/><circle class="r2" cx="50" cy="50" r="10" fill="none" stroke="%23FF5722"/><circle class="r3" cx="50" cy="50" r="10" fill="none" stroke="%2300E5FF"/></svg>'
  },
  {
    id: 'as_skate_spin',
    name: 'Roda Skate Rotação',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes wheelSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.spin-wheel{transform-origin:50%25 50%25;animation:wheelSpin 0.7s infinite linear;}</style><circle cx="50" cy="50" r="42" fill="%23FFFFFF" stroke="%232D2A26" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="%23FF5722"/><g class="spin-wheel"><circle cx="50" cy="50" r="14" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/><circle cx="50" cy="22" r="5" fill="%232D2A26"/><circle cx="78" cy="50" r="5" fill="%232D2A26"/><circle cx="50" cy="78" r="5" fill="%232D2A26"/><circle cx="22" cy="50" r="5" fill="%232D2A26"/><line x1="50" y1="36" x2="50" y2="64" stroke="%232D2A26" stroke-width="3"/><line x1="36" y1="50" x2="64" y2="50" stroke="%232D2A26" stroke-width="3"/></g></svg>'
  },
  {
    id: 'as_fagulhas_cerrado',
    name: 'Fagulhas Brasa Cerrado',
    category: 'cerrado',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes sparkFloat1{0%{transform:translate(0,0) scale(0.6);opacity:0;}40%{opacity:1;}100%{transform:translate(-8px,-55px) scale(1.1);opacity:0;}}@keyframes sparkFloat2{0%{transform:translate(0,0) scale(0.6);opacity:0;}40%{opacity:1;}100%{transform:translate(10px,-65px) scale(1);opacity:0;}}@keyframes sparkFloat3{0%{transform:translate(0,0) scale(0.4);opacity:0;}40%{opacity:1;}100%{transform:translate(-2px,-75px) scale(1.2);opacity:0;}}.spk1{animation:sparkFloat1 1.2s infinite ease-out;}.spk2{animation:sparkFloat2 1.5s infinite ease-out 0.4s;}.spk3{animation:sparkFloat3 1.3s infinite ease-out 0.8s;}</style><ellipse cx="50" cy="85" rx="35" ry="10" fill="%232D2A26"/><circle cx="50" cy="82" r="14" fill="%23FF5722"/><circle cx="50" cy="82" r="8" fill="%23FFB800"/><polygon class="spk1" points="40,75 42,70 44,75 49,77 44,79 42,84 40,79 35,77" fill="%23FFD700"/><polygon class="spk2" points="60,75 62,70 64,75 69,77 64,79 62,84 60,79 55,77" fill="%23FF5722"/><polygon class="spk3" points="50,70 52,65 54,70 59,72 54,74 52,79 50,74 45,72" fill="%23FFF59D"/></svg>'
  },
  {
    id: 'as_disco_vinil',
    name: 'Vinil HipHop Scratch',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes vinylSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}.vinyl{transform-origin:50%25 50%25;animation:vinylSpin 1.8s infinite linear;}</style><g class="vinyl"><circle cx="50" cy="50" r="45" fill="%231E1E1E" stroke="%232D2A26" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23333333" stroke-width="1.5"/><circle cx="50" cy="50" r="32" fill="none" stroke="%23444444" stroke-width="1.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="%23333333" stroke-width="1.5"/><circle cx="50" cy="50" r="16" fill="%23FF5722"/><circle cx="50" cy="50" r="8" fill="%23FFB800"/><circle cx="50" cy="50" r="3" fill="%23FFFFFF"/></g></svg>'
  },
  {
    id: 'as_neon_pmw',
    name: 'Letreiro Neon PMW VIVE',
    category: 'urban',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 65"><style>@keyframes neonFlicker{0%,19%,21%,23%,25%,54%,56%,100%{filter:drop-shadow(0 0 6px %2300E5FF) drop-shadow(0 0 14px %2300E5FF);opacity:1;}20%,24%,55%{filter:none;opacity:0.35;}}.neon-text{font-family:sans-serif;font-weight:900;font-size:20px;fill:%23FFFFFF;stroke:%2300E5FF;stroke-width:1.5;animation:neonFlicker 2s infinite;}</style><rect x="5" y="6" width="120" height="53" rx="10" fill="%23121212" stroke="%232D2A26" stroke-width="3"/><text class="neon-text" x="65" y="40" text-anchor="middle" letter-spacing="2">PMW VIVE</text></svg>'
  },
  {
    id: 'as_halo_neon',
    name: 'Auréola Halo Neon',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70"><style>@keyframes haloBob{0%,100%{transform:translateY(0) scaleY(1);}50%{transform:translateY(-8px) scaleY(1.06);}}@keyframes haloGlow{0%,100%{filter:drop-shadow(0 0 4px %23FFD700);stroke:%23FFD700;}50%{filter:drop-shadow(0 0 14px %23FF5722);stroke:%23FF5722;}}.halo{transform-origin:60px 35px;animation:haloBob 1.6s infinite ease-in-out;}.halo-ring{animation:haloGlow 1.2s infinite ease-in-out;}</style><g class="halo"><ellipse class="halo-ring" cx="60" cy="35" rx="46" ry="18" fill="none" stroke-width="6"/><ellipse cx="60" cy="35" rx="46" ry="18" fill="none" stroke="%23FFFFFF" stroke-width="2"/></g></svg>'
  },
  {
    id: 'as_rolo_loop',
    name: 'Rolo de Tinta Rastro Vivo',
    category: 'spray',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><style>@keyframes rollerPaint{0%,100%{transform:translateX(0);}50%{transform:translateX(24px);}}@keyframes paintTrail{0%,100%{width:35px;}50%{width:60px;}}.roller{animation:rollerPaint 1.2s infinite ease-in-out;}.trail{animation:paintTrail 1.2s infinite ease-in-out;}</style><rect class="trail" x="25" y="22" width="35" height="24" rx="4" fill="%23FFB800" opacity="0.8"/><g class="roller"><rect x="25" y="20" width="46" height="26" rx="6" fill="%23FF5722" stroke="%232D2A26" stroke-width="4"/><path d="M71 33 L85 33 L85 62 L55 62 L55 88" fill="none" stroke="%232D2A26" stroke-width="5" stroke-linecap="round"/><rect x="50" y="70" width="10" height="22" rx="3" fill="%23FFB800" stroke="%232D2A26" stroke-width="3"/></g></svg>'
  },
  {
    id: 'as_alvo_giro',
    name: 'Mira Street Giroscópica',
    category: 'shapes',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@keyframes spinClockwise{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}@keyframes spinCounter{0%{transform:rotate(0deg);}100%{transform:rotate(-360deg);}}.cw{transform-origin:50%25 50%25;animation:spinClockwise 3s infinite linear;}.ccw{transform-origin:50%25 50%25;animation:spinCounter 2s infinite linear;}</style><circle class="cw" cx="50" cy="50" r="38" fill="none" stroke="%23FFB800" stroke-width="5" stroke-dasharray="35 15 20 10"/><circle class="ccw" cx="50" cy="50" r="24" fill="none" stroke="%23FF5722" stroke-width="4" stroke-dasharray="25 10 15 8"/><circle cx="50" cy="50" r="8" fill="%2300E5FF"/><circle cx="50" cy="50" r="3" fill="%23FFFFFF"/></svg>'
  }
];

export const INITIAL_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'challenge_taquari',
    title: 'Cores & Contrastes do Taquari',
    subtitle: 'Desafio Semanal #1 • Ativo',
    theme: 'Muralismo, estética periférica e luz do entardecer',
    description: 'Capture ou remixe obras visuais celebrando o Setor Taquari. Destaque as cores terrosas do cerrado, tipografia marcante e a vivência da comunidade.',
    bannerUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-09-08',
    endDate: '2026-09-15',
    rewardResponsa: 35,
    rewardBadgeId: 'weekly_warrior',
    tags: ['#Taquari', '#Cerrado', '#DesafioSemanal', '#LuzDoEntardecer'],
    featuredNeighborhood: 'Setor Taquari',
    status: 'active',
    rules: [
      'Foto base capturada em Palmas ou remix autoral com stickers e filtros',
      'Incluir a hashtag oficial #Taquari ou #DesafioSemanal na obra',
      'Votação popular e júri comunitário na Arena de Batalhas'
    ]
  },
  {
    id: 'challenge_aureny_typo',
    title: 'Tipografia & Bomb no Aureny',
    subtitle: 'Desafio Semanal #2 • Ativo',
    theme: 'Caligrafia urbana, letras marcadas e tags de respeito',
    description: 'Transforme as paredes e cenários do Jardim Aureny III com caligrafia urbana expressiva, letras autorais, lambes virtuais e stickers de peso.',
    bannerUrl: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-09-07',
    endDate: '2026-09-14',
    rewardResponsa: 30,
    rewardBadgeId: 'tagger_pro',
    tags: ['#Aureny', '#Tipografia', '#StreetTag', '#QuebradaViva'],
    featuredNeighborhood: 'Jardim Aureny III',
    status: 'active',
    rules: [
      'Foco visual em letras, caligrafia, bombs ou tipografia expressiva',
      'Válido para remixes feitos no Editor com tags e textos estilizados',
      'Respeito às diretrizes comunitárias de não-violência'
    ]
  },
  {
    id: 'challenge_graciosa_sunset',
    title: 'Pôr do Sol & Silhuetas da Graciosa',
    subtitle: 'Desafio Semanal #3 • Em Breve',
    theme: 'O famoso pôr do sol tocantinense fusionado com street art digital',
    description: 'Prepare sua visão para a Praia da Graciosa e Lago de Palmas: mescle silhuetas urbanas, skate, hip-hop e os tons alaranjados do pôr do sol.',
    bannerUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    rewardResponsa: 40,
    rewardBadgeId: 'cerrado_roots',
    tags: ['#Graciosa', '#SunsetPalmas', '#Silhuetas', '#LagoDePalmas'],
    featuredNeighborhood: 'Praia da Graciosa',
    status: 'upcoming',
    rules: [
      'Inscrições abrem na próxima semana',
      'Prêmio especial para o remix com mais vibes e vitórias na arena'
    ]
  }
];

export const STREET_FONTS = [
  { id: 'montserrat', name: 'Montserrat', family: '"Montserrat", sans-serif' },
  { id: 'marker', name: 'Graffiti Marker', family: '"Permanent Marker", cursive' },
  { id: 'bungee', name: 'Urban Inline', family: '"Bungee Inline", cursive' }
];

export const PRESET_TAGS = ['#Graffiti', '#Cerrado', '#Taquaralto', '#Aureny', '#Taquari', '#Rua', '#PMW', '#DesafioSemanal'];

export const PALMAS_NEIGHBORHOODS = [
  'Taquaralto',
  'Jardim Aureny I',
  'Jardim Aureny II',
  'Jardim Aureny III',
  'Jardim Aureny IV',
  'Setor Taquari',
  'Morada do Sol',
  'Santa Bárbara',
  'Bela Vista',
  'Setor Sul',
  'Praia da Graciosa',
  'Plano Diretor Sul',
  'Plano Diretor Norte',
  'Taquaruçu',
  'Buritirana',
  'Outro Setor PMW'
];

export const INITIAL_BRANDED_CHALLENGES: BrandedChallenge[] = [
  {
    id: 'branded_challenge_tintas_tocantins',
    title: 'Desafio Tintas Tocantins • Cores do Cerrado Vivo',
    description: 'Transforme os muros e a arquitetura periférica de Palmas utilizando a vibrante paleta solar do Cerrado tocantinense (amarelos intensos, terracota, verdes e azuis profundos).',
    sponsor: {
      id: 'sponsor_tintas_tocantins',
      name: 'Tintas Tocantins',
      logoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=80',
      brandColor: '#FF9800',
      websiteUrl: 'https://tintastocantins.com.br'
    },
    prizeDescription: 'R$ 2.000 em Bolsa de Fomento Criativo + Kit Profissional com 24 Latas de Spray Premium & Caps Especiais',
    rewardVibePoints: 250,
    bannerUrl: 'https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&w=1200&q=80',
    active: true,
    startDate: '2026-09-10',
    endDate: '2026-09-30',
    submissionsCount: 14,
    featuredNeighborhood: 'Taquaralto & Região Sul',
    rules: [
      'Remixes criados no Estúdio UPMM com foco nas cores do Cerrado',
      'Pelo menos 1 sticker da coleção oficial Tintas Tocantins ou textura de tinta',
      'Incentivo total ao peer-review e respeito à comunidade'
    ],
    tags: ['#TintasTocantins', '#CoresDoCerrado', '#TaquaraltoViva', '#StreetArtPMW']
  },
  {
    id: 'branded_challenge_banco_criativo',
    title: 'Desafio Banco Criativo PMW • Muros do Futuro',
    description: 'Conectando inovação periférica e arte visual: crie remixes explorando o futuro dos bairros de Palmas, sua juventude e sua potência cultural.',
    sponsor: {
      id: 'sponsor_banco_criativo',
      name: 'Banco Criativo Tocantins',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=160&q=80',
      brandColor: '#00E5FF',
      websiteUrl: 'https://bancocriativotocantins.org'
    },
    prizeDescription: 'R$ 1.500 em Vale-Equipamentos Tecnológicos (Tablet de Desenho) + Exposição Digital no Hub Cultural',
    rewardVibePoints: 180,
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    active: true,
    startDate: '2026-09-12',
    endDate: '2026-10-05',
    submissionsCount: 9,
    featuredNeighborhood: 'Jardim Aureny III',
    rules: [
      'Inovação visual, colagens e elementos futuristas combinados com o cotidiano',
      'Aberto a todos os usuários da UPMM de qualquer nível'
    ],
    tags: ['#MurosDoFuturo', '#BancoCriativo', '#AurenyDigital', '#ArteFuturo']
  }
];

export const INITIAL_BRANDED_PACKS: BrandedAssetPack[] = [
  {
    id: 'pack_tintas_tocantins_spray',
    title: 'Pack Especial Tintas Tocantins • Street Drip & Caps',
    sponsor: {
      id: 'sponsor_tintas_tocantins',
      name: 'Tintas Tocantins',
      logoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=160&q=80',
      brandColor: '#FF9800',
      websiteUrl: 'https://tintastocantins.com.br'
    },
    active: true,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    usageCount: 42,
    description: 'Coleção oficial com latas de spray estilizadas, respingos de tinta de alta viscosidade, carimbos urbanos e texturas de escorrido com a identidade das cores tocantinenses.',
    items: [
      {
        id: 'tt_spray_gold',
        name: 'Spray Tintas Tocantins Dourado Sol',
        category: 'Packs em Parceria',
        type: 'static_sticker',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><rect x="30" y="45" width="40" height="75" rx="8" fill="%23FF9800" stroke="%232D2A26" stroke-width="4"/><rect x="40" y="26" width="20" height="20" rx="4" fill="%232D2A26"/><circle cx="50" cy="20" r="6" fill="%23FFFFFF"/><path d="M30 65 L70 65 L70 85 L30 85 Z" fill="%232D2A26"/><text x="50" y="78" font-family="sans-serif" font-weight="900" font-size="7" fill="%23FF9800" text-anchor="middle">TOCANTINS</text><circle cx="50" cy="102" r="10" fill="%23FFE082"/></svg>',
        tags: ['tintas tocantins', 'spray', 'lata', 'laranja', 'dourado', 'patrocinado'],
        aspectRatio: 0.77,
        packId: 'pack_tintas_tocantins_spray',
        sponsorName: 'Tintas Tocantins'
      },
      {
        id: 'tt_drip_splash',
        name: 'Escorrido Drip Solar TT',
        category: 'Packs em Parceria',
        type: 'static_sticker',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 90"><path d="M10 20 Q35 5 70 20 T130 15 L130 35 Q115 50 110 75 Q105 85 95 65 Q85 85 75 55 Q65 90 55 60 Q45 80 35 45 Q20 60 10 35 Z" fill="%23FF9800" stroke="%232D2A26" stroke-width="4"/><circle cx="65" cy="85" r="5" fill="%23FF9800"/><circle cx="108" cy="88" r="4" fill="%23FF9800"/></svg>',
        tags: ['drip', 'escorrido', 'tinta', 'laranja', 'tintas tocantins'],
        aspectRatio: 1.55,
        packId: 'pack_tintas_tocantins_spray',
        sponsorName: 'Tintas Tocantins'
      },
      {
        id: 'tt_fatcap_tag',
        name: 'Selo Fat Cap Pro TT',
        category: 'Packs em Parceria',
        type: 'static_sticker',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="%232D2A26" stroke="%23FF9800" stroke-width="6"/><circle cx="50" cy="50" r="32" fill="%23FF9800"/><text x="50" y="46" font-family="sans-serif" font-weight="900" font-size="12" fill="%232D2A26" text-anchor="middle">FAT CAP</text><text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="9" fill="%23FFFFFF" text-anchor="middle">PRO PMW</text></svg>',
        tags: ['fatcap', 'selo', 'tintas tocantins', 'badge', 'tag'],
        aspectRatio: 1.0,
        packId: 'pack_tintas_tocantins_spray',
        sponsorName: 'Tintas Tocantins'
      }
    ]
  },
  {
    id: 'pack_banco_criativo_future',
    title: 'Pack Banco Criativo • Conexões & Neon Tech',
    sponsor: {
      id: 'sponsor_banco_criativo',
      name: 'Banco Criativo Tocantins',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=160&q=80',
      brandColor: '#00E5FF',
      websiteUrl: 'https://bancocriativotocantins.org'
    },
    active: true,
    startDate: '2026-09-05',
    endDate: '2026-11-30',
    usageCount: 29,
    description: 'Stickers de circuitos luminosos, ícones de fomento cultural, hologramas de rua e setas de impulso criativo para potencializar sua intervenção visual.',
    items: [
      {
        id: 'bc_holo_badge',
        name: 'Holograma Impulso Criativo',
        category: 'Packs em Parceria',
        type: 'static_sticker',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><polygon points="60,10 110,35 110,85 60,110 10,85 10,35" fill="%2300E5FF" fill-opacity="0.25" stroke="%2300E5FF" stroke-width="5"/><polygon points="60,25 95,45 95,75 60,95 25,75 25,45" fill="%232D2A26" stroke="%23FFFFFF" stroke-width="3"/><text x="60" y="58" font-family="sans-serif" font-weight="900" font-size="10" fill="%2300E5FF" text-anchor="middle">IMPULSO</text><text x="60" y="72" font-family="sans-serif" font-weight="900" font-size="9" fill="%23FFB800" text-anchor="middle">CRIATIVO</text></svg>',
        tags: ['banco criativo', 'holograma', 'futurista', 'neon', 'patrocinado'],
        aspectRatio: 1.0,
        packId: 'pack_banco_criativo_future',
        sponsorName: 'Banco Criativo Tocantins'
      },
      {
        id: 'bc_cyber_arrow',
        name: 'Seta Cyber Periferia Neon',
        category: 'Packs em Parceria',
        type: 'static_sticker',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 80"><path d="M10 40 L90 40 L90 20 L135 40 L90 60 L90 40 Z" fill="%2300E5FF" stroke="%232D2A26" stroke-width="4"/><path d="M20 30 L80 30" stroke="%23FFFFFF" stroke-width="3" stroke-linecap="round"/></svg>',
        tags: ['seta', 'cyber', 'neon', 'azul', 'banco criativo'],
        aspectRatio: 1.75,
        packId: 'pack_banco_criativo_future',
        sponsorName: 'Banco Criativo Tocantins'
      }
    ]
  }
];

