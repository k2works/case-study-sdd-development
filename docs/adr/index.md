# ADR (Architecture Decision Records)

技術的意思決定を記録した ADR です。

## ADR 一覧

| ADR | 決定内容 | ステータス |
| :--- | :--- | :--- |
| [ADR-001](001-purchase-order-transaction-strategy.md) | 発注作成時のトランザクション方針 — 単一集約保存のため明示的トランザクション不要 | 承認済み |
| [ADR-002](002-demo-environment-sqlite.md) | デモ環境の DB を SQLite に切り替え — Heroku エフェメラル対応 | 承認済み |
| [ADR-003](003-delivery-date-change-transaction-strategy.md) | 届け日変更時のトランザクション方針 — S05 は単一集約、S06 で $transaction 導入 | 承認済み |

ADR の作成には `creating-adr` スキルを使用してください。
