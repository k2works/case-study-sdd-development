# 要件定義 - フレール・メモワール WEB ショップシステム

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
actor スタッフ

agent 仕入先

usecase "WEB ショップ\nシステム" as system
note top of system
  受注増加に伴う手作業管理の限界を解消し、
  在庫推移の可視化により廃棄ロスを最小化する。
  「新鮮な花を大切な記念日に」を支えるシステム基盤。
end note

:得意先: -- (system)
:スタッフ: -- (system)
(system) -- 仕入先

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
note "WEB から簡単に花束を注文したい" as c_r1
note "届け日を変更したい" as c_r2
note "前回の届け先を再利用したい" as c_r3
note as c_dr1 #Turquoise
  WEB で商品を選択し、届け日・届け先・
  メッセージを指定して注文できること。
  過去の届け先をコピーして再利用できること。
end note
:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor スタッフ
note "受注を効率的に管理したい" as s_r1
note "在庫推移を把握して発注判断したい" as s_r2
note "届け日変更に迅速に対応したい" as s_r3
note "出荷漏れを防ぎたい" as s_r4
note as s_dr1 #Turquoise
  受注一覧の管理、日別在庫推移の表示、
  発注・入荷の記録、出荷管理を
  WEB システムで一元的に行えること。
end note
:スタッフ: -- s_r1
:スタッフ: -- s_r2
:スタッフ: -- s_r3
:スタッフ: -- s_r4
s_r1 -- s_dr1
s_r2 -- s_dr1
s_r3 -- s_dr1
s_r4 -- s_dr1

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
  rectangle 配送 {
    actor "配送スタッフ" as delivery_staff
  }

  usecase "受注管理" as biz_order
  usecase "在庫・仕入管理" as biz_stock
  usecase "結束・出荷" as biz_ship

  artifact 商品
  artifact 単品
  artifact 花束
}

agent 仕入先

:得意先: -- (biz_order)
(biz_order) -- :order_staff:

:purchase_staff: -- (biz_stock)
(biz_stock) -- 単品
(biz_stock) -- 仕入先

:florist: -- (biz_ship)
:delivery_staff: -- (biz_ship)
(biz_ship) -- 商品
(biz_ship) -- 花束

@enduml
```

### ビジネスユースケース

#### 受注管理

```plantuml
@startuml

title ビジネスユースケース図 - 受注管理

left to right direction

actor 得意先
actor "受注スタッフ" as staff

agent "WEB ショップ"

usecase "花束を注文する" as buc01
usecase "届け日を変更する" as buc02
usecase "受注を確認する" as buc03

artifact 受注
artifact 届け先

:得意先: -- (buc01)
:得意先: -- (buc02)
:staff: -- (buc03)

(buc01) -- "WEB ショップ"
(buc02) -- "WEB ショップ"
(buc03) -- "WEB ショップ"

(buc01) -- 受注
(buc01) -- 届け先
(buc02) -- 受注

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ビジネスユースケース図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff
agent 仕入先

usecase "在庫推移を確認する" as buc04
usecase "単品を発注する" as buc05
usecase "入荷を受け入れる" as buc06

artifact 単品
artifact 在庫

:staff: -- (buc04)
:staff: -- (buc05)
:staff: -- (buc06)

(buc04) -- 在庫
(buc05) -- 単品
(buc05) -- 仕入先
(buc06) -- 単品

@enduml
```

#### 結束・出荷

```plantuml
@startuml

title ビジネスユースケース図 - 結束・出荷

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery

usecase "花束を結束する" as buc07
usecase "出荷する" as buc08

artifact 花束
artifact 受注

:florist: -- (buc07)
:delivery: -- (buc08)

(buc07) -- 花束
(buc08) -- 受注

@enduml
```

### 業務フロー

#### 花束を注文する（BUC01）

```plantuml
@startuml

title 業務フロー図 - 花束を注文する

|得意先|
start
partition 商品選択 {
  :WEB ショップで商品一覧を閲覧する;
  :花束を選択する;
}

partition 注文情報入力 {
  :届け日を指定する;
  :届け先情報を入力する;
  note right
    届け先コピー機能で
    過去の届け先を再利用可能
  end note
  :お届けメッセージを入力する;
}

partition 注文確定 {
  :注文内容を確認する;
  :注文を確定する;
}
stop

@enduml
```

#### 届け日を変更する（BUC02）

```plantuml
@startuml

title 業務フロー図 - 届け日を変更する

|得意先|
start
:届け日変更を依頼する;

|受注スタッフ|
:受注情報を確認する;
:変更後の届け日で出荷可否を判断する;

