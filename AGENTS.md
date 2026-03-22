# AGENTS.md

AI コーディングエージェント向けのプロジェクトガイドラインです。

> **重要**: 詳細なガイドラインは `CLAUDE.md` を参照してください。

## プロジェクト概要

<!-- プロジェクトの概要を記述 -->

- **プロジェクト名**: 花束問題のケーススタディ（`case-study-sdd-development`）
- **説明**: 仕様駆動開発（SDD）のケーススタディとして、フラワーショップ「フレール・メモワール」の WEB ショップ（受注・在庫・出荷）を継続開発するプロジェクトです。
- **技術スタック**: Node.js 22 + Gulp（開発タスク）、MkDocs Material（ドキュメント）、Java 21 / Spring Boot 3.4（バックエンド）、React 19 + TypeScript 5.9 + Vite 8（フロントエンド）、PostgreSQL / H2
- **アーキテクチャ**: モノレポ構成（`apps/webshop` + `docs`）で、バックエンドはドメインモデル + ポートとアダプター（ADR-001）、フロントエンドは React SPA（ADR-002）

## ディレクトリ構成

<!-- 主要なディレクトリ構成を記述 -->

```
.
├── apps/webshop/                 # アプリケーション本体
│   ├── backend/                  # Spring Boot（`src/main` / `src/test`）
│   └── frontend/                 # React + Vite（`src/features` 中心）
├── docs/                         # MkDocs コンテンツ（分析・要件・設計・運用・ADR）
├── ops/scripts/                  # Gulp から読み込まれる運用/開発タスク
├── package.json                  # ルート npm scripts（docs / webshop / check / tdd）
└── ...
```

## ビルド・テストコマンド

<!-- プロジェクトで使用するコマンドを記述 -->

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
npm run webshop:backend
npm run webshop:frontend

# テスト実行
npm run webshop:backend:test
npm run webshop:frontend:test
npm run tdd:webshop:backend
npm run tdd:webshop:frontend

# Lint 実行
npm run check:backend
npm run check:frontend
npm run check:all

# ドキュメント
npm run docs:serve
npm run docs:build
```

## コード規約

### 言語・スタイル

- **日本語**でコミュニケーション（技術用語は英語）
- 日本語と半角英数字の間に**半角スペース**を入れる
- **ですます調**、句読点は「。」「、」

### プロジェクト固有のルール

<!-- プロジェクト固有のコーディングルールを記述 -->

- フォーマッター: フロントエンドは Prettier（`apps/webshop/frontend/package.json` の `format`）
- リンター: フロントエンドは ESLint（`apps/webshop/frontend/package.json` の `lint`）、バックエンドは Checkstyle + JaCoCo 閾値 80%（`apps/webshop/backend/build.gradle` の `check`）
- その他: バックエンドは `application` / `domain` / `infrastructure` の層分割（`apps/webshop/backend/src/main/java/com/frerememoire/webshop`）、フロントエンドは `src/features/*` 単位で機能分割

## テスト指示

- **TDD サイクル**に従う: Red → Green → Refactor
- テストが通る状態でのみコミット
- テストフレームワーク: バックエンドは JUnit 5 + Spring Boot Test + ArchUnit + Testcontainers、フロントエンドは Vitest + Testing Library（E2E は Playwright）

## コミット規約

- **Conventional Commits** 形式を使用
- 構造変更と動作変更を同一コミットに含めない
- 日本語でコミットメッセージを記述

```
feat: 新機能を追加
fix: バグを修正
docs: ドキュメントを更新
refactor: リファクタリング
test: テストを追加
chore: ビルド・設定変更
```

## PR 指示

- すべてのテストがパスしていること
- Lint エラーがないこと
- 変更内容を簡潔に説明

## 参照ドキュメント

<!-- プロジェクトの参照ドキュメントを記述 -->

- `CLAUDE.md` - 詳細な AI エージェント実行ガイドライン
- `README.md` - 全体の起動手順と運用フロー
- `docs/operation/develop-script.md` - 開発スクリプトの正規リファレンス
- `docs/adr/001-architecture-pattern.md` - バックエンドアーキテクチャ決定
- `docs/adr/002-frontend-framework.md` - フロントエンドアーキテクチャ決定
- `docs/adr/003-infrastructure.md` - インフラストラクチャ決定
