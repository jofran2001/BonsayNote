import {
  AuthResponse,
  Bonsai,
  BonsaiLog,
  CreateBonsaiPayload,
  CreateLogPayload,
  TransferBonsaiPayload,
  User,
} from '../types';

const TOKEN_STORAGE_KEY = 'bonsai_diary_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data?.message || `Ocorreu um erro na comunicação com o servidor (${response.status}).`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (payload: { name: string; email: string; password: string }) =>
      request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    me: () => request<{ user: User }>('/api/auth/me'),
  },

  bonsais: {
    list: () => request<Bonsai[]>('/api/bonsais'),

    getById: (id: string) => request<Bonsai>(`/api/bonsais/${id}`),

    create: (payload: CreateBonsaiPayload) =>
      request<Bonsai>('/api/bonsais', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateLetter: (id: string, giftLetterContent: string) =>
      request<Bonsai>(`/api/bonsais/${id}/letter`, {
        method: 'PUT',
        body: JSON.stringify({ giftLetterContent }),
      }),

    transfer: (id: string, payload: TransferBonsaiPayload) =>
      request<Bonsai>(`/api/bonsais/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  logs: {
    listByBonsai: (bonsaiId: string) =>
      request<BonsaiLog[]>(`/api/bonsais/${bonsaiId}/logs`),

    create: (bonsaiId: string, payload: CreateLogPayload) =>
      request<BonsaiLog>(`/api/bonsais/${bonsaiId}/logs`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};

/**
 * Processa um arquivo de imagem (da câmera do celular ou galeria):
 * 1. Se VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET estiverem configurados, envia para o Cloudinary.
 * 2. Caso contrário, redimensiona e comprime automaticamente em Base64 JPEG otimizado via HTML5 Canvas.
 */
export async function processImageUpload(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error('Falha ao enviar imagem para o Cloudinary.');
    }

    const result = await res.json();
    return result.secure_url as string;
  }

  return compressImageToBase64(file, 1080, 0.82);
}

function compressImageToBase64(
  file: File,
  maxDimension = 1080,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

