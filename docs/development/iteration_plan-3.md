# イテレーション 3 計画

## 概要

| 項目 | 内容 |
|------|------|
| **イテレーション** | 3 |
| **期間** | 2026-04-07 〜 2026-04-11（1 週間） |
| **ゴール** | 在庫推移表示の完成（MVP）+ 発注機能の先行実装（Phase 2） |
| **目標 SP** | 8 |

---

## ゴール

### イテレーション終了時の達成状態

1. **在庫推移表示（MVP）**: 仕入スタッフが単品ごとの日別在庫予定数（内訳付き）を確認でき、品質維持日数超過の在庫と欠品日を識別できる
2. **発注機能（Phase 2 先行）**: 仕入スタッフが在庫推移画面から発注画面に遷移し、単品を仕入先に発注できる。※ S09 は Phase 2 のストーリーだが、在庫推移と発注は業務上不可分のため IT3 で先行実装する
3. **リリース検証**: 注文→在庫引当→在庫推移表示、発注→入荷予定反映、在庫推移→発注→在庫推移反映の E2E テスト 3 件がパスする

### 成功基準

- [x] 単品ごとの日別在庫予定数が正しく算出・表示される
- [x] 品質維持日数超過の在庫が識別できる
- [x] 日別セルのツールチップで在庫予定数の内訳（現在庫・入荷予定・引当・期限超過）が確認できる
- [x] 欠品日（在庫予定数 <= 0）が警告表示される
- [x] 発注数量が購入単位の倍数に自動調整される
- [x] 入荷予定日がリードタイムから自動計算される
- [ ] テストカバレッジ: ドメイン層 90% 以上、全体 80% 以上
- [ ] CI パイプラインがグリーン

---

## IT2 ふりかえり反映

IT2 の Try 項目のうち、IT3 で対応するものを技術的負債タスクとして組み込む。

| Try 項目 | 優先度 | IT3 での対応方針 |
|---------|--------|-----------------|
| T1: App.tsx をカスタムフックに分割 | P1 | IT3 初日に実施。以降の画面追加コスト低減 |
| T2: DeliveryDate にバックエンドバリデーション追加 | P1 | S08 バックエンド実装時に対応 |
| T3: UI 設計書レビューを実装前に実施 | P1 | S08・S09 の実装前に設計書を確認 |
| T4: 状態遷移テストを全パターン網羅 | P2 | PurchaseOrder の状態遷移テストを網羅的に実装 |
| T5: Item/Product の createNew 型安全化 | P2 | リファクタリングフェーズで対応 |
| T7: トランザクション設計を事前に ADR 化 | P2 | 発注→在庫更新のトランザクション方針を ADR で記録 |

---

## ユーザーストーリー

### 対象ストーリー

| ID | ユーザーストーリー | SP | 優先度 |
|----|-------------------|----|--------|
| S08 | 在庫推移を確認する | 5 | 必須 |
| S09 | 単品を発注する | 3 | 必須 |
| **合計** | | **8** | |

### ストーリー詳細

#### S08: 在庫推移を確認する

**ストーリー**:

> 仕入スタッフとして、単品ごとの日別在庫予定数を確認したい。なぜなら、品質維持日数を考慮した適切な発注判断をしたいからだ。

**受入条件**:

- [x] 単品ごとの日別在庫予定数が表示される
- [x] 在庫予定数は現在庫 + 入荷予定 - 受注引当 - 品質維持日数超過分で計算される
- [x] 品質維持日数を超過する在庫が識別できる

**対応 UC**: UC05

#### S09: 単品を発注する

**ストーリー**:

> 仕入スタッフとして、仕入先に単品を発注したい。なぜなら、在庫推移を見て必要な花材を適切なタイミングで確保したいからだ。

**受入条件**:

- [x] 発注する単品の仕入先・購入単位・リードタイムが表示される
- [x] 発注数量を指定できる（購入単位の倍数に自動調整）
- [x] 発注を確定すると発注記録が作成される（購入単位の倍数に切り上げ調整）
- [x] 入荷予定日がリードタイムから自動計算される
- [x] 発注確定後、在庫推移画面に戻り入荷予定が反映される

**対応 UC**: UC06

### タスク

#### 0. 技術的負債解消・基盤整備（SP 外・タイムボックス 1 日）

