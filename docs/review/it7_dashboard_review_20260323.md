# IT7 ダッシュボードレビュー: 問題点と改善案

- **レビュー日**: 2026-03-23
- **対象**: ダッシュボード機能（S-100）— DashboardPage.tsx, OrderQueryService.java, OrderAdminController.java
- **レビュアー**: xp-programmer, xp-tester, xp-architect, xp-technical-writer, xp-user-representative

## 総合評価

ダッシュボードは「ログイン直後に何かしらの情報が見える」最低限の体験は提供できているが、**UI 設計書 S-100 との乖離が大きく、業務支援ダッシュボードとしての役割を果たせていない**。設計書が定義する 3 カード（本日の受注 / 在庫アラート / 本日の出荷）のうち、受注カードのみが部分的に実装されている状態。バックエンドでは `findAll()` による全件取得のパフォーマンス問題、ダッシュボードの責務が Order コンテキストに閉じ込められているアーキテクチャ問題、テストの完全な欠如が重なり、変更を楽に安全にできる状態にない。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | **設計書 S-100 との 3 カード構成の乖離を解消** | DashboardPage.tsx 全体 | 全エージェント | 設計書: 本日の受注/在庫アラート/本日の出荷。実装: 総受注数/未受付/在庫リンク。在庫アラートと出荷カードが未実装 |
| 2 | **ロール制限と設計書の「全スタッフ表示」の矛盾** | DashboardPage.tsx:10 | tester, tech-writer, user-rep | 設計書「ロールに関係なく全スタッフに表示」vs 実装 `OWNER/ORDER_STAFF/PURCHASE_STAFF` のみ。FLORIST/DELIVERY_STAFF が排除されている |
| 3 | **`findAll()` による全件メモリロードのパフォーマンス問題** | OrderQueryService.java:62 | programmer, architect | 全受注をメモリにロードし Stream でフィルタ。`COUNT ... GROUP BY status` の集計クエリに変更すべき |
| 4 | **SecurityConfig のデッドルール** | SecurityConfig:40 | tester | `/api/v1/admin/dashboard/**` ルールは実際のパス `/api/v1/admin/orders/dashboard/summary` にマッチしない。PURCHASE_STAFF のアクセス可否に影響する可能性 |
| 5 | **ダッシュボード専用テストが完全に不在** | — | tester, architect | getDashboardSummary() のユニットテスト、Controller テスト、認可テストがすべて欠如 |
| 6 | **`acceptedCount` の未使用** | DashboardSummary, DashboardPage.tsx | programmer | バックエンドで計算・転送されるが UI に一切表示されないデッドデータ |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 7 | **ダッシュボードの責務を Order コンテキストから分離** | OrderAdminController, OrderQueryService | architect | 在庫・出荷データ追加時に Order に Stock/Shipping 依存が混入する。DashboardController + DashboardQueryService の新設を推奨 |
| 8 | **用語の不統一: 「総受注数」「新規注文」「orderedCount」の混在** | フロントエンド表示/API/設計書 | tech-writer | 「受注」「注文」が混在。`orderedCount` は「注文済み」だが実態は「未受付」で意味が逆 |
| 9 | **クイックアクションのロール適合性** | DashboardPage.tsx:53-88 | programmer, user-rep | 全ロールに同じ 4 リンクを表示。得意先に「単品登録」、受注スタッフに不要な操作が見える。ナビバーではロール制御しているのにダッシュボードでは未制御 |
| 10 | **エラーハンドリングとローディング状態の欠落** | DashboardPage.tsx:12-19 | programmer, tester | useQuery の isLoading/isError を未処理。API 失敗時にサマリが無言で消える |
| 11 | **日付表示の欠如** | DashboardPage.tsx | tech-writer, user-rep | 設計書では「ダッシュボード（2026-03-31）」と日付表示あり。実装にはない |
| 12 | **各サマリカードから管理画面への導線不足** | DashboardPage.tsx:34-49 | user-rep | 受注カードに「受注管理へ」リンクがない。設計書では全カードにアクション導線あり |
| 13 | **OrderQueryService の CQS 違反** | OrderQueryService.java:49-58 | architect | Query Service に `acceptOrder()`/`bulkAcceptOrders()` という状態変更操作が混在 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 14 | **絵文字アイコンを SVG に変更** | DashboardPage.tsx:60,68,76,84 | tech-writer | IT4 レビュー L-1 の再掲。環境依存の表示差異 |
| 15 | **ロール判定ロジックの集約** | DashboardPage.tsx:10, AppLayout.tsx | programmer | `role === 'OWNER' || ...` が散在。`useAuth` に `isStaff` 等を追加して集約 |
| 16 | **キャッシュ戦略の明確化** | DashboardPage.tsx:12 | programmer | staleTime/refetchInterval 未設定。リアルタイム更新の要件と合わせて検討 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | architect: DashboardController を新設して責務分離 | programmer: 現状の OrderAdminController 内で十分 | API エンドポイントの配置 | 在庫・出荷データ追加が確定しているなら分離推奨。受注サマリのみなら現状維持も可 |
| 2 | user-rep: クイックアクションをロール別に完全カスタマイズ | tech-writer: 現状の 4 つで十分 | クイックアクションの粒度 | ロールごとに「最も使う操作」を出す方がユーザー体験は良い。ただし YAGNI の観点で段階的対応も可 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 3 / 低: 1）</summary>

