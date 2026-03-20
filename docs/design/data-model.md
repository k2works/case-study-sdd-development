# データモデル設計

## 1. 文書の目的

本書は、フラワーショップ「フレール・メモワール」の WEB ショップシステムにおける永続化構造を定義するものです。

バックエンドアーキテクチャで定義した `catalog`、`orders`、`customers`、`stock`、`purchasing`、`shipping` の各モジュールを、リレーショナルデータベース上でどのように表現するかを整理します。

## 2. 設計方針

### 2.1 基本方針

- 正本データは PostgreSQL に集約します
- 業務トランザクション系テーブルは第 3 正規形を基本とします
- 在庫推移のような読み取り最適化データは projection として分離します
- 主キーは UUID などのサロゲートキーを基本とし、業務上の識別子は unique 制約で保護します
- 変更履歴が重要な業務は履歴テーブルを持ち、現在値だけで上書きしません

### 2.2 データモデルで重視すること

- 注文、届け日変更、発注、入荷、出荷の整合性を保てること
- 花束構成から必要花材を展開できること
- 顧客の届け先再利用を支援できること
- 在庫 projection を日別・単品別に保持できること

## 3. 概念データモデル

### 3.1 エンティティ一覧

| エンティティ | 説明 |
| :--- | :--- |
| 得意先 | 個人顧客。注文主体 |
| 届け先 | 顧客が再利用する配送先テンプレート |
| 商品 | 事前定義された花束商品 |
| 商品構成 | 商品に含まれる単品と必要数量 |
| 単品 | 花材の管理単位 |
| 仕入先 | 単品を供給する取引先 |
| 受注 | 顧客の注文 |
| 届け日変更履歴 | 届け日変更の判定・確定履歴 |
| 発注 | 仕入先への発注 |
| 発注明細 | 発注内の単品別明細 |
| 入荷 | 納品受け入れ |
| 入荷明細 | 入荷内の単品別実績 |
| 出荷 | 出荷日ごとの受注出荷情報 |
| 在庫推移 | 単品・日付単位の予定在庫 |

### 3.2 概念 ER 図

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity "得意先" as customer
entity "届け先" as destination
entity "商品" as product
entity "商品構成" as product_item
entity "単品" as item
entity "仕入先" as supplier
entity "受注" as order
entity "届け日変更履歴" as order_date_change
entity "発注" as purchase_order
entity "発注明細" as purchase_order_line
entity "入荷" as arrival
entity "入荷明細" as arrival_line
entity "出荷" as shipment
entity "在庫推移" as stock_projection

