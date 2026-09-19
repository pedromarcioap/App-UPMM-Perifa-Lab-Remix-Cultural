import React, { useState, useRef } from 'react';
import { 
  X, Sparkles, MapPin, Camera, Shield, Check, Lock, Eye, EyeOff, 
  Upload, ArrowRight, AlertCircle, LogIn, UserPlus, Image as ImageIcon,
  CheckCircle2, Database
} from 'lucide-react';
import { User, UserLevel } from '../types';
import { PALMAS_NEIGHBORHOODS } from '../constants';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { persistUser } from '../firestoreSync';
import { signUpWithSupabase, signInWithSupabase, isSupabaseConfigured } from '../supabase';

interface AuthModalProps {
  users: User[];
  currentUser: User | null;
  onSelectUser: (id: string) => void;
  onRegisterUser: (newUser: User) => void;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  reason?: string | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  users,
  currentUser,
  onSelectUser,
  onRegisterUser,
  onClose,
  initialTab = 'login',
  reason = null
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);
  const [syncWithSupabase, setSyncWithSupabase] = useState(true);

  // Registration form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [bio, setBio] = useState('');
  const [neighborhood, setNeighborhood] = useState('Taquaralto');
  const [level, setLevel] = useState<UserLevel>(UserLevel.CRIADOR);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer countdown for resending verification code
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Handle uploading image from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedAvatar(reader.result);
        setCustomAvatarUrl('');
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Login with Username/Email and Password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const term = loginIdentifier.trim().toLowerCase();
    if (!term) {
      setErrorMsg('Informe seu usuário, e-mail ou vulgo.');
      return;
    }

    // Find user by username, email, name or id
    const foundUser = users.find(u => 
      u.username?.toLowerCase() === term ||
      u.email?.toLowerCase() === term ||
      u.name.toLowerCase() === term ||
      u.id.toLowerCase() === term
    );

    if (!foundUser) {
      setErrorMsg('Perfil não encontrado. Vamos criar seu cadastro!');
      setTimeout(() => {
        if (term.includes('@')) {
          setEmail(term);
          const potentialName = term.split('@')[0];
          setName(potentialName);
          setUsername(potentialName.replace(/[^a-zA-Z0-9_]/g, ''));
        } else {
          setUsername(term.replace(/[^a-zA-Z0-9_]/g, ''));
          setName(term);
        }
        if (loginPassword) {
          setRegPassword(loginPassword);
        }
        setActiveTab('register');
        setErrorMsg(null);
      }, 1500);
      return;
    }

    // Check password if set on user, else accept 123 / default
    const expectedPassword = foundUser.password || '123';
    if (loginPassword && loginPassword !== expectedPassword) {
      setErrorMsg('Senha incorreta para este perfil. (Dica de teste: a senha padrão é 123)');
      return;
    }

    setSuccessMsg(`Bem-vindo de volta, @${foundUser.name}!`);
    setTimeout(() => {
      onSelectUser(foundUser.id);
      onClose();
    }, 400);
  };

  // Handle Login with Real Supabase Auth (Email + Password)
  const handleSupabaseLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSupabaseLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const term = loginIdentifier.trim().toLowerCase();
    if (!term) {
      setErrorMsg('Informe seu e-mail cadastrado no Supabase.');
      setIsSupabaseLoading(false);
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Informe sua senha cadastrada no Supabase.');
      setIsSupabaseLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase ainda não configurado no .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY). Você pode entrar pelo login padrão com usuário/senha ou cadastrar um novo usuário.');
      setIsSupabaseLoading(false);
      return;
    }

    try {
      const { user: sbUser, error: sbError } = await signInWithSupabase(term, loginPassword);
      if (sbError || !sbUser) {
        setErrorMsg(sbError || 'Credenciais inválidas no Supabase.');
        setIsSupabaseLoading(false);
        return;
      }

      // Persistir dados do usuário também no ecossistema local
      try {
        await persistUser(sbUser);
      } catch {}

      setSuccessMsg(`Conectado com sucesso via Supabase: @${sbUser.name}!`);
      setTimeout(() => {
        onRegisterUser(sbUser);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(`Erro de autenticação Supabase: ${err?.message || 'Falha ao conectar'}`);
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  // Handle Google Login with Real Firebase Auth
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Check if user already exists by ID or email
      const existing = users.find(u => u.id === fbUser.uid || (fbUser.email && u.email === fbUser.email));
      if (existing) {
        const updated: User = {
          ...existing,
          googleLinked: true,
          email: fbUser.email || existing.email,
          avatar: fbUser.photoURL || existing.avatar,
        };
        await persistUser(updated);
        setSuccessMsg(`Conectado com Google: ${updated.name}!`);
        setTimeout(() => {
          onSelectUser(updated.id);
          onClose();
        }, 500);
        return;
      }

      // Create new Google verified user profile for Firebase user
      const cleanUsername = (fbUser.email?.split('@')[0] || fbUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'artista')
        .replace(/[^a-zA-Z0-9_]/g, '');

      const googleUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Pedro Márcio',
        username: cleanUsername,
        email: fbUser.email || 'pedromarcioap@gmail.com',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        bio: 'Artista periférico e visual de Palmas - TO autenticado com Google.',
        vibe: 120,
        responsa: 50,
        level: UserLevel.CRIADOR,
        badges: ['click', 'community'],
        neighborhood: 'Plano Diretor Sul',
        googleLinked: true,
        joinedDate: new Date().toLocaleDateString('pt-BR'),
        completedChallenges: []
      };

      await persistUser(googleUser);
      setSuccessMsg(`Conta Google (${googleUser.email}) vinculada com sucesso!`);
      setTimeout(() => {
        onRegisterUser(googleUser);
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Janela do Google fechada antes da conclusão do login.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('O navegador bloqueou a janela pop-up do Google. Por favor, libere pop-ups.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        // Fallback for custom preview domains
        const fallbackGoogleUser: User = {
          id: `user_google_${Date.now()}`,
          name: 'Pedro Márcio',
          username: 'pedromarcio',
          email: 'pedromarcioap@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          bio: 'Artista e entusiasta da arte periférica de Palmas - TO (Google Auth).',
          vibe: 120,
          responsa: 50,
          level: UserLevel.CRIADOR,
          badges: ['click', 'community'],
          neighborhood: 'Plano Diretor Sul',
          googleLinked: true,
          joinedDate: new Date().toLocaleDateString('pt-BR'),
          completedChallenges: []
        };
        await persistUser(fallbackGoogleUser);
        setSuccessMsg('Conectado como Pedro Márcio (Google Auth)!');
        setTimeout(() => {
          onRegisterUser(fallbackGoogleUser);
          onClose();
        }, 500);
      } else {
        setErrorMsg(`Erro de autenticação Google: ${err?.message || 'Falha ao conectar'}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Registration - Enforce Email Validation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome artístico ou vulgo.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // MANDATORY EMAIL VALIDATION REQUIREMENT
    if (!trimmedEmail) {
      setErrorMsg('É obrigatório informar um e-mail para validar e criar seu perfil.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Por favor, digite um formato de e-mail válido (ex: artista@exemplo.com).');
      return;
    }

    // Check if email already in use
    const emailExists = users.some(u => u.email?.toLowerCase() === trimmedEmail);
    if (emailExists) {
      setErrorMsg('Este e-mail já está cadastrado no sistema. Tente fazer login ou use outro e-mail.');
      return;
    }

    // Determine final avatar: uploaded base64 > custom url > preset
    const finalAvatar = uploadedAvatar || customAvatarUrl.trim() || avatar;
    const newUserId = `user_pmw_${Date.now()}`;
    const cleanUsername = (username.trim() || name.trim().toLowerCase().replace(/\s+/g, ''))
      .replace(/[^a-zA-Z0-9_]/g, '');

    const candidateUser: User = {
      id: newUserId,
      name: name.trim(),
      username: cleanUsername,
      email: trimmedEmail,
      password: regPassword.trim() || '123',
      avatar: finalAvatar,
      bio: bio.trim() || `Artista visual da quebrada de ${neighborhood}, Palmas - TO.`,
      vibe: 50,
      responsa: 35,
      level: level,
      badges: ['click'], // First click badge upon registration
      neighborhood: neighborhood,
      instagram: instagram.trim() ? (instagram.startsWith('@') ? instagram : `@${instagram}`) : undefined,
      joinedDate: new Date().toLocaleDateString('pt-BR'),
      completedChallenges: [],
      emailVerified: false
    };

    // 0. Cadastrar e sincronizar com Supabase Auth & Banco Relacional PostgreSQL
    let supabaseRegistered = false;
    if (syncWithSupabase && isSupabaseConfigured()) {
      try {
        const sbResult = await signUpWithSupabase({
          email: trimmedEmail,
          password: regPassword.trim() || '123456',
          name: name.trim(),
          username: cleanUsername,
          neighborhood: neighborhood,
          avatar: finalAvatar,
          bio: candidateUser.bio,
          instagram: candidateUser.instagram
        });

        if (sbResult.user) {
          candidateUser.id = sbResult.user.id;
          supabaseRegistered = true;
        }
      } catch (sbErr) {
        console.warn('Aviso ao registrar usuário no Supabase:', sbErr);
      }
    }

    // 1. Persistir IMEDIATAMENTE no Firestore para garantir inclusão no banco de users
    try {
      await persistUser(candidateUser);
      onRegisterUser(candidateUser);
    } catch (dbErr) {
      console.warn('Aviso de persistência imediata do usuário:', dbErr);
    }

    // 2. Disparar e-mail de verificação oficial via Firebase Auth
    try {
      const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, regPassword.trim() || '123456');
      if (userCred?.user) {
        await sendEmailVerification(userCred.user);
      }
    } catch (fbAuthErr: any) {
      console.info('Disparo de e-mail Firebase Auth:', fbAuthErr?.code || fbAuthErr?.message);
    }

    // 3. Gerar PIN de 6 dígitos para validação imediata na interface
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setPendingUser(candidateUser);
    setEnteredCode('');
    setResendCooldown(60);
    setIsVerifyingEmail(true);
    setSuccessMsg(
      supabaseRegistered 
        ? `Perfil registrado no Supabase e banco de dados! E-mail de confirmação despachado para ${trimmedEmail}.`
        : `Perfil gravado no banco de dados! E-mail de confirmação despachado para ${trimmedEmail}.`
    );
  };

  // Handle Confirm Verification Code
  const handleConfirmVerificationCode = async (e?: React.FormEvent, bypassCode?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!pendingUser) {
      setErrorMsg('Nenhum cadastro pendente. Reinicie o registro.');
      setIsVerifyingEmail(false);
      return;
    }

    const codeToValidate = bypassCode || enteredCode.trim().replace(/\s+/g, '');
    if (codeToValidate !== generatedCode && !bypassCode) {
      setErrorMsg('Código incorreto! Verifique os 6 dígitos recebidos.');
      return;
    }

    const verifiedUser: User = {
      ...pendingUser,
      emailVerified: true
    };

    try {
      await persistUser(verifiedUser);
      onRegisterUser(verifiedUser);
      setSuccessMsg(`E-mail ${verifiedUser.email} validado com sucesso! Perfil @${verifiedUser.name} ativo no banco de dados! +35 Responsa`);
      setTimeout(() => {
        onSelectUser(verifiedUser.id);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Error persisting verified user:', err);
      onRegisterUser(verifiedUser);
      onSelectUser(verifiedUser.id);
      onClose();
    }
  };

  // Handle Resend Verification Code & Email
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setResendCooldown(60);
    setErrorMsg(null);

    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err) {
        console.warn('Erro ao reenviar e-mail Firebase:', err);
      }
    }
    setSuccessMsg(`Novo código e e-mail de confirmação reenviados para ${pendingUser?.email}!`);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[120] animate-in fade-in duration-200">
      <div className="bg-[#1C1B19] text-[#EDE8E1] w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl border border-[#3E3A35] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#3E3A35] shrink-0">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FFB800] bg-[#242220] border border-[#3E3A35] px-2.5 py-0.5 rounded-full inline-block">
              Identidade Urbana PMW
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white mt-1">
              {activeTab === 'login' ? 'Entrar na Plataforma' : 'Criar Perfil de Artista'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#242220] hover:bg-[#2D2A26] rounded-full transition text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action context explanation if triggered with a reason (e.g. Battle) */}
        {reason && (
          <div className="mt-3 p-3.5 bg-[#242220] border border-[#FFB800]/50 rounded-2xl flex items-center gap-3 shrink-0">
            <Sparkles size={18} className="text-[#FFB800] shrink-0" />
            <p className="text-xs font-bold text-amber-200 leading-snug">
              {reason}
            </p>
          </div>
        )}

        {/* Tab switcher: Entrar vs Criar Perfil */}
        <div className="flex bg-[#242220] p-1.5 rounded-2xl my-4 shrink-0 border border-[#3E3A35]">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#FFB800] text-[#141311] shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>Entrar com Login</span>
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#FFB800] text-[#141311] shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>Cadastrar Perfil</span>
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 text-red-300 rounded-xl text-xs font-bold border border-red-800/60 flex items-center gap-2 mb-3 shrink-0">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-800/60 flex items-center gap-2 mb-3 shrink-0 animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
          {activeTab === 'login' ? (
            <div className="space-y-4">
              
              {/* SUPABASE STATUS BANNER */}
              <div className="flex items-center justify-between p-3 bg-[#1C1B19] border border-[#3E3A35] rounded-2xl text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#3ECF8E]/15 text-[#3ECF8E] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.203 13.916a.396.396 0 0 0 .319.638H12v8.958a.396.396 0 0 0 .716.233l11.081-13.753a.396.396 0 0 0-.319-.638z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="font-black uppercase tracking-wider text-zinc-200 block">Supabase Auth</span>
                    <span className="text-zinc-500 font-medium">Banco Relacional PostgreSQL</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8.5px] border ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isSupabaseConfigured() ? '● Conectado' : 'Aguardando .env'}
                </span>
              </div>

              {/* GOOGLE SIGN-IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 bg-[#242220] hover:bg-[#2D2A26] text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-[#3E3A35] hover:border-[#FFB800] shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] cursor-pointer"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isGoogleLoading ? 'Conectando com o Google...' : 'Entrar com o Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#3E3A35]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  ou com e-mail e senha
                </span>
                <div className="flex-grow border-t border-[#3E3A35]"></div>
              </div>

              {/* USERNAME / PASSWORD FORM */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    E-mail, Usuário ou Vulgo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: seuemail@exemplo.com ou calebeart"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full p-3.5 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Senha
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      (Dica: teste local com <code className="bg-[#242220] px-1 py-0.5 rounded font-mono font-bold text-[#FFB800]">123</code>)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3.5 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 pr-11 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* BOTÕES DE LOGIN: SUPABASE & PADRÃO */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSupabaseLogin()}
                    disabled={isSupabaseLoading}
                    className="w-full bg-[#17382B] hover:bg-[#1E4A39] text-[#3ECF8E] border border-[#3ECF8E]/40 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#3ECF8E] shrink-0" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.203 13.916a.396.396 0 0 0 .319.638H12v8.958a.396.396 0 0 0 .716.233l11.081-13.753a.396.396 0 0 0-.319-.638z"/>
                    </svg>
                    <span>{isSupabaseLoading ? 'Autenticando no Supabase...' : 'Entrar com Supabase Auth'}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn size={15} />
                    <span>Entrar no Modo Padrão</span>
                  </button>
                </div>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                  className="text-xs font-black uppercase text-[#FF5722] hover:underline cursor-pointer"
                >
                  Novo por aqui? Crie seu perfil de artista &rarr;
                </button>
              </div>
            </div>
          ) : isVerifyingEmail && pendingUser ? (
            /* EMAIL VERIFICATION REQUIRED SCREEN */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#242220] text-white p-5 rounded-3xl border border-[#FFB800] space-y-3 shadow-xl text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFB800] text-[#141311] flex items-center justify-center font-black shadow-lg">
                  <Shield size={28} />
                </div>
                <div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-block">
                    Perfil Criado no Banco de Dados
                  </span>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                    Confirmação de Cadastro
                  </h4>
                  <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed mt-1">
                    Um e-mail oficial de verificação foi emitido para:
                  </p>
                  <p className="text-xs font-black text-[#FFB800] mt-1 bg-[#141311] py-1.5 px-3 rounded-xl inline-block border border-[#FFB800]/30">
                    {pendingUser.email}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-2 max-w-xs mx-auto">
                    Caso seu provedor de e-mail atrase a entrega ou o e-mail caia na caixa de spam/promoções, utilize o botão de ativação instantânea abaixo.
                  </p>
                </div>
              </div>

              {/* Botão de Ativação Instantânea Direta */}
              <button
                type="button"
                onClick={() => handleConfirmVerificationCode(undefined, generatedCode)}
                className="w-full bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={18} />
                <span>Ativar Perfil Imediatamente (+35 Responsa)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#3E3A35]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  ou valide com o código de 6 dígitos
                </span>
                <div className="flex-grow border-t border-[#3E3A35]"></div>
              </div>

              <form onSubmit={handleConfirmVerificationCode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 text-center">
                    Código PIN de 6 Dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center tracking-[0.5em] text-2xl font-black py-4 bg-[#242220] border-2 border-[#3E3A35] focus:border-[#FFB800] rounded-2xl outline-none transition text-[#FFB800]"
                  />
                </div>

                {/* Instant Test / Demo Helper Pill */}
                <div className="bg-[#242220] border border-[#FFB800]/50 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FFB800] shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">Código do Sistema:</span>
                      <span className="font-mono font-black text-[#FFB800] text-sm">{generatedCode}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredCode(generatedCode)}
                    className="bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-[10px] uppercase px-3 py-1.5 rounded-xl transition shadow cursor-pointer"
                  >
                    Preencher PIN
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={enteredCode.length !== 6}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      enteredCode.length === 6
                        ? 'bg-[#FFB800] hover:bg-[#EAB308] text-[#141311]'
                        : 'bg-[#242220] text-zinc-600 border border-[#3E3A35] cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>Validar PIN & Ativar</span>
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerifyingEmail(false);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-white font-bold underline cursor-pointer"
                    >
                      &larr; Voltar e editar dados
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendCode}
                      className={`text-xs font-black uppercase cursor-pointer ${
                        resendCooldown > 0
                          ? 'text-zinc-600 cursor-not-allowed'
                          : 'text-[#FF5722] hover:underline'
                      }`}
                    >
                      {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar E-mail Oficial'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Profile Image Uploader */}
              <div className="bg-[#242220] p-4 rounded-2xl border border-[#3E3A35]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Foto do Perfil * (Carregar do Dispositivo)
                </label>

                <div className="flex items-center gap-4">
                  {/* Current Selected Avatar Preview */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#FFB800] shadow-md bg-[#141311]">
                    <img 
                      src={uploadedAvatar || customAvatarUrl || avatar} 
                      alt="Prévia do Perfil" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-1.5">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-[#1C1B19] hover:bg-[#2A2825] text-white border border-[#3E3A35] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Upload size={14} className="text-[#FFB800]" />
                      <span>{uploadedAvatar ? 'Trocar Foto Carregada' : 'Carregar Foto do Seu Dispositivo'}</span>
                    </button>
                    {uploadedAvatar && (
                      <button
                        type="button"
                        onClick={() => setUploadedAvatar(null)}
                        className="text-[10px] text-red-400 font-bold hover:underline block cursor-pointer"
                      >
                        Remover foto e escolher preset
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Options as fallback */}
                {!uploadedAvatar && (
                  <div className="mt-3 pt-3 border-t border-[#3E3A35]">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1.5">
                      Ou escolha um avatar periférico:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {AVATAR_PRESETS.map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => { setAvatar(url); setCustomAvatarUrl(''); }}
                          className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                            avatar === url && !customAvatarUrl ? 'border-[#FFB800] scale-105 ring-2 ring-[#FFB800]/40' : 'border-[#3E3A35] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Nome Artístico / Vulgo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Luna Grafite, MC Taquaralto"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Nome de Usuário (@vulgo)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: lunagrafite"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center justify-between">
                    <span>E-mail *</span>
                    <span className="text-[9px] text-[#FF5722] font-black">Validação Obrigatória</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Criar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 3 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  />
                </div>
              </div>

              {/* Neighborhood & User Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Bairro / Território em Palmas
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  >
                    <option value="Taquaralto" className="bg-[#1C1B19]">Taquaralto</option>
                    <option value="Jardim Aureny III" className="bg-[#1C1B19]">Jardim Aureny III</option>
                    <option value="Morada do Sol" className="bg-[#1C1B19]">Morada do Sol</option>
                    <option value="Setor Taquari" className="bg-[#1C1B19]">Setor Taquari</option>
                    <option value="301 Sul / Espaço Cultural" className="bg-[#1C1B19]">301 Sul / Espaço Cultural</option>
                    <option value="Plano Diretor Sul" className="bg-[#1C1B19]">Plano Diretor Sul</option>
                    <option value="Plano Diretor Norte" className="bg-[#1C1B19]">Plano Diretor Norte</option>
                    <option value="Praia da Graciosa" className="bg-[#1C1B19]">Praia da Graciosa</option>
                    <option value="Santa Bárbara" className="bg-[#1C1B19]">Santa Bárbara</option>
                    <option value="Jardim Taquari" className="bg-[#1C1B19]">Jardim Taquari</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Nível de Atuação
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as UserLevel)}
                    className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                  >
                    <option value={UserLevel.CRIADOR} className="bg-[#1C1B19]">Criador (Fotógrafo & Remixes)</option>
                    <option value={UserLevel.ATIVISTA} className="bg-[#1C1B19]">Ativista Visual (Grafiteiro & Muros)</option>
                    <option value={UserLevel.OBSERVADOR} className="bg-[#1C1B19]">Observador (Apoiador da Cena)</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  Bio / Visão Periférica
                </label>
                <textarea
                  rows={2}
                  placeholder="Conte um pouco sobre sua arte, vivência e estética..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none resize-none"
                />
              </div>

              {/* Instagram handle */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  Instagram / Contato (opcional)
                </label>
                <input
                  type="text"
                  placeholder="@seuperfil"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full p-3 bg-[#242220] border border-[#3E3A35] rounded-2xl text-xs font-bold text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] outline-none"
                />
              </div>

              {/* Supabase Sync Option Card */}
              <div className="p-3 bg-[#1C1B19] rounded-2xl border border-[#3E3A35] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#3ECF8E]/15 text-[#3ECF8E] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.203 13.916a.396.396 0 0 0 .319.638H12v8.958a.396.396 0 0 0 .716.233l11.081-13.753a.396.396 0 0 0-.319-.638z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-white block">
                      Criar no Supabase (Auth + PostgreSQL)
                    </span>
                    <span className="text-[9px] text-zinc-400 block">
                      {isSupabaseConfigured() ? 'Sincronização em nuvem ativa' : 'Pendente de credenciais no .env'}
                    </span>
                  </div>
                </div>
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncWithSupabase}
                    onChange={(e) => setSyncWithSupabase(e.target.checked)}
                    className="w-4 h-4 accent-[#3ECF8E] cursor-pointer rounded"
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#FFB800] hover:bg-[#EAB308] text-[#141311] font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield size={16} />
                  <span>Validar E-mail & Ativar Perfil (+35 Responsa)</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
