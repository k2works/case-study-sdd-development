# 要件定義 - フレール・メモワール WEB ショップシステム

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
actor "フレール・メモワール\n（スタッフ）" as staff
actor 仕入先

usecase "WEB ショップシステム" as system
note top of system
  受注から出荷までの業務を効率化し、
  在庫推移の可視化により廃棄ロスを最小化する。
  リピーターが簡単に注文できる仕組みを提供する。
end note

:得意先: -- (system) : 商品注文・届け日変更
:staff: -- (system) : 受注管理・在庫確認・発注・出荷
:仕入先: -- (system) : 発注受付・納品

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
note "WEB から手軽に花束を注文したい" as c_r1
note "届け日・届け先・メッセージを指定したい" as c_r2
note "過去の届け先を再利用したい" as c_r3
note as c_dr1 #Turquoise
  WEB 受注機能と届け先コピー機能により
  簡単にリピート注文できること
end note
:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor "フレール・メモワール\n（スタッフ）" as staff
note "受注処理を効率化したい" as s_r1
note "在庫推移を可視化して廃棄ロスを減らしたい" as s_r2
note "発注判断の精度を上げたい" as s_r3
note as s_dr1 #Turquoise
  在庫推移表示と発注管理機能により
  判断材料を提供し人間判断を支援すること
end note
:staff: -- s_r1
:staff: -- s_r2
:staff: -- s_r3
s_r1 -- s_dr1
s_r2 -- s_dr1
s_r3 -- s_dr1

actor 仕入先
note "安定した発注を受けたい" as v_r1
note "正確な納品タイミングを把握したい" as v_r2
note as v_dr1 #Turquoise
  発注管理機能により
  計画的な発注と納品管理ができること
end note
:仕入先: -- v_r1
:仕入先: -- v_r2
v_r1 -- v_dr1
v_r2 -- v_dr1

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
  rectangle "店舗運営" {
    actor "フローリスト" as florist
  }

  rectangle "営業・受注" {
    actor "受注スタッフ" as order_staff
  }

  rectangle "仕入・在庫" {
    actor "仕入スタッフ" as purchase_staff
  }

  rectangle "配送" {
    actor "配送スタッフ" as delivery_staff
  }

  rectangle "IT" {
    artifact "WEB ショップシステム" as web_system
  }

  usecase "受注管理" as biz_order
  usecase "在庫管理" as biz_stock
  usecase "仕入管理" as biz_purchase
  usecase "製造管理（結束）" as biz_manufacture
  usecase "配送管理" as biz_delivery
}

actor 仕入先

:得意先: -- (biz_order) : 注文
:order_staff: -- (biz_order)
:purchase_staff: -- (biz_stock)
:purchase_staff: -- (biz_purchase)
:florist: -- (biz_manufacture)
:delivery_staff: -- (biz_delivery)
:仕入先: -- (biz_purchase) : 納品

@enduml
```

### ビジネスユースケース

```plantuml
@startuml

title ビジネスユースケース図 - 花束注文管理業務

left to right direction

actor 得意先
actor "フレール・メモワール\n（スタッフ）" as staff
actor 仕入先

agent "WEB ショップ" as web_shop
agent "店舗" as shop

usecase "商品企画" as buc_01
usecase "WEB 受注" as buc_02
usecase "仕入れ・入荷" as buc_03
usecase "結束（商品化）" as buc_04
usecase "出荷・配送" as buc_05

artifact "商品マスタ" as af_01
artifact "受注情報" as af_02
artifact "在庫情報" as af_03
artifact "発注情報" as af_04

:staff: -- (buc_01)
:得意先: -- (buc_02)
:staff: -- (buc_02)
:staff: -- (buc_03)
:仕入先: -- (buc_03)
:staff: -- (buc_04)
:staff: -- (buc_05)

(buc_01) -- web_shop
(buc_02) -- web_shop
(buc_03) -- shop
(buc_04) -- shop
(buc_05) -- shop

(buc_01) -- af_01
(buc_02) -- af_02
(buc_03) -- af_03
(buc_03) -- af_04
(buc_04) -- af_02
(buc_05) -- af_02

@enduml
```

### 業務フロー

**WEB 受注の業務フロー**

```plantuml
@startuml

title 業務フロー図 - WEB 受注

|得意先|
start
:WEB ショップで商品（花束）を選択;
:届け日を指定;
:届け先を入力（または過去の届け先をコピー）;
:メッセージを入力;
:注文を確定;

|フレール・メモワール（スタッフ）|
:受注を登録;
:受注内容を確認;

