import { test, expect } from '@playwright/test'

/**
 * IT8 E2E テスト: 得意先管理フロー
 *
 * シナリオ:
 * 1. OWNER ユーザーで得意先一覧を表示
 * 2. 得意先名で検索
 * 3. 得意先詳細画面に遷移
 * 4. 注文履歴を確認
 */

async function loginAsOwner(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('dev@example.com')
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('得意先管理', () => {
  test('得意先一覧が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.getByRole('link', { name: '得意先管理' }).click()
    await expect(page).toHaveURL(/\/admin\/customers/)
    await expect(page.getByRole('heading', { name: '得意先管理' })).toBeVisible()
    // テーブルにデータが表示される
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })
  })

  test('得意先名で検索できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/customers')
    await expect(page.getByRole('heading', { name: '得意先管理' })).toBeVisible()

    // 検索を実行
    await page.getByPlaceholder(/得意先名/).fill('山田')
    await page.getByRole('button', { name: '検索' }).click()

    // 検索結果が表示される（またはゼロ件メッセージ）
    await page.waitForTimeout(1000)
    const table = page.getByRole('table')
    const noResult = page.getByText('条件に一致する得意先はありません')
    await expect(table.or(noResult)).toBeVisible({ timeout: 10000 })
  })

  test('得意先詳細画面に遷移できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/customers')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

    // 最初の「詳細」リンクをクリック
    await page.getByRole('link', { name: '詳細' }).first().click()
    await expect(page).toHaveURL(/\/admin\/customers\/\d+/)

    // 得意先基本情報が表示される
    await expect(page.getByText('氏名')).toBeVisible()
    await expect(page.getByText('メールアドレス')).toBeVisible()
  })

  test('得意先詳細画面で注文履歴が確認できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/customers')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

    await page.getByRole('link', { name: '詳細' }).first().click()
    await expect(page).toHaveURL(/\/admin\/customers\/\d+/)

    // 注文履歴セクションが表示される（データあり or 「まだ注文履歴がありません」）
    const orderTable = page.getByText('注文履歴')
    await expect(orderTable).toBeVisible({ timeout: 10000 })
  })

  test('得意先詳細から一覧に戻れる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/customers')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })

    await page.getByRole('link', { name: '詳細' }).first().click()
    await expect(page).toHaveURL(/\/admin\/customers\/\d+/)

    // 一覧に戻る
    await page.getByRole('link', { name: /得意先一覧に戻る/ }).click()
    await expect(page).toHaveURL(/\/admin\/customers/)
  })
})
