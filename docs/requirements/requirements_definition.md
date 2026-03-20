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
actor "経営者" as owner
actor "仕入先" as supplier

usecase "フレール・メモワール\nWEB ショップシステム" as web_shop

note top of web_shop
  個人顧客向け花束配送サービスの受注から
  出荷準備までを支援するシステム。
  受注処理の効率化、在庫推移の可視化、
  リピーター体験向上を通じて、
  廃棄ロス最小化と届け日厳守を実現する。
end note

customer -- web_shop : 注文 / 届け日変更 / 届け先再利用
order_staff -- web_shop : 受注確認 / 変更対応
purchase_staff -- web_shop : 在庫推移確認 / 発注登録 / 入荷登録
florist -- web_shop : 出荷対象確認
owner -- web_shop : KPI 確認
supplier -- web_shop : 発注内容受領 / 納品

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor "得意先" as customer
note "迷わず花束を注文したい" as c_r1
note "記念日に確実に届けてほしい" as c_r2
note "同じ届け先へ簡単に再注文したい" as c_r3
note as c_dr1 #Turquoise
  商品選択、届け日、届け先、メッセージを
  WEB で完結できること。
  届け先コピーと届け日変更可否を
  画面上で確認できること。
end note
customer -- c_r1
customer -- c_r2
customer -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor "受注スタッフ" as order_staff
note "受注内容をすぐ確認したい" as o_r1
note "届け日変更に迅速に対応したい" as o_r2
note "手作業転記を減らしたい" as o_r3
note as o_dr1 #Turquoise
  受注一覧、詳細、変更履歴を
  一元管理できること。
  変更時に出荷可否を判断する材料を
  参照できること。
end note
order_staff -- o_r1
order_staff -- o_r2
order_staff -- o_r3
o_r1 -- o_dr1
o_r2 -- o_dr1
o_r3 -- o_dr1

actor "仕入スタッフ" as purchase_staff
note "日別の在庫推移を把握したい" as p_r1
note "必要な単品を適切に発注したい" as p_r2
note "入荷実績を正確に記録したい" as p_r3
note as p_dr1 #Turquoise
  品質維持日数、購入単位、リードタイムを
  加味した在庫予定数を見える化し、
  発注と入荷を記録できること。
end note
purchase_staff -- p_r1
purchase_staff -- p_r2
purchase_staff -- p_r3
p_r1 -- p_dr1
p_r2 -- p_dr1
p_r3 -- p_dr1

actor "経営者" as owner
note "廃棄ロスを減らしたい" as ow_r1
note "受注キャパシティを拡大したい" as ow_r2
note "利益改善の判断材料がほしい" as ow_r3
note as ow_dr1 #Turquoise
  受注件数、廃棄リスク、出荷予定を
  俯瞰できること。
  システム化対象を段階的に拡張できること。
end note
owner -- ow_r1
owner -- ow_r2
owner -- ow_r3
ow_r1 -- ow_dr1
ow_r2 -- ow_dr1
ow_r3 -- ow_dr1

@enduml
```

### 要求一覧

| アクター | 要求 | 根拠 |
| :--- | :--- | :--- |
| 得意先 | 花束を WEB で簡単に注文したい | 電話や手作業受付の限界を解消するため |
| 得意先 | 記念日に確実に届けてほしい | ビジネス価値「届け日厳守」の実現 |
| 得意先 | 届け先を再利用して素早く再注文したい | リピーター重視の方針に対応するため |
| 受注スタッフ | 受注内容と変更履歴を一元管理したい | 手作業転記と確認漏れを減らすため |
| 仕入スタッフ | 在庫推移を見ながら発注判断したい | 廃棄ロスと欠品の両方を減らすため |
| 経営者 | 廃棄リスクと受注量を把握したい | 利益改善と段階的投資判断のため |

## システム外部環境

### ビジネスコンテキスト

```plantuml
@startuml

title ビジネスコンテキスト図 - フレール・メモワール WEB 受注業務

left to right direction

actor "得意先" as customer
actor "仕入先" as supplier

node "フレール・メモワール" {
  rectangle "営業・受注" {
    actor "受注スタッフ" as order_staff
  }

  rectangle "仕入・在庫" {
    actor "仕入スタッフ" as purchase_staff
  }

  rectangle "店舗運営" {
    actor "フローリスト" as florist
    actor "経営者" as owner
  }

  usecase "WEB 受注業務" as biz_order
  usecase "仕入・入荷業務" as biz_purchase
  usecase "出荷準備業務" as biz_shipping

  artifact "花束商品マスタ" as product_master
  artifact "単品マスタ" as item_master
  artifact "受注台帳" as order_ledger
  artifact "在庫予定表" as stock_projection
}

