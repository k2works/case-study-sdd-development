# IT6 開発成果物レビュー結果

## レビュー対象

- S06 在庫チェック付き届け日変更 + S15 注文キャンセルの実装コード
- 変更ファイル: 10 ファイル、+809 行

## 総合評価

ドメインモデルの不変性、TDD サイクルの遵守、テストの網羅性は高い水準にある。在庫チェック先行方式の採用により副作用のない安全な設計が実現されている。主な改善点は **ADR-003 で決定した `prisma.$transaction` が未導入** であること、**cancelOrder のガード条件が UseCase とドメインで二重定義** されていること、**キャンセル/届け日変更ボタンの二重送信防止が未実装** であること。これらは技術的負債として記録し、完成版リリース前に対応方針を決定すべき。

## 改善提案（重要度順）

### 高（リリース前に対応推奨）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| H1 | ADR-003 Phase 2 の `prisma.$transaction` 未導入 — deallocate + reallocate + order save が個別実行で中間不整合リスク | Architect | ADR-003 の決定事項との明確な乖離。ただし在庫チェック先行で副作用を最小化しており、InMemory 環境では問題なし |
| H2 | `cancelOrder` のガード条件が UseCase と `Order.cancel()` で二重定義 — DRY 違反 | Programmer | 一方を変更して他方を忘れるリスク。`cancel()` を Result パターンに統一するか UseCase 側を `try-catch` に変更 |
| H3 | キャンセル/届け日変更ボタンの二重送信防止がない — `disabled` 状態の管理が未実装 | User Rep | 在庫引当の解除を伴う処理で二重実行は在庫データ不整合リスク |
| H4 | `changeDeliveryDate` の戻り値型がプリミティブのインライン定義 — UseCase が DTO を兼ねている | Programmer | Discriminated Union 型を導入し、フォーマットはプレゼンテーション層に移すべき |

### 中（対応推奨）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| M1 | `saveAllocations` のロット分割ロジックが複雑 — `StockLot.splitAndAllocate()` メソッドとして抽出推奨 | Programmer, Architect | ドメイン知識の漏洩。UseCase が StockLot の内部構造を操作 |
| M2 | Routes 層のエラーハンドリングが不統一 — GET は try-catch なし | Programmer | 未処理例外が 500 になるリスク |
| M3 | `architecture_backend.md` に `GET /api/orders/{id}` と `PUT /api/customers/{id}` が欠落 | Tech Writer | API ドキュメントと実装の乖離 |
| M4 | `useApi.ts` の `fetch` 直接呼び出しと `fetchApi` の二重実装 | Tech Writer | 新規開発者が混乱。TODO コメント追加を推奨 |
| M5 | `DeliveryDate` の `skipValidation: true` の理由が不明 | Architect | バリデーションスキップはドメインルールの穴リスク |
| M6 | OrderDetail.tsx のインラインスタイル多用 | Programmer, Tech Writer | CSS クラスに統一すべき |
| M7 | E2E でキャンセル後の在庫復元の定量検証がない | Tester | 「キャンセル→同商品再注文」で間接的に在庫復元を確認推奨 |

### 低（改善の余地あり）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| L1 | `DeliveryDateChangeValidator` の `new Date()` 直接呼び出し — テスト時の日付制御困難 | Architect, Tester | Clock インターフェース導入推奨 |
| L2 | `!` Non-null Assertion の多用 — 型レベルで保証されていない | Programmer | `SavedOrder` 型の導入を検討 |
| L3 | `getOrderDestinations` のテストが欠落 | Programmer | 重複排除ロジックを含むためテスト必要 |
| L4 | 文字列リテラルによるステータス比較のハードコーディング | Programmer | 定数として管理すべき |

## 対応方針

| # | 方針 | 備考 |
|---|------|------|
| H1 | **許容する** | InMemory 環境では問題なし。本番 DB 導入時に $transaction を追加。技術的負債として記録 |
| H2 | **許容する** | 現時点で動作に問題なし。次回リファクタリング時に対応 |
| H3 | **許容する** | MVP スコープとして許容。将来の UX 改善で対応 |
| H4 | **許容する** | 型の改善は次回リファクタリング時 |
| M1-M7 | **技術的負債として記録** | 完成版リリース後のバックログに追加 |
| L1-L4 | **技術的負債として記録** | 優先度低 |

## 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-03-19 | 初版作成（5 エージェント並列レビュー結果統合） |
