# データモデル設計 - フレール・メモワール WEB ショップ

## 概念データモデル

```plantuml
@startuml
title 概念データモデル

entity "得意先" as customer
entity "届け先" as destination
entity "受注" as order
entity "商品" as product
entity "商品構成" as composition
entity "単品" as item
entity "仕入先" as supplier
entity "発注" as purchase_order
entity "入荷" as arrival
entity "在庫" as stock

customer "1" -- "0..*" destination : 届け先を持つ
customer "1" -- "0..*" order : 注文する
order "1" -- "1" destination : 届け先を指定する
order "0..*" -- "1" product : 商品を含む
product "1" -- "1..*" composition : 構成される
composition "0..*" -- "1" item : 単品を使用する
item "0..*" -- "1" supplier : 仕入先が決まる
item "1" -- "0..*" purchase_order : 発注される
item "1" -- "0..*" arrival : 入荷する
item "1" -- "0..*" stock : 在庫を持つ
purchase_order "0..*" -- "1" supplier : 仕入先に発注
purchase_order "1" -- "0..1" arrival : 入荷で消込

@enduml
```

## 論理データモデル（ER 図）

```plantuml
@startuml
' hide the spot
hide circle
' avoid problems with angled crows feet
skinparam linetype ortho

entity "得意先 (customers)" as customers {
  * customer_id : SERIAL <<PK>>
  --
  * name : VARCHAR(100)
  * phone : VARCHAR(20)
  * email : VARCHAR(255)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "届け先 (destinations)" as destinations {
  * destination_id : SERIAL <<PK>>
  --
  * customer_id : INTEGER <<FK>>
  * name : VARCHAR(100)
  * address : VARCHAR(255)
  * phone : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "受注 (orders)" as orders {
  * order_id : SERIAL <<PK>>
  --
  * customer_id : INTEGER <<FK>>
  * product_id : INTEGER <<FK>>
  * destination_id : INTEGER <<FK>>
  * delivery_date : DATE
  * shipping_date : DATE
  message : VARCHAR(500)
  * status : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "商品 (products)" as products {
  * product_id : SERIAL <<PK>>
  --
  * name : VARCHAR(100)
  description : TEXT
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "商品構成 (product_compositions)" as compositions {
  * product_id : INTEGER <<PK>> <<FK>>
  * item_id : INTEGER <<PK>> <<FK>>
  --
  * quantity : INTEGER
}

entity "単品 (items)" as items {
  * item_id : SERIAL <<PK>>
  --
  * name : VARCHAR(100)
  * quality_retention_days : INTEGER
  * purchase_unit : INTEGER
  * lead_time_days : INTEGER
  * supplier_id : INTEGER <<FK>>
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "仕入先 (suppliers)" as suppliers {
  * supplier_id : SERIAL <<PK>>
  --
  * name : VARCHAR(100)
  * phone : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "発注 (purchase_orders)" as purchase_orders {
  * purchase_order_id : SERIAL <<PK>>
  --
  * item_id : INTEGER <<FK>>
  * supplier_id : INTEGER <<FK>>
  * quantity : INTEGER
  * order_date : DATE
  * expected_arrival_date : DATE
  * status : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "入荷 (arrivals)" as arrivals {
  * arrival_id : SERIAL <<PK>>
  --
  * item_id : INTEGER <<FK>>
  * purchase_order_id : INTEGER <<FK>>
  * quantity : INTEGER
  * arrival_date : DATE
  created_at : TIMESTAMP
}

entity "在庫 (stocks)" as stocks {
  * stock_id : SERIAL <<PK>>
  --
  * item_id : INTEGER <<FK>>
  * quantity : INTEGER
  * arrival_date : DATE
  * expiry_date : DATE
  * status : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

customers "1" -- "0..*" destinations
customers "1" -- "0..*" orders
orders "0..*" -- "1" products
orders "0..*" -- "1" destinations
products "1" -- "0..*" compositions
compositions "0..*" -- "1" items
items "0..*" -- "1" suppliers
items "1" -- "0..*" purchase_orders
purchase_orders "0..*" -- "1" suppliers
purchase_orders "1" -- "0..1" arrivals
items "1" -- "0..*" arrivals
items "1" -- "0..*" stocks

@enduml
```

## テーブル定義

