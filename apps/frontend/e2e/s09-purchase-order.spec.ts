import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const TEST_API = 'http://localhost:8080';

function getDateStr(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

async function setupItemWithStock(
  page: Page,
  request: APIRequestContext,
  options: {
    itemName: string;
    qualityRetentionDays: number;
    stockQuantity: number;
    expiryDaysFromNow: number;
    purchaseUnit?: number;
    leadTimeDays?: number;
  },
): Promise<number> {
  const { itemName, qualityRetentionDays, stockQuantity, expiryDaysFromNow } = options;
  const purchaseUnit = options.purchaseUnit ?? 10;
  const leadTimeDays = options.leadTimeDays ?? 2;

  const itemTab = page.getByRole('tab', { name: '単品管理' });
  if (await itemTab.isDisabled()) {
    await page.getByRole('tab', { name: '商品管理' }).click();
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();
  }
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill(itemName);
  await page.getByLabel('品質維持可能日数').fill(String(qualityRetentionDays));
  await page.getByLabel('購入単位').fill(String(purchaseUnit));
  await page.getByLabel('発注リードタイム').fill(String(leadTimeDays));
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: itemName }).first()).toBeVisible();

  const items = await request.get(`${TEST_API}/api/items`).then((r) => r.json());
  const item = items.find((entry: { id: number; name: string }) => entry.name === itemName);
  if (!item) throw new Error(`${itemName} の単品 ID を取得できませんでした`);

  await request.post(`${TEST_API}/api/test/stock-lots`, {
    data: {
      itemId: item.id,
      quantity: stockQuantity,
      arrivalDate: getDateStr(-5),
      expiryDate: getDateStr(expiryDaysFromNow),
    },
  });

  return item.id;
}

test.describe('S09: 単品を発注する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${TEST_API}/api/test/reset`);
  });

  test.describe('受入条件: 発注する単品の仕入先・購入単位・リードタイムが表示される', () => {
    test('在庫推移画面の発注ボタンから発注画面に遷移し、単品情報が表示される', async ({
      page,
      request,
    }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: '発注テストバラ',
        qualityRetentionDays: 7,
        stockQuantity: 50,
        expiryDaysFromNow: 14,
        purchaseUnit: 10,
        leadTimeDays: 2,
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '発注テストバラ' })).toBeVisible({
        timeout: 10000,
      });

      // 発注ボタンをクリック
      const row = page.locator('tr', { hasText: '発注テストバラ' });
      await row.getByRole('button', { name: '発注' }).click();

      // 発注画面が表示される
      await expect(page.getByRole('heading', { name: '発注画面' })).toBeVisible();

      // 単品情報が表示される
      await expect(page.getByText('発注テストバラ')).toBeVisible();
      await expect(page.getByText('10 本', { exact: true })).toBeVisible();
      await expect(page.getByText('2 日', { exact: true })).toBeVisible();
    });
  });

  test.describe('受入条件: 発注数量を指定できる（購入単位の倍数に自動調整）', () => {
    test('数量を入力すると購入単位の倍数に切り上げ調整される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: '調整テストバラ',
        qualityRetentionDays: 7,
        stockQuantity: 50,
        expiryDaysFromNow: 14,
        purchaseUnit: 10,
        leadTimeDays: 2,
      });

      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('cell', { name: '調整テストバラ' })).toBeVisible({
        timeout: 10000,
      });

      const row = page.locator('tr', { hasText: '調整テストバラ' });
      await row.getByRole('button', { name: '発注' }).click();
      await expect(page.getByRole('heading', { name: '発注画面' })).toBeVisible();

      // 7 本入力すると 10 本に自動調整される
      await page.getByLabel('発注数量').fill('7');
      await expect(page.getByText('自動調整後: 10 本（購入単位: 10 本の倍数）')).toBeVisible();
    });
  });

  test.describe('受入条件: 発注を確定すると発注記録が作成される', () => {
    test('発注確定後に在庫推移画面に戻り入荷予定が反映される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: '発注確定テスト',
        qualityRetentionDays: 7,
        stockQuantity: 30,
        expiryDaysFromNow: 14,
        purchaseUnit: 10,
        leadTimeDays: 2,
      });

      // 在庫推移→発注
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('cell', { name: '発注確定テスト' })).toBeVisible({
        timeout: 10000,
      });

      const row = page.locator('tr', { hasText: '発注確定テスト' });
      await row.getByRole('button', { name: '発注' }).click();
      await expect(page.getByRole('heading', { name: '発注画面' })).toBeVisible();

      // 20 本発注（購入単位 10 の倍数なのでそのまま）
      await page.getByLabel('発注数量').fill('20');
      await expect(page.getByText('自動調整後: 20 本')).toBeVisible();

      // 入荷予定日が表示される
      const expectedDate = formatDisplayDate(2);
      await expect(page.getByText(`入荷予定日: ${expectedDate}`)).toBeVisible();

      // 発注する
      await page.getByRole('button', { name: '発注する' }).click();

      // 在庫推移画面に戻る
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('cell', { name: '発注確定テスト' })).toBeVisible({
        timeout: 10000,
      });

      // 入荷予定日以降の在庫予定数に発注分 20 が加算されているはず
      // 在庫 30 + 入荷予定 20 = 50
      const dataRow = page.locator('tr', { hasText: '発注確定テスト' });
      const cells = dataRow.locator('td');
      const cellTexts: string[] = [];
      const count = await cells.count();
      for (let i = 0; i < count; i++) {
        cellTexts.push((await cells.nth(i).textContent()) ?? '');
      }
      // 入荷予定日以降に 50 が反映される
      expect(cellTexts.some((text) => text === '50')).toBeTruthy();
    });
  });

  test.describe('受入条件: 入荷予定日がリードタイムから自動計算される', () => {
    test('入荷予定日にリードタイム日数が反映される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: 'リードタイムテスト',
        qualityRetentionDays: 7,
        stockQuantity: 30,
        expiryDaysFromNow: 14,
        purchaseUnit: 5,
        leadTimeDays: 3,
      });

      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('cell', { name: 'リードタイムテスト' })).toBeVisible({
        timeout: 10000,
      });

      const row = page.locator('tr', { hasText: 'リードタイムテスト' });
      await row.getByRole('button', { name: '発注' }).click();
      await expect(page.getByRole('heading', { name: '発注画面' })).toBeVisible();

      // リードタイム 3 日が表示される
      await expect(page.getByText('3 日', { exact: true })).toBeVisible();

      // 入荷予定日が今日 + 3 日
      const expectedDate = formatDisplayDate(3);
      await page.getByLabel('発注数量').fill('10');
      await expect(page.getByText(`入荷予定日: ${expectedDate}（リードタイム: 3 日）`)).toBeVisible();
    });
  });

  test.describe('受入条件: 発注確定後、在庫推移画面に戻り入荷予定が反映される', () => {
    test('戻るボタンで在庫推移画面に戻れる', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: '戻るテストバラ',
        qualityRetentionDays: 7,
        stockQuantity: 30,
        expiryDaysFromNow: 14,
      });

      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('cell', { name: '戻るテストバラ' })).toBeVisible({
        timeout: 10000,
      });

      const row = page.locator('tr', { hasText: '戻るテストバラ' });
      await row.getByRole('button', { name: '発注' }).click();
      await expect(page.getByRole('heading', { name: '発注画面' })).toBeVisible();

      // 戻るボタン
      await page.getByRole('button', { name: '戻る' }).click();

      // 在庫推移画面に戻る
      await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
    });
  });
});
