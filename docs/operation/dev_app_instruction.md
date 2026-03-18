# アプリケーション開発環境セットアップ手順書

## 概要

本ドキュメントは、フレール・メモワール WEB ショップのアプリケーション開発環境をセットアップする手順を説明します。

テスト駆動開発（TDD）のゴールは **動作するきれいなコード** です。それを実現するためには [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) が必要です。

> 今日のソフトウェア開発の世界において絶対になければならない 3 つの技術的な柱があります。
> 三本柱と言ったり、三種の神器と言ったりしていますが、それらは
>
> - バージョン管理
> - テスティング
> - 自動化
>
> の 3 つです。
>
> — https://t-wada.hatenablog.jp/entry/clean-code-that-works

---

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

| ツール | バージョン | 確認コマンド |
|--------|-----------|-------------|
| Node.js | v22.x LTS | `node -v` |
| npm | v10.x | `npm -v` |
| Docker | 最新 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新 | `git -v` |

### Node.js のインストール

Node.js v22.x LTS をインストールします。バージョン管理ツール（nvm / fnm）を使用すると複数バージョンの管理が容易です。

```bash
# fnm でインストール（推奨）
fnm install 22
fnm use 22

# バージョン確認
node -v
npm -v
```

公式サイトから直接ダウンロードする場合：

- https://nodejs.org/

### Docker のインストール

Docker Desktop をインストールします。

- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **macOS**: https://docs.docker.com/desktop/install/mac-install/

```bash
# バージョン確認
docker -v
docker compose version
```

---

## 2. プロジェクトの取得

### リポジトリのクローン

```bash
git clone https://github.com/k2works/case-study-sdd-development.git
cd case-study-sdd-development
```

### Node.js 依存パッケージのインストール

```bash
npm install
```

> **Note**: husky（Git Hooks）が `prepare` スクリプトで自動的にセットアップされます。

---

## 3. サブシステム一覧

フレール・メモワール WEB ショップは以下のサブシステムで構成されています。

| システム | ディレクトリ | 説明 | ポート (DB / App) |
|---------|-------------|------|-------------------|
| バックエンド | `apps/backend` | REST API サーバー（Express + Prisma） | 5432 / 8080 |
| フロントエンド | `apps/frontend` | SPA クライアント（React + Vite） | - / 3000 |
| データベース | Docker Compose | PostgreSQL 16 | 5432 / - |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.x |
| ランタイム | Node.js | 22.x LTS |
| フレームワーク | Express | 4.x |
| ORM | Prisma | 6.x |
| バリデーション | Zod | 3.x |
| データベース | PostgreSQL | 16 |
| マイグレーション | Prisma Migrate | - |
| テスト | Vitest | 3.x |
| API テスト | Supertest | 7.x |
| 品質管理 | ESLint 9.x + Prettier 3.x | - |

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.x |
| フレームワーク | React | 19.x |
| ルーティング | React Router | 7.x |
| CSS | CSS Modules | - |
| HTTP クライアント | fetch API | - |
| テスト | Vitest + Testing Library | 3.x / 16.x |
| ビルドツール | Vite | 6.x |

### インフラストラクチャ

| カテゴリ | 技術 |
|---------|------|
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions |
| パッケージ管理 | npm 10.x |

---

## 5. プロファイル構成

開発効率を高めるため、複数のプロファイルを使い分けます。

| プロファイル | データベース | Docker | 用途 |
|-------------|------------|--------|------|
| default | PostgreSQL（Docker） | 必要（DB のみ） | 日常開発・TDD |
| docker | PostgreSQL（Docker） | 必要（全サービス） | 統合テスト・デモ |

### default プロファイル（推奨：日常開発）

PostgreSQL のみ Docker で起動し、backend / frontend はローカルで実行します。

#### 環境変数の設定

バックエンドがデータベースに接続するために、`apps/backend/.env` ファイルを作成します。

```bash
# apps/backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev"
```

> **Note**: `.env` ファイルは `.gitignore` に含まれているため、リポジトリにはコミットされません。各開発者が手動で作成する必要があります。

#### 起動手順

```bash
# データベースを起動
docker compose -f apps/docker-compose.yml up -d db

# バックエンド起動
cd apps/backend
npm run dev

# フロントエンド起動（別ターミナル）
cd apps/frontend
npm run dev
```

### docker プロファイル（統合テスト）

全サービスを Docker Compose で起動します。

```bash
cd apps
docker compose up -d
```

---

## 6. 開発サーバーの起動

### タスクランナー経由（推奨）

```bash
# 開発サーバー起動（default プロファイル）
npx gulp dev:app

# TDD モード（テスト自動再実行）
npx gulp tdd:backend
npx gulp tdd:frontend

# タスク一覧を表示
npx gulp dev:app:help
```

### 直接実行

