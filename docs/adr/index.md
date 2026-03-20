# ADR (Architecture Decision Records)

技術的意思決定を記録した ADR です。

## ADR 一覧

| ADR | 決定内容 | ステータス |
| :--- | :--- | :--- |
| [ADR-001](001-backend-modular-monolith.md) | バックエンドはモジュラーモノリス + 4 層レイヤードを採用する | 承認済み |
| [ADR-002](002-stock-projection-cqrs-boundary.md) | 在庫推移は限定的 CQRS と同期 projection 更新で開始する | 承認済み |
| [ADR-003](003-single-nextjs-application.md) | 顧客向けとスタッフ向けを単一 Next.js アプリで構成する | 承認済み |
| [ADR-004](004-container-platform-and-managed-postgresql.md) | Web / API のコンテナ分離と managed PostgreSQL を採用する | 承認済み |

ADR の作成には `creating-adr` スキルを使用してください。
