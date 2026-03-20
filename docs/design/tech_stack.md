# 技術スタック

## 1. 文書の目的

本書は、フレール・メモワール WEB ショップシステムのアーキテクチャ設計に基づき、実装と運用で採用する技術スタックを一覧化するものです。

小規模な XP チームが、バージョン不整合やサポート切れを避けながら継続開発できるように、バックエンド、フロントエンド、インフラ、テスト、運用の採用技術とバージョン方針を定義します。

## 2. 選定方針

### 2.1 基本方針

- TypeScript を共通言語として、Web / API を 1 つの開発体験で扱えること
- 1 〜 2 名チームでも理解・保守しやすい技術を優先すること
- `stock_projection` のような複雑な query model を扱えるよう、SQL 表現力を確保すること
- LTS を優先し、EOL が近い基盤は新規採用しないこと
- テスト戦略、運用要件、CI/CD 要件と矛盾しないこと

### 2.2 現状との整合

現在のリポジトリは `package.json`、`Dockerfile`、`docker-compose.yml` を持つ Node ベースの構成で、開発コンテナは `NODE_MAJOR=22` を前提にしています。

ただし、アプリケーション実装を本格開始する時点では、**ランタイムは Node.js 24 LTS へ引き上げる**ことを推奨します。Node.js 22 は 2027-04-30 まで保守されますが、Node.js 24 は 2028-04-30 までサポートされ、実装フェーズ全体をより安定してカバーできます。

## 3. 推奨技術スタック一覧

### 3.1 アプリケーション / ランタイム

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| OS 基盤 | Ubuntu | 24.04 LTS | 開発コンテナ / CI ベース OS | 標準保守 2029-05、ESM 2034-04 |
| ランタイム | Node.js | 24 LTS | `web` / `api` 共通ランタイム | 2028-04-30 |
| 言語 | TypeScript | 5.8.x | フロントエンド / バックエンド実装 | - |
| パッケージ管理 | npm | 11.x | workspace 管理、script 実行 | Node.js 24 に追随 |
| 環境変数 | dotenv | 17.x | local / test の設定読み込み | - |

### 3.2 バックエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| Web Framework | Fastify | 5.x | REST API、hook、plugin ベースの構成 | - |
| API 契約 | OpenAPI | 3.1 | API 契約の文書化と検証基盤 | - |
| バリデーション | Zod | 4.x | Request / Response DTO、設定値検証 | - |
| Query Builder | Kysely | 0.28.x | 型安全な SQL、複雑 query、projection 更新 | - |
| DB Driver | `pg` | 8.13.x | PostgreSQL 接続、transaction 制御 | - |
| Migration | `node-pg-migrate` | 8.x | schema migration、expand / contract 運用 | - |
| Logging | Pino | 9.x | JSON 構造化ログ出力 | - |
| Scheduler | `node-cron` | 4.x | 軽量 scheduler / 再計算 job 起動 | - |
| 認証 | Cookie session + OIDC 対応ライブラリ | 実装時確定 | スタッフ認証、将来の外部 IdP 連携 | - |

### 3.3 フロントエンド

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| Framework | Next.js | 15.x | 顧客導線の SSR / ISR、スタッフ導線の app router | - |
| UI Library | React | 19.x | 単一 Web アプリの UI 実装 | - |
| Styling | Tailwind CSS | 4.x | 画面実装、デザイン一貫性の確保 | - |
| UI Primitive | Radix UI + shadcn/ui | 最新安定 | フォーム、dialog、table などの基盤部品 | - |
| Server State | TanStack Query | 5.x | 商品一覧、受注一覧、在庫推移の取得 / cache 管理 | - |
| Form State | React Hook Form | 7.x | 注文、届け日変更、発注 / 入荷フォーム | - |
| Validation | Zod | 4.x | フォーム検証、API DTO との整合 | - |
| Charts | Recharts | 3.x | 在庫推移、KPI の可視化 | - |
| Utility | `nuqs` または同等ライブラリ | 2.x | search params と一覧状態の同期 | - |

### 3.4 データ / インフラ

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| RDBMS | PostgreSQL | 16.x | 正本データ、`stock_projection`、監査対象データ | 2028-11-09 |
| Container | Docker Engine / Compose | 27.x / V2 | local 開発、CI、コンテナ実行の共通化 | - |
| Container Registry | GHCR / Amazon ECR | 現行 SaaS | image 配布と保管 | サービス提供期間に従う |
| Container Runtime | AWS ECS Fargate | 現行 SaaS | `web` / `api` の managed container 実行基盤 | サービス提供期間に従う |
| Managed DB | Amazon RDS for PostgreSQL | PostgreSQL 16 系 | backup、PITR、運用負荷低減 | PostgreSQL 16 系に準拠 |
| Object Storage | Amazon S3 | 現行 SaaS | 商品画像、将来の添付ファイル、backup 補助 | サービス提供期間に従う |
| IaC | Terraform | 1.11.x | 環境差分のコード管理 | - |
| Secrets | GitHub Actions Secrets / AWS Secrets Manager | 現行 SaaS | CI / 本番 secrets 管理 | サービス提供期間に従う |

