import { describe, it, expect } from 'vitest';
import { loadConfig, parseCors } from './config.js';

describe('config loader (task 1.2)', () => {
  it('throws when JWT_SECRET is missing', () => {
    expect(() => loadConfig({})).toThrow(/JWT_SECRET/);
  });

  it('returns jwtSecret and sensible defaults when only JWT_SECRET is set', () => {
    const cfg = loadConfig({ JWT_SECRET: 's3cret' });
    expect(cfg.jwtSecret).toBe('s3cret');
    expect(cfg.mongoUri).toBe('mongodb://127.0.0.1:27017/cms');
    expect(cfg.accessTokenTtlSec).toBe(900); // 15 min
    expect(cfg.refreshTokenTtlSec).toBe(2592000); // 30 days
  });

  it('honours MONGO_URI and CORS_ORIGINS from env', () => {
    const cfg = loadConfig({
      JWT_SECRET: 's3cret',
      MONGO_URI: 'mongodb://atlas:27017/prod',
      CORS_ORIGINS: 'https://a.example.com, https://b.example.com',
    });
    expect(cfg.mongoUri).toBe('mongodb://atlas:27017/prod');
    expect(cfg.corsOrigins).toEqual([
      'https://a.example.com',
      'https://b.example.com',
    ]);
  });

  it('defaults corsOrigins to an empty allow-list (no origin allowed)', () => {
    const cfg = loadConfig({ JWT_SECRET: 's3cret' });
    expect(cfg.corsOrigins).toEqual([]);
  });
});

describe('parseCors (pure)', () => {
  it('splits, trims and drops empty entries', () => {
    expect(parseCors(' https://x.dev , , https://y.dev ')).toEqual([
      'https://x.dev',
      'https://y.dev',
    ]);
  });

  it('returns empty array for undefined / blank input', () => {
    expect(parseCors(undefined)).toEqual([]);
    expect(parseCors('')).toEqual([]);
    expect(parseCors('   ,  ,')).toEqual([]);
  });
});