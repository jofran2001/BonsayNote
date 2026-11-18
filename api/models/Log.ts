import mongoose, { Schema, Document, Model } from 'mongoose';

export type LogCategory = 'poda' | 'adubacao' | 'transplante' | 'rega' | 'foto_rotina';

export interface ILog extends Document {
  _id: mongoose.Types.ObjectId;
  bonsaiId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  notes?: string;
  category: LogCategory;
  imageUrl: string;
  loggedAt: Date;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    bonsaiId: {
      type: Schema.Types.ObjectId,
      ref: 'Bonsai',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'O título do registro é obrigatório'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['poda', 'adubacao', 'transplante', 'rega', 'foto_rotina'],
      required: [true, 'A categoria é obrigatória'],
    },
    imageUrl: {
      type: String,
      required: [true, 'A foto do registro é obrigatória'],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'logs',
  }
);

export const LogModel: Model<ILog> =
  mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

