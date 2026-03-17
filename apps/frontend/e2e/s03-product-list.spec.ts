import { test, expect } from '@playwright/test';

test.describe('S03: 商品一覧を閲覧する', () => {
  test.describe('受入基準: 登録されている花束の一覧が表示される', () => {
    test('花束一覧ページが表示される', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { name: 'フレール・メモワール WEB ショップ' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '花束一覧' })).toBeVisible();
    });

    test('商品がない場合は空メッセージが表示される', async ({ page }) => {
      await page.goto('/');

      const emptyMessage = page.getByText('現在、商品はありません');
      const productCards = page.locator('.product-card');

      const hasProducts = await productCards.count() > 0;
      if (!hasProducts) {
        await expect(emptyMessage).toBeVisible();
      } else {
        await expect(emptyMessage).not.toBeVisible();
      }
    });
  });

  test.describe('受入基準: 花束の詳細（構成する花の種類と数量）が確認できる', () => {
    test('商品を登録した後、花束一覧に商品名・価格・構成が表示される', async ({ page }) => {
      // まず管理画面で単品を登録する
      await page.goto('/');
      await page.getByRole('button', { name: '管理画面' }).click();

      // 単品管理に切り替え
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

      // 商品管理に切り替え
      await page.getByRole('tab', { name: '商品管理' }).click();
      await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('商品名').fill('ローズブーケ');
      await page.getByLabel('価格（税込）').fill('5500');
      await page.getByRole('button', { name: '構成を追加' }).click();

      // 構成の数量を設定
      await page.getByLabel('構成 1 の数量').fill('5');
      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'ローズブーケ' })).toBeVisible();

      // 花束一覧に切り替え
      await page.getByRole('button', { name: '花束一覧' }).click();

      // 商品カードの表示を確認
      await expect(page.getByText('ローズブーケ')).toBeVisible();
      await expect(page.getByText('¥5,500（税込）')).toBeVisible();

      // 構成情報（花の種類と数量）が表示されている
      await expect(page.getByText(/赤バラx5/)).toBeVisible();
    });
  });
});
