# イテレーション 1 ふりかえり

## 概要

| 項目 | 内容 |
| :--- | :--- |
| イテレーション | 1 |
| 期間 | Week 1-2 |
| 計画 SP | 9 |
| 完了 SP | 9 |
| 達成率 | 100% |
| ベロシティ | 9 SP/IT |

---

## Keep（継続すること）

### 技術的成功

- **TDD サイクルの厳守**: Red→Green→Refactor を全タスクで実践。テストなしでプロダクションコードを書かなかった
- **dataclass(frozen=True) パターン**: 値オブジェクトを不変オブジェクトとして一貫した設計で実装。等価性・不変性が自然に実現
- **ドメイン層の DB 非依存テスト**: 70 テスト中 49 件がドメイン層のユニットテスト。DB 接続不要で高速実行（< 0.5 秒）
- **カバレッジ 97%**: テスト戦略の目標（80%）を大幅に上回る

### プロセス的成功

- **インサイドアウトアプローチ**: ドメイン層→インフラ層→プレゼンテーション層の順で、基盤を固めてから上位層を構築。安定した進行
- **SonarQube Quality Gate**: 開発完了後に即座にスキャンし、違反 0 件で Quality Gate パス
- **小さなコミット単位**: US ごとにドメイン層とインフラ・プレゼン層を分けてコミット。変更追跡が容易

---

## Problem（問題点）

### 見積もり精度

- **環境構築の見積もり**: uv + Django + Docker Compose + tox + Ruff + mypy の設定に計画の 9h を使ったが、DOCKER_HOST 環境変数の干渉や Django バージョン制約（5.2 LTS vs 6.x）のトラブルシューティングに想定外の時間がかかった
- **pre-commit hook**: husky + lint-staged の worktree 対応に追加工数が発生

### 技術的課題

- **Docker Desktop の Git Bash 互換性**: Named Pipe パス（`npipe://`）が Git Bash で正しく解釈されない。preview_start からの Docker 操作が不安定
- **SonarQube の Python S125 誤検知**: docstring のみのファイルを「コメントアウトされたコード」と検知。ルールの調整が必要

### 未対応事項

- **CI/CD パイプライン**: GitHub Actions ワークフロー（タスク 0.7）は IT1 では未実装。ローカル品質チェックのみ
- **.gitignore**: `__pycache__`、`.coverage`、`db.sqlite3` の除外設定が不十分

---

## Try（次に試すこと）

| # | アクション | 期待効果 |
| :--- | :--- | :--- |
| 1 | .gitignore を整備し Python 関連の生成ファイルを除外 | 不要ファイルのコミット防止 |
| 2 | GitHub Actions で Lint + テスト + カバレッジを自動実行 | PR マージ前の品質保証 |
| 3 | SonarQube の Python S125 ルールを調整 | 誤検知の排除 |
| 4 | Docker 操作は PowerShell/cmd から実行する運用ルールを確立 | Git Bash の Named Pipe 問題を回避 |

---

## 数値指標

| 指標 | 値 |
| :--- | :--- |
| テストカバレッジ | 97% |
| テスト数 | 70（ドメイン 49 + 統合 9 + API 10 + スモーク 2） |
| Ruff エラー | 0 |
| SonarQube 違反 | 0 |
| SonarQube Quality Gate | OK |
| コミット数 | 10 |
| ベロシティ | 9 SP/IT |
