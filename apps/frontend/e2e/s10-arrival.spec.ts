import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const TEST_API = 'http://localhost:8080';

function getDateStr(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

async function createItem(
  page: Page,
  request: APIRequestContext,
  itemName: string,
): Promise<number> {
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill(itemName);
  await page.getByLabel('品質維持可能日数').fill('7');
  await page.getByLabel('購入単位').fill('100');
  await page.getByLabel('発注リードタイム').fill('3');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: itemName }).first()).toBeVisible();

  const items = await request.get(`${TEST_API}/api/items`).then((r) => r.json());
  const item = items.find((entry: { id: number; name: string }) => entry.name === itemName);
  if (!item) throw new Error(`${itemName} の単品 ID を取得できませんでした`);
  return item.id;
}

async function createPurchaseOrder(
  request: APIRequestContext,
  itemId: number,
  quantity: number,
): Promise<void> {
  await request.post(`${TEST_API}/api/test/purchase-orders`, {
    data: {
      itemId,
      quantity,
      expectedArrivalDate: getDateStr(3),
      status: '発注済み',
    },
  });
}

test.describe('S10: 入荷を受け入れる', () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${TEST_API}/api/test/reset`);
  });

  test('入荷登録タブが表示され、発注済み一覧が表示される', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();

    const itemId = await createItem(page, request, '入荷テストバラ');
    await createPurchaseOrder(request, itemId, 100);

    // 入荷登録タブに遷移
    await page.getByRole('tab', { name: '入荷登録' }).click();
    await expect(page.getByRole('heading', { name: '入荷登録' })).toBeVisible();

    // 発注済み一覧が表示される
    await expect(page.getByRole('cell', { name: '入荷テストバラ' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: '100 本' })).toBeVisible();
  });

  test('入荷登録で在庫ロットが作成され発注が入荷済みに更新される', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();

    const itemId = await createItem(page, request, '入荷確定テスト');
    await createPurchaseOrder(request, itemId, 100);

    await page.getByRole('tab', { name: '入荷登録' }).click();
    await expect(page.getByRole('cell', { name: '入荷確定テスト' })).toBeVisible({ timeout: 10000 });

    // 入荷登録ボタンをクリック
    await page.getByRole('button', { name: '入荷登録' }).click();

    // 入荷フォームが表示される
    await expect(page.getByLabel('入荷数量')).toBeVisible();
    await expect(page.getByLabel('入荷日')).toBeVisible();

    // 登録する
    await page.getByRole('button', { name: '登録する' }).click();

    // 一覧に戻り、発注済みが消えている（入荷済みに更新されたため）
    await expect(page.getByText('発注済みの発注はありません。')).toBeVisible({ timeout: 10000 });

    // 在庫推移で入荷分が反映されていることを確認
    await page.getByRole('tab', { name: '在庫推移' }).click();
    await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: '入荷確定テスト' })).toBeVisible({ timeout: 10000 });
  });
});
