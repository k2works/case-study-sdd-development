---
title: 技術スタック選定
description: フラワーショップ「フレール・メモワール」 WEB ショップシステムの技術スタック選定
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - design
  - tech-stack
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# 技術スタック選定

本書は、バックエンド、フロントエンド、インフラ、テスト、運用の技術スタックを定義します。既存リポジトリが Node.js ベースの運用スクリプトを持つことと、アーキテクチャ設計で TypeScript 中心の構成が適していることから、アプリケーション全体を TypeScript 系スタックで統一します。

## 選定方針

- バックエンドとフロントエンドの言語を TypeScript に統一し、認知負荷を下げる
- LTS または安定版メジャーを優先する
- ヘキサゴナルアーキテクチャと Feature 単位 UI に適したフレームワークを選ぶ
- AWS のマネージドサービスを前提にし、IaC で再現可能にする

## 技術スタック一覧

| カテゴリ | 技術 | バージョン方針 | 用途 | サポート / 備考 |
| :--- | :--- | :--- | :--- | :--- |
| ランタイム | Node.js | 24 LTS | フロントエンド、バックエンド、運用スクリプト実行基盤 | プロジェクト標準ランタイム。EOL 前に次 LTS へ移行判断 |
| 言語 | TypeScript | 5.x 最新安定 | アプリケーション実装 | Next.js / NestJS 両対応 |
| フロントエンド FW | Next.js | 16.x | 顧客画面、管理画面、SSR / App Router | 最小 Node.js 20.9 以上 |
| UI ライブラリ | React | 19.2 系 | コンポーネント UI | Next.js と整合 |
| バックエンド FW | NestJS | 11.x | REST API、DI、モジュール構成 | Node.js 20 以上が前提 |
| API 仕様 | REST / OpenAPI | OpenAPI 3.1 | 顧客 / 管理 API 契約 | NestJS の Swagger 連携を利用 |
| ORM | Prisma ORM | 7.x | PostgreSQL とのデータアクセス、マイグレーション | TypeScript 親和性重視 |
| データベース | PostgreSQL | 17 系 | 本番データストア | 安定運用重視。18 系は評価対象 |
| キャッシュ | Redis | 7.x | セッション、短期キャッシュ、ジョブ補助 | Phase 2 以降を基本。MVP では必須化しない |
| 非同期処理 | BullMQ | 5.x | 在庫推移再計算、通知、定期ジョブ | Redis 前提。Phase 2 以降の段階導入候補 |
| バリデーション | Zod | 4.x | フロント / バック共通 DTO バリデーション | 型共有しやすい |
| フロント状態管理 | TanStack Query | 5.x | サーバー状態管理 | Query 層の中心 |
| フォーム | React Hook Form | 7.x | 注文入力、管理フォーム | Zod と連携 |
| UI 部品 | shadcn/ui + Radix UI | 最新安定 | 管理画面と顧客画面の基礎部品 | 必要部品のみ導入 |
| スタイリング | Tailwind CSS | 4.x | 画面スタイル実装 | Feature 単位の構成に適合 |
| 単体 / 結合テスト | Vitest | 4.x | フロント / バックのユニットテスト | Vite / TS と親和性が高い |
| API / E2E テスト | Playwright | 1.58 系 | 注文導線、管理画面、主要業務 E2E | ブラウザ同梱が容易 |
| バックエンドテスト補助 | Supertest | 7.x | HTTP API テスト | NestJS と相性が良い |
| Lint / Format | ESLint / Prettier | 9.x / 3.x | 静的解析、整形 | ルール統一 |
| モノレポ補助 | npm workspaces | npm 11 系 | `apps/` と共有パッケージ管理 | 現行リポジトリと整合 |
| コンテナ | Docker | 28 系 | ローカル開発、ビルド、デプロイ成果物 | 既存 `Dockerfile` を活用 |
| クラウド | AWS | マネージドサービス中心 | 本番 / 開発基盤 | Route 53, CloudFront, ALB, ECS, RDS を想定 |
| コンテナ実行 | Amazon ECS on Fargate | 現行安定 | バックエンド / Worker 実行 | 少人数運用向き。MVP では App Runner との比較余地あり |
| 静的配信 | S3 + CloudFront | 現行安定 | フロントエンド配信 | Next.js 配置方針と整合 |
| シークレット管理 | AWS Secrets Manager | 現行安定 | アプリ機密情報管理 | 環境変数直書きを避ける |
| 監視 | CloudWatch | 現行安定 | ログ、メトリクス、アラーム | AWS 標準運用 |
| IaC | Terraform | 1.x 最新安定 | AWS リソース定義 | 後方互換ポリシーが明確 |
| CI/CD | GitHub Actions | 現行安定 | Lint、テスト、ビルド、デプロイ | GitHub 中心運用に適合 |
| ドキュメント | MkDocs Material | 現行構成を維持 | 設計・運用ドキュメント公開 | 既存運用を継続 |

