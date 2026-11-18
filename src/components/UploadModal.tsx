import React, { useRef, useState } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Scissors,
  Droplets,
  Sparkles,
  RefreshCw,
  Leaf,
  Check,
  Loader2,
} from 'lucide-react';
import { BonsaiLog, LogCategory } from '../types';
import { api, processImageUpload } from '../services/api';
import { useToast } from '../context/ToastContext';

interface UploadModalProps {
  bonsaiId: string;
  bonsaiName: string;
  defaultCoverUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onLogCreated: (newLog: BonsaiLog) => void;
}

const CATEGORIES: {
  id: LogCategory;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
  activeClass: string;
}[] = [
  {
    id: 'poda',
    label: 'Poda',
    shortDesc: 'Estrutural, beliscão ou aramação',
    icon: Scissors,
    activeClass: 'bg-amber-950/80 border-amber-500 text-amber-300',
  },
  {
    id: 'rega',
    label: 'Rega',
    shortDesc: 'Hidratação do substrato e copa',
    icon: Droplets,
    activeClass: 'bg-sky-950/80 border-sky-500 text-sky-300',
  },
  {
    id: 'adubacao',
    label: 'Adubação',
    shortDesc: 'Bokashi, NPK ou biofertilizante',
    icon: Sparkles,
    activeClass: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
  },
  {
    id: 'transplante',
    label: 'Transplante',
    shortDesc: 'Troca de substrato ou limpeza de raízes',
    icon: RefreshCw,
    activeClass: 'bg-orange-950/80 border-[#c28854] text-orange-300',
  },
  {
    id: 'foto_rotina',
    label: 'Rotina',
    shortDesc: 'Evolução da copa e brotações',
    icon: Leaf,
    activeClass: 'bg-[#132a1a] border-[#4ade80] text-[#4ade80]',
  },
];

export const UploadModal: React.FC<UploadModalProps> = ({
  bonsaiId,
  bonsaiName,
  defaultCoverUrl,
  isOpen,
  onClose,
  onLogCreated,
}) => {
  const { showToast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<LogCategory>('foto_rotina');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const processedUrl = await processImageUpload(file);
      setImageUrl(processedUrl);
      showToast('Foto carregada e otimizada com sucesso!', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalImageUrl = imageUrl || defaultCoverUrl;

    if (!title.trim()) {
      showToast('Informe um título para este registro de cuidado.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.logs.create(bonsaiId, {
        title: title.trim(),
        notes: notes.trim(),
        category,
        imageUrl: finalImageUrl,
        loggedAt: new Date().toISOString(),
      });

      showToast('Novo registro adicionado à linha do tempo!', 'success');
      onLogCreated(created);
      // Reset fields
      setTitle('');
      setNotes('');
      setImageUrl('');
      setCategory('foto_rotina');
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

        <div className="mb-4">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#4ade80]">
            Diário de Cultivo • {bonsaiName}
          </span>
          <h3 className="font-serif text-2xl font-bold text-stone-100">
            Novo Registro na Timeline
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Captura de Foto (Câmera ou Galeria) */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Fotografia da Árvore
            </label>

            {/* Inputs ocultos para Câmera Direta e Galeria */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#4ade80]/40 bg-[#0d130e] h-44">
                <img
                  src={imageUrl}
                  alt="Pré-visualização do registro"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-xs font-medium bg-black/75 text-stone-200 border border-white/20 hover:bg-black"
                >
                  Trocar foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#0d130e] border border-[#223326] hover:border-[#4ade80]/60 text-stone-200 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 text-[#4ade80] animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#4ade80]" />
                  )}
                  <span className="text-xs font-medium">Usar Câmera</span>
                </button>

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#0d130e] border border-[#223326] hover:border-[#c28854]/60 text-stone-200 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 text-[#c28854] animate-spin" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#c28854]" />
                  )}
                  <span className="text-xs font-medium">Abrir Galeria</span>
                </button>
              </div>
            )}
            {!imageUrl && (
              <p className="text-[11px] text-stone-400 mt-1.5">
                Se nenhuma foto nova for enviada, a foto atual da planta será usada no registro.
              </p>
            )}
          </div>

          {/* 2. Seletor Rápido de Categoria com Ícones */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Categoria do Cuidado
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? cat.activeClass
                        : 'bg-[#0d130e] border-[#223326] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-medium leading-none">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Título do Registro */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Título da Ação
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Poda de ramificação fina e limpeza de folhas"
              className="w-full px-3.5 py-3 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
              required
            />
          </div>

          {/* 4. Observações */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Observações e Detalhes (opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anote como estava o solo, resposta de brotação, aplicação de pasta selante..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0d130e] border border-[#223326] focus:border-[#4ade80] text-sm text-stone-100 placeholder-stone-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Botões */}
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
              disabled={submitting || uploadingImage}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-xs font-semibold bg-[#4ade80] hover:bg-[#22c55e] text-[#0d130e] shadow-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

