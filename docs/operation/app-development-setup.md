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
| Java | 21 (LTS) | `java -version` |
| Gradle | 8.x | `gradle -v` |
| Docker | 最新 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新 | `git -v` |
| Node.js | v22.x LTS | `node -v` |
| npm | v10.x | `npm -v` |

### Java のインストール

Java をインストールします。バージョン管理ツールを使用すると複数バージョンの管理が容易です。

```bash
# SDKMAN でインストール
sdk install java 21-tem

# バージョン確認
java -version
```

公式サイトから直接ダウンロードする場合：

- https://adoptium.net/

### Docker のインストール

Docker Desktop をインストールします。

- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **macOS**: https://docs.docker.com/desktop/install/mac-install/

```bash
# バージョン確認
docker -v

docker compose version
```

### Node.js のインストール

コミット前の品質チェック（husky + lint-staged）に Node.js が必要です。

- https://nodejs.org/

```bash
# バージョン確認
node -v

npm -v
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

フレール・メモワール WEB ショップシステムは以下のサブシステムで構成されています。

| システム | ディレクトリ | 説明 | ポート (DB / App) |
|---------|-------------|------|-------------------|
| WEB ショップ | `apps/webshop` | 花束注文・在庫管理・出荷管理 | 5432 / 8080 |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | Java | 21 (LTS) |
| フレームワーク | Spring Boot | 3.x |
| ビルドツール | Gradle | 8.x |
| ORM | Spring Data JPA / Hibernate | 3.x / 6.x |
| データベース | PostgreSQL | 15+ |
| マイグレーション | Flyway | 10.x |
| テスト | JUnit 5 | 5.10+ |
| 品質管理 | Checkstyle / SpotBugs / JaCoCo | - |

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.x |
| フレームワーク | React | 18.x |
| CSS | Tailwind CSS | 3.x |

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
| default | H2（インメモリ） | 不要 | 日常開発・即座起動 |
| prod | PostgreSQL 15+ | 必要 | 本番互換テスト |

### default プロファイル（推奨：日常開発）

Docker なしで即座に起動できます。

```bash
cd apps/webshop/backend
./gradlew bootRun
```

### prod プロファイル（本番互換）

```bash
# データベースコンテナを起動
cd apps/webshop
docker compose up -d db

# prod プロファイルで起動
cd backend
./gradlew bootRun --args='--spring.profiles.active=prod'
```

---

## 6. 開発サーバーの起動

### タスクランナー経由（推奨）

```bash
# バックエンド開発サーバー起動（default プロファイル）
npm run webshop:backend

# フロントエンド開発サーバー起動
npm run webshop:frontend

# タスク一覧を表示
npm run
```

### ビルドツール直接実行

```bash
cd apps/webshop/backend

# default プロファイルで起動
./gradlew bootRun

# TDD モード（テストを常に再実行）
./gradlew test --continuous
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| アプリケーション | http://localhost:8080 | メインアプリケーション |
| API ドキュメント | http://localhost:8080/swagger-ui.html | OpenAPI ドキュメント |
| DB 管理ツール | http://localhost:8080/h2-console | データベース管理（default プロファイル） |
| ヘルスチェック | http://localhost:8080/api/health | ヘルスチェック |
| フロントエンド | http://localhost:5173 | React 開発サーバー |

---

## 7. Docker Compose のセットアップ

### データベースコンテナの起動

```bash
cd apps/webshop

# データベースを起動
docker compose up -d db

# コンテナの状態確認
docker compose ps
```

### Docker Compose の便利なコマンド

```bash
# データベースを起動
docker compose up -d db

# コンテナの停止と削除
docker compose down

# ログを確認
docker compose logs -f db

# データベースに接続
docker compose exec db psql -U webshop -d webshop
```

---

## 8. テストの実行

### 全テスト実行

```bash
cd apps/webshop/backend

# テスト実行（カバレッジレポート付き）
./gradlew test jacocoTestReport
```

### テストの種類

| テスト種別 | ツール | 説明 |
|-----------|--------|------|
| 単体テスト | JUnit 5 / Mockito / AssertJ | ドメインロジックのテスト |
| 統合テスト | Testcontainers | データベースを使用したテスト |
| アーキテクチャテスト | ArchUnit | レイヤー依存関係検証 |

### テストカバレッジ

```bash
# テストを実行してカバレッジレポートを生成
./gradlew test jacocoTestReport

# レポートの表示
# build/reports/jacoco/test/html/index.html
```

---

## 9. コード品質管理

### 静的コード解析ツール

| ツール | 目的 | コマンド |
|--------|------|---------|
| Checkstyle | コーディング規約の検証 | `./gradlew checkstyleMain` |
| SpotBugs | バグパターン検出 | `./gradlew spotbugsMain` |
| JaCoCo | テストカバレッジ | `./gradlew jacocoTestReport` |

### 品質チェックの実行

```bash
cd apps/webshop/backend

# 品質チェックのみ
./gradlew check

# すべてのテストと品質チェック
./gradlew build
```

### コード複雑度の基準

| 指標 | 閾値 | 説明 |
|------|------|------|
| 循環的複雑度 | 10 | 分岐・ループの複雑さ |
| ファイルサイズ | 500 行 | 1 ファイルの最大行数 |
| メソッドサイズ | 150 行 | 1 メソッドの最大行数 |
| パラメータ数 | 7 | メソッドの最大パラメータ数 |

### レポートの確認

品質チェック後、以下のディレクトリにレポートが生成されます。

