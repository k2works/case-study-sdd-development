# イテレーション 3 完了報告書

## 概要

| 項目 | 内容 |
| :--- | :--- |
| **イテレーション** | 3 |
| **期間** | Week 5-6 |
| **ゴール** | 在庫推移表示の基盤を TDD で実装し、注文キャンセル機能を完成させる |
| **達成状況** | 完了（11/11 SP、100%） |

---

## 成果

### 実装したユーザーストーリー

| ID | ストーリー | SP | 状態 |
| :--- | :--- | :--- | :--- |
| US-007 | 在庫推移を確認する | 8 | 完了 |
| US-014 | 注文をキャンセルする | 3 | 完了 |
| **合計** | | **11** | |

### 技術成果

| カテゴリ | 内容 |
| :--- | :--- |
| **在庫ドメイン層** | StockLot 集約（StockLot, ExpiryDate, StockLotStatus） + StockForecastService + DailyForecast + StockLotRepository IF |
| **在庫インフラ層** | Django ORM Model（inventory_stocklot） + DjangoStockLotRepository + Django Admin（StockLotAdmin） |
| **在庫プレゼンテーション層** | InventoryService + StockForecastView + stock_forecast.html（単品セレクタ + 14 日間在庫推移テーブル） |
| **キャンセルドメイン** | Order.cancel()（届け日 3 日前期限チェック）+ OrderStatus.CANCELLED |
| **キャンセルプレゼンテーション** | OrderCancelView（注文番号検索 + キャンセル確認 + 実行） + order_cancel.html + order_cancel_complete.html |
| **リファクタリング** | OrderService 導入（Application 層）、DeliveryDate.reconstruct() 標準化、DeliveryDate.change_deadline() 追加 |
| **ドキュメント** | ADR-001（OrderStatus 命名・設計乖離）、UI/UX レビュー統合レポート、コードレビュー統合レポート |
| **UI 改善** | フォーム順序修正、フォーカスリング追加、二重送信防止、ヘッダーナビゲーション追加 |

### 新規コンポーネント

| コンポーネント | ファイル |
| :--- | :--- |
| ExpiryDate | `apps/inventory/domain/value_objects.py` |
| StockLotStatus | `apps/inventory/domain/value_objects.py` |
| StockLot | `apps/inventory/domain/entities.py` |
| DailyForecast | `apps/inventory/domain/entities.py` |
| StockForecastService | `apps/inventory/domain/services.py` |
| StockLotRepository | `apps/inventory/domain/interfaces.py` |
| DjangoStockLotRepository | `apps/inventory/repositories.py` |
| InventoryService | `apps/inventory/services.py` |
| StockForecastView | `apps/inventory/views.py` |
| OrderService | `apps/orders/services.py` |
| OrderCancelView | `apps/orders/views.py` |

---

## 品質メトリクス

| 指標 | IT2 末 | IT3 末 | 変化 |
| :--- | :--- | :--- | :--- |
| テスト数 | 130 | 195 | +65 |
| カバレッジ | 99% | 99% | 維持 |
| Ruff エラー | 0 | 0 | 維持 |
| 新規テスト内訳 | | | |
| — ドメインテスト | | +29 | 在庫値オブジェクト・エンティティ・サービス |
| — Repository 統合テスト | | +7 | DjangoStockLotRepository |
| — サービステスト | | +10 | InventoryService(3) + OrderService(7) |
| — View 統合テスト | | +9 | StockForecastView(4) + OrderCancelView(5) |
| — ドメインテスト（orders） | | +7 | Order.cancel() + DeliveryDate.change_deadline() |
| — その他 | | +3 | OrderService.find 系 |

### テストピラミッド（IT3 末）

```
         /  4  \   View 統合テスト（在庫推移）
        / 5 + 4 \  View 統合テスト（キャンセル + 既存注文）
       /   10    \  サービステスト（OrderService + InventoryService）
      /    7      \  Repository 統合テスト（StockLot）
     /    29       \  ドメインユニットテスト（在庫）
    /   37 + others \  ドメインユニットテスト（注文 + 商品）
   ──────────────────
        195 テスト
```

---

## IT2 ふりかえり Try 対応

| Try 項目 | 対応状況 | 詳細 |
| :--- | :--- | :--- |
| Application 層（OrderService）の導入 | ✅ 完了 | `orders/services.py` に OrderService を導入。place_order, find_order, find_order_by_number, cancel_order の 4 操作。View は Service 経由でドメインロジックを呼び出す構造に変更 |
| ファクトリメソッドパターンの標準化 | ✅ 完了 | DeliveryDate に `_skip_validation` フィールド（compare=False）+ `reconstruct()` クラスメソッドを追加。等価性テスト追加で動作保証 |
| 実装後のユーザーフローウォークスルー | ✅ 完了 | IT3 開発前に UI/UX レビュー（インタラクションデザイナー + ユーザー代表エージェント）を実施。フォーム順序・フォーカスリング・二重送信防止の指摘を反映 |
| 設計ドキュメントとの差分を ADR に記録 | ✅ 完了 | ADR-001 に OrderStatus の命名差異（PENDING/CONFIRMED vs 設計の受注済/出荷準備中等）と設計乖離を記録 |

---

## ベロシティ分析

### 累積実績

| イテレーション | 計画 SP | 実績 SP | 達成率 | 累積完了 SP | 残 SP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| IT1 | 9 | 9 | 100% | 9 | 54 |
| IT2 | 8 | 8 | 100% | 17 | 46 |
| IT3 | 11 | 11 | 100% | 28 | 35 |

### ベロシティ推移

| 指標 | 値 |
| :--- | :--- |
| IT1 | 9 SP |
| IT2 | 8 SP |
| IT3 | 11 SP |
| 平均 | 9.3 SP |
| 標準偏差 | 1.2 SP |

### 完了見込み

- 残 SP: 35
- 平均ベロシティ: 9.3 SP/IT
- 残イテレーション見込み: 35 / 9.3 ≈ 3.8 IT（計画 3 IT に対してほぼ予定通り）
- Phase 1 残: 9 SP（IT4 で完了可能）
- Phase 2+3 残: 26 SP（IT5-IT6 で完了可能、ベロシティ 9.3SP なら 2.8 IT）

---

## 次のイテレーションへの引き継ぎ

### IT4 へのインプット

1. **US-006（届け先コピー 3SP）**: IT3 で繰り越し。Order 履歴から届け先をコピーする機能
2. **US-015（受注状況確認 3SP）**: スタッフ向け受注一覧・フィルタリング
3. **US-016（注文履歴 3SP）**: 得意先向け注文履歴・状況確認

### 技術的引き継ぎ

- **在庫引当連動は IT4 以降**: IT3 では outgoing_planned / incoming_planned は常に 0。引当機能は受注・入荷イベントとの連動が必要で IT4 で検討
- **tox + SonarQube**: IT3 で未実施。IT4 の品質確認で必ず実行する
- **設計乖離の ADR 記録**: テンプレートパス（shop/ vs inventory/）、URL パス（/inventory/ vs /staff/inventory/）、キャンセル画面方式の 3 点を IT4 で ADR に記録

---

## 更新履歴

| 日付 | 更新内容 |
| :--- | :--- |
| 2026-03-24 | 初版作成 |