customer -- biz_order
supplier -- biz_purchase

biz_order -- order_staff
biz_purchase -- purchase_staff
biz_shipping -- florist
biz_order -- owner

biz_order -- product_master
biz_order -- order_ledger
biz_purchase -- item_master
biz_purchase -- stock_projection
biz_shipping -- order_ledger

@enduml
```

### ビジネスユースケース

#### WEB 受注業務

```plantuml
@startuml

title ビジネスユースケース図 - WEB 受注業務

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff
actor "経営者" as owner

agent "フレール・メモワール WEB 受注" as web_order_org

usecase "商品を選んで注文する" as buc_01
usecase "届け日を変更依頼する" as buc_02
usecase "過去の届け先を再利用する" as buc_03

artifact "商品一覧" as af_01
artifact "受注情報" as af_02
artifact "届け先履歴" as af_03

customer -- buc_01
customer -- buc_02
customer -- buc_03
order_staff -- buc_02
owner -- buc_01

buc_01 -- web_order_org
buc_02 -- web_order_org
buc_03 -- web_order_org

buc_01 -- af_01
buc_01 -- af_02
buc_02 -- af_02
buc_03 -- af_03

@enduml
```

#### 仕入・入荷業務

```plantuml
@startuml

title ビジネスユースケース図 - 仕入・入荷業務

left to right direction

actor "仕入スタッフ" as purchase_staff
actor "仕入先" as supplier
actor "フローリスト" as florist

agent "フレール・メモワール 仕入・在庫" as purchase_org

usecase "在庫推移を確認する" as buc_11
usecase "発注を登録する" as buc_12
usecase "入荷を記録する" as buc_13

artifact "在庫予定表" as af_11
artifact "発注情報" as af_12
artifact "入荷情報" as af_13

purchase_staff -- buc_11
purchase_staff -- buc_12
purchase_staff -- buc_13
supplier -- buc_12
supplier -- buc_13
florist -- buc_11

buc_11 -- purchase_org
buc_12 -- purchase_org
buc_13 -- purchase_org

buc_11 -- af_11
buc_12 -- af_12
buc_13 -- af_13

@enduml
```

### 業務フロー

#### 商品を選んで注文する業務フロー

```plantuml
@startuml

title 業務フロー図 - 商品を選んで注文する

|得意先|
start
partition 注文準備 {
  :商品を選択する;
  :届け日、届け先、メッセージを入力する;
  :注文を確定する;
}

|WEB ショップシステム|
partition 受注登録 {
  :受注を登録する;
  :出荷日を届け日の前日に算出する;
  :在庫予定に受注を反映する;
}

|受注スタッフ|
partition 受注確認 {
  :受注内容を確認する;
}

stop
@enduml
```

#### 届け日を変更依頼する業務フロー

```plantuml
@startuml

title 業務フロー図 - 届け日を変更依頼する

|得意先|
start
:変更したい注文を指定する;
:新しい届け日を入力する;

|WEB ショップシステム|
:変更候補日の出荷日を算出する;
:在庫予定と出荷可能性を確認する;

if (変更可能か？) then (yes)
  :変更内容を反映する;
  |受注スタッフ|
  :変更完了を確認する;
  |得意先|
  :変更結果を受け取る;
else (no)
  :変更不可理由を返す;
  |受注スタッフ|
  :代替案を検討する;
  |得意先|
  :別日を再検討する;
endif

stop
@enduml
```

#### 発注を登録して入荷を記録する業務フロー

```plantuml
@startuml

title 業務フロー図 - 発注を登録して入荷を記録する

|仕入スタッフ|
start
partition 発注判断 {
  :在庫推移を確認する;
  :不足見込みの単品を特定する;
  :発注数量を判断する;
}

|WEB ショップシステム|
partition 記録 {
  :発注を登録する;
  :入荷予定日を在庫予定に反映する;
}

|仕入先|
partition 納品 {
  :単品を納品する;
}

|仕入スタッフ|
partition 入荷確認 {
  :納品内容を確認する;
  :入荷実績を登録する;
}

|WEB ショップシステム|
partition 在庫更新 {
  :在庫実績と在庫予定を更新する;
}

