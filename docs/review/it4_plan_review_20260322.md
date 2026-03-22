# IT4 計画 + バグ修正レビュー結果

**レビュー日**: 2026-03-22
**レビュー対象**: docs/development/iteration_plan-4.md、注文 403 バグ修正コード

## レビュー対象

- IT4 イテレーション計画（在庫推移・発注・入荷、16SP）
- 注文 403 バグ修正（GlobalExceptionHandler、SecurityConfig、OrderFormPage TZ 修正、api.ts interceptor、ログイン UI 改善）

## 総合評価

IT4 計画はドメインモデル・データモデル・API 設計が具体的で、開発者が着手可能なレベルに達している。在庫集約と発注集約の分離、InventoryTransitionService のドメインサービス化は設計として正しい。しかし、**SecurityConfig で PURCHASE_STAFF ロールが `/api/v1/admin/**` にアクセスできない問題**が IT4 の実装ブロッカーとなっている。また、16SP はベロシティ平均を 37% 超過しており、US-011 の IT5 移動を強く推奨する。バグ修正コードは根本原因に対処できているが、修正箇所のテストが不足している。

## 改善提案（重要度順）

### 高（実装前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | SecurityConfig に PURCHASE_STAFF ロールを追加 | SecurityConfig.java:34 | プログラマー / アーキテクト | IT4 の全 API（在庫推移・発注・入荷）が仕入スタッフに使えない。ブロッカー |
| H-2 | InventoryTransitionService に Clock 注入を設計 | IT4 計画 タスク 1.2 | テスター | 日付テスタビリティ確保。TZ バグの再発防止。`LocalDate.now()` 直接呼び出しを避ける |
| H-3 | supplierId vs supplier_name の不整合を解消 | IT4 計画 ドメインモデル / SQL | アーキテクト / ライター | ドメインモデル図（supplierId: String）と SQL（supplier_name）と全体設計（supplierId: SupplierId）が三者不一致。既存 Item 実装に合わせて supplier_name 文字列で統一推奨 |
| H-4 | 受注引当のデータソースを明記 | IT4 計画 タスク 1.2, 1.3 | ライター | InventoryTransitionService が Order 集約の引当数量をどう取得するかが未定義。InventoryQueryPort の設計が必要 |
| H-5 | OrderFormData の型定義を共通化（DRY） | OrderFormPage.tsx:7-14, OrderConfirmPage.tsx:9-16 | プログラマー | 同一インターフェースが 2 ファイルに重複。types/order.ts に抽出 |
| H-6 | GlobalExceptionHandler + SecurityConfig のテスト追加 | テストファイル | テスター / プログラマー | IllegalArgumentException ハンドラのテストが未実装。認可ルールの統合テストも不在 |
| H-7 | US-011（入荷登録 3SP）を IT5 に移動 | IT4 計画全体 | ユーザー代表 / プログラマー | 16SP は平均 11.7SP の 137%。SP 外タスク 15.5h を含む実質 52h は 2 週間で消化困難 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | api.ts のデバッグログを DEV 環境限定に | api.ts:14-18 | プログラマー | JWT ペイロードのロール情報がコンソールに露出 |
| M-2 | Item.java の shelfLifeDays → qualityRetentionDays リネーム | Item.java | アーキテクト | ユビキタス言語との不整合。IT4 開始前にリファクタリング |
| M-3 | 在庫推移の境界値テストケースをタスク着手前に明文化 | IT4 計画 タスク 1.2 | テスター | マイナス在庫、品質維持日数 0/1 日、同日入荷廃棄、期間 from==to 等 |
| M-4 | Arrival → Stock の集約間調整パターンを明記 | IT4 計画 タスク 3.1 | アーキテクト | RegisterArrivalUseCase が発注ステータス更新 + 在庫作成の 2 集約を調整する設計意図を文書化 |
| M-5 | API レスポンスの JSON スキーマを追記 | IT4 計画 API 設計 | ライター | 特に在庫推移 API の DailyInventory レスポンス構造がフロントエンド実装に必要 |
| M-6 | stocks テーブルに updated_at カラム追加 | IT4 計画 SQL | アーキテクト | consume() で数量変更時に必要 |
| M-7 | ナビゲーションに在庫管理・発注管理リンク追加タスク | AppLayout.tsx | ユーザー代表 | 仕入スタッフ向けメニューが未実装 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | formatPrice / roleLabel の共通ユーティリティ化 | 複数コンポーネント | プログラマー | DRY 原則。複数ファイルに散在 |
| L-2 | E2E テストに届け日の検証アサーション追加 | order.spec.ts | テスター | TZ バグを E2E で検出できなかった原因 |
| L-3 | DailyInventory.projectedStock のマイナス許容仕様を明確化 | IT4 計画 | テスター / ユーザー代表 | アラート条件としてマイナスを許容するか 0 クランプか未定義 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | アーキテクト: InventoryQueryPort でポート抽象化すべき | プログラマー: IT4 のスコープが膨らむ | InventoryTransitionService の依存設計 | **アーキテクト優先**。テスタビリティに直結し、テスターも Clock 注入を要求している |
| 2 | テスター: テストを各タスク完了直後に組み込むべき | 計画: Day 9-10 にテスト集中 | テストスケジュール | **テスター優先**。統合テストを Week 1 末に移動し、E2E のみ Day 10 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 2 / 低: 2）</summary>

SecurityConfig の PURCHASE_STAFF 欠落（ブロッカー）、OrderFormData の DRY 違反、注文フロー関連コンポーネントのテスト不在を指摘。api.ts のデバッグログ残留、formatPrice/roleLabel の共通化も提案。ベロシティ超過リスクとして SP 外タスク 15.5h の影響を懸念。

</details>

<details>
<summary>xp-tester（高: 4 / 中: 2 / 低: 1）</summary>

在庫推移計算の境界値テスト不足を詳細に列挙。Clock 注入によるテスタビリティ確保を最重要提案。GlobalExceptionHandler + SecurityConfig のテスト不在を指摘。TZ バグが発生した根本原因分析（フロントエンドのユニットテスト欠如 + 統合テスト層の認可+エラーハンドリング組み合わせ未カバー）が特に有価値。

</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 2）</summary>

InventoryTransitionService のポート依存の暗黙性を指摘し、InventoryQueryPort の追加を提案。supplierId vs supplier_name の設計不整合を特定。Arrival の集約帰属について UseCase 層調整（選択肢 A）を推奨。Item.java の shelfLifeDays 命名不整合も発見。

</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 4 / 低: 2）</summary>

ドメインモデルの supplierId/supplier_name 不整合、Arrival の集約帰属の未文書化、受注引当データソースの未定義を指摘。API レスポンス JSON スキーマの不足、Flyway マイグレーション番号の前提確認の必要性も提案。リリース計画との記述不整合（IT3 ゴールに「在庫推移」含む）も発見。

</details>

<details>
<summary>xp-user-representative（高: 0 / 中: 3 / 低: 2）</summary>

US-011 の IT5 移動を推奨。ナビゲーションに在庫管理・発注管理リンクが未実装の問題を指摘。バグ修正後のエラーメッセージパターン（ステータス別メッセージ + 次のアクション案内）を IT4 でも踏襲するよう推奨。

</details>

---

## 記入履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-03-22 | 初版作成。5 エージェント（プログラマー、テスター、アーキテクト、テクニカルライター、ユーザー代表）によるレビュー結果を統合 |
