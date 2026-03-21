# IT3 開発成果物マルチパースペクティブレビュー

**レビュー日**: 2026-03-21
**対象**: IT3 注文・受注管理機能（48 ファイル、+2,676 行）

## レビュー対象

- US-005: 花束を注文する（8 SP）
- US-006: 受注一覧を確認する（3 SP）
- US-007: 受注を受け付ける（2 SP）

## 総合評価

ドメイン層の設計品質は高く、TDD の規律がよく守られています。Value Object（DeliveryDate, Message）による不変条件の保護、OrderStatus のステートマシンパターン、ヘキサゴナルアーキテクチャの一貫性はいずれも優れています。一方で、**OrderQueryService の責務超過**（コマンドとクエリの混在）、**受注一覧での ID 表示**（商品名・得意先名が未表示）、**フロントエンドテストの不在**が主要な改善ポイントです。

---

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | 受注一覧・詳細に「商品名」「得意先名」「届け先情報」を表示する（ID ではなく） | OrderListPage.tsx, OrderDetailPage.tsx | User Rep | US-006 受入条件「商品名・得意先が表示される」を満たしていない。業務上 ID は無意味 |
| H-2 | `OrderQueryService` から `acceptOrder`/`bulkAcceptOrders` を `AcceptOrderUseCase` に分離する | OrderQueryService.java:39-49 | Programmer, Architect, Writer | SRP/CQRS 違反。Query Service に状態変更操作が混在 |
| H-3 | ダッシュボード集計ロジックを Controller から Service 層に移動し、型安全なレスポンス DTO を使用する | OrderAdminController.java:70-84 | Programmer, Architect | 責務漏洩 + 全件取得のパフォーマンス問題 + `Map<String, Object>` の型安全性欠如 |
| H-4 | `OrderController.getMyOrders()` の Customer 検索ロジックをアプリケーション層に移動する | OrderController.java:52-60 | Programmer, Architect | Controller がリポジトリに直接依存しており、ヘキサゴナルアーキテクチャに不整合 |
| H-5 | ステータスバッジに色分けを追加する | OrderListPage.tsx:207-210 | User Rep | 受注スタッフが視覚的に未処理件数を即座に把握できない |
| H-6 | `bulkAcceptOrders` のテストを追加する | OrderQueryServiceTest.java | Tester | 一括受付のテストが一切ない。部分失敗時の挙動も未検証 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | `LocalDateTime.now()` / `LocalDate.now()` を `Clock` 注入に変更する | Order.java:49, DeliveryDate.java:33 | Programmer, Architect, Tester | テスタビリティの欠如。日付境界でテストが不安定になるリスク |
| M-2 | トランザクション境界を `@Transactional` で明示する | PlaceOrderUseCase, OrderQueryService | Programmer, Architect | DeliveryDestination だけ保存されて Order の保存に失敗するリスク |
| M-3 | `STATUS_LABELS` を共通 constants ファイルに抽出する | OrderListPage.tsx, OrderDetailPage.tsx | Programmer | DRY 違反。2 ファイルに同一定義が重複 |
| M-4 | `findByStatusAndDateRange` の status=null パスのテストを追加する | OrderQueryServiceTest.java | Tester | 条件分岐の片方のパスが未テスト |
| M-5 | OrderStatus の ACCEPTED→CANCELLED, PREPARING→CANCELLED 遷移テストを追加する | OrderStatusTest.java | Tester | 許可された遷移の一部がテスト未カバー |
| M-6 | 日付表示を日本語形式（2026年4月15日(水)）にする | OrderConfirmPage.tsx, OrderListPage.tsx | User Rep | ISO 形式は得意先にとって不親切。曜日表示は記念日の確認に重要 |
| M-7 | 注文完了画面に注文番号を表示する | OrderCompletePage.tsx | User Rep | 得意先の問い合わせ時の特定が困難 |
| M-8 | フィルタ条件の片方だけ指定された場合のバリデーションを追加する | OrderAdminController.java:36-41 | Programmer, Architect, Writer | from のみ / to のみの場合に全件取得にフォールバックする暗黙の動作 |
| M-9 | 受付ボタンに確認ダイアログを追加する | OrderDetailPage.tsx, OrderListPage.tsx | User Rep | ステータス変更は不可逆操作。誤クリック防止が必要 |
| M-10 | 郵便番号のフォーマットバリデーション（123-4567 形式）を追加する | OrderFormPage.tsx:56-60 | User Rep | 不正な郵便番号が配達業務に支障 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | `setId()` メソッドをパッケージプライベートにする | Order.java, Customer.java | Programmer, Architect | ドメインオブジェクトの不変性を損なう（既存パターンとの一貫性あり） |
| L-2 | `OrderFormPage` を複数コンポーネントに分離する | OrderFormPage.tsx | Programmer | 1 コンポーネントに多くの責務 |
| L-3 | `isAccepting` state を `useMutation.isPending` で代替する | OrderDetailPage.tsx:20-21 | Programmer | state の重複 |
| L-4 | 「この商品を注文する」ボタンを CUSTOMER ロールのみ表示する | ProductDetailPage.tsx:77-83 | User Rep | スタッフが誤って注文を作成するリスク |
| L-5 | 日付フィルタのラベルを「配達日（開始）」のように明確化する | OrderListPage.tsx:108-131 | User Rep | 注文日か配達日か不明確 |
| L-6 | 完了報告書の計画期間・実績期間の矛盾を補足説明する | iteration_report-3.md:8-9 | Writer | AI 開発による短期完了の文脈説明が不足 |

