# コードレビュー結果: IT5 出荷管理機能

**レビュー日**: 2026-03-25
**レビュー対象**: feat(shipment): IT5 出荷管理機能（S11: 出荷一覧、S12: 出荷処理）
**変更ファイル数**: 14 files, +483 lines

## 総合評価

出荷管理機能は既存アーキテクチャ（Controller → Service → Model のレイヤード構造）と高い整合性を持ち、先行パターン（PurchaseOrderService / Arrival）を忠実に踏襲している。TDD で開発され 193 examples, 0 failures / カバレッジ 96.02% を達成。命名・設計ともに明快で、テストがドキュメントとして十分機能している。ただし、`ship_all` のトランザクション境界、在庫消費の排他制御、境界値テストの不足に対応が必要。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `ship_all` を単一トランザクションで包む（All-or-Nothing） | `shipping_service.rb`:27-29 | programmer, architect, tester, writer, user | 部分出荷は業務事故に直結。3件中2件目でエラー時に1件目だけ出荷済みになる |
| 2 | 在庫消費に悲観ロック（`FOR UPDATE`）を追加 | `shipping_service.rb`:46-49 | programmer, architect, writer | 同時出荷で TOCTOU 競合により在庫がマイナスになるリスク |
| 3 | 在庫消費の境界値テストを追加 | `shipping_service_spec.rb` | tester | 複数ロットまたぎ、期限切れスキップ、ちょうど消費のケースが未テスト |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 4 | `Date.parse` の例外ハンドリング追加 | `shipments_controller.rb`:6 | programmer, architect, writer | 不正日付文字列で 500 エラー |
| 5 | Order の status 管理を `enum` に統一 | `order.rb`:2 | programmer, architect, writer | PurchaseOrder と不整合。手動定義の `shipped?`/`ordered?` が不要になる |
| 6 | 出荷日→届け日の変換を Order スコープに集約 | `shipments_controller.rb`:7 | architect, writer | ドメイン知識がコントローラに漏出 |
| 7 | 出荷処理の確認ダイアログ追加 | `index.html.erb` | user, writer | 不可逆操作の誤実行防止 |
| 8 | 受注数量（花束の個数）を一覧に表示 | `index.html.erb` | user | 結束作業の準備に必要な情報 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 9 | quantity=0 の Stock レコードのステータス更新 | `shipping_service.rb`:54 | programmer, architect | 無意味なレコードの走査コスト |
| 10 | 出荷処理後のリダイレクト先に出荷日パラメータを保持 | `shipments_controller.rb`:25 | user | 出荷処理後に日付がリセットされる |

## 矛盾事項

なし。全エージェントの指摘は一貫しており、特に #1（ship_all トランザクション）と #2（悲観ロック）は全エージェントが共通して指摘。

## 対応方針

| # | 方針 |
|---|------|
| 1 | **修正する** — ship_all を単一トランザクションに変更 |
| 2 | **修正する** — FOR UPDATE ロックを追加 |
| 3 | **修正する** — 複数ロット・期限切れ・ちょうど消費のテスト追加 |
| 4 | **修正する** — rescue Date::Error で Date.current にフォールバック |
| 5 | **保留する** — Order enum 化は影響範囲が広いため別タスクとして計画 |
| 6 | **修正する** — Order.for_shipping_date スコープを追加 |
| 7 | **保留する** — JavaScript 確認ダイアログは次イテレーションで対応 |
| 8 | **修正する** — 受注数量カラムを一覧に追加 |
| 9 | **保留する** — Stock のライフサイクル管理として別タスク |
| 10 | **修正する** — リダイレクト時に shipping_date パラメータを保持 |
