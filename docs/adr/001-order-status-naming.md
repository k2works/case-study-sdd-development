# ADR-001: OrderStatus の命名規約と段階的拡張方針

## ステータス

承認

## コンテキスト

ドメインモデル設計書（`docs/design/domain-model.md`）では OrderStatus を `ACCEPTED / PREPARING / SHIPPED / CANCELLED` の 4 状態で定義している。一方、IT1-IT2 の実装では `PENDING / CONFIRMED / CANCELLED` の 3 状態を採用した。

この乖離は以下の経緯で発生した:

- IT1-IT2 のスコープは「注文作成→確定」のみであり、出荷準備・出荷のライフサイクルは未実装
- `PENDING`（保留中）→ `CONFIRMED`（確定）は注文フォーム送信時の即時確定フローに対応
- 設計書の `ACCEPTED`（受付済み）は注文確定後の初期状態を指し、`CONFIRMED` と実質的に同じ意味

## 決定

1. **IT3 現在の実装（PENDING / CONFIRMED / CANCELLED）を正とする**
2. IT4 以降で出荷管理を実装する際に `PREPARING`（出荷準備中）、`SHIPPED`（出荷済み）を追加する
3. 設計書のドメインモデル図を IT3 の実装に合わせて更新する

### 状態遷移図（IT3）

```
PENDING → CONFIRMED → CANCELLED
```

### 状態遷移図（IT4 以降の計画）

```
PENDING → CONFIRMED → PREPARING → SHIPPED
                   ↘ CANCELLED
```

### キャンセルのルール（IT3）

- `CONFIRMED` 状態からのみキャンセル可能
- 届け日の 3 日前（= 出荷日の 2 日前）まで
- `PENDING` 状態はフォーム送信前の一時的な状態であり、キャンセル対象外

## その他の設計乖離

| 項目 | 設計書 | 実装 | 理由 |
| :--- | :--- | :--- | :--- |
| customer_id | Order に FK | なし | 得意先集約が未実装のため。IT4 以降で追加 |
| delivery_address_id | ID 参照 | Order に埋め込み | 受注集約内の値オブジェクトとして管理。変更不要のため |
| OrderLine | 設計書に未定義 | 1 注文 = 複数明細 | 数量対応のために導入。設計書を更新予定 |
| 注文確認画面（C-07） | 定義あり | 省略 | MVP として即確定フロー。IT3 で最小版を追加予定 |

## 影響

- IT3 の `Order.cancel()` は `CONFIRMED` 状態からのキャンセルとして実装
- IT4 で `PREPARING` / `SHIPPED` を追加する際にマイグレーションが必要
- ORM モデルの `status` choices も IT4 で拡張

## 参照

- `docs/design/domain-model.md` — ドメインモデル設計書
- `docs/development/retrospective-2.md` — IT2 ふりかえり
- `docs/review/it3_pre_code_review_20260324.md` — IT3 開発前コードレビュー
