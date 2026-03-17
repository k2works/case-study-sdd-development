import { test, expect, type Page } from '@playwright/test';

/**
 * 注文フロー全体を画面操作で実行し、受注データを作成するヘルパー
 * InMemory リポジトリのため各テストでデータ投入が必要
 */
async function createOrderViaUI(
  page: Page,
  options: {
    itemName?: string;
    productName?: string;
    destinationName?: string;
    deliveryDate?: string;
  } = {},
) {
  const {
    itemName = '赤バラ',
    productName = 'ローズブーケ',
    destinationName = '山田太郎',
    deliveryDate = getDeliveryDate(),
  } = options;

  await page.goto('/');
  await page.getByRole('button', { name: '管理画面' }).click();

  // 単品を登録
  await page.getByRole('tab', { name: '単品管理' }).click();
  await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('単品名').fill(itemName);
  await page.getByLabel('品質維持可能日数').fill('7');
  await page.getByLabel('購入単位').fill('10');
  await page.getByLabel('発注リードタイム').fill('2');
  await page.getByLabel('仕入先ID').fill('1');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: itemName })).toBeVisible();

  // 商品を登録
  await page.getByRole('tab', { name: '商品管理' }).click();
  await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

  await page.getByRole('button', { name: '新規登録' }).click();
  await page.getByLabel('商品名').fill(productName);
  await page.getByLabel('価格（税込）').fill('5500');
  await page.getByRole('button', { name: '構成を追加' }).click();
  await page.getByLabel('構成 1 の数量').fill('5');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page.getByRole('cell', { name: productName })).toBeVisible();

  // 花束一覧から注文する
  await page.getByRole('button', { name: '花束一覧' }).click();
  await expect(page.getByText(productName)).toBeVisible();
  await page.getByRole('button', { name: '注文する' }).click();

  // 注文入力
  await page.getByLabel('届け日').fill(deliveryDate);
  await page.getByLabel('届け先名').fill(destinationName);
  await page.getByLabel('届け先住所').fill('東京都渋谷区1-2-3');
  await page.getByLabel('届け先電話番号').fill('03-1234-5678');
  await page.getByLabel('お届けメッセージ').fill('テスト注文です');

  // 確認して確定
  await page.getByRole('button', { name: '確認画面へ' }).click();
  await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();
  await page.getByRole('button', { name: '注文を確定する' }).click();
  await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();
}

function getDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0];
}

test.describe('S07: 受注一覧を確認する', () => {
  test.describe('受入基準: 受注一覧が表示される', () => {
    test('管理画面の受注管理タブで受注一覧テーブルが表示される', async ({ page }) => {
      // 注文を作成
      await createOrderViaUI(page);

      // 管理画面の受注管理タブへ
      await page.getByRole('button', { name: 'トップページに戻る' }).click();
      await page.getByRole('button', { name: '管理画面' }).click();
      await page.getByRole('tab', { name: '受注管理' }).click();

      await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
      await expect(page.getByRole('table', { name: '受注一覧' })).toBeVisible();

      // テーブルヘッダーの確認
      await expect(page.getByRole('columnheader', { name: '受注ID' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '届け先' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '届け日' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '価格' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '状態' })).toBeVisible();

      // 作成した注文が一覧に表示されている
      await expect(page.getByRole('cell', { name: '山田太郎' })).toBeVisible();
    });
  });

  test.describe('受入基準: 受注の状態でフィルタリングできる', () => {
    test('状態フィルタを「注文済み」に変更するとフィルタされた結果が表示される', async ({ page }) => {
      // 注文を作成
      await createOrderViaUI(page);

      // 管理画面の受注管理タブへ
      await page.getByRole('button', { name: 'トップページに戻る' }).click();
      await page.getByRole('button', { name: '管理画面' }).click();
      await page.getByRole('tab', { name: '受注管理' }).click();

      await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();

      // デフォルトは「全て」で注文が表示されている
      await expect(page.getByRole('cell', { name: '山田太郎' })).toBeVisible();

      // 「注文済み」でフィルタリング
      await page.getByLabel('状態フィルタ').selectOption('注文済み');

      // フィルタ後も注文が表示される（新規注文は「注文済み」状態のため）
      await expect(page.getByRole('cell', { name: '山田太郎' })).toBeVisible();
    });
  });

  test.describe('受入基準: 受注詳細を確認できる', () => {
    test('「詳細」ボタンをクリックすると受注詳細が表示される', async ({ page }) => {
      const deliveryDate = getDeliveryDate();
      await createOrderViaUI(page, { destinationName: '田中花子', deliveryDate });

      // 管理画面の受注管理タブへ
      await page.getByRole('button', { name: 'トップページに戻る' }).click();
      await page.getByRole('button', { name: '管理画面' }).click();
      await page.getByRole('tab', { name: '受注管理' }).click();

      await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '田中花子' })).toBeVisible();

      // 詳細ボタンをクリック
      const row = page.locator('tr', { hasText: '田中花子' });
      await row.getByRole('button', { name: '詳細' }).click();

      // 受注詳細が表示される
      await expect(page.getByRole('heading', { name: '受注詳細' })).toBeVisible();
      await expect(page.getByText('田中花子')).toBeVisible();
      await expect(page.getByText(deliveryDate)).toBeVisible();
      await expect(page.getByText('東京都渋谷区1-2-3')).toBeVisible();
      await expect(page.getByText('03-1234-5678')).toBeVisible();
      await expect(page.getByText('テスト注文です')).toBeVisible();

      // 戻るボタンで一覧に戻れる
      await page.getByRole('button', { name: '戻る' }).click();
      await expect(page.getByRole('heading', { name: '受注管理' })).toBeVisible();
    });
  });
});
