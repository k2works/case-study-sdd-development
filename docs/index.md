# プロジェクトドキュメント

プロジェクトのドキュメントです。

## まずこれを読もうリスト

- [ビジネスアーキテクチャ](./analysis/business_architecture.md) - ビジネス構造を定義。設計の基盤。
- [インセプションデッキ](./analysis/inception_deck.md) - プロジェクトの全体像と方向性を共有。

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
| [イテレーション 1 計画](./development/iteration_plan-1.md) | 完了 |
| [イテレーション 1 完了報告書](./development/iteration_report-1.md) | 完了 |
| [イテレーション 1 ふりかえり](./development/retrospective-1.md) | 完了 |
| [イテレーション 2 計画](./development/iteration_plan-2.md) | 完了 |
| [イテレーション 2 ふりかえり](./development/retrospective-2.md) | 完了 |
| [イテレーション 2 完了報告書](./development/iteration_report-2.md) | 完了 |
| [イテレーション 3 計画](./development/iteration_plan-3.md) | 完了 |
| [イテレーション 3 ふりかえり](./development/retrospective-3.md) | 完了 |
| [イテレーション 3 完了報告書](./development/iteration_report-3.md) | 完了 |
| [イテレーション 4 計画](./development/iteration_plan-4.md) | 完了 |
| [イテレーション 4 ふりかえり](./development/retrospective-4.md) | 完了 |
| [イテレーション 4 完了報告書](./development/iteration_report-4.md) | 完了 |
| [イテレーション 5 計画](./development/iteration_plan-5.md) | 完了 |
| [イテレーション 5 ふりかえり](./development/retrospective-5.md) | 完了 |
| [イテレーション 5 完了報告書](./development/iteration_report-5.md) | 完了 |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [アプリケーション開発環境セットアップ手順書](./operation/dev_app_instruction.md) | 完了 |
| [デモ環境セットアップ手順書（Heroku Container）](./operation/dev_heroku_instruction.md) | 完了 |

### レビュー (`review/`)

| ドキュメント | 対象 | 日付 |
| :--- | :--- | :--- |
| [イテレーション 3 計画レビュー](./review/iteration_plan-3_review_20260317.md) | IT3 計画 | 2026-03-17 |
| [S08 在庫推移レビュー](./review/s08_stock_forecast_review_20260318.md) | S08 在庫推移を確認する | 2026-03-18 |
| [S09 単品発注レビュー](./review/s09_review_20260318.md) | S09 単品を発注する | 2026-03-18 |
| [イテレーション 5 計画レビュー](./review/iteration_plan-5_review_20260318.md) | IT5 計画 | 2026-03-18 |

### ADR (`adr/`)

技術的意思決定を記録した Architecture Decision Records です。

| ADR | 決定内容 | ステータス |
| :--- | :--- | :--- |
| [ADR-001](./adr/001-purchase-order-transaction-strategy.md) | 発注作成時のトランザクション方針 | 承認済み |
| [ADR-002](./adr/002-demo-environment-sqlite.md) | デモ環境 DB を SQLite に切り替え | 承認済み |
| [ADR-003](./adr/003-delivery-date-change-transaction-strategy.md) | 届け日変更時のトランザクション方針 | 承認済み |

### リファレンス (`reference/`)

開発ガイドラインやベストプラクティスのリファレンスドキュメントです。

- [よいソフトウェアとは](./reference/よいソフトウェアとは.md)
- [開発ガイド](./reference/開発ガイド.md)
- [ビジネスアーキテクチャ分析ガイド](./reference/ビジネスアーキテクチャ分析ガイド.md)
- [要件定義ガイド](./reference/要件定義ガイド.md)
- [ユースケース作成ガイド](./reference/ユースケース作成ガイド.md)
- [アーキテクチャ設計ガイド](./reference/アーキテクチャ設計ガイド.md)
- [データモデル設計ガイド](./reference/データモデル設計ガイド.md)
- [ドメインモデル設計ガイド](./reference/ドメインモデル設計ガイド.md)
- [UI 設計ガイド](./reference/UI設計ガイド.md)
- [テスト戦略ガイド](./reference/テスト戦略ガイド.md)
- [非機能要件定義ガイド](./reference/非機能要件定義ガイド.md)
- [運用要件定義ガイド](./reference/運用要件定義ガイド.md)
- [インフラ設計ガイド](./reference/インフラ設計ガイド.md)
- [コーディングとテストガイド](./reference/コーディングとテストガイド.md)
- [エクストリームプログラミング](./reference/エクストリームプログラミング.md)
- [リリースガイド](./reference/リリースガイド.md)
- [リリース・イテレーション計画ガイド](./reference/リリース・イテレーション計画ガイド.md)
- [環境変数管理ガイド](./reference/環境変数管理ガイド.md)
- [言語別開発ガイド](./reference/言語別開発ガイド.md)
- [Java アプリケーション環境構築ガイド](./reference/Javaアプリケーション環境構築ガイド.md)
- [TypeScript アプリケーション環境構築ガイド](./reference/TypeScriptアプリケーション環境構築ガイド.md)
- [Codex CLI MCP アプリケーション開発フロー](./reference/CodexCLIMCPアプリケーション開発フロー.md)
- [Codex CLI MCP サーバー設定手順](./reference/CodexCLIMCPサーバー設定手順.md)
- [SonarQube ローカル環境セットアップ手順書](./reference/SonarQubeローカル環境セットアップ手順書.md)
- [運用スクリプト作成ガイド](./reference/運用スクリプト作成ガイド.md)
- [Vim 操作マニュアル](./reference/Vim操作マニュアル.md)

### テンプレート (`template/`)

ドキュメント作成用のテンプレートです。

- [まずこれを読もうリスト](./template/まずこれを読もうリスト.md)
- [ビジネスアーキテクチャ](./template/ビジネスアーキテクチャ.md)
- [要件定義](./template/要件定義.md)
- [完全形式のユースケース](./template/完全形式のユースケース.md)
- [設計](./template/設計.md)
- [ADR](./template/ADR.md)
- [インセプションデッキ](./template/インセプションデッキ.md)
- [イテレーション計画](./template/イテレーション計画.md)
- [イテレーション完了報告書](./template/イテレーション完了報告書.md)
- [リリース計画](./template/リリース計画.md)
- [アプリケーション開発環境セットアップ手順書](./template/アプリケーション開発環境セットアップ手順書.md)
- [開発環境セットアップ手順書](./template/開発環境セットアップ手順書.md)
- [AWS ステージング環境セットアップ手順書](./template/AWSステージング環境セットアップ手順書.md)
- [AWS プロダクション環境セットアップ手順書](./template/AWSプロダクション環境セットアップ手順書.md)
- [README](./template/README.md)
