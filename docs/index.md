# プロジェクトドキュメント

フレール・メモワール WEB ショップシステムのプロジェクトドキュメントです。

## まずこれを読もうリスト

- [ビジネスアーキテクチャ](./analysis/business_architecture.md) - ビジネス構造を定義。設計の基盤。
- [インセプションデッキ](./analysis/inception_deck.md) - プロジェクトの全体像と方向性を共有。
- [要件定義書（RDRA 2.0）](./requirements/requirements_definition.md) - システムの要件を 4 層で定義。
- [バックエンドアーキテクチャ](./design/architecture_backend.md) - Rails モノリシック MVC の設計。
- [技術スタック選定](./design/tech_stack.md) - 使用技術の一覧とバージョン。

## ドキュメント構成

### 分析 (`analysis/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [ビジネスアーキテクチャ](./analysis/business_architecture.md) | 完了 |
| [インセプションデッキ](./analysis/inception_deck.md) | 完了 |

### 要件定義 (`requirements/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [要件定義書（RDRA 2.0）](./requirements/requirements_definition.md) | 完了 |
| [ビジネスユースケース](./requirements/business_usecase.md) | 完了 |
| [システムユースケース](./requirements/system_usecase.md) | 完了 |
| [ユーザーストーリー](./requirements/user_story.md) | 完了 |

### 設計 (`design/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [バックエンドアーキテクチャ](./design/architecture_backend.md) | 完了 |
| [フロントエンドアーキテクチャ](./design/architecture_frontend.md) | 完了 |
| [インフラストラクチャ](./design/architecture_infrastructure.md) | 完了 |
| [データモデル設計](./design/data-model.md) | 完了 |
| [ドメインモデル設計](./design/domain-model.md) | 完了 |
| [UI 設計](./design/ui-design.md) | 完了 |
| [テスト戦略](./design/test_strategy.md) | 完了 |
| [非機能要件](./design/non_functional.md) | 完了 |
| [運用要件](./design/operation.md) | 完了 |
| [技術スタック選定](./design/tech_stack.md) | 完了 |

### 開発 (`development/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [リリース計画](./development/release_plan.md) | 完了 |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [アプリケーション開発環境セットアップ手順書](./operation/dev_app_instruction.md) | 未着手 |

### ADR (`adr/`)

技術的意思決定を記録した Architecture Decision Records です。

| ADR | 決定 |
| :--- | :--- |
| [ADR-001](./adr/001-rails-monolithic-architecture.md) | Rails モノリシック MVC アーキテクチャの採用 |
| [ADR-002](./adr/002-heroku-paas.md) | Heroku PaaS の採用 |

### レビュー (`review/`)

| レビュー | 日付 |
| :--- | :--- |
| [要件定義レビュー](./review/requirements_review_20260324.md) | 2026-03-24 |
| [設計レビュー](./review/design_review_20260324.md) | 2026-03-24 |
| [運用レビュー](./review/operation_review_20260324.md) | 2026-03-24 |

### リファレンス (`reference/`)

開発ガイドラインやベストプラクティスのリファレンスドキュメントです。

- [よいソフトウェアとは](./reference/よいソフトウェアとは.md)
- [開発ガイド](./reference/開発ガイド.md)

### テンプレート (`template/`)

ドキュメント作成用のテンプレートです。
