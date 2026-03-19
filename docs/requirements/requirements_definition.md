---
title: 要件定義 - RDRA
description: フラワーショップ「フレール・メモワール」 WEB ショップシステムの要件定義
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - requirements
  - rdra
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# 要件定義 - フラワーショップ「フレール・メモワール」 WEB ショップシステム

本書は、フラワーショップ「フレール・メモワール」の WEB ショップシステムを RDRA 2.0 に基づいて整理した要件定義書です。ビジネスアーキテクチャとインセプションデッキを入力として、システム価値、外部環境、システム境界、内部構造を一貫して定義します。

## システム価値

### システムコンテキスト

```plantuml
@startuml

title システムコンテキスト図 - フラワーショップ「フレール・メモワール」 WEB ショップシステム

left to right direction

actor 得意先
actor "受注スタッフ" as sales_staff
actor "仕入スタッフ" as purchase_staff
actor フローリスト
actor 仕入先

usecase "WEB ショップシステム" as system
note top of system
  個人顧客向けの花束注文を受け付け、
  受注から出荷までの業務を効率化する。
  品質維持日数を考慮した在庫推移を可視化し、
  廃棄ロス最小化とリピート注文のしやすさを両立する。
end note

得意先 -- system
sales_staff -- system
purchase_staff -- system
フローリスト -- system
仕入先 -- system

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フラワーショップ「フレール・メモワール」 WEB ショップシステム

left to right direction

actor 得意先
note "記念日に確実に花束を届けてほしい" as c_r1
note "毎回同じ届け先情報を簡単に再利用したい" as c_r2
note "商品選択から注文確定までを迷わず完了したい" as c_r3
note as c_dr1 #Turquoise
  届け日、届け先、メッセージを
  一貫して入力・確認・確定できること
  過去の届け先を再利用できること
end note
得意先 -- c_r1
得意先 -- c_r2
得意先 -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor "受注スタッフ" as sales_staff
note "受注内容を漏れなく管理したい" as s_r1
note "届け日変更の可否をすぐ判断したい" as s_r2
note "顧客対応を手作業に依存せず進めたい" as s_r3
note as s_dr1 #Turquoise
  受注一覧、変更対応、顧客履歴参照を
  同一システムで扱えること
end note
sales_staff -- s_r1
sales_staff -- s_r2
sales_staff -- s_r3
s_r1 -- s_dr1
s_r2 -- s_dr1
s_r3 -- s_dr1

actor "仕入スタッフ" as purchase_staff
note "日別の在庫推移を把握したい" as p_r1
note "発注判断に必要な情報をまとめて見たい" as p_r2
note "入荷予定と実績を正確に管理したい" as p_r3
note as p_dr1 #Turquoise
  品質維持日数、購入単位、リードタイムを踏まえた
  在庫推移と発注・入荷情報を可視化できること
end note
purchase_staff -- p_r1
purchase_staff -- p_r2
purchase_staff -- p_r3
p_r1 -- p_dr1
p_r2 -- p_dr1
p_r3 -- p_dr1

@enduml
```

### 要求一覧

| ステークホルダー | 要求 | 派生要件 |
| :--- | :--- | :--- |
| 得意先 | 記念日に確実に花束を届けてほしい | 注文時に届け日を指定でき、出荷管理まで追跡できること |
| 得意先 | リピート注文を簡単にしたい | 過去の届け先をコピーして再利用できること |
| 得意先 | 注文を迷わず完了したい | 商品選択、届け先入力、メッセージ入力、確認を画面遷移として整理すること |
| 受注スタッフ | 受注内容を一元管理したい | 受注一覧、受注詳細、変更履歴を管理できること |
| 受注スタッフ | 届け日変更の可否を即時判断したい | 在庫推移と出荷条件を参照して変更可否を判断できること |
| 仕入スタッフ | 廃棄ロスを減らしたい | 在庫推移と品質維持期限を可視化できること |
| 仕入スタッフ | 発注判断を支援してほしい | 発注対象、必要数量、仕入先、リードタイムを把握できること |
| フローリスト | 出荷日に必要な花材を確実に揃えたい | 花束構成と出荷予定から必要花材を確認できること |