### 得意先 (customers)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| customer_id | SERIAL | PK | 得意先 ID |
| name | VARCHAR(100) | NOT NULL | 得意先名 |
| phone | VARCHAR(20) | NOT NULL | 電話番号 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 届け先 (destinations)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| destination_id | SERIAL | PK | 届け先 ID |
| customer_id | INTEGER | FK → customers, NOT NULL | 得意先 ID |
| name | VARCHAR(100) | NOT NULL | 届け先名 |
| address | VARCHAR(255) | NOT NULL | 届け先住所 |
| phone | VARCHAR(20) | NOT NULL | 届け先電話番号 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 受注 (orders)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| order_id | SERIAL | PK | 受注 ID |
| customer_id | INTEGER | FK → customers, NOT NULL | 得意先 ID |
| product_id | INTEGER | FK → products, NOT NULL | 商品 ID |
| destination_id | INTEGER | FK → destinations, NOT NULL | 届け先 ID |
| delivery_date | DATE | NOT NULL | 届け日 |
| shipping_date | DATE | NOT NULL | 出荷日（= 届け日の前日） |
| message | VARCHAR(500) | | お届けメッセージ |
| status | VARCHAR(20) | NOT NULL, DEFAULT '注文済み' | 受注状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**ビジネスルール**: `shipping_date = delivery_date - 1 day`

**status 値**: 注文済み / 出荷準備中 / 出荷済み / キャンセル

### 商品 (products)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| product_id | SERIAL | PK | 商品 ID |
| name | VARCHAR(100) | NOT NULL | 商品名（花束名） |
| description | TEXT | | 商品説明 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 商品構成 (product_compositions)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| product_id | INTEGER | PK, FK → products | 商品 ID |
| item_id | INTEGER | PK, FK → items | 単品 ID |
| quantity | INTEGER | NOT NULL, CHECK > 0 | 必要数量 |

### 単品 (items)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| item_id | SERIAL | PK | 単品 ID |
| name | VARCHAR(100) | NOT NULL | 単品名（花の名前） |
| quality_retention_days | INTEGER | NOT NULL, CHECK > 0 | 品質維持可能日数 |
| purchase_unit | INTEGER | NOT NULL, CHECK > 0 | 購入単位数 |
| lead_time_days | INTEGER | NOT NULL, CHECK >= 0 | 発注リードタイム（日数） |
| supplier_id | INTEGER | FK → suppliers, NOT NULL | 仕入先 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 仕入先 (suppliers)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| supplier_id | SERIAL | PK | 仕入先 ID |
| name | VARCHAR(100) | NOT NULL | 仕入先名 |
| phone | VARCHAR(20) | NOT NULL | 電話番号 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 発注 (purchase_orders)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| purchase_order_id | SERIAL | PK | 発注 ID |
| item_id | INTEGER | FK → items, NOT NULL | 単品 ID |
| supplier_id | INTEGER | FK → suppliers, NOT NULL | 仕入先 ID |
| quantity | INTEGER | NOT NULL, CHECK > 0 | 発注数量（購入単位の倍数） |
| order_date | DATE | NOT NULL | 発注日 |
| expected_arrival_date | DATE | NOT NULL | 入荷予定日 |
| status | VARCHAR(20) | NOT NULL, DEFAULT '発注済み' | 発注状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**ビジネスルール**: `expected_arrival_date = order_date + lead_time_days`

**status 値**: 発注済み / 入荷済み

### 入荷 (arrivals)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| arrival_id | SERIAL | PK | 入荷 ID |
| item_id | INTEGER | FK → items, NOT NULL | 単品 ID |
| purchase_order_id | INTEGER | FK → purchase_orders, NOT NULL | 発注 ID |
| quantity | INTEGER | NOT NULL, CHECK > 0 | 入荷数量 |
| arrival_date | DATE | NOT NULL | 入荷日 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

### 在庫 (stocks)

| カラム | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| stock_id | SERIAL | PK | 在庫 ID |
| item_id | INTEGER | FK → items, NOT NULL | 単品 ID |
| quantity | INTEGER | NOT NULL, CHECK > 0 | 数量 |
| arrival_date | DATE | NOT NULL | 入荷日（品質維持期限の起算日） |
| expiry_date | DATE | NOT NULL | 品質維持期限日 |
| status | VARCHAR(20) | NOT NULL, DEFAULT '有効' | 在庫状態 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

**ビジネスルール**: `expiry_date = arrival_date + quality_retention_days`

**status 値**: 有効 / 引当済み / 消費済み / 廃棄対象

## 在庫推移計算

在庫推移はテーブルに持たず、以下のクエリで動的に算出する。

```
日別在庫予定数 = 現在の有効在庫
              + 入荷予定（発注済みの expected_arrival_date ≤ 対象日）
              - 受注引当（注文済みの shipping_date ≤ 対象日）
              - 品質維持日数超過（expiry_date ≤ 対象日）
```

## インデックス設計

| テーブル | インデックス | 理由 |
| :--- | :--- | :--- |
| orders | (customer_id) | 得意先別の受注検索 |
| orders | (delivery_date) | 届け日による検索・出荷一覧 |
| orders | (shipping_date, status) | 出荷日別の出荷対象検索 |
| orders | (status) | 状態別フィルタリング |
| stocks | (item_id, status) | 単品別の有効在庫検索 |
| stocks | (expiry_date) | 品質維持期限による廃棄対象検索 |
| purchase_orders | (status, expected_arrival_date) | 入荷予定の検索 |
| destinations | (customer_id) | 届け先コピー機能 |
