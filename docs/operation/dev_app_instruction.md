---
title: アプリケーション開発環境セットアップ手順書
description: 花束問題のケーススタディにおけるローカル開発環境のセットアップ手順
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - operation
  - setup
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# アプリケーション開発環境セットアップ手順書

## 概要

本ドキュメントは、花束問題のケーススタディのアプリケーション開発環境をセットアップする手順を説明します。

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

現時点のリポジトリは、分析、設計、計画、運用スクリプト、MkDocs ベースのドキュメント基盤が先行して整備されています。本手順書では、`apps/frontend/` に `Next.js`、`apps/backend/` に `NestJS` の最小アプリケーション環境をセットアップし、ローカルで起動・テストできる状態を対象にします。

---

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

| ツール | 推奨バージョン | 確認コマンド | 現状メモ |
|--------|----------------|--------------|----------|
| Node.js | 24 LTS | `node -v` | Constitution 上の標準 |
| npm | 11.x | `npm -v` | Node.js 24 系に追従 |
| Docker | 最新 | `docker -v` | Dev Container / MkDocs 用 |
| Docker Compose | v2 以上 | `docker compose version` | `docker-compose.yml` を使用 |
| Git | 最新 | `git --version` | GitHub 連携に必須 |
| Nix | 任意 | `nix --version` | `flake.nix` を利用する場合 |

### Node.js のインストール

Node.js は `Node.js 24 LTS` を推奨します。

- https://nodejs.org/

```bash
node -v
npm -v
```

### Docker のインストール

Docker Desktop をインストールします。

- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **macOS**: https://docs.docker.com/desktop/install/mac-install/

```bash
docker -v
docker compose version
```

### Nix のインストール

Nix Flakes を使う場合は、Nix を導入します。

- https://nixos.org/download/

```bash
nix --version
```

### 現在確認済みのローカル環境

本リポジトリ上では、以下を確認済みです。

| 項目 | 結果 |
|------|------|
| Node.js | `v24.11.0` |
| npm | `11.6.1` |
| Docker Compose | `v5.0.2` |
| Git | `2.50.1` |
| `docker compose config --quiet` | 正常 |

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

> **Note**: 現在の `package.json` には `prepare` スクリプトがないため、Husky は自動セットアップされません。コミットフックを有効化する場合は、後続作業で明示的に設定してください。

---

## 3. サブシステム一覧

花束問題のケーススタディは以下のサブシステムで構成されています。

| システム | ディレクトリ | 説明 | ポート (DB / App) |
|---------|-------------|------|-------------------|
| ドキュメント基盤 | `docs/`, `mkdocs.yml` | MkDocs ベースの設計 / 計画 / 運用文書 | - / `8000` |
| フロントエンド実装領域 | `apps/frontend/` | Next.js 16 / React 19.2 アプリ | - / `3001` |
| バックエンド実装領域 | `apps/backend/` | NestJS 11 API | `5432` / `3000` |
| 運用スクリプト | `ops/scripts/`, `gulpfile.js` | MkDocs、vault、SSH、SonarQube 補助 | - / - |
| 開発コンテナ | `Dockerfile`, `docker-compose.yml` | Dev Container と MkDocs 実行環境 | - / `8000` |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5 系想定 |
| フレームワーク | NestJS | 11 |
| ビルドツール | npm | 11 系 |
| ORM | Prisma | 7 |
| データベース | PostgreSQL | 17 |
| マイグレーション | Prisma Migrate | - |
| テスト | Vitest / Supertest | 設計準拠 |
| 品質管理 | ESLint / Playwright / SonarQube Local | 段階導入 |

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5 系想定 |
| フレームワーク | Next.js / React | 16 / 19.2 |
| CSS | グローバル CSS | Next.js 標準 |

### インフラストラクチャ

| カテゴリ | 技術 |
|---------|------|
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions |
| ドキュメント | MkDocs |
| タスクランナー | Gulp |

---

## 5. プロファイル構成

開発効率を高めるため、現時点では次の 2 つを使い分けます。

