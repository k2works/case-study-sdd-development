import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';

const dbProvider = process.env.DB_PROVIDER || 'postgresql';

let prismaInstance: PrismaClient;

if (dbProvider === 'sqlite') {
  const path = await import('node:path');
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const dbPath = process.env.SQLITE_DB_PATH || './prisma/dev.db';
  const url = `file:${path.resolve(dbPath)}`;
  const adapter = new PrismaBetterSqlite3({ url });
  prismaInstance = new PrismaClient({ adapter });
} else {
  const pg = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const connectionString = process.env.DATABASE_URL!;
  const pool = new pg.default.Pool({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;
