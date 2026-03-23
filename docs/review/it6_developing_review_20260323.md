# コードレビュー結果: IT6 実装（出荷・キャンセル・届け日変更）

## レビュー対象

- **イテレーション**: 6
- **対象ストーリー**: US-014（出荷処理 3SP）、US-019（注文キャンセル 5SP）、US-008（届け日変更 8SP）
- **変更規模**: 33 ファイル、+2,224 行
- **レビュー日**: 2026-03-23

## 総合評価

IT6 の実装は全体として **良好** です。UseCase クラスは単一責任原則に従い、ドメインモデル（Order, OrderStatus）にビジネスルールが適切にカプセル化されています。テストピラミッドも健全で、ドメイン層が最も厚く、Web 層が最も薄い理想的な構造です。フロントエンドの UX（確認ダイアログ、トースト通知、在庫チェック + 代替日提案）は業務ユーザーの期待に合っています。一方で、**OrderAdminController の責務過多**、**Clock 未注入の一貫性欠如**、**IllegalStateException のグローバルハンドリング未定義**、**出荷ステータスチェックのパターン不統一** が主要な改善点です。

---

## 改善提案（重要度順）

### 高（次イテレーションで対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | OrderAdminController の Repository 直接依存を除去。toResponseWithDetails() を Application Service（OrderDetailQueryService）に移動 | `OrderAdminController.java:34-56,129-146` | Programmer, Architect, TechWriter | SRP 違反。Controller が 7 依存を持ち HTTP ハンドリング + データ組み立ての両方を担当。ShipmentQueryService と重複ロジックあり（DRY 違反） |
| H-2 | ShipOrderUseCase のステータスチェックを canShip() パターンに統一 | `ShipOrderUseCase.java:24` | Programmer, Tester | CancelOrderUseCase は canCancel()、RescheduleOrderUseCase は canReschedule() を使うのに、ShipOrderUseCase だけ `getStatus() != PREPARING` で直接比較。ビジネスルールが UseCase 層に漏洩 |
| H-3 | IllegalStateException のグローバルハンドラーを追加（409 Conflict） | `GlobalExceptionHandler.java` | TechWriter | Order.ship()/cancel()/reschedule() が throw する IllegalStateException が 500 Internal Server Error になる。クライアントがサーバー障害と区別できない |
| H-4 | DeliveryDateChangeValidator に Clock 注入 | `DeliveryDateChangeValidator.java:79` | Programmer, Tester, Architect | findAlternativeDates() で LocalDate.now() を直接呼び出し。テストで「今日」を制御できず、日付境界テストが書けない |
| H-5 | OrderQueryService から acceptOrder/bulkAcceptOrders を AcceptOrderUseCase に分離 | `OrderQueryService.java` | Programmer, Architect | QueryService に Write 系メソッドが混在（CQRS 違反）。命名と実態の不一致 |
| H-6 | ShipOrderUseCaseTest の出荷不可ステータステストを拡充（ParameterizedTest で全不正ステータスを網羅） | `ShipOrderUseCaseTest.java:67-75` | Tester | 現在 ACCEPTED の 1 ケースのみ。ORDERED, SHIPPED, DELIVERED, CANCELLED でも検証すべき |
| H-7 | CancelOrderUseCaseTest に SHIPPED/DELIVERED/CANCELLED のキャンセル不可テストを追加 | `CancelOrderUseCaseTest.java` | Tester | PREPARING のみでキャンセル拒否をテスト。終端近くのステータスのテストが欠落 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | Order.accept()/prepare()/ship()/cancel() に Clock 注入オーバーロード追加 | `Order.java:63-81` | Programmer, Architect | create() と reschedule() は Clock 対応済みだが、他のメソッドは LocalDateTime.now() を直接呼び出し。設計方針の一貫性欠如 |
| M-2 | RescheduleOrderUseCase.check() にステータス事前チェック追加 | `RescheduleOrderUseCase.java:42-47` | Programmer, Tester | SHIPPED の注文に check() を呼ぶと「在庫あり」と返す可能性。execute() にはチェックがあるのに check() には欠落 |
| M-3 | OrderResponse に canCancel/canReschedule フラグを追加し、フロントエンドのステータスハードコードを排除 | `OrderDetailPage.tsx:17`, `Order.java` | TechWriter, UserRep | フロントエンドに CANCELLABLE_STATUSES がハードコードされ、バックエンドと二重管理。API レスポンスに可否フラグを含めることで設計自体がドキュメントの代わりになる |
| M-4 | DeliveryDateChangeValidatorTest の代替日テストを強化（具体的な日付値の検証） | `DeliveryDateChangeValidatorTest.java:81-104` | Tester | 現在 `hasSizeLessThanOrEqualTo(5)` のみ。contains() で期待する代替日を検証すべき |
| M-5 | OrderAdminControllerIT6Test に出荷・届け日変更の認可テスト追加 | `OrderAdminControllerIT6Test.java` | Tester | キャンセルのみ CUSTOMER 403 テストがある。出荷・届け日変更にも認可テストが必要 |
| M-6 | DeliveryDateChangeValidator の定数にビジネス根拠のコメント追加 | `DeliveryDateChangeValidator.java:18-19` | TechWriter | MAX_ALTERNATIVE_DATES=5、SEARCH_RANGE_DAYS=14 の根拠が不明 |
| M-7 | フロントエンドのエラーメッセージをステータスコード別に分岐（409 ではリトライ不要のメッセージに） | `OrderDetailPage.tsx:165-168,204-208` | TechWriter, UserRep | すべて「もう一度お試しください」では 409 時にリトライを促す不適切なメッセージ |
| M-8 | calculateAvailable() に在庫計算式のコメント追加 | `DeliveryDateChangeValidator.java:68-74` | TechWriter | `現在在庫 + 入荷予定 - 引当済み - 期限切れ予定` は花業界特有の非自明なロジック |
| M-9 | 届け日変更の在庫チェック API 呼び出し失敗時にフィードバック表示 | `OrderDetailPage.tsx:85-89` | TechWriter, UserRep | catch ブロックが空で、ネットワークエラー時にユーザーに何も表示されない |
| M-10 | ShipmentQueryService のユニットテスト作成 | `ShipmentQueryService.java` | Programmer, Architect | テストクラスが存在しない。N+1 クエリロジックや empty ケースのテストが必要 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | buildShortageReason を StringJoiner/Collectors.joining に置換 | `DeliveryDateChangeValidator.java:120-125` | Programmer, TechWriter | substring で末尾削除は脆弱。意図がより明確になる |
| L-2 | Order.setId() をパッケージプライベートに変更 | `Order.java:108-110` | Programmer | ドメインエンティティの ID を public setter で書き換え可能。不変性を損なう |
| L-3 | shipment-api.ts と order-admin-api.ts の shipOrder 重複を解消 | FE API クライアント | TechWriter | 同一エンドポイントが 2 箇所に定義。DRY 違反 |
| L-4 | findAlternativeDates() の結果を日付順にソート | `DeliveryDateChangeValidator.java:77-106` | Tester | 前方→後方探索で結果が混在。UX として日付順ソートが期待される |
| L-5 | canCancel()/canReschedule() の全ステータステストを追加（SHIPPED/DELIVERED/CANCELLED） | `OrderTest.java` | Tester | 現在は一部ステータスのみ。全ステータスで網羅すべき |
| L-6 | 出荷一覧に一括出荷機能の検討 | `ShipmentPage.tsx` | UserRep | 配送スタッフの朝業務で 1 件ずつ確認ダイアログは非効率。Phase 3 以降で検討 |
| L-7 | OpenAPI アノテーション（@Operation, @ApiResponse, @Tag）追加 | `OrderAdminController.java`, `ShipmentController.java` | TechWriter | Swagger UI が公開設定だが API ドキュメントが最低限の自動生成のみ |

