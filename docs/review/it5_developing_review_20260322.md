# IT5 開発成果物レビュー — 統合レポート & 改善実装計画

## Context

IT5（イテレーション 5）で実装された US-011（入荷登録）、US-012（結束対象確認）、US-013（結束完了登録）の全開発成果物に対し、5 つの XP エージェントによる並列レビューを実施。63 ファイル、+2,692 行の変更が対象。

## 総合評価

ヘキサゴナルアーキテクチャに忠実で、依存関係の方向も正しく、テストピラミッドのバランスも良好。ドメインモデルにビジネスルールが適切に凝集。**トランザクション管理の欠如**が全エージェント一致の最重要課題。**UI 設計書との乖離**も複数指摘あり。

---

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | UseCase に `@Transactional` 付与 | `RegisterArrivalUseCase.java`, `BundleOrderUseCase.java` | programmer, architect, techwriter | 複数リポジトリ書き込みがアトミックでない |
| H-2 | 残数量を正確に表示 | `ArrivalRegistrationPage.tsx:52` | programmer, techwriter, userrep | 発注数量をそのまま表示しており誤情報 |
| H-3 | 花材不足バナー追加 | `BundlingTargetsPage.tsx` | userrep, techwriter | UI 設計書要件。サマリーだけでは見逃す |
| H-4 | Product 未発見時の silent skip をエラーに | `BundlingQueryService.java:47-51` | programmer, architect, tester | データ不整合を隠蔽 |
| H-5 | 入荷済み発注のフォーム非表示 | `ArrivalRegistrationPage.tsx` | userrep, techwriter | UI 設計書要件。誤操作防止 |
| H-6 | 未変更 Stock の不要 save 除去 | `BundleOrderUseCase.java:54-56` | programmer, architect | 消費されていない Stock まで save |
| H-7 | RECEIVED 発注への入荷テスト追加 | `RegisterArrivalUseCaseTest.java` | tester | 全数入荷済み発注への再入荷リスク |
| H-8 | バリデーションエラーテスト追加 | `ArrivalControllerTest.java` | tester | `@Min(1)`, `@NotNull` の 400 が未テスト |
| H-9 | Product 未発見テスト追加 | `BundlingQueryServiceTest.java` | tester | silent skip ロジックが未テスト |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 |
|---|------|------|--------|
| M-1 | N+1 クエリ解消（`findAllById` バッチ取得） | `BundlingQueryService.java` | programmer, architect, userrep |
| M-2 | 楽観的ロック `@Version` 導入 | `Stock`, `Order` | programmer, architect, techwriter |
| M-3 | 発注日・希望納品日の表示追加 | `ArrivalRegistrationPage.tsx` | userrep, techwriter |
| M-4 | 入荷成功後のトースト通知 | `ArrivalRegistrationPage.tsx` | userrep, techwriter |
| M-5 | 花材構成アコーディオン表示 | `BundlingTargetsPage.tsx` | userrep, techwriter |
| M-6 | 結束一覧に「届け先」列追加 | `BundlingTargetsPage.tsx` | userrep, techwriter |
| M-7 | `BundlingTargetsResponse` のレイヤー分離 | `BundlingTargetsResponse.java` | architect |
| M-8 | `Arrival.setId()` をパッケージプライベートに | `Arrival.java` | programmer, architect |
| M-9 | 未使用 `useQuery`（allOrders）削除 | `ArrivalRegistrationPage.tsx:40-47` | programmer, techwriter |
| M-10 | フロントエンド成功フロー完走テスト追加 | `*.test.tsx` | tester |
| M-11 | テストデータ構築の共通化 | `*UseCaseTest.java` | tester, programmer |
| M-12 | `completedOrderIds` State 除去 | `BundlingTargetsPage.tsx` | programmer, techwriter |
| M-13 | `sumExpectedArrivals` の PARTIAL 計算精度改善 | `SpringDataPurchaseOrderRepository` | programmer, techwriter |
| M-14 | 結束エラーに不足花材の詳細表示 | `BundlingTargetsPage.tsx` | userrep |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 |
|---|------|------|--------|
| L-1 | 入荷数量デフォルトを残数量に | `ArrivalRegistrationPage.tsx:18` | userrep |
| L-2 | `Stock.isEmpty()` 未使用確認 | `Stock.java` | programmer |
| L-3 | `LocalTime.MIDNIGHT` を import | `RegisterArrivalUseCase.java:55` | programmer |
| L-4 | API パスの設計書不一致解消 | `BundlingController.java` | architect, techwriter, userrep |
| L-5 | テスト名の明確化 | `BundlingControllerTest.java:76` | tester |
| L-6 | 旧 API `receiveAll/receivePartial` 整理 | `PurchaseOrder.java` | architect |

