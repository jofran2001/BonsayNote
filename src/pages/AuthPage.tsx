import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export const AuthPage: React.FC = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleSdkReady, setGoogleSdkReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  // Carrega o script oficial Google Identity Services
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      setGoogleSdkReady(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setGoogleSdkReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleSdkReady(true);
    document.head.appendChild(script);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setLoading(true);
      if (mode === 'login') {
        await login(email, password);
        showToast('Bem-vindo de volta ao seu jardim!', 'success');
      } else {
        await register(name, email, password);
        showToast('Conta criada com sucesso! Bem-vindo ao Bonsai Diary.', 'success');
      }
    } catch (err) {
      const msg = (err as Error).message;
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg(null);

    if (!googleClientId) {
      const msg =
        'Configure a variável VITE_GOOGLE_CLIENT_ID no arquivo .env para ativar o Login com Google.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (!googleSdkReady || !window.google?.accounts?.oauth2) {
      const msg = 'Carregando serviço do Google. Tente novamente em um instante.';
      setErrorMsg(msg);
      showToast(msg, 'info');
      return;
    }

    try {
      setGoogleLoading(true);
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (response: GoogleTokenResponse) => {
          if (response.error || !response.access_token) {
            setGoogleLoading(false);
            if (response.error !== 'access_denied') {
              const errMsg =
                response.error_description || 'Autenticação com Google cancelada.';
              setErrorMsg(errMsg);
            }
            return;
          }

          try {
            await loginWithGoogle({ accessToken: response.access_token });
            showToast('Conectado com sua conta Google!', 'success');
          } catch (err) {
            const msg = (err as Error).message;
            setErrorMsg(msg);
            showToast(msg, 'error');
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: () => {
          setGoogleLoading(false);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setGoogleLoading(false);
      const msg = (err as Error).message;
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d130e] text-stone-100 flex flex-col justify-between px-4 py-8 relative overflow-hidden">
      {/* Brilho sutil de fundo */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 10%, rgba(74, 222, 128, 0.16), transparent 55%), radial-gradient(circle at 85% 85%, rgba(194, 136, 84, 0.14), transparent 50%)',
        }}
      />

      <div className="w-full max-w-md mx-auto my-auto relative z-10">
        {/* Identidade Visual do App */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#152018] border border-[#223326] shadow-xl mb-3 relative">
            <Sprout className="w-8 h-8 text-[#4ade80]" />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-[#1b1915] border border-[#c28854]/50 text-[10px] font-serif text-[#e6b37e]">
              双幹
            </span>
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-100">
            Bonsai Diary
          </h1>
          <p className="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Cultive raízes, registre cada poda e presenteie árvores vivas com sua história preservada.
          </p>
        </div>

        {/* Card Principal de Autenticação */}
        <div className="bg-[#152018] border border-[#223326] rounded-3xl p-6 shadow-2xl">
          {/* Alternância rápida Entrar / Cadastrar */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0d130e] border border-[#223326] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-[#152018] text-[#4ade80] border border-[#223326] shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-[#152018] text-[#4ade80] border border-[#223326] shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botão de Login Social Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#0d130e] hover:bg-[#121b14] border border-[#223326] hover:border-[#4ade80]/50 text-sm font-medium text-stone-100 shadow transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 text-[#4ade80] animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 19.9 7.4 23 12 23z"
                />
              </svg>
            )}
            <span>
              {googleLoading ? 'Conectando ao Google...' : 'Continuar com Google'}
            </span>
          </button>

          {/* Divisor */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#223326]" />
            <span className="text-[11px] uppercase tracking-wider text-stone-500">
              ou com e-mail
            </span>
            <div className="h-px flex-1 bg-[#223326]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm font-semibold bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] shadow-lg transition-all disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Aguarde...'
                  : mode === 'login'
                  ? 'Entrar no Jardim'
                  : 'Criar Minha Conta'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center text-[11px] text-stone-500 mt-6 relative z-10">
        Bonsai Diary PWA • Tema Dark Nature • Cultivo & Memória Afetiva
      </footer>
    </div>
  );
};
