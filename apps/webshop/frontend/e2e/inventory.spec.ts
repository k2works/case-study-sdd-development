import { test, expect } from '@playwright/test'

async function loginAsOwner(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('dev@example.com')
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

async function loginAsCustomer(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
) {
  const uniqueEmail = `e2e-inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`

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

test.describe('在庫管理ナビゲーション', () => {
  test('OWNER のナビゲーションに「在庫管理」が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await expect(page.getByRole('link', { name: '在庫管理' })).toBeVisible()
  })

  test('CUSTOMER には「在庫管理」が非表示', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await expect(page.getByRole('link', { name: '在庫管理' })).toHaveCount(0)
  })

  test('「在庫管理」リンクから在庫推移ページに遷移できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.getByRole('link', { name: '在庫管理' }).click()
    await expect(page).toHaveURL(/\/admin\/inventory/)
    await expect(page.getByRole('heading', { name: '在庫推移' })).toBeVisible()
  })
})

test.describe('在庫推移ページ', () => {
  test('単品未選択時にガイダンスが表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/inventory')
    await expect(page.getByText('単品を選択して在庫推移を表示します。')).toBeVisible()
  })

  test('単品を選択すると単品情報が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/inventory')
    await page.getByLabel('単品').selectOption({ label: '赤バラ' })

    await expect(page.getByText('仕入先:')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('購入単位:')).toBeVisible()
    await expect(page.getByText('リードタイム:')).toBeVisible()
    await expect(page.getByText('品質保持:')).toBeVisible()
  })

  test('単品を選択すると在庫推移テーブルが表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/inventory')
    await page.getByLabel('単品').selectOption({ label: '赤バラ' })

    await expect(page.getByRole('heading', { name: '在庫推移テーブル' })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('columnheader', { name: '日付' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '前日在庫' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '入荷予定' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '受注引当' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '廃棄予定' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '在庫予定' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '状態' })).toBeVisible()
  })

  test('「発注する」リンクから発注管理ページに遷移できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/inventory')
    await page.getByLabel('単品').selectOption({ label: '赤バラ' })

    await expect(page.getByRole('link', { name: '発注する' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('link', { name: '発注する' }).click()
    await expect(page).toHaveURL(/\/admin\/purchase-orders/)
  })
})