- **高**: S-100 との 3 カード構成の乖離、findAll() パフォーマンス問題、acceptedCount の未使用
- **中**: ロール判定の散在リスク、エラーハンドリング欠落、フロントエンド型と DTO の不一致リスク
- **低**: クイックアクションのハードコード
- **良い点**: record 型の活用、条件付きデータ取得、ロール判定の明示性
</details>

<details>
<summary>xp-tester（高: 4 / 中: 2 / 低: 1）</summary>

- **高**: S-100 との乖離、getDashboardSummary() テスト不在、Controller テスト不在、SecurityConfig デッドルール
- **中**: findAll() パフォーマンス、error/loading 状態テスト不足
- **低**: acceptedCount の未使用
- **良い点**: OrderQueryService のテスタビリティ、セキュリティ設定の存在、DTO の record 型
- **重要発見**: SecurityConfig の `/api/v1/admin/dashboard/**` は実際のエンドポイントパスにマッチしないデッドルール
</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 1）</summary>

- **高**: API パス不一致の可能性、ダッシュボード責務の Order 閉じ込め、findAll() パフォーマンス
- **中**: OrderQueryService の CQS 違反、テスト不在、3 カード目の仕様乖離
- **低**: DashboardSummary/Response の冗長性（現時点では許容）
- **良い点**: ヘキサゴナルの基本構造維持、TanStack Query 活用、テスト習慣の存在
- **推奨実施順序**: API パス修正 → テスト追加 → 集計クエリ化 → DashboardController 新設 → CQS 一貫性回復 → 在庫・出荷実装
</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 2 / 低: 1）</summary>

- **高**: 3 カード構成の乖離、ロール制限と設計書の矛盾
- **中**: 用語の不統一（受注/注文/orderedCount）、クイックアクションのロール適合性
- **低**: 絵文字アイコンの環境依存
- **良い点**: ようこそメッセージの名前順序、クイックアクションの補助テキスト、未受付の色分け
- **懸念**: acceptedCount 未使用、error 状態未処理、日付表示欠如
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 2 / 低: 1）</summary>

- **高**: 全スタッフへのロール拡大、3 カード構成の設計書準拠実装、各カードへのアクション導線追加
- **中**: クイックアクションのロール別最適化、日付表示の追加
- **低**: サマリデータの自動更新
- **良い点**: ようこそメッセージ、ナビのロール制御、未受付のアンバー色
- **懸念**: FLORIST/DELIVERY_STAFF の体験空洞化、CUSTOMER にスタッフ向けリンクが見える権限問題
</details>