## システム外部環境

### ビジネスコンテキスト

```plantuml
@startuml

title ビジネスコンテキスト図 - フラワーショップ「フレール・メモワール」 WEB ショップシステム

left to right direction

actor 得意先

node "フレール・メモワール" {
  rectangle "営業・受注" {
    actor "受注スタッフ" as sales_staff
  }

  rectangle "仕入・在庫" {
    actor "仕入スタッフ" as purchase_staff
  }

  rectangle "製造・出荷" {
    actor フローリスト
  }

  usecase "WEB 受注" as biz_order
  usecase "仕入れ・入荷" as biz_purchase
  usecase "結束・出荷" as biz_ship

  artifact "受注情報" as order_info
  artifact "在庫推移" as stock_projection
  artifact "花束構成" as bouquet_recipe
}

node "外部" {
  actor 仕入先
}

得意先 -- biz_order
biz_order -- sales_staff
biz_purchase -- purchase_staff
biz_ship -- フローリスト

biz_order -- order_info
biz_purchase -- stock_projection
biz_ship -- bouquet_recipe

biz_purchase -- 仕入先

@enduml
```

### ビジネスユースケース

#### WEB 受注

```plantuml
@startuml

title ビジネスユースケース図 - WEB 受注

left to right direction

actor 得意先
actor "受注スタッフ" as sales_staff
agent "フレール・メモワール" as shop

usecase "商品を選択する" as buc_01
usecase "注文を確定する" as buc_02
usecase "届け日を変更する" as buc_03
usecase "届け先を再利用する" as buc_04

artifact "受注情報" as af_01
artifact "顧客情報" as af_02

得意先 -- buc_01
得意先 -- buc_02
得意先 -- buc_03
得意先 -- buc_04
sales_staff -- buc_03

buc_01 -- shop
buc_02 -- shop
buc_03 -- shop
buc_04 -- shop

buc_02 -- af_01
buc_03 -- af_01
buc_04 -- af_02

@enduml
```

#### 仕入れ・入荷

```plantuml
@startuml

title ビジネスユースケース図 - 仕入れ・入荷

left to right direction

actor "仕入スタッフ" as purchase_staff
actor 仕入先
agent "フレール・メモワール" as shop

usecase "在庫推移を確認する" as buc_11
usecase "発注する" as buc_12
usecase "入荷を記録する" as buc_13

artifact "在庫推移" as af_11
artifact "発注情報" as af_12
artifact "入荷情報" as af_13

purchase_staff -- buc_11
purchase_staff -- buc_12
purchase_staff -- buc_13
仕入先 -- buc_12
仕入先 -- buc_13

buc_11 -- shop
buc_12 -- shop
buc_13 -- shop

buc_11 -- af_11
buc_12 -- af_12
buc_13 -- af_13

@enduml
```

#### 結束・出荷

```plantuml
@startuml

title ビジネスユースケース図 - 結束・出荷

left to right direction

actor フローリスト
actor "受注スタッフ" as sales_staff
agent "フレール・メモワール" as shop

usecase "出荷対象を確認する" as buc_21
usecase "花束を結束する" as buc_22
usecase "出荷を確定する" as buc_23

artifact "出荷予定" as af_21
artifact "花束構成" as af_22
artifact "出荷実績" as af_23

フローリスト -- buc_21
フローリスト -- buc_22
sales_staff -- buc_23

buc_21 -- shop
buc_22 -- shop
buc_23 -- shop

buc_21 -- af_21
buc_22 -- af_22
buc_23 -- af_23

@enduml
```

### 業務フロー

#### 商品を選択して注文を確定する業務フロー

