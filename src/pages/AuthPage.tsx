import React, { useState } from 'react';
import {
  Sprout,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
              disabled={loading}
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
