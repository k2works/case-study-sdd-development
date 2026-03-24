# 設計

機能要件・非機能要件の設計ドキュメントです。

## アーキテクチャ設計

- [バックエンドアーキテクチャ](./architecture_backend.md) - Rails モノリシック MVC + ActiveRecord
- [フロントエンドアーキテクチャ](./architecture_frontend.md) - Rails SSR + Hotwire (Turbo/Stimulus)
- [インフラストラクチャ](./architecture_infrastructure.md) - Heroku PaaS

## データ・ドメイン設計

- [データモデル設計](./data-model.md) - 12 テーブルの論理データモデル（ER 図）
- [ドメインモデル設計](./domain-model.md) - 8 集約・11 エンティティのドメインモデル

## UI 設計

- [UI 設計](./ui-design.md) - 22 画面の画面遷移図・画面イメージ

## 非機能要件

- [テスト戦略](./test_strategy.md) - ダイヤモンド型テスト構成
- [非機能要件](./non_functional.md) - 性能・セキュリティ・可用性・保守性
- [運用要件](./operation.md) - 運用フロー・監視・バックアップ・障害対応

## 技術スタック

- [技術スタック選定](./tech_stack.md) - Ruby/Rails/Hotwire/Heroku の技術一覧
