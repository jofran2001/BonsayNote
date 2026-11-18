import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBonsai extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  cultivatorId: mongoose.Types.ObjectId;
  name: string;
  species: string;
  style: string;
  coverImageUrl: string;
  startDate: Date;
  isGift: boolean;
  giftLetterContent?: string;
  giftedAt?: Date;
  createdAt: Date;
}

const BonsaiSchema = new Schema<IBonsai>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cultivatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'O nome do bonsai é obrigatório'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'A espécie é obrigatória'],
      trim: true,
    },
    style: {
      type: String,
      required: [true, 'O estilo é obrigatório'],
      trim: true,
    },
    coverImageUrl: {
      type: String,
      required: [true, 'A imagem de capa é obrigatória'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    isGift: {
      type: Boolean,
      default: false,
    },
    giftLetterContent: {
      type: String,
      default: '',
    },
    giftedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'bonsais',
  }
);

export const BonsaiModel: Model<IBonsai> =
  mongoose.models.Bonsai || mongoose.model<IBonsai>('Bonsai', BonsaiSchema);

