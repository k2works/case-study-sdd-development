# ADR-002: デモ環境のデータベースを SQLite に切り替え（Heroku エフェメラル対応）

デモ環境（Heroku）では PostgreSQL の代わりに SQLite を使用し、dyno 再起動時に自動的にクリーンなデモデータにリセットされる構成とする。

日付: 2026-03-18

## ステータス

承認済み

## コンテキスト

- デモ環境は Heroku 上にデプロイされている
- Heroku の PostgreSQL アドオンはデモ目的にはコストが高い（月額 $5〜）
- Heroku のファイルシステムはエフェメラル（dyno 再起動でリセット）であり、むしろデモ用途には好都合
  - dyno 再起動のたびにクリーンなデモデータで再スタートできる
  - デモ中の操作でデータが汚れても、再起動で元に戻る
- 本番環境は引き続き PostgreSQL を使用する
- 現在のコードベースは `@prisma/adapter-pg` + `pg.Pool` で PostgreSQL に接続している
- Prisma スキーマに `@db.VarChar`, `@db.Date`, `@db.Text` 等の PostgreSQL 固有型注釈がある
- `seed.ts` で `ALTER SEQUENCE ... RESTART WITH 1` という PostgreSQL 固有 SQL を使用している

## 決定

**デモ環境では SQLite を使用し、アプリ起動時に自動で migrate + seed を実行する。本番環境は PostgreSQL のまま変更しない。**

### 変更箇所

| ファイル | 変更内容 |
|---|---|
| `prisma/schema.sqlite.prisma` | SQLite 用スキーマを新規作成（`@db.*` 注釈除去、`provider = "sqlite"`） |
| `src/infrastructure/prisma/client.ts` | 環境変数 `DB_PROVIDER` で adapter を切り替え |
| `prisma/seed.ts` | `ALTER SEQUENCE` を SQLite 対応に条件分岐 |
| 起動スクリプト | SQLite モード時に migrate + seed を自動実行 |

### 代替案

#### 代替案 1: 無料の外部 PostgreSQL サービス（Neon / Supabase）

- **却下理由**: デモデータのリセットが手動になる。dyno 再起動でクリーンな状態に戻る SQLite のエフェメラル特性の方がデモ用途に適している

#### 代替案 2: 全環境で SQLite + PostgreSQL のデュアルサポート

- **却下理由**: 工数 19 SP と見積もられ、統合テストの書き換えやマイグレーション二重管理のコストが継続的に発生する。デモ環境のみの限定的な切り替えで十分

#### 代替案 3: Heroku 以外のプラットフォーム（Render / Railway）

- **却下理由**: 既存のデプロイ基盤を変更するコストが発生する。DB 切り替えの方が影響範囲が小さい

## 影響

### ポジティブ

- Heroku の PostgreSQL アドオン費用を削減できる
- dyno 再起動でデモデータが自動リセットされ、常にクリーンなデモ環境を維持できる
- 本番コード（PostgreSQL）への影響がない
- 統合テストは PostgreSQL のまま維持するため、テストの信頼性は変わらない

### ネガティブ

- SQLite 用の Prisma スキーマを別途管理する必要がある（`schema.sqlite.prisma`）
- SQLite と PostgreSQL の型の挙動差異（動的型付け vs 厳密型付け）により、デモ環境でのみ発生しない制約違反が本番で起こる可能性がある（ただしデモ環境の品質保証は統合テストで PostgreSQL を使って担保する）
- `client.ts` と `seed.ts` に条件分岐が入る

## コンプライアンス

- `DB_PROVIDER=sqlite` で Heroku にデプロイし、アプリ起動後にデモデータが表示されることを確認
- `DB_PROVIDER=postgresql`（または未設定）で既存の PostgreSQL 接続が変わらないことを確認
- 統合テストが全て PostgreSQL で通ることを確認（SQLite への切り替えが統合テストに影響しないこと）

## 備考

- 著者: 開発チーム
- 関連 ADR: ADR-001（発注トランザクション方針 — PostgreSQL 前提の設計判断）
- 工数見積もり: 5 SP
