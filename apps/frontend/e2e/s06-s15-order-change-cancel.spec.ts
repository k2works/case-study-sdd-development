import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * 商品・単品・在庫を事前登録し、注文を作成するヘルパー
 */
async function setupAndCreateOrder(
  page: Page,
  request: APIRequestContext,
  options: { deliveryDate?: string; stockQuantity?: number } = {},
) {
  const { deliveryDate = getDeliveryDate(), stockQuantity = 100 } = options;

  await page.goto('/');
  await page.getByRole('button', { name: '管理画面' }).click();

  // 単品を登録
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill('赤バラ');
  await page.getByLabel('品質維持可能日数').fill('7');
  await page.getByLabel('購入単位').fill('10');
  await page.getByLabel('発注リードタイム').fill('2');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: '赤バラ' }).first()).toBeVisible();

  // 在庫投入
  const items = await request.get('http://localhost:8080/api/items').then((r) => r.json());
  const item = items.find((e: { name: string }) => e.name === '赤バラ');
  await request.post('http://localhost:8080/api/test/stock-lots', {
    data: { itemId: item.id, quantity: stockQuantity },
  });

  // 商品を登録
  await page.getByRole('tab', { name: '商品管理' }).click();
  await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('商品名').fill('ローズブーケ');
  await page.getByLabel('価格（税込）').fill('5500');
  await page.getByRole('button', { name: '構成を追加' }).click();
  await page.getByLabel('構成 1 の数量').fill('5');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: 'ローズブーケ' })).toBeVisible();

  // 花束一覧から注文する
  await page.getByRole('button', { name: '花束一覧' }).click();
  await expect(page.getByText('ローズブーケ')).toBeVisible();
  await page.getByRole('button', { name: '注文する' }).click();

  await page.getByLabel('届け日').fill(deliveryDate);
  await page.getByLabel('届け先名').fill('山田太郎');
  await page.getByLabel('届け先住所').fill('東京都渋谷区1-2-3');
  await page.getByLabel('届け先電話番号').fill('03-1234-5678');
  await page.getByLabel('お届けメッセージ').fill('テスト注文です');

  await page.getByRole('button', { name: '確認画面へ' }).click();
  await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();
  await page.getByRole('button', { name: '注文を確定する' }).click();
  await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();
}

/** 受注詳細画面に遷移するヘルパー */
async function navigateToOrderDetail(page: Page) {
  await page.getByRole('button', { name: 'トップページに戻る' }).click();
  await page.getByRole('button', { name: '管理画面' }).click();
  await page.getByRole('tab', { name: '受注管理' }).click();
  await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '山田太郎' })).toBeVisible();

  const row = page.locator('tr', { hasText: '山田太郎' });
  await row.getByRole('button', { name: '詳細' }).click();
  await expect(page.getByRole('heading', { name: '受注詳細' })).toBeVisible();
}

function getDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toISOString().split('T')[0];
}

function getNewDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 10);
  return date.toISOString().split('T')[0];
}

// ========================================
// S06: 届け日変更の可否を判断する
// ========================================
test.describe('S06: 届け日変更の可否を判断する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('届け日変更（在庫チェック付き）: 在庫十分な場合に変更が成功する', async ({ page, request }) => {
    await setupAndCreateOrder(page, request, { stockQuantity: 100 });
    await navigateToOrderDetail(page);

    // 届け日変更セクションが表示される
    await expect(page.getByText('届け日変更')).toBeVisible();

    // 新しい届け日を入力して変更
    const newDate = getNewDeliveryDate();
    await page.getByLabel('新しい届け日').fill(newDate);
    await page.getByRole('button', { name: '届け日を変更する' }).click();

    // 変更成功メッセージ
    await expect(page.getByText('届け日を変更しました')).toBeVisible();

    // 新しい届け日が表示される
    await expect(page.getByText(newDate)).toBeVisible();
  });

  test('届け日変更（在庫不足）: 在庫不足の場合に変更不可メッセージが表示される', async ({ page, request }) => {
    // 在庫を最小限にして注文（5本ちょうど）
    await setupAndCreateOrder(page, request, { stockQuantity: 5 });

    // 商品構成を大きくして在庫不足にする（商品マスタを変更）
    const products = await request.get('http://localhost:8080/api/products').then((r) => r.json());
    const product = products[0];
    const items = await request.get('http://localhost:8080/api/items').then((r) => r.json());
    const item = items[0];

    // 商品構成を 50 本に変更（在庫 5 本 + 引当解除 5 本 = 10 本 < 50 本）
    await request.put(`http://localhost:8080/api/products/${product.id}`, {
      data: {
        name: product.name,
        price: product.price,
        compositions: [{ itemId: item.id, quantity: 50 }],
      },
    });

    await navigateToOrderDetail(page);

    const newDate = getNewDeliveryDate();
    await page.getByLabel('新しい届け日').fill(newDate);
    await page.getByRole('button', { name: '届け日を変更する' }).click();

    // 在庫不足メッセージ
    await expect(page.getByText(/在庫が不足しています/)).toBeVisible();

    // 在庫推移画面への導線
    await expect(page.getByRole('button', { name: '在庫推移を確認' })).toBeVisible();
  });
});

