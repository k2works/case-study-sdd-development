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
> --- https://t-wada.hatenablog.jp/entry/clean-code-that-works

---

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

| ツール | バージョン | 確認コマンド |
| :--- | :--- | :--- |
| Python | 3.12+ | `python --version` |
| uv | 0.5+ | `uv --version` |
| Docker | 最新 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新 | `git -v` |
| Node.js | v22.x LTS | `node -v` |
| npm | v10.x | `npm -v` |

### Python のインストール

Python 3.12 をインストールします。バージョン管理ツールを使用すると複数バージョンの管理が容易です。

```bash
# pyenv でインストール（推奨）
pyenv install 3.12
pyenv local 3.12

# バージョン確認
python --version
```

公式サイトから直接ダウンロードする場合:

- https://www.python.org/downloads/

### uv のインストール

uv は高速な Python パッケージマネージャです。

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows（PowerShell）
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# バージョン確認
uv --version
```

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

| システム | ディレクトリ | 説明 | ポート (DB / App) |
| :--- | :--- | :--- | :--- |
| WEB ショップ | `apps/webshop/` | フレール・メモワール WEB ショップ | 5432 / 8000 |

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
| :--- | :--- | :--- |
| 言語 | Python | 3.12 |
| フレームワーク | Django | 5.2 LTS |
| REST API | Django REST Framework | 3.15+ |
| パッケージ管理 | uv | 0.5+ |
| データベース | PostgreSQL | 16 |
| マイグレーション | Django Migrations | - |
| テスト | pytest + pytest-django | 8.x |
| 品質管理 | Ruff + mypy + tox | - |

### フロントエンド

| カテゴリ | 技術 | バージョン |
| :--- | :--- | :--- |
| テンプレート | Django Template | - |
| インタラクション | HTMX | 2.0+ |
| CSS | Tailwind CSS | 3.4+ |

### インフラストラクチャ

| カテゴリ | 技術 |
| :--- | :--- |
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions |

---

## 5. プロファイル構成

| プロファイル | データベース | Docker | 用途 |
| :--- | :--- | :--- | :--- |
| default | SQLite（インメモリ） | 不要 | 日常開発・即座起動 |
| product | PostgreSQL 16 | 必要 | 本番互換テスト |

### default プロファイル（推奨: 日常開発）

Docker なしで即座に起動できます。

```bash
cd apps/webshop
uv run python manage.py runserver
```

### product プロファイル（本番互換）

```bash
# データベースコンテナを起動
cd apps/webshop
docker compose up -d db

# product プロファイルで起動
DATABASE_URL=postgres://user:pass@localhost:5432/fleur_memoire uv run python manage.py runserver
```

---

## 6. 開発サーバーの起動

### タスクランナー経由（推奨）

```bash
# 全品質チェック + テスト実行
uv run tox

# テストのみ
uv run tox -e test

# リンティングのみ
uv run tox -e lint

# 型チェックのみ
uv run tox -e type

# フォーマット適用
uv run tox -e format
```

### 開発サーバーの起動

```bash
cd apps/webshop

# default プロファイルで起動
uv run python manage.py runserver

# TDD モード（テスト自動再実行）
uv run pytest --watch
```

### アクセス確認

| サービス | URL | 説明 |
| :--- | :--- | :--- |
| アプリケーション | http://localhost:8000 | WEB ショップ |
| API ドキュメント | http://localhost:8000/api/schema/swagger-ui/ | Swagger UI |
| Django Admin | http://localhost:8000/admin/ | 管理画面 |

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
docker compose exec db psql -U user -d fleur_memoire
```

---

## 8. テストの実行

### 全テスト実行

```bash
cd apps/webshop

# テスト実行（カバレッジレポート付き）
uv run pytest --cov=apps --cov-report=term-missing
```

### テストの種類

| テスト種別 | ツール | 説明 |
| :--- | :--- | :--- |
| 単体テスト | pytest | ドメインロジックのテスト（DB 不要） |
| 統合テスト | pytest-django | データベースを使用したテスト |
| E2E テスト | Playwright | ブラウザ自動テスト |

### テストカバレッジ

```bash
# テストを実行してカバレッジレポートを生成
uv run pytest --cov=apps --cov-report=html

# レポートの表示
# htmlcov/index.html をブラウザで開く
```

---

## 9. コード品質管理

### 静的コード解析ツール

| ツール | 目的 | コマンド |
| :--- | :--- | :--- |
| Ruff（lint） | コーディング規約の検証 | `uv run ruff check .` |
| Ruff（format） | コードフォーマット | `uv run ruff format .` |
| mypy | 静的型チェック | `uv run mypy apps` |
| bandit | セキュリティ脆弱性検出 | `uv run bandit -r apps` |

### 品質チェックの実行

