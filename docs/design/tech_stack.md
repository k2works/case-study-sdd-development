# 技術スタック一覧

## バックエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
|---------|------|-----------|------|-------------|
| 言語 | Ruby | 3.3.x | バックエンド開発 | 2027-03（予定） |
| フレームワーク | Ruby on Rails | 7.2.x | Web アプリケーション | - |
| ORM | ActiveRecord | 7.2.x（Rails 同梱） | データアクセス | Rails と同一 |
| DB | PostgreSQL | 16 | データストア | 2028-11 |
| 認証 | Devise | 4.9.x | 認証・セッション管理 | - |
| テスト | RSpec | 3.13.x | テストフレームワーク | - |
| テストデータ | FactoryBot | 6.x | テストデータ生成 | - |
| テストマッチャー | shoulda-matchers | 6.x | バリデーション・関連テスト | - |
| カバレッジ | SimpleCov | 0.22.x | カバレッジ測定 | - |
| Lint | RuboCop | 1.x | コードスタイル・静的解析 | - |
| セキュリティ | Brakeman | 6.x | Rails セキュリティスキャン | - |
| セキュリティ | bundler-audit | 0.9.x | gem 脆弱性チェック | - |
| ページネーション | Kaminari | 1.2.x | 一覧画面のページング | - |

## フロントエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
|---------|------|-----------|------|-------------|
| テンプレート | ERB | Rails 同梱 | HTML レンダリング | Rails と同一 |
| ページ遷移 | Turbo Drive | 8.x（Hotwire） | SPA 的ページ遷移 | - |
| 部分更新 | Turbo Frames | 8.x（Hotwire） | 非同期部分更新 | - |
| JavaScript | Stimulus | 3.x（Hotwire） | 控えめな JavaScript | - |
| CSS | Bootstrap | 5.3.x | レスポンシブ UI | - |
| アイコン | Bootstrap Icons | 1.11.x | アイコンセット | - |
| アセット管理 | Propshaft | 0.9.x | アセットパイプライン | - |
| JS モジュール | importmap-rails | 2.x | npm なし JS 管理 | - |
| E2E テスト | Capybara | 3.40.x | ブラウザテスト | - |
| E2E ブラウザ | Selenium + Chrome | latest | Headless Chrome | - |

## インフラ・運用

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
|---------|------|-----------|------|-------------|
| PaaS | Heroku | - | アプリケーションホスティング | - |
| DB ホスティング | Heroku Postgres | Mini → Basic | マネージド PostgreSQL | - |
| CI/CD | GitHub Actions | - | テスト・デプロイ自動化 | - |
| バージョン管理 | Git + GitHub | - | ソースコード管理 | - |
| SSL | Heroku ACM | - | 自動 SSL 証明書 | - |

## 開発ツール

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| パッケージ管理 | Bundler | 2.5.x | gem 管理 |
| DB マイグレーション | ActiveRecord Migrations | Rails 同梱 | スキーマ管理 |
| コンソール | Rails Console | Rails 同梱 | 対話的デバッグ |
| ログ | Rails Logger | Rails 同梱 | アプリケーションログ |

## バージョンアップグレード計画

| 技術 | 現行 | 次期メジャー | 対応時期 | 影響度 |
|------|------|------------|---------|--------|
| Ruby | 3.3.x | 3.4（2025-12 リリース済み） | MVP 後に検討 | 低 |
| Rails | 7.2.x | 8.0（2024-11 リリース済み） | 安定後に検討 | 中 |
| PostgreSQL | 16 | 17（2024-09 リリース済み） | Heroku 対応後 | 低 |
| Bootstrap | 5.3.x | 6.x（未リリース） | リリース後に評価 | 中 |
