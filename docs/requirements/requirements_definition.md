# 要件定義 - フレール・メモワール WEB ショップシステム

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
actor "ショップスタッフ" as staff
actor 仕入先

usecase "WEB ショップシステム" as system
note top of system
  受注増加に伴う手作業の限界を解消し、
  WEB での受注・在庫推移の可視化・顧客管理を
  実現する。品質維持日数を考慮した在庫管理に
  より廃棄ロスを最小化し、リピーターが簡単に
  注文できる仕組みを提供する。
end note

:得意先: -- (system) : 認証済みアクセス
:staff: -- (system) : 認証済みアクセス
(system) -- :仕入先:

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
note "WEB から手軽に花束を注文したい" as c_r1
note "届け日・届け先・メッセージを指定して注文したい" as c_r2
note "過去の届け先を再利用して簡単にリピート注文したい" as c_r3
note as c_dr1 #Turquoise
  WEB ショップから商品を選択し、届け日・届け先・
  メッセージを入力して注文できること。
  過去の届け先をコピーして再利用できること。
end note
:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor "経営者" as owner
note "廃棄ロスを削減して利益率を改善したい" as o_r1
note "受注キャパシティを拡大したい" as o_r2
note "リピート率を向上させたい" as o_r3
note as o_dr1 #Turquoise
  日別の在庫推移を品質維持日数を考慮して
  可視化し、発注判断を支援できること。
  WEB 受注により手作業を削減できること。
end note
:owner: -- o_r1
:owner: -- o_r2
:owner: -- o_r3
o_r1 -- o_dr1
o_r2 -- o_dr1
o_r3 -- o_dr1

actor "受注スタッフ" as order_staff
note "受注処理を効率化したい" as s_r1
note "届け日変更への対応を迅速にしたい" as s_r2
note as s_dr1 #Turquoise
  受注一覧から注文状況を把握でき、
  届け日変更の可否を在庫推移から即座に
  判断できること。
end note
:order_staff: -- s_r1
:order_staff: -- s_r2
s_r1 -- s_dr1
s_r2 -- s_dr1

actor "仕入スタッフ" as purchase_staff
note "在庫推移を見て適切に発注判断したい" as p_r1
note "入荷予定を正確に把握したい" as p_r2
note as p_dr1 #Turquoise
  品質維持日数・購入単位・リードタイムを
  考慮した在庫推移を確認でき、
  発注・入荷管理ができること。
end note
:purchase_staff: -- p_r1
:purchase_staff: -- p_r2
p_r1 -- p_dr1
p_r2 -- p_dr1

@enduml
```

## システム外部環境

### ビジネスコンテキスト

```plantuml
@startuml

title ビジネスコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先

node "フレール・メモワール" {
  rectangle "営業・受注" {
    actor "受注スタッフ" as order_staff
  }

  rectangle "仕入・在庫" {
    actor "仕入スタッフ" as purchase_staff
  }

  rectangle "店舗運営" {
    actor "フローリスト" as florist
  }

  rectangle "配送" {
    actor "配送スタッフ" as delivery_staff
  }

  usecase "受注管理" as order_mgmt
  usecase "在庫管理" as stock_mgmt
  usecase "仕入管理" as purchase_mgmt
  usecase "商品管理" as product_mgmt
  usecase "顧客管理" as customer_mgmt
  usecase "出荷管理" as shipping_mgmt

  artifact "商品（花束）" as product
  artifact "単品（花材）" as item
  artifact "在庫" as stock
}

node "仕入先" as supplier_org {
  agent "仕入先" as supplier
}

:得意先: -- (order_mgmt)
:得意先: -- (customer_mgmt)

(order_mgmt) -- :order_staff:
(stock_mgmt) -- :purchase_staff:
(purchase_mgmt) -- :purchase_staff:
(product_mgmt) -- :order_staff:
(customer_mgmt) -- :order_staff:
(shipping_mgmt) -- :delivery_staff:

