# 技術スタック選定 - フレール・メモワール WEB ショップシステム

## バックエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| 言語 | Python | 3.12 | バックエンド開発 | 2028-10 |
| フレームワーク | Django | 5.2 LTS | Web アプリケーション | 2028-04 |
| REST API | Django REST Framework | 3.15+ | API エンドポイント | - |
| API ドキュメント | drf-spectacular | 0.27+ | OpenAPI スキーマ自動生成 | - |
| DB | PostgreSQL | 16 | データストア | 2028-11 |
| DB ドライバ | psycopg | 3.2+ | PostgreSQL 接続 | - |
| マイグレーション | Django Migrations | (Django 組込) | スキーマ管理 | - |
| テスト | pytest | 8.x | テストフレームワーク | - |
| テスト | pytest-django | 4.x | Django テスト統合 | - |
| テスト | pytest-cov | 5.x | カバレッジ計測 | - |
| テストデータ | factory_boy | 3.3+ | テストデータファクトリ | - |
| Lint | flake8 | 7.x | スタイルチェック | - |
| フォーマッタ | black | 24.x | コードフォーマット | - |
| インポート整理 | isort | 5.x | import 文の整理 | - |
| セキュリティ | bandit | 1.7+ | 静的セキュリティ解析 | - |
| セキュリティ | pip-audit | 2.x | 依存関係脆弱性チェック | - |
| WSGI サーバー | gunicorn | 22.x | 本番用アプリケーションサーバー | - |

## フロントエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| テンプレート | Django Template | (Django 組込) | サーバーサイドレンダリング | - |
| インタラクション | HTMX | 2.0+ | HTML 属性ベースの Ajax | - |
| 軽量 JS | Alpine.js | 3.x | 局所的インタラクション（カレンダー等） | - |
| CSS | Tailwind CSS | 3.4+ | ユーティリティファースト CSS | - |
| ビルド | Tailwind CLI | 3.4+ | CSS ビルド | - |
| E2E テスト | Playwright | 1.45+ | ブラウザ自動テスト | - |
| アクセシビリティ | @axe-core/playwright | 4.x | WCAG 自動検証 | - |

## インフラストラクチャ

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| クラウド | AWS | - | インフラ基盤 | - |
| コンテナ | Docker | 27.x | コンテナ化 | - |
| コンテナ実行 | ECS Fargate | - | サーバーレスコンテナ実行 | - |
| ロードバランサ | ALB | - | HTTP/HTTPS 負荷分散 | - |
| データベース | Amazon RDS PostgreSQL | 16 | マネージド DB | - |
| 静的ファイル | Amazon S3 | - | 商品画像・静的ファイル保存 | - |
| CDN | Amazon CloudFront | - | 静的ファイル配信 | - |
| メール | Amazon SES | - | 注文確認・出荷通知メール | - |
| DNS | Amazon Route 53 | - | ドメイン管理 | - |
| 証明書 | AWS ACM | - | SSL/TLS 証明書 | - |
| 監視 | Amazon CloudWatch | - | ログ・メトリクス・アラート | - |
| シークレット | AWS Secrets Manager | - | DB パスワード等の秘匿情報管理 | - |
| ネットワーク | VPC Endpoint | - | NAT Gateway 代替（S3, ECR, CW, SES） | - |
| CI/CD | GitHub Actions | - | ビルド・テスト・デプロイ自動化 | - |
| コンテナレジストリ | Amazon ECR | - | Docker イメージ保存 | - |
| IaC | Terraform | 1.9+ | インフラコード管理 | - |
| 負荷テスト | Locust | 2.x | 性能テスト | - |

## 開発環境

| カテゴリ | 技術 | バージョン | 用途 |
| :--- | :--- | :--- | :--- |
| パッケージ管理 | pip + pip-tools | - | Python パッケージ管理 |
| 仮想環境 | venv | (Python 組込) | Python 仮想環境 |
| ローカル DB | Docker Compose | - | PostgreSQL ローカル実行 |
| pre-commit | pre-commit | 3.x | Git フック管理（Lint） |
| エディタ | - | - | チーム任意（VS Code 推奨） |

## バージョンアップグレード計画

| 技術 | 現バージョン | 次期 LTS | アップグレード時期 |
| :--- | :--- | :--- | :--- |
| Python | 3.12 | 3.13（2024-10 リリース済） | フェーズ 2 完了後に評価 |
| Django | 5.2 LTS | 6.2 LTS（2027 予定） | 2027 年に評価 |
| PostgreSQL | 16 | 17（2024-09 リリース済） | RDS で 17 が GA 後に評価 |

## 選定基準

| 基準 | 重み | 説明 |
| :--- | :--- | :--- |
| チーム習熟度 | 高 | 1-2 名チームで学習コストを最小化 |
| LTS / 安定性 | 高 | 長期サポートのあるバージョンを優先 |
| コミュニティ | 中 | 問題解決時の情報源の豊富さ |
| Django 親和性 | 高 | Django エコシステム内の技術を優先 |
| 運用コスト | 中 | マネージドサービスを活用して運用負荷を最小化 |
