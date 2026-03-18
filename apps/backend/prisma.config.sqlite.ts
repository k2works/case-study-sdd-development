import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = process.env["SQLITE_DB_PATH"] || "./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations-sqlite",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: `file:${path.resolve(dbPath)}`,
  },
});