(order_mgmt) -- product
(stock_mgmt) -- item
(stock_mgmt) -- stock
(purchase_mgmt) -- item
(product_mgmt) -- product
(shipping_mgmt) -- product

(purchase_mgmt) -- supplier

@enduml
```

### ビジネスユースケース

#### 受注管理業務

```plantuml
@startuml

title ビジネスユースケース図 - 受注管理業務

left to right direction

actor 得意先
actor "受注スタッフ" as staff

agent "WEB ショップ" as web

usecase "商品を注文する" as uc_order
usecase "届け日を変更する" as uc_change_date
usecase "受注を確認・管理する" as uc_manage_order

artifact "商品（花束）" as product
artifact "受注" as order

:得意先: -- (uc_order)
:得意先: -- (uc_change_date)
:staff: -- (uc_manage_order)
:staff: -- (uc_change_date)

(uc_order) -- web
(uc_change_date) -- web
(uc_manage_order) -- web

(uc_order) -- product
(uc_order) -- order
(uc_change_date) -- order
(uc_manage_order) -- order

@enduml
```

#### 在庫・仕入管理業務

```plantuml
@startuml

title ビジネスユースケース図 - 在庫・仕入管理業務

left to right direction

actor "仕入スタッフ" as staff
actor "仕入先" as supplier

usecase "在庫推移を確認する" as uc_stock
usecase "発注する" as uc_purchase
usecase "入荷を受け入れる" as uc_receive
usecase "単品を納品する" as uc_deliver

artifact "単品（花材）" as item
artifact "在庫" as stock
artifact "発注" as purchase_order
artifact "入荷" as arrival

:staff: -- (uc_stock)
:staff: -- (uc_purchase)
:staff: -- (uc_receive)

(uc_stock) -- stock
(uc_stock) -- item
(uc_purchase) -- purchase_order
(uc_purchase) -- stock
(uc_receive) -- arrival
(uc_receive) -- stock

:supplier: -- (uc_deliver)
(uc_deliver) -- arrival

@enduml
```

#### 出荷・配送管理業務

```plantuml
@startuml

title ビジネスユースケース図 - 出荷・配送管理業務

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery_staff

usecase "花束を結束する" as uc_bundle
usecase "出荷する" as uc_ship

artifact "商品（花束）" as product
artifact "単品（花材）" as item
artifact "受注" as order

:florist: -- (uc_bundle)
:delivery_staff: -- (uc_ship)

(uc_bundle) -- product
(uc_bundle) -- item
(uc_bundle) -- order
(uc_ship) -- order

@enduml
```

#### 顧客管理業務

```plantuml
@startuml

title ビジネスユースケース図 - 顧客管理業務

left to right direction

actor 得意先
actor "受注スタッフ" as staff

usecase "届け先をコピーする" as uc_copy
usecase "得意先情報を管理する" as uc_manage_customer

artifact "得意先" as customer
artifact "届け先" as delivery_dest

:得意先: -- (uc_copy)
:staff: -- (uc_manage_customer)

(uc_copy) -- delivery_dest
(uc_copy) -- customer
(uc_manage_customer) -- customer
(uc_manage_customer) -- delivery_dest

@enduml
```

### 業務フロー

#### 商品を注文する：BUC の業務フロー

```plantuml
@startuml

title 業務フロー図 - 商品を注文する

|得意先|
start
:WEB ショップにアクセス;
:商品（花束）を選択;
:届け日を指定;
:届け先を入力;
note right
  リピーターは過去の
  届け先をコピー可能
end note
:メッセージを入力;
:注文を確定;

|受注スタッフ|
:受注を確認;
:在庫推移を確認;

if (在庫が十分か？) then (不足)
  :仕入スタッフに連絡;
else (十分)
endif

:受注を受付済みにする;
stop

@enduml
```

#### 在庫推移を確認し発注する：BUC の業務フロー

```plantuml
@startuml

