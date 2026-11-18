import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from './models/User.js';
import { BonsaiModel } from './models/Bonsai.js';
import { LogModel, LogCategory } from './models/Log.js';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  usingMemoryFallback: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: GlobalMongoose | undefined;
}

const cache: GlobalMongoose = global._mongooseCache || {
  conn: null,
  promise: null,
  usingMemoryFallback: false,
};
global._mongooseCache = cache;

export async function connectToDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri || uri.includes('<usuario>') || uri.includes('<senha>')) {
    cache.usingMemoryFallback = true;
    await ensureMemorySeeded();
    return false;
  }

  if (cache.conn) {
    return true;
  }

  try {
    if (!cache.promise) {
      cache.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
    }
    cache.conn = await cache.promise;
    cache.usingMemoryFallback = false;
    return true;
  } catch (err) {
    console.warn(
      '⚠️ Não foi possível conectar ao MongoDB Atlas. Utilizando banco em memória para execução imediata:',
      (err as Error).message
    );
    cache.promise = null;
    cache.usingMemoryFallback = true;
    await ensureMemorySeeded();
    return false;
  }
}

export function isUsingMemoryStore(): boolean {
  return cache.usingMemoryFallback;
}

// ============================================================================
// In-Memory Fallback Store (para execução imediata antes de configurar o .env)
// ============================================================================

export interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface MemoryBonsai {
  _id: string;
  ownerId: string;
  cultivatorId: string;
  name: string;
  species: string;
  style: string;
  coverImageUrl: string;
  startDate: string;
  isGift: boolean;
  giftLetterContent?: string;
  giftedAt?: string;
  createdAt: string;
}

export interface MemoryLog {
  _id: string;
  bonsaiId: string;
  authorId: string;
  title: string;
  notes?: string;
  category: LogCategory;
  imageUrl: string;
  loggedAt: string;
  createdAt: string;
}

interface MemoryDatabase {
  seeded: boolean;
  users: MemoryUser[];
  bonsais: MemoryBonsai[];
  logs: MemoryLog[];
}

declare global {
  // eslint-disable-next-line no-var
  var _memoryDb: MemoryDatabase | undefined;
}

export const memoryDb: MemoryDatabase = global._memoryDb || {
  seeded: false,
  users: [],
  bonsais: [],
  logs: [],
};
global._memoryDb = memoryDb;

export function generateObjectId(): string {
  return new mongoose.Types.ObjectId().toString();
}

