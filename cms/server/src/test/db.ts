import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | null = null;

export interface TestMongoHandle {
  uri: string;
  mongod: MongoMemoryServer;
}

/**
 * Boots an in-memory MongoDB (mongodb-memory-server) and connects Mongoose.
 * Call once per test file in `beforeAll`. Returns the URI and server handle
 * for teardown / direct connection.
 */
export async function startTestMongo(): Promise<TestMongoHandle> {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  return { uri, mongod };
}

export async function stopTestMongo(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

/** Drops all documents from every collection (between tests). */
export async function clearDb(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
}