// ========================================
// S15: 注文をキャンセルする
// ========================================
test.describe('S15: 注文をキャンセルする', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('注文済みの受注をキャンセルできる', async ({ page, request }) => {
    await setupAndCreateOrder(page, request);
    await navigateToOrderDetail(page);

    // キャンセルボタンが表示される
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 確認ダイアログが表示される
    await expect(page.getByText('この注文をキャンセルしますか？')).toBeVisible();
    await expect(page.getByText(/この操作は取り消せません/)).toBeVisible();

    // 「はい、キャンセルする」をクリック
    await page.getByRole('button', { name: 'はい、キャンセルする' }).click();

    // キャンセル後の状態確認（状態欄に「キャンセル」が表示される）
    await expect(page.locator('dd', { hasText: 'キャンセル' })).toBeVisible();

    // キャンセルボタンが非表示
    await expect(page.getByRole('button', { name: 'キャンセル' })).not.toBeVisible();
  });

  test('キャンセル確認ダイアログで「いいえ」を選ぶとキャンセルされない', async ({ page, request }) => {
    await setupAndCreateOrder(page, request);
    await navigateToOrderDetail(page);

    await page.getByRole('button', { name: 'キャンセル' }).click();
    await expect(page.getByText('この注文をキャンセルしますか？')).toBeVisible();

    // 「いいえ」をクリック
    await page.getByRole('button', { name: 'いいえ' }).click();

    // ダイアログが閉じる
    await expect(page.getByText('この注文をキャンセルしますか？')).not.toBeVisible();

    // 状態は「注文済み」のまま
    await expect(page.getByText('注文済み')).toBeVisible();

    // キャンセルボタンはまだ表示されている
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
  });

  test('出荷準備中の受注にはキャンセルボタンが表示されない', async ({ page, request }) => {
    await setupAndCreateOrder(page, request);

    // API で出荷準備中に遷移させる
    const orders = await request.get('http://localhost:8080/api/orders').then((r) => r.json());
    const order = orders[0];
    // 出荷を実行して出荷準備中にする
    await request.post('http://localhost:8080/api/shipments', {
      data: { orderId: order.id },
    });

    await navigateToOrderDetail(page);

    // 状態が出荷準備中（または出荷済み）
    // キャンセルボタンが表示されないことを確認
    await expect(page.getByRole('button', { name: 'キャンセル' })).not.toBeVisible();
  });
});

// ========================================
// 全体フロー: 注文→届け日変更→キャンセル
// ========================================
test.describe('全体フロー', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('注文→届け日変更→一覧確認の一連のフロー', async ({ page, request }) => {
    // 1. 注文を作成
    await setupAndCreateOrder(page, request, { stockQuantity: 100 });

    // 2. 受注詳細で届け日変更
    await navigateToOrderDetail(page);
    const newDate = getNewDeliveryDate();
    await page.getByLabel('新しい届け日').fill(newDate);
    await page.getByRole('button', { name: '届け日を変更する' }).click();
    await expect(page.getByText('届け日を変更しました')).toBeVisible();
    await expect(page.getByText(newDate)).toBeVisible();

    // 3. 一覧に戻って状態確認
    await page.getByRole('button', { name: '戻る' }).click();
    await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '注文済み' })).toBeVisible();
  });

  test('注文→キャンセル→一覧確認の一連のフロー', async ({ page, request }) => {
    // 1. 注文を作成
    await setupAndCreateOrder(page, request, { stockQuantity: 100 });

    // 2. 受注詳細でキャンセル
    await navigateToOrderDetail(page);
    await page.getByRole('button', { name: 'キャンセル' }).click();
    await expect(page.getByText('この注文をキャンセルしますか？')).toBeVisible();
    await page.getByRole('button', { name: 'はい、キャンセルする' }).click();

    // 3. キャンセル後の状態確認（状態欄に「キャンセル」が表示される）
    await expect(page.locator('dd', { hasText: 'キャンセル' })).toBeVisible();

    // 4. 一覧に戻る
    await page.getByRole('button', { name: '戻る' }).click();
    await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
  });
});
