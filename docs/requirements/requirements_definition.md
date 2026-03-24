# 要件定義 - フレール・メモワール WEB ショップシステム

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff
actor "仕入スタッフ" as purchase_staff
actor "フローリスト" as florist
actor "仕入先" as supplier

usecase "WEB ショップ\nシステム" as system
note top of system
  受注から出荷までの業務を効率化し、
  在庫推移の可視化により廃棄ロスを最小化する。
  リピーターが簡単に注文できる仕組みを提供する。
end note

:得意先: -- (system)
:受注スタッフ: -- (system)
:仕入スタッフ: -- (system)
:フローリスト: -- (system)
(system) -- :仕入先:

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor "得意先" as customer
note "花束を注文したい" as c_r1
note "届け日・届け先を指定したい" as c_r2
note "メッセージカードを添えたい" as c_r3
note "過去の届け先を再利用したい" as c_r4
note "届け日を変更したい" as c_r5
note as c_dr1 #Turquoise
  WEB から商品を選択し、
  届け日・届け先・メッセージを
  入力して注文できること
end note
note as c_dr2 #Turquoise
  過去の注文から届け先情報を
  コピーして再利用できること
end note

:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
:得意先: -- c_r4
:得意先: -- c_r5
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1
c_r4 -- c_dr2
c_r5 -- c_dr1

actor "受注スタッフ" as order_staff
note "受注状況を一覧で確認したい" as o_r1
note "出荷対象を把握したい" as o_r2
note "届け日変更に迅速に対応したい" as o_r3
note as o_dr1 #Turquoise
  受注一覧・出荷管理画面で
  受注状況と出荷対象を管理でき、
  届け日変更の可否を即座に判断できること
end note

:受注スタッフ: -- o_r1
:受注スタッフ: -- o_r2
:受注スタッフ: -- o_r3
o_r1 -- o_dr1
o_r2 -- o_dr1
o_r3 -- o_dr1

actor "仕入スタッフ" as purchase_staff
note "在庫推移を把握したい" as p_r1
note "廃棄予定を事前に知りたい" as p_r2
note "適切なタイミングで発注したい" as p_r3
note as p_dr1 #Turquoise
  単品ごとの日別在庫推移
  （在庫残・出庫予定・入荷予定・廃棄予定）
  を可視化し、品質維持期限アラートで
  廃棄リスクを通知できること
end note

:仕入スタッフ: -- p_r1
:仕入スタッフ: -- p_r2
:仕入スタッフ: -- p_r3
p_r1 -- p_dr1
p_r2 -- p_dr1
p_r3 -- p_dr1

@enduml
```

## システム外部環境

### ビジネスコンテキスト

```plantuml
@startuml

title ビジネスコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor "得意先" as customer

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

  usecase "WEB 受注" as biz_order
  usecase "在庫・仕入管理" as biz_stock
  usecase "結束・出荷" as biz_ship
  usecase "商品管理" as biz_product

  artifact "受注データ" as af_order
  artifact "在庫データ" as af_stock
  artifact "商品マスタ" as af_product
}

node "外部" {
  actor "仕入先" as supplier
}

:得意先: -- (biz_order)
(biz_order) -- :受注スタッフ:
(biz_stock) -- :仕入スタッフ:
(biz_ship) -- :フローリスト:
(biz_product) -- :受注スタッフ:

(biz_order) -- af_order
(biz_stock) -- af_stock
(biz_product) -- af_product
(biz_stock) -- :仕入先:

@enduml
```

### ビジネスユースケース

#### WEB 受注

```plantuml
@startuml

title ビジネスユースケース図 - WEB 受注

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff

agent "WEB ショップ"

usecase "商品を注文する" as buc_01
usecase "届け日を変更する" as buc_02
usecase "注文をキャンセルする" as buc_03
usecase "届け先をコピーする" as buc_04
usecase "受注を確認する" as buc_05

artifact "受注データ" as af_01
artifact "届け先データ" as af_02

