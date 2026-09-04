import mongoose from 'mongoose';

export interface ConnectOptions {
  serverSelectionTimeoutMS?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connects Mongoose to Mongo with a bounded retry loop.
 * Throws the last connection error after exhausting `maxRetries`, so the
 * caller can fail fast instead of hanging on a dead server.
 */
export async function connectMongo(
  uri: string,
  opts: ConnectOptions = {},
): Promise<typeof mongoose> {
  const {
    serverSelectionTimeoutMS = 5000,
    maxRetries = 3,
    retryDelayMs = 200,
  } = opts;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS });
      return mongoose;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(retryDelayMs);
      }
    }
  }
  throw lastError;
}