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

### 開発 (`development/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [リリース計画](./development/release_plan.md) | 未着手 |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [アプリケーション開発環境セットアップ手順書](./operation/dev_app_instruction.md) | 未着手 |

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
