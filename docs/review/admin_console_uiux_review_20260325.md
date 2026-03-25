## UI/UX レビュー結果

### レビュー対象
- [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx)
- [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md)

### 総合評価
`US-03` と `US-04` の機能は同一画面から操作でき、最低限の業務確認は可能です。一方で、管理画面として期待される `役割別ワークベンチ`、`一覧 + 詳細の 2 ペイン構成`、`状態デザイン` がまだ弱く、受注スタッフと仕入スタッフの実作業を支える UI としては情報設計が浅いです。

### モダンデザイン準拠サマリー

| 評価項目 | 状態 | 備考 |
|---|---|---|
| カラーシステム | 要改善 | 基本トークンはありますが、管理画面固有の状態色やセマンティックカラーが未設計です。 |
| タイポグラフィ | 要改善 | `hero` は階層化されていますが、管理作業領域は見出し・本文・補助情報のスケール差が弱いです。 |
| Elevation & Surface | 要改善 | `hero` 以外は素の `table` / `input` が多く、作業面の階層が視覚化されていません。 |
| コンポーネント一貫性 | 要改善 | 顧客画面にはカード / フォームスタイルがある一方、管理画面には再利用された見た目の部品がありません。 |
| スペーシング | 要改善 | 管理画面専用の余白ルールがなく、要素が連続して見えます。 |
| レスポンシブ / Adaptive | 要改善 | 管理テーブルの縮退戦略がなく、Compact 幅での情報優先順位が未設計です。 |
| ダークモード | 未対応 | `color-scheme: light` 固定です。 |
| 状態デザイン（空 / Loading / Error） | 要改善 | 空と一部エラーはありますが、Loading と再試行導線が不足しています。 |

### 改善提案（重要度順）

#### 高（リリース前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `受注管理` と `在庫管理` を同一の縦積み画面で混在させず、少なくともタブ / サイドナビ / セクション切替で役割別ワークベンチとして分離する | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L137), [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L58) | xp-interaction-designer, xp-user-representative | UI 設計では `受注スタッフ` と `仕入スタッフ` の初期表示が分かれており、管理画面導線も `受注一覧 → 在庫推移` の遷移を前提にしています。現状は 2 つの職務を 1 画面に同時表示しており、業務コンテキストの切り替えコストが高いです。 |
| 2 | `受注一覧 + 受注詳細` を上下の追記ではなく、設計どおり同時に見渡せる 2 ペインへ寄せる | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L157), [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L194), [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L62) | xp-interaction-designer, xp-user-representative | 詳細が一覧の下に追加されるため、件数が増えると選択結果と一覧の関係を見失います。問い合わせ対応中の受注スタッフは一覧比較と詳細確認を往復するため、同時可視性が重要です。 |

#### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | 管理画面用の Surface / Table / Filter / Status Badge の見た目を `globals.css` へ追加し、素の HTML テーブルを脱却する | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L161), [globals.css](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/globals.css#L31) | xp-interaction-designer | 顧客導線にはカード / フォームの視覚ルールがありますが、管理画面は `hero` 以外が未整形です。M3 の Surface / Elevation / Component consistency の観点で弱いです。 |
| 2 | `在庫推移` の `不足見込み / 廃棄注意` をテキストだけでなく、バッジ・色・アイコンの複合表現にする | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L255), [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L429) | xp-interaction-designer, xp-user-representative | UI 設計では注意対象を識別表示する前提で、アクセシビリティ契約でも `色だけに依存しない` ことが求められています。現状は単なる本文テキストで、一覧表の中で視線誘導が弱いです。 |
| 3 | Loading と再試行アクションを明示し、`空` と `失敗` を見分けられるようにする | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L62), [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L86), [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L446) | xp-user-representative | 実務では通信遅延や一時失敗が起こります。現状は注文一覧側に失敗表示がなく、在庫推移側もメッセージだけで `次に何をすべきか` が分かりません。 |

#### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | 日付入力は即時 fetch ではなく `表示` アクションに寄せ、設計書のメンタルモデルと合わせる | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L83), [ui-design.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/design/ui-design.md#L369) | xp-user-representative | UI 設計では `期間 ... [表示]` の形です。入力途中で自動更新されるより、期間を決めてから表示する方が業務ユーザーには予測しやすいです。 |
| 2 | 管理画面でもレスポンシブ時の縮退ルールを定める | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L157), [globals.css](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/globals.css#L243) | xp-interaction-designer | 現在のメディアクエリは `hero` 系に限定され、表形式情報の Compact 表示が未設計です。 |

### 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | xp-interaction-designer はタブ / ナビ導入で役割を明確化したい | xp-user-representative は MVP では 1 画面でも使い始められると評価 | MVP でどこまで画面分離すべきか | 画面分割までは不要でも、少なくとも `受注管理` / `在庫管理` を明示切替にして同時表示は避けるべきです。 |

### エージェント別フィードバック詳細

<details>
<summary>xp-interaction-designer（高: 2 / 中: 2 / 低: 1）</summary>

### 評価サマリー
機能は成立していますが、情報設計はまだ「管理ワークベンチ」ではなく「機能を縦に並べた画面」です。設計書と比較すると、役割分離、2 ペイン、状態デザインが不足しています。

### 良い点
- 見出しと言葉遣いは業務用語に揃っていて理解しやすいです。
- `期間開始 / 期間終了` のようにフォームラベルは明示されています。

### モダンデザイン準拠状況
- `hero` だけは Surface と Elevation が表現されています。
- それ以外の作業領域は `Surface`, `State`, `Badge`, `Adaptive Layout` が未整備です。

### 改善提案
- 【重要度: 高】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L137)) 役割別ワークベンチとしての切替構造を導入してください。
- 【重要度: 高】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L157)) 一覧と詳細を同時可視の 2 ペインへ寄せてください。
- 【重要度: 中】([globals.css](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/globals.css#L31)) 管理画面用のカード / テーブル / バッジスタイルが必要です。
- 【重要度: 中】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L255)) 注意表示を視覚的に強めてください。
- 【重要度: 低】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L83)) `表示` ボタンを置く方が操作の意味が伝わります。

### 懸念事項
- Compact 幅では 2 つの表がそのまま縦に伸び、情報探索コストが高くなります。

### スコープ外の発見
- 顧客導線側に比べて管理画面のデザイン言語が未整備です。
</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 2 / 低: 1）</summary>

### 評価サマリー
受注も在庫も一応見られますが、現場で使うと「今は何の仕事をしている画面か」がぶれます。問い合わせ対応と仕入判断は頭の使い方が違うので、切替と見通しが必要です。

### 良い点
- `受注詳細` で必要情報は最低限そろっています。
- `在庫推移` で数量と注意文言が同じ表に見えているのは分かりやすいです。

### モダンデザイン準拠状況
- 他のモダンな業務アプリで期待する `切替`, `再試行`, `視線誘導` がまだ弱いです。

### 改善提案
- 【重要度: 高】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L216)) `在庫推移` を `受注一覧` の同じ面に常設しないでください。受注確認中に在庫情報が常に見えている必要はありません。
- 【重要度: 高】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L194)) 詳細は一覧の近くで見たいです。下に流れると、どの行を見ていたかを失います。
- 【重要度: 中】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L267)) エラー時は `再試行` まで欲しいです。
- 【重要度: 中】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L255)) 注意対象は「ぱっと見」で分かる必要があります。
- 【重要度: 低】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L219)) 期間を入れてから `表示` したいです。

### 懸念事項
- 実務では 1 日に何十件も見るので、今の素の表は疲れます。

### スコープ外の発見
- `受注一覧` のフィルターがまだ顧客名だけなので、問い合わせ対応では絞り込み不足を感じそうです。
</details>
