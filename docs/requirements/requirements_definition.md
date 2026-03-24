---
title: 要件定義 - RDRA
description: フレール・メモワール WEB ショップシステムの要件定義
published: true
date: 2026-03-24
tags:
editor: markdown
---

# 要件定義 - フレール・メモワール WEB ショップシステム

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
actor "フレール・メモワール\nスタッフ" as staff
actor 仕入先

usecase "WEB ショップ\nシステム" as system
note top of system
  新鮮な花を大切な記念日に届けるための
  WEB ショップシステム。
  受注管理・在庫推移可視化・仕入管理を
  一元化し、業務効率化と廃棄ロス削減を実現する。
end note

:得意先: -- (system)
:staff: -- (system)
(system) -- :仕入先:

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
note "記念日に花束を届けたい" as c_r1
note "簡単に注文したい" as c_r2
note "届け日を変更したい" as c_r3
note "前回と同じ届け先に送りたい" as c_r4
note as c_dr1 #Turquoise
  WEB から商品を選択し
  届け日・届け先・メッセージを
  指定して注文できること
end note
note as c_dr2 #Turquoise
  過去の届け先情報を
  コピーして再利用できること
end note
:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
:得意先: -- c_r4
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1
c_r4 -- c_dr2

actor "フレール・メモワール\nスタッフ" as staff
note "受注を効率的に処理したい" as s_r1
note "在庫の過不足を把握したい" as s_r2
note "廃棄ロスを減らしたい" as s_r3
note "適切なタイミングで発注したい" as s_r4
note "出荷を漏れなく管理したい" as s_r5
note as s_dr1 #Turquoise
  受注一覧で注文状況を確認し
  届け日変更にも迅速に対応できること
end note
note as s_dr2 #Turquoise
  品質維持日数を考慮した
  日別在庫推移を可視化し
  発注判断を支援すること
end note
note as s_dr3 #Turquoise
  出荷日（届け日前日）に基づく
  出荷一覧で出荷管理できること
end note
:staff: -- s_r1
:staff: -- s_r2
:staff: -- s_r3
:staff: -- s_r4
:staff: -- s_r5
s_r1 -- s_dr1
s_r2 -- s_dr2
s_r3 -- s_dr2
s_r4 -- s_dr2
s_r5 -- s_dr3

actor 仕入先
note "安定した発注がほしい" as v_r1
note "正確な納品タイミングを知りたい" as v_r2
note as v_dr1 #Turquoise
  発注内容（単品・数量・納品日）を
  明確に伝えられること
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

  usecase "受注管理" as biz_order
  usecase "在庫管理" as biz_stock
  usecase "仕入管理" as biz_purchase
  usecase "製造（結束）" as biz_bundle
  usecase "出荷・配送" as biz_shipping

  artifact "受注台帳" as order_book
  artifact "在庫台帳" as stock_book
  artifact "商品カタログ" as catalog
}

node "外部" {
  agent "仕入先" as supplier
}

:得意先: -- (biz_order)

(biz_order) -- :order_staff:
(biz_stock) -- :purchase_staff:
(biz_purchase) -- :purchase_staff:
(biz_bundle) -- :florist:
(biz_shipping) -- :delivery_staff:

(biz_order) -- order_book
(biz_stock) -- stock_book
(biz_order) -- catalog

(biz_purchase) -- supplier

@enduml
```

### ビジネスユースケース

#### 受注業務

```plantuml
@startuml

title ビジネスユースケース図 - 受注業務

left to right direction

actor 得意先
actor "受注スタッフ" as order_staff

agent "WEB ショップ"

usecase "商品を注文する" as uc_01
usecase "届け日を変更する" as uc_02
usecase "届け先をコピーする" as uc_03
usecase "受注を確認する" as uc_04

artifact "受注台帳" as af_01
artifact "商品カタログ" as af_02

:得意先: -- (uc_01)
:得意先: -- (uc_02)
:得意先: -- (uc_03)

:order_staff: -- (uc_04)

(uc_01) -- "WEB ショップ"
(uc_02) -- "WEB ショップ"
(uc_03) -- "WEB ショップ"
(uc_04) -- "WEB ショップ"

(uc_01) -- af_01
(uc_01) -- af_02
(uc_04) -- af_01

@enduml
```

#### 仕入・在庫業務

```plantuml
@startuml

title ビジネスユースケース図 - 仕入・在庫業務

left to right direction

actor "仕入スタッフ" as purchase_staff
actor 仕入先

agent "事務所"

