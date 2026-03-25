---
title: IT5 開発レビュー
description: イテレーション 5 実装に対する開発レビュー結果
published: true
date: 2026-03-25T00:00:00.000Z
tags:
  - review
  - development-review
editor: markdown
dateCreated: 2026-03-25T00:00:00.000Z
---

# IT5 開発レビュー

## レビュー対象

- 商品マスタ管理
- 出荷実績確定
- 関連する Backend / Frontend 実装とテスト

## 総合評価

`US-00` と `US-10` の主要導線は実装されており、テストも追加されています。ただし、 `US-00` の受け入れ基準にある `新規登録` が実装されていない点と、商品マスタ反映を保証すべき顧客画面が通信失敗時に seed データへ静かにフォールバックする点は、完了扱いにする前に詰めるべきです。

## 指摘事項

1. 高: `US-00` の `新規登録` を開始する導線がありません。[page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L1121) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L1225) [iteration_plan-5.md](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/development/iteration_plan-5.md#L56)  
   商品管理画面は既存商品の `編集` からしか入れず、空状態も「一覧から商品を選択すると編集できます。」で終わっています。 `US-00` の受け入れ基準 1 は「商品一覧から新規登録または編集を開始できる」なので、現状は未達です。

2. 高: 顧客向け商品取得が 1 秒で abort され、失敗時は seed 商品に無言でフォールバックします。[page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/page.tsx#L36) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/page.tsx#L49) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/order/page.tsx#L77) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/order/page.tsx#L96)  
   `US-00` の受け入れ基準 3 は「保存後に受注画面で利用可能な状態が反映される」です。いまは Backend が遅いだけでも旧 seed 商品へ戻るため、商品マスタの最新状態が反映されず、しかも利用者に障害が見えません。

3. 中: 商品マスタ更新の結合テストは `更新` しか見ておらず、 `新規登録` が追加されても安全網がありません。[product.spec.ts](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/test/product.spec.ts#L80)  
   実装が既存商品の更新中心で進んでいるため、将来 `POST /admin/products` に新規追加を入れても、顧客一覧への反映と recipe 参照が壊れていないかを今のテストでは検知できません。

## 推奨対応

- 商品管理に `新規登録` ボタンと初期フォームを追加し、 `productId` を採番または入力できるようにする。
- 顧客向け商品一覧は、通信失敗時に seed へ黙って戻すのではなく、障害表示と再試行導線を出す。 seed fallback を残すなら、明示的に `暫定表示` と分かる UI が必要です。
- `新規登録 -> 顧客商品一覧反映 -> 注文確定 -> 出荷 recipe 参照` の結合観点を追加する。
