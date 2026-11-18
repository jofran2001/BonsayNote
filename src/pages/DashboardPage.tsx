import React, { useEffect, useState } from 'react';
import {
  Sprout,
  LogOut,
  Plus,
  Gift,
  Sparkles,
  Loader2,
  Trees,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bonsai, PopulatedUserRef } from '../types';
import { api } from '../services/api';
import { BonsaiCard } from '../components/BonsaiCard';
import { CreateBonsaiModal } from '../components/CreateBonsaiModal';

function getCultivatorId(ref: PopulatedUserRef | string): string {
  if (typeof ref === 'object' && ref !== null) {
    return ref._id;
  }
  return String(ref);
}

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [bonsais, setBonsais] = useState<Bonsai[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cultivated' | 'gifted'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchBonsais = async () => {
    try {
      setLoading(true);
      const data = await api.bonsais.list();
      setBonsais(data);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonsais();
  }, []);

  const currentUserId = user?.id || '';

  const filteredBonsais = bonsais.filter((b) => {
    const isReceivedGift = getCultivatorId(b.cultivatorId) !== currentUserId;
    if (filter === 'cultivated') return !isReceivedGift;
    if (filter === 'gifted') return isReceivedGift;
    return true;
  });

  const receivedCount = bonsais.filter(
    (b) => getCultivatorId(b.cultivatorId) !== currentUserId
  ).length;
  const cultivatedCount = bonsais.length - receivedCount;

  const firstName = user?.name?.split(' ')[0] || 'Cultivador';

  return (
    <div className="min-h-screen bg-[#0d130e] text-stone-100 pb-28">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-30 bg-[#0d130e]/90 backdrop-blur-md border-b border-[#223326]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-2xl object-cover border border-[#4ade80]/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-[#152018] border border-[#223326] flex items-center justify-center text-[#4ade80]">
                <Sprout className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#4ade80] font-semibold">
                Jardim Pessoal
              </p>
              <h1 className="font-serif text-xl font-bold text-stone-100 leading-tight">
                Olá, {firstName}
              </h1>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#152018] border border-[#223326] hover:border-red-500/40 text-xs font-medium text-stone-300 hover:text-red-300 transition-colors"
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Banner Resumo do Jardim */}
        <section className="rounded-3xl bg-gradient-to-br from-[#152018] via-[#152018] to-[#1b1915] border border-[#223326] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100">
                Meus Bonsais
              </h2>
              <p className="text-xs text-stone-400">
                {user?.email}
              </p>
            </div>
            <span className="font-serif text-2xl text-[#c28854]/70 select-none">
              盆栽
            </span>
          </div>

          {/* Filtros Rápidos */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                filter === 'all'
                  ? 'bg-[#0d130e] border-[#4ade80] text-stone-100'
                  : 'bg-[#0d130e]/50 border-[#223326] text-stone-400'
              }`}
            >
              <span className="block text-lg font-bold text-stone-100 leading-none">
                {bonsais.length}
              </span>
              <span className="text-[11px] font-medium mt-1 block">Todos</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('cultivated')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                filter === 'cultivated'
                  ? 'bg-[#0d130e] border-[#4ade80] text-[#4ade80]'
                  : 'bg-[#0d130e]/50 border-[#223326] text-stone-400'
              }`}
            >
              <span className="block text-lg font-bold text-[#4ade80] leading-none">
                {cultivatedCount}
              </span>
              <span className="text-[11px] font-medium mt-1 block">Cultivados</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('gifted')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                filter === 'gifted'
                  ? 'bg-[#0d130e] border-[#c28854] text-[#e6b37e]'
                  : 'bg-[#0d130e]/50 border-[#223326] text-stone-400'
              }`}
            >
              <span className="block text-lg font-bold text-[#e6b37e] leading-none">
                {receivedCount}
              </span>
              <span className="text-[11px] font-medium mt-1 block">Presentes</span>
            </button>
          </div>
        </section>

        {/* Lista de Bonsais */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 className="w-7 h-7 text-[#4ade80] animate-spin" />
            <p className="text-xs">Carregando seu jardim de bonsais...</p>
          </div>
        ) : filteredBonsais.length === 0 ? (
          <div className="rounded-3xl bg-[#152018] border border-[#223326] p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0d130e] border border-[#223326] flex items-center justify-center mx-auto text-[#4ade80]">
              {filter === 'gifted' ? (
                <Gift className="w-6 h-6 text-[#c28854]" />
              ) : (
                <Trees className="w-6 h-6" />
              )}
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-100">
              {filter === 'gifted'
                ? 'Nenhum bonsai recebido ainda'
                : 'Sua bancada está esperando uma árvore'}
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              {filter === 'gifted'
                ? 'Quando um cultivador transferir um bonsai para seu e-mail, ele aparecerá aqui com a carta especial e toda a linha do tempo.'
                : 'Inicie o cultivo de um novo bonsai, registre as primeiras podas e escreva uma carta de simbologia.'}
            </p>
            {filter !== 'gifted' && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Bonsai
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBonsais.map((bonsai) => (
              <BonsaiCard
                key={bonsai._id}
                bonsai={bonsai}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Botão Flutuante (+) para Cadastrar Novo Bonsai */}
      <div className="fixed bottom-6 inset-x-0 z-30 pointer-events-none max-w-md mx-auto px-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="pointer-events-auto inline-flex items-center gap-2 px-5 py-4 rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] font-semibold text-sm shadow-[0_12px_35px_rgba(74,222,128,0.35)] active:scale-95 transition-all"
          aria-label="Cadastrar novo bonsai"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Novo Bonsai</span>
        </button>
      </div>

      {/* Modal de Cadastro de Bonsai */}
      <CreateBonsaiModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newBonsai) => {
          setBonsais((prev) => [newBonsai, ...prev]);
        }}
      />
    </div>
  );
};