| ツール | レポートパス |
|--------|-------------|
| Checkstyle | `build/reports/checkstyle/` |
| SpotBugs | `build/reports/spotbugs/` |
| JaCoCo | `build/reports/jacoco/test/html/` |
| テスト結果 | `build/reports/tests/test/` |

---

## 10. ディレクトリ構造

```
case-study-sdd-development/
├── .husky/                          # Git Hooks (Husky)
│   └── pre-commit                   # コミット前品質チェック
├── apps/
│   └── webshop/
│       ├── backend/
│       │   ├── build.gradle
│       │   ├── settings.gradle
│       │   ├── Dockerfile
│       │   ├── config/              # 品質管理ツール設定
│       │   └── src/
│       │       ├── main/
│       │       │   ├── java/com/frerememoire/webshop/
│       │       │   │   ├── domain/            # ドメイン層
│       │       │   │   ├── application/       # アプリケーション層
│       │       │   │   └── infrastructure/    # インフラストラクチャ層
│       │       │   └── resources/
│       │       │       ├── application.yml
│       │       │       ├── application-prod.yml
│       │       │       └── db/migration/      # マイグレーション
│       │       └── test/
│       ├── frontend/
│       │   ├── package.json
│       │   ├── vite.config.ts
│       │   ├── vitest.config.ts
│       │   └── src/
│       │       ├── components/
│       │       ├── features/
│       │       ├── hooks/
│       │       ├── lib/
│       │       ├── pages/
│       │       ├── providers/
│       │       ├── types/
│       │       ├── utils/
│       │       └── config/
│       └── docker-compose.yml
├── docs/                            # ドキュメント
├── ops/                             # 運用スクリプト
└── package.json                     # Node.js 依存関係（husky, lint-staged）
```

---

## 11. 命名規則

プロジェクトの命名規則を定義します。

| 要素 | 規則 | 例 |
|------|------|-----|
| テーブル名 | スネークケース（単数形） | `purchase_order` |
| カラム名 | スネークケース | `order_date` |
| クラス名 | アッパーキャメルケース | `PurchaseOrder` |
| フィールド名 | ローワーキャメルケース | `orderDate` |

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

```
feat(webshop): 受注管理機能を追加
fix(webshop): 在庫計算の不具合を修正
docs: セットアップ手順書を更新
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
| Checkstyle | コーディング規約の検証 |
| SpotBugs | バグパターン検出 |

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
# 1. Node.js 依存パッケージのインストール
npm install

# 2. ビルド確認
cd apps/webshop/backend
./gradlew build

# 3. テスト実行
./gradlew test

# 4. 品質チェック
./gradlew check

# 5. 開発サーバー起動（default プロファイル）
./gradlew bootRun
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| アプリケーション | http://localhost:8080 | メインアプリケーション |
| API ドキュメント | http://localhost:8080/swagger-ui.html | OpenAPI ドキュメント |
| DB 管理ツール | http://localhost:8080/h2-console | データベース管理ツール |
| ヘルスチェック | http://localhost:8080/api/health | ヘルスチェック |

---

## 14. CI/CD

CI/CD による継続的インテグレーション・デプロイを設定しています。

### ワークフロー一覧

| ワークフロー | ファイル | トリガー | 説明 |
|-------------|----------|----------|------|
| Backend CI | `.github/workflows/backend-ci.yml` | `apps/webshop/backend/**` 変更時 | 品質チェック・テスト・ビルド |
| Docker Publish | `.github/workflows/docker-publish.yml` | タグ push / 手動実行 | イメージを Registry に公開 |
| Docs Deploy | `.github/workflows/docs-deploy.yml` | main ブランチ push | ドキュメントをデプロイ |

### Backend CI

バックエンドの変更時に自動実行されます。

```
実行内容:

  1. 環境セットアップ（Java 21）
  2. Gradle キャッシュ復元
  3. 品質チェック（Checkstyle、SpotBugs）
  4. テスト実行（単体・統合・アーキテクチャ）
  5. カバレッジレポート生成
  6. ビルド（JAR 生成）
  7. レポートアップロード
```

### Docker Image Publish

タグ push 時または手動実行時に、Docker イメージをビルドして Registry に公開します。

```bash
# タグによる自動実行
git tag v1.0.0
git push origin v1.0.0

# イメージの取得
docker pull ghcr.io/k2works/webshop:latest
```

---

## トラブルシューティング

### Gradle ビルドが失敗する

**問題**: Gradle のバージョン不一致やキャッシュ破損でビルドが失敗する

```
Could not resolve all files for configuration ':compileClasspath'.
```

**解決策**: Gradle キャッシュをクリアして再ビルド

```bash
./gradlew clean build --refresh-dependencies
```

### H2 Console に接続できない

**問題**: default プロファイルで H2 Console にアクセスできない

**解決策**: application.yml で H2 Console が有効になっていることを確認

```bash
# ブラウザで http://localhost:8080/h2-console にアクセス
# JDBC URL: jdbc:h2:mem:webshop
# Username: sa
# Password: (空)
```

### pre-commit フックが失敗する場合

```bash
cd apps/webshop/backend

# 品質チェックを手動実行してエラーを確認
./gradlew check

# エラーを修正してから再度コミット
```

---

## 関連ドキュメント

- [技術スタック選定](../design/tech_stack.md)
- [バックエンドアーキテクチャ設計](../design/architecture_backend.md)
- [フロントエンドアーキテクチャ設計](../design/architecture_frontend.md)