stop
@enduml
```

### 利用シーン

#### 記念日向けの新規注文

```plantuml
@startuml

title 利用シーン図 - 記念日向けの新規注文

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff

frame "記念日向けの新規注文" as scene01
note right of scene01
  記念日当日に花束を届けたい個人顧客が、
  商品選択から注文確定までを WEB で完了する場面。
  短時間で迷わず注文できることと、
  正確な届け日指定が重要である。
end note

usecase "注文する" as uc01
usecase "受注を確認する" as uc02

customer -- scene01
order_staff -- scene01
scene01 -- uc01
scene01 -- uc02

@enduml
```

#### リピーターによる再注文と届け日変更

```plantuml
@startuml

title 利用シーン図 - リピーターによる再注文と届け日変更

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as order_staff

frame "リピーターによる再注文と届け日変更" as scene02
note right of scene02
  過去の届け先を再利用したい顧客や、
  事情により届け日を変更したい顧客が利用する場面。
  変更可否を素早く判断し、
  顧客の負担を増やさずに注文を維持することが目的。
end note

usecase "届け先をコピーする" as uc03
usecase "届け日を変更する" as uc04

customer -- scene02
order_staff -- scene02
scene02 -- uc03
scene02 -- uc04

@enduml
```

### バリエーション・条件

#### 注文種別

| 種別 | 説明 |
| :--- | :--- |
| 新規注文 | 初めて入力する届け先で行う注文 |
| 再注文 | 過去の届け先をコピーして行う注文 |
| 変更注文 | 既存受注の届け日を変更する注文 |

#### 在庫判定

| 判定 | 説明 |
| :--- | :--- |
| 充足 | 出荷日までに必要数量を確保できる状態 |
| 不足見込み | 発注または代替判断が必要な状態 |
| 廃棄リスク | 品質維持期限超過により利用できない在庫が含まれる状態 |

#### 業務ルール

| ルール | 内容 |
| :--- | :--- |
| 1 受注 1 商品 | 1 回の注文は 1 商品を対象とする |
| 1 受注 1 届け先 | 1 回の注文で指定できる届け先は 1 件のみ |
| 出荷日 | 出荷日は届け日の前日とする |
| 発注判断 | 発注数量の最終判断はスタッフが行う |
| 対象顧客 | 個人顧客のみを対象とする |

## システム境界

### ユースケース複合図

#### 顧客注文と変更対応

```plantuml
@startuml

title ユースケース複合図 - 顧客注文と変更対応

left to right direction

actor "得意先" as customer
actor "受注スタッフ" as staff

frame "新規注文・再注文・届け日変更" as f01
usecase "注文する" as UC1
usecase "届け先をコピーする" as UC2
usecase "届け日を変更する" as UC3
boundary "注文画面" as b01
boundary "届け先選択画面" as b02
boundary "変更受付画面" as b03
entity "受注" as e01
entity "届け先" as e02
entity "得意先" as e03
control "出荷日算出" as c01
control "変更可否判定" as c02

customer -- f01
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

b03 -- UC3
UC3 -- e01
UC3 -- c01
UC3 -- c02

@enduml
```

#### 在庫確認と仕入・出荷準備

```plantuml
@startuml

title ユースケース複合図 - 在庫確認と仕入・出荷準備

left to right direction

actor "仕入スタッフ" as purchase_staff
actor "フローリスト" as florist

frame "在庫確認・発注・入荷・出荷準備" as f02
usecase "在庫推移を確認する" as UC11
usecase "発注を登録する" as UC12
usecase "入荷を記録する" as UC13
usecase "出荷対象を確認する" as UC14
boundary "在庫推移画面" as b11
boundary "発注管理画面" as b12
boundary "入荷登録画面" as b13
boundary "出荷一覧画面" as b14
entity "在庫予定" as e11
entity "発注" as e12
entity "入荷" as e13
entity "出荷" as e14
control "不足判定" as c11
control "品質維持期限判定" as c12

purchase_staff -- f02
florist -- f02
f02 -- UC11
f02 -- UC12
f02 -- UC13
f02 -- UC14

b11 -- UC11
UC11 -- e11
UC11 -- c11
UC11 -- c12

b12 -- UC12
UC12 -- e12
UC12 -- e11

b13 -- UC13
UC13 -- e13
UC13 -- e11

b14 -- UC14
UC14 -- e14
UC14 -- e11