if (出荷可能か？) then (可能)
  :届け日を変更する;
  |得意先|
  :変更完了の通知を受ける;
else (不可)
  |得意先|
  :変更不可の連絡を受ける;
endif
stop

@enduml
```

#### 在庫推移を確認し発注する（BUC04・05）

```plantuml
@startuml

title 業務フロー図 - 在庫推移確認と発注

|仕入スタッフ|
start
partition 在庫確認 {
  :在庫推移画面を表示する;
  :日別の在庫予定数を確認する;
  note right
    品質維持日数を考慮した
    在庫推移を表示
  end note
}

if (発注が必要か？) then (必要)
  partition 発注 {
    :発注する単品と数量を決定する;
    note right
      購入単位数に基づく数量調整
      リードタイムを考慮した入荷日
    end note
    :仕入先に発注する;
  }
else (不要)
endif
stop

@enduml
```

#### 入荷を受け入れる（BUC06）

```plantuml
@startuml

title 業務フロー図 - 入荷受け入れ

|仕入スタッフ|
start
:入荷した単品を確認する;
:入荷数量を記録する;
:在庫に反映する;
stop

@enduml
```

#### 結束・出荷する（BUC07・08）

```plantuml
@startuml

title 業務フロー図 - 結束・出荷

|フローリスト|
start
partition 結束 {
  :出荷日の受注一覧を確認する;
  note right
    出荷日 = 届け日の前日
  end note
  :商品構成に従い花材を準備する;
  :花束を結束する;
}

|配送スタッフ|
partition 出荷 {
  :出荷対象の花束と届け先を確認する;
  :出荷する;
}
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

frame "記念日の花束注文"
note right of "記念日の花束注文"
  大切な人の記念日に花束を届けたい得意先が、
  WEB ショップから花束を選び、届け日・届け先・
  メッセージを指定して注文する。
  リピーターは前回の届け先をコピーできる。
end note

frame "届け日の変更対応"
note right of "届け日の変更対応"
  得意先から届け日変更の依頼があった場合、
  受注スタッフが在庫状況を確認し、
  変更可否を判断して迅速に回答する。
end note

usecase "花束を注文する" as uc01
usecase "届け先をコピーする" as uc02
usecase "届け日を変更する" as uc03
usecase "受注を確認する" as uc04

:得意先: -- "記念日の花束注文"
"記念日の花束注文" -- (uc01)
"記念日の花束注文" -- (uc02)

:得意先: -- "届け日の変更対応"
:staff: -- "届け日の変更対応"
"届け日の変更対応" -- (uc03)
"届け日の変更対応" -- (uc04)

@enduml
```

#### 在庫・仕入管理の利用シーン

```plantuml
@startuml

title 利用シーン図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff

frame "発注判断"
note right of "発注判断"
  仕入スタッフが日別の在庫推移を確認し、
  品質維持日数を考慮した上で
  発注の要否と数量を判断する。
  自動発注ではなく人間の判断を重視。
end note

frame "入荷処理"
note right of "入荷処理"
  仕入先から届いた単品の入荷を記録し、
  在庫推移に反映する。
  仕入先の供給能力は十分で納期は正確。
end note

usecase "在庫推移を確認する" as uc05
usecase "単品を発注する" as uc06
usecase "入荷を受け入れる" as uc07

:staff: -- "発注判断"
"発注判断" -- (uc05)
"発注判断" -- (uc06)

:staff: -- "入荷処理"
"入荷処理" -- (uc07)

@enduml
```

### バリエーション・条件

#### 受注状態

| 状態 | 説明 |
| :--- | :--- |
| 注文済み | 得意先が注文を確定した状態 |
| 出荷準備中 | 結束作業が完了し出荷待ちの状態 |
| 出荷済み | 配送に出した状態 |
| キャンセル | 注文がキャンセルされた状態 |

#### 在庫種別

| 種別 | 説明 |
| :--- | :--- |
| 有効在庫 | 品質維持日数内の使用可能な在庫 |
| 引当済み在庫 | 受注に紐づけられた在庫 |
| 廃棄対象在庫 | 品質維持日数を超過した在庫 |

#### 届け日変更可否条件

| 条件 | 判定 |
| :--- | :--- |
| 変更後の届け日に必要な花材の在庫がある | 変更可能 |
| 変更後の届け日に必要な花材の在庫がない | 変更不可（得意先に通知） |

## システム境界

### ユースケース複合図

#### 受注管理

```plantuml
@startuml

title ユースケース複合図 - 受注管理

left to right direction

actor 得意先 as customer
actor "受注スタッフ" as staff

frame "記念日の花束注文" as f01
frame "届け日の変更対応" as f02

