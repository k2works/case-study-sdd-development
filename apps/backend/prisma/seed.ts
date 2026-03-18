import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const dbProvider = process.env.DB_PROVIDER || 'postgresql';

let prisma: PrismaClient;
let pgPool: InstanceType<typeof import('pg').Pool> | null = null;

if (dbProvider === 'sqlite') {
  const path = await import('node:path');
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const dbPath = process.env.SQLITE_DB_PATH || './prisma/dev.db';
  const url = `file:${path.resolve(dbPath)}`;
  const adapter = new PrismaBetterSqlite3({ url });
  prisma = new PrismaClient({ adapter });
} else {
  const pg = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  pgPool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pgPool);
  prisma = new PrismaClient({ adapter });
}

async function main() {
  console.log(`Seeding database (${dbProvider})...`);

  // 既存データを削除（外部キー制約の順序で）
  await prisma.arrival.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productComposition.deleteMany();
  await prisma.product.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.customer.deleteMany();

  // シーケンスをリセット（PostgreSQL のみ）
  if (dbProvider === 'postgresql') {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE suppliers_supplier_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE items_item_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE products_product_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE orders_order_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE stocks_stock_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE purchase_orders_purchase_order_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE arrivals_arrival_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE customers_customer_id_seq RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE destinations_destination_id_seq RESTART WITH 1`);
  } else {
    // SQLite: autoincrement カウンタをリセット
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);
  }

  console.log('Existing data cleared.');

  // --- 顧客 ---
  const customers = await prisma.customer.createMany({
    data: [
      { name: '山田花子', phone: '03-1234-5678', email: 'hanako@example.com' },
      { name: '佐藤太郎', phone: '03-8765-4321', email: 'taro@example.com' },
    ],
  });
  console.log(`Customers created: ${customers.count}`);

  // --- 届け先 ---
  const destinations = await prisma.destination.createMany({
    data: [
      { customerId: 1, name: '田中太郎', address: '東京都渋谷区1-2-3', phone: '090-1234-5678' },
      { customerId: 1, name: '鈴木花子', address: '東京都新宿区4-5-6', phone: '090-8765-4321' },
      { customerId: 2, name: '高橋一郎', address: '東京都品川区7-8-9', phone: '090-1111-2222' },
    ],
  });
  console.log(`Destinations created: ${destinations.count}`);

  // --- 仕入先 ---
  const suppliers = await prisma.supplier.createMany({
    data: [
      { name: '花卉卸売 A 社', phone: '03-1111-2222' },
      { name: '花卉卸売 B 社', phone: '03-3333-4444' },
      { name: '花卉卸売 C 社', phone: '03-5555-6666' },
    ],
  });
  console.log(`Suppliers created: ${suppliers.count}`);

  // --- 単品（花） ---
  const items = await prisma.item.createMany({
    data: [
      { name: 'バラ（赤）', qualityRetentionDays: 5, purchaseUnit: 10, leadTimeDays: 2, supplierId: 1 },
      { name: 'カスミソウ', qualityRetentionDays: 7, purchaseUnit: 20, leadTimeDays: 3, supplierId: 1 },
      { name: 'ユリ（白）', qualityRetentionDays: 3, purchaseUnit: 5, leadTimeDays: 2, supplierId: 2 },
      { name: 'ガーベラ（ピンク）', qualityRetentionDays: 5, purchaseUnit: 10, leadTimeDays: 3, supplierId: 2 },
      { name: 'カーネーション（赤）', qualityRetentionDays: 7, purchaseUnit: 20, leadTimeDays: 2, supplierId: 3 },
    ],
  });
  console.log(`Items created: ${items.count}`);

  // --- 商品（花束） ---
  const products = await prisma.product.createMany({
    data: [
      { name: 'レッドローズブーケ', price: 5000, description: '赤いバラとカスミソウの定番ブーケ' },
      { name: 'ホワイトリリーアレンジ', price: 4500, description: '白いユリをメインにした上品なアレンジメント' },
      { name: 'ミックスフラワーブーケ', price: 3800, description: 'ガーベラとカーネーションの明るいブーケ' },
    ],
  });
  console.log(`Products created: ${products.count}`);

  // --- 商品構成 ---
  const compositions = await prisma.productComposition.createMany({
    data: [
      // レッドローズブーケ: バラ（赤）5本 + カスミソウ 3本
      { productId: 1, itemId: 1, quantity: 5 },
      { productId: 1, itemId: 2, quantity: 3 },
      // ホワイトリリーアレンジ: ユリ（白）3本 + カスミソウ 5本
      { productId: 2, itemId: 3, quantity: 3 },
      { productId: 2, itemId: 2, quantity: 5 },
      // ミックスフラワーブーケ: ガーベラ 4本 + カーネーション 6本
      { productId: 3, itemId: 4, quantity: 4 },
      { productId: 3, itemId: 5, quantity: 6 },
    ],
  });
  console.log(`Product compositions created: ${compositions.count}`);

  // --- 在庫ロット（デモ用の初期在庫） ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const stockLots = await prisma.stock.createMany({
    data: [
      // バラ（赤）: 20本 在庫
      { itemId: 1, quantity: 20, arrivalDate: addDays(today, -2), expiryDate: addDays(today, 3), status: '有効' },
      // カスミソウ: 50本 在庫
      { itemId: 2, quantity: 50, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 6), status: '有効' },
      // ユリ（白）: 10本 在庫（品質維持日数が短い）
      { itemId: 3, quantity: 10, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 2), status: '有効' },
      // ガーベラ: 15本 在庫
      { itemId: 4, quantity: 15, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 4), status: '有効' },
      // カーネーション: 30本 在庫
      { itemId: 5, quantity: 30, arrivalDate: addDays(today, -2), expiryDate: addDays(today, 5), status: '有効' },
    ],
  });
  console.log(`Stock lots created: ${stockLots.count}`);

  // --- 受注（デモ用） ---
  const orders = await prisma.order.createMany({
    data: [
      {
        customerId: 1,
        productId: 1,
        price: 5000,
        destinationName: '田中太郎',
        destinationAddress: '東京都渋谷区1-2-3',
        destinationPhone: '090-1234-5678',
        deliveryDate: addDays(today, 3),
        shippingDate: addDays(today, 2),
        message: 'お誕生日おめでとうございます',
        status: '注文済み',
      },
      {
        customerId: 1,
        productId: 2,
        price: 4500,
        destinationName: '鈴木花子',
        destinationAddress: '東京都新宿区4-5-6',
        destinationPhone: '090-8765-4321',
        deliveryDate: addDays(today, 5),
        shippingDate: addDays(today, 4),
        message: null,
        status: '注文済み',
      },
    ],
  });
  console.log(`Orders created: ${orders.count}`);

  // --- 在庫引当（受注に対応する在庫ロット） ---
  const allocatedStocks = await prisma.stock.createMany({
    data: [
      // 受注1（レッドローズブーケ）: バラ5本 + カスミソウ3本 引当
      { itemId: 1, quantity: 5, arrivalDate: addDays(today, -2), expiryDate: addDays(today, 3), status: '引当済み', orderId: 1 },
      { itemId: 2, quantity: 3, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 6), status: '引当済み', orderId: 1 },
      // 受注2（ホワイトリリーアレンジ）: ユリ3本 + カスミソウ5本 引当
      { itemId: 3, quantity: 3, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 2), status: '引当済み', orderId: 2 },
      { itemId: 2, quantity: 5, arrivalDate: addDays(today, -1), expiryDate: addDays(today, 6), status: '引当済み', orderId: 2 },
    ],
  });
  console.log(`Allocated stock lots created: ${allocatedStocks.count}`);

  // --- 発注（デモ用: 入荷予定のあるもの） ---
  const purchaseOrders = await prisma.purchaseOrder.createMany({
    data: [
      {
        itemId: 1,
        supplierId: 1,
        quantity: 20,
        orderDate: addDays(today, -1),
        expectedArrivalDate: addDays(today, 1),
        status: '発注済み',
      },
      {
        itemId: 3,
        supplierId: 2,
        quantity: 10,
        orderDate: today,
        expectedArrivalDate: addDays(today, 2),
        status: '発注済み',
      },
    ],
  });
  console.log(`Purchase orders created: ${purchaseOrders.count}`);

  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    if (pgPool) await pgPool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    if (pgPool) await pgPool.end();
    process.exit(1);
  });
