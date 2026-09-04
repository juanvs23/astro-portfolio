import { loadConfig } from '../config.js';
import { connectMongo } from '../db.js';
import { ensureAdmin } from '../services/seed.js';
import { seedContent } from '../services/content-seed.js';
import mongoose from 'mongoose';

/**
 * CLI seed: `node --run seed` (or `tsx src/scripts/seed.ts`).
 * Connects to Mongo, ensures the admin user, seeds the initial content
 * (18 projects, 6 jobs, site-info, nav, social) and disconnects.
 * Idempotent — safe to run repeatedly.
 */
async function main(): Promise<void> {
  const config = loadConfig();

  console.log(`[seed] connecting to ${config.mongoUri}`);
  await connectMongo(config.mongoUri, { maxRetries: 3 });

  const admin = await ensureAdmin(config);
  console.log(`[seed] admin ready: ${admin.email} (role=${admin.role})`);

  const counts = await seedContent();
  console.log(
    `[seed] content seeded: projects=${counts.projects} jobs=${counts.jobs} ` +
      `siteInfo=${counts.siteInfo} nav=${counts.nav} social=${counts.social}`,
  );

  await mongoose.disconnect();
  console.log('[seed] done');
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exitCode = 1;
});