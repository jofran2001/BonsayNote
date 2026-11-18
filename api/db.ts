import mongoose from 'mongoose';
import { UserModel } from './models/User.js';
import { BonsaiModel } from './models/Bonsai.js';
import { LogModel } from './models/Log.js';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: GlobalMongoose | undefined;
}

const cache: GlobalMongoose = global._mongooseCache || {
  conn: null,
  promise: null,
};
global._mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error(
      'A variável de ambiente MONGODB_URI não está definida. Configure-a no arquivo .env.'
    );
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
}

export { UserModel, BonsaiModel, LogModel };