```bash
# バックエンド
cd apps/backend
npm run dev          # 開発サーバー起動
npm run test         # テスト実行
npm run test:watch   # TDD モード

# フロントエンド
cd apps/frontend
npm run dev          # 開発サーバー起動
npm run test         # テスト実行
npm run test:watch   # TDD モード
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:3000 | SPA クライアント |
| バックエンド API | http://localhost:8080/api | REST API |
| ヘルスチェック | http://localhost:8080/api/health | ヘルスチェック |

---

## 7. Docker Compose のセットアップ

### アプリケーション用 Docker Compose

`apps/docker-compose.yml` でアプリケーション関連のコンテナを管理します。

```bash
cd apps

# データベースのみ起動（日常開発）
docker compose up -d db

# 全サービス起動（統合テスト）
docker compose up -d

# コンテナの状態確認
docker compose ps
```

### Docker Compose の便利なコマンド

```bash
cd apps

# コンテナの停止と削除
docker compose down

# ログを確認
docker compose logs -f db

# データベースに接続
docker compose exec db psql -U postgres -d fleur_memoire_dev
```

---

## 8. テストの実行

### 全テスト実行

```bash
# バックエンドテスト
cd apps/backend
npm test

# フロントエンドテスト
cd apps/frontend
npm test
```

### テストの種類

| テスト種別 | ツール | 説明 |
|-----------|--------|------|
| ユニットテスト | Vitest | ドメインロジック・コンポーネントのテスト |
| 統合テスト | Vitest + Supertest | API エンドポイント・DB 連携テスト |
| コンポーネントテスト | Vitest + Testing Library | React コンポーネントの振る舞いテスト |

### テストカバレッジ

```bash
# バックエンド
cd apps/backend
npm run test:coverage

# フロントエンド
cd apps/frontend
npm run test:coverage
```

カバレッジ目標：

| レイヤー | 目標 |
|---------|------|
| ドメイン層 | 90% 以上 |
| アプリケーション層 | 80% 以上 |
| プレゼンテーション層 | 70% 以上 |
| フロントエンド | 70% 以上 |

---

## 9. コード品質管理

### 静的コード解析ツール

| ツール | 目的 | コマンド |
|--------|------|---------|
| ESLint 9.x | コーディング規約の検証 | `npm run lint` |
| Prettier 3.x | コードフォーマット | `npm run format` |
| TypeScript | 型チェック | `npm run type-check` |

### 品質チェックの実行

```bash
# バックエンド
cd apps/backend
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript 型チェック

# フロントエンド
cd apps/frontend
npm run lint
npm run format
npm run type-check
```

---

## 10. ディレクトリ構造

```
case-study-sdd-development/
├── .husky/                          # Git Hooks (Husky)
│   └── pre-commit                   # コミット前品質チェック
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── domain/              # ドメイン層
│   │   │   │   ├── shared/          # 集約横断の値オブジェクト
│   │   │   │   ├── item/            # 単品集約
│   │   │   │   ├── product/         # 商品集約
│   │   │   │   ├── order/           # 受注集約
│   │   │   │   ├── customer/        # 得意先集約
│   │   │   │   ├── purchase-order/  # 発注集約
│   │   │   │   └── stock/           # 在庫集約
│   │   │   ├── application/         # アプリケーション層
│   │   │   │   ├── item/
│   │   │   │   ├── product/
│   │   │   │   └── ...
│   │   │   ├── infrastructure/      # インフラ層
│   │   │   │   └── prisma/          # Prisma リポジトリ実装
│   │   │   └── presentation/        # プレゼンテーション層
│   │   │       ├── routes/          # Express ルーター
│   │   │       └── middleware/      # ミドルウェア
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Prisma スキーマ
│   │   │   ├── seed.ts              # シードデータ
│   │   │   └── migrations/          # マイグレーション
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/          # UI コンポーネント
│   │   │   │   ├── ui/              # 共通 UI（Button, Input, Modal, Table）
│   │   │   │   └── layout/          # レイアウト（Header, Sidebar, Footer）
│   │   │   ├── pages/               # ページコンポーネント
│   │   │   │   ├── customer/        # 得意先向け画面
│   │   │   │   └── staff/           # スタッフ向け管理画面
│   │   │   ├── hooks/               # カスタムフック
│   │   │   ├── utils/               # ユーティリティ
│   │   │   ├── types/               # TypeScript 型定義
│   │   │   └── config/              # 設定
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── docker-compose.yml           # アプリケーション用 Docker Compose
├── docs/                            # ドキュメント
├── ops/                             # 運用スクリプト
│   └── scripts/
│       ├── develop.js               # 開発タスク
│       └── ...
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI パイプライン
├── package.json                     # ルート（husky, lint-staged, gulp）
└── gulpfile.js                      # タスクランナー
```

---

## 11. 命名規則

| 要素 | 規則 | 例 |
|------|------|-----|
| テーブル名 | snake_case（複数形） | `product_compositions` |
| カラム名 | snake_case | `quality_retention_days` |
| TypeScript クラス名 | PascalCase | `ProductComposition` |
| TypeScript 変数・関数名 | camelCase | `qualityRetentionDays` |
| TypeScript ファイル名 | kebab-case | `product-composition.ts` |
| React コンポーネント | PascalCase | `ProductList.tsx` |
| テストファイル | `*.test.ts` / `*.test.tsx` | `item.test.ts` |
| API エンドポイント | kebab-case | `/api/purchase-orders` |

---

## 12. Git 規約

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/) に従います。

| タイプ | 説明 |
|--------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更 |
| `refactor` | バグ修正でも機能追加でもないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセス・補助ツールの変更 |

### スコープ

サブシステムを示すスコープを使用します。

```
feat(backend): 単品管理 API を追加
fix(frontend): 商品一覧の表示不具合を修正
docs: セットアップ手順を更新
chore: ESLint 設定を調整
```

### Git Hooks（Husky + lint-staged）

コミット時に自動で品質チェックが実行されます。

#### セットアップ

`npm install` 実行時に Husky は自動的にセットアップされます（`prepare` スクリプト）。

```bash
# 手動でセットアップする場合
npx husky init
```

#### pre-commit フック

ソースファイルに変更がある場合、以下のチェックが自動実行されます。

| ツール | 目的 |
|--------|------|
| ESLint | コーディング規約の検証 |
| Prettier | コードフォーマットの検証 |
| TypeScript | 型チェック |

いずれかのチェックが失敗すると、コミットがブロックされます。

#### フックをスキップする場合

緊急時にフックをスキップしてコミットする場合（非推奨）：

```bash
git commit --no-verify -m "メッセージ"
```

> **Warning**: フックのスキップは緊急時のみ使用してください。品質チェックを通過しないコードはチームに影響を与える可能性があります。

---

## 13. セットアップの確認

すべてのセットアップが完了したら、以下のコマンドで動作確認を行います。

```bash
# 1. ルート依存パッケージのインストール
npm install

