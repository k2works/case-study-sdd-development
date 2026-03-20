# 運用レビュー結果: CI/CD パイプライン

**レビュー日**: 2026-03-20
**レビュー対象**: CI/CD パイプライン（GitHub Actions + AWS ECS）

## レビュー対象

- `.github/workflows/ci.yml` — CI パイプライン
- `.github/workflows/cd.yml` — CD パイプライン
- `apps/webshop/backend/Dockerfile` — バックエンド Docker イメージ
- `apps/webshop/frontend/Dockerfile` — フロントエンド Docker イメージ
- `docs/operation/cicd-pipeline.md` — CI/CD ドキュメント
- `ops/scripts/develop.js` — 開発スクリプト

## 総合評価

1-2 名の小規模チームに適した実用的な CI/CD パイプラインが構築されています。OIDC 認証、並列 CI 実行、環境別 IAM ロール分離、concurrency 制御など設計の基本は堅実です。しかし、本番運用に向けて **ECS デプロイ時のイメージタグ未反映**、**ロールバック手順の欠如**、**Docker コンテナの root 実行** など、対処必須の課題が複数あります。

## 改善提案（重要度順）

### 高（本番適用前に対応必須）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | ECS デプロイ時にビルドしたイメージタグをタスク定義に反映する。`amazon-ecs-render-task-definition` でイメージを注入する必要がある | `cd.yml` deploy-staging / deploy-production | architect, tester, PM | `build-images` の outputs が未使用。現状ではビルドしたイメージがデプロイされない |
| 2 | ロールバック戦略を実装する。ECS デプロイメントサーキットブレーカーの有効化、またはヘルスチェック失敗時の自動ロールバックステップを追加 | `cd.yml` deploy-staging / deploy-production | architect, tester, PM | ヘルスチェック失敗時に `exit 1` で終了するだけで、サービスが不安定な状態で放置される |
| 3 | Docker コンテナを非 root ユーザーで実行する。Backend は `useradd` + `USER`、Frontend は `nginxinc/nginx-unprivileged:alpine` を検討 | `backend/Dockerfile`, `frontend/Dockerfile` | architect, tester, PM | root 実行はコンテナエスケープ時の影響範囲を拡大する |
| 4 | `.dockerignore` を追加する。`.git/`, `build/`, `node_modules/`, `.env` 等を除外 | `apps/webshop/backend/`, `apps/webshop/frontend/` | architect, tester | シークレット漏洩リスクとイメージサイズ肥大化の防止 |
| 5 | ECS タスク定義ファイル（`task-definition.json`）をテンプレートとして作成する | `apps/webshop/backend/`, `apps/webshop/frontend/` | architect, PM | CD パイプラインが参照するファイルが存在せず、現状ではデプロイ不可能 |
| 6 | CI ワークフローに `permissions: contents: read` を明示する | `ci.yml` 全体 | tester | 最小権限の原則。未設定だとデフォルトの読み書き権限が付与される可能性 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 7 | 依存関係の脆弱性スキャンを CI に追加（OWASP Dependency-Check, `npm audit`） | `ci.yml` backend / frontend | tester | サプライチェーン攻撃防止。既知の脆弱性を持つライブラリの検出 |
| 8 | nginx にセキュリティヘッダーを追加（`X-Frame-Options`, `X-Content-Type-Options`, `CSP` 等） | `frontend/nginx.conf` | tester, PM | XSS、クリックジャッキング等の基本防御 |
| 9 | 本番デプロイをステージング成功に依存させる。release 時もステージング検証を前提条件とする | `cd.yml` deploy-production | tester | 現状は `needs: build-images` のみで、ステージング未検証のまま本番デプロイ可能 |
| 10 | フロントエンドのカバレッジ検証を CI に追加。`vitest --coverage` + 閾値設定 | `ci.yml` frontend | tester | バックエンド 80% に対してフロントエンドはカバレッジゲートなし |
| 11 | CI Gate の二重実行を回避。`workflow_run` トリガーまたは CI ステータスチェックに変更 | `cd.yml` ci-gate | PM | 同一コミットで CI が 2 回実行され、Actions 利用時間が倍増 |
| 12 | Docker ベースイメージのバージョンを固定（例: `eclipse-temurin:21.0.4_7-jre-jammy`） | `backend/Dockerfile`, `frontend/Dockerfile` | tester | ビルドの再現性保証 |
| 13 | ヘルスチェックの `sleep 30` 固定値を削除または短縮。`wait-for-service-stability` で待機済み | `cd.yml` deploy-staging / deploy-production | PM | CD 実行時間の無駄を削減 |
| 14 | Backend JRE を alpine ベース（`eclipse-temurin:21-jre-alpine`）に変更 | `backend/Dockerfile` | architect | イメージサイズ削減（約 300MB → 約 100MB） |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 15 | CI 失敗時の Slack 通知を追加 | `ci.yml`, `cd.yml` | architect, PM | GitHub デフォルト通知では見落としリスクあり |
| 16 | フロントエンドのテスト結果・カバレッジを upload-artifact する | `ci.yml` frontend | PM | バックエンドとの対称性、品質可視化 |
| 17 | ローカル Lint/Checkstyle 実行用 Gulp タスクを追加 | `ops/scripts/develop.js` | PM | CI で初めて Lint エラーに気づくのはフィードバックが遅い |
| 18 | `tsc -b --noEmit` を `tsc --noEmit` に変更 | `ci.yml` frontend | tester, PM | `-b` と `--noEmit` の組み合わせは一部設定で競合する可能性 |
| 19 | Backend Dockerfile の `|| true` による依存解決エラー無視を改善 | `backend/Dockerfile` | architect, tester | 依存解決失敗がサイレントに無視される |
| 20 | JAR コピーのワイルドカード `*.jar` を明示的なファイル名に変更 | `backend/Dockerfile` | PM | 複数 JAR 存在時に予期しない動作の可能性 |

