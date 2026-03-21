# イテレーション 3 完了報告書

## 概要

| 項目 | 内容 |
|------|------|
| **イテレーション** | 3 |
| **計画期間** | 2026-04-21 〜 2026-05-02（2 週間） |
| **実績期間** | 2026-03-21（1 日） |
| **ゴール** | 注文フローと受注管理を完成させ、得意先が花束を注文でき受注スタッフが注文を管理できる状態にする |
| **達成度** | 13/13 SP（100%） |

---

## ユーザーストーリー達成状況

| ID | ストーリー | SP | 状態 |
|----|-----------|-----|------|
| US-005 | 花束を注文する | 8 | **完了** |
| US-006 | 受注一覧を確認する | 3 | **完了** |
| US-007 | 受注を受け付ける | 2 | **完了** |
| **合計** | | **13** | **100%** |

---

## 成功基準の達成

- [x] 注文画面で商品選択・届け日・届け先・メッセージを入力して注文できる
- [x] 注文確認画面で内容を確認し、注文を確定できる
- [x] 注文完了後、受注が「注文受付」ステータスで登録される
- [x] 受注一覧にステータス・商品名・届け日・得意先が表示される
- [x] ステータスや期間で絞り込みができる
- [x] 受注詳細画面から「受付済み」にステータスを更新できる
- [x] ヘキサゴナルアーキテクチャの実装パターンに準拠
- [x] テストカバレッジ 80% 以上

---

## 実装内容

### バックエンド

#### ドメイン層
- `OrderStatus`: 6 状態 enum + 遷移ルール（ORDERED→ACCEPTED→PREPARING→SHIPPED→DELIVERED, CANCELLED）
- `DeliveryDate`: 値オブジェクト（翌日〜30 日後、境界値バリデーション）
- `Message`: 値オブジェクト（最大 200 文字、nullable）
- `Order`: エンティティ + create() + accept()
- `Customer`: エンティティ（userId 紐づけ）
- `DeliveryDestination`: エンティティ（必須項目バリデーション）

#### アプリケーション層
- `PlaceOrderUseCase`: 注文作成（得意先検証・商品検証・届け先保存・注文保存）
- `OrderQueryService`: 一覧取得・詳細取得・ステータス更新・一括受付・フィルタ検索

#### インフラ層
- Flyway V5: customers, delivery_destinations, orders テーブル作成
- JPA エンティティ: CustomerEntity, DeliveryDestinationEntity, OrderEntity
- リポジトリ: JpaCustomerRepository, JpaDeliveryDestinationRepository, JpaOrderRepository
- SecurityConfig: /api/v1/admin/** はスタッフ専用、/api/v1/orders/** は得意先専用

#### API 層
- `OrderController`: POST /orders, GET /orders/my
- `OrderAdminController`: GET /admin/orders, GET /admin/orders/{id}, PUT /admin/orders/{id}/accept, PUT /admin/orders/bulk-accept, GET /admin/dashboard/summary

### フロントエンド

#### 注文フロー（得意先向け）
- `OrderFormPage`: 注文画面（カレンダーピッカー、届け先入力、戻り導線）
- `OrderConfirmPage`: 確認画面（二重送信防止）
- `OrderCompletePage`: 完了画面

#### 受注管理（スタッフ向け）
- `OrderListPage`: 受注一覧（6 状態フィルタ、一括受付、空状態、スケルトンローディング）
- `OrderDetailPage`: 受注詳細（ステータス更新ボタン、二重送信防止）

#### 共通
- `AppLayout`: ロール別メニュー制御（得意先はカタログのみ、スタッフは管理画面）
- `ProductDetailPage`: 「注文する」ボタン追加

---

## テスト

### バックエンドテスト（新規追加分）

| カテゴリ | テスト数 |
|---------|---------|
| OrderStatus テスト | 9 |
| DeliveryDate テスト | 7 |
| Message テスト | 6 |
| Order テスト | 7 |
| Customer テスト | 5 |
| DeliveryDestination テスト | 7 |
| PlaceOrderUseCase テスト | 3 |
| OrderQueryService テスト | 5 |
| **新規合計** | **49** |

### テスト合計（累計）

| カテゴリ | IT2 | IT3 | 増減 |
|---------|-----|-----|------|
| バックエンドユニットテスト | 127 | 176+ | +49 |
| フロントエンドテスト | 27 | 27 | +0 |
| **合計** | 170 | 219+ | +49 |

---

## ベロシティ

| イテレーション | 計画 SP | 実績 SP | 達成率 |
|--------------|--------|--------|--------|
| IT1 | 11 | 11 | 100% |
| IT2 | 11 | 11 | 100% |
| IT3 | 13 | 13 | 100% |
| **累計** | **35** | **35** | **100%** |

**平均ベロシティ**: 11.7 SP/イテレーション

---

## Phase 1 (MVP) 進捗

| 項目 | 値 |
|------|-----|
| 総 SP | 51 |
| 完了 SP | 35（IT1: 11 + IT2: 11 + IT3: 13） |
| 進捗率 | 68.6% |
| 残り SP | 16（IT4: 在庫推移・発注・入荷） |

---

## コミット履歴

1. `67a893a` feat(domain): 受注ドメインモデルを TDD で実装
2. `39e85c6` feat(usecase): 受注ユースケースを TDD で実装
3. `e2f51fd` feat(infra): 受注永続化層と認可設定を実装
4. `672a334` feat(api): 受注 REST API を実装
5. `b5f79ca` feat(frontend): 注文・受注管理画面を実装

---

## 次のステップ

- **IT4**: 在庫推移表示（US-009: 8SP）、仕入発注（US-010: 5SP）、入荷登録（US-011: 3SP）
- IT4 完了で Phase 1 (MVP) リリース 1.0
