# インフラストラクチャアーキテクチャ - フレール・メモワール WEB ショップ

## アーキテクチャ選定

| 判断ポイント | 選定 | 理由 |
| :--- | :--- | :--- |
| デプロイメント | **モノリシック** | 小規模チーム（1-2 名）、UC 11 件。マイクロサービスは過剰 |
| ホスティング | **コンテナ（Docker）** | ローカル開発と本番の環境差異を最小化。将来の拡張性も確保 |
| データベース | **PostgreSQL** | リレーショナルデータ中心。在庫推移計算にSQL の集計機能が有効 |
| IaC | **Docker Compose（開発）** | 小規模のため。本番は AWS ECS 等を検討 |
| CI/CD | **GitHub Actions** | リポジトリと統合。自動テスト・ビルド・デプロイ |

## 全体構成

```plantuml
@startuml
package "開発環境" {
  node "Docker Compose" {
    [フロントエンド\n(Node.js)] as fe
    [バックエンド\n(API サーバー)] as be
    database "PostgreSQL" as db
  }
}

cloud "本番環境（将来）" {
  node "ロードバランサー" as lb
  node "アプリケーション\nコンテナ" as app
  database "RDS\n(PostgreSQL)" as rds
}

fe --> be : HTTP/REST
be --> db : SQL

lb --> app
app --> rds

@enduml
```

## 開発環境構成

```plantuml
@startuml
title 開発環境（Docker Compose）

node "docker-compose" {
  rectangle "frontend" as fe {
    [Node.js dev server]
  }

  rectangle "backend" as be {
    [API server]
  }

  rectangle "db" as db {
    database "PostgreSQL"
  }
}

actor 開発者

開発者 --> [Node.js dev server] : localhost:3000
開発者 --> [API server] : localhost:8080
[Node.js dev server] --> [API server] : API 呼び出し
[API server] --> PostgreSQL : SQL

@enduml
```

## CI/CD パイプライン

```plantuml
@startuml
start

:コード変更;
:Git Push;

fork
  :Lint;
fork again
  :ユニットテスト;
fork again
  :型チェック;
end fork

:ビルド;

if (テスト成功?) then (yes)
  :Docker イメージビルド;
  if (main ブランチ?) then (yes)
    :ステージングデプロイ;
    :スモークテスト;
  else (no)
    :PR プレビュー;
  endif
else (no)
  :失敗通知;
  stop
endif

stop
@enduml
```

## デプロイメント戦略

- **開発環境**: Docker Compose でローカル起動
- **ステージング**: GitHub Actions → Docker イメージ → デプロイ
- **本番**: ローリングデプロイ（将来的に Blue/Green を検討）

## モニタリング

| カテゴリ | 対象 | ツール |
| :--- | :--- | :--- |
| アプリケーション | レスポンスタイム、エラー率 | アプリケーションログ |
| インフラ | CPU、メモリ、ディスク | Docker stats / CloudWatch（将来） |
| ビジネス | 受注件数、廃棄率 | アプリケーション内ダッシュボード |