title 業務フロー図 - 在庫推移を確認し発注する

|仕入スタッフ|
start
:在庫推移画面を表示;
:日別の在庫予定数を確認;
note right
  品質維持日数を考慮した
  在庫推移を表示
end note

if (発注が必要か？) then (必要)
  :発注する単品と数量を決定;
  note right
    発注判断は人間が行い
    システムは判断材料を提供
  end note
  :仕入先に発注;

  |仕入先|
  :単品を出荷;

  |仕入スタッフ|
  :入荷を受け入れ;
  :在庫に反映;
else (不要)
endif

stop

@enduml
```

#### 出荷する：BUC の業務フロー

```plantuml
@startuml

title 業務フロー図 - 出荷する

|フローリスト|
start
:出荷予定の受注を確認;
note right
  出荷日 = 届け日の前日
end note
:必要な花材を準備;
:花束を結束;

|配送スタッフ|
:出荷処理;
:配送手配;

|得意先|
:届け先で花束を受け取り;
stop

@enduml
```

#### 届け日を変更する：BUC の業務フロー

```plantuml
@startuml

title 業務フロー図 - 届け日を変更する

|得意先|
start
:届け日変更を依頼;

|受注スタッフ|
:変更要望を受付;
:在庫推移を確認;

if (変更後の届け日で在庫が確保できるか？) then (可能)
  :届け日を変更;
  :得意先に変更完了を通知;
else (不可)
  :得意先に変更不可を通知;
  note right
    代替の届け日を提案
  end note
endif

|得意先|
:通知を受け取り;
stop

@enduml
```

### 利用シーン

#### 受注管理の利用シーン

```plantuml
@startuml

title 利用シーン図 - 受注管理

left to right direction

actor 得意先
actor "受注スタッフ" as staff

frame "初めての注文" as scene1
note right of scene1
  得意先が WEB ショップから初めて花束を注文する。
  商品を選択し、届け日・届け先・メッセージを入力して
  注文を確定する。
end note

frame "リピート注文" as scene2
note right of scene2
  過去に注文した得意先がリピート注文する。
  前回の届け先情報をコピーして利用できるため、
  入力の手間を大幅に削減できる。
end note

frame "届け日の変更" as scene3
note right of scene3
  注文後に届け日の変更を希望する。
  受注スタッフが在庫推移を確認し、変更の可否を
  即座に判断して得意先に通知する。
end note

usecase "商品を注文する" as uc_order
usecase "届け先をコピーする" as uc_copy
usecase "届け日を変更する" as uc_change

:得意先: -- scene1
scene1 -- (uc_order)

:得意先: -- scene2
scene2 -- (uc_order)
scene2 -- (uc_copy)

:得意先: -- scene3
:staff: -- scene3
scene3 -- (uc_change)

@enduml
```

#### 在庫・仕入管理の利用シーン

```plantuml
@startuml

title 利用シーン図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff

frame "日次の在庫確認" as scene1
note right of scene1
  毎朝、仕入スタッフが在庫推移画面を確認する。
  品質維持日数を考慮した日別の在庫予定数を見て、
  不足が予想される単品を特定し発注判断を行う。
end note

frame "緊急の追加発注" as scene2
note right of scene2
  受注が想定以上に入り、特定の単品の在庫が
  不足する見込みになった場合、在庫推移を確認し
  追加発注を行う。リードタイムを考慮して
  発注タイミングを判断する。
end note

usecase "在庫推移を確認する" as uc_stock
usecase "発注する" as uc_purchase
usecase "入荷を受け入れる" as uc_receive

:staff: -- scene1
scene1 -- (uc_stock)
scene1 -- (uc_purchase)

:staff: -- scene2
scene2 -- (uc_stock)
scene2 -- (uc_purchase)
scene2 -- (uc_receive)

