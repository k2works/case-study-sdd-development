# コードレビュー結果: webshop 初期セットアップ

レビュー日: 2026-03-20

## レビュー対象

- `apps/webshop/backend/` — Spring Boot 3.4.3, Java 21, Gradle
- `apps/webshop/frontend/` — React 19, Vite 8, TypeScript 5.9
- `apps/webshop/docker-compose.yml` — PostgreSQL 15, Backend, Frontend
- `package.json`（ルート）— npm スクリプト

## 総合評価

初期セットアップとして技術基盤は堅実。ヘキサゴナルアーキテクチャの意識、品質ツール（JaCoCo, Checkstyle, ESLint, Prettier）の早期導入、Docker マルチステージビルド、Flyway による DDL 管理など「変更を楽に安全にできるソフトウェア」の土台が整っている。一方、TDD 規律の違反（HealthCheckController にテストなし）、Nginx SPA ルーティング未設定、フロントエンドの Vite テンプレート残存、本番プロファイルのクレデンシャルハードコードなど、対応すべき項目があった。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 対応状況 |
|---|------|------|--------|----------|
| 1 | HealthCheckController のテスト追加（MockMvc） | `backend/src/test/` に新規作成 | programmer, tester | 対応済み |
| 2 | Nginx SPA ルーティング設定（try_files + API プロキシ） | `frontend/nginx.conf` 新規 + Dockerfile 更新 | architect, programmer | 対応済み |
| 3 | `index.html` の title 変更、`lang="ja"` に修正 | `frontend/index.html` | writer, user-rep | 対応済み |
| 4 | 本番プロファイルのパスワードを環境変数化 | `application-prod.yml` | architect, programmer, writer | 対応済み |
| 5 | HealthCheckController と Actuator の機能重複解消 | `HealthCheckController.java` | programmer, architect, writer | 保留（次イテレーションで統一） |
| 6 | App.tsx を Vite テンプレートから webshop プレースホルダーに置換 | `frontend/src/App.tsx` | programmer, writer, user-rep | 対応済み |
| 7 | フロントエンド README.md をプロジェクト固有に更新 | `frontend/README.md` | writer | 対応済み |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 対応状況 |
|---|------|------|--------|----------|
| 8 | プロファイル名 `product` → `prod` にリネーム | `application-prod.yml`, `docker-compose.yml` | programmer, architect | 対応済み |
| 9 | JaCoCo カバレッジ検証閾値を設定（80%） | `build.gradle` | tester | 対応済み |
| 10 | Testcontainers 依存を追加 | `build.gradle` | tester, architect | 対応済み |
| 11 | ArchUnit 依存を追加 | `build.gradle` | architect | 対応済み |
| 12 | フロントエンドカバレッジ収集設定 | `package.json` | tester | 対応済み |
| 13 | ルート `package.json` のプレースホルダー修正 | `package.json` | writer | 対応済み |
| 14 | ADR-002 の React/TypeScript バージョン記載を実態に更新 | `docs/adr/002-frontend-framework.md` | architect | 対応済み |
| 15 | `tech_stack.md` の Node.js EOL テーブル更新 | `docs/design/tech_stack.md` | writer | 対応済み |
| 16 | Checkstyle の MethodLength を 50 行に変更 | `config/checkstyle/checkstyle.xml` | programmer | 対応済み |
| 17 | Vitest globals と明示的 import の統一 | `App.test.tsx` | programmer, tester | 対応済み（globals 使用に統一） |
| 18 | セットアップ手順書のプロファイル名修正 | `docs/operation/app-development-setup.md` | writer | 対応済み |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 対応状況 |
|---|------|------|--------|----------|
| 19 | Dockerfile で config ディレクトリのコピー追加 | `backend/Dockerfile` | programmer | 対応済み |
| 20 | Docker Compose の DB パスワードを .env に外出し | `docker-compose.yml` | architect | 保留（次イテレーション） |
| 21 | テスト戦略ドキュメントのタイポ修正 | `テスト戦略ガイド.md`, `非機能要件定義ガイド.md` | tester | 対応済み |
| 22 | SpotBugs のコメントを TODO に変更 | `build.gradle` | programmer, tester, writer | 対応済み |
| 23 | フロントエンド package.json の name を更新 | `frontend/package.json` | user-rep | 対応済み |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 判断 |
|---|--------|--------|------|------|
| 1 | architect: 空 features ディレクトリは YAGNI 違反 | user-rep: 業務対応のディレクトリ名は意図の表明として価値がある | 空ディレクトリの事前作成 | **維持** |

## エージェント別フィードバック概要

<details>
<summary>xp-programmer（高: 3 / 中: 4 / 低: 1）</summary>

- TDD 規律違反（HealthCheckController テストなし）を最重要指摘
- SOLID 原則、YAGNI の観点から Actuator との重複を指摘
- Checkstyle の MethodLength 緩和基準、本番クレデンシャルハードコードを中程度で指摘
</details>

<details>
<summary>xp-tester（高: 3 / 中: 3 / 低: 1）</summary>

- テストピラミッドの現状を「平地」と評価
- JaCoCo 検証閾値未設定、Testcontainers 未導入を中程度で指摘
- テスト戦略ドキュメントのタイポ（andExpected → andExpect）を発見
</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 2）</summary>

- Nginx SPA ルーティング未設定を本番ブロッカーとして最重要指摘
- ArchUnit 未導入（ADR コンプライアンス違反）を指摘
- プロファイル名 product のドメイン用語との衝突を指摘
</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 4 / 低: 1）</summary>

- index.html のブランド未反映、README.md 未更新を指摘
- ドキュメントとコードの乖離（SpotBugs、Node.js バージョン）を指摘
- セットアップ手順書の完成度を高く評価
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 2 / 低: 1）</summary>

- Vite テンプレート残存によるステークホルダーへの信頼性低下を指摘
- features ディレクトリ構成が業務フローに対応していることを高く評価
- 次イテレーションへの要望: 商品一覧画面、ブランディング反映、認証方針決定
</details>

## 記入履歴

| 日付 | 担当 | 内容 |
|------|------|------|
| 2026-03-20 | AI Agent | 初回レビュー実施・改善対応 |
