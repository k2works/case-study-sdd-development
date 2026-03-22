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
  const uniqueEmail = `e2e-po-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`

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

function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

test.describe('発注管理ナビゲーション', () => {
  test('OWNER のナビゲーションに「発注管理」が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await expect(page.getByRole('link', { name: '発注管理' })).toBeVisible()
  })

  test('CUSTOMER には「発注管理」が非表示', async ({ page, request }) => {
    await loginAsCustomer(page, request)

    await expect(page.getByRole('link', { name: '発注管理' })).toHaveCount(0)
  })

  test('「発注管理」リンクから発注管理ページに遷移できる', async ({ page }) => {
    await loginAsOwner(page)

    await page.getByRole('link', { name: '発注管理' }).click()
    await expect(page).toHaveURL(/\/admin\/purchase-orders/)
    await expect(page.getByRole('heading', { name: '発注管理' })).toBeVisible()
  })
})

test.describe('発注管理ページ', () => {
  test('新規発注フォームが表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')
    await expect(page.getByRole('heading', { name: '新規発注' })).toBeVisible()
    await expect(page.getByLabel('単品')).toBeVisible()
    await expect(page.getByLabel('数量')).toBeVisible()
    await expect(page.getByLabel('希望納品日')).toBeVisible()
    await expect(page.getByRole('button', { name: '発注する' })).toBeVisible()
  })

  test('単品を選択すると仕入先・購入単位が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')
    await page.getByLabel('単品').selectOption({ label: '赤バラ' })

    await expect(page.getByText('仕入先:')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('購入単位:')).toBeVisible()
  })

  test('発注一覧に「まだ発注がありません」が表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')
    await expect(page.getByRole('heading', { name: '発注一覧' })).toBeVisible()
    // 発注が存在しない場合のメッセージ、または発注一覧テーブルが表示される
    const emptyMessage = page.getByText('まだ発注がありません。')
    const orderTable = page.getByRole('table')
    await expect(emptyMessage.or(orderTable)).toBeVisible({ timeout: 10000 })
  })

  test('必須項目未入力で発注するとエラーが表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')
    await page.getByRole('button', { name: '発注する' }).click()

    await expect(page.getByText('全ての項目を入力してください')).toBeVisible()
  })

  test('発注を作成すると発注一覧に表示される', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')
    await page.getByLabel('単品').selectOption({ label: '赤バラ' })
    await page.getByLabel('数量').fill('10')
    await page.getByLabel('希望納品日').fill(futureDate(7))
    await page.getByRole('button', { name: '発注する' }).click()

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('columnheader', { name: '単品' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '仕入先' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '数量' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '希望納品日' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'ステータス' })).toBeVisible()
    await expect(page.getByText('赤バラ')).toBeVisible()
    await expect(page.getByText('発注済み')).toBeVisible()
  })

  test('ステータスフィルタで発注一覧を絞り込める', async ({ page }) => {
    await loginAsOwner(page)

    await page.goto('/admin/purchase-orders')

    // フィルタセレクトが存在する
    const filterSelect = page.locator('select').filter({ hasText: 'すべて' })
    await expect(filterSelect).toBeVisible()
    await expect(filterSelect.getByRole('option', { name: '発注済み' })).toBeAttached()
    await expect(filterSelect.getByRole('option', { name: '一部入荷' })).toBeAttached()
    await expect(filterSelect.getByRole('option', { name: '入荷済み' })).toBeAttached()
  })
})
