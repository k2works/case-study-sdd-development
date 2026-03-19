# Ralph Wiggum 運用ガイド

## 概要

このプロジェクトでは、`fstandhartinger/ralph-wiggum` をベースにした自律実行ループを導入しています。
Ralph は `specs/` にある仕様を読み取り、優先度が最も高い未完了の作業を選んで、実装、テスト、コミット、プッシュまで反復実行します。

このプロジェクトにおける実行方針の source of truth は `.specify/memory/constitution.md` です。

## 関連ファイル

- `.specify/memory/constitution.md` : Ralph の実行方針、原則、補助機能設定
- `specs/*.md` : 作業対象の仕様書
- `scripts/ralph-loop.sh` : Claude Code 用のループスクリプト
- `scripts/ralph-loop-codex.sh` : Codex CLI 用のループスクリプト
- `scripts/ralph-loop-gemini.sh` : Gemini 用のループスクリプト
- `scripts/ralph-loop-copilot.sh` : Copilot 用のループスクリプト
- `history.md` : spec 完了ごとの 1 行サマリー
- `history/` : spec ごとの詳細履歴
- `completion_log/` : 完了ログ
- `logs/` : ループ実行ログ

## 前提条件

- bash が使えること
- 対象 AI CLI がインストール済みで認証済みであること
- Git の push 権限があること

Windows では `Git Bash`、`WSL`、または bash が利用できるコンテナ内で実行してください。

## 利用する CLI

### Codex CLI

`scripts/ralph-loop-codex.sh` は `codex` コマンドを使用します。
`YOLO Mode` が有効な場合は `--dangerously-bypass-approvals-and-sandbox` を付けて起動します。

### Claude Code

`scripts/ralph-loop.sh` は `claude` コマンドを使用します。
`YOLO Mode` が有効な場合は `--dangerously-skip-permissions` を付けて起動します。

### Gemini / Copilot

Gemini と Copilot も同様に専用スクリプトから起動できます。
普段 Codex を使う場合でも、constitution と spec の構造は共通です。

## 基本フロー

1. `constitution` を確認する
2. `specs/` に作業したい仕様を書く
3. 必要であれば planning mode で実装計画を作る
4. build mode で Ralph を回す
5. `logs/`、`history.md`、`completion_log/` を確認する

## 実行方法

### Planning mode

コードベースと `specs/` を比較し、`IMPLEMENTATION_PLAN.md` を作成または更新します。
このモードでは実装は行いません。

```bash
bash ./scripts/ralph-loop-codex.sh plan
```

Claude Code で planning を行う場合:

```bash
bash ./scripts/ralph-loop.sh plan
```

### Build mode

未完了の spec を 1 つ選び、実装から検証まで実行します。

```bash
bash ./scripts/ralph-loop-codex.sh
```

Claude Code を使う場合:

```bash
bash ./scripts/ralph-loop.sh
```

### 最大反復回数を制限する

```bash
bash ./scripts/ralph-loop-codex.sh 20
```

## spec の書き方

`specs/` 配下に Markdown ファイルを作成します。
運用ルールは constitution に定義しています。

- 数字が小さいものほど高優先度です
- `## Status: COMPLETE` がない spec は未完了として扱われます
- 受け入れ条件はテスト可能な形で書きます
- `NR_OF_TRIES` を末尾で管理します

最小例:

```md
# 01. 注文一覧を表示する

## Goal

受注状況を一覧で確認できるようにする。

## Acceptance Criteria

- 注文一覧画面が表示される
- 注文番号、顧客名、配送日、状態が確認できる
- テストで表示内容を検証できる

## Status

IN_PROGRESS

NR_OF_TRIES: 0
```

## 完了判定

Ralph は、次の条件を満たしたときだけ `<promise>DONE</promise>` を出力します。

- 受け入れ条件を満たしている
- 必要なテストが成功している
- 変更がコミットされている
- Git Autonomy が有効な場合は push まで完了している

作業対象が残っていない場合のみ `<promise>ALL_DONE</promise>` を出力します。

## 補助機能

### Telegram 通知

constitution では Telegram 通知が有効です。
以下の環境変数を設定してください。

- `TG_BOT_TOKEN`
- `TG_CHAT_ID`

spec 完了時、連続失敗時、難航時に通知を送れます。

### GitHub Issues 連携

constitution では `k2works/case-study-sdd-development` の Issue も対象です。
`gh` CLI にログインしておく必要があります。

```bash
gh auth status
gh issue list --repo k2works/case-study-sdd-development --state open
```

### Completion Log

spec 完了ごとに `completion_log/` へログを残します。
後から進捗や判断履歴を追いやすくなります。

## トラブルシュート

### bash スクリプトが起動しない

- `Git Bash`、`WSL`、または Linux コンテナ内で実行してください
- 対象 CLI が `PATH` に入っているか確認してください

### 反復しても完了しない

- `logs/` の最新ログを確認してください
- spec が大きすぎる場合は分割してください
- `NR_OF_TRIES` が 10 以上なら小さな spec に切り直してください

### GitHub Issues が扱えない

- `gh auth status` で認証状態を確認してください
- リポジトリへの権限があるか確認してください

## 運用上の注意

- Ralph の判断基準は `.specify/memory/constitution.md` を優先します
- 仕様が曖昧なまま build mode を回すと、不要な試行が増えます
- 大きな spec より、小さく独立した spec の方が安定して進みます
