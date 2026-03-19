# 技術スタック - フレール・メモワール WEB ショップシステム

## バックエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| 言語 | TypeScript | 5.x | バックエンド開発 | - |
| ランタイム | Node.js | 22.x (LTS) | サーバーサイド実行環境 | 2027-04 |
| フレームワーク | Fastify | 5.x | REST API サーバー | - |
| ORM | Prisma | 6.x | データアクセス・マイグレーション | - |
| バリデーション | Zod | 3.x | リクエストバリデーション・型生成 | - |
| テスト | Vitest | 3.x | ユニットテスト・統合テスト | - |
| テスト | Supertest | 7.x | API 統合テスト | - |
| Lint | ESLint | 9.x | 静的解析 | - |
| フォーマッター | Prettier | 3.x | コードフォーマット | - |

**選定理由:**

- Fastify: Express より高速。TypeScript サポートが充実。スキーマバリデーション内蔵
- Prisma: TypeScript 親和性が高く、型安全なクエリが書ける。マイグレーション管理が容易
- Zod: TypeScript ファーストのバリデーションライブラリ。Prisma との相性が良い

## フロントエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| 言語 | TypeScript | 5.x | フロントエンド開発 | - |
| フレームワーク | React | 19.x | UI コンポーネント | - |
| ビルドツール | Vite | 6.x | バンドル・開発サーバー | - |
| サーバー状態管理 | TanStack Query | 5.x | API キャッシュ・非同期状態管理 | - |
| ルーティング | React Router | 7.x | SPA ルーティング | - |
| スタイリング | Tailwind CSS | 4.x | ユーティリティファースト CSS | - |
| フォーム | React Hook Form | 7.x | フォーム状態管理・バリデーション | - |
| テスト | Vitest | 3.x | ユニットテスト・コンポーネントテスト | - |
| テスト | Testing Library | 16.x | コンポーネントテスト | - |
| E2E テスト | Playwright | 1.x | E2E テスト | - |
| Lint | ESLint | 9.x | 静的解析 | - |

**選定理由:**

- React 19: 最新の Server Components・Concurrent Features を活用可能
- TanStack Query: API キャッシュ・ローディング・エラー状態を簡潔に管理
- React Hook Form: 再レンダリングを最小化した高性能フォーム管理
- Playwright: クロスブラウザ E2E テスト。信頼性が高く、CI 統合が容易

## データベース

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| RDBMS | PostgreSQL | 17.x | メインデータストア | 2029-11 |

**選定理由:**

- リレーショナルデータ（受注・在庫・発注）に適合
- Prisma との相性が良い
- JSON 型サポートにより将来の拡張に対応可能

## インフラ・開発環境

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| コンテナ | Docker | 27.x | コンテナ化 | - |
| コンテナ構成 | Docker Compose | 2.x | ローカル開発環境 | - |
| CI/CD | GitHub Actions | - | ビルド・テスト・デプロイ自動化 | - |
| パッケージ管理 | npm | 10.x | 依存関係管理 | - |

## バージョン管理方針

- **Node.js**: LTS バージョン（偶数）を使用。EOL の 6 ヶ月前にアップグレード計画を立てる
- **PostgreSQL**: メジャーバージョンのサポート期限（約 5 年）を確認して選定
- **依存ライブラリ**: `npm audit` を月次で実行し、セキュリティパッチを適用する
- **メジャーバージョンアップ**: 年 1 回の棚卸しで計画的にアップグレードする

## package.json（主要依存関係）

```json
{
  "engines": {
    "node": ">=22.0.0"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prisma": "^6.0.0",
    "vitest": "^3.0.0",
    "supertest": "^7.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.0.0",
    "eslint": "^9.0.0"
  }
}
```
