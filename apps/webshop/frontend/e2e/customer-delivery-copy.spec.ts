import { test, expect } from '@playwright/test'

/**
 * IT8 E2E テスト: リピート注文フロー（届け先コピー）
 *
 * シナリオ:
 * 1. CUSTOMER ユーザーで1回目の注文を完了する（新しい届け先入力）
 * 2. 2回目の注文時に「過去の届け先から選択」が表示される
 * 3. 過去の届け先を選択すると、フォームに自動入力される
 * 4. 注文確定まで完了する
 */

async function registerAndLoginAsCustomer(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
) {
  const uniqueEmail = `e2e-repeat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`

  await request.post('/api/v1/auth/register', {
    data: {
      email: uniqueEmail,
      password: 'Password1',
      firstName: '花子',
      lastName: '山田',
      phone: '090-1234-5678',
    },
  })

  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill(uniqueEmail)
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

async function placeOrderWithNewDestination(
  page: import('@playwright/test').Page,
  recipientName: string,
  postalCode: string,
  address: string,
  phone: string,
) {
  await page.getByRole('link', { name: '商品カタログ', exact: true }).click()
  await page.getByRole('link', { name: '詳細を見る' }).first().click()
  await page.getByRole('button', { name: 'この商品を注文する' }).click()

  await page.getByLabel(/届け先氏名/).fill(recipientName)
  await page.getByLabel(/郵便番号/).fill(postalCode)
  await page.getByLabel(/^住所/).fill(address)
  await page.getByLabel(/電話番号/).fill(phone)

  await page.getByRole('button', { name: '確認画面へ' }).click()
  await expect(page.getByRole('heading', { name: '注文内容の確認' })).toBeVisible()

  await page.getByRole('button', { name: '注文を確定する' }).click()
  await expect(page).toHaveURL(/\/orders\/complete/, { timeout: 10000 })
}

test.describe('リピート注文フロー（届け先コピー）', () => {
  test('1回目注文後に2回目注文で過去の届け先が選択できる', async ({ page, request }) => {
    await registerAndLoginAsCustomer(page, request)

    // 1回目の注文
    await placeOrderWithNewDestination(
      page,
      '山田 花子',
      '123-4567',
      '東京都千代田区1-1-1',
      '090-1234-5678',
    )

    // 2回目の注文を開始
    await page.getByRole('link', { name: '商品カタログ', exact: true }).click()
    await page.getByRole('link', { name: '詳細を見る' }).first().click()
    await page.getByRole('button', { name: 'この商品を注文する' }).click()

    // 「過去の届け先から選択」が表示される
    await expect(page.getByText('過去の届け先から選択')).toBeVisible({ timeout: 10000 })

    // 過去の届け先を選択
    await page.getByLabel('過去の届け先から選択').check()

    // 届け先一覧が表示される
    await expect(page.getByText('山田 花子')).toBeVisible()

    // 届け先を選択するとフォームに自動入力される
    await page.getByText('山田 花子').click()
    await expect(page.getByLabel(/届け先氏名/)).toHaveValue('山田 花子')
    await expect(page.getByLabel(/郵便番号/)).toHaveValue('123-4567')
    await expect(page.getByLabel(/^住所/)).toHaveValue('東京都千代田区1-1-1')

    // 注文確定まで完了
    await page.getByRole('button', { name: '確認画面へ' }).click()
    await expect(page.getByRole('heading', { name: '注文内容の確認' })).toBeVisible()

    await page.getByRole('button', { name: '注文を確定する' }).click()
    await expect(page).toHaveURL(/\/orders\/complete/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございます' })).toBeVisible()
  })
})
