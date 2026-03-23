# プロジェクトドキュメント

プロジェクトのドキュメントです。

## まずこれを読もうリスト

- [ビジネスアーキテクチャ](./analysis/business_architecture.md) - ビジネス構造を定義。設計の基盤。
- [インセプションデッキ](./analysis/inception_deck.md) - プロジェクトの全体像と方向性を共有。
- [要件定義書（RDRA 2.0）](./requirements/requirements_definition.md) - システム価値・外部環境・境界・システムを RDRA モデルで定義。
- [バックエンドアーキテクチャ](./design/architecture_backend.md) - ドメインモデル + ポートとアダプターパターン。

## ドキュメント構成

### 分析 (`analysis/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [ビジネスアーキテクチャ](./analysis/business_architecture.md) | 作成済み |
| [インセプションデッキ](./analysis/inception_deck.md) | 作成済み |

### 要件定義 (`requirements/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [要件定義書（RDRA 2.0）](./requirements/requirements_definition.md) | 作成済み |
| [ビジネスユースケース](./requirements/business_usecase.md) | 作成済み |
| [システムユースケース](./requirements/system_usecase.md) | 作成済み |
| [ユーザーストーリー](./requirements/user_story.md) | 作成済み |

### 設計 (`design/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [バックエンドアーキテクチャ](./design/architecture_backend.md) | 作成済み |
| [フロントエンドアーキテクチャ](./design/architecture_frontend.md) | 作成済み |
| [インフラストラクチャ](./design/architecture_infrastructure.md) | 作成済み |
| [データモデル設計](./design/data-model.md) | 作成済み |
| [ドメインモデル設計](./design/domain_model.md) | 作成済み |
| [UI 設計](./design/ui-design.md) | 作成済み |
| [テスト戦略](./design/test_strategy.md) | 作成済み |
| [非機能要件](./design/non_functional.md) | 作成済み |
| [運用要件](./design/operation.md) | 作成済み |
| [技術スタック選定](./design/tech_stack.md) | 作成済み |

### レビュー (`review/`)

分析フェーズ成果物のマルチパースペクティブレビュー結果です。

| ドキュメント | 内容 |
| :--- | :--- |
| [分析レビュー](./review/analysis_review_20260320.md) | ビジネスアーキテクチャ・インセプションデッキのレビュー |
| [要件定義レビュー](./review/requirements_review_20260320.md) | 要件定義書・ユースケース・ユーザーストーリーのレビュー |
| [設計レビュー](./review/design_review_20260320.md) | アーキテクチャ・データモデル・ドメインモデル等のレビュー |
| [統合レビュー](./review/integrated_review_20260320.md) | カテゴリ横断の統合分析 |
| [初回セットアップレビュー](./review/webshop_initial_setup_review_20260320.md) | webshop 初期セットアップのコードレビュー |
| [CI/CD パイプラインレビュー](./review/cicd_pipeline_review_20260320.md) | CI/CD パイプラインの運用レビュー |
| [IT1 計画レビュー](./review/iteration_plan-1_review_20260321.md) | IT1 イテレーション計画のレビュー |
| [IT2 実装レビュー](./review/it2_product_review_20260321.md) | IT2 商品管理機能のマルチパースペクティブレビュー |
| [IT3 計画レビュー](./review/it3_plan_review_20260321.md) | IT3 注文フロー・受注管理計画のレビュー |
| [IT3 開発レビュー](./review/it3_developing_review_20260321.md) | IT3 注文フロー・受注管理実装のマルチパースペクティブレビュー |
| [UI/UX デザインレビュー](./review/ui_design_uiux_review_20260321.md) | UI 設計の UX・アクセシビリティレビュー |
| [IT4 計画レビュー](./review/it4_plan_review_20260322.md) | IT4 在庫推移・発注・入荷計画のマルチパースペクティブレビュー |
| [IT4 UI/UX レビュー](./review/it4_uiux_review_20260322.md) | S-201 在庫推移・S-301 発注画面の UI/UX レビュー |
| [IT4 開発レビュー](./review/it4_developing_review_20260322.md) | IT4 在庫推移・発注実装のマルチパースペクティブレビュー |
| [IT4 実装 UI/UX レビュー](./review/it4_impl_uiux_review_20260322.md) | IT4 実装後の UI/UX レビュー |
| [IT5 計画レビュー](./review/iteration_plan-5_review_20260322.md) | IT5 イテレーション計画のマルチパースペクティブレビュー |
| [IT5 UI/UX レビュー](./review/iteration_plan-5_uiux_review_20260322.md) | S-302 入荷登録・S-401 結束対象一覧の UI/UX レビュー |
| [IT5 開発レビュー](./review/it5_developing_review_20260322.md) | IT5 入荷登録・結束対象確認・結束完了実装のマルチパースペクティブレビュー |
| [IT5 実装 UI/UX レビュー](./review/it5_impl_uiux_review_20260322.md) | IT5 実装後の UI/UX レビュー |
| [IT6 計画レビュー](./review/iteration_plan-6_review_20260323.md) | IT6 計画のマルチパースペクティブレビュー |
| [IT6 UI/UX レビュー](./review/it6_uiux_review_20260323.md) | IT6 UI/UX 設計の UI/UX レビュー |
| [IT6 開発レビュー](./review/it6_developing_review_20260323.md) | IT6 出荷・キャンセル・届け日変更実装のマルチパースペクティブレビュー |
| [IT6 実装 UI/UX レビュー](./review/it6_impl_uiux_review_20260323.md) | IT6 実装後の UI/UX レビュー |
| [IT7 開発レビュー](./review/it7_developing_review_20260323.md) | IT7 シードデータ追加のマルチパースペクティブレビュー |
| [IT7 ダッシュボードレビュー](./review/it7_dashboard_review_20260323.md) | ダッシュボード S-100 の問題点分析・改善提案 |