@enduml
```

### バリエーション・条件

#### 商品種別

| 商品種別 | 説明 |
|----------|------|
| 花束 | 事前定義された花の組合せ。単品を束ねて商品化する |

#### 受注ステータス

| ステータス | 説明 |
|----------|------|
| 注文受付 | 得意先が注文を確定した状態 |
| 受付済み | 受注スタッフが受注を確認・受け付けた状態 |
| 出荷準備中 | 花束の結束が完了し、出荷を待っている状態 |
| 出荷済み | 配送手配が完了した状態 |
| 届け完了 | 届け先に届けられた状態 |
| キャンセル | 注文がキャンセルされた状態 |

#### 単品カテゴリ

| カテゴリ | 説明 |
|----------|------|
| メイン花材 | 花束の主役となる花 |
| サブ花材 | 花束を引き立てる副花材 |
| グリーン | 葉もの・枝もの |
| 資材 | ラッピング材・リボン等 |

#### 在庫状態

| 状態 | 説明 |
|----------|------|
| 入荷予定 | 発注済みで入荷を待っている状態 |
| 在庫あり | 入荷済みで品質維持期限内の状態 |
| 品質低下 | 品質維持日数に近づいている状態 |
| 廃棄対象 | 品質維持日数を超過した状態 |

## システム境界

### ユースケース複合図

#### 受注管理

```plantuml
@startuml

title ユースケース複合図 - 受注管理

left to right direction

actor 得意先
actor "受注スタッフ" as staff

frame "初めての注文" as f_first
frame "リピート注文" as f_repeat
frame "届け日の変更" as f_change

usecase "商品を注文する" as uc_order
usecase "受注を確認・管理する" as uc_manage
usecase "届け日を変更する" as uc_change
usecase "届け先をコピーする" as uc_copy

boundary "商品一覧画面" as b_product_list
boundary "注文画面" as b_order_form
boundary "受注一覧画面" as b_order_list
boundary "受注詳細画面" as b_order_detail
boundary "届け日変更画面" as b_change_date

entity "受注" as e_order
entity "商品" as e_product
entity "届け先" as e_delivery
entity "得意先" as e_customer

control "注文入力チェック" as c_order_check
control "届け日変更可否判定" as c_change_check

:得意先: -- f_first
f_first -- (uc_order)

:得意先: -- f_repeat
f_repeat -- (uc_order)
f_repeat -- (uc_copy)

:得意先: -- f_change
:staff: -- f_change
f_change -- (uc_change)

:staff: -- (uc_manage)

b_product_list - (uc_order)
b_order_form - (uc_order)
(uc_order) -- e_order
(uc_order) -- e_product
(uc_order) -- e_delivery
(uc_order) - c_order_check

b_order_list - (uc_manage)
b_order_detail - (uc_manage)
(uc_manage) -- e_order

b_change_date - (uc_change)
(uc_change) -- e_order
(uc_change) - c_change_check

(uc_copy) -- e_delivery
(uc_copy) -- e_customer

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ユースケース複合図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff
actor "仕入先" as supplier

frame "日次の在庫確認" as f_daily
frame "緊急の追加発注" as f_urgent

usecase "在庫推移を確認する" as uc_stock
usecase "発注する" as uc_purchase
usecase "入荷を受け入れる" as uc_receive

boundary "在庫推移画面" as b_stock
boundary "発注画面" as b_purchase
boundary "入荷登録画面" as b_receive

entity "在庫" as e_stock
entity "単品" as e_item
entity "発注" as e_purchase
entity "入荷" as e_arrival

control "在庫推移計算条件" as c_stock_calc
control "発注数量チェック" as c_purchase_check

:staff: -- f_daily
f_daily -- (uc_stock)
f_daily -- (uc_purchase)

:staff: -- f_urgent
f_urgent -- (uc_stock)
f_urgent -- (uc_purchase)
f_urgent -- (uc_receive)

b_stock - (uc_stock)
(uc_stock) -- e_stock
(uc_stock) -- e_item
(uc_stock) - c_stock_calc

