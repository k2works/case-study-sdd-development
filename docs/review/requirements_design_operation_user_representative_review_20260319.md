---
title: 分析成果物レビュー - ユーザー代表
description: 要件定義、ユースケース、UI 設計、非機能要件、運用要件の利用者視点レビュー
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - review
  - analysis
  - user-representative
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# レビュー結果

### レビュー対象
- `docs/requirements/requirements_definition.md`
- `docs/requirements/business_usecase.md`
- `docs/requirements/system_usecase.md`
- `docs/requirements/user_story.md`
- `docs/design/ui-design.md`
- `docs/design/non_functional.md`
- `docs/design/operation.md`

### 総合評価
業務の流れは概ねつながっており、注文から在庫、発注、出荷までの全体像は利用者に伝わります。  
ただし、現場で実際に詰まりやすい「結束作業」と「出荷確定」の責務分担、障害時の顧客導線がまだ曖昧で、運用開始後に手戻りが出やすいです。

### 改善提案（重要度順）

#### 高
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | `BUC-08 花束を結束して出荷する` を `system_usecase` / `user_story` / `ui-design` にも追加してください。現状は業務上重要な結束作業がシステム境界で抜けています。 | [business_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/business_usecase.md:225), [system_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/system_usecase.md:30), [user_story.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/user_story.md:125), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:41) | 現場では「出荷対象を見る」だけでは完結せず、フローリストの結束完了がないと受注スタッフの出荷確定へ進めません。ここが抜けると、実運用で紙運用や口頭引き継ぎに戻りやすいです。 |

#### 中
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | 顧客向け障害時導線を UI に明示してください。運用要件では「トップで障害告知し、電話受付へ誘導する」とあるため、注文画面の通信失敗メッセージだけでは不足です。 | [operation.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/operation.md:169), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:153) | 障害時にユーザーが再試行を繰り返すだけだと、注文を諦めるか迷子になります。電話誘導の表示が必要です。 |
| 2 | `出荷確定` の前提となる「フローリスト結束完了」の状態遷移を定義してください。 | [business_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/business_usecase.md:241), [system_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/system_usecase.md:31), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:123) | 出荷確定の画面はあっても、現場でどの状態を見れば確定してよいかが明確でないと、忙しい日に確認待ちが発生します。 |

### 懸念事項
- 少人数運用では、出荷対象確認と出荷確定を別担当にした場合に、確認済みかどうかの伝達がボトルネックになりやすいです。
- 顧客識別をメールアドレスと電話番号に頼るため、入力不備時の再案内ルールが弱いと履歴再利用が使われません。
- 障害時の電話受付導線が文書上はある一方、画面・メッセージ・担当者の見え方がまだ揃っていません。

### スコープ外の発見
- `docs/requirements/index.md` では要件定義系のみ案内しており、設計ドキュメントとの往復導線は弱いです。
- `non_functional.md` は数値目標が明確ですが、これを日常運用で誰が確認するかの画面上の見え方は未整理です。
