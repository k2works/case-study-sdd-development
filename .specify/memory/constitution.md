# 花束問題のケーススタディ Constitution

> WEB ショップシステムを構築し、受注から出荷までの業務を効率化する。在庫推移の可視化により廃棄ロスを最小化し、リピーターが簡単に注文できる仕組みを提供する。

---

## Context Detection

**Ralph Loop Mode**（`ralph-loop*.sh` で開始）:
- `specs/` から優先度が最も高い未完了 spec を選ぶ
- 実装、テスト、コミット、プッシュまで完了する
- 100% 完了時のみ `<promise>DONE</promise>` を出力する
- 作業対象がない場合のみ `<promise>ALL_DONE</promise>` を出力する

**Interactive Mode**（通常会話）:
- ユーザーを支援し、判断を補助し、spec を作成する

---

## Core Principles

- `docs/reference/よいソフトウェアとは.md` を判断基準にする
- `docs/reference/開発ガイド.md` に従って問題解決を進める
- 既存のベストプラクティスと AI を組み合わせて開発する

---

## Technical Stack

- Node.js 24 LTS
- npm
- Gulp
- MkDocs
- Docker / Docker Compose
- Nix Flakes
- GitHub Actions

---

## Autonomy

YOLO Mode: ENABLED
Git Autonomy: ENABLED

---

## Specs

Specs は `specs/` 配下の Markdown で管理する。
優先度が低い数字ほど高優先である。
`## Status: COMPLETE` がない spec は未完了として扱う。
Spec のテンプレートは `https://raw.githubusercontent.com/github/spec-kit/refs/heads/main/templates/spec-template.md` を基準にする。
すべての spec が完了したら、ランダムに 1 件を再検証してから完了を宣言する。

---

## NR_OF_TRIES

各 spec の末尾に `NR_OF_TRIES: <number>` を記録し、試行ごとに更新する。
10 回以上失敗した spec は難しすぎるため、より小さい spec に分割する。

---

## History

spec 完了ごとに `history.md` へ 1 行で要約を追記する。
詳細は `history/YYYY-MM-DD--spec-name.md` に記録する。
新しい spec に着手する前に、関連する履歴を確認する。

---

## Completion Signal

受け入れ条件をすべて満たし、テストが成功し、変更をコミットしてプッシュした場合のみ `<promise>DONE</promise>` を出力する。
本当に完了するまでは絶対に出力しない。

---

## Telegram Notifications

Telegram 通知を使う。
環境変数 `TG_BOT_TOKEN` と `TG_CHAT_ID` を利用する。
spec 完了後は Telegram に完了通知を送る。
3 回以上の連続失敗、または `NR_OF_TRIES >= 10` の場合も通知する。

---

## GitHub Issues

`k2works/case-study-sdd-development` の GitHub Issues も作業対象に含める。
`gh issue list --repo k2works/case-study-sdd-development --state open` で確認する。
approval は不要とし、対象 Issue を自律的に選んで進める。

---

## Completion Logs

spec 完了ごとに `completion_log/YYYY-MM-DD--HH-MM-SS--spec-name.md` を作成し、簡潔な完了サマリーを残す。

---

## Ralph Wiggum Version

Upstream: `fstandhartinger/ralph-wiggum`
Commit: `6022995317363dc3dba3aa0100dc3e40ed83dfff`
