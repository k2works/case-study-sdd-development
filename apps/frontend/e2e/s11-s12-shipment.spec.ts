import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const TEST_API = 'http://localhost:8080';

function getDateStr(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

async function setupTestData(
  page: Page,
  request: APIRequestContext,
): Promise<{ itemId: number; productId: number }> {
  // 単品作成
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill('出荷テストバラ');
  await page.getByLabel('品質維持可能日数').fill('7');
  await page.getByLabel('購入単位').fill('100');
  await page.getByLabel('発注リードタイム').fill('3');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: '出荷テストバラ' }).first()).toBeVisible();

  const items = await request.get(`${TEST_API}/api/items`).then((r) => r.json());
  const item = items.find((entry: { id: number; name: string }) => entry.name === '出荷テストバラ');
  if (!item) throw new Error('単品 ID を取得できませんでした');

  // 商品作成
  await page.getByRole('tab', { name: '商品管理' }).click();
  await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('商品名').fill('出荷テストブーケ');
  await page.getByLabel('価格（税込）').fill('5500');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: '出荷テストブーケ' }).first()).toBeVisible();

  const products = await request.get(`${TEST_API}/api/products`).then((r) => r.json());
  const product = products.find((entry: { id: number; name: string }) => entry.name === '出荷テストブーケ');
  if (!product) throw new Error('商品 ID を取得できませんでした');

  // 在庫ロット作成（引当用）
  await request.post(`${TEST_API}/api/test/stock-lots`, {
    data: {
      itemId: item.id,
      quantity: 100,
      arrivalDate: getDateStr(-5),
      expiryDate: getDateStr(14),
    },
  });

  return { itemId: item.id, productId: product.id };
}

test.describe('S11/S12: 出荷対象確認と出荷記録', () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${TEST_API}/api/test/reset`);
  });

  test('出荷タブが表示され、出荷日で出荷対象を検索できる', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();

    await setupTestData(page, request);

    // 出荷タブに遷移
    await page.getByRole('tab', { name: '出荷' }).click();
    await expect(page.getByRole('heading', { name: '出荷一覧' })).toBeVisible();

    // 日付選択と表示ボタンがある
    await expect(page.getByLabel('出荷日')).toBeVisible();
    await expect(page.getByRole('button', { name: '表示' })).toBeVisible();
  });

  test('該当日に出荷対象がない場合メッセージが表示される', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();

    await setupTestData(page, request);

    await page.getByRole('tab', { name: '出荷' }).click();
    await expect(page.getByRole('heading', { name: '出荷一覧' })).toBeVisible();

    // 出荷対象のない日付で検索
    await page.getByLabel('出荷日').fill('2026-12-31');
    await page.getByRole('button', { name: '表示' }).click();

    await expect(page.getByText('該当日の出荷対象はありません。')).toBeVisible({ timeout: 10000 });
  });
});
