import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gift,
  ScrollText,
  Sprout,
  Plus,
  Calendar,
  Loader2,
  Scissors,
  Sparkles,
  RefreshCw,
  Droplets,
  Leaf,
  Layers,
} from 'lucide-react';
import { Bonsai, BonsaiLog, LogCategory, PopulatedUserRef } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TimelineItem } from '../components/TimelineItem';
import { GiftLetterModal } from '../components/GiftLetterModal';
import { TransferModal } from '../components/TransferModal';
import { UploadModal } from '../components/UploadModal';
import { CareGuideAccordion } from '../components/CareGuideAccordion';

function resolveUser(ref: PopulatedUserRef | string): {
  id: string;
  name: string;
  email: string;
} {
  if (typeof ref === 'object' && ref !== null) {
    return { id: ref._id, name: ref.name, email: ref.email };
  }
  return { id: String(ref), name: 'Cultivador', email: '' };
}

const LOG_FILTERS: {
  id: 'all' | LogCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'all', label: 'Todas', icon: Layers },
  { id: 'poda', label: 'Poda', icon: Scissors },
  { id: 'adubacao', label: 'Adubação', icon: Sparkles },
  { id: 'transplante', label: 'Transplante', icon: RefreshCw },
  { id: 'rega', label: 'Rega', icon: Droplets },
  { id: 'foto_rotina', label: 'Fotos', icon: Leaf },
];

export const BonsaiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bonsai, setBonsai] = useState<Bonsai | null>(null);
  const [logs, setLogs] = useState<BonsaiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | LogCategory>('all');

  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [bonsaiData, logsData] = await Promise.all([
        api.bonsais.getById(id),
        api.logs.listByBonsai(id),
      ]);
      setBonsai(bonsaiData);
      setLogs(logsData);
    } catch (err) {
      showToast((err as Error).message, 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || !bonsai) {
    return (
      <div className="min-h-screen bg-[#0d130e] text-stone-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#4ade80] animate-spin" />
        <p className="text-xs text-stone-400">Abrindo registros da árvore...</p>
      </div>
    );
  }

  const currentUserId = user?.id || '';
  const cultivator = resolveUser(bonsai.cultivatorId);
  const owner = resolveUser(bonsai.ownerId);
  const isCurrentOwner = owner.id === currentUserId;
  const isReceivedGift = cultivator.id !== currentUserId;

  const filteredLogs =
    activeCategory === 'all'
      ? logs
      : logs.filter((l) => l.category === activeCategory);

  const formattedStartDate = new Date(bonsai.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0d130e] text-stone-100 pb-28">
      {/* Hero / Imagem de Capa com Navegação e Identificação */}
      <div className="relative h-80 w-full max-w-md mx-auto overflow-hidden bg-[#152018]">
        <img
          src={bonsai.coverImageUrl}
          alt={bonsai.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d130e] via-[#0d130e]/45 to-black/40" />

        {/* Barra Superior Sobreposta */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0d130e]/80 border border-[#223326] text-xs font-medium text-stone-200 backdrop-blur-md hover:border-[#4ade80]/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {isReceivedGift ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1b1915]/90 text-[#e6b37e] border border-[#c28854]/50 backdrop-blur-md shadow-lg">
              <Gift className="w-3.5 h-3.5 text-[#c28854]" />
              Presente de {cultivator.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#0d130e]/85 text-[#4ade80] border border-[#4ade80]/40 backdrop-blur-md shadow-lg">
              <Sprout className="w-3.5 h-3.5 text-[#4ade80]" />
              Cultivado por você
            </span>
          )}
        </div>

        {/* Informações Principais da Árvore na Base da Capa */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#4ade80] bg-[#152018]/90 px-2.5 py-1 rounded-lg border border-[#223326]">
              {bonsai.style}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-300 bg-[#0d130e]/75 px-2.5 py-1 rounded-lg border border-[#223326]/70">
              <Calendar className="w-3 h-3 text-[#c28854]" />
              Início: {formattedStartDate}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 leading-tight drop-shadow">
            {bonsai.name}
          </h1>
          <p className="text-sm italic text-stone-300">{bonsai.species}</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-5">
        {/* Botões de Ação: Abrir Carta do Presente & Presentear Bonsai */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsLetterOpen(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#1b1915] hover:bg-[#25211b] border border-[#c28854]/45 text-[#e6b37e] text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            <ScrollText className="w-4 h-4 text-[#c28854] shrink-0" />
            <span>Abrir Carta do Presente</span>
          </button>

          {isCurrentOwner && (
            <button
              type="button"
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#152018] hover:bg-[#1c2b20] border border-[#4ade80]/40 text-[#4ade80] text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <Gift className="w-4 h-4 text-[#4ade80] shrink-0" />
              <span>Presentear Bonsai</span>
            </button>
          )}
        </section>

        {/* Card Sanfona: Guia de Cuidados */}
        <CareGuideAccordion species={bonsai.species} style={bonsai.style} />

        {/* Seção da Linha do Tempo (Timeline) */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100">
                Linha do Tempo Viva
              </h2>
              <p className="text-xs text-stone-400">
                Histórico completo desde as primeiras raízes ({logs.length}{' '}
                {logs.length === 1 ? 'registro' : 'registros'})
              </p>
            </div>
          </div>

          {/* Filtro Horizontal de Categorias de Log */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
            {LOG_FILTERS.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCategory(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#4ade80] text-[#0d130e] border-[#4ade80] font-semibold shadow'
                      : 'bg-[#152018] text-stone-300 border-[#223326] hover:border-[#4ade80]/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Lista Vertical de Logs */}
          <div className="mt-4">
            {filteredLogs.length === 0 ? (
              <div className="rounded-2xl bg-[#152018] border border-[#223326] p-6 text-center">
                <p className="text-sm text-stone-300 font-medium">
                  Nenhum registro nesta categoria ainda.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Toque em "Novo Registro" abaixo para adicionar uma foto ou cuidado.
                </p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <TimelineItem
                  key={log._id}
                  log={log}
                  isLast={index === filteredLogs.length - 1}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Botão Flutuante para Adicionar Novo Registro na Timeline */}
      <div className="fixed bottom-6 inset-x-0 z-30 pointer-events-none max-w-md mx-auto px-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="pointer-events-auto inline-flex items-center gap-2 px-5 py-4 rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] font-semibold text-sm shadow-[0_12px_35px_rgba(74,222,128,0.35)] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Modal 1: Carta do Presente (Pergaminho Escuro com Kanji 双幹) */}
      <GiftLetterModal
        bonsai={bonsai}
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        canEdit={cultivator.id === currentUserId || isCurrentOwner}
        onUpdated={(updated) => setBonsai(updated)}
      />

      {/* Modal 2: Presentear / Transferir Bonsai */}
      <TransferModal
        bonsai={bonsai}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransferred={() => {
          navigate('/');
        }}
      />

      {/* Modal 3: Novo Registro de Cuidado / Foto */}
      <UploadModal
        bonsaiId={bonsai._id}
        bonsaiName={bonsai.name}
        defaultCoverUrl={bonsai.coverImageUrl}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLogCreated={(newLog) => {
          setLogs((prev) => [newLog, ...prev]);
        }}
      />
    </div>
  );
};

