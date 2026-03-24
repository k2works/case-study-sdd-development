# コードレビュー結果: IT2 開発成果物

レビュー日: 2026-03-24

## レビュー対象

- IT2 で追加された Customer, DeliveryAddress, Order モデル
- ShopController, Shop::OrdersController, OrdersController
- 得意先向け注文フロー + スタッフ向け受注管理

## 総合評価

データモデルとの整合性が高く、Rails MVC の規約に沿った堅実な実装。注文時価格のスナップショット、scope による絞り込み、N+1 対策が適切。ただし、**トランザクション制御の欠如**と **Controller への業務ロジック集中**が重要な指摘。

## 改善提案（重要度順）

### 高

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | **Shop::OrdersController#create にトランザクション追加** | Architect | DeliveryAddress 作成後に Order 保存失敗で孤立レコード |
| 2 | **IT3 で OrderService + OrderForm 導入を計画** | Architect | Fat Controller の技術的負債を認識・計画化 |

### 中

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 3 | 得意先向け画面のナビゲーション分離 | IxD/UserRep（予想） | スタッフ向けと同じナビが表示される |
| 4 | 注文入力画面のバリデーションエラー表示 | IxD/UserRep（予想） | エラー時の UX |

## 対応方針

### 修正する（即時）

| # | 対応内容 |
|---|---------|
| 1 | Shop::OrdersController#create にトランザクションを追加 |

### 許容する（IT3 で対応）

| # | 理由 |
|---|------|
| 2 | IT3 で在庫引当が入るタイミングで Service Object を導入 |
