import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectMongo } from './db.js';
import { startTestMongo, stopTestMongo, type TestMongoHandle } from './test/db.js';

let mongo: TestMongoHandle;

beforeAll(async () => {
  mongo = await startTestMongo();
  await mongoose.disconnect();
});
afterAll(async () => {
  await stopTestMongo();
});

describe('connectMongo (task 1.2)', () => {
  it('connects to a reachable Mongo URI and leaves mongoose ready', async () => {
    await connectMongo(mongo.uri, { maxRetries: 1 });
    expect(mongoose.connection.readyState).toBe(1);
    await mongoose.disconnect();
  });

  it('retries then rejects when the Mongo URI is unreachable', async () => {
    await expect(
      connectMongo('mongodb://127.0.0.1:1/nowhere', {
        maxRetries: 2,
        retryDelayMs: 10,
        serverSelectionTimeoutMS: 200,
      }),
    ).rejects.toThrow();
  });
});