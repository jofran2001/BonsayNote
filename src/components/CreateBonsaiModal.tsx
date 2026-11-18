import React, { useRef, useState } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Sprout,
  ScrollText,
  Check,
  Loader2,
} from 'lucide-react';
import { Bonsai } from '../types';
import { api, processImageUpload } from '../services/api';
import { useToast } from '../context/ToastContext';

interface CreateBonsaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (bonsai: Bonsai) => void;
}

const BONSAI_STYLES = [
  'Sōkan (Tronco Duplo)',
  'Moyogi (Ereto Informal)',
  'Kabudachi (Múltiplos Troncos)',
  'Chokkan (Ereto Formal)',
  'Shakan (Inclinado)',
  'Kengai (Cascata)',
  'Fukinagashi (Varrido pelo Vento)',
  'Livre',
];

export const CreateBonsaiModal: React.FC<CreateBonsaiModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { showToast } = useToast();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [style, setStyle] = useState(BONSAI_STYLES[0]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isGiftPlanned, setIsGiftPlanned] = useState(false);
  const [giftLetterContent, setGiftLetterContent] = useState('');
  const [initialLogNotes, setInitialLogNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const dataUrl = await processImageUpload(file);
      setCoverImageUrl(dataUrl);
      showToast('Foto de capa carregada com sucesso!', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim()) {
      showToast('Preencha o nome afetivo e a espécie do bonsai.', 'error');
      return;
    }

    if (!coverImageUrl) {
      showToast('Adicione uma foto de capa para o seu bonsai.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.bonsais.create({
        name: name.trim(),
        species: species.trim(),
        style,
        coverImageUrl,
        startDate,
        isGift: isGiftPlanned,
        giftLetterContent: isGiftPlanned ? giftLetterContent.trim() : '',
        initialLogTitle: 'Início do Cultivo',
        initialLogNotes:
          initialLogNotes.trim() ||
          `Início do cultivo de ${name.trim()} (${species.trim()}) no estilo ${style}.`,
        initialLogCategory: 'transplante',
      });

      showToast(`Bonsai "${created.name}" cadastrado com sucesso!`, 'success');
      onCreated(created);
      setName('');
      setSpecies('');
      setCoverImageUrl('');
      setGiftLetterContent('');
      setInitialLogNotes('');
      setIsGiftPlanned(false);
      onClose();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#152018] border-t sm:border border-[#223326] shadow-2xl text-stone-100 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0d130e] border border-[#223326] flex items-center justify-center text-stone-400 hover:text-stone-100"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#0d130e] border border-[#4ade80]/40 flex items-center justify-center text-[#4ade80]">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#4ade80]">
              Novo Cultivo
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-100 leading-tight">
              Iniciar Diário de Bonsai
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto de Capa */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Foto de Capa da Árvore *
            </label>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {coverImageUrl ? (
              <div className="relative h-44 rounded-2xl overflow-hidden bg-[#0d130e] border border-[#4ade80]/40">
                <img
                  src={coverImageUrl}
                  alt="Capa do bonsai"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
                  className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-xs font-medium bg-black/75 text-stone-200 border border-white/20 hover:bg-black"
                >
                  Trocar foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[#0d130e] border border-[#223326] hover:border-[#4ade80]/60 text-stone-200 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#4ade80] animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#4ade80]" />
                  )}
                  <span className="text-xs font-medium">Tirar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[#0d130e] border border-[#223326] hover:border-[#c28854]/60 text-stone-200 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#c28854] animate-spin" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#c28854]" />
                  )}
                  <span className="text-xs font-medium">Escolher da Galeria</span>
                </button>
              </div>
            )}
          </div>

          {/* Nome e Espécie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Nome do Bonsai *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sōkan da Amizade"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Espécie Botânica *
              </label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="Ex: Buxus sempervirens"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Estilo e Data de Início */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Estilo Tradicional
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 focus:outline-none"
              >
                {BONSAI_STYLES.map((st) => (
                  <option key={st} value={st} className="bg-[#0d130e]">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Data do Início do Cultivo
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Primeiro Registro no Solo */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Anotação do 1º Cuidado no Solo (opcional)
            </label>
            <textarea
              rows={2}
              value={initialLogNotes}
              onChange={(e) => setInitialLogNotes(e.target.value)}
              placeholder="Ex: Limpeza de nebari, poda estrutural e aplicação de pasta cicatrizante..."
              className="w-full px-3.5 py-2 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
            />
          </div>

          {/* Carta Afetiva de Presente */}
          <div className="rounded-2xl bg-[#1b1915] border border-[#3d3326] p-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#e6b37e]">
                <ScrollText className="w-4 h-4 text-[#c28854]" />
                Escrever Carta Afetiva de Presente (双幹)
              </span>
              <input
                type="checkbox"
                checked={isGiftPlanned}
                onChange={(e) => setIsGiftPlanned(e.target.checked)}
                className="accent-[#c28854] w-4 h-4 rounded"
              />
            </label>

            {isGiftPlanned && (
              <textarea
                rows={3}
                value={giftLetterContent}
                onChange={(e) => setGiftLetterContent(e.target.value)}
                placeholder="Escreva a simbologia da árvore e a dedicatória para quem receberá este bonsai..."
                className="mt-2.5 w-full rounded-xl bg-[#12100d] border border-[#3d3326] focus:border-[#c28854] px-3 py-2 font-serif text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
              />
            )}
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-xs font-medium bg-[#0d130e] border border-[#223326] text-stone-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-xs font-semibold bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] shadow-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Criando...' : 'Cadastrar Bonsai'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
