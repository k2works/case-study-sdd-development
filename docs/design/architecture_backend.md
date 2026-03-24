# バックエンドアーキテクチャ設計 - フレール・メモワール WEB ショップシステム

## アーキテクチャパターン選定

### 業務領域の分析

| 分析項目 | 判定 | 根拠 |
|:---|:---|:---|
| 業務領域カテゴリ | 中核の業務領域 | 受注管理・在庫管理は競争優位性に直結する |
| データ構造の複雑さ | 複雑 | 10 以上のエンティティ、品質維持日数を考慮した在庫推移計算、状態遷移管理 |
| 金額を扱うか | いいえ | 決済処理はスコープ外（クレジットカード事前登録済み） |
| 監査記録が必要か | いいえ | コンプライアンス要件なし |

### 選定結果

**ビジネスロジックパターン**: ドメインモデルパターン

**アーキテクチャスタイル**: ポートとアダプター（ヘキサゴナルアーキテクチャ）

**テスト戦略**: ピラミッド形テスト

### 選定理由

1. **ドメインモデルパターン**: 在庫推移計算・品質維持日数管理・受注状態遷移など、複雑なビジネスルールをドメイン層に集約できる
2. **ポートとアダプター**: ドメインロジックを外部技術（DB、Web フレームワーク）から独立させ、テスト容易性と将来の技術変更への柔軟性を確保する
3. **永続化モデルは単一**: RDB 1 つで十分なため、CQRS は不要。過剰な複雑さを避ける

## レイヤー構造

```plantuml
@startuml

title バックエンドアーキテクチャ - ポートとアダプター

package "プレゼンテーション（入力アダプター）" {
  [REST API Controller] as controller
  [認証フィルター] as auth_filter
}

package "アプリケーション層" {
  [受注ユースケース] as order_uc
  [在庫推移ユースケース] as stock_uc
  [発注ユースケース] as purchase_uc
  [商品管理ユースケース] as product_uc
  [出荷ユースケース] as shipping_uc
  [認証ユースケース] as auth_uc
}

package "ドメイン層" {
  [受注] as order_domain
  [在庫] as stock_domain
  [商品] as product_domain
  [単品] as item_domain
  [発注] as purchase_domain
  [得意先] as customer_domain
}

package "ドメインサービス" {
  [在庫推移計算サービス] as stock_calc
  [受注ステータス管理サービス] as order_status
}

package "出力ポート（インターフェース）" {
  interface "受注リポジトリ" as order_repo_if
  interface "在庫リポジトリ" as stock_repo_if
  interface "商品リポジトリ" as product_repo_if
  interface "発注リポジトリ" as purchase_repo_if
  interface "得意先リポジトリ" as customer_repo_if
}

package "インフラストラクチャ（出力アダプター）" {
  [JPA 受注リポジトリ] as order_repo_impl
  [JPA 在庫リポジトリ] as stock_repo_impl
  [JPA 商品リポジトリ] as product_repo_impl
  [JPA 発注リポジトリ] as purchase_repo_impl
  [JPA 得意先リポジトリ] as customer_repo_impl
  database "PostgreSQL" as db
}

auth_filter --> controller
controller --> order_uc
controller --> stock_uc
controller --> purchase_uc
controller --> product_uc
controller --> shipping_uc
controller --> auth_uc

order_uc --> order_domain
order_uc --> order_repo_if
stock_uc --> stock_domain
stock_uc --> stock_repo_if
stock_uc --> stock_calc
purchase_uc --> purchase_domain
purchase_uc --> purchase_repo_if
product_uc --> product_domain
product_uc --> product_repo_if
shipping_uc --> order_domain
auth_uc --> customer_domain
auth_uc --> customer_repo_if

stock_calc --> stock_domain
stock_calc --> item_domain
order_status --> order_domain

order_repo_if <|.. order_repo_impl
stock_repo_if <|.. stock_repo_impl
product_repo_if <|.. product_repo_impl
purchase_repo_if <|.. purchase_repo_impl
customer_repo_if <|.. customer_repo_impl

order_repo_impl --> db
stock_repo_impl --> db
product_repo_impl --> db
purchase_repo_impl --> db
customer_repo_impl --> db

@enduml
```