b_purchase - (uc_purchase)
(uc_purchase) -- e_purchase
(uc_purchase) -- e_stock
(uc_purchase) - c_purchase_check

b_receive - (uc_receive)
(uc_receive) -- e_arrival
(uc_receive) -- e_stock

:supplier: -- (uc_receive)

@enduml
```

#### 出荷管理

```plantuml
@startuml

title ユースケース複合図 - 出荷管理

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery

usecase "花束を結束する" as uc_bundle
usecase "出荷する" as uc_ship

boundary "結束作業画面" as b_bundle
boundary "出荷一覧画面" as b_ship_list

entity "受注" as e_order
entity "商品" as e_product
entity "単品" as e_item

control "出荷日判定" as c_ship_date
note bottom of c_ship_date
  出荷日 = 届け日の前日
end note

:florist: -- (uc_bundle)
b_bundle - (uc_bundle)
(uc_bundle) -- e_order
(uc_bundle) -- e_product
(uc_bundle) -- e_item

:delivery: -- (uc_ship)
b_ship_list - (uc_ship)
(uc_ship) -- e_order
(uc_ship) - c_ship_date

@enduml
```

#### 商品管理

```plantuml
@startuml

title ユースケース複合図 - 商品管理

left to right direction

actor "ショップスタッフ" as staff

usecase "商品（花束）を登録・更新する" as uc_product
usecase "単品を登録・更新する" as uc_item
usecase "花束構成を管理する" as uc_composition

boundary "商品管理画面" as b_product
boundary "単品管理画面" as b_item
boundary "花束構成画面" as b_composition

entity "商品" as e_product
entity "単品" as e_item
entity "商品構成" as e_composition

:staff: -- (uc_product)
:staff: -- (uc_item)
:staff: -- (uc_composition)

b_product - (uc_product)
(uc_product) -- e_product

b_item - (uc_item)
(uc_item) -- e_item

b_composition - (uc_composition)
(uc_composition) -- e_composition
(uc_composition) -- e_product
(uc_composition) -- e_item

@enduml
```

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

' 顧客関連
entity "得意先" as customer
entity "届け先" as delivery_dest

' 商品関連
entity "商品（花束）" as product
entity "商品構成" as composition
entity "単品（花材）" as item

' 受注関連
entity "受注" as order

' 仕入関連
entity "仕入先" as supplier
entity "発注" as purchase_order
entity "入荷" as arrival

' 在庫関連
entity "在庫" as stock

' 関連付け（カーディナリティ付き）
customer "1" -- "0..*" order : 注文する
customer "1" -- "0..*" delivery_dest : 届け先を持つ

order "1" -- "1" product : 注文対象
order "1" -- "1" delivery_dest : 届け先

product "1" -- "1..*" composition : 花束構成
composition "0..*" -- "1" item : 使用する花材

item "0..*" -- "1" supplier : 仕入先
item "1" -- "0..1" stock : 在庫

supplier "1" -- "0..*" purchase_order : 発注先
purchase_order "1" -- "1" item : 発注対象
purchase_order "1" -- "0..*" arrival : 入荷実績

arrival "0..*" -- "1" item : 入荷対象
arrival "0..*" -- "1" stock : 在庫反映

@enduml
```

### 状態モデル

### ビジネスルール

#### 在庫推移計算ルール

在庫推移は以下の要素から日別に算出する。

```
日別在庫予定数 = 前日在庫 + 当日入荷予定 - 当日受注引当 - 当日廃棄予定
```

| 要素 | 計算方法 |
|------|----------|
| 前日在庫 | 前日時点の有効在庫数（品質維持期限内） |
| 当日入荷予定 | 発注済み・一部入荷の発注から、希望納品日が当日のもの |
| 当日受注引当 | 届け日の前日（出荷日）に必要な花材数。商品構成 × 受注数で算出 |
| 当日廃棄予定 | 入荷日 + 品質維持日数 = 当日 となる在庫 |

