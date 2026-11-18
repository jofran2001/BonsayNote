import React from 'react';
import {
  Scissors,
  Sparkles,
  RefreshCw,
  Droplets,
  Leaf,
  User as UserIcon,
  Calendar,
} from 'lucide-react';
import { BonsaiLog, LogCategory, PopulatedUserRef } from '../types';

interface TimelineItemProps {
  log: BonsaiLog;
  isLast: boolean;
}

export const CATEGORY_CONFIG: Record<
  LogCategory,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    icon: React.FC<{ className?: string }>;
  }
> = {
  poda: {
    label: 'Poda & Estilização',
    badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    dotClass: 'bg-amber-400 ring-amber-400/20',
    icon: Scissors,
  },
  adubacao: {
    label: 'Adubação & Nutrição',
    badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    dotClass: 'bg-emerald-400 ring-emerald-400/20',
    icon: Sparkles,
  },
  transplante: {
    label: 'Transplante & Raízes',
    badgeClass: 'bg-orange-950/70 text-orange-300 border-orange-700/50',
    dotClass: 'bg-[#c28854] ring-[#c28854]/20',
    icon: RefreshCw,
  },
  rega: {
    label: 'Rega & Umidade',
    badgeClass: 'bg-sky-950/70 text-sky-300 border-sky-700/50',
    dotClass: 'bg-sky-400 ring-sky-400/20',
    icon: Droplets,
  },
  foto_rotina: {
    label: 'Registro & Rotina',
    badgeClass: 'bg-[#132a1a] text-[#4ade80] border-[#4ade80]/40',
    dotClass: 'bg-[#4ade80] ring-[#4ade80]/20',
    icon: Leaf,
  },
};

function getAuthorName(author: PopulatedUserRef | string): string {
  if (typeof author === 'object' && author !== null && 'name' in author) {
    return author.name;
  }
  return 'Cultivador';
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ log, isLast }) => {
  const config = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.foto_rotina;
  const IconComponent = config.icon;
  const authorName = getAuthorName(log.authorId);

  const formattedDate = new Date(log.loggedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(log.loggedAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative pl-7 pb-7">
      {/* Linha vertical conectora */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-[#223326] via-[#223326] to-[#152018]"
          aria-hidden="true"
        />
      )}

      {/* Marcador circular na linha do tempo */}
      <div
        className={`absolute left-1 top-1.5 w-4 h-4 rounded-full ring-4 ${config.dotClass} flex items-center justify-center`}
      />

      {/* Card do Registro */}
      <article className="bg-[#152018] border border-[#223326] rounded-2xl overflow-hidden shadow-md">
        {/* Cabeçalho de Categoria e Data */}
        <div className="px-4 pt-3.5 pb-2.5 flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeClass}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            {config.label}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-stone-400">
            <Calendar className="w-3 h-3 text-stone-500" />
            {formattedDate} • {formattedTime}
          </span>
        </div>

        {/* Foto em Destaque do Log */}
        {log.imageUrl && (
          <div className="px-4 pb-3">
            <div className="relative rounded-xl overflow-hidden bg-[#0d130e] border border-[#223326]/80 max-h-72">
              <img
                src={log.imageUrl}
                alt={log.title}
                className="w-full h-56 object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Título, Notas e Assinatura */}
        <div className="px-4 pb-4">
          <h4 className="font-serif text-lg font-semibold text-stone-100 leading-snug">
            {log.title}
          </h4>

          {log.notes && (
            <p className="mt-1.5 text-sm text-stone-300 leading-relaxed whitespace-pre-line">
              {log.notes}
            </p>
          )}

          {/* Assinatura do Autor do Log */}
          <div className="mt-3 pt-2.5 border-t border-[#223326]/80 flex items-center justify-between text-xs text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#c28854]" />
              Registrado por <strong className="text-stone-200 font-medium">{authorName}</strong>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
};