| プロファイル | データベース | Docker | 用途 |
|-------------|------------|--------|------|
| default | ローカル PostgreSQL 未使用でも可 | 不要 | 日常開発、フロント / バックの即時起動 |
| product | PostgreSQL 17 | 必要 | DB を含む本番互換テスト、コンテナベース検証 |

### default プロファイル（推奨: 日常開発）

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

ブラウザで `http://localhost:3001` を開き、別ターミナルで `http://localhost:3000/health` を確認します。

### product プロファイル（本番互換）

```bash
# PostgreSQL を起動
docker compose up -d postgres

# 開発コンテナに入る
docker compose run --rm dev bash
```

このコンテナは `Dockerfile` を使って構築され、Node.js、Nix、Claude Code、Codex CLI、Gemini CLI、Copilot CLI、Playwright を含みます。DB を使う検証時は `postgres` サービスを併用します。

---

## 6. 開発サーバーの起動

### タスクランナー経由（推奨）

```bash
# バックエンド起動
npm run dev:backend

# フロントエンド起動
npm run dev:frontend

# ドキュメント起動
npm run docs:serve
```

### ビルドツール直接実行

```bash
cd apps/backend
npm run dev

cd apps/frontend
npm run dev
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:3001 | Next.js アプリ |
| バックエンド | http://localhost:3000/health | NestJS ヘルスチェック |
| ドキュメント | http://localhost:8000 | MkDocs プレビュー |
| PlantUML | http://localhost:8080/plantuml | 図のレンダリング用 |
| GitHub CLI | `gh auth status` | GitHub 連携確認 |

---

## 7. Docker Compose のセットアップ

### コンテナの起動

```bash
docker compose up -d postgres mkdocs plantuml

