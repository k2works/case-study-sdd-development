# アプリケーション開発環境セットアップ手順書

## 概要

本ドキュメントは、フレール・メモワール WEB ショップシステムのアプリケーション開発環境をセットアップする手順を説明します。

---

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

| ツール | バージョン | 確認コマンド |
|--------|-----------|-------------|
| Ruby | 3.3.x | `ruby -v` |
| Bundler | 2.5.x | `bundle -v` |
| PostgreSQL | 16 | `psql --version` |
| Docker | 最新 | `docker -v` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 最新 | `git -v` |
| Node.js | v22.x LTS | `node -v` |
| npm | v10.x | `npm -v` |

### Ruby のインストール

rbenv を使用して Ruby をインストールします。

```bash
# rbenv でインストール
rbenv install 3.3.6
rbenv global 3.3.6

# バージョン確認
ruby -v
```

### PostgreSQL のインストール

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# バージョン確認
psql --version
```

### Docker のインストール

Docker Desktop をインストールします。

- **macOS**: https://docs.docker.com/desktop/install/mac-install/

```bash
# バージョン確認
docker -v
docker compose version
```

### Node.js のインストール

```bash
# nvm でインストール
nvm install 22
nvm use 22

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

---

## 3. Rails プロジェクトの作成

### Rails アプリケーションの生成

```bash
# Rails gem のインストール
gem install rails -v 7.2

# Rails new（PostgreSQL、テストフレームワーク skip で RSpec を使用）
rails new app --database=postgresql --skip-test --skip-system-test

cd app
```

### Gemfile の編集

以下の gem を追加します。

```ruby
# Gemfile

# 認証
gem "devise"

# UI
gem "bootstrap", "~> 5.3"
gem "sassc-rails"

# ページネーション
gem "kaminari"

# セキュリティ
gem "rack-attack"

group :development, :test do
  # テスト
  gem "rspec-rails"
  gem "factory_bot_rails"
  gem "shoulda-matchers"

  # コード品質
  gem "rubocop", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "brakeman", require: false
  gem "bundler-audit", require: false
end

group :test do
  gem "simplecov", require: false
  gem "capybara"
  gem "selenium-webdriver"
end
```

### 依存パッケージのインストール

```bash
bundle install
```

---

## 4. 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | Ruby | 3.3.x |
| フレームワーク | Ruby on Rails | 7.2.x |
| ORM | ActiveRecord | 7.2.x |
| データベース | PostgreSQL | 16 |
| 認証 | Devise | 4.9.x |
| テスト | RSpec | 3.13.x |
| カバレッジ | SimpleCov | 0.22.x |
| Lint | RuboCop | 1.x |
| セキュリティ | Brakeman | 6.x |

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| テンプレート | ERB | Rails 同梱 |
| JavaScript | Hotwire (Turbo + Stimulus) | 8.x / 3.x |
| CSS | Bootstrap | 5.3.x |

---

## 5. 初期セットアップ

### RSpec のセットアップ

```bash
rails generate rspec:install
```

### Devise のセットアップ

```bash
rails generate devise:install
rails generate devise User
```

### データベースの作成

```bash
rails db:create
rails db:migrate
```

---

## 6. 開発サーバーの起動

```bash
# Rails サーバー起動
rails server

# または bin/dev（Procfile.dev 使用時）
bin/dev
```

### アクセス確認

| サービス | URL | 説明 |
|---------|-----|------|
| アプリケーション | http://localhost:3000 | メインアプリケーション |

---

## 7. テストの実行

### 全テスト実行

```bash
bundle exec rspec
```

### テストの種類

| テスト種別 | ディレクトリ | 説明 |
|-----------|-------------|------|
| Model Spec | spec/models/ | バリデーション・メソッドのテスト |
| Request Spec | spec/requests/ | Controller + Service の統合テスト |
| Service Spec | spec/services/ | Service Object のテスト |
| System Spec | spec/system/ | E2E テスト（Capybara） |

### テストカバレッジ

```bash
# テストを実行してカバレッジレポートを生成
bundle exec rspec

# レポートの表示
open coverage/index.html
```

---

## 8. コード品質管理

### 静的コード解析

```bash
# RuboCop
bundle exec rubocop

# Brakeman
bundle exec brakeman

# bundler-audit
bundle exec bundler-audit check --update
```

---

## 9. ディレクトリ構造

```
app/
├── controllers/
│   ├── application_controller.rb
│   ├── products_controller.rb
│   ├── items_controller.rb
│   ├── compositions_controller.rb
│   ├── orders_controller.rb
│   ├── customers_controller.rb
│   ├── stock_forecasts_controller.rb
│   ├── purchase_orders_controller.rb
│   ├── arrivals_controller.rb
│   ├── shipments_controller.rb
│   └── sessions_controller.rb
├── models/
│   ├── product.rb
│   ├── item.rb
│   ├── composition.rb
│   ├── order.rb
│   ├── delivery_address.rb
│   ├── customer.rb
│   ├── supplier.rb
│   ├── purchase_order.rb
│   ├── arrival.rb
│   ├── stock.rb
│   ├── shipment.rb
│   └── user.rb
├── services/
│   ├── order_service.rb
│   ├── stock_allocation_service.rb
│   ├── stock_forecast_service.rb
│   ├── shipping_service.rb
│   └── purchase_order_service.rb
├── forms/
│   └── order_form.rb
└── views/
    ├── layouts/
    ├── products/
    ├── items/
    ├── orders/
    ├── stock_forecasts/
    ├── purchase_orders/
    ├── arrivals/
    ├── shipments/
    ├── customers/
    └── devise/
```

---

## 10. Git 規約

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

---

## 11. セットアップの確認

すべてのセットアップが完了したら、以下のコマンドで動作確認を行います。

```bash
# 1. 依存パッケージのインストール
bundle install

# 2. データベース作成
rails db:create db:migrate

# 3. テスト実行
bundle exec rspec

# 4. 品質チェック
bundle exec rubocop
bundle exec brakeman

# 5. 開発サーバー起動
rails server
```

---

## 関連ドキュメント

- [技術スタック選定](../design/tech_stack.md)
- [バックエンドアーキテクチャ](../design/architecture_backend.md)
- [テスト戦略](../design/test_strategy.md)
