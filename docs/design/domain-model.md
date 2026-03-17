# ドメインモデル設計 - フレール・メモワール WEB ショップ

## ユビキタス言語

| 用語 | 定義 |
| :--- | :--- |
| 得意先 | 花束を注文する個人顧客 |
| 届け先 | 花束の届け先（住所・電話番号） |
| 受注 | 得意先からの注文。1 受注 = 1 届け先 = 1 商品 |
| 届け日 | 花束を届ける日 |
| 出荷日 | 花束を出荷する日（= 届け日の前日） |
| 商品 | 事前定義された花束の組合せ |
| 商品構成 | 商品を構成する単品と数量 |
| 単品 | 個別の花。品質維持可能日数・購入単位・リードタイムを持つ |
| 品質維持可能日数 | 入荷日から花が使用可能な日数 |
| 購入単位 | 仕入先への発注時の最小単位 |
| 発注リードタイム | 発注から入荷までの日数 |
| 仕入先 | 単品を供給するパートナー。単品ごとに特定 |
| 発注 | 仕入先への単品の発注 |
| 入荷 | 仕入先から届いた単品の受け入れ |
| 在庫 | 入荷した単品のロット。品質維持期限を持つ |
| 在庫推移 | 日別の在庫予定数（動的算出） |
| 結束 | 花材から花束を組み立てる作業 |
| 引当 | 受注に対して在庫を確保すること |

## 集約設計

```plantuml
@startuml
title 集約とその境界

package "得意先集約" as agg_customer #E8F5E8 {
  class 得意先 <<集約ルート>> {
    - customerId: CustomerId
    - name: CustomerName
    - phone: Phone
    - email: Email
    + addDestination(destination)
    + getDestinations()
  }
  class 届け先 <<エンティティ>> {
    - destinationId: DestinationId
    - name: String
    - address: Address
    - phone: Phone
  }
  得意先 "1" *-- "0..*" 届け先
}

package "商品集約" as agg_product #E3F2FD {
  class 商品 <<集約ルート>> {
    - productId: ProductId
    - name: ProductName
    + addComposition(item, quantity)
    + getCompositions()
  }
  class 商品構成 <<値オブジェクト>> {
    - itemId: ItemId
    - quantity: Quantity
  }
  商品 "1" *-- "1..*" 商品構成
}

package "単品集約" as agg_item #FFF3E0 {
  class 単品 <<集約ルート>> {
    - itemId: ItemId
    - name: ItemName
    - qualityRetentionDays: Days
    - purchaseUnit: PurchaseUnit
    - leadTimeDays: Days
    - supplierId: SupplierId
  }
}

package "受注集約" as agg_order #FFE0E0 {
  class 受注 <<集約ルート>> {
    - orderId: OrderId
    - customerId: CustomerId
    - productId: ProductId
    - destination: 届け先スナップショット
    - deliveryDate: DeliveryDate
    - shippingDate: ShippingDate
    - message: Message
    - status: OrderStatus
    + changeDeliveryDate(newDate)
    + ship()
    + cancel()
  }
}

package "発注集約" as agg_purchase {
  class 発注 <<集約ルート>> {
    - purchaseOrderId: PurchaseOrderId
    - itemId: ItemId
    - supplierId: SupplierId
    - quantity: Quantity
    - orderDate: Date
    - expectedArrivalDate: Date
    - status: PurchaseOrderStatus
    + receive(arrivalQuantity, arrivalDate)
  }
}

package "在庫集約" as agg_stock #F3E5F5 {
  class 在庫ロット <<集約ルート>> {
    - stockId: StockId
    - itemId: ItemId
    - quantity: Quantity
    - arrivalDate: Date
    - expiryDate: Date
    - status: StockStatus
    + allocate()
    + consume()
    + markAsExpired()
  }
}

@enduml
```

## 集約一覧

| 集約 | ルート | 含むエンティティ/VO | 不変条件 |
| :--- | :--- | :--- | :--- |
| 得意先 | 得意先 | 届け先 | 得意先は 1 つ以上の連絡先を持つ |
| 商品 | 商品 | 商品構成（VO） | 商品は 1 つ以上の商品構成を持つ |
| 単品 | 単品 | - | 品質維持日数 > 0、購入単位 > 0、リードタイム >= 0 |
| 受注 | 受注 | 届け先スナップショット（VO） | 出荷日 = 届け日 - 1。1 受注 = 1 商品 |
| 発注 | 発注 | - | 数量は購入単位の倍数。入荷予定日 = 発注日 + リードタイム |
| 在庫ロット | 在庫ロット | - | 品質維持期限 = 入荷日 + 品質維持日数 |

