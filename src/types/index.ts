export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface PopulatedUserRef {
  _id: string;
  name: string;
  email: string;
}

export type LogCategory =
  | 'poda'
  | 'adubacao'
  | 'transplante'
  | 'rega'
  | 'foto_rotina';

export interface Bonsai {
  _id: string;
  ownerId: PopulatedUserRef | string;
  cultivatorId: PopulatedUserRef | string;
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

export interface BonsaiLog {
  _id: string;
  bonsaiId: string;
  authorId: PopulatedUserRef | string;
  title: string;
  notes?: string;
  category: LogCategory;
  imageUrl: string;
  loggedAt: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateBonsaiPayload {
  name: string;
  species: string;
  style: string;
  coverImageUrl: string;
  startDate?: string;
  isGift?: boolean;
  giftLetterContent?: string;
  initialLogTitle?: string;
  initialLogNotes?: string;
  initialLogCategory?: LogCategory;
}

export interface CreateLogPayload {
  title: string;
  notes?: string;
  category: LogCategory;
  imageUrl: string;
  loggedAt?: string;
}

export interface TransferBonsaiPayload {
  targetEmail: string;
  giftLetterContent?: string;
}