usecase "在庫推移を確認する" as uc_01
usecase "発注する" as uc_02
usecase "入荷を受け入れる" as uc_03
usecase "単品を納品する" as uc_04

artifact "在庫台帳" as af_01
artifact "発注書" as af_02

:purchase_staff: -- (uc_01)
:purchase_staff: -- (uc_02)
:purchase_staff: -- (uc_03)
:仕入先: -- (uc_04)

(uc_01) -- "事務所"
(uc_02) -- "事務所"
(uc_03) -- "事務所"

(uc_01) -- af_01
(uc_02) -- af_02
(uc_03) -- af_01

@enduml
```

#### 出荷・配送業務

```plantuml
@startuml

title ビジネスユースケース図 - 出荷・配送業務

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery_staff
actor 得意先

agent "店舗"

usecase "花束を結束する" as uc_01
usecase "出荷する" as uc_02
usecase "配送する" as uc_03

artifact "出荷一覧" as af_01

:florist: -- (uc_01)
:delivery_staff: -- (uc_02)
:delivery_staff: -- (uc_03)
:得意先: <-- (uc_03)

(uc_01) -- "店舗"
(uc_02) -- "店舗"

(uc_01) -- af_01
(uc_02) -- af_01

@enduml
```

### 業務フロー

#### 商品注文の業務フロー

```plantuml
@startuml

title 業務フロー図 - 商品注文

|得意先|
start
:WEB ショップにアクセスする;
:商品カタログから花束を選択する;
:届け日を指定する;
:届け先情報を入力する;
note right
  過去の届け先がある場合は
  コピーして利用可能
end note
:お届けメッセージを入力する;
:注文を確定する;

|受注スタッフ|
:受注内容を確認する;
:受注を登録する;
stop

@enduml
```

#### 届け日変更の業務フロー

```plantuml
@startuml

title 業務フロー図 - 届け日変更

|得意先|
start
:届け日変更を依頼する;

|受注スタッフ|
:変更後の届け日の在庫推移を確認する;

if (変更後の届け日で出荷可能か？) then (可能)
  :届け日を変更する;
  |得意先|
  :変更完了の通知を受け取る;
else (不可)
  |得意先|
  :変更不可の通知を受け取る;
endif
stop

@enduml
```

#### 仕入・入荷の業務フロー

```plantuml
@startuml

title 業務フロー図 - 仕入・入荷

|仕入スタッフ|
start
:在庫推移を確認する;
note right
  品質維持日数を考慮した
  日別在庫予定数を確認
end note

if (在庫が不足しているか？) then (不足)
  :発注する単品と数量を決定する;
  note right
    発注判断は人間が行う
    システムは判断材料を提供
  end note
  :仕入先に発注する;

  |仕入先|
  :単品を出荷する;

  |仕入スタッフ|
  :入荷を受け入れる;
  :在庫を更新する;
else (十分)
endif
stop

@enduml
```

#### 出荷の業務フロー

```plantuml
@startuml

title 業務フロー図 - 出荷

|フローリスト|
start
:出荷一覧を確認する;
note right
  出荷日（届け日の前日）に基づく
  出荷対象の受注一覧
end note
:花材を準備する;
:花束を結束する;

|配送スタッフ|
:出荷処理を行う;
:配送手配をする;
:届け先に配送する;
stop

@enduml
```

### 利用シーン

#### 受注業務の利用シーン

```plantuml
@startuml

title 利用シーン図 - 受注業務

left to right direction

actor 得意先
actor "受注スタッフ" as staff

frame "初めての注文" as scene1
note right of scene1
  得意先が初めて花束を注文する場面。
  商品カタログから花束を選び、
  届け日・届け先・メッセージを入力する。
end note

frame "リピート注文" as scene2
note right of scene2
  以前注文したことのある得意先が
  同じ届け先に再度注文する場面。
  過去の届け先をコピーして利用する。
end note

frame "届け日変更" as scene3
note right of scene3
  注文済みの得意先が届け日の変更を
  依頼する場面。受注スタッフが
  在庫推移を確認し変更可否を判断する。
end note

usecase "商品を注文する" as UC1
usecase "届け先をコピーする" as UC2
usecase "届け日を変更する" as UC3
usecase "受注を確認する" as UC4

:得意先: -- scene1
scene1 -- (UC1)

:得意先: -- scene2
scene2 -- (UC1)
scene2 -- (UC2)

:得意先: -- scene3
:staff: -- scene3
scene3 -- (UC3)
scene3 -- (UC4)