:得意先: -- (buc_01)
:得意先: -- (buc_02)
:得意先: -- (buc_03)
:得意先: -- (buc_04)
:受注スタッフ: -- (buc_05)
:受注スタッフ: -- (buc_02)

(buc_01) -- "WEB ショップ"
(buc_02) -- "WEB ショップ"

(buc_01) -- af_01
(buc_02) -- af_01
(buc_03) -- af_01
(buc_04) -- af_02
(buc_05) -- af_01

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ビジネスユースケース図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as purchase_staff
actor "仕入先" as supplier

agent "管理画面"

usecase "在庫推移を確認する" as buc_01
usecase "発注する" as buc_02
usecase "入荷を受け入れる" as buc_03
usecase "品質維持期限を確認する" as buc_04

artifact "在庫データ" as af_01
artifact "発注データ" as af_02
artifact "入荷データ" as af_03

:仕入スタッフ: -- (buc_01)
:仕入スタッフ: -- (buc_02)
:仕入スタッフ: -- (buc_03)
:仕入スタッフ: -- (buc_04)
:仕入先: -- (buc_03)

(buc_01) -- "管理画面"
(buc_02) -- "管理画面"
(buc_03) -- "管理画面"
(buc_04) -- "管理画面"

(buc_01) -- af_01
(buc_02) -- af_02
(buc_03) -- af_03

@enduml
```

#### 結束・出荷

```plantuml
@startuml

title ビジネスユースケース図 - 結束・出荷

left to right direction

actor "フローリスト" as florist
actor "受注スタッフ" as order_staff

agent "管理画面"

usecase "結束対象を確認する" as buc_01
usecase "出荷処理を行う" as buc_02
usecase "出荷通知を送る" as buc_03

artifact "受注データ" as af_01
artifact "出荷データ" as af_02

:フローリスト: -- (buc_01)
:受注スタッフ: -- (buc_02)
:受注スタッフ: -- (buc_03)

(buc_01) -- "管理画面"
(buc_02) -- "管理画面"

(buc_01) -- af_01
(buc_02) -- af_02
(buc_03) -- af_02

@enduml
```

#### 商品管理

```plantuml
@startuml

title ビジネスユースケース図 - 商品管理

left to right direction

actor "受注スタッフ" as staff

agent "管理画面"

usecase "商品（花束）を登録する" as buc_01
usecase "単品マスタを管理する" as buc_02
usecase "花束構成を定義する" as buc_03

artifact "商品マスタ" as af_01
artifact "単品マスタ" as af_02

:受注スタッフ: -- (buc_01)
:受注スタッフ: -- (buc_02)
:受注スタッフ: -- (buc_03)

(buc_01) -- "管理画面"
(buc_02) -- "管理画面"
(buc_03) -- "管理画面"

(buc_01) -- af_01
(buc_02) -- af_02
(buc_03) -- af_01
(buc_03) -- af_02

@enduml
```

### 業務フロー

#### 商品を注文するの業務フロー

```plantuml
@startuml

title 業務フロー図 - 商品を注文する

|得意先|
start
:WEB ショップにアクセス;
:商品（花束）を選択;
:届け日を選択;
note right
  最短: 注文日 + リードタイム日数後
  最長: 注文日 + 30 日後
end note
:届け先情報を入力;

if (過去の届け先を利用？) then (はい)
  :過去の届け先をコピー;
else (いいえ)
  :新しい届け先を入力;
endif

:メッセージカードの内容を入力;
:注文内容を確認;
:注文を確定;

|WEB ショップシステム|
:受注を登録;
:在庫推移を更新;
:注文確認メールを送信;

|得意先|
:注文確認メールを受信;
stop

@enduml
```

#### 在庫推移を確認し発注するの業務フロー

```plantuml
@startuml

title 業務フロー図 - 在庫推移を確認し発注する

|仕入スタッフ|
start
:管理画面で在庫推移を確認;
:品質維持期限アラートを確認;
note right
  品質維持期限が近い在庫を
  優先的に活用する判断材料
end note

