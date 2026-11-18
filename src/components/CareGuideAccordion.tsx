import React, { useState } from 'react';
import {
  Sun,
  Droplets,
  Scissors,
  Sparkles,
  ChevronDown,
  BookOpen,
} from 'lucide-react';

interface CareGuideAccordionProps {
  species: string;
  style: string;
}

export const CareGuideAccordion: React.FC<CareGuideAccordionProps> = ({
  species,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const careItems = [
    {
      title: 'Luz & Ambiente',
      icon: Sun,
      color: 'text-amber-400',
      description: `Posicione seu ${species} em local bem iluminado e arejado, com sol direto suave pela manhã (3 a 4 horas diárias). Evite ambientes internos fechados ou ar-condicionado direto.`,
    },
    {
      title: 'Rega Consciente',
      icon: Droplets,
      color: 'text-sky-400',
      description:
        'Toque a superfície do substrato com a ponta dos dedos: regue abundantemente quando estiver levemente seco na superfície, até a água fluir limpa pelos furos de drenagem do vaso.',
    },
    {
      title: 'Poda & Manutenção do Estilo',
      icon: Scissors,
      color: 'text-[#4ade80]',
      description: `Para preservar a silhueta ${style}, faça pinçagem dos brotos longos mantendo 2 a 3 pares de folhas por ramo e aplique pasta cicatrizante em cortes estruturais.`,
    },
    {
      title: 'Adubação & Substrato',
      icon: Sparkles,
      color: 'text-[#c28854]',
      description:
        'Adube durante a primavera e o outono com adubo orgânico de liberação lenta (Bokashi ou Osmocote). O transplante com revisão de raízes é recomendado a cada 2 anos.',
    },
  ];

  return (
    <div className="bg-[#152018] border border-[#223326] rounded-2xl overflow-hidden shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#1a281e] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0d130e] border border-[#223326] flex items-center justify-center text-[#4ade80]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100">
              Guia de Cuidados da Árvore
            </h3>
            <p className="text-xs text-stone-400">
              Instruções de sol, rega, poda e nutrição para {species}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#4ade80]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-[#223326]/80 grid grid-cols-1 gap-2.5 animate-fade-in">
          {careItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-3 rounded-xl bg-[#0d130e]/90 border border-[#223326] flex items-start gap-3"
              >
                <div className="mt-0.5 p-2 rounded-lg bg-[#152018] border border-[#223326] shrink-0">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

