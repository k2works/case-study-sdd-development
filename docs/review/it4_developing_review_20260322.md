# IT4 開発成果物レビュー結果

**レビュー日**: 2026-03-22
**レビュー対象**: IT4 実装コード（在庫推移・発注機能のバックエンド + フロントエンド）

## レビュー対象

- バックエンド: domain/stock/, domain/purchaseorder/, application/, infrastructure/api/, infrastructure/persistence/
- フロントエンド: features/inventory/, features/purchase/, DashboardPage, AppLayout
- テスト: ドメインテスト、コントローラーテスト、フロントエンドテスト、E2E テスト
- マイグレーション: V6__create_stocks_and_purchase_orders.sql

## 総合評価

ヘキサゴナルアーキテクチャに忠実な堅実な実装。依存関係の方向は正しく、InventoryQueryPort による読み取りクエリの抽象化、Clock 注入によるテスタビリティ確保など、IT4 計画レビューの指摘を的確に反映している。ただし、**JpaInventoryQueryPort の入荷予定・受注引当が常に 0 を返す問題**が在庫推移の信頼性を損なっており、**PurchaseOrderPage の state 同期バグ**が意図しない数量での発注につながるリスクがある。設計ドキュメントとの乖離も複数箇所で確認された。

## 改善提案（重要度順）

### 高（早期に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | JpaInventoryQueryPort の getExpectedArrivals / getOrderAllocations が常に 0。IT5 で実装予定なら UI 上で「未反映」を明示 | JpaInventoryQueryPort.java | プログラマー / アーキテクト | 偽りの在庫予測に基づく発注判断のリスク |
| H-2 | PurchaseOrderPage の購入単位切り上げ後に setQuantity → mutate の state 非同期バグ。rounded 値を直接 API に送信すべき | PurchaseOrderPage.tsx:84-85 | プログラマー / ライター / ユーザー代表 | 意図しない数量での発注が発生し得る |
| H-3 | PurchaseOrderRepository.findByStatus(String) を findByStatus(PurchaseOrderStatus) に変更。String→enum 変換は Controller 層で | PurchaseOrderRepository.java | プログラマー / アーキテクト | ドメインポートの型安全性 |
| H-4 | Stock.create() / PurchaseOrder.create() の LocalDateTime.now() を Clock 注入に統一 | Stock.java:52, PurchaseOrder.java:56 | プログラマー / アーキテクト | InventoryTransitionService は Clock 注入済みなのに不整合 |
| H-5 | domain_model.md の supplierId → supplierName 更新。data-model.md の suppliers FK → supplier_name 更新 | 設計ドキュメント | ライター | 実装と設計ドキュメントの乖離が新規メンバーの混乱原因に |
| H-6 | PurchaseOrderStatus の状態遷移テスト網羅（9 パターン中 3 パターンのみ） | PurchaseOrderTest.java | テスター | 禁止遷移パスの検証不足 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | PurchaseOrderQueryService のテスト追加（findByStatus, findById の EntityNotFoundException パス） | テスト欠落 | テスター | 回帰リスク |
| M-2 | InventoryTransitionService の from > to テストケース追加 | テスト欠落 | テスター | 不正入力のハンドリング未検証 |
| M-3 | PurchaseOrder.create() のエラーメッセージから UI ロジック除去（「切り上げますか？」は UI 層の責務） | PurchaseOrder.java | プログラマー | ドメイン層に UI 対話ロジックが混入 |
| M-4 | PurchaseOrderPage を PurchaseOrderForm / PurchaseOrderList に分割（237 行→単一責任） | PurchaseOrderPage.tsx | プログラマー | 認知負荷とメンテナンス性 |
| M-5 | 発注確認ダイアログを実装（UI 設計で定義済み、window.confirm → モーダル） | PurchaseOrderPage.tsx | ライター / ユーザー代表 | 取り消し困難な操作に確認ステップが必要 |
| M-6 | 在庫推移画面に曜日表示を追加（「03/23(月)」形式）。IT3 から継続指摘 | InventoryTransitionPage.tsx | ユーザー代表 | 仕入先の営業日判断に曜日が必要 |
| M-7 | Stock / PurchaseOrder の setId() をパッケージプライベートに変更 | Stock.java:79, PurchaseOrder.java:83 | アーキテクト | 集約ルートの識別子が外部から変更可能 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | DailyInventory を Java record に変更 | DailyInventory.java | プログラマー | 不変値オブジェクトとして record が自然 |
| L-2 | StockStatus.DEGRADED の使用方針を ADR で明確化 | Stock.java, domain_model.md | プログラマー / アーキテクト | 定義のみで使用箇所なし |
| L-3 | ArrivalEntity に対応する Arrival ドメインクラスのスケルトン作成 | domain 層 | アーキテクト / ライター | IT5 準備として整合性確保 |
| L-4 | フロントエンドテストにユーザーインタラクション（フォーム送信、フィルター変更）テスト追加 | テスト | テスター | ユニット 6 件 vs E2E 12 件のアイスクリームコーン兆候 |
| L-5 | IT4 計画書の成功基準・デモ項目から入荷関連の打ち消し線追加 | iteration_plan-4.md | ライター | US-011 移動後のスコープ曖昧さ |

## 矛盾事項

なし。5 エージェントの指摘は概ね一致。特に H-1（InventoryQueryPort の 0 返却）、H-2（state 同期バグ）、H-4（LocalDateTime.now()）は複数エージェントから同時に指摘された。

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 5 / 低: 4）</summary>

Port/Adapter パターンの一貫性、PurchaseOrderStatus の状態遷移マシン、テスト命名の明確さを評価。Stock.create() の LocalDateTime.now()、PurchaseOrderRepository の String 型安全性、InventoryTransitionUseCase の薄さを指摘。PurchaseOrderPage の state 非同期バグ、フロント・バック双方の購入単位チェック重複を懸念。

</details>

<details>
<summary>xp-tester（高: 3 / 中: 2 / 低: 2）</summary>

PurchaseOrderStatus の状態遷移テスト網羅不足（9 パターン中 3 のみ）、PurchaseOrderQueryService テスト欠落、InventoryTransitionService の from > to テスト未実装を重点指摘。フロントエンドのユニット:E2E 比率がアイスクリームコーン兆候。

</details>

<details>
<summary>xp-architect（高: 2 / 中: 3 / 低: 3）</summary>

依存関係の方向の正しさ、InventoryQueryPort の CQRS 的分離を評価。JpaInventoryQueryPort の 0 返却、PurchaseOrder コンストラクタのバリデーション欠如を重点指摘。JPQL の文字列リテラル enum 比較、SecurityConfig の認可ルール順序依存を懸念。

</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 4 / 低: 2）</summary>

domain_model.md と data-model.md の実装乖離（supplierId → supplierName、suppliers FK）を重点指摘。PurchaseOrderPage の state 非同期バグを確認。マイグレーションファイル名の計画・実装不一致、Arrival ドメインエンティティの不在、IT4 計画の成功基準にUS-011が残存する問題を指摘。

</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 2 / 低: 1）</summary>

曜日表示の未実装（IT3 から 3 回連続指摘）、発注確認ダイアログの未実装を重点指摘。購入単位切り上げの state 非同期問題が業務上の実害（意図しない数量での発注）につながることを懸念。

</details>

---

## 記入履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-03-22 | 初版作成。5 エージェント（プログラマー、テスター、アーキテクト、テクニカルライター、ユーザー代表）によるレビュー結果を統合 |