### 3.5 監視 / 運用

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| Metrics / Alert | Amazon CloudWatch | 現行 SaaS | p95、5xx、job failure、DB 指標の監視 | サービス提供期間に従う |
| Log 集約 | CloudWatch Logs | 現行 SaaS | JSON ログ、監査補助、検索 | サービス提供期間に従う |
| Synthetic Monitoring | CloudWatch Synthetics または同等 | 現行 SaaS | 顧客向け注文導線の定期監視 | サービス提供期間に従う |
| Error Tracking | Sentry | SaaS 現行 | 例外追跡、release 単位のエラー把握 | サービス提供期間に従う |
| Feature Flag | Unleash または同等 | 6.x | 緊急遮断、段階リリース、rollback 補助 | - |

### 3.6 テスト / 品質保証

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| Unit / Integration Test | Vitest | 3.x | TypeScript の高速 test 実行 | - |
| Frontend Test | React Testing Library | 16.x | Feature / component test | - |
| API Contract Test | Supertest | 7.x | REST API 契約テスト | - |
| DB Integration Test | Testcontainers for Node.js | 11.x | PostgreSQL を含む統合 test | - |
| E2E Test | Playwright | 1.58.x | 顧客導線、主要業務導線の E2E | - |
| Mocking | MSW | 2.x | フロントエンド test の API モック | - |
| Lint / Format | ESLint + Prettier | 9.x / 3.x | code style と静的検査 | - |

### 3.7 ドキュメント / 開発支援

| カテゴリ | 技術 | バージョン | 用途 | サポート期限 |
| :--- | :--- | :--- | :--- | :--- |
| Docs Build | MkDocs Material | 現行 | 設計 / 分析 docs の公開 | - |
| Diagram | PlantUML | 現行 | 図表生成 | - |
| Task Runner | Gulp | 5.x | docs build、運用補助 script | - |
| Container Dev | Docker Compose | V2 | local 立ち上げ統一 | - |

## 4. レイヤー別選定理由

### 4.1 バックエンド

- Fastify は Express よりも plugin 境界が明確で、モジュラーモノリスのモジュール単位構成と相性がよいです
- Kysely + `pg` は `stock_projection`、集計 query、複数テーブル更新のような SQL 主導の実装に向きます
- Zod は API DTO、設定値、フォーム入力で再利用でき、frontend / backend 間で検証ルールを共有しやすいです
- Pino は JSON ログ出力が軽量で、CloudWatch や Sentry と組み合わせやすいです

### 4.2 フロントエンド

- Next.js は顧客向けの SSR / ISR とスタッフ向けの高操作性 UI を 1 スタックで両立できます
- TanStack Query + React Hook Form は、サーバー状態とフォーム状態の責務分離という設計方針に一致します
- Tailwind CSS と Radix UI / shadcn/ui は、小規模チームでも実装速度とアクセシビリティの両立がしやすいです

### 4.3 インフラ / 運用

- ECS Fargate + RDS PostgreSQL は、Kubernetes を持ち込まずに Web / API 分離と managed DB を実現できます
- CloudWatch を軸にすると、メトリクス、ログ、アラート、synthetics を 1 つの運用導線に集約できます
- Terraform により `staging` / `production` 差分を明文化でき、変更管理要件と整合します

## 5. バージョン運用ポリシー

### 5.1 基盤技術

- Node.js は Active LTS 期間中の major を優先し、Maintenance LTS に入ったら次期 LTS への移行計画を立てます
- PostgreSQL は 16 系で開始し、minor は四半期ごと、major は年次計画で見直します
- Ubuntu は LTS 固定とし、interim release は採用しません

### 5.2 アプリケーションライブラリ

- major 固定、minor / patch 追随を基本とします
- `web` と `api` で共有する型 / validation ライブラリは同一 major に揃えます
- test tool は本番コードより先に更新せず、CI 安定性を確認してから追随します

## 6. 現時点の移行メモ

- `Dockerfile` の `NODE_MAJOR=22` は、アプリ実装開始前に `24` へ更新することを推奨します
- `package.json` は現状 docs / agent 支援用の最小構成のため、実装フェーズでは npm workspace 化を前提に再編します
- `web` / `api` の分離、PostgreSQL 追加、Terraform 化は実装・運用フェーズで順次具体化します

## 7. 見直しトリガー

- 顧客認証方式が確定し、auth ライブラリ選定が必要になったとき
- `stock_projection` を非同期化し、message broker 導入を検討するとき
- AWS 以外の managed container 基盤へ切り替えるとき
- チーム規模が拡大し、frontend / backend / infra の責務分離を再設計するとき