## 値オブジェクト

| 値オブジェクト | 属性 | バリデーション |
| :--- | :--- | :--- |
| CustomerId | value: int | > 0 |
| ProductId | value: int | > 0 |
| ItemId | value: int | > 0 |
| OrderId | value: int | > 0 |
| CustomerName | value: string | 空でない、100 文字以内 |
| ProductName | value: string | 空でない、100 文字以内 |
| ItemName | value: string | 空でない、100 文字以内 |
| Email | value: string | メール形式 |
| Phone | value: string | 電話番号形式 |
| Address | value: string | 空でない、255 文字以内 |
| DeliveryDate | value: date | 未来の日付 |
| ShippingDate | value: date | deliveryDate - 1 day |
| Message | value: string | 500 文字以内 |
| Quantity | value: int | > 0 |
| PurchaseUnit | value: int | > 0 |
| Days | value: int | >= 0 |
| OrderStatus | value: enum | 注文済み/出荷準備中/出荷済み/キャンセル |
| PurchaseOrderStatus | value: enum | 発注済み/入荷済み |
| StockStatus | value: enum | 有効/引当済み/消費済み/廃棄対象 |
| 届け先スナップショット | name, address, phone | 受注時点の届け先情報のコピー |

## 状態遷移

### 受注状態

```plantuml
@startuml
title 受注状態遷移

[*] --> 注文済み : 花束を注文する

注文済み --> 注文済み : 届け日を変更する\n[変更可能]
注文済み --> 出荷準備中 : 出荷対象を確認する\n[出荷日到来]
注文済み --> キャンセル : キャンセルする

出荷準備中 --> 出荷済み : 出荷する

キャンセル --> [*]
出荷済み --> [*]

@enduml
```

### 在庫状態

```plantuml
@startuml
title 在庫ロット状態遷移

[*] --> 有効 : 入荷を受け入れる

有効 --> 引当済み : 引当する\n[受注に紐づけ]
有効 --> 廃棄対象 : 品質維持日数超過

引当済み --> 有効 : 引当解除\n[キャンセル]
引当済み --> 消費済み : 消費する\n[結束]

廃棄対象 --> [*] : 廃棄
消費済み --> [*]

@enduml
```

### 発注状態

```plantuml
@startuml
title 発注状態遷移

[*] --> 発注済み : 単品を発注する
発注済み --> 入荷済み : 入荷を受け入れる
入荷済み --> [*]

@enduml
```

## ドメインサービス

### 在庫推移計算サービス

```plantuml
@startuml
class StockForecastService <<ドメインサービス>> {
  + calculateForecast(itemId, fromDate, toDate): StockForecast[]
}

note right of StockForecastService
  日別在庫予定数を算出:
  有効在庫 + 入荷予定 - 受注引当 - 期限超過
  複数集約を横断するためドメインサービスとして定義
end note
@enduml
```

### 発注数量計算サービス

```plantuml
@startuml
class PurchaseQuantityService <<ドメインサービス>> {
  + adjustToPurchaseUnit(requestedQty, purchaseUnit): Quantity
}

note right of PurchaseQuantityService
  要求数量を購入単位の倍数に切り上げ:
  50本必要で購入単位100本 → 100本
end note
@enduml
```

## リポジトリ（インターフェース）

| リポジトリ | 主な操作 |
| :--- | :--- |
| CustomerRepository | findById, findAll, save |
| ProductRepository | findById, findAll, save |
| ItemRepository | findById, findAll, save |
| OrderRepository | findById, findByCustomerId, findByShippingDate, findByStatus, save |
| PurchaseOrderRepository | findById, findByStatus, findByExpectedArrivalDate, save |
| StockRepository | findByItemId, findByStatus, findByExpiryDate, save |

## データモデルとの対応

| ドメインモデル | データモデル | 備考 |
| :--- | :--- | :--- |
| 得意先（集約） | customers + destinations | 届け先は得意先集約の子エンティティ |
| 商品（集約） | products + product_compositions | 商品構成は値オブジェクトとして商品に含む |
| 単品 | items | 1:1 対応 |
| 受注（集約） | orders | 届け先はスナップショットとして受注に埋め込み |
| 発注 | purchase_orders + arrivals | 入荷は発注の receive() で処理 |
| 在庫ロット | stocks | ロット単位で管理 |
| 仕入先 | suppliers | 単品から SupplierId で参照 |
