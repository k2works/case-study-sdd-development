import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const TEST_API = 'http://localhost:8080';

function getDateStr(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * 単品を UI から登録し、在庫ロットをシードするヘルパー
 */
async function setupItemWithStock(
  page: Page,
  request: APIRequestContext,
  options: {
    itemName: string;
    qualityRetentionDays: number;
    stockQuantity: number;
    expiryDaysFromNow: number;
  },
): Promise<number> {
  const { itemName, qualityRetentionDays, stockQuantity, expiryDaysFromNow } = options;

  // 単品管理タブが既にアクティブ（disabled）の場合、別タブに切り替えてから戻る
  const itemTab = page.getByRole('tab', { name: '単品管理' });
  if (await itemTab.isDisabled()) {
    await page.getByRole('tab', { name: '商品管理' }).click();
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();
  }
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

  // 単品を登録
  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill(itemName);
  await page.getByLabel('品質維持可能日数').fill(String(qualityRetentionDays));
  await page.getByLabel('購入単位').fill('10');
  await page.getByLabel('発注リードタイム').fill('2');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: itemName }).first()).toBeVisible();

  // 登録された単品の ID を取得
  const items = await request.get(`${TEST_API}/api/items`).then((r) => r.json());
  const item = items.find((entry: { id: number; name: string }) => entry.name === itemName);
  if (!item) throw new Error(`${itemName} の単品 ID を取得できませんでした`);

  // 在庫ロットをシード
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

/**
 * 商品を登録するヘルパー
 */
async function setupProduct(
  page: Page,
  options: {
    productName: string;
    price: string;
    compositionQuantity: string;
  },
): Promise<void> {
  await page.getByRole('tab', { name: '商品管理' }).click();
  await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('商品名').fill(options.productName);
  await page.getByLabel('価格（税込）').fill(options.price);
  await page.getByRole('button', { name: '構成を追加' }).click();
  await page.getByLabel('構成 1 の数量').fill(options.compositionQuantity);
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: options.productName })).toBeVisible();
}

