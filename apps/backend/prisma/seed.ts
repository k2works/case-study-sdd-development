import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 仕入先テストデータ
  const supplierA = await prisma.supplier.upsert({
    where: { supplierId: 1 },
    update: {},
    create: {
      name: '花卉卸売 A 社',
      phone: '03-1111-2222',
    },
  });

  const supplierB = await prisma.supplier.upsert({
    where: { supplierId: 2 },
    update: {},
    create: {
      name: '花卉卸売 B 社',
      phone: '03-3333-4444',
    },
  });

  const supplierC = await prisma.supplier.upsert({
    where: { supplierId: 3 },
    update: {},
    create: {
      name: '花卉卸売 C 社',
      phone: '03-5555-6666',
    },
  });

  console.log('Suppliers seeded:', { supplierA, supplierB, supplierC });
  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