## 矛盾事項

複数エージェントの指摘が相反するものはありませんでした。3 エージェント間で高い一致度が見られ、特に以下の 4 点は全員が「高」として指摘しています:

1. ECS デプロイ時のイメージタグ未反映
2. ロールバック手順の欠如
3. Docker コンテナの root 実行
4. タスク定義ファイルの不在

## スコープ外の共通発見

| # | 発見 | 指摘元 | 影響 |
|---|------|--------|------|
| 1 | `nginx.conf` の `proxy_pass http://backend:8080` は Docker Compose 用。ECS 環境では名前解決できず API 通信が全て失敗する | architect, PM | 本番デプロイのブロッカー |
| 2 | Terraform ファイルが未作成。アーキテクチャ設計書では IaC: Terraform と記載 | architect | インフラのコード管理が未着手 |
| 3 | E2E テストが CI/CD に未組込。設計書の CI/CD フロー図との乖離 | architect, tester | テスト戦略との不整合 |
| 4 | DB マイグレーション（Flyway）のデプロイ時実行手順が未定義 | tester, PM | スキーマ変更を伴うデプロイで問題発生の可能性 |

## エージェント別フィードバック詳細

<details>
<summary>xp-architect（高: 4 / 中: 5 / 低: 2）</summary>

### 評価サマリー
全体として、1-2 名の小規模チームにふさわしいシンプルで実用的な CI/CD パイプラインが構築されています。アーキテクチャ設計書との整合性も概ね取れており、OIDC 認証やマルチステージビルドなど、セキュリティと効率性の基本は押さえられています。一方で、デプロイ時のイメージタグの不整合、ロールバック手順の欠如、Docker イメージのセキュリティハードニングなど、本番運用に向けて対処すべき課題がいくつか存在します。

### 良い点
- CI の並列実行設計（フィードバック速度の最大化）
- concurrency 制御（CI: cancel-in-progress: true、CD: false）
- OIDC 認証（長期シークレットキーの管理排除）
- CI Gate パターン（テスト通過を保証）
- マルチステージビルド（ランタイムイメージの軽量化）
- Gradle キャッシュの精密なキー設計
- 環境分離と本番手動承認
- 開発スクリプトと CI 環境の一貫性