if (在庫不足の単品がある？) then (はい)
  :発注数量を決定;
  note right
    発注判断は人間が行う
    システムは判断材料を提供
  end note
  :仕入先への発注を登録;

  |仕入先|
  :単品を出荷;

  |仕入スタッフ|
  :入荷を受け入れ;
  :入荷数量を登録;
  :在庫推移を再確認;
else (いいえ)
  :対応不要;
endif

stop

@enduml
```

#### 結束・出荷の業務フロー

```plantuml
@startuml

title 業務フロー図 - 結束・出荷

|フローリスト|
start
:出荷日（= 届け日の前日）の結束対象を確認;
:花材を準備;
:花束を結束;

|受注スタッフ|
:出荷処理を実行;
:出荷通知を送信;

|得意先|
:出荷通知を受信;

stop

@enduml
```

#### 届け日を変更するの業務フロー

```plantuml
@startuml

title 業務フロー図 - 届け日を変更する

|得意先|
start
:届け日変更を依頼;

|受注スタッフ|
:変更期限を確認;
note right
  届け日の 3 日前まで変更可能
  （= 出荷日の 2 日前まで）
end note

if (変更期限内？) then (はい)
  :新しい届け日の在庫を確認;
  if (在庫確保可能？) then (はい)
    :届け日を変更;
    :在庫引当を再計算;
    :変更完了を通知;
  else (いいえ)
    :変更不可を通知;
    note right
      代替の届け日を提案
    end note
  endif
else (いいえ)
  :変更期限超過を通知;
endif

|得意先|
:結果を受信;
stop

@enduml
```

### 利用シーン

#### WEB 受注の利用シーン

```plantuml
@startuml

title 利用シーン図 - WEB 受注

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff

frame "記念日に花束を贈る" as scene1
note right of scene1
  得意先が大切な記念日（誕生日、結婚記念日等）に
  花束を届けたいと考え、WEB ショップから注文する。
  届け日・届け先・メッセージを指定し、
  クレジットカードで決済する。
end note

frame "リピーターが再注文する" as scene2
note right of scene2
  以前注文したことがある得意先が、
  同じ届け先に再度花束を贈りたいと考え、
  過去の届け先情報をコピーして注文する。
  住所の再入力が不要になり手軽に注文できる。
end note

frame "届け日を変更する" as scene3
note right of scene3
  得意先が注文後に届け日の変更を希望する。
  変更期限（届け日の 3 日前）内であれば、
  在庫状況を確認の上で変更を受け付ける。
end note

usecase "商品を注文する" as uc1
usecase "届け先をコピーする" as uc2
usecase "届け日を変更する" as uc3
usecase "受注を確認する" as uc4

:得意先: -- scene1
scene1 -- (uc1)

:得意先: -- scene2
scene2 -- (uc1)
scene2 -- (uc2)

:得意先: -- scene3
:受注スタッフ: -- scene3
scene3 -- (uc3)
scene3 -- (uc4)

@enduml
```

#### 在庫・仕入管理の利用シーン

```plantuml
@startuml

title 利用シーン図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as purchase_staff

frame "毎朝の在庫確認と発注判断" as scene1
note right of scene1
  仕入スタッフが毎朝、管理画面で
  単品ごとの在庫推移を確認し、
  不足する花材の発注判断を行う。
  品質維持期限アラートで廃棄リスクも把握する。
  発注判断は人間が行い、システムは判断材料を提供。
end note

frame "入荷の受け入れ" as scene2
note right of scene2
  仕入先から単品が届いた際に、
  入荷数量を登録して在庫に反映する。
  入荷日が品質維持日数の起算日となる。
end note

usecase "在庫推移を確認する" as uc1
usecase "品質維持期限を確認する" as uc2
usecase "発注する" as uc3
usecase "入荷を受け入れる" as uc4

:仕入スタッフ: -- scene1
scene1 -- (uc1)
scene1 -- (uc2)
scene1 -- (uc3)

:仕入スタッフ: -- scene2
scene2 -- (uc4)