| # | タスク | 見積もり | 状態 |
|---|--------|---------|------|
| 0.1 | App.tsx をカスタムフックに分割（T1: ルーティング・状態管理・API 呼び出しの分離）+ テスト修正 | 3h | [ ] |
| 0.2 | DeliveryDate のバックエンドバリデーション追加（T2: 過去日付の拒否）+ テスト | 0.5h | [ ] |
| 0.3 | Item/Product の createNew 型安全化（T5: `undefined as unknown` の解消） | 1h | [ ] |
| 0.4 | Prisma スキーマ拡張（purchase_orders テーブル追加 + マイグレーション）。※ arrivals テーブルは IT4（S10）で追加（YAGNI）。purchaseUnit/leadTimeDays は既に Item の属性として実装済みのため Supplier への追加は不要 | 1h | [x] |
| 0.5 | ADR: 発注作成時のトランザクション方針を記録（T7） | 0.5h | [x] |

**小計**: 6h（月曜）

#### 1. S08: 在庫推移を確認する（5 SP）

| # | タスク | 見積もり | 状態 |
|---|--------|---------|------|
| 1.1a | ドメイン層: StockForecast 値オブジェクト（日別在庫予定数、内訳、欠品警告フラグ、品質維持超過フラグ）のテスト・実装。※ availableStock は int（負値許容、Quantity 型は使わない） | 1h | [x] |
| 1.1b | ドメイン層: StockForecastService — Step 1: 現在庫のみで在庫予定数を算出 | 1h | [x] |
| 1.1c | ドメイン層: StockForecastService — Step 2: 入荷予定を加算 | 0.5h | [x] |
| 1.1d | ドメイン層: StockForecastService — Step 3: 受注引当を減算 | 0.5h | [x] |
| 1.1e | ドメイン層: StockForecastService — Step 4: 品質維持日数超過を減算 + 警告フラグ | 1h | [x] |
| 1.2 | アプリケーション層: StockForecastUseCase（指定期間の在庫推移取得）のテスト・実装。UseCase が各リポジトリからデータを取得し StockForecastService に渡す | 2h | [x] |
| 1.3 | インフラ層: 既存リポジトリへのクエリメソッド追加（StockLotRepository, PurchaseOrderRepository に期間指定取得を追加）+ 統合テスト | 2h | [x] |
| 1.4 | プレゼンテーション層: GET /api/stock/forecast（クエリ: itemId, fromDate, toDate）+ テスト。レスポンスに内訳（currentStock, expectedArrival, allocated, expired）を含む | 1h | [x] |
| 1.5 | フロントエンド: P07 在庫推移画面（日別テーブル + 欠品日警告 + 品質維持超過警告 + 内訳ツールチップ + 単品フィルタ）+ テスト | 3h | [x] |
| 1.6 | フロントエンド: ナビゲーションに「在庫推移」タブ追加 + ルーティング | 0.5h | [x] |

**小計**: 12.5h（火曜-水曜）

**StockForecastService 境界値テストシナリオ**:

| シナリオ | 現在庫 | 入荷予定 | 受注引当 | 期限超過 | 期待結果 |
|---------|--------|---------|---------|---------|---------|
| 全要素あり | 50 | +20 | -15 | -5 | 50 |
| 在庫切れ境界 | 10 | 0 | -10 | 0 | 0（欠品警告） |
| 負の在庫（過剰引当） | 5 | 0 | -10 | 0 | -5（欠品警告） |
| 品質維持期限当日 | 30 | 0 | 0 | -30 | 0（品質維持超過警告） |
| 入荷と引当が同日 | 10 | +20 | -20 | 0 | 10 |
| 品質維持日数 0 日 | 10 | 0 | 0 | -10 | 0 |
| 入荷予定なし・引当なし | 30 | 0 | 0 | 0 | 30 |
| fromDate = toDate（1 日） | 10 | 0 | 0 | 0 | 10 |

#### 2. S09: 単品を発注する（3 SP）

| # | タスク | 見積もり | 状態 |
|---|--------|---------|------|
| 2.1 | ドメイン層: PurchaseOrder エンティティ + 値オブジェクト（PurchaseOrderId, PurchaseOrderStatus）のテスト・実装。createNew ファクトリで購入単位倍数調整（切り上げ）+ 入荷予定日計算を内包。不正遷移テスト（入荷済み→発注済み）を含む | 2h | [x] |
| 2.2 | ドメイン層: PurchaseOrder リポジトリインターフェース定義 | 0.5h | [x] |
| 2.3 | アプリケーション層: PurchaseOrderUseCase（発注作成 — Item から purchaseUnit/leadTimeDays を取得）のテスト・実装 | 1.5h | [x] |
| 2.4 | インフラ層: Prisma PurchaseOrder リポジトリ実装 + 統合テスト | 1.5h | [x] |
| 2.5 | プレゼンテーション層: POST /api/purchase-orders + テスト | 1h | [x] |
| 2.6 | フロントエンド: P08 発注画面（単品情報表示 + 現在庫・欠品予定日表示 + 数量入力 + 自動調整 + 入荷予定日表示）+ テスト | 2h | [x] |
| 2.7 | フロントエンド: 在庫推移画面⇔発注画面の双方向遷移 + 発注確定後の成功メッセージ + 在庫推移画面に戻って入荷予定反映確認 | 1h | [x] |

