# アプリケーション開発環境セットアップ手順書

## 概要

本ドキュメントは、フレール・メモワール WEB ショップシステムのアプリケーション開発環境をセットアップする手順を説明します。

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
| Node.js | v24.x LTS | `node -v` |
| npm | v11.x 相当 | `npm -v` |
| Docker | 最新安定版 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新安定版 | `git -v` |
| Nix（任意） | 2.x 以上 | `nix --version` |

### Node.js のインストール

Node.js 24 LTS をインストールします。複数バージョンを管理したい場合は `nvm` などのバージョン管理ツールを利用してください。

```bash
# 公式インストーラーまたは nvm で Node.js 24 を導入
node -v
npm -v
```

公式サイトから直接ダウンロードする場合：

- https://nodejs.org/

### Docker のインストール

Docker Desktop または Docker Engine をインストールします。

- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Linux**: https://docs.docker.com/engine/install/

```bash
# バージョン確認
docker -v
docker compose version
```

### Nix のインストール（任意）

ホスト側で `devShell` を利用する場合は Nix をインストールします。

```bash
nix --version
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

> **Note**: 現時点では Husky の `prepare` スクリプトは未設定です。`npm install` は Gulp ベースの docs / operation 補助タスクの依存関係を導入します。

---

## 3. サブシステム一覧

フレール・メモワール WEB ショップシステムは以下のサブシステムで構成されます。

| システム | ディレクトリ | 説明 | ポート (DB / App) |
|---------|-------------|------|-------------------|
| docs-platform | `docs/`, `mkdocs.yml`, `ops/docker/mkdoc/` | MkDocs と PlantUML によるドキュメント開発環境 | `- / 8000` |
| dev-shell | `Dockerfile`, `docker-compose.yml` | Docker ベースのアプリケーション開発 shell | `- / -` |
| web（今後実装） | `apps/web` | Next.js による顧客向け / スタッフ向け UI | `- / 未定` |
| api（今後実装） | `apps/api` | Fastify による REST API | `5432 / 未定` |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.8.x |
| フレームワーク | Fastify | 5.x |
| ビルドツール | npm | 11.x |
| ORM / Query Builder | Kysely | 0.28.x |
| データベース | PostgreSQL | 16.x |
| マイグレーション | node-pg-migrate | 8.x |
| テスト | Vitest / Supertest / Testcontainers | 3.x / 7.x / 11.x |
| 品質管理 | ESLint + Prettier | 9.x / 3.x |

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.8.x |
| フレームワーク | Next.js + React | 15.x / 19.x |
| CSS | Tailwind CSS | 4.x |

### インフラストラクチャ

| カテゴリ | 技術 |
|---------|------|
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions |

---

## 5. プロファイル構成

開発効率を高めるため、複数のプロファイルを使い分けます。

| プロファイル | データベース | Docker | 用途 |
|-------------|------------|--------|------|
| default | なし（現時点では未導入） | 不要 | docs 編集、設計更新、ホスト側での軽量な Node.js 作業 |
| product | なし（将来 PostgreSQL 追加予定） | 必要 | Docker ベースの開発 shell、コンテナ互換の動作確認 |

### default プロファイル（推奨：日常開発）

Docker なしで docs や Node.js ツールを扱う場合は、リポジトリルートで作業します。

```bash
cd /path/to/case-study-sdd-development
npm install
npm run docs:build
```

Nix を使う場合:

```bash
nix develop .#node
node -v
npm -v
```

### product プロファイル（本番互換）

```bash
# 開発 shell イメージをビルド
docker compose build dev

# product 相当の Docker shell に入る
docker compose run --rm dev bash
```

---

## 6. 開発サーバーの起動

### タスクランナー経由（推奨）

```bash
# ドキュメントプレビュー起動
npm run docs:serve

# 既定の補助起動コマンド
npm run start

# タスク一覧を確認
npx gulp --tasks
```

> **補足**: アプリケーション本体の TDD コマンドは `apps/web` / `apps/api` の実装開始後に追加します。

### ビルドツール直接実行

```bash
cd /path/to/case-study-sdd-development

# MkDocs 開発サーバーを直接起動
npx gulp mkdocs:serve
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| ドキュメントプレビュー | http://localhost:8000 | 設計 / 分析ドキュメントのプレビュー |
| PlantUML サーバー | http://localhost:8080/plantuml | Compose 内部連携用。通常は直接参照不要 |

---

## 7. Docker Compose のセットアップ

### 開発支援コンテナの起動

```bash
cd /path/to/case-study-sdd-development

# docs preview と PlantUML を起動
docker compose up -d mkdocs plantuml

# コンテナの状態確認
docker compose ps
```

### Docker Compose の便利なコマンド

```bash
# dev shell イメージのビルド
docker compose build dev

# dev shell に入る
docker compose run --rm dev bash

# docs preview のログを確認
docker compose logs -f mkdocs

# コンテナの停止と削除
docker compose down
```

---

## 8. テストの実行

### 全テスト実行

現時点ではアプリケーション本体の自動テストは未整備です。アプリケーション開発環境の確認として、以下の検証を実行します。

```bash
cd /path/to/case-study-sdd-development

# ドキュメントビルドによる環境確認
npm run docs:build
```

### テストの種類

| テスト種別 | ツール | 説明 |
|-----------|--------|------|
| 環境検証 | Docker Compose | `docker compose config` で Compose 定義の妥当性を確認 |
| ドキュメントビルド検証 | MkDocs | `npm run docs:build` で docs build の成立を確認 |
| コンテナ実行検証 | Docker | `docker compose run --rm dev ...` で開発 shell の成立を確認 |

