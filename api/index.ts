import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  connectToDatabase,
  isUsingMemoryStore,
  memoryDb,
  generateObjectId,
  UserModel,
  BonsaiModel,
  LogModel,
} from './db.js';
import {
  authenticateJWT,
  AuthenticatedRequest,
  signToken,
} from './middleware/auth.js';
import { LogCategory } from './models/Log.js';

dotenv.config();

const app = express();

app.use(cors());
// Limite ampliado para suportar upload de fotos em Base64 compactado
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Middleware para garantir conexão com o banco antes de cada requisição
app.use('/api', async (_req, _res, next) => {
  await connectToDatabase();
  next();
});

// Helper para popular dados básicos de usuário no modo em memória
function populateMemoryUser(userId: string) {
  const u = memoryDb.users.find((item) => item._id === userId);
  if (!u) {
    return { _id: userId, name: 'Cultivador', email: '' };
  }
  return { _id: u._id, name: u.name, email: u.email };
}

function formatMemoryBonsai(b: (typeof memoryDb.bonsais)[number]) {
  return {
    ...b,
    ownerId: populateMemoryUser(b.ownerId),
    cultivatorId: populateMemoryUser(b.cultivatorId),
  };
}

// ============================================================================
// STATUS DA API
// ============================================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    storage: isUsingMemoryStore() ? 'memory-demo' : 'mongodb-atlas',
  });
});

// ============================================================================
// 1. AUTENTICAÇÃO (/api/auth)
// ============================================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: 'Preencha nome, e-mail e senha para criar sua conta.' });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedName = String(name).trim();
    const passwordHash = await bcrypt.hash(String(password), 10);

    if (isUsingMemoryStore()) {
      const exists = memoryDb.users.find((u) => u.email === normalizedEmail);
      if (exists) {
        res.status(409).json({ message: 'Este e-mail já está cadastrado no Bonsai Diary.' });
        return;
      }

      const newUser = {
        _id: generateObjectId(),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      memoryDb.users.push(newUser);

      const userPayload = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      };
      const token = signToken(userPayload);
      res.status(201).json({ token, user: userPayload });
      return;
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: 'Este e-mail já está cadastrado no Bonsai Diary.' });
      return;
    }

    const createdUser = await UserModel.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    const userPayload = {
      id: createdUser._id.toString(),
      name: createdUser.name,
      email: createdUser.email,
    };
    const token = signToken(userPayload);

    res.status(201).json({ token, user: userPayload });
  } catch (error) {
    console.error('Erro em POST /api/auth/register:', error);
    res.status(500).json({ message: 'Erro interno ao criar conta de usuário.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'Informe seu e-mail e senha para entrar.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isUsingMemoryStore()) {
      const user = memoryDb.users.find((u) => u.email === normalizedEmail);
      if (!user) {
        res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        return;
      }

      const validPassword = await bcrypt.compare(String(password), user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        return;
      }

      const userPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
      };
      const token = signToken(userPayload);
      res.json({ token, user: userPayload });
      return;
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: 'E-mail ou senha incorretos.' });
      return;
    }

    const validPassword = await bcrypt.compare(String(password), user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: 'E-mail ou senha incorretos.' });
      return;
    }

    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    const token = signToken(userPayload);

    res.json({ token, user: userPayload });
  } catch (error) {
    console.error('Erro em POST /api/auth/login:', error);
    res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Não autenticado.' });
      return;
    }

    if (isUsingMemoryStore()) {
      const user = memoryDb.users.find((u) => u._id === req.user!.id);
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
      return;
    }

    const user = await UserModel.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro em GET /api/auth/me:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do usuário.' });
  }
});

// ============================================================================
// 2. BONSAIS (/api/bonsais)
// ============================================================================

// GET /api/bonsais
app.get('/api/bonsais', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isUsingMemoryStore()) {
      const list = memoryDb.bonsais
        .filter((b) => b.ownerId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(formatMemoryBonsai);

      res.json(list);
      return;
    }

    const bonsais = await BonsaiModel.find({ ownerId: userId })
      .populate('cultivatorId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bonsais);
  } catch (error) {
    console.error('Erro em GET /api/bonsais:', error);
    res.status(500).json({ message: 'Erro ao listar seus bonsais.' });
  }
});

