import { test, expect } from '@playwright/test';

test.describe('S13: 商品（花束）を管理する', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();
    // 商品管理タブはデフォルトで選択済み
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();
  });

  test.describe('受入基準: 商品の名称を登録できる', () => {
    test('商品名を入力して新規商品を登録できる', async ({ page }) => {
      await page.getByRole('button', { name: '新規登録' }).click();

      await expect(page.getByRole('heading', { name: '商品登録' })).toBeVisible();

      await page.getByLabel('商品名').fill('春のブーケ');
      await page.getByLabel('価格（税込）').fill('3300');

      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: '春のブーケ' })).toBeVisible();
    });
  });

  test.describe('受入基準: 商品の価格（税込）を登録できる', () => {
    test('価格を入力して登録した商品の価格がテーブルに表示される', async ({ page }) => {
      await page.getByRole('button', { name: '新規登録' }).click();

      await page.getByLabel('商品名').fill('サマーアレンジ');
      await page.getByLabel('価格（税込）').fill('4400');

      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: '¥4,400' })).toBeVisible();
    });
  });

  test.describe('受入基準: 商品の構成（単品と数量の組合せ）を登録できる', () => {
    test('単品を登録してから商品に構成を追加して登録できる', async ({ page }) => {
      // まず単品を登録
      await page.getByRole('tab', { name: '単品管理' }).click();
      await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('単品名').fill('ガーベラ');
      await page.getByLabel('品質維持可能日数').fill('5');
      await page.getByLabel('購入単位').fill('10');
      await page.getByLabel('発注リードタイム').fill('2');
      await page.getByLabel('仕入先ID').fill('1');
      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'ガーベラ' })).toBeVisible();

      // 商品管理に切り替え
      await page.getByRole('tab', { name: '商品管理' }).click();
      await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('商品名').fill('ガーベラブーケ');
      await page.getByLabel('価格（税込）').fill('2200');

      // 構成を追加
      await page.getByRole('button', { name: '構成を追加' }).click();
      // ガーベラを明示的に選択
      await page.getByLabel('構成 1 の単品').selectOption({ label: 'ガーベラ' });
      await page.getByLabel('構成 1 の数量').fill('3');

      await page.getByRole('button', { name: '保存する' }).click();

      const productRow = page.locator('tr', { hasText: 'ガーベラブーケ' });
      await expect(productRow).toBeVisible();
      await expect(productRow).toContainText('ガーベラx3');
    });
  });

  test.describe('受入基準: 既存商品の構成を更新できる', () => {
    test('登録済みの商品を編集して構成を変更できる', async ({ page }) => {
      // 単品を登録
      await page.getByRole('tab', { name: '単品管理' }).click();
      await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();

      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('単品名').fill('ヒマワリ');
      await page.getByLabel('品質維持可能日数').fill('7');
      await page.getByLabel('購入単位').fill('5');
      await page.getByLabel('発注リードタイム').fill('1');
      await page.getByLabel('仕入先ID').fill('1');
      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'ヒマワリ' })).toBeVisible();

      // 商品を登録
      await page.getByRole('tab', { name: '商品管理' }).click();
      await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible();

      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('商品名').fill('ヒマワリアレンジ');
      await page.getByLabel('価格（税込）').fill('3300');
      await page.getByRole('button', { name: '構成を追加' }).click();
      // ヒマワリを明示的に選択
      await page.getByLabel('構成 1 の単品').selectOption({ label: 'ヒマワリ' });
      await page.getByLabel('構成 1 の数量').fill('2');
      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'ヒマワリアレンジ' })).toBeVisible();

      // 編集ボタンをクリック
      const row = page.locator('tr', { hasText: 'ヒマワリアレンジ' });
      await row.getByRole('button', { name: '編集' }).click();

      await expect(page.getByRole('heading', { name: '商品編集' })).toBeVisible();

      // 構成の数量を変更
      await page.getByLabel('構成 1 の数量').fill('7');
      await page.getByRole('button', { name: '保存する' }).click();

      const updatedRow = page.locator('tr', { hasText: 'ヒマワリアレンジ' });
      await expect(updatedRow).toContainText('ヒマワリx7');
    });
  });
});
