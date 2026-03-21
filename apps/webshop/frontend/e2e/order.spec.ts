import { test, expect } from '@playwright/test'

/**
 * CUSTOMER ロールで新規登録しログインする
 */
async function loginAsCustomer(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
) {
  const uniqueEmail = `e2e-order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`

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

test.describe('注文ナビゲーション', () => {
  test('CUSTOMER ユーザーのナビゲーションに「注文履歴」が表示される', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await expect(page.getByRole('link', { name: '商品カタログ', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: '注文履歴' })).toBeVisible()
    // CUSTOMER には受注管理は非表示
    await expect(page.getByRole('link', { name: '受注管理' })).toHaveCount(0)
  })

  test('「注文履歴」リンクから注文履歴ページに遷移できる', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await page.getByRole('link', { name: '注文履歴' }).click()
    await expect(page).toHaveURL(/\/orders\/my/)
    await expect(page.getByRole('heading', { name: '注文履歴' })).toBeVisible()
  })

  test('注文がない場合は空状態メッセージが表示される', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await page.goto('/orders/my')
    await expect(page.getByText('まだ注文がありません。')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('商品カタログから注文する')).toBeVisible()
  })
})

test.describe('注文フロー', () => {
  test('商品カタログから商品詳細に遷移できる', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await page.getByRole('link', { name: '商品カタログ', exact: true }).click()
    await expect(page).toHaveURL(/\/catalog\/products/)
    await expect(page.getByRole('heading', { name: '商品一覧' })).toBeVisible()
  })

  test('注文確認から注文完了まで進める', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await page.getByRole('link', { name: '商品カタログ', exact: true }).click()
    await page.getByRole('link', { name: '詳細を見る' }).first().click()
    await page.getByRole('button', { name: 'この商品を注文する' }).click()

    await page.getByLabel(/届け先氏名/).fill('山田 花子')
    await page.getByLabel(/郵便番号/).fill('123-4567')
    await page.getByLabel(/^住所/).fill('東京都千代田区1-1-1')
    await page.getByLabel(/電話番号/).fill('090-1234-5678')
    await page.getByLabel(/メッセージ/).fill('お届けをお願いします')

    await page.getByRole('button', { name: '確認画面へ' }).click()
    await expect(page.getByRole('heading', { name: '注文内容の確認' })).toBeVisible()

    await page.getByRole('button', { name: '注文を確定する' }).click()

    await expect(page).toHaveURL(/\/orders\/complete/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございます' })).toBeVisible()
  })
})