```bash
cd apps/webshop

# 品質チェックのみ（tox 経由）
uv run tox -e lint
uv run tox -e type

# すべてのテストと品質チェック
uv run tox
```

### コード複雑度の基準

| 指標 | 閾値 | 説明 |
| :--- | :--- | :--- |
| 循環的複雑度 | 10 | 分岐・ループの複雑さ |
| ファイルサイズ | 500 行 | 1 ファイルの最大行数 |
| メソッドサイズ | 150 行 | 1 メソッドの最大行数 |
| パラメータ数 | 7 | メソッドの最大パラメータ数 |

---

## 10. ディレクトリ構造

```
case-study-sdd-development/
├── .husky/                          # Git Hooks (Husky)
│   └── pre-commit                   # コミット前品質チェック
├── apps/
│   └── webshop/
│       ├── pyproject.toml           # uv プロジェクト設定
│       ├── tox.ini                  # tox タスクランナー設定
│       ├── .ruff.toml               # Ruff 設定
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── manage.py
│       ├── config/                  # Django 設定
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       └── apps/
│           ├── products/            # 商品管理
│           │   ├── domain/
│           │   │   ├── entities.py
│           │   │   ├── value_objects.py
│           │   │   └── interfaces.py
│           │   ├── models.py
│           │   ├── repositories.py
│           │   ├── services.py
│           │   ├── admin.py
│           │   ├── serializers.py
│           │   ├── views.py
│           │   └── tests/
│           ├── orders/              # 受注管理
│           ├── inventory/           # 在庫管理
│           ├── purchasing/          # 仕入管理
│           ├── shipping/            # 出荷管理
│           ├── customers/           # 得意先管理
│           └── accounts/            # 認証
├── docs/                            # ドキュメント
├── ops/                             # 運用スクリプト
└── package.json                     # Node.js 依存関係（husky）
```

---

## 11. 命名規則

| 要素 | 規則 | 例 |
| :--- | :--- | :--- |
| テーブル名 | snake_case（Django App プレフィックス） | `products_product` |
| カラム名 | snake_case | `quality_retention_days` |
| クラス名 | PascalCase | `StockLot` |
| フィールド名 | snake_case | `remaining_quantity` |
| URL パス | kebab-case | `/api/delivery-addresses/` |
| テストファイル | `test_` プレフィックス | `test_domain.py` |

---

## 12. Git 規約

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/) に従います。

| タイプ | 説明 |
| :--- | :--- |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更 |
| `refactor` | バグ修正でも機能追加でもないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセス・補助ツールの変更 |

### スコープ

```
feat(products): 商品マスタの CRUD を実装
fix(inventory): 在庫引当の FIFO ロジックを修正
docs: セットアップ手順を更新
```

### Git Hooks（Husky + lint-staged）

コミット時に自動で品質チェックが実行されます。

```bash
# 手動でセットアップする場合
npx husky init
```

---

## 13. セットアップの確認

すべてのセットアップが完了したら、以下のコマンドで動作確認を行います。

```bash
# 1. Node.js 依存パッケージのインストール
npm install

# 2. Python 依存パッケージのインストール
cd apps/webshop
uv sync

# 3. 品質チェック + テスト
uv run tox

# 4. 開発サーバー起動（default プロファイル）
uv run python manage.py runserver
```

### アクセス確認

| サービス | URL | 説明 |
| :--- | :--- | :--- |
| アプリケーション | http://localhost:8000 | WEB ショップ |
| API ドキュメント | http://localhost:8000/api/schema/swagger-ui/ | Swagger UI |
| Django Admin | http://localhost:8000/admin/ | 管理画面 |

---

## 14. CI/CD

### ワークフロー一覧

| ワークフロー | ファイル | トリガー | 説明 |
| :--- | :--- | :--- | :--- |
| Backend CI | `.github/workflows/backend-ci.yml` | `apps/webshop/` 変更時 | 品質チェック・テスト |
| Docs Deploy | `.github/workflows/mkdocs.yml` | main ブランチ push | ドキュメントをデプロイ |

---

## トラブルシューティング

### uv sync が失敗する

**問題**: `uv sync` 実行時にパッケージの依存関係エラーが発生する

**解決策**: ロックファイルを再生成する

```bash
uv lock --upgrade
uv sync
```

### PostgreSQL に接続できない

**問題**: Docker の PostgreSQL に接続できない

**解決策**: コンテナが起動しているか確認する

```bash
docker compose ps
docker compose up -d db
```

### pre-commit フックが失敗する場合

```bash
cd apps/webshop

# 品質チェックを手動実行してエラーを確認
uv run tox -e lint
uv run tox -e type

# エラーを修正してから再度コミット
```

---

## 関連ドキュメント

- [技術スタック選定](../design/tech_stack.md)
- [バックエンドアーキテクチャ](../design/architecture_backend.md)
- [テスト戦略](../design/test_strategy.md)
