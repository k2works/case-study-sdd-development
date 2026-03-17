# フロントエンドアーキテクチャ - フレール・メモワール WEB ショップ

## アーキテクチャ選定

### 判断フロー

| 判断ポイント | 選定 | 理由 |
| :--- | :--- | :--- |
| プロジェクト規模 | 中小規模 → **6 フォルダシンプル構造** | UC 11 件、画面 11 件。1-2 名チームで管理可能な規模 |
| レンダリング戦略 | **SPA** | 内部管理画面 + 顧客向け注文画面。SEO 不要（WEB ショップは既存顧客向け） |
| 状態管理 | **Context API + hooks** | 状態がシンプル（受注・在庫のサーバーデータが中心） |
| スタイリング | **CSS/SCSS** | パフォーマンス重視。1-2 名チームで CSS-in-JS のオーバーヘッドは不要 |

## プロジェクト構造

```
src/
├── components/      # 共通 UI コンポーネント
│   ├── ui/          # Button, Input, Modal, Table 等
│   └── layout/      # Header, Sidebar, Footer
├── pages/           # ページコンポーネント（ルーティング）
│   ├── customer/    # 得意先向け画面
│   │   ├── ProductListPage.tsx    # 商品一覧
│   │   ├── OrderPage.tsx          # 注文画面
│   │   └── OrderHistoryPage.tsx   # 注文履歴
│   └── staff/       # スタッフ向け管理画面
│       ├── OrderListPage.tsx      # 受注一覧
│       ├── StockForecastPage.tsx  # 在庫推移
│       ├── PurchaseOrderPage.tsx  # 発注画面
│       ├── ArrivalPage.tsx        # 入荷登録
│       ├── ShipmentListPage.tsx   # 出荷一覧
│       ├── ProductMasterPage.tsx  # 商品管理
│       └── ItemMasterPage.tsx     # 単品管理
├── hooks/           # カスタムフック
│   ├── useOrders.ts
│   ├── useStockForecast.ts
│   ├── useProducts.ts
│   └── useApi.ts
├── utils/           # ユーティリティ
│   ├── api-client.ts
│   ├── date.ts
│   └── format.ts
├── types/           # TypeScript 型定義
│   ├── order.ts
│   ├── product.ts
│   ├── stock.ts
│   └── api.ts
└── config/          # 設定
    ├── constants.ts
    └── env.ts
```

## 画面構成

### 得意先向け画面

```plantuml
@startuml
title 得意先向け画面遷移

[*] --> 商品一覧

state 商品一覧 : 花束の一覧を表示
商品一覧 --> 注文画面 : 花束を選択

state 注文画面 : 届け日・届け先・メッセージを入力
注文画面 --> 注文確認 : 確認
注文画面 --> 商品一覧 : 戻る

state 注文確認 : 注文内容の確認
注文確認 --> 注文完了 : 確定
注文確認 --> 注文画面 : 修正

state 注文完了 : 注文完了メッセージ
注文完了 --> 商品一覧 : 続けて注文
注文完了 --> [*]

@enduml
```

### スタッフ向け管理画面

```plantuml
@startuml
title スタッフ向け管理画面遷移

[*] --> ダッシュボード

state ダッシュボード : 今日の出荷・在庫アラート
ダッシュボード --> 受注一覧
ダッシュボード --> 在庫推移
ダッシュボード --> 出荷一覧

state 受注一覧 : 受注状態別に一覧表示
受注一覧 --> 受注詳細

state 在庫推移 : 日別在庫予定数を表示
在庫推移 --> 発注画面

state 発注画面 : 単品の発注
state 入荷登録 : 入荷実績の記録

state 出荷一覧 : 出荷日の受注・花材一覧
出荷一覧 --> 出荷登録

state 商品管理 : 花束の構成管理
state 単品管理 : 花の単品情報管理

@enduml
```

## コンポーネント設計方針

### Container / Presentational パターン

```
pages/staff/StockForecastPage.tsx     # Container: データ取得・ロジック
  └── components/StockForecastChart   # Presentational: 在庫推移グラフ表示
  └── components/StockForecastTable   # Presentational: 在庫推移テーブル表示
```

### 状態管理

```plantuml
@startuml
package "状態管理" {
  rectangle "サーバー状態\n(受注・在庫・商品)" as server #lightblue
  rectangle "UI 状態\n(モーダル・フィルタ)" as ui #lightyellow
}

package "管理手法" {
  rectangle "Custom Hooks\n+ fetch" as hooks
  rectangle "useState\nuseReducer" as local
}

server --> hooks : API 通信・キャッシュ
ui --> local : ローカル管理

@enduml
```
