# ドメインモデル設計 - フレール・メモワール WEB ショップシステム

## ユビキタス言語

| 日本語 | 英語（コード） | 定義 |
| :--- | :--- | :--- |
| 得意先 | Customer | 花束を注文する個人顧客 |
| 商品（花束） | Product | 販売する花束。単品の組み合わせで構成される |
| 単品（花） | Item | 花束を構成する個々の花材 |
| 商品構成 | Composition | 花束を構成する単品と数量の組み合わせ |
| 仕入先 | Supplier | 単品の供給パートナー。単品ごとに特定 |
| 受注 | Order | 得意先からの花束の注文 |
| 届け先 | DeliveryAddress | 花束の届け先（氏名・住所・電話番号） |
| 届け日 | DeliveryDate | 花束を届ける日。選択範囲はリードタイムに依存 |
| 発注 | PurchaseOrder | 仕入先への花材の発注 |
| 入荷 | Arrival | 仕入先からの花材の入荷実績 |
| 在庫ロット | StockLot | 入荷単位で管理される在庫。品質維持期限を持つ |
| 在庫引当 | Allocation | 受注に対する在庫ロットの確保記録 |
| 出荷 | Shipment | 受注に対する出荷記録 |
| 品質維持日数 | QualityRetentionDays | 入荷日から花材の品質を維持できる日数 |
| 品質維持期限 | ExpiryDate | 入荷日 + 品質維持日数 - 1 で算出される期限日 |
| 在庫推移 | StockForecast | 単品ごとの日別在庫予測（在庫残・出庫予定・入荷予定・廃棄予定） |
| リードタイム | LeadTimeDays | 発注から入荷までの所要日数 |
| 購入単位 | PurchaseUnit | 仕入先への最小発注単位（本） |
| 出荷日 | ShippingDate | 届け日の前日 |

## 集約とクラス図

### 集約の全体像

```plantuml
@startuml

title 集約の全体像

package "商品集約" #E8F5E8 {
  class Product <<集約ルート>>
  class Composition
  class ProductName <<値>>
  class Price <<値>>
}

package "単品集約" #E8F5E8 {
  class Item <<集約ルート>>
  class ItemName <<値>>
  class QualityRetentionDays <<値>>
  class PurchaseUnit <<値>>
  class LeadTimeDays <<値>>
}

package "仕入先集約" #E8F5E8 {
  class Supplier <<集約ルート>>
}

package "得意先集約" #E8F5E8 {
  class Customer <<集約ルート>>
  class DeliveryAddress
}

package "受注集約" #FFE0E0 {
  class Order <<集約ルート>>
  class OrderNumber <<値>>
  class DeliveryDate <<値>>
  class OrderStatus <<値>>
  class Message <<値>>
}

package "在庫ロット集約" #E3F2FD {
  class StockLot <<集約ルート>>
  class ExpiryDate <<値>>
  class StockLotStatus <<値>>
}

package "在庫引当集約" #E3F2FD {
  class Allocation <<集約ルート>>
}

package "発注集約" #FFF3E0 {
  class PurchaseOrder <<集約ルート>>
  class PurchaseOrderStatus <<値>>
}

package "入荷集約" #FFF3E0 {
  class Arrival <<集約ルート>>
}

package "出荷集約" #FFE0E0 {
  class Shipment <<集約ルート>>
}

' 集約間の参照（IDで参照）
Product ..> Item : item_id
Item ..> Supplier : supplier_id
Order ..> Customer : customer_id
Order ..> Product : product_id
Order ..> DeliveryAddress : delivery_address_id
Allocation ..> Order : order_id
Allocation ..> StockLot : stock_lot_id
Allocation ..> Item : item_id
StockLot ..> Item : item_id
StockLot ..> Arrival : arrival_id
PurchaseOrder ..> Item : item_id
PurchaseOrder ..> Supplier : supplier_id
Arrival ..> PurchaseOrder : purchase_order_id
Shipment ..> Order : order_id

@enduml
```

### 商品集約

```plantuml
@startuml

class Product <<集約ルート>> #E8F5E8 {
  - id: int
  - name: ProductName
  - description: str
  - price: Price
  - compositions: list[Composition]
  - is_active: bool
  + add_composition(item_id, quantity)
  + remove_composition(item_id)
  + get_required_items(): dict[item_id, quantity]
  + get_max_lead_time(): int
}

class Composition {
  - product_id: int
  - item_id: int
  - quantity: int
}

class ProductName <<値オブジェクト>> #E3F2FD {
  - value: str
  + {static} of(value): ProductName
  -- 制約 --
  1〜100 文字
}

class Price <<値オブジェクト>> #E3F2FD {
  - value: Decimal
  + {static} of(value): Price
  -- 制約 --
  0 以上の整数
}

Product *-- Composition
Product *-- ProductName
Product *-- Price

@enduml
```

