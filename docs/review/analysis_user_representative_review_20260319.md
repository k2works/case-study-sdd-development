---
title: 分析成果物レビュー - ユーザー代表
description: 要件定義、ユースケース、UI 設計、ドメインモデルの利用者視点レビュー
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
- `docs/design/domain-model.md`

### 総合評価
業務の骨格はよく整理されています。注文、在庫、発注、出荷の流れは追いやすく、現場での使い道も想像しやすいです。

一方で、実運用の担当者が誰になるのかと、商品や花材の保守を誰が行うのかが曖昧なまま残っています。ここを詰めないと、実際の現場では「誰がやるのか」で止まりやすいです。

### 改善提案（重要度順）

#### 高
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | `出荷を確定する` の主担当を統一してください。`フローリスト` と `受注スタッフ` が混在しています。 | [business_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/business_usecase.md:67), [system_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/system_usecase.md:29), [user_story.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/user_story.md:113), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:39) | 出荷場で実際に操作する人が不明だと、現場で引き継ぎが発生した時に責任分界が崩れます。 |
| 2 | 商品マスタと花材マスタの保守ストーリーと画面を追加してください。現状は「登録済み」が前提ですが、誰が登録・更新するかがありません。 | [business_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/business_usecase.md:79), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:24) | 花束の追加、価格変更、構成変更ができないと、店舗運営が止まります。実務では最優先の保守作業です。 |

#### 中
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | `届け日を変更する` の担当を「得意先依頼」と「受注スタッフ操作」のどちらに寄せるか決めてください。 | [business_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/business_usecase.md:61), [system_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/system_usecase.md:23), [user_story.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/user_story.md:139) | 電話受付なのか、顧客が自分で変更するのかで、案内も画面も変わります。現場ではここが曖昧だと問い合わせ対応がぶれます。 |
| 2 | `注文入力` の画面で、届け先の再利用と新規入力の切り替えをもう少し明示してください。 | [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:145), [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:172) | 住所入力は手間が大きいので、どこで履歴を選ぶかが一目で分からないと離脱しやすいです。 |

#### 低
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | `在庫推移` 画面に、空在庫や不足見込みのときの具体的な案内を追加してください。 | [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md:267) | 現場では「不足あり」だけでは次の行動が分かりにくいです。発注へ誘導する一言があると迷いが減ります。 |

### 懸念事項
- 受注一覧、在庫推移、出荷対象が別画面に分かれているため、少人数運用では画面遷移が多くなりそうです。
- `出荷対象確認` と `出荷確定` の担当と導線がずれると、ピーク時に操作のたらい回しが起きやすいです。
- 商品と花材の保守が未定だと、初期リリース後の運営にすぐ支障が出ます。

### スコープ外の発見
- `非機能要件` と `運用要件` がまだ未着手なので、現場運用で必要なバックアップ、監視、障害時の連絡手順がまだ見えません。
- `商品マスタ管理` が要件に出てこないため、今回はレビュー対象外ですが、実運用では追加が必要です。