### 開発 (`development/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [リリース計画](./development/release_plan.md) | 作成済み |
| [IT1 イテレーション計画](./development/iteration_plan-1.md) | 完了（11 SP / 102 テスト） |
| [IT1 ふりかえり](./development/iteration_retrospective-1.md) | 作成済み |
| [IT1 完了報告書](./development/iteration_report-1.md) | 作成済み |
| [IT2 イテレーション計画](./development/iteration_plan-2.md) | 完了（11 SP / 170 テスト） |
| [IT2 ふりかえり](./development/iteration_retrospective-2.md) | 作成済み |
| [IT2 完了報告書](./development/iteration_report-2.md) | 作成済み |
| [IT3 イテレーション計画](./development/iteration_plan-3.md) | 完了（13 SP / 56h） |
| [IT3 ふりかえり](./development/iteration_retrospective-3.md) | 作成済み |
| [IT3 完了報告書](./development/iteration_report-3.md) | 作成済み |
| [IT4 イテレーション計画](./development/iteration_plan-4.md) | 完了（13 SP / 47.5h） |
| [IT4 ふりかえり](./development/iteration_retrospective-4.md) | 作成済み |
| [IT4 完了報告書](./development/iteration_report-4.md) | 作成済み |
| [IT5 イテレーション計画](./development/iteration_plan-5.md) | 完了（11 SP） |
| [IT5 ふりかえり](./development/iteration_retrospective-5.md) | 作成済み |
| [IT5 完了報告書](./development/iteration_report-5.md) | 作成済み |
| [Release 1.0 MVP 完了報告書](./development/release_report-1_0.md) | 作成済み |
| [Release 2.0 出荷管理 完了報告書](./development/release_report-2_0.md) | 作成済み |
| [IT6 イテレーション計画](./development/iteration_plan-6.md) | 実装完了（16 SP） |
| [IT6 ふりかえり](./development/iteration_retrospective-6.md) | 作成済み |
| [IT6 完了報告書](./development/iteration_report-6.md) | 作成済み |
| [IT7 イテレーション計画](./development/iteration_plan-7.md) | 実装完了（8 SP / 439 テスト） |
| [IT7 ふりかえり](./development/iteration_retrospective-7.md) | 作成済み |
| [IT7 完了報告書](./development/iteration_report-7.md) | 作成済み |
| [IT8 イテレーション計画（バッファ）](./development/iteration_plan-8.md) | 完了（品質保証・リリース準備） |
| [IT8 ふりかえり](./development/iteration_retrospective-8.md) | 作成済み |
| [IT8 完了報告書](./development/iteration_report-8.md) | 作成済み |
| [Release 3.0 顧客体験 完了報告書](./development/release_report-3_0.md) | 作成済み |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [アプリケーション開発環境セットアップ手順書](./operation/app-development-setup.md) | 作成済み |
| [開発スクリプトリファレンス](./operation/develop-script.md) | 作成済み |
| [CI/CD パイプライン設計](./operation/cicd-pipeline.md) | 作成済み |
| [Heroku 開発環境セットアップ](./operation/heroku-dev-setup.md) | 作成済み |

### ADR (`adr/`)

技術的意思決定を記録した Architecture Decision Records です。

| ADR | 決定内容 | ステータス |
| :--- | :--- | :--- |
| [ADR-001](./adr/001-architecture-pattern.md) | アーキテクチャパターン選定（ドメインモデル + ポートとアダプター） | 承認済み |
| [ADR-002](./adr/002-frontend-framework.md) | フロントエンドフレームワーク選定（React SPA） | 承認済み |
| [ADR-003](./adr/003-infrastructure.md) | インフラストラクチャ選定（AWS ECS Fargate） | 承認済み |

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
- [Vim 操作マニュアル](./reference/Vim操作マニュアル.md)
- [運用スクリプト作成ガイド](./reference/運用スクリプト作成ガイド.md)

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
- [リリース完了報告書](./template/リリース完了報告書.md)
- [README](./template/README.md)
- [アプリケーション開発環境セットアップ手順書](./template/アプリケーション開発環境セットアップ手順書.md)
- [開発環境セットアップ手順書](./template/開発環境セットアップ手順書.md)
- [AWS ステージング環境セットアップ手順書](./template/AWSステージング環境セットアップ手順書.md)
- [AWS プロダクション環境セットアップ手順書](./template/AWSプロダクション環境セットアップ手順書.md)