@enduml
```

#### 仕入・在庫業務の利用シーン

```plantuml
@startuml

title 利用シーン図 - 仕入・在庫業務

left to right direction

actor "仕入スタッフ" as staff

frame "朝の在庫確認" as scene1
note right of scene1
  仕入スタッフが毎朝の業務開始時に
  在庫推移を確認し、不足が見込まれる
  単品を特定する場面。
end note

frame "発注判断" as scene2
note right of scene2
  在庫推移を見て不足を確認し、
  仕入先に発注を行う場面。
  品質維持日数とリードタイムを
  考慮して発注量を決定する。
end note

frame "入荷受入" as scene3
note right of scene3
  仕入先から単品が届いた際に
  入荷を受け入れ、在庫に反映する場面。
end note

usecase "在庫推移を確認する" as UC1
usecase "発注する" as UC2
usecase "入荷を受け入れる" as UC3

:staff: -- scene1
scene1 -- (UC1)

:staff: -- scene2
scene2 -- (UC1)
scene2 -- (UC2)

:staff: -- scene3
scene3 -- (UC3)

@enduml
```

### バリエーション・条件

#### 商品種別

| 種別 | 説明 |
|------|------|
| 花束 | 事前定義された単品の組合せ。商品として販売する単位 |

#### 注文状態

| 状態 | 説明 |
|------|------|
| 受注済み | 注文が確定し、出荷待ちの状態 |
| 出荷済み | 花束が結束され出荷された状態 |
| キャンセル | 注文が取り消された状態 |

#### 在庫区分

| 区分 | 説明 |
|------|------|
| 良品在庫 | 品質維持日数内で使用可能な在庫 |
| 入荷予定 | 発注済みで未入荷の在庫 |
| 引当済み | 受注に紐づいて確保された在庫 |
| 廃棄対象 | 品質維持日数を超過し使用不可の在庫 |

#### 届け先区分

| 区分 | 説明 |
|------|------|
| 新規入力 | 初めて使用する届け先情報 |
| コピー利用 | 過去の注文から届け先情報をコピーして利用 |

#### 認証方式

| 方式 | 説明 |
|------|------|
| 会員登録 | 得意先はメールアドレスとパスワードで会員登録し、ログインして注文する |
| スタッフ認証 | スタッフは管理画面にユーザー ID とパスワードでログインする |

**備考**: ゲスト注文は初回リリースではサポートしない。届け先コピー機能（UC-06）は会員登録が前提。決済処理はクレジットカード事前登録済みの前提とし、システムスコープ外とする。

## システム境界

### ユースケース複合図

#### 受注業務

```plantuml
@startuml

title ユースケース複合図 - 受注業務

left to right direction

actor 得意先 as customer
actor "受注スタッフ" as staff

frame "初めての注文" as f01
usecase "商品を注文する" as UC1
boundary "商品選択画面" as b01
boundary "注文入力画面" as b02
entity "受注" as e01
entity "商品" as e02
entity "得意先" as e03
control "届け日は未来日であること" as c01

customer -- f01
f01 -- UC1

b01 -- UC1
b02 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- e03
UC1 -- c01

frame "リピート注文" as f02
usecase "届け先をコピーする" as UC2
boundary "届け先選択画面" as b03
entity "届け先" as e04

customer -- f02
f02 -- UC2
b03 -- UC2
UC2 -- e04

frame "届け日変更" as f03
usecase "届け日を変更する" as UC3
usecase "受注を確認する" as UC4
boundary "受注一覧画面" as b04
boundary "受注詳細画面" as b05
entity "在庫推移" as e05
control "変更後の届け日で出荷可能であること" as c02

staff -- f03
f03 -- UC3
f03 -- UC4
b04 -- UC4
b05 -- UC3
UC3 -- e01
UC3 -- e05
UC3 -- c02
UC4 -- e01

frame "注文キャンセル" as f04
usecase "注文をキャンセルする" as UC5
control "出荷前であること" as c03

customer -- f04
staff -- f04
f04 -- UC5
b05 -- UC5
UC5 -- e01
UC5 -- c03

@enduml
```

#### 仕入・在庫業務

```plantuml
@startuml

title ユースケース複合図 - 仕入・在庫業務

left to right direction

actor "仕入スタッフ" as staff
actor 仕入先

frame "朝の在庫確認" as f01
usecase "在庫推移を確認する" as UC1
boundary "在庫推移画面" as b01
entity "在庫推移" as e01
entity "単品" as e02
control "品質維持日数を考慮した推移計算" as c01