**不変条件**:

- 商品は 1 つ以上の商品構成を持つ
- 同じ単品を重複して構成に含められない
- 価格は 0 以上

### 単品集約

```plantuml
@startuml

class Item <<集約ルート>> #E8F5E8 {
  - id: int
  - name: ItemName
  - quality_retention_days: QualityRetentionDays
  - purchase_unit: PurchaseUnit
  - lead_time_days: LeadTimeDays
  - supplier_id: int
  - is_active: bool
  + calculate_expiry_date(arrival_date): date
}

class ItemName <<値オブジェクト>> #E3F2FD {
  - value: str
  -- 制約 --
  1〜100 文字
}

class QualityRetentionDays <<値オブジェクト>> #E3F2FD {
  - value: int
  + is_near_expiry(arrived_at, current_date): bool
  + calculate_expiry(arrived_at): date
  -- 制約 --
  1 以上の整数
}

class PurchaseUnit <<値オブジェクト>> #E3F2FD {
  - value: int
  -- 制約 --
  1 以上の整数
}

class LeadTimeDays <<値オブジェクト>> #E3F2FD {
  - value: int
  + earliest_delivery_date(order_date): date
  -- 制約 --
  0 以上の整数
}

Item *-- ItemName
Item *-- QualityRetentionDays
Item *-- PurchaseUnit
Item *-- LeadTimeDays

@enduml
```

### 受注集約

```plantuml
@startuml

class Order <<集約ルート>> #FFE0E0 {
  - id: int
  - order_number: OrderNumber
  - customer_id: int
  - product_id: int
  - delivery_address_id: int
  - delivery_date: DeliveryDate
  - message: Message
  - status: OrderStatus
  - ordered_at: datetime
  + change_delivery_date(new_date: DeliveryDate)
  + cancel()
  + start_preparing()
  + ship()
  + shipping_date(): date
  + can_change(): bool
  + can_cancel(): bool
}

class OrderNumber <<値オブジェクト>> #E3F2FD {
  - value: str
  -- 制約 --
  自動採番
}

class DeliveryDate <<値オブジェクト>> #E3F2FD {
  - value: date
  + {static} of(value, earliest, latest): DeliveryDate
  + shipping_date(): date
  + change_deadline(): date
  -- 制約 --
  earliest <= value <= latest
  -- ビジネスルール --
  出荷日 = 届け日 - 1 日
  変更期限 = 届け日 - 3 日
}

class OrderStatus <<値オブジェクト>> #E3F2FD {
  - value: str
  + {static} ACCEPTED
  + {static} PREPARING
  + {static} SHIPPED
  + {static} CANCELLED
  + can_transition_to(next): bool
}

class Message <<値オブジェクト>> #E3F2FD {
  - value: str
  -- 制約 --
  最大 200 文字
}

Order *-- OrderNumber
Order *-- DeliveryDate
Order *-- OrderStatus
Order *-- Message

@enduml
```

**不変条件**:

- ステータス遷移は定義された順序のみ許可（accepted → preparing → shipped、accepted → cancelled）
- 届け日変更は変更期限（届け日の 3 日前）内のみ可能
- キャンセルは変更期限内かつ accepted 状態のみ可能

### 在庫ロット集約

```plantuml
@startuml

class StockLot <<集約ルート>> #E3F2FD {
  - id: int
  - item_id: int
  - arrival_id: int
  - quantity: int
  - remaining_quantity: int
  - arrived_at: date
  - expiry_date: ExpiryDate
  - status: StockLotStatus
  + allocate(qty): int
  + deallocate(qty)
  + is_near_expiry(current_date): bool
  + is_expired(current_date): bool
  + mark_near_expiry()
  + mark_expired()
}

class ExpiryDate <<値オブジェクト>> #E3F2FD {
  - value: date
  + {static} calculate(arrived_at, retention_days): ExpiryDate
  + days_remaining(current_date): int
  + is_near_expiry(current_date): bool
  -- ビジネスルール --
  value = arrived_at + retention_days - 1
  期限間近 = 残り 2 日以内
}

class StockLotStatus <<値オブジェクト>> #E3F2FD {
  + {static} AVAILABLE
  + {static} NEAR_EXPIRY
  + {static} EXPIRED
  + {static} DEPLETED
}

StockLot *-- ExpiryDate
StockLot *-- StockLotStatus

@enduml
```

**不変条件**:

