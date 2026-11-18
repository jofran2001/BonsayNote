import React, { useState } from 'react';
import { X, Sparkles, Edit3, Check, Calendar, HeartHandshake } from 'lucide-react';
import { Bonsai, PopulatedUserRef } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface GiftLetterModalProps {
  bonsai: Bonsai;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onUpdated: (updated: Bonsai) => void;
}

function getCultivatorName(ref: PopulatedUserRef | string): string {
  if (typeof ref === 'object' && ref !== null && 'name' in ref) {
    return ref.name;
  }
  return 'Cultivador Original';
}

export const GiftLetterModal: React.FC<GiftLetterModalProps> = ({
  bonsai,
  isOpen,
  onClose,
  canEdit,
  onUpdated,
}) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [letterText, setLetterText] = useState(bonsai.giftLetterContent || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const cultivatorName = getCultivatorName(bonsai.cultivatorId);
  const displayDate = bonsai.giftedAt || bonsai.startDate || bonsai.createdAt;
  const formattedDate = new Date(displayDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.bonsais.updateLetter(bonsai._id, letterText);
      onUpdated(updated);
      setIsEditing(false);
      showToast('Carta do presente salva com sucesso!', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasLetter = Boolean(bonsai.giftLetterContent?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1b1915] border-2 border-[#3d3326] shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-stone-100 p-6 sm:p-7"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(194, 136, 84, 0.14), transparent 70%)',
        }}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#26221c] border border-[#3d3326] flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
          aria-label="Fechar carta"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ornamento Japonês / Kanji 双幹 */}
        <div className="text-center pt-1 pb-5 border-b border-[#3d3326]">
          <div className="inline-flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[#241f19] border border-[#c28854]/40 shadow-inner mb-3">
            <span className="font-serif text-3xl font-bold text-[#e6b37e] tracking-widest leading-none">
              双幹
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c28854] mt-1.5">
              Sōkan
            </span>
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-[#c28854] font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Carta de Cultivo & Simbologia
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
            {bonsai.name}
          </h3>
          <p className="text-xs italic text-stone-400 mt-0.5">
            {bonsai.species} • {bonsai.style}
          </p>
        </div>

        {/* Conteúdo da Carta em Pergaminho Escuro */}
        {!isEditing ? (
          <div className="py-6">
            {hasLetter ? (
              <div className="relative px-3 py-2">
                <span
                  className="font-serif text-5xl text-[#c28854]/20 absolute -top-3 left-0 select-none"
                  aria-hidden="true"
                >
                  “
                </span>
                <p className="font-serif text-lg sm:text-xl leading-relaxed text-stone-200 whitespace-pre-line relative z-10 italic">
                  {bonsai.giftLetterContent!.trim()}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 px-4">
                <p className="font-serif text-lg text-stone-400 italic">
                  Nenhuma carta foi escrita para este bonsai ainda.
                </p>
                {canEdit && (
                  <p className="text-xs text-stone-500 mt-1">
                    Clique em "Escrever Carta" abaixo para registrar a simbologia e dedicatória desta árvore.
                  </p>
                )}
              </div>
            )}

            {/* Rodapé com Assinatura e Data do Presente */}
            <div className="mt-6 pt-5 border-t border-[#3d3326]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#c28854] shrink-0" />
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-stone-500">
                    Cultivado e dedicado por
                  </span>
                  <strong className="font-serif text-base text-[#e6b37e] font-semibold">
                    {cultivatorName}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-stone-400 bg-[#241f19] px-3 py-1.5 rounded-xl border border-[#3d3326]">
                <Calendar className="w-3.5 h-3.5 text-[#c28854]" />
                <span>
                  {bonsai.giftedAt
                    ? `Presenteado em ${formattedDate}`
                    : `Iniciado em ${formattedDate}`}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setLetterText(bonsai.giftLetterContent || '');
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-[#26221c] hover:bg-[#312b23] text-[#e6b37e] border border-[#c28854]/30 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {hasLetter ? 'Editar Carta' : 'Escrever Carta'}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#c28854] hover:bg-[#a16207] text-[#0d130e] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveLetter} className="py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#e6b37e] mb-2">
                Escreva a mensagem afetiva e a simbologia desta árvore:
              </label>
              <textarea
                rows={7}
                value={letterText}
                onChange={(e) => setLetterText(e.target.value)}
                placeholder="Conte a história deste cultivo, o significado do estilo do tronco e seus votos para quem receberá o bonsai..."
                className="w-full rounded-2xl bg-[#12100d] border border-[#3d3326] focus:border-[#c28854] px-4 py-3 font-serif text-base text-stone-100 placeholder-stone-500 focus:outline-none leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[#26221c] text-stone-300 hover:text-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Carta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