---

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | Programmer: `setId()` を削除すべき | Architect: 既存パターンとの一貫性を優先 | エンティティの `setId()` の扱い | IT4 以降で段階的に移行。現時点は既存パターン維持 |
| 2 | Tester: `Clock` を DI すべき | Programmer: ファクトリメソッドの引数で受け取る | 時刻制御の方式 | `Clock` DI をプロジェクト全体の方針として ADR に記録し段階的に移行 |

---

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 4 / 中: 4 / 低: 2）</summary>

**評価**: ドメイン層の設計品質は高く TDD の規律が良好。OrderQueryService の責務超過と Controller の責務漏洩が主な課題。フロントエンドテストの不在が TDD 規律からの逸脱。

主な指摘:
- OrderQueryService に acceptOrder/bulkAcceptOrders が混在（SRP 違反）
- Order.create() の LocalDateTime.now() 直接呼び出し（テスタビリティ欠如）
- ダッシュボード集計ロジックが Controller に直書き
- OrderController.getMyOrders() で CustomerRepository を直接呼び出し
- フロントエンドテストが存在しない
- STATUS_LABELS が 2 ファイルで重複
</details>

<details>
<summary>xp-tester（高: 3 / 中: 4 / 低: 2）</summary>

**評価**: B+。ドメイン層の境界値テストは模範的。アプリケーション層のテストカバレッジに穴がある。

主な指摘:
- bulkAcceptOrders のテストが存在しない
- findByStatusAndDateRange の status=null パスが未テスト
- PlaceOrderUseCaseTest で save 引数の ArgumentCaptor 検証が不足
- DeliveryDateTest の LocalDate.now() 依存による脆弱性
- ACCEPTED→CANCELLED, PREPARING→CANCELLED の遷移テスト不足
- 空白のみの得意先名テストがない
</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 2）</summary>

**評価**: ヘキサゴナルアーキテクチャに忠実。依存関係の方向は正しい。OrderQueryService の責務超過と Controller からの直接リポジトリ呼び出しが主な課題。

主な指摘:
- OrderQueryService の命名と責務の不一致
- Controller がリポジトリを直接呼び出し
- ダッシュボード集計ロジックの Controller 漏出
- トランザクション境界の不明確さ
- LocalDateTime.now() のプロジェクト横断的課題
</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 4 / 低: 2）</summary>

**評価**: API 設計は直感的でバリデーションメッセージも適切。完了報告書の日付矛盾と OrderQueryService の命名問題が主な課題。

主な指摘:
- iteration_report-3.md の計画期間と実績期間の矛盾
- OrderQueryService の命名と責務の不一致
- API Controller に Javadoc がない
- ダッシュボードの Map<String, Object> レスポンス
- OrderResponse に届け先情報が不足
- 累計 SP の文脈説明不足（Phase 1 のみ vs 全 Phase）
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 4 / 低: 2）</summary>

**評価**: 注文フローは直感的で業務に沿っている。受注一覧の表示項目とステータス色分けに業務効率の改善余地がある。

主な指摘:
- 受注一覧に商品名・得意先名が表示されていない（ID のみ）
- ステータスバッジに色分けがない
- 注文詳細に届け先情報が表示されない
- 郵便番号のフォーマットバリデーション不足
- 日付表示が ISO 形式のまま
- 注文完了画面に注文番号がない
- 受付ボタンに確認ダイアログがない
</details>