---

## 実装計画

### Phase 1: バックエンド高優先度修正（H-1, H-4, H-6, H-7, H-8, H-9）

#### H-1: トランザクション管理
- `RegisterArrivalUseCase` クラスに `import org.springframework.transaction.annotation.Transactional` + `@Transactional` を付与
- `BundleOrderUseCase` クラスに同様に `@Transactional` を付与

#### H-4: Product 未発見時のエラー
- `BundlingQueryService.java` で `productRepository.findById().orElse(null)` + `continue` を `orElseThrow(() -> new EntityNotFoundException(...))` に変更

#### H-6: 不要な Stock save 除去
- `BundleOrderUseCase.java` で `consumeFifo` が変更した Stock のみ save するように修正（元の quantity と比較、または `consumeFifo` の戻り値を変更した Stock リストにする）

#### H-7, H-8, H-9: テスト追加
- `RegisterArrivalUseCaseTest`: RECEIVED 状態発注テスト追加
- `ArrivalControllerTest`: 数量 0、日付 null のバリデーションテスト追加
- `BundlingQueryServiceTest`: Product 未発見時の `EntityNotFoundException` テスト追加

### Phase 2: フロントエンド高優先度修正（H-2, H-3, H-5）

#### H-2: 残数量の正確な表示
- バックエンド: `PurchaseOrderController` の一覧レスポンスに `arrivedQuantity` フィールド追加（`arrivalRepository.findByPurchaseOrderId` で合算）
- フロントエンド: `ArrivalRegistrationPage.tsx` で `remainingQuantity = quantity - arrivedQuantity` を計算して表示

#### H-3: 花材不足バナー
- `BundlingTargetsPage.tsx` の上部に不足判定バナーを追加
- `materials.some(m => m.shortage > 0)` で判定、メッセージ:「花材が不足しています。仕入スタッフに連絡してください。」

#### H-5: 入荷済み発注のフォーム制御
- `ArrivalRegistrationPage.tsx` で発注の `status === 'RECEIVED'` の場合にフォーム非表示 + メッセージ表示

### Phase 3: 中優先度からの選択修正（M-1, M-9, M-12）

- M-1: `BundlingQueryService` で `itemRepository.findAllById()` バッチ取得
- M-9: 未使用 `allOrders` クエリ削除
- M-12: `completedOrderIds` State を除去しサーバー状態のみで判定

### Phase 4: レビュー結果の保存・コミット・プッシュ

- 統合レポートを `docs/review/it5_development_review_20260322.md` に保存
- テスト実行で全パス確認
- コミット・プッシュ

---

## 検証方法

```bash
cd apps/webshop/backend && ./gradlew test
cd apps/webshop/frontend && npm test
```

- H-1: UseCase テストで `@Transactional` 付与を確認（実際のロールバックは統合テストで検証）
- H-2: ArrivalRegistrationPage で残数量が正しく表示されることを確認
- H-3: BundlingTargetsPage で花材不足時にバナーが表示されることを確認
- H-4: BundlingQueryServiceTest で Product 未発見時に例外が投げられることを確認
- H-6: BundleOrderUseCase で消費された Stock のみ save されることを確認