## レイヤー別の選定理由

### フロントエンド

- `Next.js 16.x`:
  - 顧客向け注文導線に SSR / App Router を活用できる
  - 管理画面も同一プロダクトで構築できる
- `React 19.2`:
  - `useEffectEvent` など最新 API を利用できる
  - Next.js 16 系との整合が良い
- `TanStack Query`:
  - サーバー状態と UI 状態の分離方針に合う
- `React Hook Form` + `Zod`:
  - 注文フォームと管理画面フォームのバリデーションを一貫して扱える

### バックエンド

- `NestJS 11.x`:
  - DI、モジュール、テスト支援が整っており、ヘキサゴナル構成と相性が良い
  - OpenAPI 連携が容易
- `Prisma ORM 7.x`:
  - TypeScript 親和性が高く、スキーマとマイグレーション管理をまとめやすい
  - PostgreSQL との組み合わせが安定している
- `BullMQ`:
  - 在庫推移再計算や通知など、同期 API から切り離したい処理に向く

### データストア

- `PostgreSQL 17 系`:
  - RDB として十分に成熟しており、受注、在庫、発注、出荷の整合管理に適する
  - `18.x` は利用可能だが、初期リリースでは 17 系を優先し、18 系は検証後に追随する
- `Redis 7.x`:
  - ジョブキューと短期キャッシュ基盤として扱いやすい

### インフラ / 運用

- `AWS`:
  - 小規模運用でもマネージドサービスを組み合わせやすい
- `ECS on Fargate`:
  - Kubernetes より運用負荷を抑えつつ、コンテナ化方針を満たせる
- `Terraform`:
  - AWS 構成をコード化しやすく、後方互換ポリシーも明確
- `GitHub Actions`:
  - リポジトリ中心の CI/CD と相性が良い

## 想定ディレクトリ構成

```text
apps/
  frontend/
  backend/
packages/
  shared-types/
  ui/
ops/
  terraform/
```

## バージョン運用ルール

- Node.js は LTS メジャー固定で運用し、メジャー更新は四半期ごとに評価する
- Next.js、NestJS、Prisma、React はメジャー固定、マイナー / パッチ追随を基本とする
- PostgreSQL はメジャー更新前に Staging でリハーサルする
- Terraform は `required_version` を明示し、CI で固定する

## サポート期限と更新判断

| 技術 | 更新判断 |
| :--- | :--- |
| Node.js | EOL の 6 か月前までに次 LTS への移行計画を作る |
| Next.js / React | 重大な互換性変更がない限り四半期ごとに追随可否を判断する |
| NestJS / Prisma | 年 2 回の棚卸しでメジャー更新要否を判断する |
| PostgreSQL | 年 1 回のメジャー更新評価を行い、次年度反映を判断する |
| Terraform | provider 互換性を含めて四半期ごとに更新可否を判断する |

## オープン事項

- `Redis` を MVP から導入するか、Phase 2 のジョブ処理開始時に導入するか
- Next.js を完全 SSR 中心で運用するか、顧客画面だけ静的配信寄りにするか
- Prisma の採用を最終確定し、必要に応じて SQL 主導設計との差分を ADR 化する

## 参照

- Node.js Release WG / EOL: 公式リリーススケジュールと EOL 情報
- Next.js 16 とインストール要件
- React 19.2 と versions ページ
- NestJS 11 migration guide
- PostgreSQL Download ページ
- Playwright Release Notes / Docker
- Vitest 4 ブログ / トップページ
- Terraform Install / version command
