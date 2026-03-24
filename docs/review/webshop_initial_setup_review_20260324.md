# コードレビュー結果: Rails 初期構築

レビュー日: 2026-03-24

## レビュー対象

- `app/` - Rails 7.2 アプリケーション初期構築
- `ops/docker/postgres/` - PostgreSQL Docker Compose

## 総合評価

Rails 7.2 + Devise + Hotwire + RSpec の初期構築として骨格は適切。技術スタック選定はアーキテクチャ設計書と整合しており、テスト基盤の gem 構成も十分。ただし、**テストコードが空**、**SimpleCov の配置順序が誤り**、**User モデルのバリデーション不足**、**database.yml のパスワード平文記載**が共通の重要指摘。開発を進める前にこれらを修正すべき。

## 改善提案（重要度順）

### 高（開発続行前に対応すべき）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | **SimpleCov の配置順序を修正**（rails_helper.rb 先頭へ移動） | Prog, Tester | 現在位置ではカバレッジが 0% になる致命的問題 |
| 2 | **User ファクトリに属性を定義** | Prog, Tester | 空のままでは `create(:user)` が失敗する |
| 3 | **User モデルのテストを実装** | Prog, Tester, Arch | TDD の基盤が空。最低限 Devise バリデーション + role のテスト |
| 4 | **User モデルに role バリデーションを追加** | Prog, Arch | customer/staff の不変条件が未実装。DB に NOT NULL + default も必要 |
| 5 | **database.yml のパスワードを環境変数化** | Prog, Arch | Git 履歴にパスワードが残る |

### 中（対応推奨）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 6 | root パスを定義 | Prog, Arch | `/` にアクセスしたときの起点が不明 |
| 7 | spec_helper.rb の推奨設定を有効化 | Tester | `--only-failures`、`order: :random` 等 |
| 8 | .rspec に `--format documentation --color --order random` 追加 | Tester | テスト出力の改善 |
| 9 | config.time_zone = "Tokyo" を設定 | Arch | 日付関連のバグ予防 |
| 10 | production の DB 名を `frere_memoire_production` に統一 | Prog, Arch | 命名の一貫性 |
| 11 | Propshaft vs Sprockets の方針を確定（ADR） | Arch | 設計書は Propshaft だが実装は Sprockets |

### 低（改善の余地あり）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 12 | Faker gem の追加 | Prog, Tester | テストデータ生成の改善 |
| 13 | spec/support/ ディレクトリの有効化 | Tester | rails_helper.rb の肥大化防止 |
| 14 | 不要な Action Cable/Text の無効化 | Arch | フットプリント削減 |
| 15 | role カラムに DB レベルの NOT NULL + default 追加 | Prog | 防御的プログラミング |

## 対応方針

### 修正する（即時対応）

| # | 対応内容 |
|---|---------|
| 1 | SimpleCov を rails_helper.rb 先頭に移動 |
| 2 | User ファクトリに email/password/name/role を定義 |
| 3 | User モデルの基本テストを実装 |
| 4 | User モデルに role バリデーション追加 + migration で NOT NULL/default |
| 5 | database.yml のパスワードを ENV で管理 |

### 許容する（IT1 開発中に対応）

| # | 理由 |
|---|------|
| 6 | 商品管理画面実装時に root パスを設定 |
| 7-8 | テスト設定は IT1 中に順次改善 |
| 9 | 最初の日付関連モデル実装時に設定 |
| 11 | Bootstrap + Sprockets で問題なければ継続。ADR で記録 |
