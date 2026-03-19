# 03. 顧客注文導線の最小スモークテストを整備する

## Goal

`US-01` の入口導線が継続的に壊れていないことを、最小の E2E シナリオで確認できるようにする。

## Background

- 出典: [イテレーション 1 計画](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/development/iteration_plan-1.md)
- 対応ストーリー: `US-01`
- 対応タスク: `2.2 顧客注文導線の Playwright スモークテストを整備する`
- 成功基準: `顧客注文導線の最小 E2E シナリオが CI で実行可能になる`

## Scope

- `apps/frontend` の顧客注文導線
- Playwright の最小セットアップ
- CI で実行できるスモークテストコマンド

## Acceptance Criteria

- Playwright の設定が追加される
- 商品一覧から注文入力画面までの最小導線を確認するスモークテストが追加される
- ローカルでスモークテストを実行できる
- CI から実行できるコマンドが定義される

## Verification

- E2E テストコマンドが追加される
- スモークテストが成功する
- 必要なドキュメントまたはスクリプトに実行手順が反映される

## Status

COMPLETE

NR_OF_TRIES: 1
