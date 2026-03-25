---
title: IT5 管理画面 UI/UX レビュー
description: イテレーション 5 の管理画面と顧客導線に対する UI/UX レビュー結果
published: true
date: 2026-03-25T00:00:00.000Z
tags:
  - review
  - uiux-review
editor: markdown
dateCreated: 2026-03-25T00:00:00.000Z
---

# IT5 UI/UX レビュー

## レビュー対象

- [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx)
- [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/page.tsx)
- [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/order/page.tsx)
- [globals.css](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/globals.css)
- [ui-design.md](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md)

## 総合評価

管理画面は workbench 型の方向性を維持できており、 `商品管理` と `出荷確定` が同じ画面体系に統合された点は妥当です。一方で、 `新規登録` の入口不足と、顧客画面で通信障害を隠してしまう挙動が、設計書の主要な体験契約から外れています。

## モダンデザイン準拠サマリー

| 評価項目 | 状態 | 備考 |
|---|---|---|
| カラーシステム | OK | 既存トークンとバッジ体系を継承している |
| タイポグラフィ | OK | 既存の見出し階層を維持している |
| Elevation & Surface | OK | 管理画面の panel 構成は維持されている |
| コンポーネント一貫性 | 要改善 | 商品管理だけ `新規登録` 導線が欠ける |
| スペーシング | OK | 既存の panel / table リズムに乗っている |
| レスポンシブ / Adaptive | 要改善 | 商品編集の recipe 入力は小画面で密度が高い |
| ダークモード | 未対応 | 本件では未実装 |
| 状態デザイン（空 / Loading / Error） | 要改善 | 顧客画面で通信障害が可視化されない |

## 指摘事項

1. 高: 商品管理に `新規登録` の入口がありません。[page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L1121) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L1225) [ui-design.md](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L356)  
   UI 設計は `商品マスタ管理` に `[新規登録] [保存]` を持つ前提です。現状は既存行の `編集` しかなく、 `US-00` の第一歩でつまずきます。

2. 中: 顧客画面が通信障害時に seed 商品をそのまま表示し、障害状態を利用者へ伝えません。[page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/page.tsx#L49) [page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/customer/order/page.tsx#L96) [ui-design.md](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L445)  
   設計では通信失敗時に再試行や問い合わせ導線を示す方針です。いまは失敗を見せず通常商品一覧として表示するため、利用者は最新商品か暫定表示か判断できません。

3. 中: 管理画面の初期表示は依然として固定で `受注管理` です。[page.tsx](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L129) [ui-design.md](/C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L72)  
   UI 設計では役割別に初期 workbench を分ける想定です。 `IT5` で `商品管理` と `出荷確定` が増えたことで、役割に応じた初期表示の必要性はむしろ高くなっています。

## 推奨対応

- 商品管理に `新規登録` ボタンを追加し、編集フォームを `新規 / 編集` の両モードに分ける。
- 顧客画面は通信障害時に `障害案内` 相当のメッセージ、再試行、電話受付導線を表示する。
- 管理画面は role query parameter か role selector を起点に、初期 workbench を切り替えられるようにする。