- remaining_quantity >= 0
- remaining_quantity <= quantity
- expired 状態のロットからは引当不可

## ドメインサービス

### 在庫引当サービス（AllocationService）

```plantuml
@startuml

class AllocationService <<ドメインサービス>> #FFF3E0 {
  + allocate(order, compositions, stock_lots): list[Allocation]
  + deallocate(order_id): list[Allocation]
  + reallocate(order, new_delivery_date, compositions, stock_lots): list[Allocation]
}

note right of AllocationService
  在庫引当の FIFO 戦略を実装する。
  品質維持期限の短いロットから優先的に引当。
  単品・日付単位で排他制御される。
end note

@enduml
```

**責務**:

- 受注時: 花束構成を単品レベルに展開し、品質維持期限の短いロットから順に引当
- キャンセル時: 受注に紐づく全引当を解除し、ロットの remaining_quantity を復元
- 届け日変更時: 既存引当を解除→新しい届け日で再引当（同一トランザクション内）

### 在庫推移計算サービス（StockForecastService）

```plantuml
@startuml

class StockForecastService <<ドメインサービス>> #FFF3E0 {
  + calculate(item_id, start_date, end_date): list[DailyForecast]
}

class DailyForecast <<値オブジェクト>> #E3F2FD {
  - date: date
  - item_id: int
  - remaining: int
  - outbound: int
  - inbound: int
  - expiry: int
}

StockForecastService ..> DailyForecast : 生成

note right of StockForecastService
  単品ごとの日別在庫推移を計算する。
  在庫残 = 前日繰越 + 当日入荷 - 当日出庫 - 当日廃棄
  受注・入荷登録時にイベント駆動で即時更新。
end note

@enduml
```

### 届け日計算サービス（DeliveryDateService）

```plantuml
@startuml

class DeliveryDateService <<ドメインサービス>> #FFF3E0 {
  + available_dates(product, order_date): DateRange
  + can_change(order, new_date, current_date): bool
}

note right of DeliveryDateService
  商品の構成単品のうち最長のリードタイムから
  最短届け日を算出する。
  最短 = order_date + max_lead_time
  最長 = order_date + 30 日
end note

@enduml
```

## リポジトリインターフェース

```plantuml
@startuml

interface ProductRepository {
  + find_by_id(id): Product
  + find_active(): list[Product]
  + save(product)
}

interface ItemRepository {
  + find_by_id(id): Item
  + find_active(): list[Item]
  + save(item)
}

interface OrderRepository {
  + find_by_id(id): Order
  + find_by_customer(customer_id): list[Order]
  + find_by_status(status): list[Order]
  + find_by_delivery_date(date): list[Order]
  + save(order)
  + next_order_number(): OrderNumber
}

interface StockLotRepository {
  + find_by_item_available(item_id): list[StockLot]
  + find_near_expiry(): list[StockLot]
  + find_by_item_for_update(item_id): list[StockLot]
  + save(stock_lot)
}

interface AllocationRepository {
  + find_by_order(order_id): list[Allocation]
  + save(allocation)
  + delete_by_order(order_id)
}

interface PurchaseOrderRepository {
  + find_by_id(id): PurchaseOrder
  + find_by_status(status): list[PurchaseOrder]
  + save(purchase_order)
}

@enduml
```

## 集約間の連携とトランザクション境界

```plantuml
@startuml

title 受注時のドメインオブジェクト連携

participant "OrderService\n（アプリケーション層）" as app
participant "Order\n（受注集約）" as order
participant "Product\n（商品集約）" as product
participant "AllocationService\n（ドメインサービス）" as alloc
participant "StockLot\n（在庫ロット集約）" as lot

app -> app : BEGIN TRANSACTION
app -> product : get_required_items()
product --> app : {item_id: quantity}
app -> order : Order.create(...)
app -> alloc : allocate(order, compositions, stock_lots)
alloc -> lot : find_by_item_for_update(item_id)\n（SELECT FOR UPDATE）
alloc -> lot : allocate(quantity)
lot --> alloc : allocated_qty
alloc --> app : list[Allocation]
app -> app : save(order, allocations)
app -> app : COMMIT
app -> app : send_confirmation_email()

@enduml
```

## Django App とドメインモデルの対応

| Django App | 集約 | ドメインサービス |
| :--- | :--- | :--- |
| products | Product, Item, Supplier | - |
| orders | Order | DeliveryDateService |
| inventory | StockLot, Allocation | AllocationService, StockForecastService |
| purchasing | PurchaseOrder, Arrival | - |
| shipping | Shipment | - |
| customers | Customer, DeliveryAddress | - |
