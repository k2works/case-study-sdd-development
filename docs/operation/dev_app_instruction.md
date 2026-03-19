# アプリケーション開発環境セットアップ手順書

## 概要

本ドキュメントは、フレール・メモワール WEB ショップシステムのアプリケーション開発環境をセットアップする手順を説明します。

テスト駆動開発（TDD）のゴールは **動作するきれいなコード** です。それを実現するためには [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) が必要です。

> バージョン管理・テスティング・自動化 の 3 つです。

---

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

| ツール | バージョン | 確認コマンド |
| :--- | :--- | :--- |
| Node.js | 22.x LTS | `node -v` |
| npm | 10.x | `npm -v` |
| Docker | 最新 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新 | `git -v` |

### Node.js のインストール

```bash
# nvm でインストール（推奨）
nvm install 22
nvm use 22

# バージョン確認
node -v
npm -v
```

公式サイト: https://nodejs.org/

### Docker のインストール

- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/

```bash
docker -v
docker compose version
```

---

## 2. プロジェクトの取得

```bash
git clone https://github.com/k2works/case-study-sdd-development.git
cd case-study-sdd-development

# Node.js 依存パッケージのインストール
npm install
```

---

## 3. システム構成

フレール・メモワール WEB ショップシステムは以下のサービスで構成されます。

| サービス | ディレクトリ | 説明 | ポート |
| :--- | :--- | :--- | :--- |
| バックエンド API | `src/backend/` | Fastify REST API | 3000 |
| フロントエンド | `src/frontend/` | React SPA | 5173 |
| PostgreSQL | Docker | メインデータストア | 5432 |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
| :--- | :--- | :--- |
| 言語 | TypeScript | 5.x |
| ランタイム | Node.js | 22.x LTS |
| フレームワーク | Fastify | 5.x |
| ORM | Prisma | 6.x |
| バリデーション | Zod | 3.x |
| テスト | Vitest | 3.x |
| API テスト | Supertest | 7.x |
| Lint | ESLint | 9.x |
| フォーマッター | Prettier | 3.x |

### フロントエンド

| カテゴリ | 技術 | バージョン |
| :--- | :--- | :--- |
| 言語 | TypeScript | 5.x |
| フレームワーク | React | 19.x |
| ビルドツール | Vite | 6.x |
| サーバー状態管理 | TanStack Query | 5.x |
| ルーティング | React Router | 7.x |
| スタイリング | Tailwind CSS | 4.x |
| フォーム | React Hook Form | 7.x |
| テスト | Vitest + Testing Library | 3.x / 16.x |
| E2E テスト | Playwright | 1.x |

### データベース・インフラ

| カテゴリ | 技術 | バージョン |
| :--- | :--- | :--- |
| RDBMS | PostgreSQL | 17.x |
| コンテナ | Docker Compose | v2.x |
| CI/CD | GitHub Actions | - |

---

## 5. Docker Compose のセットアップ

### データベースの起動

```bash
# PostgreSQL を起動
docker compose up -d db

# コンテナの状態確認
docker compose ps

# ログ確認
docker compose logs -f db
```

### Docker Compose の便利なコマンド

```bash
# 全サービス起動
docker compose up -d

# 停止・削除
docker compose down

# データも含めて削除
docker compose down -v

# DB に接続
docker compose exec db psql -U postgres -d fleur_memoire
```

---

## 6. バックエンドのセットアップ

```bash
cd src/backend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env を編集: DATABASE_URL を設定

# Prisma マイグレーション実行
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

### アクセス確認

| サービス | URL |
| :--- | :--- |
| API | http://localhost:3000 |
| ヘルスチェック | http://localhost:3000/health |
| API ドキュメント | http://localhost:3000/docs |

---

## 7. フロントエンドのセットアップ

```bash
cd src/frontend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env を編集: VITE_API_URL=http://localhost:3000

# 開発サーバー起動
npm run dev
```

### アクセス確認

| サービス | URL |
| :--- | :--- |
| フロントエンド | http://localhost:5173 |

---

## 8. テストの実行

### バックエンドテスト

```bash
cd src/backend

# 全テスト実行
npm test

# カバレッジ付き
npm run test:coverage