## レイヤー責務

| レイヤー | 責務 | 依存方向 |
|:---|:---|:---|
| プレゼンテーション | HTTP リクエスト/レスポンス変換、入力バリデーション、認証フィルター | → アプリケーション層 |
| アプリケーション | ユースケース制御、トランザクション境界、DTO 変換 | → ドメイン層 |
| ドメイン | ビジネスルール、不変条件、ドメインサービス、エンティティ、値オブジェクト | 依存なし（中心） |
| インフラストラクチャ | DB アクセス、外部 API 連携、技術的関心事 | → ドメイン層（ポート実装） |

**依存関係の方向**: 外側 → 内側（ドメイン層に向かう単方向依存）

## API 設計方針

### REST API

| 項目 | 方針 |
|:---|:---|
| プロトコル | REST over HTTPS |
| データ形式 | JSON |
| 認証方式 | JWT（Bearer Token） |
| バージョニング | URL パスベース（`/api/v1/`） |
| エラーレスポンス | RFC 7807 Problem Details |
| ページネーション | オフセットベース（`?page=1&size=20`） |

### 主要エンドポイント

| メソッド | パス | UC | 説明 |
|:---|:---|:---|:---|
| POST | `/api/v1/auth/login` | UC-013 | ログイン |
| POST | `/api/v1/auth/register` | UC-013 | 新規登録 |
| GET | `/api/v1/products` | UC-001 | 商品一覧 |
| GET | `/api/v1/products/{id}` | UC-001 | 商品詳細 |
| POST | `/api/v1/orders` | UC-001 | 注文作成 |
| GET | `/api/v1/orders` | UC-003 | 受注一覧 |
| PUT | `/api/v1/orders/{id}/accept` | UC-003 | 受注受付 |
| PUT | `/api/v1/orders/{id}/cancel` | UC-003 | 注文キャンセル |
| PUT | `/api/v1/orders/{id}/delivery-date` | UC-002 | 届け日変更 |
| GET | `/api/v1/inventory/transitions` | UC-004 | 在庫推移 |
| POST | `/api/v1/purchase-orders` | UC-005 | 発注作成 |
| POST | `/api/v1/purchase-orders/{id}/arrivals` | UC-006 | 入荷登録 |
| GET | `/api/v1/bundling/targets` | UC-007 | 結束対象一覧 |
| PUT | `/api/v1/orders/{id}/bundle` | UC-007 | 結束完了 |
| PUT | `/api/v1/orders/{id}/ship` | UC-008 | 出荷処理 |
| POST | `/api/v1/products` | UC-009 | 商品登録 |
| POST | `/api/v1/items` | UC-010 | 単品登録 |

## テスト戦略

### ピラミッド形テスト

```plantuml
@startuml

rectangle "E2E テスト（少数）\nAPI 統合テスト" as e2e #lightcoral
rectangle "統合テスト（中程度）\nリポジトリ + DB テスト" as integration #orange
rectangle "ユニットテスト（多数）\nドメインモデル・サービステスト" as unit #lightgreen

unit -up-> integration
integration -up-> e2e

@enduml
```

| テスト種別 | 比率 | 対象 |
|:---|:---|:---|
| ユニットテスト | 70% | ドメインモデル、ドメインサービス、値オブジェクト |
| 統合テスト | 20% | リポジトリ実装、ユースケース + DB |
| E2E テスト | 10% | API エンドポイント統合テスト |

## 横断的関心事

| 関心事 | 方針 |
|:---|:---|
| 認証・認可 | JWT + ロールベースアクセス制御（RBAC） |
| ロギング | 構造化ログ（JSON 形式）、リクエスト ID によるトレーサビリティ |
| エラーハンドリング | ドメイン例外→アプリケーション例外→HTTP レスポンスの変換チェーン |
| トランザクション | アプリケーション層でユースケース単位に管理 |
| バリデーション | プレゼンテーション層で入力バリデーション、ドメイン層で業務バリデーション |

---

## 記入履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-03-20 | 初版作成 |