```plantuml
@startuml

title 業務フロー図 - 商品を選択して注文を確定する

|得意先|
start
:商品を選択する;
:届け日・届け先・メッセージを入力する;
:注文内容を確認する;
:注文を確定する;

|受注スタッフ|
:受注内容を確認する;
:出荷日に応じて受注を管理する;
stop

@enduml
```

#### 届け日を変更する業務フロー

```plantuml
@startuml

title 業務フロー図 - 届け日を変更する

|得意先|
start
:届け日変更を依頼する;

|受注スタッフ|
:受注内容を確認する;
:在庫推移と出荷条件を確認する;
if (変更可能か？) then (yes)
  :届け日を変更する;
  |得意先|
  :変更結果を受け取る;
else (no)
  :変更不可を案内する;
  |得意先|
  :代替案を確認する;
endif
stop

@enduml
```

#### 在庫推移を確認して発注する業務フロー

```plantuml
@startuml

title 業務フロー図 - 在庫推移を確認して発注する

|仕入スタッフ|
start
:在庫推移を確認する;
:必要数量と不足日を把握する;
if (発注が必要か？) then (yes)
  :仕入先ごとに発注内容を決める;
  |仕入先|
  :発注内容を受領する;
  :単品を納品する;
  |仕入スタッフ|
  :入荷を記録する;
else (no)
endif
stop

@enduml
```

### 利用シーン

#### 記念日向けの新規注文

```plantuml
@startuml

title 利用シーン図 - 記念日向けの新規注文

left to right direction

actor 得意先
actor "受注スタッフ" as sales_staff

frame "記念日向けの新規注文" as scene_01
note right of scene_01
  得意先が記念日に合わせて花束を注文する。
  届け日、届け先、メッセージを一度の操作で確定し、
  受注スタッフは受注漏れなく後続業務へ引き継げる必要がある。
end note

usecase "注文する" as uc_01
usecase "受注を確認する" as uc_02

得意先 -- scene_01
sales_staff -- scene_01
scene_01 -- uc_01
scene_01 -- uc_02

@enduml
```

#### リピーターによる再注文

```plantuml
@startuml

title 利用シーン図 - リピーターによる再注文

left to right direction

actor 得意先

frame "リピーターによる再注文" as scene_02
note right of scene_02
  過去に注文した得意先が、
  同じ届け先や類似条件で短時間に再注文する。
  入力の手間を減らし、注文完了率を高めることが目的である。
end note

usecase "届け先をコピーする" as uc_11
usecase "注文する" as uc_12

得意先 -- scene_02
scene_02 -- uc_11
scene_02 -- uc_12

@enduml
```

#### 在庫確認にもとづく発注判断

```plantuml
@startuml

title 利用シーン図 - 在庫確認にもとづく発注判断

left to right direction

actor "仕入スタッフ" as purchase_staff
actor 仕入先

frame "在庫確認にもとづく発注判断" as scene_03
note right of scene_03
  仕入スタッフが品質維持日数とリードタイムを見ながら
  発注要否を判断する。
  発注判断そのものは人間が行い、システムは判断材料を提供する。
end note

usecase "在庫推移を確認する" as uc_21
usecase "発注する" as uc_22
usecase "入荷を記録する" as uc_23

purchase_staff -- scene_03
仕入先 -- scene_03
scene_03 -- uc_21
scene_03 -- uc_22
scene_03 -- uc_23

@enduml
```

### バリエーション・条件

#### 顧客種別

| 分類 | 説明 |
|----------|------|
| 新規顧客 | 過去の届け先履歴を持たない顧客 |
| リピーター | 過去の注文履歴や届け先履歴を再利用できる顧客 |

#### 受注変更可否

| 分類 | 説明 |
|----------|------|
| 変更可能 | 在庫と出荷準備状況の条件を満たし、届け日変更を受け付けられる |
| 変更不可 | 在庫不足または出荷準備済みで、届け日変更を受け付けられない |

#### 在庫状態

| 分類 | 説明 |
|----------|------|
| 余裕あり | 予定出荷に対して十分な在庫がある |
| 要発注 | 将来不足が予測され、発注判断が必要である |
| 廃棄注意 | 品質維持期限が近く、廃棄リスクが高い |