**小計**: 9.5h（水曜 PM - 木曜）

#### 3. MVP リリース検証

| # | タスク | 見積もり | 状態 |
|---|--------|---------|------|
| 3.1 | E2E テスト: 注文→在庫引当→在庫推移反映フロー | 1h | [x] |
| 3.2 | E2E テスト: 発注→入荷予定→在庫推移反映フロー | 1h | [x] |
| 3.3 | E2E テスト: 在庫推移画面→発注画面遷移→発注確定→在庫推移画面で入荷予定反映確認 | 1h | [x] |
| 3.4 | 統合テスト・バグ修正 | 1h | [ ] |

**小計**: 4h（金曜）

#### タスク合計

| カテゴリ | SP | 理想時間 | 状態 |
|---------|----|----|------|
| 技術的負債解消・基盤整備 | - | 6h | 一部完了（0.4, 0.5） |
| S08: 在庫推移を確認する | 5 | 12.5h | [x] 完了 |
| S09: 単品を発注する | 3 | 9.5h | [x] 完了 |
| リリース検証 | - | 4h | 一部完了（3.1, 3.2, 3.3） |
| **合計** | **8** | **32h** | |

**1 SP あたり**: 約 2.75h（技術的負債・リリース検証除く）
**進捗率**: 100% (8/8 SP)

---

## スケジュール

```mermaid
gantt
    title イテレーション 3
    dateFormat  YYYY-MM-DD
    section 基盤整備
    App.tsx 分割+型安全化+ADR            :d1, 2026-04-07, 1d
    Prisma スキーマ拡張+バリデーション   :d2, 2026-04-07, 1d
    section S08 在庫推移
    ドメイン層(StockForecast+Service)    :d3, 2026-04-08, 1d
    アプリ層+インフラ層+API              :d4, 2026-04-09, 1d
    フロントエンド(P07)                  :d5, 2026-04-09, 1d
    section S09 発注
    ドメイン層(PurchaseOrder)            :d6, 2026-04-09, 1d
    アプリ+インフラ+API                  :d7, 2026-04-10, 1d
    フロントエンド(P08)+画面遷移         :d8, 2026-04-10, 1d
    section リリース検証
    E2E テスト 3 件+統合テスト           :d9, 2026-04-11, 1d
    デモとふりかえり                     :d10, 2026-04-11, 1d
```

| 日 | タスク |
|----|--------|
| 月曜 (4/7) | 基盤整備: App.tsx 分割(3h) + 型安全化 + DeliveryDate バリデーション + Prisma スキーマ拡張 + トランザクション ADR |
| 火曜 (4/8) | S08: ドメイン層（StockForecast 値オブジェクト + StockForecastService 4 ステップ） |
| 水曜 (4/9) | S08: アプリ層 + インフラ層 + API + フロントエンド（P07）。S09: ドメイン層（PurchaseOrder） |
| 木曜 (4/10) | S09: アプリ層 + インフラ層 + API + フロントエンド（P08）+ 画面遷移 |
| 金曜 (4/11) | リリース検証: E2E テスト 3 件 + 統合テスト・バグ修正（AM）、デモ・ふりかえり（PM） |

---

## 設計

### 対象ドメインモデル

```plantuml
@startuml
package "在庫推移（ドメインサービス）" #E8F5E9 {
  class StockForecastService <<ドメインサービス>> {
    + calculateForecast(itemId, fromDate, toDate): StockForecast[]
  }
  class StockForecast <<値オブジェクト>> {
    - date: Date
    - itemId: ItemId
    - currentStock: number
    - expectedArrival: number
    - allocated: number
    - expired: number
    - availableStock: number
    - isExpiryWarning: boolean
  }
}

package "発注集約" #FFF3E0 {
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

note left of 発注
  createNew ファクトリで:
  - 購入単位倍数に切り上げ
  - 入荷予定日 = 発注日 + リードタイム
  ※ purchaseUnit/leadTimeDays は
     Item から取得
end note

package "在庫集約（既存）" #F3E5F5 {
  class 在庫ロット <<集約ルート>> {
    - stockId: StockId
    - itemId: ItemId
    - quantity: Quantity
    - arrivalDate: Date
    - expiryDate: Date
    - orderId: OrderId | null
    - status: StockStatus
  }
}

note right of StockForecastService
  計算式:
  日別在庫予定数 = 現在の有効在庫
    + 入荷予定（発注済みの expectedArrivalDate ≤ 対象日）
    - 受注引当（注文済みの shippingDate ≤ 対象日）
    - 品質維持超過（expiryDate ≤ 対象日）
end note

note right of 発注
  状態遷移:
  発注済み → 入荷済み
end note
@enduml
```