customer ||--o{ destination
customer ||--o{ order
product ||--o{ order
product ||--o{ product_item
item ||--o{ product_item
supplier ||--o{ item
order ||--o{ order_date_change
purchase_order ||--o{ purchase_order_line
supplier ||--o{ purchase_order
item ||--o{ purchase_order_line
purchase_order ||--o{ arrival
arrival ||--o{ arrival_line
purchase_order_line ||--o{ arrival_line
order ||--|| shipment
item ||--o{ stock_projection

@enduml
```

## 4. 論理データモデル

### 4.1 論理 ER 図

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity "customers" as customers {
  * id : uuid <<PK>>
  --
  email : varchar(255) <<UK>>
  last_name : varchar(80)
  first_name : varchar(80)
  phone_number : varchar(32)
  status : varchar(30)
  created_at : timestamptz
  updated_at : timestamptz
}

entity "customer_destinations" as customer_destinations {
  * id : uuid <<PK>>
  --
  customer_id : uuid <<FK>>
  recipient_name : varchar(120)
  postal_code : varchar(20)
  prefecture : varchar(40)
  city : varchar(120)
  address_line1 : varchar(255)
  address_line2 : varchar(255)?
  phone_number : varchar(32)?
  is_default : boolean
  last_used_at : timestamptz?
  created_at : timestamptz
  updated_at : timestamptz
}

entity "suppliers" as suppliers {
  * id : uuid <<PK>>
  --
  supplier_code : varchar(50) <<UK>>
  name : varchar(120)
  email : varchar(255)?
  phone_number : varchar(32)?
  lead_time_days : integer
  status : varchar(30)
  created_at : timestamptz
  updated_at : timestamptz
}

entity "items" as items {
  * id : uuid <<PK>>
  --
  item_code : varchar(50) <<UK>>
  supplier_id : uuid <<FK>>
  name : varchar(120)
  unit_name : varchar(30)
  purchase_unit_quantity : integer
  shelf_life_days : integer
  default_lead_time_days : integer
  status : varchar(30)
  created_at : timestamptz
  updated_at : timestamptz
}

entity "products" as products {
  * id : uuid <<PK>>
  --
  product_code : varchar(50) <<UK>>
  name : varchar(120)
  description : text?
  unit_price : numeric(12,2)
  is_active : boolean
  created_at : timestamptz
  updated_at : timestamptz
}

entity "product_components" as product_components {
  * id : uuid <<PK>>
  --
  product_id : uuid <<FK>>
  item_id : uuid <<FK>>
  quantity : integer
  created_at : timestamptz
  updated_at : timestamptz
}

entity "orders" as orders {
  * id : uuid <<PK>>
  --
  order_number : varchar(50) <<UK>>
  customer_id : uuid <<FK>>
  source_destination_id : uuid <<FK>>?
  product_id : uuid <<FK>>
  order_status : varchar(30)
  ordered_at : timestamptz
  delivery_date : date
  shipment_date : date
  recipient_name : varchar(120)
  postal_code : varchar(20)
  prefecture : varchar(40)
  city : varchar(120)
  address_line1 : varchar(255)
  address_line2 : varchar(255)?
  destination_phone_number : varchar(32)?
  message_card_text : varchar(500)?
  total_amount : numeric(12,2)
  created_at : timestamptz
  updated_at : timestamptz
}

entity "order_date_changes" as order_date_changes {
  * id : uuid <<PK>>
  --
  order_id : uuid <<FK>>
  requested_by_role : varchar(30)
  previous_delivery_date : date
  requested_delivery_date : date
  previous_shipment_date : date
  requested_shipment_date : date
  change_status : varchar(30)
  rejection_reason : varchar(255)?
  checked_at : timestamptz
  confirmed_at : timestamptz?
  created_at : timestamptz
}

entity "purchase_orders" as purchase_orders {
  * id : uuid <<PK>>
  --
  purchase_order_number : varchar(50) <<UK>>
  supplier_id : uuid <<FK>>
  ordered_by : varchar(120)
  order_status : varchar(30)
  ordered_at : timestamptz
  expected_arrival_date : date
  created_at : timestamptz
  updated_at : timestamptz
}

entity "purchase_order_lines" as purchase_order_lines {
  * id : uuid <<PK>>
  --
  purchase_order_id : uuid <<FK>>
  item_id : uuid <<FK>>
  line_no : integer
  ordered_quantity : integer
  received_quantity : integer
  unit_cost : numeric(12,2)?
  line_status : varchar(30)
  created_at : timestamptz
  updated_at : timestamptz
}

entity "arrivals" as arrivals {
  * id : uuid <<PK>>
  --
  purchase_order_id : uuid <<FK>>
  arrival_number : varchar(50) <<UK>>
  arrived_at : timestamptz
  received_by : varchar(120)
  created_at : timestamptz
}

entity "arrival_lines" as arrival_lines {
  * id : uuid <<PK>>
  --
  arrival_id : uuid <<FK>>
  purchase_order_line_id : uuid <<FK>>
  received_quantity : integer
  quality_status : varchar(30)
  created_at : timestamptz
}

entity "shipments" as shipments {
  * id : uuid <<PK>>
  --
  order_id : uuid <<FK>>
  shipment_number : varchar(50) <<UK>>
  shipment_status : varchar(30)
  ship_date : date
  shipped_at : timestamptz?
  prepared_by : varchar(120)?
  created_at : timestamptz
  updated_at : timestamptz
}

entity "stock_projections" as stock_projections {
  * id : uuid <<PK>>
  --
  item_id : uuid <<FK>>
  projection_date : date
  opening_quantity : integer
  inbound_quantity : integer
  reserved_quantity : integer
  available_quantity : integer
  waste_risk_quantity : integer
  last_recalculated_at : timestamptz
}

customers ||--o{ customer_destinations
customers ||--o{ orders
customer_destinations ||--o{ orders
products ||--o{ orders
products ||--o{ product_components
items ||--o{ product_components
suppliers ||--o{ items
orders ||--o{ order_date_changes
suppliers ||--o{ purchase_orders
purchase_orders ||--o{ purchase_order_lines
items ||--o{ purchase_order_lines
purchase_orders ||--o{ arrivals
arrivals ||--o{ arrival_lines
purchase_order_lines ||--o{ arrival_lines
orders ||--|| shipments
items ||--o{ stock_projections

@enduml
```

## 5. テーブル定義

### 5.1 マスタ系

| テーブル | 用途 | 主な制約 |
| :--- | :--- | :--- |
| `customers` | 顧客の基本情報 | `email` unique |
| `customer_destinations` | 顧客ごとの届け先履歴 | `customer_id` FK |
| `suppliers` | 仕入先マスタ | `supplier_code` unique |
| `items` | 花材の単品マスタ | `item_code` unique、`supplier_id` FK |
| `products` | 花束商品マスタ | `product_code` unique |
| `product_components` | 商品と単品の構成表 | `product_id + item_id` unique 推奨 |

### 5.2 取引系

| テーブル | 用途 | 主な制約 |
| :--- | :--- | :--- |
| `orders` | 注文の正本 | `order_number` unique、`customer_id` / `product_id` FK、`source_destination_id` optional FK |
| `order_date_changes` | 届け日変更の判定履歴と確定履歴 | `order_id` FK |
| `purchase_orders` | 発注ヘッダ | `purchase_order_number` unique、`supplier_id` FK |
| `purchase_order_lines` | 発注明細 | `purchase_order_id + line_no` unique 推奨 |
| `arrivals` | 入荷ヘッダ | `arrival_number` unique、`purchase_order_id` FK |
| `arrival_lines` | 入荷明細 | `arrival_id` / `purchase_order_line_id` FK |
| `shipments` | 出荷情報 | `order_id` unique、`shipment_number` unique |

### 5.3 読み取り最適化系

| テーブル | 用途 | 主な制約 |
| :--- | :--- | :--- |
| `stock_projections` | 単品・日付単位の予定在庫と廃棄リスク | `item_id + projection_date` unique |

## 6. 主なリレーションシップの意図

### 6.1 顧客と届け先

- 顧客は複数の届け先を持てます
- 注文は配送事故防止のため届け先スナップショットを保持します
- `source_destination_id` は再利用元の履歴参照であり、配送先の正本ではありません
- 届け先の再利用は `customer_destinations` から行います

### 6.2 商品と単品

- 商品は花束、単品は花材です
- `product_components` により、1 商品が複数単品で構成される関係を表現します
- 1 受注 1 商品の制約は `orders.product_id` により表現します

### 6.3 発注と入荷

- 発注はヘッダ / 明細に分けます
- 入荷もヘッダ / 明細に分け、部分入荷に対応します
- `purchase_order_lines.received_quantity` は集計しやすさのために保持します
- `suppliers` は `purchasing` コンテキストが所有し、`items` は仕入判断に必要な仕入先参照を持ちます

### 6.4 出荷

- 本システムでは 1 受注 1 出荷を前提とするため、`shipments.order_id` は unique とします
- 出荷一覧は `shipments` と `orders`、必要に応じて `products` を結合して作成します

### 6.5 在庫 projection

- `stock_projections` は正本ではなく query 用 projection です
- 注文、届け日変更、発注、入荷、出荷確定をトリガーに再計算します
- 初期段階では同期更新を前提とし、`item_id + projection_date` の一意キー単位で更新競合を直列化します
- 性能課題が出た段階で非同期化を検討します

## 7. 正規化と非正規化の判断

### 7.1 第 3 正規形を適用する対象

- 顧客、届け先、商品、単品、仕入先
- 受注、発注、入荷、出荷の正本データ

### 7.2 意図的に非正規化する対象

- `stock_projections`
  - 日別在庫推移を高速に参照するための projection です
  - `opening_quantity`、`inbound_quantity`、`reserved_quantity`、`available_quantity` を保持します
- `purchase_order_lines.received_quantity`
  - 入荷明細から導出可能ですが、状態判定と一覧表示を簡潔にするため保持します

## 8. 代表的な整合ルール

- `orders.shipment_date` は必ず `delivery_date` の前日とします
- `product_components.quantity` は 1 以上とします
- `items.purchase_unit_quantity` は 1 以上とします
- `purchase_order_lines.ordered_quantity`、`arrival_lines.received_quantity` は 0 より大きい整数とします
- `stock_projections.available_quantity` は `opening_quantity + inbound_quantity - reserved_quantity` を基本式とします

## 9. 段階的実装方針

1. `products`、`product_components`、`items`、`orders`、`stock_projections` を先に作成する
2. 次に `purchase_orders`、`purchase_order_lines`、`arrivals`、`arrival_lines` を追加する
3. その後 `shipments`、`customer_destinations`、`order_date_changes` を強化する
4. 性能要件が明確になった段階で `stock_projections` の更新方式を見直す

## 10. ドメインモデルとの整合ポイント

- `Order` 集約は `orders` を中心に、届け日変更履歴を `order_date_changes` で支えます
- `orders` は `customer_destinations` の再利用元を参照できる一方、配送先の正本はスナップショット列に保持します
- `Product` 集約は `products` と `product_components` に対応します
- `PurchaseOrder` 集約は `purchase_orders` と `purchase_order_lines` に対応します
- `StockProjection` は集約というより query model として扱います

## 11. TBD

- 顧客認証を導入する場合の認証情報テーブル分離
- 在庫 projection をテーブルで持つか materialized view で持つか
- 花材のロット管理を行うかどうか
- 仕入単価履歴を別テーブルで持つかどうか
