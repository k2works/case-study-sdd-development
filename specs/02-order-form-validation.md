# 02. 顧客が注文入力フォームを完了できる

## Goal

得意先が届け日、届け先、メッセージを入力し、必須項目エラーを確認できるようにする。

## Background

- 出典: [イテレーション 1 計画](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/development/iteration_plan-1.md)
- 対応ストーリー: `US-01`
- 対応タスク: `1.2 注文入力フォームと必須項目バリデーションを実装する`
- 対応タスク: `1.3 届け日、届け先、メッセージ入力の画面ロジックを整備する`
- 対応タスク: `1.4 注文入力 Feature のユニットテストを追加する`

## Scope

- `apps/frontend` の注文入力画面
- 届け日、届け先、メッセージ入力
- 必須項目バリデーション
- フォームロジックの単体テスト

## Acceptance Criteria

- 顧客が届け日を入力できる
- 顧客が届け先を入力できる
- 顧客がメッセージを入力できる
- 必須項目が未入力のまま送信操作をすると画面上にエラーが表示される
- フォームロジックのユニットテストで入力とエラー表示を検証できる

## Verification

- フロントエンドのユニットテストが追加され、成功する
- `npm run test:frontend` が成功する
- `npm run typecheck:frontend` が成功する
- `npm run lint --workspace @fleur-memoire/frontend` が成功する

## Status

COMPLETE

NR_OF_TRIES: 1