### 対象データモデル

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity "発注 (purchase_orders)" as po {
  * purchase_order_id : SERIAL <<PK>>
  --
  * item_id : INTEGER <<FK>>
  * supplier_id : INTEGER <<FK>>
  * quantity : INTEGER
  * order_date : DATE
  * expected_arrival_date : DATE
  * status : VARCHAR(20)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "単品 (items)" as itm {
  * item_id : SERIAL <<PK>>
  --
  * purchase_unit : INTEGER
  * lead_time_days : INTEGER
  * supplier_id : INTEGER <<FK>>
}

note right of itm
  purchaseUnit/leadTimeDays は
  Item の属性（既存）
end note

itm ||--o{ po : item_id
@enduml
```

### ユーザーインターフェース

#### P07: 在庫推移画面

```plantuml
@startsalt
{+
  {/ 受注 | <b>在庫推移</b> | 出荷 | 商品管理 | 単品管理 }
  ---
  <b>在庫推移
  単品: ^全て         ^  期間: ^2026/04/07^ 〜 ^2026/04/11^  [ 表示 ]
  ---
  {#
    単品名 | 4/7 | 4/8 | 4/9 | 4/10 | 4/11 | 品質維持 | 操作
    バラ（赤） | 20 | 15 | 10 | 5 | <b>0</b> | 5日 | [ 発注 ]
    カスミソウ | 50 | 45 | 40 | 35 | 30 | 7日 | [ 発注 ]
    ユリ（白） | 10 | 8 | 3 | <b>0</b> | <b>-5</b> | 3日 | [ 発注 ]
  }
  ---
  <b>※ 太字は欠品警告（在庫予定数 ≤ 0）
  <b>※ 各セルにツールチップで内訳表示（現在庫/入荷予定/引当/期限超過）
}
@endsalt
```

**内訳ツールチップ例**（バラ 4/10 にホバー時）:

```
在庫予定数: 5
├ 現在庫: 20
├ 入荷予定: +0
├ 受注引当: -10
└ 期限超過: -5
```

#### P08: 発注画面

```plantuml
@startsalt
{+
  {/ <b>フレール・メモワール WEB ショップ }
  ---
  <b>発注
  ---
  単品: <b>バラ（赤）
  仕入先: <b>花市場 A
  購入単位: <b>10本
  リードタイム: <b>2日
  ---
  発注数量 | "30               "
  自動調整後 | <b>30本（購入単位: 10本の倍数）
  入荷予定日 | <b>2026/04/09（リードタイム: 2日）
  ---
  { [ 戻る ] | [ 発注する ] }
}
@endsalt
```

### API 設計

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/stock/forecast?itemId=&fromDate=&toDate= | 在庫推移取得（日別予定数） |
| POST | /api/purchase-orders | 発注作成（購入単位自動調整 + 入荷予定日計算） |

### データベーススキーマ（追加分）

```prisma
// 発注（IT3 で追加）
model PurchaseOrder {
  purchaseOrderId     Int      @id @default(autoincrement()) @map("purchase_order_id")
  itemId              Int      @map("item_id")
  supplierId          Int      @map("supplier_id")
  quantity            Int
  orderDate           DateTime @map("order_date") @db.Date
  expectedArrivalDate DateTime @map("expected_arrival_date") @db.Date
  status              String   @db.VarChar(20)
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  item     Item     @relation(fields: [itemId], references: [itemId])
  supplier Supplier @relation(fields: [supplierId], references: [supplierId])

  @@map("purchase_orders")
}

// ※ Supplier テーブルの変更なし（既存のまま）
// ※ arrivals テーブルは IT4（S10: 入荷受入）で追加
// ※ purchaseUnit/leadTimeDays は Item の属性（既存）を使用
```

### ディレクトリ構成（追加分）

```
apps/backend/src/
├── domain/
│   ├── purchase-order/              # 発注集約（新規）
│   │   ├── purchase-order.ts        # createNew ファクトリで購入単位調整+入荷予定日計算
│   │   ├── purchase-order.test.ts
│   │   └── purchase-order-repository.ts
│   ├── stock-forecast/              # 在庫推移（独立ディレクトリ、新規）
│   │   ├── stock-forecast.ts        # 値オブジェクト（内訳付き）
│   │   ├── stock-forecast.test.ts
│   │   ├── stock-forecast-service.ts  # 純粋ドメインサービス
│   │   └── stock-forecast-service.test.ts
│   └── shared/
│       └── value-objects.ts         # PurchaseOrderId, PurchaseOrderStatus 等を追加
├── application/
│   ├── purchase-order/              # 新規
│   │   ├── purchase-order-usecase.ts  # Item から purchaseUnit/leadTimeDays 取得
│   │   ├── purchase-order-usecase.test.ts
│   │   └── in-memory-purchase-order-repository.ts
│   └── stock/
│       ├── stock-forecast-usecase.ts       # 新規: 各リポジトリからデータ取得→Service に渡す
│       └── stock-forecast-usecase.test.ts
├── infrastructure/prisma/
│   ├── purchase-order-repository-prisma.ts      # 新規
│   └── purchase-order-repository-prisma.test.ts
└── presentation/routes/
    ├── stock-forecast-routes.ts                 # 新規
    └── purchase-order-routes.ts                 # 新規

apps/frontend/src/
├── hooks/                     # カスタムフック（新規: T1 対応）
│   ├── useItems.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── useStockForecast.ts
├── pages/
│   └── staff/
│       ├── StockForecast.tsx         # P07（新規）
│       ├── StockForecast.test.tsx
│       ├── PurchaseOrderForm.tsx     # P08（新規）
│       └── PurchaseOrderForm.test.tsx
└── types/
    ├── stock-forecast.ts             # 新規
    └── purchase-order.ts             # 新規
```

---

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 在庫推移計算ロジックの複雑さ（4 要素の集計） | 高 | TDD で段階的に実装。最初は現在庫のみ→入荷予定→受注引当→期限超過の順に追加 |
| App.tsx 分割の影響範囲 | 中 | カスタムフック分割をIT3 初日に実施。既存テストが安全網。分割後にリグレッションテスト実施 |
| Prisma スキーマ変更のマイグレーション | 中 | 開発環境で十分にテスト後に適用。既存テーブルへの影響なし（新規テーブル追加のみ） |
| 8 SP の消化（IT1:7, IT2:8 と同水準） | 低 | 平均ベロシティ 7.5 SP。IT2 の在庫引当知見を活用でき、実現可能 |

---

## 完了条件

### Definition of Done

- [x] ユニットテストがパス（Backend 200、Frontend 102 全パス）
- [x] 統合テストがパス（在庫推移計算の正確性、発注→入荷予定反映）
- [x] E2E テストがパス（3 シナリオ: 注文→在庫推移、発注フロー、在庫推移→発注→在庫推移反映）
- [x] 各ストーリーの受入基準が全て検証済み
- [x] ESLint エラーなし
- [ ] テストカバレッジ: ドメイン層 90% 以上、全体 80% 以上
- [ ] CI パイプラインがグリーン（push 後に確認）

### デモ項目

1. 在庫推移画面で単品ごとの日別在庫予定数を表示する
2. 品質維持日数超過の在庫が太字で警告表示される
3. 在庫推移画面から「発注」ボタンで発注画面に遷移する
4. 発注数量を入力すると購入単位の倍数に自動調整される
5. 入荷予定日がリードタイムから自動計算される
6. 発注を確定し、在庫推移に入荷予定が反映される

---

## 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2026-03-17 | 初版作成 | - |
| 2026-03-17 | XP レビュー指摘 8 件（高）を反映: H1-H8 対応 | - |
| 2026-03-18 | S08 完了: バックエンド・フロントエンド・E2E テスト 7 件・レビュー対応・Quality Gate PASS | - |
| 2026-03-18 | S09 完了: 全タスク(2.1-2.7)完了。レビュー H1/H2/H4 対応。ADR-001 作成。進捗ドキュメント更新 | - |

---

## ADR

| ADR | タイトル | ステータス |
|-----|---------|-----------|
| [ADR-001](../adr/001-purchase-order-transaction-strategy.md) | 発注作成時のトランザクション方針 | 承認済み |

---

## 関連ドキュメント

- [リリース計画](./release_plan.md)
- [イテレーション 2 計画](./iteration_plan-2.md)
- [イテレーション 2 ふりかえり](./retrospective-2.md)
- [イテレーション 3 ふりかえり](./retrospective-3.md)
- [IT3 計画レビュー結果](../review/iteration_plan-3_review_20260317.md)