# コンテナ状態確認
docker compose ps
```

### Docker Compose の便利なコマンド

```bash
docker compose up -d postgres mkdocs plantuml
docker compose down
docker compose logs -f postgres
docker compose logs -f mkdocs
docker compose run --rm dev bash
docker compose exec postgres psql -U postgres -d fleur_memoire
```

---

## 8. テストの実行

### 全テスト実行

最小アプリケーション環境の健全性確認として、フロントエンド、バックエンド、ドキュメントのテストを実行します。

```bash
npm run test:backend
npm run test:frontend
npm run typecheck:backend
npm run typecheck:frontend
npm run docs:build
docker compose config --quiet
```

### テストの種類

| テスト種別 | ツール | 説明 |
|-----------|--------|------|
| フロントエンド単体テスト | Vitest + Testing Library | 画面コンポーネントの表示確認 |
| バックエンド API テスト | Vitest + Supertest | `/health` の疎通確認 |
| ドキュメントビルド確認 | MkDocs | ナビゲーションと Markdown の整合確認 |
| 構成テスト | Docker Compose | `docker-compose.yml` の妥当性確認 |
| 将来の統合テスト | PostgreSQL | API と DB の接続確認 |
| 将来の E2E テスト | Playwright | 顧客導線、管理画面導線 |

### テストカバレッジ

現時点では最小の疎通テストのみを配置しています。実装開始後は [test_strategy.md](../design/test_strategy.md) に従い、バックエンド 85%、フロント Feature 80% を目標にします。

---

## 9. コード品質管理

### 静的コード解析ツール

| ツール | 目的 | コマンド |
|--------|------|---------|
| ESLint | TypeScript / TSX の静的解析 | `npm run lint --workspace @fleur-memoire/backend` など |
| TypeScript | 型整合性確認 | `npm run typecheck:backend` / `npm run typecheck:frontend` |
| MkDocs Build | ドキュメント整合性確認 | `npm run docs:build` |
| Docker Compose | 構成妥当性確認 | `docker compose config --quiet` |
| SonarQube Local | 将来の静的解析 | `ops/docker/sonarqube-local/` を利用 |

### 品質チェックの実行

```bash
# 現在実行できる品質チェック
npm run lint --workspace @fleur-memoire/backend
npm run lint --workspace @fleur-memoire/frontend
npm run typecheck:backend
npm run typecheck:frontend
npm run test:backend
npm run test:frontend
npm run docs:build
docker compose config --quiet
```

### コード複雑度の基準

| 指標 | 閾値 | 説明 |
|------|------|------|
| 循環的複雑度 | 10 | 分岐・ループの複雑さ |
| ファイルサイズ | 500 行 | 1 ファイルの最大行数 |
| 関数サイズ | 150 行 | 1 関数の最大行数 |
| パラメータ数 | 7 | 関数の最大パラメータ数 |

### レポートの確認

| ツール | レポートパス |
|--------|-------------|
| MkDocs | `site/` |
| SonarQube Local | `ops/docker/sonarqube-local/` 配下 |
| テスト結果 | `test-results/` |

---

## 10. ディレクトリ構造

```text
case-study-sdd-development/
├── .agents/                         # Codex 用 skills
├── .claude/                         # Claude 用 skills / agents
├── .husky/                          # Git Hooks
├── .specify/                        # constitution / memory
├── apps/
│   ├── backend/                     # NestJS API
│   │   ├── src/
│   │   └── test/
│   └── frontend/                    # Next.js アプリ
│       └── app/
├── docs/
│   ├── analysis/
│   ├── design/
│   ├── development/
│   ├── operation/
│   ├── reference/
│   ├── requirements/
│   └── template/
├── ops/
│   ├── docker/
│   ├── nix/
│   └── scripts/
├── scripts/                         # Ralph Loop 等
├── docker-compose.yml
├── Dockerfile
├── flake.nix
├── gulpfile.js
└── package.json
```

---

## 11. 命名規則

本プロジェクトでは、設計ドキュメントと実装予定スタックに合わせて次の規則を採用します。

| 要素 | 規則 | 例 |
|------|------|-----|
| Markdown ファイル名 | snake_case | `release_plan.md` |
| TypeScript ファイル名 | kebab-case または feature 単位 | `order-form.tsx` |
| クラス名 | PascalCase | `CreateOrderUseCase` |
| 関数 / 変数名 | camelCase | `calculateInventoryProjection` |
| テーブル名 | snake_case 複数形 | `order_delivery_snapshots` |
| カラム名 | snake_case | `delivery_postal_code` |

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
| `perf` | パフォーマンス改善 |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセス・補助ツールの変更 |

### スコープ

```text
feat(frontend): 注文入力画面を追加
fix(backend): 受注登録 API のバリデーションを修正
docs(operation): 開発環境手順書を更新
```

### Git Hooks（Husky）

現時点では `.husky/` ディレクトリはありますが、`package.json` に `prepare` スクリプトがないため自動セットアップは未完成です。実装フェーズ開始時に、必要なフックを追加してください。

#### フックをスキップする場合

緊急時のみ、以下を使用します。

```bash
git commit --no-verify -m "メッセージ"
```

---

## 13. 推奨セットアップ手順

### 最短手順

```bash
npm install
docker compose up -d postgres
npm run test:backend
npm run test:frontend
docker compose config --quiet
npm run docs:build
```

### その後の確認

1. `npm run dev:frontend` で `http://localhost:3001` が開けること。
2. `npm run dev:backend` で `http://localhost:3000/health` が `200` を返すこと。
3. `docker compose up -d postgres` 後に `docker compose ps` で `postgres` が `healthy` になること。
4. `gh auth status` が成功し、GitHub 連携が有効であること。

---

## 14. 既知の注意点

### Node.js バージョン

- プロジェクト方針上の標準は `Node.js 24 LTS` です。
- `Dockerfile` と `docker-compose.yml` の `dev` サービスも `NODE_MAJOR=24` に統一済みです。
- ホスト環境も `Node.js 24 LTS` を維持してください。

### コンテナの Node.js イメージ

- `Dockerfile` と `docker-compose.yml` は `Node.js 24` に揃えています。
- 既存の `dev` イメージが古い場合は `docker compose build --no-cache dev` を実行して更新してください。

---

## 15. 次の段階

アプリケーション開発環境の次は、Docker ベースのチーム共有環境として `開発環境セットアップ手順書` を作成し、必要なら以下へ進みます。

1. `docs/operation/dev_instruction.md` の作成
2. `operating-script` による開発用タスク整備
3. `operating-cicd` による CI 基盤整備