# 2. アプリケーション依存パッケージのインストール
cd apps/backend && npm install
cd ../frontend && npm install
cd ../..

# 3. 環境変数ファイルの作成
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev"' > apps/backend/.env

# 4. データベース起動
cd apps && docker compose up -d db && cd ..

# 5. マイグレーション実行
cd apps/backend && npx prisma migrate dev && cd ../..

# 6. シードデータ投入
cd apps/backend && npx prisma db seed && cd ../..

# 7. バックエンドテスト実行
cd apps/backend && npm test && cd ../..

# 8. フロントエンドテスト実行
cd apps/frontend && npm test && cd ../..

# 9. バックエンド起動
cd apps/backend && npm run dev

# 10. フロントエンド起動（別ターミナル）
cd apps/frontend && npm run dev
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:3000 | SPA クライアント |
| バックエンド API | http://localhost:8080/api | REST API |
| ヘルスチェック | http://localhost:8080/api/health | ヘルスチェック |

---

## 14. CI/CD

CI/CD による継続的インテグレーションを設定しています。

### ワークフロー一覧

| ワークフロー | ファイル | トリガー | 説明 |
|-------------|----------|----------|------|
| CI | `.github/workflows/ci.yml` | `apps/` 変更時 | Lint + 型チェック + テスト |
| Docs Deploy | `.github/workflows/docs.yml` | main ブランチ push | ドキュメントをデプロイ |

### CI パイプライン

バックエンド・フロントエンドの変更時に自動実行されます。

```
実行内容:

  1. 環境セットアップ（Node.js 22.x + PostgreSQL 16）
  2. 依存パッケージのインストール
  3. ESLint + Prettier チェック
  4. TypeScript 型チェック
  5. テスト実行（ユニット + 統合）
  6. カバレッジレポート生成
```

---

## トラブルシューティング

### PostgreSQL に接続できない

**問題**: バックエンド起動時に `ECONNREFUSED` エラー

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決策**: Docker Compose で PostgreSQL が起動していることを確認

```bash
cd apps
docker compose ps
docker compose up -d db
```

### SASL 認証エラー（DATABASE_URL 未設定）

**問題**: バックエンド起動時に `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` エラー

```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

**解決策**: `apps/backend/.env` ファイルが存在することを確認

```bash
# .env ファイルを作成
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleur_memoire_dev"' > apps/backend/.env
```

### Prisma マイグレーションエラー

**問題**: `prisma migrate dev` でエラーが発生

**解決策**: データベースをリセットして再実行

```bash
cd apps/backend
npx prisma migrate reset
```

### ポートが使用中

**問題**: `EADDRINUSE` エラーでサーバーが起動しない

**解決策**: 使用中のプロセスを停止

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :8080
kill -9 <PID>
```

### pre-commit フックが失敗する場合

```bash
cd apps/backend

# 品質チェックを手動実行してエラーを確認
npm run lint
npm run type-check

# エラーを修正してから再度コミット
```

---

## 関連ドキュメント

- [技術スタック選定](../design/tech_stack.md)
- [バックエンドアーキテクチャ](../design/architecture_backend.md)
- [フロントエンドアーキテクチャ](../design/architecture_frontend.md)
- [インフラストラクチャ](../design/architecture_infrastructure.md)
- [テスト戦略](../design/test_strategy.md)
- [データモデル設計](../design/data-model.md)
- [ドメインモデル設計](../design/domain-model.md)
