# ADR-004: Web / API のコンテナ分離と managed PostgreSQL を採用する

Web / API をコンテナ分離し、実行基盤は managed container platform、DB は managed PostgreSQL を採用します。

日付: 2026-03-20

## ステータス

承認済み

## コンテキスト

本システムは小規模な XP チームで継続運用することを前提としており、ローカル / staging / production の差分を小さく保ちつつ、受注業務を安全に運用する必要があります。

- Web と API では将来的にスケール条件がずれる可能性があります
- データベースは受注、在庫 projection、発注、入荷、出荷の正本を保持します
- Kubernetes やサービスメッシュのような重い運用基盤は、現段階では投資対効果が低いです

## 決定

**`web` と `api` を別コンテナとして構築し、managed container platform 上へ配置します。データベースは managed PostgreSQL を採用し、`staging` は `main` マージで自動デプロイ、`production` は手動承認付きでデプロイします。**

### 変更箇所

- ローカルは Docker Compose を基本とする
- 本番系は managed container platform + managed PostgreSQL を前提とする
- `local`、`staging`、`production` の 3 段階環境を持つ
- `staging` 自動、`production` 承認付きのデプロイ戦略を採用する

### 代替案

- 単一コンテナで Web / API を同居
  - 初期構築は単純だが、デプロイやスケールの自由度が低いため却下しました
- Kubernetes
  - 小規模チームには運用負荷が高すぎるため却下しました
- セルフホスト DB
  - バックアップ、フェイルオーバー、運用負荷を自前で持つ必要があり却下しました

## 影響

### ポジティブ

- Web / API の役割分離と将来の個別スケールがしやすくなります
- DB 運用の定常負荷を抑えられます
- `staging` と `production` の切り分けが明確になり、受け入れ確認しやすくなります

### ネガティブ

- クラウドベンダー固有機能に一部依存する可能性があります
- コンテナイメージ、Secrets、監視設定などの運用整備は引き続き必要です

## コンプライアンス

- `web` と `api` が別コンテナとしてビルド / 配置できること
- DB が private 配置の managed PostgreSQL であること
- CI/CD が `staging` 自動、`production` 承認付きの流れを持つこと

## 備考

- 著者: Copilot
- 関連コミット: -
- 関連 ADR: ADR-003