test.describe('S08: 在庫推移を確認する', () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${TEST_API}/api/test/reset`);
  });

  test.describe('受入条件: 単品ごとの日別在庫予定数が表示される', () => {
    test('管理画面の在庫推移タブで在庫推移テーブルが表示される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 単品を登録し在庫をシード
      await setupItemWithStock(page, request, {
        itemName: 'テスト赤バラ',
        qualityRetentionDays: 7,
        stockQuantity: 50,
        expiryDaysFromNow: 10,
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();

      // 在庫推移テーブルが表示される
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();

      // 単品名が表示されるまで待つ
      await expect(page.getByRole('cell', { name: 'テスト赤バラ' })).toBeVisible({ timeout: 10000 });

      // 品質維持日数が表示されている
      await expect(page.getByRole('cell', { name: '7日' })).toBeVisible();

      // 日付列ヘッダーが曜日付きで表示されている
      const todayStr = getDateStr(0);
      const todayDate = new Date(todayStr + 'T00:00:00');
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const todayHeader = `${todayStr.slice(5)}(${weekdays[todayDate.getDay()]})`;
      await expect(page.getByRole('columnheader', { name: todayHeader })).toBeVisible();
    });

    test('複数の単品の在庫推移が表示される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 1 つ目の単品を登録
      await setupItemWithStock(page, request, {
        itemName: 'テストバラ',
        qualityRetentionDays: 5,
        stockQuantity: 30,
        expiryDaysFromNow: 8,
      });

      // 2 つ目の単品を登録
      await setupItemWithStock(page, request, {
        itemName: 'テストユリ',
        qualityRetentionDays: 3,
        stockQuantity: 20,
        expiryDaysFromNow: 5,
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible();

      // 両方の単品が表示される
      await expect(page.getByRole('cell', { name: 'テストバラ' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'テストユリ' })).toBeVisible();
    });
  });

  test.describe('受入条件: 在庫予定数は現在庫 + 入荷予定 - 受注引当 - 品質維持日数超過分で計算される', () => {
    test('注文による受注引当が在庫推移に反映される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 単品を登録（在庫 100）
      await setupItemWithStock(page, request, {
        itemName: '引当テストバラ',
        qualityRetentionDays: 7,
        stockQuantity: 100,
        expiryDaysFromNow: 14,
      });

      // 商品を登録（この単品を 5 本使用）
      await setupProduct(page, {
        productName: '引当テストブーケ',
        price: '5000',
        compositionQuantity: '5',
      });

      // 花束一覧から注文する
      await page.getByRole('button', { name: '花束一覧' }).click();
      await expect(page.getByText('引当テストブーケ')).toBeVisible();
      await page.getByRole('button', { name: '注文する' }).click();

      // 注文入力
      const deliveryDate = getDateStr(3);
      await page.getByLabel('届け日').fill(deliveryDate);
      await page.getByLabel('届け先名').fill('テスト太郎');
      await page.getByLabel('届け先住所').fill('東京都渋谷区1-2-3');
      await page.getByLabel('届け先電話番号').fill('03-1234-5678');
      await page.getByLabel('お届けメッセージ').fill('テスト');
      await page.getByRole('button', { name: '確認画面へ' }).click();
      await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();
      await page.getByRole('button', { name: '注文を確定する' }).click();
      await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible({ timeout: 10000 });

      // 管理画面 > 在庫推移で確認
      await page.getByRole('button', { name: 'トップページに戻る' }).click();
      await page.getByRole('button', { name: '管理画面' }).click();
      await page.getByRole('tab', { name: '在庫推移' }).click();

      // 在庫推移テーブルが表示される
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '引当テストバラ' })).toBeVisible({ timeout: 10000 });

      // 注文により引当が発生しているため、出荷日以降の在庫予定数が減少しているはず
      // 在庫 100 - 引当 5 = 95（出荷日以降）
      const row = page.locator('tr', { hasText: '引当テストバラ' });
      const cells = row.locator('td');
      const cellTexts: string[] = [];
      const count = await cells.count();
      for (let i = 0; i < count; i++) {
        cellTexts.push(await cells.nth(i).textContent() ?? '');
      }
      // 出荷日以降のセルに引当が反映されている（100 ではなく 95 になるセルがある）
      expect(cellTexts.some((text) => text === '95')).toBeTruthy();
    });

    test('入荷予定が在庫推移に反映される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 単品を登録（在庫 30）
      const itemId = await setupItemWithStock(page, request, {
        itemName: '入荷テストバラ',
        qualityRetentionDays: 7,
        stockQuantity: 30,
        expiryDaysFromNow: 14,
      });

      // 発注データをシード（3 日後に入荷予定 20 本）
      const arrivalDate = getDateStr(3);
      await request.post(`${TEST_API}/api/test/purchase-orders`, {
        data: {
          itemId,
          quantity: 20,
          expectedArrivalDate: arrivalDate,
          status: '発注済み',
        },
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '入荷テストバラ' })).toBeVisible({ timeout: 10000 });

      // 入荷テストバラの行を確認
      const row = page.locator('tr', { hasText: '入荷テストバラ' });
      const cells = row.locator('td');
      const cellTexts: string[] = [];
      const count = await cells.count();
      for (let i = 0; i < count; i++) {
        cellTexts.push(await cells.nth(i).textContent() ?? '');
      }
      // 入荷予定日以降は 30 + 20 = 50 になるセルがある
      expect(cellTexts.some((text) => text === '50')).toBeTruthy();
    });
  });

  test.describe('受入条件: 品質維持日数を超過する在庫が識別できる', () => {
    test('品質維持日数超過で欠品する場合、太字で警告表示される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 品質維持日数 2 日、有効期限が明日の在庫（すぐに期限切れ）
      await setupItemWithStock(page, request, {
        itemName: '期限テストバラ',
        qualityRetentionDays: 2,
        stockQuantity: 10,
        expiryDaysFromNow: 1,
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '期限テストバラ' })).toBeVisible({ timeout: 10000 });

      // 期限テストバラの行を確認
      const row = page.locator('tr', { hasText: '期限テストバラ' });

      // 欠品警告（shortage クラス）のセルが存在する
      const shortageCells = row.locator('td.shortage');
      await expect(shortageCells.first()).toBeVisible({ timeout: 5000 });

      // 欠品セルには strong タグ（太字）が含まれる
      const strongElements = shortageCells.first().locator('strong');
      await expect(strongElements.first()).toBeVisible();
    });

    test('ツールチップで在庫予定数の内訳が確認できる', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: 'ツールチップテスト',
        qualityRetentionDays: 7,
        stockQuantity: 50,
        expiryDaysFromNow: 14,
      });

      // 在庫推移タブに遷移
      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'ツールチップテスト' })).toBeVisible({ timeout: 10000 });

      // ツールチップテストの行の数値セルに title 属性（ツールチップ）がある
      const row = page.locator('tr', { hasText: 'ツールチップテスト' });
      const dataCells = row.locator('td[title]');

      // 少なくとも 1 つの title 属性付きセルがある
      await expect(dataCells.first()).toBeVisible({ timeout: 5000 });

      // title 属性に内訳情報が含まれている
      const title = await dataCells.first().getAttribute('title');
      expect(title).toContain('在庫予定数');
      expect(title).toContain('現在庫');
      expect(title).toContain('入荷予定');
      expect(title).toContain('受注引当');
      expect(title).toContain('期限超過');
    });
  });

  test.describe('在庫推移画面の操作', () => {
    test('発注ボタンと凡例が表示される', async ({ page, request }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      await setupItemWithStock(page, request, {
        itemName: '操作テストバラ',
        qualityRetentionDays: 5,
        stockQuantity: 30,
        expiryDaysFromNow: 10,
      });

      await page.getByRole('tab', { name: '在庫推移' }).click();
      await expect(page.getByRole('table', { name: '在庫推移' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '操作テストバラ' })).toBeVisible({ timeout: 10000 });

      // 発注ボタンが存在する
      const row = page.locator('tr', { hasText: '操作テストバラ' });
      await expect(row.getByRole('button', { name: '発注' })).toBeVisible();

      // 凡例テキストが表示される
      await expect(page.getByText('太字赤')).toBeVisible();
      await expect(page.getByText('欠品警告')).toBeVisible();
    });
  });
});
