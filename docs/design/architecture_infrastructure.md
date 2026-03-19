# インフラストラクチャアーキテクチャ - フレール・メモワール WEB ショップシステム

## インフラ構成選定

### 選定結果: クラウド（シンプル構成）

**選定理由:**

- 小規模チームでの運用のため、管理コストを最小化する
- 初期フェーズはシンプルな構成から始め、スケールアウトは需要に応じて対応
- コンテナ化により環境差異を排除し、デプロイを安定化する

## システム構成図

```plantuml
@startuml

title インフラ構成図

actor 得意先
actor スタッフ

node "CDN / Static Hosting" {
  component [フロントエンド\n(React SPA)]
}

node "Application Server" {
  component [バックエンド\n(Node.js API)]
}

node "Database Server" {
  database [PostgreSQL]
}

得意先 --> [フロントエンド\n(React SPA)] : HTTPS
スタッフ --> [フロントエンド\n(React SPA)] : HTTPS
[フロントエンド\n(React SPA)] --> [バックエンド\n(Node.js API)] : REST API
[バックエンド\n(Node.js API)] --> [PostgreSQL] : SQL

@enduml
```

## 環境構成

| 環境 | 用途 | 構成 |
| :--- | :--- | :--- |
| ローカル | 開発・テスト | Docker Compose |
| ステージング | 結合テスト・受入テスト | クラウド（本番同等） |
| 本番 | 運用 | クラウド |

## コンテナ化戦略

### Docker Compose（ローカル開発）

```plantuml
@startuml

title Docker Compose 構成

package "docker-compose" {
  component [frontend\n:3000]
  component [backend\n:8080]
  database [postgres\n:5432]
}

[frontend\n:3000] --> [backend\n:8080]
[backend\n:8080] --> [postgres\n:5432]

@enduml
```

### コンテナ構成

| サービス | イメージ | ポート |
| :--- | :--- | :--- |
| frontend | node:22-alpine | 3000 |
| backend | node:22-alpine | 8080 |
| postgres | postgres:16-alpine | 5432 |

## CI/CD パイプライン

```plantuml
@startuml

title CI/CD パイプライン

|GitHub Actions|
start
:コードプッシュ / PR;

fork
  :Lint チェック;
fork again
  :型チェック;
fork again
  :単体テスト;
end fork

:統合テスト;

if (main ブランチ？) then (yes)
  :Docker イメージビルド;
  :ステージング環境デプロイ;
  :受入テスト;
  :本番環境デプロイ;
else (no / PR)
  :PR チェック完了;
endif

stop

@enduml
```

### パイプライン設定

| ステップ | ツール | トリガー |
| :--- | :--- | :--- |
| Lint | ESLint | PR / push |
| 型チェック | tsc | PR / push |
| 単体テスト | Vitest | PR / push |
| 統合テスト | Vitest | PR / push |
| ビルド | Docker | main push |
| デプロイ | GitHub Actions | main push |

## デプロイ方針

- **フロントエンド**: 静的ファイルを CDN / Static Hosting にデプロイ（GitHub Pages 等）
- **バックエンド**: Docker コンテナをアプリケーションサーバーにデプロイ
- **データベース**: マネージドサービスを利用（運用負荷を最小化）
- **マイグレーション**: Prisma Migrate でスキーマ変更を管理

## アーキテクチャ決定記録（ADR）

### ADR-005: ローカル開発環境に Docker Compose を採用

- **ステータス**: 承認済
- **決定**: Docker Compose を採用する
- **理由**: 環境差異を排除し、チームメンバー間で同一の開発環境を共有できる。セットアップコストが低い
- **代替案**: ローカル直接インストール（環境差異が発生しやすい）

### ADR-006: CI/CD に GitHub Actions を採用

- **ステータス**: 承認済
- **決定**: GitHub Actions を採用する
- **理由**: GitHub リポジトリと統合されており、追加コストなしで利用できる。設定がシンプル
- **代替案**: CircleCI / Jenkins（追加コスト・管理コストが発生）
