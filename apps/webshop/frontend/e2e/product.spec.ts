import { test, expect } from '@playwright/test'

async function loginAsOwner(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('dev@example.com')
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

async function loginAsNewUser(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
  const uniqueEmail = `e2e-product-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`

  await request.post('/api/v1/auth/register', {
    data: {
      email: uniqueEmail,
      password: 'Password1',
      firstName: '太郎',
      lastName: '山田',
      phone: null,
    },
  })

  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill(uniqueEmail)
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('商品管理画面', () => {
  test('ナビゲーションから商品管理画面にアクセスできる', async ({ page }) => {
    await loginAsOwner(page)

    await page.getByRole('link', { name: '商品管理', exact: true }).click()
    await expect(page).toHaveURL(/\/products/)
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible()
  })

  test('商品管理画面に新規登録ボタンが表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/products')
    await expect(page.getByText('新規商品を登録')).toBeVisible()
  })

  test('商品登録フォームに遷移できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/products')
    await page.getByText('新規商品を登録').click()
    await expect(page).toHaveURL(/\/products\/new/)
    await expect(page.getByRole('heading', { name: '商品登録' })).toBeVisible()
  })

  test('商品を登録して一覧に表示される', async ({ page }) => {
    await loginAsOwner(page)

    const productName = `E2Eテスト花束_${Date.now()}`
    await page.goto('/products/new')
    await page.getByLabel('商品名').fill(productName)
    await page.getByLabel('価格（円）').fill('5000')
    await page.getByLabel('説明').fill('E2Eテスト用の花束です')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL(/\/products$/, { timeout: 10000 })
    await expect(page.getByText(productName)).toBeVisible()
  })
})

test.describe('商品カタログ画面', () => {
  test('ナビゲーションから商品カタログにアクセスできる', async ({ page, request }) => {
    await loginAsNewUser(page, request)

    await page.getByRole('link', { name: '商品カタログ', exact: true }).click()
    await expect(page).toHaveURL(/\/catalog\/products/)
    await expect(page.getByRole('heading', { name: '商品一覧' })).toBeVisible()
  })

  test('ダッシュボードから商品管理にアクセスできる', async ({ page, request }) => {
    await loginAsNewUser(page, request)

    await page.getByRole('link', { name: /花束の登録・構成管理/ }).click()
    await expect(page).toHaveURL(/\/products/)
    await expect(page.getByRole('heading', { name: '商品管理' })).toBeVisible()
  })

  test('ダッシュボードから商品カタログにアクセスできる', async ({ page, request }) => {
    await loginAsNewUser(page, request)

    await page.getByRole('link', { name: /販売中の花束を確認/ }).click()
    await expect(page).toHaveURL(/\/catalog\/products/)
    await expect(page.getByRole('heading', { name: '商品一覧' })).toBeVisible()
  })
})
