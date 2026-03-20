# プロジェクトドキュメント

プロジェクトのドキュメントです。

## まずこれを読もうリスト

- [ビジネスアーキテクチャ](./analysis/business_architecture.md) - ビジネス構造を定義。設計の基盤。
- [インセプションデッキ](./analysis/inception_deck.md) - プロジェクトの全体像と方向性を共有。
- [要件定義書（RDRA 2.0）](./requirements/requirements_definition.md) - システム価値から内部構造までの要件を整理。

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

### 設計 (`design/`)

| ドキュメント | 状態 |
| :--- | :--- |
| [バックエンドアーキテクチャ](./design/architecture_backend.md) | 作成済み |
| [フロントエンドアーキテクチャ](./design/architecture_frontend.md) | 作成済み |
| [インフラストラクチャアーキテクチャ](./design/architecture_infrastructure.md) | 作成済み |
| [データモデル設計](./design/data-model.md) | 作成済み |
| [ドメインモデル設計](./design/domain-model.md) | 作成済み |
| [UI 設計](./design/ui_design.md) | 作成済み |

### 開発 (`development/`)

| ドキュメント | 状態 |
| :--- | :--- |
| 現在の開発ドキュメント | `index.md` のみ |

### 運用 (`operation/`)

| ドキュメント | 状態 |
| :--- | :--- |
| 現在の運用ドキュメント | `index.md` のみ |

### ADR (`adr/`)

技術的意思決定を記録した Architecture Decision Records です。

| ドキュメント | 状態 |
| :--- | :--- |
| [ADR 一覧](./adr/index.md) | 作成済み |
| [ADR-001](./adr/001-backend-modular-monolith.md) | 作成済み |
| [ADR-002](./adr/002-stock-projection-cqrs-boundary.md) | 作成済み |
| [ADR-003](./adr/003-single-nextjs-application.md) | 作成済み |
| [ADR-004](./adr/004-container-platform-and-managed-postgresql.md) | 作成済み |

### レビュー (`review/`)

分析・設計成果物に対するレビュー記録です。

| ドキュメント | 状態 |
| :--- | :--- |
| [分析成果物レビュー](./review/analysis_artifacts_review_20260320.md) | 作成済み |
| [分析ドキュメントレビュー](./review/analysis_docs_review_20260320.md) | 作成済み |
| [分析ドキュメントレビュー（xp-tester）](./review/analysis_docs_review_20260320_xp_tester.md) | 作成済み |

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
- [運用スクリプト作成ガイド](./reference/運用スクリプト作成ガイド.md)
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

### テンプレート (`template/`)

ドキュメント作成用のテンプレートです。

- [まずこれを読もうリスト](./template/まずこれを読もうリスト.md)
- [アプリケーション開発環境セットアップ手順書](./template/アプリケーション開発環境セットアップ手順書.md)
- [開発環境セットアップ手順書](./template/開発環境セットアップ手順書.md)
- [AWS ステージング環境セットアップ手順書](./template/AWSステージング環境セットアップ手順書.md)
- [AWS プロダクション環境セットアップ手順書](./template/AWSプロダクション環境セットアップ手順書.md)
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