// POST /api/bonsais
app.post('/api/bonsais', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      species,
      style,
      coverImageUrl,
      startDate,
      isGift,
      giftLetterContent,
      initialLogTitle,
      initialLogNotes,
      initialLogCategory,
    } = req.body;

    if (!name?.trim() || !species?.trim() || !style?.trim() || !coverImageUrl) {
      res.status(400).json({
        message: 'Nome, espécie, estilo e foto de capa do bonsai são obrigatórios.',
      });
      return;
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const hasLetter = Boolean(giftLetterContent && String(giftLetterContent).trim().length > 0);

    if (isUsingMemoryStore()) {
      const newBonsai = {
        _id: generateObjectId(),
        ownerId: userId,
        cultivatorId: userId,
        name: String(name).trim(),
        species: String(species).trim(),
        style: String(style).trim(),
        coverImageUrl: String(coverImageUrl),
        startDate: parsedStartDate.toISOString(),
        isGift: Boolean(isGift || hasLetter),
        giftLetterContent: giftLetterContent ? String(giftLetterContent).trim() : '',
        createdAt: new Date().toISOString(),
      };
      memoryDb.bonsais.push(newBonsai);

      // Cria um registro inaugural automático na timeline
      memoryDb.logs.push({
        _id: generateObjectId(),
        bonsaiId: newBonsai._id,
        authorId: userId,
        title: initialLogTitle?.trim() || 'Início do Cultivo no Bonsai Diary',
        notes:
          initialLogNotes?.trim() ||
          `Primeiro registro oficial de ${newBonsai.name} (${newBonsai.species}) no estilo ${newBonsai.style}.`,
        category: (initialLogCategory as LogCategory) || 'foto_rotina',
        imageUrl: newBonsai.coverImageUrl,
        loggedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(formatMemoryBonsai(newBonsai));
      return;
    }

    const created = await BonsaiModel.create({
      ownerId: userId,
      cultivatorId: userId,
      name: String(name).trim(),
      species: String(species).trim(),
      style: String(style).trim(),
      coverImageUrl: String(coverImageUrl),
      startDate: parsedStartDate,
      isGift: Boolean(isGift || hasLetter),
      giftLetterContent: giftLetterContent ? String(giftLetterContent).trim() : '',
    });

    await LogModel.create({
      bonsaiId: created._id,
      authorId: userId,
      title: initialLogTitle?.trim() || 'Início do Cultivo no Bonsai Diary',
      notes:
        initialLogNotes?.trim() ||
        `Primeiro registro oficial de ${created.name} (${created.species}) no estilo ${created.style}.`,
      category: (initialLogCategory as LogCategory) || 'foto_rotina',
      imageUrl: created.coverImageUrl,
      loggedAt: new Date(),
    });

    const populated = await BonsaiModel.findById(created._id)
      .populate('cultivatorId', 'name email')
      .populate('ownerId', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Erro em POST /api/bonsais:', error);
    res.status(500).json({ message: 'Erro ao cadastrar o novo bonsai.' });
  }
});

// GET /api/bonsais/:id
app.get('/api/bonsais/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bonsaiId = req.params.id;

    if (isUsingMemoryStore()) {
      const bonsai = memoryDb.bonsais.find((b) => b._id === bonsaiId);
      if (!bonsai) {
        res.status(404).json({ message: 'Bonsai não encontrado.' });
        return;
      }

      if (bonsai.ownerId !== userId && bonsai.cultivatorId !== userId) {
        res.status(403).json({ message: 'Você não tem permissão para visualizar este bonsai.' });
        return;
      }

      res.json(formatMemoryBonsai(bonsai));
      return;
    }

    const bonsai = await BonsaiModel.findById(bonsaiId)
      .populate('cultivatorId', 'name email')
      .populate('ownerId', 'name email');

    if (!bonsai) {
      res.status(404).json({ message: 'Bonsai não encontrado.' });
      return;
    }

    const ownerIdStr =
      typeof bonsai.ownerId === 'object' && bonsai.ownerId !== null && '_id' in bonsai.ownerId
        ? String((bonsai.ownerId as { _id: unknown })._id)
        : String(bonsai.ownerId);

    const cultivatorIdStr =
      typeof bonsai.cultivatorId === 'object' &&
      bonsai.cultivatorId !== null &&
      '_id' in bonsai.cultivatorId
        ? String((bonsai.cultivatorId as { _id: unknown })._id)
        : String(bonsai.cultivatorId);

    if (ownerIdStr !== userId && cultivatorIdStr !== userId) {
      res.status(403).json({ message: 'Você não tem permissão para visualizar este bonsai.' });
      return;
    }

    res.json(bonsai);
  } catch (error) {
    console.error('Erro em GET /api/bonsais/:id:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do bonsai.' });
  }
});

