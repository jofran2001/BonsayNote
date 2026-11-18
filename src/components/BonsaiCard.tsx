import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sprout, Calendar, ChevronRight, ScrollText } from 'lucide-react';
import { Bonsai, PopulatedUserRef } from '../types';

interface BonsaiCardProps {
  bonsai: Bonsai;
  currentUserId: string;
}

function resolveUser(ref: PopulatedUserRef | string): { id: string; name: string } {
  if (typeof ref === 'object' && ref !== null) {
    return { id: ref._id, name: ref.name };
  }
  return { id: String(ref), name: 'Cultivador' };
}

export const BonsaiCard: React.FC<BonsaiCardProps> = ({ bonsai, currentUserId }) => {
  const cultivator = resolveUser(bonsai.cultivatorId);
  const isReceivedGift = cultivator.id !== currentUserId;

  const formattedStartDate = new Date(bonsai.startDate).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      to={`/bonsais/${bonsai._id}`}
      className="group block bg-[#152018] border border-[#223326] hover:border-[#4ade80]/50 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 active:scale-[0.99]"
    >
      {/* Imagem de Capa com Gradiente e Selo Identificador */}
      <div className="relative h-52 w-full overflow-hidden bg-[#0d130e]">
        <img
          src={bonsai.coverImageUrl}
          alt={bonsai.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#152018] via-[#0d130e]/30 to-transparent" />

        {/* Selo de Origem: Presente de [Nome] ou Cultivado por você */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {isReceivedGift ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1b1915]/90 text-[#e6b37e] border border-[#c28854]/50 backdrop-blur-md shadow-md">
              <Gift className="w-3.5 h-3.5 text-[#c28854]" />
              Presente de {cultivator.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0d130e]/85 text-[#4ade80] border border-[#4ade80]/35 backdrop-blur-md shadow-md">
              <Sprout className="w-3.5 h-3.5 text-[#4ade80]" />
              Cultivado por você
            </span>
          )}

          {bonsai.giftLetterContent && (
            <span
              title="Possui Carta do Presente"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-[#1b1915]/85 text-[#c28854] border border-[#c28854]/40 backdrop-blur-md"
            >
              <ScrollText className="w-3.5 h-3.5" />
              Carta
            </span>
          )}
        </div>

        {/* Estilo Japonês na base da imagem */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-[#4ade80] bg-[#0d130e]/80 px-2.5 py-0.5 rounded-md border border-[#223326] mb-1">
              {bonsai.style}
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-100 leading-tight drop-shadow">
              {bonsai.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-4 pt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs italic text-stone-300 truncate">{bonsai.species}</p>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
            <Calendar className="w-3.5 h-3.5 text-[#c28854]" />
            <span>Desde {formattedStartDate}</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-[#0d130e] border border-[#223326] group-hover:border-[#4ade80]/50 flex items-center justify-center text-stone-300 group-hover:text-[#4ade80] transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

