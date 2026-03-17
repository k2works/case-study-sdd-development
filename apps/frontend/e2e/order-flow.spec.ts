import { test, expect, type Page } from '@playwright/test';

/**
 * 商品と単品を画面操作で事前登録するヘルパー
 * InMemory リポジトリのため各テストでデータ投入が必要
 */
async function setupProductViaUI(page: Page) {
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
  await expect(page.getByRole('cell', { name: '赤バラ' })).toBeVisible();

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

  // 花束一覧に戻る
  await page.getByRole('button', { name: '花束一覧' }).click();
  await expect(page.getByText('ローズブーケ')).toBeVisible();
}

function getDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0];
}

test.describe('S01: 花束を注文する', () => {
  test.describe('受入基準: 商品一覧から注文画面に遷移できる', () => {
    test('商品一覧で「注文する」ボタンをクリックすると注文入力画面に遷移する', async ({ page }) => {
      await setupProductViaUI(page);

      await page.getByRole('button', { name: '注文する' }).click();

      await expect(page.getByRole('heading', { name: '注文入力' })).toBeVisible();
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await expect(page.getByText('¥5,500（税込）')).toBeVisible();
    });
  });

  test.describe('受入基準: 注文内容を入力して確認画面に遷移できる', () => {
    test('届け先情報を入力して確認画面へ進むと入力内容が表示される', async ({ page }) => {
      await setupProductViaUI(page);
      await page.getByRole('button', { name: '注文する' }).click();
      await expect(page.getByRole('heading', { name: '注文入力' })).toBeVisible();

      const deliveryDate = getDeliveryDate();
      await page.getByLabel('届け日').fill(deliveryDate);
      await page.getByLabel('届け先名').fill('山田太郎');
      await page.getByLabel('届け先住所').fill('東京都渋谷区1-2-3');
      await page.getByLabel('届け先電話番号').fill('03-1234-5678');
      await page.getByLabel('お届けメッセージ').fill('お誕生日おめでとうございます');

      await page.getByRole('button', { name: '確認画面へ' }).click();

      await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await expect(page.getByText('¥5,500（税込）')).toBeVisible();
      await expect(page.getByText(deliveryDate)).toBeVisible();
      await expect(page.getByText('山田太郎')).toBeVisible();
      await expect(page.getByText('東京都渋谷区1-2-3')).toBeVisible();
      await expect(page.getByText('03-1234-5678')).toBeVisible();
      await expect(page.getByText('お誕生日おめでとうございます')).toBeVisible();
    });
  });

  test.describe('受入基準: 注文を確定して完了画面が表示される', () => {
    test('確認画面で注文を確定すると完了画面に注文番号が表示される', async ({ page }) => {
      await setupProductViaUI(page);
      await page.getByRole('button', { name: '注文する' }).click();

      const deliveryDate = getDeliveryDate();
      await page.getByLabel('届け日').fill(deliveryDate);
      await page.getByLabel('届け先名').fill('鈴木花子');
      await page.getByLabel('届け先住所').fill('大阪府大阪市北区4-5-6');
      await page.getByLabel('届け先電話番号').fill('06-9876-5432');
      await page.getByLabel('お届けメッセージ').fill('ありがとうございます');

      await page.getByRole('button', { name: '確認画面へ' }).click();
      await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();

      await page.getByRole('button', { name: '注文を確定する' }).click();

      await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();
      // 注文番号が表示されている（数値）
      await expect(page.getByText('注文番号')).toBeVisible();
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await expect(page.getByText('鈴木花子')).toBeVisible();
    });
  });

  test.describe('受入基準: 注文フロー全体が正常に動作する', () => {
    test('商品選択から注文完了まで一連のフローが完了する', async ({ page }) => {
      // 1. 商品を事前登録
      await setupProductViaUI(page);

      // 2. 商品一覧から注文画面へ
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await page.getByRole('button', { name: '注文する' }).click();
      await expect(page.getByRole('heading', { name: '注文入力' })).toBeVisible();

      // 3. 注文内容を入力
      const deliveryDate = getDeliveryDate();
      await page.getByLabel('届け日').fill(deliveryDate);
      await page.getByLabel('届け先名').fill('佐藤次郎');
      await page.getByLabel('届け先住所').fill('名古屋市中区7-8-9');
      await page.getByLabel('届け先電話番号').fill('052-1111-2222');
      await page.getByLabel('お届けメッセージ').fill('お祝いの花束です');

      // 4. 確認画面へ
      await page.getByRole('button', { name: '確認画面へ' }).click();
      await expect(page.getByRole('heading', { name: '注文確認' })).toBeVisible();
      await expect(page.getByText('佐藤次郎')).toBeVisible();

      // 5. 注文を確定
      await page.getByRole('button', { name: '注文を確定する' }).click();
      await expect(page.getByRole('heading', { name: '注文が完了しました' })).toBeVisible();
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await expect(page.getByText('佐藤次郎')).toBeVisible();

      // 6. トップページに戻れる
      await page.getByRole('button', { name: 'トップページに戻る' }).click();
      await expect(page.getByRole('heading', { name: '花束一覧' })).toBeVisible();
    });
  });
});