# ウォッチモード（TDD）
npm run test:watch
```

### フロントエンドテスト

```bash
cd src/frontend

# 全テスト実行
npm test

# カバレッジ付き
npm run test:coverage

# E2E テスト
npm run test:e2e
```

### テスト種別

| テスト種別 | ツール | 対象 |
| :--- | :--- | :--- |
| ユニットテスト | Vitest | ドメイン層・ユースケース |
| 統合テスト | Vitest + Supertest | API エンドポイント |
| コンポーネントテスト | Vitest + Testing Library | React コンポーネント |
| E2E テスト | Playwright | 主要ユーザーフロー |

---

## 9. コード品質管理

```bash
# Lint チェック
npm run lint

# フォーマット
npm run format

# 型チェック
npm run typecheck
```

### カバレッジ目標

| 対象 | 目標 |
| :--- | :--- |
| ドメイン層 | 90% 以上 |
| アプリケーション層 | 80% 以上 |

---

## 10. ディレクトリ構造

```
case-study-sdd-development/
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── domain/          # ドメイン層（エンティティ・値オブジェクト）
│   │   │   ├── application/     # アプリケーション層（ユースケース）
│   │   │   ├── infrastructure/  # インフラ層（Prisma リポジトリ）
│   │   │   └── presentation/    # プレゼンテーション層（Fastify ルート）
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── pages/           # ページコンポーネント
│       │   ├── components/      # 共通コンポーネント
│       │   └── api/             # API クライアント（TanStack Query）
│       └── package.json
├── docker-compose.yml
├── docs/                        # ドキュメント
└── package.json
```

---

## 11. 命名規則

| 要素 | 規則 | 例 |
| :--- | :--- | :--- |
| テーブル名 | snake_case（複数形） | `products`, `order_items` |
| カラム名 | snake_case | `created_at`, `product_id` |
| クラス名 | PascalCase | `Product`, `OrderService` |
| 変数・関数名 | camelCase | `productId`, `createOrder` |
| ファイル名（TS） | PascalCase | `Product.ts`, `OrderService.ts` |
| ファイル名（React） | PascalCase | `ProductCard.tsx` |

---

## 12. Git 規約

### コミットメッセージ（Conventional Commits）

```
feat(backend): 商品マスタ CRUD を追加
fix(frontend): 商品一覧の表示崩れを修正
docs: イテレーション 1 計画を追加
test(backend): Product エンティティのテストを追加
```

| タイプ | 説明 |
| :--- | :--- |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | リファクタリング |
| `test` | テストの追加・修正 |
| `chore` | ビルド・設定変更 |

---

## 13. セットアップ確認チェックリスト

```bash
# 1. Node.js 依存パッケージ
npm install

# 2. DB 起動
docker compose up -d db

# 3. バックエンド起動確認
cd src/backend && npm run dev
# → http://localhost:3000/health が 200 を返すこと

# 4. フロントエンド起動確認
cd src/frontend && npm run dev
# → http://localhost:5173 が表示されること

# 5. テスト実行
cd src/backend && npm test
cd src/frontend && npm test
```

- [ ] `docker compose ps` で db コンテナが Up 状態
- [ ] バックエンド API が http://localhost:3000/health で応答
- [ ] フロントエンドが http://localhost:5173 で表示
- [ ] バックエンドテストがパス
- [ ] フロントエンドテストがパス

---

## トラブルシューティング

### ポートが使用中の場合

```bash
# 使用中のプロセスを確認
lsof -i :3000
lsof -i :5173
lsof -i :5432

# プロセスを終了
kill -9 <PID>
```

### Prisma マイグレーションエラー

```bash
cd src/backend

# DB をリセットして再マイグレーション
npx prisma migrate reset

# スキーマを再生成
npx prisma generate
```

### Docker コンテナが起動しない場合

```bash
# ログを確認
docker compose logs db

# コンテナを再作成
docker compose down -v
docker compose up -d db
```

---

## 関連ドキュメント

- [リリース計画](../development/release_plan.md)
- [イテレーション 1 計画](../development/iteration_plan-1.md)
- [バックエンドアーキテクチャ](../design/architecture_backend.md)
- [フロントエンドアーキテクチャ](../design/architecture_frontend.md)
- [技術スタック選定](../design/tech_stack.md)