usecase "花束を注文する" as UC1
usecase "届け先をコピーする" as UC2
usecase "届け日を変更する" as UC3
usecase "受注を確認する" as UC4

boundary "商品一覧画面" as b01
boundary "注文画面" as b02
boundary "受注一覧画面" as b03
boundary "届け日変更画面" as b04

entity 受注 as e01
entity 商品 as e02
entity 得意先 as e03
entity 届け先 as e04

control "1受注1届け先1商品" as c01
control "届け日変更可否判定" as c02

customer -- f01
f01 -- UC1
f01 -- UC2

b01 -- UC1
b02 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- e03
UC1 -- c01

b02 -- UC2
UC2 -- e04

customer -- f02
staff -- f02
f02 -- UC3
f02 -- UC4

b04 -- UC3
UC3 -- e01
UC3 -- c02

b03 -- UC4
UC4 -- e01

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ユースケース複合図 - 在庫・仕入管理

left to right direction

actor "仕入スタッフ" as staff

frame "発注判断" as f01
frame "入荷処理" as f02

usecase "在庫推移を確認する" as UC5
usecase "単品を発注する" as UC6
usecase "入荷を受け入れる" as UC7

boundary "在庫推移画面" as b05
boundary "発注画面" as b06
boundary "入荷登録画面" as b07

entity 単品 as e05
entity 在庫 as e06
entity 発注 as e07
entity 入荷 as e08
entity 仕入先 as e09

control "品質維持日数" as c03
control "購入単位数" as c04
control "発注リードタイム" as c05

staff -- f01
f01 -- UC5
f01 -- UC6

b05 -- UC5
UC5 -- e06
UC5 -- c03

b06 -- UC6
UC6 -- e05
UC6 -- e07
UC6 -- e09
UC6 -- c04
UC6 -- c05

staff -- f02
f02 -- UC7

b07 -- UC7
UC7 -- e08
UC7 -- e06

@enduml
```

#### 結束・出荷管理

```plantuml
@startuml

title ユースケース複合図 - 結束・出荷管理

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery

usecase "出荷対象を確認する" as UC8
usecase "出荷する" as UC9

boundary "出荷一覧画面" as b08
boundary "出荷登録画面" as b09

entity 受注 as e01
entity 商品構成 as e10

control "出荷日は届け日の前日" as c06

florist -- UC8
delivery -- UC9

b08 -- UC8
UC8 -- e01
UC8 -- e10
UC8 -- c06

b09 -- UC9
UC9 -- e01

@enduml
```

#### 商品管理

```plantuml
@startuml

title ユースケース複合図 - 商品管理

left to right direction

actor スタッフ as staff

usecase "商品を管理する" as UC10
usecase "単品を管理する" as UC11

boundary "商品管理画面" as b10
boundary "単品管理画面" as b11

entity 商品 as e02
entity 商品構成 as e10
entity 単品 as e05

staff -- UC10
staff -- UC11

b10 -- UC10
UC10 -- e02
UC10 -- e10

b11 -- UC11
UC11 -- e05

@enduml
```

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

' 顧客関連
entity 得意先
entity 届け先

' 受注関連
entity 受注

' 商品関連
entity 商品
entity 商品構成
entity 単品

' 仕入関連
entity 仕入先
entity 発注
entity 入荷

' 在庫関連
entity 在庫

' 関連付け
得意先 -- 受注
得意先 -- 届け先
受注 -- 届け先
受注 -- 商品

商品 -- 商品構成
商品構成 -- 単品

単品 -- 仕入先
単品 -- 発注
単品 -- 入荷
単品 -- 在庫

発注 -- 仕入先

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 注文済み : 花束を注文する

注文済み --> 注文済み : 届け日を変更する\n[変更可能]
注文済み --> 出荷準備中 : 出荷対象を確認する\n[出荷日到来]
注文済み --> キャンセル : 注文をキャンセルする

出荷準備中 --> 出荷済み : 出荷する

キャンセル --> [*]
出荷済み --> [*]

@enduml
```

#### 在庫の状態遷移

```plantuml
@startuml
title 在庫の状態遷移図

[*] --> 有効 : 入荷を受け入れる

有効 --> 引当済み : 花束を注文する\n[受注に紐づけ]
有効 --> 廃棄対象 : 品質維持日数超過

引当済み --> 有効 : 注文をキャンセルする
引当済み --> 消費済み : 花束を結束する

廃棄対象 --> [*] : 廃棄する
消費済み --> [*]

@enduml
```

#### 発注の状態遷移

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 発注済み : 単品を発注する

発注済み --> 入荷済み : 入荷を受け入れる

入荷済み --> [*]

@enduml
```