**1 注文 = 1 商品ルール**: 1 件の受注には 1 種類の商品（花束）のみ。複数商品の注文は複数の受注として登録する。

#### 境界値

| 項目 | 制約 |
|------|------|
| 届け日 | 翌日〜30 日後まで指定可能 |
| お届けメッセージ | 最大 200 文字 |
| 商品価格 | 1 円〜999,999 円 |
| 発注数量 | 購入単位の倍数。上限 9,999 |
| 品質維持日数 | 1〜30 日 |
| リードタイム | 1〜14 日 |
| 商品名 | 最大 50 文字 |
| 単品名 | 最大 50 文字 |

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml

title 状態モデル図 - 受注の状態遷移

[*] --> 注文受付 : (商品を注文する)

注文受付 --> 受付済み : (受注を確認・管理する)
注文受付 --> キャンセル : (注文をキャンセルする)

受付済み --> 出荷準備中 : (花束を結束する)
受付済み --> キャンセル : (注文をキャンセルする)

state 受付済み {
  [*] --> 届け日確定
  届け日確定 --> 届け日変更中 : (届け日を変更する)\n[変更依頼]
  届け日変更中 --> 届け日確定 : (届け日を変更する)\n[変更確定]
  届け日変更中 --> 届け日確定 : (届け日を変更する)\n[変更不可]
}

出荷準備中 --> 出荷済み : (出荷する)
出荷済み --> 届け完了 : (届けを完了する)

キャンセル --> [*]
届け完了 --> [*]

@enduml
```

#### 受注の状態遷移表

| 現在の状態＼イベント | 注文確定 | 受付処理 | キャンセル | 結束完了 | 出荷処理 | 届け完了 | 届け日変更 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| （初期状態） | 注文受付 | - | - | - | - | - | - |
| 注文受付 | - | 受付済み | キャンセル | - | - | - | - |
| 受付済み | - | - | キャンセル | 出荷準備中 | - | - | 受付済み |
| 出荷準備中 | - | - | - | - | 出荷済み | - | - |
| 出荷済み | - | - | - | - | - | 届け完了 | - |
| 届け完了 | - | - | - | - | - | - | - |
| キャンセル | - | - | - | - | - | - | - |

- 「-」は遷移不可を示す
- 「出荷準備中」以降はキャンセル・届け日変更不可

#### 在庫の状態遷移

```plantuml
@startuml

title 状態モデル図 - 在庫の状態遷移

[*] --> 入荷予定 : (発注する)
入荷予定 --> 在庫あり : (入荷を受け入れる)

在庫あり --> 在庫あり : (花束を結束する)\n[在庫を消費]
在庫あり --> 品質低下 : [品質維持日数に近づく]
在庫あり --> 引当済み : (受注による引当)

品質低下 --> 廃棄対象 : [品質維持日数を超過]
品質低下 --> 品質低下 : (花束を結束する)\n[優先消費]

廃棄対象 --> [*] : (廃棄処理)
引当済み --> [*] : (花束を結束する)\n[消費完了]

@enduml
```

#### 発注の状態遷移

```plantuml
@startuml

title 状態モデル図 - 発注の状態遷移

[*] --> 発注済み : (発注する)
発注済み --> 入荷済み : (入荷を受け入れる)
発注済み --> 一部入荷 : (入荷を受け入れる)\n[一部のみ入荷]
一部入荷 --> 入荷済み : (入荷を受け入れる)\n[残数入荷]

入荷済み --> [*]

@enduml
```

---

## 記入履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-03-20 | 初版作成。RDRA 2.0 の 4 層構造に基づき要件定義を作成 |
| 2026-03-20 | レビュー指摘反映。情報モデルにカーディナリティ追加、在庫推移計算ルール・境界値・状態遷移表追加、認証コンテキスト追加 |
