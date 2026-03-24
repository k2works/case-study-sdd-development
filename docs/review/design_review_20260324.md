# 機能要件設計レビュー結果 - 2026-03-24

## レビュー対象

- `docs/design/architecture_backend.md`
- `docs/design/architecture_frontend.md`
- `docs/design/architecture_infrastructure.md`
- `docs/design/data-model.md`
- `docs/design/domain-model.md`
- `docs/design/ui-design.md`

## 総合評価

**B+（高い完成度。ドメイン層の分離・値オブジェクトの設計・段階的リリース戦略は優秀。在庫推移計算の責務境界と排他制御テスト戦略の明確化が必要）**

## 改善提案（重要度順）

### 高

| # | 提案 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- |
| 1 | Repository の命名衝突を解消（`domain/repositories.py` → `domain/interfaces.py`） | Arch | Python import 解決時の混乱を防止 |
| 2 | 在庫推移計算の責務境界を明確化（SQL は Repository、判定はドメインサービス） | Arch, Tester | テスト容易性とパフォーマンスの両立 |
| 3 | 在庫引当の排他制御テスト戦略を定義 | Tester | デッドロック検証・同時引当のテストが未定義 |
| 4 | `StockLotStatus` に遷移ルールメソッドを追加 | Tester | `OrderStatus` との非対称性を解消 |
| 5 | 商品画像フィールドをデータモデルに追加 | Arch | UI 設計の salt 図に画像があるがテーブルに未反映 |

### 中

| # | 提案 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- |
| 6 | HTMX エンドポイントと REST API の区別を明確化 | Arch | HTML フラグメントと JSON レスポンスの混在 |
| 7 | 在庫推移 SQL に繰越在庫の累積計算を追加 | Arch | `DailyForecast.remaining` に対応する SQL がない |
| 8 | `accounts` と `customers` の分離理由を ADR に記録 | Arch | 1:1 で独自属性がほぼない |
| 9 | テストデータの Factory Boy 導入方針を定義 | Tester | 7 テーブルの依存チェーンでテストデータ準備が煩雑 |
| 10 | 在庫推移画面にチャート表示を追加 | UX | テーブルだけでは発注判断の直感性が不足 |
| 11 | 管理画面のロール別ナビゲーション設計 | UX | 3 ロール × 13 画面のアクセス動線最適化 |
| 12 | モバイルファースト対応の具体化 | UX | 顧客向け画面のスマートフォンレイアウト |

### 低

| # | 提案 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- |
| 13 | `Supplier` の Django App 配置を再評価 | Arch | フェーズ 2 で `purchasing` App との依存増加 |
| 14 | `price` を DECIMAL(10,2) に変更 | Arch | 将来の税計算柔軟性 |
| 15 | テストピラミッド比率の統一（70/20/10） | Tester | ドキュメント間で比率が不一致 |

## 対応方針

### 即時対応（修正反映）

1. Repository 命名衝突の解消
2. 在庫推移計算の責務境界明確化
3. `StockLotStatus` に遷移ルール追加
4. 商品画像フィールド追加
5. HTMX / REST API エンドポイントの区別

### 開発フェーズで対応

6. 排他制御テスト戦略（テスト戦略ドキュメントで定義）
7. Factory Boy 導入
8. チャート表示・ロール別ナビゲーション（UI 設計の詳細化）