@enduml
```

### バリエーション・条件

#### 受注ステータス

| ステータス | 説明 |
| :--- | :--- |
| 受付済み | 得意先が注文を確定した状態 |
| 出荷準備中 | 出荷日（届け日の前日）に結束作業が必要な状態 |
| 出荷済み | 出荷処理が完了した状態 |
| キャンセル済み | 得意先の要望により注文がキャンセルされた状態 |

#### 在庫ステータス

| ステータス | 説明 |
| :--- | :--- |
| 入荷予定 | 発注済みだがまだ入荷していない状態 |
| 在庫あり | 入荷済みで品質維持期限内の状態 |
| 引当済み | 受注に対して在庫が確保された状態 |
| 品質期限間近 | 品質維持期限まで残り 2 日以内の状態 |
| 廃棄対象 | 品質維持日数を超過し廃棄が必要な状態 |

#### 届け日変更可否

| 条件 | 変更可否 |
| :--- | :--- |
| 届け日の 3 日前以前 | 変更可能（在庫確保が前提） |
| 届け日の 3 日前〜当日 | 変更不可 |
| 出荷済み | 変更不可 |

## システム境界

### ユースケース複合図

#### WEB 受注

```plantuml
@startuml

title ユースケース複合図 - WEB 受注

left to right direction

actor "得意先" as customer

frame "記念日に花束を贈る" as f01
usecase "商品を注文する" as UC1
boundary "商品選択画面" as b01
boundary "注文入力画面" as b02
boundary "注文確認画面" as b03
entity "受注" as e01
entity "商品" as e02
entity "届け先" as e03
control "在庫引当" as c01
control "届け日選択範囲" as c02

customer -- f01
f01 -- UC1

b01 -- UC1
b02 -- UC1
b03 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- e03
UC1 -- c01
UC1 -- c02

frame "リピーターが再注文する" as f02
usecase "届け先をコピーする" as UC2
boundary "届け先選択画面" as b04
entity "得意先" as e04
control "過去の届け先" as c03

customer -- f02
f02 -- UC2
b04 -- UC2
UC2 -- e03
UC2 -- e04
UC2 -- c03

frame "届け日を変更する" as f03
usecase "届け日を変更する" as UC3
usecase "注文をキャンセルする" as UC4
boundary "注文変更画面" as b05
control "変更期限チェック" as c04
control "在庫再引当" as c05

customer -- f03
f03 -- UC3
f03 -- UC4
b05 -- UC3
b05 -- UC4
UC3 -- e01
UC3 -- c04
UC3 -- c05
UC4 -- e01
UC4 -- c04

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ユースケース複合図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff

frame "毎朝の在庫確認と発注判断" as f01
usecase "在庫推移を確認する" as UC1
usecase "品質維持期限を確認する" as UC2
usecase "発注する" as UC3
boundary "在庫推移画面" as b01
boundary "発注登録画面" as b02
entity "在庫" as e01
entity "単品" as e02
entity "発注" as e03
entity "在庫ロット" as e04
control "品質維持期限チェック" as c01
control "在庫推移計算" as c02

staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3

b01 -- UC1
b01 -- UC2
UC1 -- e01
UC1 -- e02
UC1 -- c02
UC2 -- e04
UC2 -- c01

b02 -- UC3
UC3 -- e03
UC3 -- e02

frame "入荷の受け入れ" as f02
usecase "入荷を受け入れる" as UC4
boundary "入荷登録画面" as b03
entity "入荷" as e05
control "在庫更新" as c03

staff -- f02
f02 -- UC4
b03 -- UC4
UC4 -- e05
UC4 -- e01
UC4 -- c03

@enduml
```

#### 結束・出荷

```plantuml
@startuml

title ユースケース複合図 - 結束・出荷

left to right direction

actor "フローリスト" as florist
actor "受注スタッフ" as staff

