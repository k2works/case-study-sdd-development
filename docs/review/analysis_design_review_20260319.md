---
title: 分析成果物レビュー
description: 2026-03-19 時点の要件定義・設計成果物レビュー
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - review
  - analysis
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# レビュー結果

## レビュー対象
- [requirements_definition.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/requirements_definition.md)
- [system_usecase.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/requirements/system_usecase.md)
- [architecture_backend.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/architecture_backend.md)
- [architecture_frontend.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/architecture_frontend.md)
- [architecture_infrastructure.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/architecture_infrastructure.md)
- [data-model.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/data-model.md)
- [domain-model.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/domain-model.md)
- [ui-design.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md)
- [tech_stack.md](/Users/k2works/IdeaProjects/case-study-sdd-development/docs/design/tech_stack.md)

## 総合評価
要件定義から UI までの線は通っており、受注・在庫・発注・出荷の主要フローも一通り揃っています。一方で、データの履歴保持、在庫推移の一意性、外部仕入先の接続境界が曖昧で、運用に入ったあとに壊れやすい箇所が残っています。

## 改善提案（重要度順）

### 高
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | 受注に届け先スナップショットを持たせる | xp-architect | `orders.delivery_address_id` 参照だけでは、届け先の修正で過去受注の表示内容が変わる。注文履歴の正確性を壊すため、履歴固定の住所情報を受注に保持するべき。 |
| 2 | `inventory_projections` に `(flower_material_id, target_date)` の一意制約を追加する | xp-architect | 在庫推移は日別・花材別で 1 件に決め打ちできないと、再計算や重複登録で UI と発注判断が不安定になる。現状は重複防止の根拠がない。 |
| 3 | 仕入先連携の入口を分離し、公開 LB 直結をやめる | xp-architect | 仕入先を `Load Balancer` に直接つなぐ構成は、顧客/管理者と同じ公開面に外部取引先を混在させる。専用の partner API か非同期連携に分けた方が安全で、将来の EDI/API 連携にも伸びる。 |

### 中
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | 技術スタック表に具体的なサポート期限を追記する | xp-architect | `tech_stack.md` は版数方針のみで、EOL 管理に必要な期限がない。更新判断ができず、長期運用のリスクが見えない。 |
| 2 | 在庫推移の再計算トリガーと所有者を明記する | xp-architect | `inventory_projections` を参照モデルにする方針はあるが、誰がいつ更新するかが曖昧。バッチ、イベント、手動更新のどれかを固定しないと整合性が崩れる。 |

### 低
| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | 管理画面の権限境界を画面遷移図に明示する | xp-architect | 受注スタッフとフローリストが同じ管理導線に見える。実装時の認可設計を早めに固定した方がよい。 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | `orders` は届け先 ID 参照で十分 | 届け先は履歴固定で扱うべき | 過去受注の表示内容を変化させるか | 受注時スナップショットを採用する |

## エージェント別フィードバック詳細

<details>
<summary>xp-architect（高: 3 / 中: 2 / 低: 1）</summary>

### 評価サマリー
全体としては、分析から設計への接続ができており、コンテキスト分割も自然です。ただし、運用を始めた瞬間に問題になりやすいデータ履歴と外部連携の境界がまだ甘いです。

### 良い点
- 受注・在庫・仕入・出荷のコンテキスト分割が明確です。
- バックエンドはヘキサゴナル構成で、ドメインを外側から切り離す方針に一貫性があります。
- UI は顧客導線と管理画面を分けており、変更容易性を意識できています。

### 改善提案
- 【重要度: 高】受注に届け先スナップショットを持たせる。
- 【重要度: 高】`inventory_projections` に一意制約を追加する。
- 【重要度: 高】仕入先連携を公開 LB 直結から分離する。
- 【重要度: 中】技術スタック表に EOL 日を入れる。
- 【重要度: 中】在庫推移の更新責任を明示する。
- 【重要度: 低】管理画面の権限境界を可視化する。

### 懸念事項
- 在庫推移が「参照モデル」なのに、更新の真実がどこにあるかが曖昧です。
- 外部仕入先を同一公開面に置くと、認証・監査・障害切り分けが難しくなります。

### スコープ外の発見
- `creating-adr` がまだないため、CQRS 非採用や履歴保持方針の決定を ADR 化する余地があります。

</details>

## 対応方針

- 高の指摘は `修正する` が妥当です。
- 中の指摘は、実装前に方針を確定するか `creating-adr` で固定するのがよいです。
- 低の指摘は、UI 実装に入る前に注記を追加すれば十分です。
