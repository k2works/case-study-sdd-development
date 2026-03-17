# 技術スタック選定 - フレール・メモワール WEB ショップ

## 選定方針

| 方針 | 根拠 |
| :--- | :--- |
| TypeScript 統一 | 1-2 名フルスタックチーム。言語を統一しコンテキストスイッチを最小化 |
| LTS バージョン優先 | 小規模チームでのセキュリティパッチ対応負荷を抑える |
| シンプルさ重視 | 過剰な技術導入を避け、チームが運用できる範囲に抑える |

## バックエンド

| カテゴリ | 技術 | バージョン | 用途 | 選定理由 |
| :--- | :--- | :--- | :--- | :--- |
| ランタイム | Node.js | 22.x LTS | サーバーサイド実行環境 | フロントエンドと言語統一、LTS |
| 言語 | TypeScript | 5.x | 型安全な開発 | ドメインモデルの型表現に適する |
| フレームワーク | Express | 4.x | REST API サーバー | シンプル、エコシステム豊富 |
| ORM | Prisma | 6.x | データアクセス | 型安全、マイグレーション機能 |
| バリデーション | Zod | 3.x | 入力検証・スキーマ定義 | TypeScript ネイティブ |
| テスト | Vitest | 3.x | ユニット・統合テスト | 高速、ESM 対応 |
| テスト | Supertest | 7.x | API テスト | Express との相性 |
| DB | PostgreSQL | 16 | データストア | 集計クエリ・インデックスが充実 |

## フロントエンド

| カテゴリ | 技術 | バージョン | 用途 | 選定理由 |
| :--- | :--- | :--- | :--- | :--- |
| 言語 | TypeScript | 5.x | 型安全な UI 開発 | バックエンドと統一 |
| フレームワーク | React | 19.x | SPA フレームワーク | コンポーネント設計の柔軟性 |
| ルーティング | React Router | 7.x | ページ遷移 | React 標準 |
| スタイリング | CSS Modules | - | コンポーネントスタイル | スコープ付き CSS、シンプル |
| HTTP クライアント | fetch API | - | API 通信 | 標準 API、追加依存不要 |
| テスト | Vitest | 3.x | ユニットテスト | バックエンドと統一 |
| テスト | Testing Library | 16.x | コンポーネントテスト | ユーザー視点のテスト |
| ビルド | Vite | 6.x | 開発サーバー・ビルド | 高速 HMR、ESM ネイティブ |

## インフラストラクチャ

| カテゴリ | 技術 | バージョン | 用途 | 選定理由 |
| :--- | :--- | :--- | :--- | :--- |
| コンテナ | Docker | 27.x | アプリケーションコンテナ化 | 環境の一貫性 |
| オーケストレーション | Docker Compose | 2.x | ローカル開発環境 | シンプルな構成管理 |
| CI/CD | GitHub Actions | - | 自動テスト・デプロイ | リポジトリ統合 |
| パッケージ管理 | npm | 10.x | 依存関係管理 | Node.js 標準 |

## 開発ツール

| カテゴリ | 技術 | バージョン | 用途 |
| :--- | :--- | :--- | :--- |
| Linter | ESLint | 9.x | コード品質チェック |
| Formatter | Prettier | 3.x | コードフォーマット |
| Git Hooks | Husky | 9.x | コミット前チェック |
| API ドキュメント | OpenAPI | 3.1 | REST API 仕様 |

## バージョン管理・サポート期限

| 技術 | バージョン | サポート期限 | 更新計画 |
| :--- | :--- | :--- | :--- |
| Node.js | 22.x LTS | 2027-04 | 次期 LTS リリース時に評価 |
| PostgreSQL | 16 | 2028-11 | メジャーバージョンアップは年次で評価 |
| TypeScript | 5.x | 継続サポート | マイナーバージョンを定期更新 |
| React | 19.x | 継続サポート | メジャーバージョンアップは慎重に評価 |

## プロジェクト構成

```
project-root/
├── apps/
│   ├── backend/          # Express + Prisma
│   │   ├── src/
│   │   │   ├── domain/       # ドメイン層
│   │   │   ├── application/  # アプリケーション層
│   │   │   ├── infrastructure/ # インフラ層
│   │   │   └── presentation/ # プレゼンテーション層
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/         # React + Vite
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── utils/
│       │   ├── types/
│       │   └── config/
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── package.json          # ワークスペースルート
└── tsconfig.base.json
```