note right
  1 受注 = 1 届け先 = 1 商品（花束）
end note

stop

@enduml
```

**仕入れ・入荷の業務フロー**

```plantuml
@startuml

title 業務フロー図 - 仕入れ・入荷

|フレール・メモワール（スタッフ）|
start
:在庫推移を確認;

note right
  品質維持日数を考慮した
  日別の在庫予定数を確認
end note

if (在庫が十分か？) then (不足)
  :発注内容を決定;

  note right
    発注判断は人間が行い、
    システムは判断材料を提供する
  end note

  :仕入先に発注;

  |仕入先|
  :単品（花）を出荷;

  note right
    単品ごとに特定の仕入先が決まっている
  end note

  |フレール・メモワール（スタッフ）|
  :入荷を受け入れ;
  :在庫に反映;
else (十分)
endif

stop

@enduml
```

**出荷・配送の業務フロー**

```plantuml
@startuml

title 業務フロー図 - 出荷・配送

|フレール・メモワール（スタッフ）|
start
:出荷予定の受注を確認;

note right
  出荷日 = 届け日の前日
end note

:必要な花材を準備;
:花束を結束（商品化）;
:出荷処理;
:配送手配;

|得意先|
:届け先で花束を受け取り;
stop

@enduml
```

**届け日変更の業務フロー**

```plantuml
@startuml

title 業務フロー図 - 届け日変更

|得意先|
start
:届け日変更を依頼;

|フレール・メモワール（スタッフ）|
:変更後の届け日を確認;
:在庫推移を再確認;

if (変更後の日程で在庫確保可能か？) then (可能)
  :届け日を変更;
  :出荷日を再計算;

  note right
    出荷日 = 届け日の前日
  end note

else (不可)
  |得意先|
  :変更不可の通知を受け取り;
endif

stop

@enduml
```

### 利用シーン

**得意先の注文シーン**

得意先が記念日に花束を贈るために WEB ショップから注文する場面。届け日・届け先・メッセージを指定し、過去の届け先をコピーして再利用できる。

```plantuml
@startuml

title 利用シーン図 - 得意先の注文

left to right direction

actor 得意先

frame "記念日に花束を贈りたい" as scene_01
note right of scene_01
  背景: 大切な人の誕生日や記念日に花束を届けたい
  目的: WEB ショップから簡単に花束を注文する
  期待効果: 指定日に新鮮な花束が届く
  制約: 届け日の数日前までに注文が必要
end note

frame "以前と同じ届け先に贈りたい" as scene_02
note right of scene_02
  背景: リピーターが毎年同じ届け先に花束を贈る
  目的: 過去の届け先情報を再利用して手間を省く
  期待効果: 届け先入力の手間が大幅に削減される
  制約: 過去に注文履歴がある得意先のみ利用可能
end note

usecase "WEB 受注" as uc_order
usecase "届け先コピー" as uc_copy

:得意先: -- scene_01
:得意先: -- scene_02
scene_01 -- (uc_order)
scene_02 -- (uc_copy)

@enduml
```

**スタッフの在庫確認・発注シーン**

スタッフが在庫推移を確認し、発注判断を行う場面。品質維持日数を考慮した日別在庫予定数を確認し、不足があれば仕入先に発注する。

```plantuml
@startuml

title 利用シーン図 - スタッフの在庫確認・発注

left to right direction

actor "フレール・メモワール\n（スタッフ）" as staff

frame "在庫推移を確認して発注判断したい" as scene_03
note right of scene_03
  背景: 受注に対して在庫が不足しそうな状況
  目的: 日別の在庫予定数を確認し発注するか判断する
  期待効果: 廃棄ロスを最小化しつつ欠品を防ぐ
  制約: 発注判断は人間が行う（人間判断の尊重）
end note

frame "出荷準備を進めたい" as scene_04
note right of scene_04
  背景: 翌日届けの花束を出荷する必要がある
  目的: 出荷予定の受注を確認し結束・出荷を行う
  期待効果: 確実に届け日に届けられる
  制約: 出荷日 = 届け日の前日
end note

usecase "在庫推移表示" as uc_stock
usecase "発注管理" as uc_purchase
usecase "出荷管理" as uc_shipping

:staff: -- scene_03
:staff: -- scene_04
scene_03 -- (uc_stock)
scene_03 -- (uc_purchase)
scene_04 -- (uc_shipping)

