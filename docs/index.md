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
| [IT1 計画](./development/iteration_plan-1.md) | 完了 |
| [IT1 ふりかえり](./development/retrospective-1.md) | 完了 |
| [IT1 完了報告書](./development/iteration_report-1.md) | 完了 |
| [IT2 計画](./development/iteration_plan-2.md) | 完了 |
| [IT2 ふりかえり](./development/retrospective-2.md) | 完了 |
| [IT2 完了報告書](./development/iteration_report-2.md) | 完了 |
| [IT3 計画](./development/iteration_plan-3.md) | 完了 |
| [IT3 ふりかえり](./development/retrospective-3.md) | 完了 |
| [IT3 完了報告書](./development/iteration_report-3.md) | 完了 |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [アプリケーション開発環境セットアップ手順書](./operation/app-development-setup.md) | 完了 |

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
| [UI/UX 設計レビュー](./review/ui_design_uiux_review_20260324.md) | 2026-03-24 |
| [初期構築レビュー](./review/webshop_initial_setup_review_20260324.md) | 2026-03-24 |
| [IT1 コードレビュー](./review/it1_code_review_20260324.md) | 2026-03-24 |
| [IT1 UI/UX レビュー](./review/it1_uiux_review_20260324.md) | 2026-03-24 |
| [IT2 コードレビュー](./review/it2_code_review_20260324.md) | 2026-03-24 |
| [IT3 S08 コードレビュー](./review/S08_stock_forecast_review_20260324.md) | 2026-03-24 |
| [IT3 S08 UI/UX レビュー](./review/S08_stock_forecast_uiux_review_20260324.md) | 2026-03-24 |

### リファレンス (`reference/`)

開発ガイドラインやベストプラクティスのリファレンスドキュメントです。

- [よいソフトウェアとは](./reference/よいソフトウェアとは.md)
- [開発ガイド](./reference/開発ガイド.md)

### テンプレート (`template/`)

ドキュメント作成用のテンプレートです。