frame "結束・出荷作業" as f01
usecase "結束対象を確認する" as UC1
usecase "出荷処理を行う" as UC2
usecase "出荷通知を送る" as UC3
boundary "結束一覧画面" as b01
boundary "出荷管理画面" as b02
entity "受注" as e01
entity "出荷" as e02
control "出荷日判定" as c01
interface "メール送信" as i01

florist -- f01
staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3

b01 -- UC1
UC1 -- e01
UC1 -- c01

b02 -- UC2
UC2 -- e01
UC2 -- e02

UC3 -- e02
UC3 -- i01

@enduml
```

#### 商品管理

```plantuml
@startuml

title ユースケース複合図 - 商品管理

left to right direction

actor "受注スタッフ" as staff

frame "商品マスタ管理" as f01
usecase "商品（花束）を登録する" as UC1
usecase "単品マスタを管理する" as UC2
usecase "花束構成を定義する" as UC3
boundary "商品管理画面" as b01
boundary "単品管理画面" as b02
boundary "花束構成画面" as b03
entity "商品" as e01
entity "単品" as e02
entity "商品構成" as e03
control "品質維持日数" as c01
control "購入単位" as c02

staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3

b01 -- UC1
UC1 -- e01

b02 -- UC2
UC2 -- e02
UC2 -- c01
UC2 -- c02

b03 -- UC3
UC3 -- e03
UC3 -- e01
UC3 -- e02

@enduml
```

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

' 商品関連
entity "商品（花束）" as product
entity "単品（花）" as item
entity "商品構成" as product_composition
entity "仕入先" as supplier

' 受注関連
entity "得意先" as customer
entity "受注" as order_
entity "届け先" as delivery_dest

' 在庫関連
entity "在庫" as stock
entity "在庫ロット" as stock_lot
entity "発注" as purchase_order
entity "入荷" as arrival

' 出荷関連
entity "出荷" as shipment

' 商品関連の関連
product -- product_composition : 構成される
product_composition -- item : 使用する
item -- supplier : 仕入れる

' 受注関連の関連
customer -- order_ : 注文する
order_ -- product : 含む
order_ -- delivery_dest : 届け先を指定する
customer -- delivery_dest : 過去の届け先を保持する

' 在庫関連の関連
item -- stock : 在庫を持つ
stock -- stock_lot : 明細を持つ
stock_lot -- arrival : 入荷単位で追跡する
item -- purchase_order : 発注する
purchase_order -- supplier : 発注先
purchase_order -- arrival : 入荷される

' 出荷関連の関連
order_ -- shipment : 出荷する
shipment -- delivery_dest : 届ける

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 受付済み : 商品を注文する

受付済み --> 受付済み : 届け日を変更する
受付済み --> キャンセル済み : 注文をキャンセルする
受付済み --> 出荷準備中 : 出荷日到来（自動）

state 出荷準備中 {
  [*] --> 結束待ち
  結束待ち --> 結束済み : 結束対象を確認する
}

出荷準備中 --> 出荷済み : 出荷処理を行う

出荷済み --> [*]
キャンセル済み --> [*]
@enduml
```

#### 在庫ロットの状態遷移

```plantuml
@startuml
title 在庫ロットの状態遷移図

[*] --> 入荷予定 : 発注する

入荷予定 --> 在庫あり : 入荷を受け入れる

在庫あり --> 引当済み : 在庫引当（受注時）
引当済み --> 在庫あり : 引当解除（キャンセル時）

在庫あり --> 品質期限間近 : 品質維持期限 2 日前（自動）
品質期限間近 --> 廃棄対象 : 品質維持日数超過（自動）

在庫あり --> 出庫済み : 結束に使用
引当済み --> 出庫済み : 結束に使用
品質期限間近 --> 出庫済み : 結束に使用

出庫済み --> [*]
廃棄対象 --> [*]
@enduml
```

#### 発注の状態遷移

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 発注済み : 発注する
発注済み --> 入荷済み : 入荷を受け入れる
発注済み --> キャンセル : 発注をキャンセルする

入荷済み --> [*]
キャンセル --> [*]
@enduml
```