@enduml
```

### バリエーション・条件

**商品種別**

| 商品種別 | 説明 |
|----------|------|
| 花束 | 事前に定義された単品の組合せで構成される商品 |

**受注ステータス**

| 受注ステータス | 説明 |
|----------------|------|
| 受注済み | 得意先からの注文を受け付けた状態 |
| 届け日変更済み | 届け日の変更を受け付けた状態（変更確定後に受注済みへ戻る） |
| 出荷準備中 | 出荷日に結束・出荷の準備をしている状態 |
| 出荷済み | 配送手配が完了した状態 |
| 配送完了 | 届け先に届いた状態 |
| キャンセル | 注文がキャンセルされた状態 |

**在庫ステータス**

| 在庫ステータス | 説明 |
|----------------|------|
| 入荷済み | 仕入先から入荷し在庫として保管中 |
| 使用済み | 結束に使用された状態 |
| 廃棄 | 品質維持日数を超過し廃棄された状態 |

**発注ステータス**

| 発注ステータス | 説明 |
|----------------|------|
| 発注済み | 仕入先に発注した状態 |
| 入荷済み | 仕入先から入荷が完了した状態 |

## システム境界

### ユースケース複合図

**WEB 受注**

```plantuml
@startuml

title ユースケース複合図 - WEB 受注

left to right direction

actor 得意先 as customer
actor "フレール・メモワール\n（スタッフ）" as staff

frame "記念日に花束を贈りたい" as f01
usecase "会員登録・ログイン" as UC10
usecase "WEB 受注" as UC1
usecase "届け先コピー" as UC2
usecase "届け日変更" as UC3
usecase "注文キャンセル" as UC11
usecase "得意先管理" as UC9
boundary "ログイン画面" as b04
boundary "会員登録画面" as b05
boundary "商品一覧画面" as b01
boundary "注文画面" as b02
boundary "届け先選択画面" as b03
boundary "注文確認画面" as b06
boundary "注文履歴画面" as b07
boundary "得意先管理画面" as b08
entity "受注" as e01
entity "商品" as e02
entity "届け先" as e03
entity "得意先" as e04
control "在庫確認" as c01
control "届け日検証" as c02
control "認証" as c03

customer -- f01
f01 -- UC10
f01 -- UC1
f01 -- UC2
f01 -- UC3
f01 -- UC11

b04 -- UC10
b05 -- UC10
UC10 -- e04
UC10 -- c03

b01 -- UC1
b02 -- UC1
b06 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- c01

b03 -- UC2
UC2 -- e03
UC2 -- e04

b02 -- UC3
UC3 -- e01
UC3 -- c02

b07 -- UC1
b07 -- UC3
b07 -- UC11
UC11 -- e01

staff -- UC9
b08 -- UC9
UC9 -- e04

@enduml
```

**商品企画・管理**

```plantuml
@startuml

title ユースケース複合図 - 商品企画・管理

left to right direction

actor "フレール・メモワール\n（スタッフ）" as staff

frame "商品ラインナップを管理したい" as f01
usecase "商品マスタ管理" as UC1
boundary "商品管理画面" as b01
entity "商品" as e01
entity "商品構成" as e02
entity "単品" as e03
control "商品構成検証" as c01

staff -- f01
f01 -- UC1

b01 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- e03
UC1 -- c01

@enduml
```

**仕入れ・入荷**

```plantuml
@startuml

title ユースケース複合図 - 仕入れ・入荷

left to right direction

actor "フレール・メモワール\n（スタッフ）" as staff

frame "在庫推移を確認して発注判断したい" as f01
usecase "在庫推移表示" as UC1
usecase "発注管理" as UC2
usecase "入荷管理" as UC3
boundary "在庫推移画面" as b01
boundary "発注管理画面" as b02
boundary "入荷管理画面" as b03
entity "在庫" as e01
entity "単品" as e02
entity "仕入先" as e03
entity "入荷" as e04
control "品質維持日数チェック" as c01
control "発注数量算出" as c02

staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3

b01 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- c01

b02 -- UC2
UC2 -- e02
UC2 -- e03
UC2 -- c02

b03 -- UC3
UC3 -- e04
UC3 -- e01

@enduml
```

**出荷・配送**

```plantuml
@startuml

title ユースケース複合図 - 出荷・配送

left to right direction

actor "フレール・メモワール\n（スタッフ）" as staff

frame "出荷準備を進めたい" as f01
usecase "出荷管理" as UC1
boundary "出荷管理画面" as b01
entity "受注" as e01
entity "在庫" as e02
control "出荷日判定" as c01

staff -- f01
f01 -- UC1

b01 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- c01

