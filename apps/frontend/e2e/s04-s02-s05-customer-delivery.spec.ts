import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/** 単品・商品・在庫を事前登録するヘルパー */
async function setupProductAndStock(page: Page, request: APIRequestContext) {
  await page.goto('/');
  await page.getByRole('button', { name: '管理画面' }).click();

  // 単品登録
  await page.getByRole('tab', { name: '単品管理' }).click();
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill('赤バラ');
  await page.getByLabel('品質維持可能日数').fill('7');
  await page.getByLabel('購入単位').fill('10');
  await page.getByLabel('発注リードタイム').fill('2');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: '赤バラ' }).first()).toBeVisible();

  const items = await request.get('http://localhost:8080/api/items').then((r) => r.json());
  const item = items.find((e: { name: string }) => e.name === '赤バラ');
  await request.post('http://localhost:8080/api/test/stock-lots', {
    data: { itemId: item.id, quantity: 100 },
  });

  // 商品登録
  await page.getByRole('tab', { name: '商品管理' }).click();
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('商品名').fill('ローズブーケ');
  await page.getByLabel('価格（税込）').fill('5500');
  await page.getByRole('button', { name: '構成を追加' }).click();
  await page.getByLabel('構成 1 の数量').fill('5');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: 'ローズブーケ' })).toBeVisible();
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
// S04: 得意先を管理する
// ========================================
test.describe('S04: 得意先を管理する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('得意先を新規登録し一覧に表示される', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();
    await page.getByRole('tab', { name: '得意先' }).click();

    await expect(page.getByRole('heading', { name: '得意先管理' })).toBeVisible();

    // 新規登録
    await page.getByRole('button', { name: '新規登録' }).click();
    await page.getByLabel('得意先名').fill('田中太郎');
    await page.getByLabel('電話番号').fill('090-1234-5678');
    await page.getByLabel('メールアドレス').fill('tanaka@example.com');
    await page.getByRole('button', { name: '保存する' }).click();

    // 一覧に表示される
    await expect(page.getByRole('cell', { name: '田中太郎' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '090-1234-5678' })).toBeVisible();
  });

  test('得意先の届け先一覧が確認できる', async ({ page, request }) => {
    // 得意先を API で作成
    await request.post('http://localhost:8080/api/customers', {
      data: { name: '田中太郎', phone: '090-1234-5678', email: 'tanaka@example.com' },
    });

    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();
    await page.getByRole('tab', { name: '得意先' }).click();

    await expect(page.getByRole('cell', { name: '田中太郎' })).toBeVisible();

    // 届け先ボタンをクリック
    const row = page.locator('tr', { hasText: '田中太郎' });
    const destinationButton = row.getByRole('button', { name: '届け先' });
    if (await destinationButton.isVisible()) {
      await destinationButton.click();
      // 届け先一覧ヘッダーが表示される
      await expect(page.getByRole('heading', { name: '届け先一覧' })).toBeVisible();
    }
  });
});

// ========================================
// S05: 届け日変更を依頼する（基本判定）
// ========================================
test.describe('S05: 届け日変更を依頼する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:8080/api/test/reset');
  });

  test('注文済みの受注に対して届け日変更ができる', async ({ page, request }) => {
    await setupProductAndStock(page, request);

    // 注文を作成
    await page.getByRole('button', { name: '花束一覧' }).click();
    await page.getByRole('button', { name: '注文する' }).click();
    const deliveryDate = getDeliveryDate();
    await page.getByLabel('届け日').fill(deliveryDate);
    await page.getByLabel('届け先名').fill('山田太郎');
    await page.getByLabel('届け先住所').fill('東京都渋谷区1-2-3');
    await page.getByLabel('届け先電話番号').fill('03-1234-5678');
    await page.getByRole('button', { name: '確認画面へ' }).click();
    await page.getByRole('button', { name: '注文を確定する' }).click();
    await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();

    // 受注詳細に遷移
    await page.getByRole('button', { name: 'トップページに戻る' }).click();
    await page.getByRole('button', { name: '管理画面' }).click();
    await page.getByRole('tab', { name: '受注管理' }).click();
    const row = page.locator('tr', { hasText: '山田太郎' });
    await row.getByRole('button', { name: '詳細' }).click();
    await expect(page.getByRole('heading', { name: '受注詳細' })).toBeVisible();

    // 届け日変更
    const newDate = getNewDeliveryDate();
    await page.getByLabel('新しい届け日').fill(newDate);
    await page.getByRole('button', { name: '届け日を変更する' }).click();

    await expect(page.getByText('届け日を変更しました')).toBeVisible();
    await expect(page.getByText(newDate)).toBeVisible();
  });

  test('出荷準備中の受注では届け日変更セクションが表示されない', async ({ page, request }) => {
    await setupProductAndStock(page, request);

    // 注文を作成
    await page.getByRole('button', { name: '花束一覧' }).click();
    await page.getByRole('button', { name: '注文する' }).click();
    await page.getByLabel('届け日').fill(getDeliveryDate());
    await page.getByLabel('届け先名').fill('鈴木花子');
    await page.getByLabel('届け先住所').fill('大阪府大阪市1-1-1');
    await page.getByLabel('届け先電話番号').fill('06-1234-5678');
    await page.getByRole('button', { name: '確認画面へ' }).click();
    await page.getByRole('button', { name: '注文を確定する' }).click();
    await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();

    // API で出荷して状態変更
    const orders = await request.get('http://localhost:8080/api/orders').then((r) => r.json());
    await request.post('http://localhost:8080/api/shipments', {
      data: { orderId: orders[0].id },
    });

    // 受注詳細に遷移
    await page.getByRole('button', { name: 'トップページに戻る' }).click();
    await page.getByRole('button', { name: '管理画面' }).click();
    await page.getByRole('tab', { name: '受注管理' }).click();
    const row = page.locator('tr', { hasText: '鈴木花子' });
    await row.getByRole('button', { name: '詳細' }).click();

    // 届け日変更セクションが非表示
    await expect(page.getByRole('heading', { name: '受注詳細' })).toBeVisible();
    await expect(page.getByText('届け日変更')).not.toBeVisible();
  });
});
