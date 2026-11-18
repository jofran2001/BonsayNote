import React, { useState } from 'react';
import { X, Gift, Mail, ScrollText, AlertCircle, Send } from 'lucide-react';
import { Bonsai } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface TransferModalProps {
  bonsai: Bonsai;
  isOpen: boolean;
  onClose: () => void;
  onTransferred: (updatedBonsai: Bonsai) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  bonsai,
  isOpen,
  onClose,
  onTransferred,
}) => {
  const { showToast } = useToast();
  const [targetEmail, setTargetEmail] = useState('');
  const [giftLetterContent, setGiftLetterContent] = useState(
    bonsai.giftLetterContent || ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!targetEmail.trim()) {
      setInlineError('Informe o e-mail da pessoa que receberá o bonsai.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await api.bonsais.transfer(bonsai._id, {
        targetEmail: targetEmail.trim(),
        giftLetterContent: giftLetterContent.trim(),
      });
      showToast(
        `"${bonsai.name}" foi presenteado com sucesso para ${targetEmail.trim()}!`,
        'success'
      );
      onTransferred(updated);
      onClose();
    } catch (err) {
      const msg = (err as Error).message;
      setInlineError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[#152018] border border-[#223326] shadow-2xl text-stone-100 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0d130e] border border-[#223326] flex items-center justify-center text-stone-400 hover:text-stone-100"
          aria-label="Fechar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1b1915] border border-[#c28854]/40 flex items-center justify-center text-[#c28854] shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#c28854]">
              Ritual de Entrega
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-100 leading-tight">
              Presentear Bonsai
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed bg-[#0d130e]/90 border border-[#223326] rounded-2xl p-3.5 mb-4">
          Ao transferir <strong className="text-[#4ade80]">{bonsai.name}</strong>, a pessoa
          destinatária passará a vê-lo no painel dela com o selo{' '}
          <span className="text-[#e6b37e] font-medium">"Presente de você"</span>, acesso à carta
          afetiva e todo o histórico de cuidados preservado na linha do tempo.
        </p>

        {inlineError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{inlineError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              E-mail do Destinatário (cadastrado no app)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => {
                  setTargetEmail(e.target.value);
                  setInlineError(null);
                }}
                placeholder="email@destinatario.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-300 mb-1.5">
              <ScrollText className="w-3.5 h-3.5 text-[#c28854]" />
              Carta Afetiva & Simbologia do Presente
            </label>
            <textarea
              rows={5}
              value={giftLetterContent}
              onChange={(e) => setGiftLetterContent(e.target.value)}
              placeholder="Escreva a mensagem que abrirá no pergaminho especial para o novo guardião..."
              className="w-full rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#c28854] px-3.5 py-2.5 font-serif text-base text-stone-100 placeholder-stone-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-xs font-medium bg-[#0d130e] border border-[#223326] text-stone-300 hover:text-stone-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold bg-gradient-to-r from-[#c28854] to-[#a16207] hover:brightness-110 text-stone-950 shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Transferindo...' : 'Confirmar Presente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