// PUT /api/bonsais/:id/letter (Permite ao cultivador/dono atualizar a carta antes ou durante o cultivo)
app.put(
  '/api/bonsais/:id/letter',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const bonsaiId = req.params.id;
      const { giftLetterContent } = req.body;

      if (isUsingMemoryStore()) {
        const bonsai = memoryDb.bonsais.find((b) => b._id === bonsaiId);
        if (!bonsai) {
          res.status(404).json({ message: 'Bonsai não encontrado.' });
          return;
        }
        if (bonsai.ownerId !== userId && bonsai.cultivatorId !== userId) {
          res.status(403).json({ message: 'Sem permissão para editar a carta deste bonsai.' });
          return;
        }
        bonsai.giftLetterContent = String(giftLetterContent || '').trim();
        bonsai.isGift = true;
        res.json(formatMemoryBonsai(bonsai));
        return;
      }

      const bonsai = await BonsaiModel.findById(bonsaiId);
      if (!bonsai) {
        res.status(404).json({ message: 'Bonsai não encontrado.' });
        return;
      }
      if (
        bonsai.ownerId.toString() !== userId &&
        bonsai.cultivatorId.toString() !== userId
      ) {
        res.status(403).json({ message: 'Sem permissão para editar a carta deste bonsai.' });
        return;
      }

      bonsai.giftLetterContent = String(giftLetterContent || '').trim();
      bonsai.isGift = true;
      await bonsai.save();

      const populated = await BonsaiModel.findById(bonsai._id)
        .populate('cultivatorId', 'name email')
        .populate('ownerId', 'name email');

      res.json(populated);
    } catch (error) {
      console.error('Erro em PUT /api/bonsais/:id/letter:', error);
      res.status(500).json({ message: 'Erro ao salvar a carta do presente.' });
    }
  }
);

// POST /api/bonsais/:id/transfer
app.post(
  '/api/bonsais/:id/transfer',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const bonsaiId = req.params.id;
      const { targetEmail, giftLetterContent } = req.body;

      if (!targetEmail?.trim()) {
        res.status(400).json({ message: 'Informe o e-mail do destinatário para presentear.' });
        return;
      }

      const normalizedTargetEmail = String(targetEmail).toLowerCase().trim();

      if (isUsingMemoryStore()) {
        const bonsai = memoryDb.bonsais.find((b) => b._id === bonsaiId);
        if (!bonsai) {
          res.status(404).json({ message: 'Bonsai não encontrado.' });
          return;
        }

        if (bonsai.ownerId !== userId) {
          res.status(403).json({
            message: 'Apenas o guardião atual deste bonsai pode transferi-lo como presente.',
          });
          return;
        }

        const targetUser = memoryDb.users.find((u) => u.email === normalizedTargetEmail);
        if (!targetUser) {
          res.status(404).json({
            message: `Nenhum usuário encontrado com o e-mail "${normalizedTargetEmail}". Peça para a pessoa criar uma conta no Bonsai Diary primeiro!`,
          });
          return;
        }

        if (targetUser._id === userId) {
          res.status(400).json({
            message: 'Você já é o guardião atual deste bonsai. Informe o e-mail de outra pessoa.',
          });
          return;
        }

        const nowIso = new Date().toISOString();
        bonsai.ownerId = targetUser._id;
        bonsai.isGift = true;
        bonsai.giftedAt = nowIso;
        if (giftLetterContent !== undefined && String(giftLetterContent).trim() !== '') {
          bonsai.giftLetterContent = String(giftLetterContent).trim();
        }

        memoryDb.logs.push({
          _id: generateObjectId(),
          bonsaiId: bonsai._id,
          authorId: userId,
          title: `Bonsai presenteado para ${targetUser.name}`,
          notes: `Transferência afetiva de posse realizada por ${req.user!.name} para ${targetUser.name} (${targetUser.email}).`,
          category: 'foto_rotina',
          imageUrl: bonsai.coverImageUrl,
          loggedAt: nowIso,
          createdAt: nowIso,
        });

        res.json(formatMemoryBonsai(bonsai));
        return;
      }

      const bonsai = await BonsaiModel.findById(bonsaiId);
      if (!bonsai) {
        res.status(404).json({ message: 'Bonsai não encontrado.' });
        return;
      }

      if (bonsai.ownerId.toString() !== userId) {
        res.status(403).json({
          message: 'Apenas o guardião atual deste bonsai pode transferi-lo como presente.',
        });
        return;
      }

      const targetUser = await UserModel.findOne({ email: normalizedTargetEmail });
      if (!targetUser) {
        res.status(404).json({
          message: `Nenhum usuário encontrado com o e-mail "${normalizedTargetEmail}". Peça para a pessoa se cadastrar no Bonsai Diary primeiro!`,
        });
        return;
      }

      if (targetUser._id.toString() === userId) {
        res.status(400).json({
          message: 'Você já é o guardião atual deste bonsai. Informe o e-mail de outra pessoa.',
        });
        return;
      }

      const now = new Date();
      bonsai.ownerId = targetUser._id;
      bonsai.isGift = true;
      bonsai.giftedAt = now;
      if (giftLetterContent !== undefined && String(giftLetterContent).trim() !== '') {
        bonsai.giftLetterContent = String(giftLetterContent).trim();
      }
      await bonsai.save();

      await LogModel.create({
        bonsaiId: bonsai._id,
        authorId: userId,
        title: `Bonsai presenteado para ${targetUser.name}`,
        notes: `Transferência afetiva de posse realizada por ${req.user!.name} para ${targetUser.name} (${targetUser.email}).`,
        category: 'foto_rotina',
        imageUrl: bonsai.coverImageUrl,
        loggedAt: now,
      });

      const populated = await BonsaiModel.findById(bonsai._id)
        .populate('cultivatorId', 'name email')
        .populate('ownerId', 'name email');

      res.json(populated);
    } catch (error) {
      console.error('Erro em POST /api/bonsais/:id/transfer:', error);
      res.status(500).json({ message: 'Erro ao transferir a titularidade do bonsai.' });
    }
  }
);