## システム境界

### ユースケース複合図

#### 受注管理

```plantuml
@startuml

title ユースケース複合図 - 受注管理

left to right direction

actor 得意先 as customer
actor "受注スタッフ" as sales_staff

frame "記念日向けの新規注文" as f01
usecase "注文する" as UC1
usecase "届け先をコピーする" as UC2
usecase "届け日を変更する" as UC3
boundary "注文画面" as b01
boundary "届け先選択画面" as b02
boundary "受注管理画面" as b03
entity "受注" as e01
entity "届け先" as e02
entity "得意先" as e03
control "届け日変更条件" as c01

customer -- f01
sales_staff -- f01
f01 -- UC1
f01 -- UC2
f01 -- UC3

b01 -- UC1
UC1 -- e01
UC1 -- e03

b02 -- UC2
UC2 -- e02
UC2 -- e03

b03 -- UC3
UC3 -- e01
UC3 -- c01

@enduml
```

#### 仕入管理

```plantuml
@startuml

title ユースケース複合図 - 仕入管理

left to right direction

actor "仕入スタッフ" as purchase_staff
actor 仕入先 as supplier

frame "在庫確認にもとづく発注判断" as f02
usecase "在庫推移を確認する" as UC11
usecase "発注する" as UC12
usecase "入荷を記録する" as UC13
boundary "在庫推移画面" as b11
boundary "発注画面" as b12
boundary "入荷登録画面" as b13
entity "在庫予定" as e11
entity "発注" as e12
entity "入荷" as e13
control "発注判断条件" as c11
interface "発注連絡" as i11

purchase_staff -- f02
supplier -- f02
f02 -- UC11
f02 -- UC12
f02 -- UC13

b11 -- UC11
UC11 -- e11
UC11 -- c11

b12 -- UC12
UC12 -- e12
UC12 -- i11

b13 -- UC13
UC13 -- e13
UC13 -- e11

@enduml
```

#### 出荷管理

```plantuml
@startuml

title ユースケース複合図 - 出荷管理

left to right direction

actor フローリスト as florist
actor "受注スタッフ" as sales_staff

frame "出荷前日の準備と出荷" as f03
usecase "出荷対象を確認する" as UC21
usecase "花束を結束する" as UC22
usecase "出荷を確定する" as UC23
boundary "出荷一覧画面" as b21
boundary "結束確認画面" as b22
boundary "出荷確定画面" as b23
entity "出荷" as e21
entity "花束構成" as e22
entity "受注" as e23
control "出荷確定条件" as c21

florist -- f03
sales_staff -- f03
f03 -- UC21
f03 -- UC22
f03 -- UC23

b21 -- UC21
UC21 -- e21
UC21 -- e23

b22 -- UC22
UC22 -- e22
UC22 -- e23

b23 -- UC23
UC23 -- e21
UC23 -- c21

@enduml
```

### 画面・帳票モデル

| 種別 | 名称 | 主な利用者 | 目的 |
| :--- | :--- | :--- | :--- |
| 画面 | 注文画面 | 得意先 | 商品選択、届け日、届け先、メッセージ入力 |
| 画面 | 注文確認画面 | 得意先 | 注文内容の確認と確定 |
| 画面 | 届け先選択画面 | 得意先 | 過去の届け先の再利用 |
| 画面 | 受注管理画面 | 受注スタッフ | 受注一覧参照、変更対応、顧客対応 |
| 画面 | 在庫推移画面 | 仕入スタッフ | 日別在庫予定数、廃棄注意、発注判断材料の確認 |
| 画面 | 発注画面 | 仕入スタッフ | 発注内容の作成と送信 |
| 画面 | 入荷登録画面 | 仕入スタッフ | 入荷予定と実績の登録 |
| 画面 | 出荷一覧画面 | フローリスト、受注スタッフ | 出荷対象、出荷日、必要花材の確認 |
| 帳票 | 発注一覧 | 仕入スタッフ | 仕入先別の発注内容の確認 |
| 帳票 | 出荷一覧 | フローリスト | 当日作業対象の確認 |

