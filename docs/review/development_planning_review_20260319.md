---
title: 開発計画レビュー 2026-03-19
description: リリース計画およびイテレーション 1 計画のレビュー結果
published: true
date: 2026-03-19T00:00:00.000Z
tags:
  - review
  - development-review
editor: markdown
dateCreated: 2026-03-19T00:00:00.000Z
---

# 開発成果物レビュー結果

## レビュー対象

- `docs/development/release_plan.md`
- `docs/development/iteration_plan-1.md`
- `docs/development/index.md`
- `docs/index.md`
- `mkdocs.yml`

## 総合評価

計画の骨格はできており、`IT1` の対象ストーリー、期間、タスク分解、ナビゲーション反映まで一通り揃っています。一方で、`US-02` を `IT1` 完了対象として扱うか、部分実装として扱うかが文書間で揺れており、そのまま運用すると GitHub Project、実績計上、受け入れ判定が破綻します。

## 改善提案（重要度順）

### 高（着手前に修正すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 | 対応方針 |
|---|------|------|--------|------|----------|
| 1 | `IT1` のコミットメント対象から `US-02` を外すか、逆に `受注確定と完了画面` まで `IT1` に含めるかを統一する | `docs/development/iteration_plan-1.md:35`, `docs/development/iteration_plan-1.md:46`, `docs/development/iteration_plan-1.md:169`, `docs/requirements/user_story.md:39` | xp-programmer, xp-tester, xp-architect, xp-user-representative | `対象ストーリー` では `US-02` 全量を取っているのに、成功基準とテスト方針では `US-02` の前半しか約束していません。ストーリー完了判定と SP 計上ができなくなります。 | 修正する |
| 2 | リリース計画の `IT1` 概要を、`iteration_plan-1.md` と同じ粒度に揃える | `docs/development/release_plan.md:242`, `docs/development/release_plan.md:243`, `docs/development/iteration_plan-1.md:168` | xp-architect, xp-technical-writer, xp-user-representative | `release_plan` は `注文 API と受注登録` を `IT1` の主タスクとしている一方、`iteration_plan-1` は `API スタブ` とし、本実装は `IT2` 送りです。親計画と子計画でスコープが矛盾しています。 | 修正する |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 | 対応方針 |
|---|------|------|--------|------|----------|
| 1 | 開発索引の `累計` 計画 SP を `8` に更新する | `docs/development/index.md:25`, `docs/development/index.md:26` | xp-programmer, xp-technical-writer | `IT1` の計画 SP を追加したのに、累計が `0` のままです。進捗サマリーの数値整合が崩れています。 | 修正する |
| 2 | `IT1` の成功基準に、未達を許容する受け入れ基準があるなら明示的に `分割ストーリー` または `スパイク` と記載する | `docs/development/iteration_plan-1.md:34`, `docs/development/iteration_plan-1.md:169` | xp-tester, xp-user-representative | いまの記述では「`US-02` をやる」と「`US-02` を途中までやる」が混在しています。運用上は部分完了の扱いを明示する必要があります。 | 修正する |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 | 対応方針 |
|---|------|------|--------|------|----------|
| 1 | `mkdocs.yml` の `site_name` 変更が今回スコープに含まれるなら、変更理由を別途残す | `mkdocs.yml:1` | xp-technical-writer | イテレーション計画追加とは直接関係が薄く、意図が追えません。レビュー観点ではノイズになりやすい変更です。 | 保留 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | プログラマー視点では `US-02` を分割して `IT1` を軽くしたい | ユーザー代表視点では `US-02` を完了扱いに見せるのは避けたい | ストーリー分割の妥当性 | `US-02A` 相当へ明示分割するか、`IT1` では `US-01` のみに絞る |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 1 / 中: 1 / 低: 0）</summary>

### 評価サマリー

タスク分解は具体的ですが、ストーリー境界の切り方が曖昧です。完了条件が曖昧なまま進めると、実装後に「どこまで終わったか」が判定できません。

### 良い点

- `IT1` の期間、SP、理想時間が明記されている。
- タスクは実装単位まで十分に分解されている。

### 改善提案

