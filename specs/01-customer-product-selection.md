# 01. 顧客が商品一覧から商品を選択できる

## Goal

得意先が注文導線の入口で花束商品を一覧から選択できるようにする。

## Background

- 出典: [イテレーション 1 計画](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/development/iteration_plan-1.md)
- 対応ストーリー: `US-01`
- 対応タスク: `1.1 商品一覧画面と商品選択導線の受け入れテストを追加する`

## Scope

- `apps/frontend` の顧客向けトップまたは商品一覧画面
- 商品一覧表示
- 商品選択操作
- 注文入力画面への遷移

## Acceptance Criteria

- 顧客向け画面で花束商品一覧が表示される
- 各商品に商品名と注文導線へ進む操作が表示される
- 1 つの商品を選択すると注文入力画面へ遷移できる
- 受け入れテストで商品一覧表示と商品選択導線を検証できる

## Verification

- フロントエンドの受け入れテストが追加され、成功する
- `npm run test:frontend` が成功する
- `npm run lint --workspace @fleur-memoire/frontend` が成功する

## Status

COMPLETE

NR_OF_TRIES: 1