### イベントモデル

| イベント | 発生元 | 受信先 | 内容 |
| :--- | :--- | :--- | :--- |
| 注文確定 | 得意先 | 受注管理 | 新規受注を登録する |
| 届け日変更依頼 | 得意先 | 受注管理 | 既存受注の届け日変更を依頼する |
| 発注実行 | 仕入スタッフ | 仕入先 | 発注内容を通知する |
| 入荷完了 | 仕入先 | 仕入管理 | 納品された単品の受領を登録する |
| 出荷確定 | 受注スタッフ | 出荷管理 | 出荷実績を確定する |

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フラワーショップ「フレール・メモワール」 WEB ショップシステム

left to right direction

entity 得意先
entity 届け先
entity 受注
entity 受注明細
entity 商品
entity 花束構成
entity 単品
entity 仕入先
entity 発注
entity 入荷
entity 在庫予定
entity 出荷

得意先 -- 届け先
得意先 -- 受注
受注 -- 届け先
受注 -- 受注明細
受注明細 -- 商品
商品 -- 花束構成
花束構成 -- 単品
単品 -- 仕入先
単品 -- 在庫予定
発注 -- 単品
発注 -- 仕入先
入荷 -- 発注
出荷 -- 受注
出荷 -- 商品

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 受付前
受付前 --> 受付済み : 注文する
受付済み --> 変更受付中 : 届け日を変更する
変更受付中 --> 受付済み : 変更可能
変更受付中 --> 受付済み : 変更不可
受付済み --> 出荷準備中 : 出荷対象を確認する
出荷準備中 --> 出荷済み : 出荷を確定する
受付済み --> キャンセル : キャンセルする
変更受付中 --> キャンセル : キャンセルする
出荷済み --> [*]
キャンセル --> [*]
@enduml
```

#### 発注の状態遷移

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 未作成
未作成 --> 作成済み : 発注する
作成済み --> 送信済み : 発注連絡
送信済み --> 一部入荷 : 入荷を記録する
一部入荷 --> 入荷完了 : 入荷を記録する
送信済み --> 入荷完了 : 入荷を記録する
作成済み --> 取消 : 取消する
送信済み --> 取消 : 取消する
入荷完了 --> [*]
取消 --> [*]
@enduml
```

#### 出荷の状態遷移

```plantuml
@startuml
title 出荷の状態遷移図

[*] --> 未準備
未準備 --> 準備中 : 出荷対象を確認する
準備中 --> 結束済み : 花束を結束する
結束済み --> 出荷済み : 出荷を確定する
準備中 --> 保留 : 在庫不足
保留 --> 準備中 : 在庫確保
出荷済み --> [*]
@enduml
```

### ビジネスルール

| ID | ルール |
| :--- | :--- |
| BR-01 | 1 受注は 1 届け先、1 商品を前提とする |
| BR-02 | 出荷日は届け日の前日とする |
| BR-03 | 発注判断はスタッフが行い、システムは判断材料を提供する |
| BR-04 | 在庫推移は品質維持日数、購入単位、リードタイムを考慮して算出する |
| BR-05 | 得意先は過去の届け先情報を再利用できる |
| BR-06 | 届け日変更は在庫と出荷準備状況の条件を満たす場合のみ受け付ける |

### 今後の詳細化ポイント

- システムユースケースごとの主成功シナリオと代替フローは、後続の `analyzing-usecases` で完全形式に落とし込みます。
- 画面遷移、画面要素、操作手順の具体化は、後続の `analyzing-ui-design` で定義します。
- 情報モデルの属性、主キー、関連多重度は、後続の `analyzing-data-model` で詳細化します。
- 状態遷移の条件式と例外系は、ユースケース詳細化とドメインモデル設計で精緻化します。
