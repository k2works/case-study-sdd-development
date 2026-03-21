import { test, expect } from '@playwright/test'

function uniqueEmail(prefix: string) {
  return `e2e-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`
}

async function loginAsOwner(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('dev@example.com')
  await page.getByLabel('パスワード').fill('Password1')
  await page.getByRole('button', { name: 'ログイン' }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('ログインページ', () => {
  test('ログインフォームが表示される', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('新規登録リンクが表示される', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('新規登録はこちら')).toBeVisible()
  })

  test('空入力で送信するとバリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login')

    // 開発モードの初期値が有効な場合に備えて明示的に空入力にする
    await page.getByLabel('メールアドレス').fill('')
    await page.getByLabel('パスワード').fill('')

    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('メールアドレスは必須です')).toBeVisible()
  })

  test('未認証で /dashboard にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
  })
})

test.describe('新規登録 → ログインフロー', () => {
  test('新規登録後にダッシュボードに遷移する', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('メールアドレス').fill(uniqueEmail('reg'))
    await page.getByLabel('パスワード', { exact: true }).fill('Password1')
    await page.getByLabel('パスワード（確認）').fill('Password1')
    await page.getByLabel('姓').fill('山田')
    await page.getByLabel('名').fill('太郎')
    await page.getByLabel('電話番号（任意）').fill('090-1234-5678')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible()
  })

  test('登録済みユーザーでログインできる', async ({ page, request }) => {
    const uniqueEmail = `e2e-login-${Date.now()}@example.com`

    // API で先にユーザーを登録
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
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible()
  })

  test('誤ったパスワードでエラーメッセージが表示される', async ({ page, request }) => {
    const uniqueEmail = `e2e-fail-${Date.now()}@example.com`

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
    await page.getByLabel('パスワード').fill('WrongPass1')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('認証済みアクセス', () => {
  test('OWNER でログイン後に単品管理画面にアクセスできる', async ({ page }) => {
    await loginAsOwner(page)

    await page.getByRole('link', { name: '単品管理' }).click()
    await expect(page).toHaveURL(/\/items/)
    await expect(page.getByRole('heading', { name: '単品管理' })).toBeVisible()
  })

  test('ログアウト後にログインページに戻る', async ({ page, request }) => {
    const uniqueEmail = `e2e-logout-${Date.now()}@example.com`

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

    await page.getByRole('button', { name: 'ログアウト' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
  })
})