---

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | Architect: SecurityConfig で `/api/v1/admin/orders/{id}/ship` は ORDER_STAFF がアクセス可能 | UserRep: 出荷は DELIVERY_STAFF の業務 | 出荷 API のロール設定が業務実態と不一致の可能性 | SecurityConfig の意図を確認。出荷操作を `/api/v1/admin/shipments/{id}/ship` に移動するか、orders パス配下でもロール制限を追加するか検討 |
| 2 | Programmer: canReschedule() のハードコード（ORDERED/ACCEPTED）は二重管理 | Architect: reschedule は状態遷移ではなく属性変更なので別管理で妥当 | canReschedule() を OrderStatus の遷移テーブルに統合すべきか | Architect の判断を支持。reschedule は状態遷移ではないため、コメントで意図を明記した上で現状維持 |

---

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 2 / 低: 2）</summary>

### 評価サマリー
全体として良好。UseCase の単一責任、OrderStatus の状態遷移設計が優秀。ステータスチェックの一貫性欠如、Clock 未注入、Controller 責務過多の 3 点に改善の余地あり。

### 主要指摘
- **H**: ShipOrderUseCase のステータスチェックが直接比較（canShip() パターン不統一）
- **H**: LocalDate.now()/LocalDateTime.now() の直接呼び出し（Clock 未注入）
- **H**: OrderAdminController の 7 依存、toResponseWithDetails() の責務過多
- **M**: ShipmentQueryService にテストがない
- **M**: RescheduleOrderUseCase.check() でステータスチェック欠落
- **スコープ外**: Order.setId() の public setter、OrderQueryService の Command/Query 混在
</details>

<details>
<summary>xp-tester（高: 3 / 中: 3 / 低: 2）</summary>

### 評価サマリー
テストピラミッドは健全。ドメイン層のテストが最も厚く、境界値分析も適切。ステータス遷移テストの一部欠落、LocalDate.now() 依存、認可テストの不均一が課題。

