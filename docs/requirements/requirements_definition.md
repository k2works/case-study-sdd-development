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
agent 決済サービス

usecase "WEB ショップシステム"
note top of "WEB ショップシステム"
  受注から出荷までの業務を効率化する
  在庫推移の可視化により廃棄ロスを最小化する
  リピーターが簡単に注文できる仕組みを提供する
end note

:得意先: -- (WEB ショップシステム)
:スタッフ: -- (WEB ショップシステム)
(WEB ショップシステム) -- 仕入先
(WEB ショップシステム) -- 決済サービス

@enduml
```

### 要求モデル

```plantuml
@startuml

title 要求モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

actor 得意先
note "花束を簡単に注文したい" as c_r1
note "指定日に確実に届けてほしい" as c_r2
note "リピート注文を手軽にしたい" as c_r3
note as c_dr1 #Turquoise
  届け先コピー機能
  届け日変更対応
  注文確認・履歴参照
end note
:得意先: -- c_r1
:得意先: -- c_r2
:得意先: -- c_r3
c_r1 -- c_dr1
c_r2 -- c_dr1
c_r3 -- c_dr1

actor スタッフ
note "受注を効率的に管理したい" as s_r1
note "在庫推移を可視化したい" as s_r2
note "発注判断の材料がほしい" as s_r3
note as s_dr1 #Turquoise
  受注一覧・詳細管理
  日別在庫推移表示
  発注管理・入荷管理
  出荷管理
end note
:スタッフ: -- s_r1
:スタッフ: -- s_r2
:スタッフ: -- s_r3
s_r1 -- s_dr1
s_r2 -- s_dr1
s_r3 -- s_dr1

@enduml
```

## システム外部環境

### ビジネスコンテキスト

```plantuml
@startuml

title ビジネスコンテキスト図 - フレール・メモワール

left to right direction

actor 得意先
actor 仕入先

node "フレール・メモワール" {
  rectangle "営業・受注" {
    actor 受注スタッフ
  }

  rectangle "仕入・在庫" {
    actor 仕入スタッフ
  }

  rectangle "製造・配送" {
    actor フローリスト
  }

  usecase "WEB 受注"
  usecase "在庫・仕入管理"
  usecase "結束・出荷"

  artifact "受注情報"
  artifact "在庫情報"
}

node "外部" {
  agent "決済サービス"
}

:得意先: -- (WEB 受注)
(WEB 受注) -- :受注スタッフ:
(在庫・仕入管理) -- :仕入スタッフ:
(結束・出荷) -- :フローリスト:

(WEB 受注) -- 受注情報
(在庫・仕入管理) -- 在庫情報

(WEB 受注) -- 決済サービス
(在庫・仕入管理) -- :仕入先:

@enduml
```

### ビジネスユースケース

#### WEB 受注

```plantuml
@startuml

title ビジネスユースケース図 - WEB 受注

left to right direction

actor 得意先
actor 受注スタッフ

agent "WEB ショップ"

usecase "花束を注文する" as uc_01
usecase "届け日を変更する" as uc_02
usecase "受注を確認する" as uc_03

artifact "受注情報" as af_01
artifact "届け先情報" as af_02

:得意先: -- (uc_01)
:得意先: -- (uc_02)
:受注スタッフ: -- (uc_03)

(uc_01) -- "WEB ショップ"
(uc_02) -- "WEB ショップ"
(uc_03) -- "WEB ショップ"

(uc_01) -- af_01
(uc_01) -- af_02
(uc_02) -- af_01
(uc_03) -- af_01

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ビジネスユースケース図 - 在庫・仕入管理

left to right direction

actor 仕入スタッフ
actor 仕入先

agent "管理システム"

usecase "在庫推移を確認する" as uc_01
usecase "仕入先に発注する" as uc_02
usecase "入荷を受け入れる" as uc_03

artifact "在庫情報" as af_01
artifact "発注情報" as af_02

:仕入スタッフ: -- (uc_01)
:仕入スタッフ: -- (uc_02)
:仕入スタッフ: -- (uc_03)
:仕入先: -- (uc_02)
:仕入先: -- (uc_03)

(uc_01) -- "管理システム"
(uc_02) -- "管理システム"
(uc_03) -- "管理システム"

(uc_01) -- af_01
(uc_02) -- af_02
(uc_03) -- af_01

@enduml
```

#### 結束・出荷

```plantuml
@startuml

title ビジネスユースケース図 - 結束・出荷

left to right direction

actor フローリスト
actor 受注スタッフ

agent "管理システム"

usecase "花束を結束する" as uc_01
usecase "出荷する" as uc_02

