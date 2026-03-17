import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

async function setupItemWithStock(
  request: APIRequestContext,
  options: {
    itemName?: string;
    quantity?: number;
    qualityRetentionDays?: number;
    expiryDate?: string;
  } = {},
) {
  const {
    itemName = 'バラ（赤）',
    quantity = 50,
    qualityRetentionDays = 7,
    expiryDate,
  } = options;

  // 単品を API 経由で登録
  const itemRes = await request.post('http://localhost:8080/api/items', {
    data: {
      name: itemName,
      qualityRetentionDays,
      purchaseUnit: 10,
      leadTimeDays: 2,
      supplierId: 1,
    },
  });
  const item = await itemRes.json();

  // 在庫ロットを登録
  const futureExpiry = expiryDate ?? getFutureDate(qualityRetentionDays + 5);
  await request.post('http://localhost:8080/api/test/stock-lots', {
    data: {
      itemId: item.id,
      quantity,
      expiryDate: futureExpiry,
    },
  });

  return item;
}

async function navigateToStockForecast(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '管理画面' }).click();
  await page.getByRole('tab', { name: '在庫推移' }).click();
}

test.describe('S08: 在庫推移を確認する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('在庫推移画面が表示され単品一覧が読み込まれる', async ({ page, request }) => {
    await setupItemWithStock(request, { itemName: 'バラ（赤）' });

    await navigateToStockForecast(page);

    await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();
  });

  test('表示ボタンで在庫推移データがテーブルに表示される', async ({ page, request }) => {
    await setupItemWithStock(request, { itemName: 'バラ（赤）', quantity: 30 });

    await navigateToStockForecast(page);
    await expect(page.getByText('表示')).toBeVisible();
    await page.getByText('表示').click();

    // テーブルが表示される
    await expect(page.getByRole('table')).toBeVisible();
    // 単品名が行に表示される
    await expect(page.getByRole('cell', { name: 'バラ（赤）' })).toBeVisible();
    // 日付ヘッダーが表示される（今日の日付）
    const today = formatDateShort(getFutureDate(0));
    await expect(page.getByRole('columnheader', { name: today })).toBeVisible();
  });

  test('発注ボタンをクリックすると発注画面に遷移する', async ({ page, request }) => {
    await setupItemWithStock(request, { itemName: 'バラ（赤）' });

    await navigateToStockForecast(page);
    await page.getByText('表示').click();

    await expect(page.getByRole('table')).toBeVisible();

    // 発注ボタンをクリック
    await page.getByRole('button', { name: '発注' }).click();

    // 発注画面に遷移
    await expect(page.getByRole('heading', { name: '発注' })).toBeVisible();
    await expect(page.getByText('バラ（赤）')).toBeVisible();
    await expect(page.getByText('10本')).toBeVisible();
    await expect(page.getByText('2日')).toBeVisible();
  });
});

test.describe('S09: 単品を発注する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('発注数量を入力して発注を確定する', async ({ page, request }) => {
    await setupItemWithStock(request, { itemName: 'バラ（赤）' });

    await navigateToStockForecast(page);
    await page.getByText('表示').click();
    await expect(page.getByRole('table')).toBeVisible();

    // 発注画面に遷移
    await page.getByRole('button', { name: '発注' }).click();
    await expect(page.getByRole('heading', { name: '発注' })).toBeVisible();

    // 発注数量を入力
    const input = page.getByLabel('発注数量');
    await input.clear();
    await input.fill('25');

    // 購入単位の倍数に自動調整される
    await expect(page.getByText('30本（購入単位: 10本の倍数）')).toBeVisible();

    // 発注する
    await page.getByRole('button', { name: '発注する' }).click();

    // 発注後、在庫推移画面に戻る
    await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();
  });

  test('戻るボタンで在庫推移画面に戻れる', async ({ page, request }) => {
    await setupItemWithStock(request, { itemName: 'バラ（赤）' });

    await navigateToStockForecast(page);
    await page.getByText('表示').click();
    await expect(page.getByRole('table')).toBeVisible();

    // 発注画面に遷移
    await page.getByRole('button', { name: '発注' }).click();
    await expect(page.getByRole('heading', { name: '発注' })).toBeVisible();

    // 戻る
    await page.getByRole('button', { name: '戻る' }).click();
    await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();
  });
});
