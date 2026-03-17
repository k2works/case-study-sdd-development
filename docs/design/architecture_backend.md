# バックエンドアーキテクチャ - フレール・メモワール WEB ショップ

## アーキテクチャ選定

### 判断フロー

```plantuml
@startuml
start

if (業務領域のカテゴリー) then (中核の業務領域)
  note right
    受注管理・在庫管理は
    競争優位性に直結する中核業務
  end note
  if (金額を扱う/分析/監査記録が必要か?) then (いいえ)
    note right
      決済はクレジットカード事前登録済み
      監査記録は不要
    end note
    #lightgreen:ドメインモデルパターン;
    :ピラミッド形のテスト;
    if (永続化モデルは複数か?) then (いいえ)
      note right
        単一の RDB で十分
      end note
      #lightgreen:ポートとアダプター（ヘキサゴナル）;
    else (はい)
    endif
  else (はい)
  endif
else (補完、一般との連携)
endif

stop
@enduml
```

### 選定結果

| 項目 | 選定 | 理由 |
| :--- | :--- | :--- |
| ビジネスロジックパターン | **ドメインモデル** | 在庫推移計算・品質維持日数・購入単位制約などのビジネスルールが中程度に複雑 |
| アーキテクチャスタイル | **ポートとアダプター（ヘキサゴナル）** | 永続化モデルは単一。ドメインロジックを外部依存から分離し、テスト容易性を確保 |
| テスト戦略 | **ピラミッド形** | ドメインモデルのユニットテストを中心に、統合テスト・E2E テストで補完 |
| API 設計 | **REST API** | シンプルな CRUD + 在庫推移照会。GraphQL や gRPC は過剰 |

## アーキテクチャ構造

```plantuml
@startuml
package "プレゼンテーション層" {
  [REST コントローラー] as controller
}

package "アプリケーション層" {
  [受注ユースケース] as order_uc
  [在庫ユースケース] as stock_uc
  [仕入ユースケース] as purchase_uc
  [出荷ユースケース] as shipping_uc
  [商品ユースケース] as product_uc
}

package "ドメイン層" {
  [受注] as order
  [在庫] as stock
  [商品] as product
  [単品] as item
  [得意先] as customer
  [発注] as purchase_order
}

package "インフラストラクチャ層" {
  [リポジトリ実装] as repo
  database "データベース" as db
}

controller --> order_uc
controller --> stock_uc
controller --> purchase_uc
controller --> shipping_uc
controller --> product_uc

order_uc --> order
order_uc --> stock
stock_uc --> stock
stock_uc --> item
purchase_uc --> purchase_order
purchase_uc --> item
shipping_uc --> order
product_uc --> product
product_uc --> item

order_uc --> repo
stock_uc --> repo
purchase_uc --> repo
shipping_uc --> repo
product_uc --> repo
repo --> db

@enduml
```

## レイヤー責務

| レイヤー | 責務 | 主要コンポーネント |
| :--- | :--- | :--- |
| プレゼンテーション | HTTP リクエスト/レスポンス、入力検証 | REST コントローラー |
| アプリケーション | ユースケース制御、トランザクション境界 | 各ユースケースサービス |
| ドメイン | ビジネスルール、不変条件 | エンティティ、値オブジェクト、ドメインサービス |
| インフラストラクチャ | データ永続化、外部連携 | リポジトリ実装 |

## ポートとアダプター

```plantuml
@startuml
hexagon "ドメイン\nモデル" as domain

interface "入力ポート\n(ユースケース)" as inport
interface "出力ポート\n(リポジトリIF)" as outport

[REST コントローラー] as web

[DB リポジトリ] as db_adapter

web --> inport
inport --> domain
domain --> outport
outport <|-- db_adapter

@enduml
```

## API 設計方針

| リソース | メソッド | パス | UC |
| :--- | :--- | :--- | :--- |
| 商品 | GET | /api/products | UC10 |
| 商品 | POST | /api/products | UC10 |
| 商品 | PUT | /api/products/{id} | UC10 |
| 単品 | GET | /api/items | UC11 |
| 単品 | POST | /api/items | UC11 |
| 単品 | PUT | /api/items/{id} | UC11 |
| 受注 | GET | /api/orders | UC04 |
| 受注 | POST | /api/orders | UC01 |
| 受注 | PUT | /api/orders/{id}/delivery-date | UC03 |
| 届け先 | GET | /api/customers/{id}/destinations | UC02 |
| 在庫推移 | GET | /api/stock/forecast | UC05 |
| 発注 | POST | /api/purchase-orders | UC06 |
| 入荷 | POST | /api/arrivals | UC07 |
| 出荷 | GET | /api/shipments?date={date} | UC08 |
| 出荷 | POST | /api/shipments | UC09 |
| 得意先 | GET | /api/customers | - |
| 得意先 | POST | /api/customers | - |