@enduml
```

### 画面・帳票モデル

| 種別 | 名称 | 主利用者 | 目的 |
| :--- | :--- | :--- | :--- |
| 画面 | 注文画面 | 得意先 | 商品選択、届け日、届け先、メッセージ入力を行う |
| 画面 | 届け先選択画面 | 得意先 | 過去の届け先を検索・コピーする |
| 画面 | 変更受付画面 | 得意先、受注スタッフ | 届け日変更を受け付け、可否を表示する |
| 画面 | 受注一覧画面 | 受注スタッフ | 受注状況、変更状況を確認する |
| 画面 | 在庫推移画面 | 仕入スタッフ、経営者 | 日別の在庫予定数と廃棄リスクを確認する |
| 画面 | 発注管理画面 | 仕入スタッフ | 発注内容と入荷予定を登録する |
| 画面 | 入荷登録画面 | 仕入スタッフ | 納品された単品の入荷実績を記録する |
| 画面 | 出荷一覧画面 | フローリスト | 出荷日ごとの結束対象を確認する |
| 帳票 | 発注一覧 | 仕入スタッフ、仕入先 | 発注内容を共有する |
| 帳票 | 出荷一覧 | フローリスト | 当日準備が必要な花束を把握する |

### イベントモデル

| イベント | 発生元 | 受信側 | 内容 |
| :--- | :--- | :--- | :--- |
| 注文確定 | 得意先 | WEB ショップシステム | 受注、出荷日、在庫予定を作成する |
| 届け日変更要求 | 得意先 / 受注スタッフ | WEB ショップシステム | 在庫予定を再計算し、変更可否を判定する |
| 発注登録 | 仕入スタッフ | WEB ショップシステム | 発注情報と入荷予定を記録する |
| 入荷確定 | 仕入スタッフ | WEB ショップシステム | 入荷実績を記録し、在庫予定を更新する |
| 出荷対象抽出 | 定時処理 / スタッフ操作 | WEB ショップシステム | 出荷日に対応する花束一覧を生成する |

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

entity "得意先" as customer
entity "届け先" as delivery_destination
entity "受注" as order
entity "商品" as product
entity "商品構成" as product_composition
entity "単品" as item
entity "在庫予定" as stock_projection
entity "発注" as purchase_order
entity "入荷" as arrival
entity "出荷" as shipment

customer -- delivery_destination
customer -- order
order -- delivery_destination
order -- product
product -- product_composition
product_composition -- item
item -- stock_projection
purchase_order -- item
arrival -- purchase_order
arrival -- item
shipment -- order
shipment -- stock_projection

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 仮受付 : 注文する
仮受付 --> 受付済み : 受注を登録する
受付済み --> 変更受付中 : 届け日を変更する
変更受付中 --> 受付済み : 変更確定
受付済み --> 出荷準備済み : 出荷対象を確認する
出荷準備済み --> 出荷済み : 出荷を確定する
受付済み --> キャンセル : 注文を取り消す
変更受付中 --> キャンセル : 注文を取り消す
出荷済み --> 完了 : 届け日を経過する
キャンセル --> [*]
完了 --> [*]

@enduml
```

#### 発注の状態遷移

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 未発注
未発注 --> 発注済み : 発注を登録する
発注済み --> 一部入荷 : 入荷を記録する
一部入荷 --> 入荷完了 : 残数が 0 になる
発注済み --> 入荷完了 : 全量入荷する
発注済み --> クローズ : 発注を終了する
一部入荷 --> クローズ : 発注を終了する
入荷完了 --> [*]
クローズ --> [*]

@enduml
```

### 要件サマリー

| 分類 | 要件 |
| :--- | :--- |
| 機能要件 | 顧客が商品を選択して注文できること |
| 機能要件 | 顧客が過去の届け先を再利用できること |
| 機能要件 | 顧客またはスタッフが届け日変更可否を確認し変更できること |
| 機能要件 | スタッフが日別の在庫推移と廃棄リスクを確認できること |
| 機能要件 | スタッフが発注と入荷を登録できること |
| 機能要件 | フローリストが出荷対象を確認できること |
| 制約 | 自動発注は行わず、発注判断は人間が担うこと |
| 制約 | 対象顧客は個人顧客のみであること |
| 制約 | 決済処理は本システムの対象外であること |
| TBD | 品質維持期限アラートを通知機能として実装するかは別途検討すること |
| TBD | 配送状況トラッキングの要否は別途検討すること |
