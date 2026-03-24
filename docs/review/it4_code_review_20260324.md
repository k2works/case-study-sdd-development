# IT4 コードレビュー（S09 + S10）

## レビュー対象

- `apps/app/services/purchase_order_service.rb`
- `apps/app/controllers/purchase_orders_controller.rb`
- `apps/app/controllers/arrivals_controller.rb`
- `apps/app/views/purchase_orders/` (index, new, show, _form)
- `apps/app/views/arrivals/new.html.erb`
- `apps/config/routes.rb`
- `apps/spec/services/purchase_order_service_spec.rb`
- `apps/spec/requests/purchase_orders_spec.rb`
- `apps/spec/requests/arrivals_spec.rb`

## 総合評価

TDD サイクルに従い、インサイドアウトアプローチで Service → Controller → View の順序で実装。165 examples, 0 failures, カバレッジ 95.01%, RuboCop 0 offenses, Brakeman 0 warnings。Service Object パターンで Fat Controller を回避し、トランザクション制御も適切。IT3 の Try（空状態ガイダンス、共通テンプレートパターン）も反映済み。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `Date.parse` の例外ハンドリング追加 | PurchaseOrdersController:23, ArrivalsController:13 | tester | 無効な日付文字列で `ArgumentError` が未処理。`rescue ArgumentError` を追加すべき |
| 2 | `params[:purchase_order][:item_id]` の nil チェック | PurchaseOrdersController:21 | tester | `item_id` が送信されない場合 `ActiveRecord::RecordNotFound` が発生。`rescue` に追加するか事前チェック |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 3 | ステータスバッジの helper メソッド化 | index.html.erb, show.html.erb | programmer | 同じ case/when パターンが 2 箇所に重複。`PurchaseOrderHelper` に抽出すべき |
| 4 | `params[:status]` のホワイトリストバリデーション | PurchaseOrdersController:7 | architect | 任意の文字列を where 句に渡している。enum の値に限定すべき |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 5 | 入荷数量と発注数量の不一致チェック | PurchaseOrderService:24 | user-rep | 発注 10 に対して入荷 5 が可能。業務要件として許容するか明確化が必要 |
| 6 | `_form.html.erb` の data 属性に JSON | _form.html.erb:16 | technical-writer | 将来 Stimulus で使う想定だが、現時点では未使用。YAGNI 観点で削除検討 |

## 対応方針

- **#1, #2**: 修正する — Controller に `rescue ArgumentError, ActiveRecord::RecordNotFound` を追加
- **#3**: 保留 — Rule of Three で 3 画面に達したら抽出する
- **#4**: 修正する — `PurchaseOrder.statuses.keys` でホワイトリスト
- **#5**: 許容 — 部分入荷は業務上あり得る。IT5 以降で検討
- **#6**: 許容 — 将来の拡張用として残す

## 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2026-03-24 | 初版作成 | - |