artifact "出荷情報" as af_01

:フローリスト: -- (uc_01)
:受注スタッフ: -- (uc_02)

(uc_01) -- "管理システム"
(uc_02) -- "管理システム"

(uc_02) -- af_01

@enduml
```

### 業務フロー

#### 花束を注文するの業務フロー

```plantuml
@startuml

title 業務フロー図 - 花束を注文する

|得意先|
start
:WEB ショップで商品を選択;
:届け日・届け先・メッセージを入力;
:注文を確定;

|WEB ショップシステム|
:受注を登録;
:決済処理;

|受注スタッフ|
:受注を確認;

stop

@enduml
```

#### 在庫推移確認・発注の業務フロー

```plantuml
@startuml

title 業務フロー図 - 在庫推移確認・発注

|仕入スタッフ|
start
:在庫推移を確認;

if (在庫が不足するか？) then (不足)
  :仕入先に発注;
  |仕入先|
  :単品を出荷;
  |仕入スタッフ|
  :入荷を受け入れ;
  :在庫を更新;
else (十分)
endif

stop

@enduml
```

#### 結束・出荷の業務フロー

```plantuml
@startuml

title 業務フロー図 - 結束・出荷

|受注スタッフ|
start
:出荷対象受注を確認（届け日の前日）;

|フローリスト|
:花材を準備;
:花束を結束;

|受注スタッフ|
:出荷を登録;
:配送手配;

stop

@enduml
```

### 利用シーン

#### WEB 受注の利用シーン

```plantuml
@startuml

title 利用シーン図 - WEB 受注

left to right direction

actor 得意先

frame "記念日に花束を贈る" as f01
note right of f01
  誕生日・記念日に合わせて花束を注文する
  届け日・届け先・メッセージを指定する
  過去の届け先をコピーして手軽に再注文できる
  クレジットカードで事前決済済み
end note

frame "届け日を変更する" as f02
note right of f02
  注文後に都合が変わり届け日を変更したい
  変更可否を在庫状況から即座に確認できる
  不可の場合は迅速に通知される
end note

usecase "花束を注文する" as UC1
usecase "届け先をコピーする" as UC2
usecase "届け日を変更する" as UC3

:得意先: -- f01
:得意先: -- f02
f01 -- (UC1)
f01 -- (UC2)
f02 -- (UC3)

@enduml
```

#### 在庫・仕入管理の利用シーン

```plantuml
@startuml

title 利用シーン図 - 在庫・仕入管理

left to right direction

actor 仕入スタッフ

frame "発注判断を行う" as f01
note right of f01
  受注増加に備えて在庫推移を確認する
  品質維持日数を考慮した日別在庫予定数を把握する
  不足が見込まれる単品を特定して発注する
  発注判断は人間が行い、システムは材料を提供する
end note

usecase "在庫推移を確認する" as UC1
usecase "仕入先に発注する" as UC2
usecase "入荷を受け入れる" as UC3

:仕入スタッフ: -- f01
f01 -- (UC1)
f01 -- (UC2)
f01 -- (UC3)

@enduml
```

### バリエーション・条件

#### 商品（花束）の種類

| 分類名 | 説明 |
|--------|------|
| 商品コード | 花束を一意に識別するコード |
| 商品名 | 花束の名称 |
| 構成単品 | 花束を構成する単品と数量の組合せ |

#### 届け日の条件

| 分類名 | 説明 |
|--------|------|
| 出荷日 | 届け日の前日 |
| 変更可否 | 変更後の届け日に対応する出荷日の在庫が確保できるか |
| 変更締切 | 出荷日前日まで変更可能 |

#### 在庫の状態

| 分類名 | 説明 |
|--------|------|
| 在庫数 | 現在の手持ち在庫数量 |
| 品質維持日数 | 入荷日から品質を維持できる日数 |
| 廃棄対象 | 品質維持日数を超えた在庫 |

## システム境界

### ユースケース複合図

#### WEB 受注

```plantuml
@startuml

title ユースケース複合図 - WEB 受注

left to right direction

actor 得意先 as customer
actor スタッフ as staff

frame "記念日に花束を贈る" as f01
usecase "花束を注文する" as UC1
usecase "届け先をコピーする" as UC2
boundary "注文画面" as b01
boundary "届け先選択画面" as b02
entity "受注" as e01
entity "届け先" as e02
control "届け日 ≥ 翌々日" as c01

customer -- f01
f01 -- UC1
f01 -- UC2
b01 -- UC1
UC1 -- e01
UC1 -- c01
b02 -- UC2
UC2 -- e02

