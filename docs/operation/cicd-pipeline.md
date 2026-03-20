# CI/CD パイプライン設計

## 概要

フレール・メモワール WEB ショップシステムの CI/CD パイプラインは GitHub Actions で構築されています。CI でコード品質を自動検証し、CD で AWS ECS Fargate へのデプロイを自動化します。

前提となるインフラ設計については [インフラストラクチャアーキテクチャ設計](../design/architecture_infrastructure.md) を参照してください。

---

## パイプライン全体像

```
Git Push / PR
    │
    ├── CI（ci.yml）
    │   ├── Backend CI（並列実行）
    │   │   ├── Checkstyle
    │   │   ├── Test（JUnit 5）
    │   │   └── JaCoCo Coverage（80% 閾値）
    │   └── Frontend CI（並列実行）
    │       ├── ESLint
    │       ├── TypeScript 型チェック
    │       ├── Test（Vitest）
    │       └── Build（Vite）
    │
    └── CD（cd.yml）※ main push / リリースタグ時のみ
        ├── CI Gate（CI 再実行）
        ├── Docker Image Build & Push（ECR）
        ├── Staging Deploy（main push → 自動）
        └── Production Deploy（リリースタグ → 手動承認）
```

---

## CI パイプライン

### トリガー

| イベント | ブランチ | 実行内容 |
|---------|---------|---------|
| `push` | `main`, `develop` | フル CI |
| `pull_request` | `main`, `develop` | フル CI |

### バックエンド CI ジョブ

| ステップ | コマンド | 目的 |
|---------|---------|------|
| Checkstyle | `./gradlew checkstyleMain checkstyleTest` | コーディング規約の検証 |
| Test | `./gradlew test` | JUnit 5 単体・統合テスト |
| JaCoCo | `./gradlew jacocoTestReport jacocoTestCoverageVerification` | コードカバレッジ 80% 以上の検証 |

**成果物**: テスト結果レポート、カバレッジレポート（7 日間保持）

### フロントエンド CI ジョブ

| ステップ | コマンド | 目的 |
|---------|---------|------|
| Lint | `npm run lint` | ESLint によるコード品質チェック |
| Type check | `npx tsc -b --noEmit` | TypeScript 型安全性の検証 |
| Test | `npm run test` | Vitest 単体テスト |
| Build | `npm run build` | ビルド成功の検証 |

**成果物**: ビルド成果物（7 日間保持）

### 最適化

- **並列実行**: バックエンドとフロントエンドの CI ジョブは並列で実行
- **キャッシュ**: Gradle パッケージ、npm パッケージをキャッシュ
- **早期失敗**: Lint → テスト → ビルドの順で失敗を早期検知
- **同時実行制御**: 同一ブランチの古い CI 実行を自動キャンセル

---

## CD パイプライン

### トリガーとデプロイ先

| トリガー | 対象環境 | 承認 | 方式 |
|---------|---------|------|------|
| `main` ブランチ push（`apps/webshop/**` 変更時） | ステージング | 不要（自動） | ローリングアップデート |
| リリースタグ作成 | 本番 | 必須（手動承認） | ローリングアップデート |

### デプロイフロー

```
CI Gate（テスト通過を確認）
    │
    ├── Docker Image Build
    │   ├── Backend Image → ECR push
    │   └── Frontend Image → ECR push
    │
    ├── [main push] Staging Deploy
    │   ├── ECS Task Definition 更新
    │   ├── ECS Service ローリングアップデート
    │   └── ヘルスチェック（/api/health）
    │
    └── [release tag] Production Deploy（要承認）
        ├── ECS Task Definition 更新
        ├── ECS Service ローリングアップデート
        ├── ヘルスチェック（/api/health）
        └── デプロイサマリー生成
```

### AWS 認証（OIDC）

シークレットキーの直接管理を避け、GitHub Actions OIDC Provider + IAM Role で認証します。

| 環境 | シークレット | 用途 |
|------|------------|------|
| 共通 | `AWS_ROLE_ARN` | ECR Push 用 IAM ロール |
| ステージング | `AWS_ROLE_ARN_STAGING` | ステージング ECS デプロイ用 |
| ステージング | `STAGING_URL` | ヘルスチェック URL |
| 本番 | `AWS_ROLE_ARN_PRODUCTION` | 本番 ECS デプロイ用 |
| 本番 | `PRODUCTION_URL` | ヘルスチェック URL |

### イメージタグ戦略

| トリガー | タグ形式 | 例 |
|---------|---------|-----|
| main push | `sha-<commit>` | `sha-a1b2c3d` |
| リリースタグ | タグ名そのまま | `v1.0.0` |

---

## GitHub Environments 設定

### staging 環境

- **保護ルール**: なし（自動デプロイ）
- **シークレット**: `AWS_ROLE_ARN_STAGING`, `STAGING_URL`

### production 環境

- **保護ルール**: 手動承認必須（レビュアー指定）
- **シークレット**: `AWS_ROLE_ARN_PRODUCTION`, `PRODUCTION_URL`

---

## ワークフローファイル一覧

| ファイル | 用途 |
|---------|------|
| `.github/workflows/ci.yml` | CI パイプライン（テスト・Lint・ビルド） |
| `.github/workflows/cd.yml` | CD パイプライン（ECR Push・ECS デプロイ） |
| `.github/workflows/mkdocs.yml` | ドキュメント GitHub Pages デプロイ |
| `.github/workflows/docker-publish.yml` | 開発コンテナイメージ公開 |

---

## セットアップ手順

### 1. GitHub リポジトリ設定

1. **Settings → Environments** で `staging` と `production` 環境を作成
2. `production` 環境に **Required reviewers** を設定
3. 各環境にシークレットを設定

### 2. AWS 側設定

1. GitHub Actions OIDC Provider を AWS IAM に登録
2. ECR リポジトリ（`webshop-backend`, `webshop-frontend`）を作成
3. ECS クラスター・サービス・タスク定義を作成（Terraform で管理）
4. デプロイ用 IAM ロールを作成し、OIDC の trust policy を設定

### 3. ECS タスク定義

以下のファイルを作成し、ECS デプロイで使用します:
- `apps/webshop/backend/task-definition.json`
- `apps/webshop/frontend/task-definition.json`

---

## 関連ドキュメント

- [インフラストラクチャアーキテクチャ設計](../design/architecture_infrastructure.md)
- [運用要件](../design/operation.md)
- [開発スクリプトリファレンス](./develop-script.md)
- [アプリケーション開発環境セットアップ手順書](./app-development-setup.md)
