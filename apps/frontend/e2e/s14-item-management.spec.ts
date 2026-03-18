import { test, expect } from '@playwright/test';

test.describe('S14: 単品（花）を管理する', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:8080/api/test/reset');
    await page.goto('/');
    await page.getByRole('button', { name: '管理画面' }).click();
    await page.getByRole('tab', { name: '単品管理' }).click();
    await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible();
  });

  test.describe('受入基準: 単品の名称・品質維持可能日数・購入単位・発注リードタイムを登録できる', () => {
    test('新規単品を登録できる', async ({ page }) => {
      await page.getByRole('button', { name: '新規登録' }).click();

      await expect(page.getByRole('heading', { name: '単品登録' })).toBeVisible();

      await page.getByLabel('単品名').fill('カスミソウ');
      await page.getByLabel('品質維持可能日数').fill('5');
      await page.getByLabel('購入単位').fill('20');
      await page.getByLabel('発注リードタイム').fill('3');
      await page.getByLabel('仕入先ID').fill('1');

      await page.getByRole('button', { name: '保存する' }).click();

      const row = page.locator('tr', { hasText: 'カスミソウ' });
      await expect(row).toBeVisible();
      await expect(row).toContainText('5日');
      await expect(row).toContainText('20本');
      await expect(row).toContainText('3日');
    });
  });

  test.describe('受入基準: 単品に仕入先を紐づけられる', () => {
    test('仕入先IDを設定して登録できる', async ({ page }) => {
      await page.getByRole('button', { name: '新規登録' }).click();

      await page.getByLabel('単品名').fill('ユリ');
      await page.getByLabel('品質維持可能日数').fill('10');
      await page.getByLabel('購入単位').fill('5');
      await page.getByLabel('発注リードタイム').fill('1');
      await page.getByLabel('仕入先ID').fill('2');

      await page.getByRole('button', { name: '保存する' }).click();

      const row = page.locator('tr', { hasText: 'ユリ' });
      await expect(row).toBeVisible();
    });
  });

  test.describe('受入基準: 既存単品の情報を更新できる', () => {
    test('登録済みの単品を編集して更新できる', async ({ page }) => {
      // まず単品を登録
      await page.getByRole('button', { name: '新規登録' }).click();
      await page.getByLabel('単品名').fill('チューリップ');
      await page.getByLabel('品質維持可能日数').fill('4');
      await page.getByLabel('購入単位').fill('15');
      await page.getByLabel('発注リードタイム').fill('2');
      await page.getByLabel('仕入先ID').fill('1');
      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'チューリップ' })).toBeVisible();

      // 編集ボタンをクリック
      const row = page.locator('tr', { hasText: 'チューリップ' });
      await row.getByRole('button', { name: '編集' }).click();

      await expect(page.getByRole('heading', { name: '単品編集' })).toBeVisible();

      // 名前を変更
      await page.getByLabel('単品名').fill('チューリップ（赤）');
      await page.getByLabel('品質維持可能日数').fill('6');

      await page.getByRole('button', { name: '保存する' }).click();

      await expect(page.getByRole('cell', { name: 'チューリップ（赤）' })).toBeVisible();
      await expect(page.getByText('6日')).toBeVisible();
    });
  });
});