@enduml
```

### 画面・帳票モデル

**顧客向け画面**

| 画面名 | 概要 | 関連 UC |
|--------|------|---------|
| ログイン画面 | メールアドレス・パスワードでログインする | 会員登録・ログイン |
| 会員登録画面 | 新規会員登録を行う | 会員登録・ログイン |
| 商品一覧画面 | 花束の一覧を表示し、商品を選択する | WEB 受注 |
| 注文画面 | 届け日・届け先・メッセージを入力し注文を確定する | WEB 受注、届け日変更 |
| 注文確認画面 | 注文確定後の内容を表示する | WEB 受注 |
| 注文履歴画面 | 過去の注文一覧と詳細を参照し、届け日変更・キャンセルへ遷移する | WEB 受注、届け日変更、注文キャンセル |
| 届け先選択画面 | 過去の届け先一覧から選択してコピーする | 届け先コピー |

**管理画面**

| 画面名 | 概要 | 関連 UC |
|--------|------|---------|
| 受注一覧画面 | 受注の一覧・検索・詳細確認を行う | WEB 受注 |
| 在庫推移画面 | 日別の在庫予定数を表示し発注判断を支援する | 在庫推移表示 |
| 発注管理画面 | 仕入先への発注を登録・管理する | 発注管理 |
| 入荷管理画面 | 入荷予定の管理と実績を記録する | 入荷管理 |
| 出荷管理画面 | 出荷予定の受注を確認し出荷処理を行う | 出荷管理 |
| 商品管理画面 | 商品（花束）の構成と単品のマスタを管理する | 商品マスタ管理 |
| 得意先管理画面 | 得意先情報と注文履歴を管理する | 得意先管理 |

### イベントモデル

外部システム連携はスコープ外のため、該当なし。

### ビジネスルール（詳細定義）

**BR06: 在庫推移計算ロジック**

| 項目 | 定義 |
|------|------|
| 日別有効在庫の計算式 | `日別有効在庫 = 現在庫 + 入荷予定 - 受注引当 - 廃棄予定` |
| 引当方式 | 受注確定時に届け日に対して単品単位で引当する |
| 品質維持日数の起算日 | 入荷日を Day 0 とする |
| 品質維持日数の単位 | 日単位でカウントする |
| 廃棄予定の判定 | 品質維持日数を超過した在庫を廃棄予定とする |

**BR07: 届け日有効範囲** ※要ステークホルダー確認

| 項目 | 定義 |
|------|------|
| 最短届け日 | 注文日 + 3日（暫定） |
| 最長届け日 | 注文日 + 30日（暫定） |
| 注文受付期限 | 届け日の 3日前（暫定） |

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

' 顧客関連
entity "得意先" as customer
entity "届け先" as delivery_destination

' 受注関連
entity "受注" as order_entity

' 商品関連
entity "商品（花束）" as product
entity "商品構成" as product_composition
entity "単品（花）" as item

' 仕入関連
entity "仕入先" as supplier
entity "発注" as purchase_order
entity "入荷" as arrival

' 在庫関連
entity "在庫" as stock

' 関連付け
customer -- order_entity : 注文する
customer -- delivery_destination : 届け先を保持する
order_entity -- product : 含む
order_entity -- delivery_destination : 届け先を指定する
product -- product_composition : 構成される
product_composition -- item : 使用する
item -- supplier : 仕入れる
item -- purchase_order : 発注する
supplier -- purchase_order : 発注先
purchase_order -- arrival : 入荷する
item -- stock : 在庫を持つ

@enduml
```

### 状態モデル

**受注の状態遷移**

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 受注済み : WEB 受注

受注済み --> 出荷準備中 : 出荷準備開始
受注済み --> 届け日変更済み : 届け日変更
届け日変更済み --> 受注済み : 変更確定

出荷準備中 --> 出荷済み : 出荷管理
出荷済み --> 配送完了 : 配送完了確認

受注済み --> キャンセル : キャンセル
キャンセル --> [*]
配送完了 --> [*]

@enduml
```

**在庫の状態遷移**

```plantuml
@startuml
title 在庫の状態遷移図

[*] --> 入荷済み : 入荷管理

入荷済み --> 使用済み : 結束（商品化）
入荷済み --> 廃棄 : 品質維持日数超過

使用済み --> [*]
廃棄 --> [*]

note right of 入荷済み
  品質維持日数を考慮した
  在庫推移の可視化が重要
end note

@enduml
```

**発注の状態遷移**

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 発注済み : 発注管理

発注済み --> 入荷済み : 入荷管理

入荷済み --> [*]

@enduml
```