frame "届け日を変更する" as f02
usecase "届け日を変更する" as UC3
boundary "届け日変更画面" as b03
entity "受注" as e03
control "在庫確認" as c03

customer -- f02
f02 -- UC3
b03 -- UC3
UC3 -- e03
UC3 -- c03

frame "受注を管理する" as f03
usecase "受注一覧を確認する" as UC4
usecase "受注詳細を確認する" as UC5
boundary "受注管理画面" as b04

staff -- f03
f03 -- UC4
f03 -- UC5
b04 -- UC4
b04 -- UC5

@enduml
```

#### 在庫・仕入管理

```plantuml
@startuml

title ユースケース複合図 - 在庫・仕入管理

left to right direction

actor スタッフ as staff

frame "在庫推移を確認する" as f01
usecase "在庫推移を確認する" as UC1
boundary "在庫推移画面" as b01
entity "在庫" as e01
control "品質維持日数チェック" as c01

staff -- f01
f01 -- UC1
b01 -- UC1
UC1 -- e01
UC1 -- c01

frame "発注・入荷を管理する" as f02
usecase "仕入先に発注する" as UC2
usecase "入荷を受け入れる" as UC3
boundary "発注管理画面" as b02
boundary "入荷管理画面" as b03
entity "発注" as e02
entity "入荷" as e03
interface "仕入先通知" as i01

staff -- f02
f02 -- UC2
f02 -- UC3
b02 -- UC2
UC2 -- e02
UC2 -- i01
b03 -- UC3
UC3 -- e03

@enduml
```

#### 結束・出荷管理

```plantuml
@startuml

title ユースケース複合図 - 結束・出荷管理

left to right direction

actor スタッフ as staff

frame "出荷を管理する" as f01
usecase "出荷対象を確認する" as UC1
usecase "出荷を登録する" as UC2
boundary "出荷管理画面" as b01
entity "出荷" as e01
entity "受注" as e02
control "出荷日 = 届け日の前日" as c01

staff -- f01
f01 -- UC1
f01 -- UC2
b01 -- UC1
b01 -- UC2
UC1 -- e02
UC1 -- c01
UC2 -- e01

@enduml
```

## システム

### 情報モデル

```plantuml
@startuml

title 情報モデル図 - フレール・メモワール WEB ショップシステム

left to right direction

' 顧客・受注関連
entity 得意先
entity 受注
entity 届け先

' 商品関連
entity "商品（花束）"
entity 商品構成
entity "単品（花）"

' 仕入・在庫関連
entity 仕入先
entity 発注
entity 入荷
entity 在庫

' 出荷関連
entity 出荷

' 関連付け
得意先 -- 受注 : 注文する
受注 -- "商品（花束）" : 含む
受注 -- 届け先 : 届け先を指定する
受注 -- 出荷 : 出荷される

"商品（花束）" -- 商品構成 : 構成される
商品構成 -- "単品（花）" : 使用する

"単品（花）" -- 仕入先 : 仕入れる
"単品（花）" -- 発注 : 発注される
"単品（花）" -- 入荷 : 入荷する
"単品（花）" -- 在庫 : 在庫を持つ

得意先 -- 届け先 : 過去の届け先を保持する

@enduml
```

### 状態モデル

#### 受注の状態遷移

```plantuml
@startuml
title 受注の状態遷移図

[*] --> 受注済 : 花束を注文する

受注済 --> 届け日変更済 : 届け日を変更する
届け日変更済 --> 受注済 : 再変更する

受注済 --> 出荷済 : 出荷を登録する
届け日変更済 --> 出荷済 : 出荷を登録する

受注済 --> キャンセル : キャンセルする
届け日変更済 --> キャンセル : キャンセルする

出荷済 --> [*]
キャンセル --> [*]
@enduml
```

#### 在庫の状態遷移

```plantuml
@startuml
title 在庫の状態遷移図

[*] --> 入荷済 : 入荷を受け入れる

入荷済 --> 引当済 : 受注に引き当てる
引当済 --> 入荷済 : 引当を解除する

入荷済 --> 出荷済 : 出荷する
引当済 --> 出荷済 : 出荷する

入荷済 --> 廃棄 : 品質維持日数超過
廃棄 --> [*]
出荷済 --> [*]
@enduml
```

#### 発注の状態遷移

```plantuml
@startuml
title 発注の状態遷移図

[*] --> 発注済 : 仕入先に発注する

発注済 --> 入荷済 : 入荷を受け入れる
発注済 --> キャンセル : 発注をキャンセルする

入荷済 --> [*]
キャンセル --> [*]
@enduml
```