### テストカバレッジ

アプリケーションコードが未実装のため、現時点ではカバレッジレポートはありません。`apps/web` / `apps/api` の導入後に Vitest / Playwright / Supertest を追加し、レポート出力先を定義します。

---

## 9. コード品質管理

### 静的コード解析ツール

| ツール | 目的 | コマンド |
|--------|------|---------|
| Docker Compose | Compose 定義の検証 | `docker compose config` |
| MkDocs | ドキュメント整合性の確認 | `npm run docs:build` |
| GitHub Actions | docs / Docker publish の自動化確認 | GitHub 上で workflow 実行結果を確認 |

### 品質チェックの実行

```bash
cd /path/to/case-study-sdd-development

# Compose 定義チェック
docker compose config

# docs build
npm run docs:build
```

### コード複雑度の基準

アプリケーションコード未導入のため、複雑度基準は実装開始時に ESLint ルールと合わせて定義します。暫定方針としては、1 モジュール 1 責務、重複排除、短い関数を維持します。

### レポートの確認

| ツール | レポートパス |
|--------|-------------|
| MkDocs build | `site/` |
| GitHub Actions | GitHub Actions の各 workflow 実行履歴 |

---

## 10. ディレクトリ構造

```text
case-study-sdd-development/
├── .devcontainer/
│   └── devcontainer.json             # Dev Container 定義
├── apps/                             # 今後の web / api 実装配置先
├── docs/                             # 分析・設計・運用ドキュメント
├── ops/
│   ├── docker/
│   │   └── mkdoc/                    # MkDocs / PlantUML 補助イメージ
│   ├── nix/                          # Nix 開発環境
│   └── scripts/                      # Gulp タスク実装
├── Dockerfile                        # 開発 shell イメージ
├── docker-compose.yml                # dev / mkdocs / plantuml 定義
├── flake.nix                         # Nix devShell 定義
├── gulpfile.js                       # タスクランナー入口
├── mkdocs.yml                        # ドキュメントナビゲーション
└── package.json                      # Node.js 依存関係と scripts
```

---

## 11. 命名規則

プロジェクトの命名規則を定義します。

| 要素 | 規則 | 例 |
|------|------|-----|
| テーブル名 | snake_case 複数形 | `customers`, `purchase_orders` |
| カラム名 | snake_case | `delivery_date`, `created_at` |
| クラス名 | PascalCase | `OrderAggregate`, `StockProjection` |
| フィールド名 | camelCase | `deliveryDate`, `orderItems` |

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

サブシステムを示すスコープを使用します。

```text
feat(web): 変更内容
fix(api): 変更内容
docs(operation): 変更内容
```

### Git Hooks（Husky + lint-staged）

現時点では Husky / lint-staged は未導入です。コミット前の確認は手動で行います。

#### セットアップ

将来 Git Hooks を導入する場合は、`prepare` スクリプト追加後に以下を実行します。

```bash
npx husky init
```

#### pre-commit フック

導入時には最低限、以下のチェックを自動実行することを推奨します。

| ツール | 目的 |
|--------|------|
| ESLint | コーディング規約の検証 |
| Prettier | フォーマット統一 |
| Vitest | 単体テスト |

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
# 1. Node.js 依存パッケージのインストール
npm install

# 2. Compose 定義確認
docker compose config

# 3. dev shell ビルド
docker compose build dev

# 4. dev shell 実行確認
docker compose run --rm dev bash -lc "node -v && npm -v && git --version"

# 5. docs build
npm run docs:build
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| ドキュメントプレビュー | http://localhost:8000 | メインの開発確認画面 |

---

## 14. CI/CD

CI/CD による継続的インテグレーション・デプロイを設定しています。

### ワークフロー一覧

| ワークフロー | ファイル | トリガー | 説明 |
|-------------|----------|----------|------|
| Docs Deploy | `.github/workflows/mkdocs.yml` | `main` ブランチ push | docs build と GitHub Pages 反映 |
| Docker Publish | `.github/workflows/docker-publish.yml` | タグ push / 手動実行 | 開発コンテナイメージを GHCR に公開 |

### Docs Deploy

ドキュメント変更時に自動実行されます。

```text
実行内容:

  1. 依存関係インストール
  2. docs build
  3. GitHub Pages へデプロイ
```

### Docker Image Publish

タグ push 時または手動実行時に、Docker イメージをビルドして Registry に公開します。

```bash
# タグによる自動実行
git tag 0.0.1
git push origin 0.0.1

# イメージの取得
docker pull ghcr.io/k2works/case-study-sdd-development:latest
```

---

## トラブルシューティング

### `site/` の権限で docs build が失敗する

**問題**: `site/` 配下の所有者が異なり、`npm run docs:build` が失敗します。

```text
Permission denied
```

**解決策**: 所有者を修正してから再実行します。

```bash
sudo chown -R "$(whoami)":"$(whoami)" site 2>/dev/null || true
npm run docs:build
```

### Docker build が失敗する

**問題**: Docker Engine / Docker Desktop が起動していない、またはネットワーク制約で build に失敗します。

```text
Cannot connect to the Docker daemon
```

**解決策**: Docker の起動状態とネットワーク設定を確認します。

```bash
docker -v
docker compose version
docker compose build dev
```

### Node.js バージョンが合わない

**問題**: ホスト側の Node.js が 24 系以外で、依存解決やスクリプト実行に差異が出ます。

```text
Unsupported engine
```

**解決策**: Node.js 24 LTS に揃えるか、Docker / Dev Container / Nix devShell を利用します。

```bash
node -v
nix develop .#node
docker compose run --rm dev bash -lc "node -v"
```