### 主要指摘
- **H**: ShipOrderUseCaseTest の出荷不可ステータスが 1 ケースのみ
- **H**: CancelOrderUseCaseTest に SHIPPED/DELIVERED/CANCELLED のテスト欠落
- **H**: DeliveryDateChangeValidatorTest の代替日テストの検証が弱い
- **M**: RescheduleOrderUseCaseTest の check() 異常系テスト欠落
- **M**: テスト全体の LocalDate.now() 依存（CI flaky test リスク）
- **M**: 出荷・届け日変更の認可テスト欠落
- **スコープ外**: ShipOrderUseCase の二重チェック、代替日のソート未保証
</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 1）</summary>

### 評価サマリー
ヘキサゴナルアーキテクチャの基本構造は維持されている。新規 UseCase（CancelOrderUseCase, ShipOrderUseCase, RescheduleOrderUseCase）は理想的な設計。OrderAdminController の Repository 直接依存と OrderQueryService の CQRS 違反が主要な技術的負債。

### 主要指摘
- **H**: OrderAdminController の Repository 直接依存（Controller → Domain Port 直接参照）
- **H**: OrderQueryService の Command/Query 混在（AcceptOrderUseCase 分離推奨）
- **H**: DeliveryDateChangeValidator の Clock 未注入
- **M**: Order.accept()/prepare()/ship()/cancel() の Clock 注入統一
- **M**: @Transactional の Application 層使用方針の ADR 記録
- **改善優先順位**: 1.Controller 責務除去 → 2.AcceptOrderUseCase 抽出 → 3.Clock 注入 → 4.canShip() 統一
</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 4 / 低: 1）</summary>

### 評価サマリー
ドメインモデルの命名が優秀で自己文書化レベルが高い。テスト名が日本語で仕様書として機能。OpenAPI アノテーション完全欠如と IllegalStateException のグローバルハンドリング未定義が重大な問題。

### 主要指摘
- **H**: OpenAPI アノテーション（@Operation, @ApiResponse）が一切ない
- **H**: IllegalStateException のハンドラー未定義（500 を返す）
- **M**: DeliveryDateChangeValidator の定数にビジネス根拠コメント欠如
- **M**: calculateAvailable() の在庫計算式コメント欠如
- **M**: OrderResponse に canCancel/canReschedule フラグ追加（二重管理排除）
- **M**: フロントエンドのエラーメッセージが全て同一（ステータスコード別分岐なし）
- **スコープ外**: shipment-api.ts と order-admin-api.ts に shipOrder 重複定義
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 2 / 低: 1）</summary>

### 評価サマリー
3 機能とも業務フローに沿った実装。確認ダイアログ、トースト通知、在庫チェック + 代替日提案の UX は受注スタッフ・配送スタッフの期待に合っている。内部 ID 表示問題、一括出荷機能欠如、在庫チェックエラー時のフィードバック欠如が主要課題。

### 主要指摘
- **H**: 受注詳細画面で productId/customerId/deliveryDestinationId の内部 ID が表示される可能性（productName/customerName/recipientName を使うべき）
- **H**: 出荷一覧に一括出荷機能がない（配送スタッフの朝業務で 1 件ずつは非効率）
- **H**: 届け日変更の在庫チェックエラー時にフィードバックが表示されない（catch ブロック空）
- **M**: エラーメッセージが全て「もう一度お試しください」でステータスコード別分岐なし
- **M**: 出荷一覧のデフォルト日付が「今日」だが、業務的には「翌日出荷分」が適切
</details>

---

## 対応方針

### 次イテレーション（IT7）で対応

| # | 対応内容 | 関連指摘 |
|---|---------|---------|
| 1 | IllegalStateException → 409 Conflict ハンドラー追加 | H-3 |
| 2 | DeliveryDateChangeValidator に Clock 注入 | H-4 |
| 3 | フロントエンドのエラーメッセージをステータスコード別に分岐 | M-7, M-9 |

### バッファイテレーションで対応検討

| # | 対応内容 | 関連指摘 |
|---|---------|---------|
| 1 | OrderAdminController リファクタリング（OrderDetailQueryService 抽出） | H-1 |
| 2 | AcceptOrderUseCase 分離（OrderQueryService の CQRS 準拠） | H-5 |
| 3 | canShip() パターン統一 + テスト拡充 | H-2, H-6, H-7 |
| 4 | OrderResponse に canCancel/canReschedule フラグ追加 | M-3 |
| 5 | OpenAPI アノテーション追加 | L-7 |

### 許容（現時点では対応不要）

| # | 理由 | 関連指摘 |
|---|------|---------|
| 1 | 出荷一覧の一括出荷は Phase 3 スコープ外。バッファ IT で検討 | L-6 |
| 2 | Order.setId() は永続化層で必要。パッケージプライベートへの変更は影響範囲が広い | L-2 |
| 3 | canReschedule() のハードコードは状態遷移ではなく属性変更のため現状維持 | 矛盾事項 #2 |