staff -- f01
f01 -- UC1
b01 -- UC1
UC1 -- e01
UC1 -- e02
UC1 -- c01

frame "発注判断" as f02
usecase "発注する" as UC2
boundary "発注入力画面" as b02
entity "発注" as e03
entity "仕入先" as e04
control "購入単位の整数倍であること" as c02

staff -- f02
f02 -- UC2
b02 -- UC2
UC2 -- e03
UC2 -- e04
UC2 -- c02

frame "入荷受入" as f03
usecase "入荷を受け入れる" as UC3
boundary "入荷入力画面" as b03
entity "入荷" as e05

staff -- f03
f03 -- UC3
b03 -- UC3
UC3 -- e05
UC3 -- e02

@enduml
```

#### 出荷・配送業務

```plantuml
@startuml

title ユースケース複合図 - 出荷・配送業務

left to right direction

actor "フローリスト" as florist
actor "配送スタッフ" as delivery_staff

frame "出荷準備" as f01
usecase "出荷一覧を確認する" as UC1
usecase "出荷処理を行う" as UC2
boundary "出荷一覧画面" as b01
entity "受注" as e01
entity "出荷" as e02
control "出荷日 = 届け日の前日" as c01

florist -- f01
delivery_staff -- f01
f01 -- UC1
f01 -- UC2
b01 -- UC1
b01 -- UC2
UC1 -- e01
UC1 -- c01
UC2 -- e02
UC2 -- e01

@enduml
```

#### 商品管理業務

```plantuml
@startuml

title ユースケース複合図 - 商品管理業務

left to right direction

actor "スタッフ" as staff

frame "商品管理" as f01
usecase "商品を登録する" as UC1
usecase "単品を管理する" as UC2
usecase "花束構成を定義する" as UC3
boundary "商品管理画面" as b01
boundary "単品管理画面" as b02
entity "商品" as e01
entity "単品" as e02
entity "商品構成" as e03

staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3
b01 -- UC1
b01 -- UC3
b02 -- UC2
UC1 -- e01
UC2 -- e02
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

left to right direction

' 商品関連
entity 商品
entity 単品
entity 商品構成

' 受注関連
entity 受注
entity 届け先
entity 得意先

' 仕入関連
entity 仕入先
entity 発注
entity 入荷

' 在庫関連
entity 在庫

' 出荷関連
entity 出荷

' 関連付け（多重度付き）
商品 "1" -- "1..*" 商品構成
商品構成 "*" -- "1" 単品

受注 "*" -- "1" 商品
受注 "1" -- "1" 届け先
受注 "*" -- "1" 得意先
得意先 "1" -- "0..*" 届け先

単品 "*" -- "1" 仕入先
発注 "*" -- "1" 単品
発注 "*" -- "1" 仕入先
入荷 "1" -- "1" 発注
入荷 "*" -- "1" 単品

単品 "1" -- "0..*" 在庫

受注 "1" -- "0..1" 出荷

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 受注済み : 商品を注文する

受注済み --> 受注済み : 届け日を変更する

受注済み --> 出荷済み : 出荷処理を行う

受注済み --> キャンセル : 注文をキャンセルする

出荷済み --> [*]
キャンセル --> [*]
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

#### 在庫の状態遷移

```plantuml
@startuml
title 在庫（単品ロット）の状態遷移図

[*] --> 入荷予定 : 発注する

入荷予定 --> 良品在庫 : 入荷を受け入れる

良品在庫 --> 引当済み : 受注に引き当てる
引当済み --> 良品在庫 : 引当を解除する

良品在庫 --> 廃棄対象 : 品質維持日数を超過する
引当済み --> 出荷済み : 出荷処理を行う

出荷済み --> [*]
廃棄対象 --> [*]
@enduml
```

---

## トレーサビリティ

### 要求 → ユースケース対応表

| 要求 | ユースケース |
|------|-------------|
| 記念日に花束を届けたい | 商品を注文する |
| 簡単に注文したい | 商品を注文する |
| 届け日を変更したい | 届け日を変更する |
| 前回と同じ届け先に送りたい | 届け先をコピーする |
| 受注を効率的に処理したい | 受注を確認する |
| 在庫の過不足を把握したい | 在庫推移を確認する |
| 廃棄ロスを減らしたい | 在庫推移を確認する |
| 適切なタイミングで発注したい | 発注する |
| 出荷を漏れなく管理したい | 出荷一覧を確認する、出荷処理を行う |
| 安定した発注がほしい | 発注する |
| 正確な納品タイミングを知りたい | 発注する |