- 【重要度: 高】`docs/development/iteration_plan-1.md:35` `US-02` を途中までしかやらないなら、対象ストーリー一覧を分割表現に改めるべきです。
- 【重要度: 中】`docs/development/index.md:26` 累計 SP が未更新です。

### 懸念事項

- `US-02` を 3 SP で計上しつつ未完了のまま次イテレーションへ送ると、実績が歪みます。

### スコープ外の発見

- なし。

</details>

<details>
<summary>xp-tester（高: 1 / 中: 1 / 低: 0）</summary>

### 評価サマリー

テスト起点の考え方は見えますが、受け入れ判定の単位がストーリーと一致していません。`US-02` の acceptance が `IT1` では満たせない計画です。

### 良い点

- 受け入れテスト、ユニットテスト、Playwright スモークまで計画に入っている。
- Day 単位で品質タスクが押さえられている。

### 改善提案

- 【重要度: 高】`docs/development/iteration_plan-1.md:69` `US-02` の 3 つ目の受け入れ基準を `IT1` で満たさないなら、ストーリー完了対象から外すべきです。
- 【重要度: 中】`docs/development/iteration_plan-1.md:34` 成功基準を「受け入れ基準を満たす」に寄せるか、「部分完了」に明確化するべきです。

### 懸念事項

- CI スモークがあっても、ストーリー受け入れの完了判定は代替できません。

### スコープ外の発見

- なし。

</details>

<details>
<summary>xp-architect（高: 1 / 中: 0 / 低: 0）</summary>

### 評価サマリー

親計画と子計画の関係に破綻があります。ロードマップとイテレーション計画のスコープが一致していないため、進捗管理の source of truth が複数化しています。

### 良い点

- `IT1` で API スタブに留める判断自体は妥当です。
- フロントエンドとバックエンド境界を分けて記述している点はよいです。

### 改善提案

- 【重要度: 高】`docs/development/release_plan.md:243` と `docs/development/iteration_plan-1.md:177` を一致させるべきです。`IT1` の API 実装範囲をどちらか一方に固定してください。

### 懸念事項

- Project 側では `US-02` が `IT1` 完了扱いになるため、後続のベロシティ計測が壊れます。

### スコープ外の発見

- なし。

</details>

<details>
<summary>xp-technical-writer（高: 1 / 中: 1 / 低: 1）</summary>

### 評価サマリー

文書構造は整理されていますが、同じ概念が文書ごとに違う意味で使われています。読者が「`IT1` で何が終わるのか」を一意に理解できません。

### 良い点

- `docs/index.md` と `mkdocs.yml` の導線更新は適切です。
- `iteration_plan-1.md` 単体の読みやすさは十分です。

### 改善提案

- 【重要度: 高】`docs/development/iteration_plan-1.md:46` と `docs/development/iteration_plan-1.md:169` の言い回しを統一し、`US-02` の扱いを一意にしてください。
- 【重要度: 中】`docs/development/index.md:26` の累計値を更新してください。
- 【重要度: 低】`mkdocs.yml:1` の `site_name` 変更理由を別途残してください。

### 懸念事項

- 文書だけ読んだ関係者が、`IT1` 完了時点で受注確定まで動くと誤解する可能性があります。

### スコープ外の発見

- なし。

</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 1 / 低: 0）</summary>

### 評価サマリー

ユーザー価値の順番づけは妥当ですが、完了宣言の仕方が危険です。営業や店舗運用の認識では、`注文を確認して確定したい` は「確定まで動く」が前提です。

### 良い点

- `IT1` を顧客導線に集中させている点は価値優先として分かりやすいです。
- `IT2` に受注確認と在庫推移を分けた構成も理解しやすいです。

### 改善提案

- 【重要度: 高】`docs/development/iteration_plan-1.md:46` `US-02` を対象に含めるなら、確定まで終えるべきです。
- 【重要度: 高】`docs/development/release_plan.md:242`-`244` と `docs/development/iteration_plan-1.md:168`-`170` の矛盾をなくしてください。
- 【重要度: 中】部分完了を許すなら、ストーリーではなく `探索タスク` や `前半導線` として表現してください。

### 懸念事項

- GitHub Project で `US-02` が `IT1` にあると、ステークホルダーは「注文確定まで動く」と読みます。

### スコープ外の発見

- なし。

</details>