// ============================================================================
// 3. LOGS DA LINHA DO TEMPO (/api/bonsais/:bonsaiId/logs)
// ============================================================================

// GET /api/bonsais/:bonsaiId/logs
app.get(
  '/api/bonsais/:bonsaiId/logs',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bonsaiId } = req.params;

      if (isUsingMemoryStore()) {
        const logs = memoryDb.logs
          .filter((l) => l.bonsaiId === bonsaiId)
          .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
          .map((l) => ({
            ...l,
            authorId: populateMemoryUser(l.authorId),
          }));

        res.json(logs);
        return;
      }

      const logs = await LogModel.find({ bonsaiId })
        .populate('authorId', 'name email')
        .sort({ loggedAt: -1 });

      res.json(logs);
    } catch (error) {
      console.error('Erro em GET /api/bonsais/:bonsaiId/logs:', error);
      res.status(500).json({ message: 'Erro ao carregar os registros da linha do tempo.' });
    }
  }
);

// POST /api/bonsais/:bonsaiId/logs
app.post(
  '/api/bonsais/:bonsaiId/logs',
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { bonsaiId } = req.params;
      const { title, notes, category, imageUrl, loggedAt } = req.body;

      if (!title?.trim() || !category || !imageUrl) {
        res.status(400).json({
          message: 'Título, categoria e foto são obrigatórios para registrar na linha do tempo.',
        });
        return;
      }

      const validCategories: LogCategory[] = [
        'poda',
        'adubacao',
        'transplante',
        'rega',
        'foto_rotina',
      ];
      if (!validCategories.includes(category)) {
        res.status(400).json({ message: 'Categoria de cuidado inválida.' });
        return;
      }

      const parsedDate = loggedAt ? new Date(loggedAt) : new Date();

      if (isUsingMemoryStore()) {
        const bonsai = memoryDb.bonsais.find((b) => b._id === bonsaiId);
        if (!bonsai) {
          res.status(404).json({ message: 'Bonsai não encontrado.' });
          return;
        }

        const newLog = {
          _id: generateObjectId(),
          bonsaiId,
          authorId: userId,
          title: String(title).trim(),
          notes: notes ? String(notes).trim() : '',
          category: category as LogCategory,
          imageUrl: String(imageUrl),
          loggedAt: parsedDate.toISOString(),
          createdAt: new Date().toISOString(),
        };
        memoryDb.logs.push(newLog);

        res.status(201).json({
          ...newLog,
          authorId: populateMemoryUser(userId),
        });
        return;
      }

      const bonsai = await BonsaiModel.findById(bonsaiId);
      if (!bonsai) {
        res.status(404).json({ message: 'Bonsai não encontrado.' });
        return;
      }

      const createdLog = await LogModel.create({
        bonsaiId,
        authorId: userId,
        title: String(title).trim(),
        notes: notes ? String(notes).trim() : '',
        category,
        imageUrl: String(imageUrl),
        loggedAt: parsedDate,
      });

      const populated = await LogModel.findById(createdLog._id).populate(
        'authorId',
        'name email'
      );

      res.status(201).json(populated);
    } catch (error) {
      console.error('Erro em POST /api/bonsais/:bonsaiId/logs:', error);
      res.status(500).json({ message: 'Erro ao adicionar registro na linha do tempo.' });
    }
  }
);

export default app;