### 主要な改善提案
- 【高】ECS デプロイ時のイメージタグ未反映（`amazon-ecs-render-task-definition` の追加が必要）
- 【高】ロールバック手順の欠如（デプロイメントサーキットブレーカーまたは明示的ロールバック）
- 【高】Docker コンテナの non-root 実行設定
- 【高】`.dockerignore` ファイルの不在
- 【中】task-definition.json の不在
- 【中】paths フィルターの範囲
- 【中】Backend JRE の alpine 化
- 【中】nginx.conf と ECS 環境の不整合

### 優先度付き対応ロードマップ
1. 即座対応: task-definition.json 作成、イメージタグ反映修正、nginx.conf 環境別対応
2. 短期対応: .dockerignore 追加、non-root ユーザー設定、ロールバック手順整備
3. 中期対応: Docker イメージ脆弱性スキャン、DB マイグレーション自動化、Terraform 整備
4. 長期対応: E2E テスト自動化、監視自動設定、alpine ベースイメージ移行

</details>

<details>
<summary>xp-tester（高: 7 / 中: 6 / 低: 3）</summary>

### 評価サマリー
CI パイプラインは基本的な品質ゲート（Checkstyle、テスト、カバレッジ検証、Lint、型チェック）を備え、CD パイプラインは OIDC 認証や environment による承認ゲートなど適切な設計がなされている。しかし、Docker イメージのセキュリティ硬化が不十分であり、デプロイ失敗時のロールバック戦略が欠如している点は本番運用において重大なリスクとなる。

### 良い点
- CI ゲートの CD 連携（テスト未通過のデプロイ防止）
- OIDC 認証の採用
- 環境ごとの IAM Role 分離
- environment 設定による保護ルール
- JaCoCo カバレッジ検証ゲート（80%）
- テスト結果の `if: always()` アーティファクト保存

### 主要なセキュリティ懸念
- コンテナの root 実行（Backend / Frontend 両方）
- CI パイプラインの permissions 未設定
- 依存関係の脆弱性未検査
- `.dockerignore` の欠如（シークレット漏洩リスク）
- nginx のセキュリティヘッダー欠如

### 主要な運用リスク
- ロールバック手順の欠如（致命的）
- Backend/Frontend デプロイの非原子性
- ステージング検証バイパスで本番デプロイ可能
- デプロイ後モニタリング不在
- DB マイグレーション手順未定義

</details>

<details>
<summary>xp-project-manager（高: 4 / 中: 5 / 低: 3）</summary>

### 評価サマリー
全体として、1-2 名の小規模チームに対して適切な粒度の CI/CD パイプラインが構築されており、OIDC 認証・環境分離・並列実行・concurrency 制御など、運用のベストプラクティスがよく反映されています。ただし、本番運用を開始する前に対処すべき実運用上の課題がいくつかあります。

### 良い点
- CI 並列実行と早期失敗（開発サイクル非阻害）
- CD concurrency 制御（半端なデプロイ防止）
- 本番デプロイの手動承認ゲート
- 開発スクリプトの統一と dev:help のヘルプ出力
- CI/CD ドキュメントの網羅性
- 成果物保持期間（7 日間）の適切さ

### ボトルネック分析
1. ECS タスク定義ファイル未作成 → CD 全体が動作不能
2. nginx.conf が ECS 環境非対応 → API 通信不能
3. ロールバック手順未整備 → 障害時復旧時間不確定
4. イメージタグがタスク定義に注入されない → 古いイメージが使われる

### 推奨次のアクション
1. ECS タスク定義テンプレート作成 + イメージ注入実装
2. nginx.conf の本番環境対応
3. ロールバック手順書作成
4. デプロイ失敗時の Slack 通知設定
5. Dockerfile への non-root ユーザー設定追加

</details>

---

## 記入履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-03-20 | 初版作成（CI/CD パイプラインレビュー） |
