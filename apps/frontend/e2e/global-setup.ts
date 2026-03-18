/**
 * Playwright globalSetup: テスト実行前にテストサーバーが正しいモードで起動しているかを検証する。
 * 本番バックエンドサーバーが port 8080 で動いている場合、テストを早期に失敗させる。
 */
export default async function globalSetup() {
  const testApiUrl = process.env.TEST_API_URL ?? 'http://localhost:8080';

  try {
    const response = await fetch(`${testApiUrl}/api/health`);
    const data = await response.json();

    if (data.mode !== 'test') {
      throw new Error(
        `[E2E Setup Error] port 8080 で動いているサーバーはテストサーバーではありません ` +
          `(health response: ${JSON.stringify(data)})。` +
          `本番バックエンドサーバーを停止してから E2E テストを再実行してください。`,
      );
    }
  } catch (error) {
    if (error instanceof TypeError && (error as NodeJS.ErrnoException).cause) {
      // fetch が接続できなかった場合 — Playwright が webServer で起動するので問題ない
      return;
    }
    throw error;
  }
}