export async function ensureMemorySeeded(): Promise<void> {
  if (memoryDb.seeded) return;
  memoryDb.seeded = true;

  const passwordHash = await bcrypt.hash('123456', 10);

  const cultivatorId = '672e9a001122334455667701';
  const recipientId = '672e9a001122334455667702';

  memoryDb.users.push(
    {
      _id: cultivatorId,
      name: 'Kenji Takahashi',
      email: 'cultivador@bonsai.app',
      passwordHash,
      createdAt: new Date('2025-03-10T10:00:00Z').toISOString(),
    },
    {
      _id: recipientId,
      name: 'Helena Moreira',
      email: 'helena@bonsai.app',
      passwordHash,
      createdAt: new Date('2025-04-02T14:30:00Z').toISOString(),
    }
  );

  const bonsai1Id = '672e9b001122334455668801';
  const bonsai2Id = '672e9b001122334455668802';

  memoryDb.bonsais.push(
    {
      _id: bonsai1Id,
      ownerId: cultivatorId,
      cultivatorId: cultivatorId,
      name: 'Sōkan da Amizade',
      species: 'Buxus sempervirens',
      style: 'Sōkan (Tronco Duplo)',
      coverImageUrl:
        'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1000&q=80',
      startDate: new Date('2025-03-15T09:00:00Z').toISOString(),
      isGift: true,
      giftLetterContent:
        'No estilo Sōkan (双幹), dois troncos nascem de uma mesma raiz e crescem lado a lado — um mais forte e acolhedor, outro esguio e luminoso — compartilhando a mesma terra, a mesma chuva e o mesmo sol.\n\nIniciei o cultivo deste Buxus pensando na nossa jornada. Cada poda e cada limpeza de nebari foram feitas com paciência para que, hoje, esta árvore viva continue sua história em suas mãos. Que ela lembre sempre que raízes profundas sustentam qualquer estação.',
      createdAt: new Date('2025-03-15T09:00:00Z').toISOString(),
    },
    {
      _id: bonsai2Id,
      ownerId: recipientId,
      cultivatorId: cultivatorId,
      name: 'Brisa do Outono',
      species: 'Acer palmatum',
      style: 'Moyogi (Ereto Informal)',
      coverImageUrl:
        'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?auto=format&fit=crop&w=1000&q=80',
      startDate: new Date('2024-09-20T09:00:00Z').toISOString(),
      isGift: true,
      giftLetterContent:
        'Este Acer palmatum no estilo Moyogi carrega nas curvas do seu tronco a beleza da adaptação. Não importa a força do vento, ele se curva com leveza e volta a buscar a luz.\n\nCultivei suas primeiras brotações durante o último ano e agora entrego a você este pequeno guardião das estações. Cuide dele com água fresca pela manhã e observe como cada folha nova conta a passagem do tempo.',
      giftedAt: new Date('2025-09-12T18:00:00Z').toISOString(),
      createdAt: new Date('2024-09-20T09:00:00Z').toISOString(),
    }
  );

  memoryDb.logs.push(
    {
      _id: generateObjectId(),
      bonsaiId: bonsai1Id,
      authorId: cultivatorId,
      title: 'Seleção do pré-bonsai e limpeza do Nebari',
      notes:
        'Abertura cuidadosa do torrão original para revelar a base única de onde partem os dois troncos (Sōkan). Raízes superficiais cruzadas foram corrigidas.',
      category: 'transplante',
      imageUrl:
        'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-03-16T11:20:00Z').toISOString(),
      createdAt: new Date('2025-03-16T11:20:00Z').toISOString(),
    },
    {
      _id: generateObjectId(),
      bonsaiId: bonsai1Id,
      authorId: cultivatorId,
      title: 'Primeira Poda Estrutural e Aplicação de Pasta Selante',
      notes:
        'Definição do tronco pai e do tronco filho em harmonia triangular. Cortes selados para cicatrização limpa da casca.',
      category: 'poda',
      imageUrl:
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-05-04T15:40:00Z').toISOString(),
      createdAt: new Date('2025-05-04T15:40:00Z').toISOString(),
    },
    {
      _id: generateObjectId(),
      bonsaiId: bonsai1Id,
      authorId: cultivatorId,
      title: 'Adubação Orgânica Bokashi de Primavera',
      notes:
        'Aplicação de trouxinhas de adubo orgânico de liberação lenta nas bordas do vaso cerâmico. Brotação vigorosa e folhas verde-esmeralda.',
      category: 'adubacao',
      imageUrl:
        'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-08-19T09:15:00Z').toISOString(),
      createdAt: new Date('2025-08-19T09:15:00Z').toISOString(),
    },
    {
      _id: generateObjectId(),
      bonsaiId: bonsai2Id,
      authorId: cultivatorId,
      title: 'Transplante para vaso esmaltado japonês',
      notes:
        'Substrato drenante (Akadama + Caqueira + Pedrisco). Fixação com arame de alumínio anodizado.',
      category: 'transplante',
      imageUrl:
        'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-02-10T10:00:00Z').toISOString(),
      createdAt: new Date('2025-02-10T10:00:00Z').toISOString(),
    },
    {
      _id: generateObjectId(),
      bonsaiId: bonsai2Id,
      authorId: cultivatorId,
      title: 'Bonsai presenteado para Helena Moreira',
      notes: 'Entrega oficial da árvore com sua carta de simbologia.',
      category: 'foto_rotina',
      imageUrl:
        'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-09-12T18:00:00Z').toISOString(),
      createdAt: new Date('2025-09-12T18:00:00Z').toISOString(),
    },
    {
      _id: generateObjectId(),
      bonsaiId: bonsai2Id,
      authorId: recipientId,
      title: 'Primeira manhã na varanda nova',
      notes:
        'Recebeu sol suave das 8h às 10h30 e rega abundante até escorrer pelos furos de drenagem. Muito feliz com o presente!',
      category: 'rega',
      imageUrl:
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=900&q=80',
      loggedAt: new Date('2025-09-14T08:45:00Z').toISOString(),
      createdAt: new Date('2025-09-14T08:45:00Z').toISOString(),
    }
  );
}

export { UserModel, BonsaiModel, LogModel };

