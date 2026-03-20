# 開発スクリプトリファレンス

## 概要

本ドキュメントは、フレール・メモワール WEB ショップシステムのアプリケーション開発タスク（Gulp タスク）のリファレンスです。データベース起動、バックエンド/フロントエンド開発サーバー、TDD モード、ビルドなどの開発作業を Gulp タスクランナーで統一的に管理します。

前提条件やセットアップ手順については [アプリケーション開発環境セットアップ手順書](./app-development-setup.md) を参照してください。

---

## コマンドリファレンス

### データベース

| コマンド | 説明 |
|---------|------|
| `npx gulp dev:webshop:db` | PostgreSQL データベースコンテナを起動 |
| `npx gulp dev:webshop:db:stop` | データベースコンテナを停止 |

### バックエンド

| コマンド | 説明 |
|---------|------|
| `npx gulp dev:webshop:backend` | バックエンド開発サーバーを起動（default プロファイル、H2 インメモリ DB） |
| `npx gulp dev:webshop:backend:prod` | バックエンド開発サーバーを起動（prod プロファイル、PostgreSQL） |
| `npx gulp dev:webshop:backend:test` | バックエンドテストを実行 |

### フロントエンド

| コマンド | 説明 |
|---------|------|
| `npx gulp dev:webshop:frontend` | フロントエンド開発サーバーを起動（Vite） |
| `npx gulp dev:webshop:frontend:test` | フロントエンドテストを実行（Vitest） |

### TDD

| コマンド | 説明 |
|---------|------|
| `npx gulp tdd:webshop:backend` | バックエンド TDD モード（`./gradlew test --continuous`） |
| `npx gulp tdd:webshop:frontend` | フロントエンド TDD モード（`vitest` watch モード） |

### ビルド

| コマンド | 説明 |
|---------|------|
| `npx gulp dev:webshop:build` | バックエンドとフロントエンドを順にビルド |

### ヘルプ

| コマンド | 説明 |
|---------|------|
| `npx gulp dev:help` | 開発タスク一覧を表示 |

---

## 典型的な開発フロー

### 日常開発（H2 インメモリ DB）

Docker 不要で即座に開発を開始できます。

```bash
# ターミナル 1: バックエンド起動
npx gulp dev:webshop:backend

# ターミナル 2: フロントエンド起動
npx gulp dev:webshop:frontend
```

### 本番互換テスト（PostgreSQL）

PostgreSQL を使用して本番環境に近い状態でテストします。

```bash
# ターミナル 1: データベース起動
npx gulp dev:webshop:db

# ターミナル 2: バックエンド起動（prod プロファイル）
npx gulp dev:webshop:backend:prod

# ターミナル 3: フロントエンド起動
npx gulp dev:webshop:frontend
```

### TDD ワークフロー

ファイル変更時にテストが自動的に再実行されます。

```bash
# バックエンド TDD
npx gulp tdd:webshop:backend

# フロントエンド TDD
npx gulp tdd:webshop:frontend
```

### ビルド

```bash
# バックエンドとフロントエンドをビルド
npx gulp dev:webshop:build
```

---

## npm スクリプトショートカット

以下の npm スクリプトで Gulp タスクを簡略化して実行できます。

| npm スクリプト | Gulp タスク |
|---------------|------------|
| `npm run webshop:backend` | バックエンド起動（直接実行） |
| `npm run webshop:frontend` | フロントエンド起動（直接実行） |
| `npm run webshop:backend:test` | バックエンドテスト（直接実行） |
| `npm run webshop:frontend:test` | フロントエンドテスト（直接実行） |
| `npm run webshop:db` | データベース起動（直接実行） |
| `npm run webshop:db:stop` | `gulp dev:webshop:db:stop` |
| `npm run webshop:backend:prod` | `gulp dev:webshop:backend:prod` |
| `npm run webshop:build` | `gulp dev:webshop:build` |
| `npm run tdd:webshop:backend` | `gulp tdd:webshop:backend` |
| `npm run tdd:webshop:frontend` | `gulp tdd:webshop:frontend` |
| `npm run dev:help` | `gulp dev:help` |

---

## アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| バックエンド | http://localhost:8080 | メインアプリケーション |
| API ドキュメント | http://localhost:8080/swagger-ui.html | OpenAPI ドキュメント |
| DB 管理ツール | http://localhost:8080/h2-console | H2 Console（default プロファイル） |
| ヘルスチェック | http://localhost:8080/api/health | ヘルスチェック |
| フロントエンド | http://localhost:5173 | React 開発サーバー |
| PostgreSQL | localhost:5432 | データベース（prod プロファイル） |

---

## 関連ドキュメント

- [アプリケーション開発環境セットアップ手順書](./app-development-setup.md)
- [技術スタック選定](../design/tech_stack.md)
- [バックエンドアーキテクチャ設計](../design/architecture_backend.md)
- [フロントエンドアーキテクチャ設計](../design/architecture_frontend.md)
