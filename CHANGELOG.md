# Changelog

## [2.0.0] - 2026-06-12

### Phase 2: 出荷管理・変更対応

#### Added

- **出荷処理（US-014）**: 配送スタッフが出荷準備中の受注を出荷処理。PREPARING→SHIPPED ステータス遷移
- **注文キャンセル（US-019）**: ORDERED/ACCEPTED の受注をキャンセル可能。PREPARING 以降は不可
- **届け日変更（US-008）**: 受注詳細から届け日を変更。在庫チェック + 代替日提案（最大 5 件）
- **出荷一覧画面（S-402）**: PREPARING ステータスの受注を届け先情報付きで一覧表示
- **キャンセル確認ダイアログ**: 副作用「在庫引当が解除されます」を明示
- **届け日変更フォーム**: アコーディオン展開、自動在庫チェック、emerald/red バッジ、代替日チップ
- **API エンドポイント**: ship, cancel, reschedule, reschedule-check, shipments

#### Changed

- **OrderStatus 遷移**: PREPARING→CANCELLED を不許可に変更
- **Order.deliveryDate**: final から mutable に変更（届け日変更対応）
- **Clock 注入**: Order.create() と DeliveryDate に Clock DI を導入

#### Security

- **SecurityConfig**: /admin/shipments を DELIVERY_STAFF ロールに許可

## [1.0.0] - 2026-05-15

### Phase 1: MVP - 受注・在庫基盤

#### Added

- **認証（US-017, US-018）**: JWT ベースのログイン・新規登録
- **商品マスタ（US-001, US-002, US-003）**: 花束登録・構成定義・単品登録
- **商品閲覧（US-004）**: 商品一覧・カタログ表示
- **注文（US-005）**: 花束注文フロー（得意先→商品選択→届け先入力→確認→完了）
- **受注管理（US-006, US-007）**: 受注一覧・受注受付・一括受付
- **在庫推移（US-009）**: 日別在庫推移表示（現在庫・入荷予定・受注引当・期限切れ予定）
- **発注（US-010）**: 単品発注（仕入先別）
- **入荷（US-011）**: 入荷登録（残数量チェック・Stock 自動作成）
- **結束管理（US-012, US-013）**: 結束対象確認・結束完了（FIFO 在庫消費）
- **ヘキサゴナルアーキテクチャ**: ドメイン層・アプリケーション層・インフラ層の分離
- **TDD**: 全機能を Red-Green-Refactor で実装
