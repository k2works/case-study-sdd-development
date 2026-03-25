## コードレビュー結果

### レビュー対象
- `f4c7b14 feat(admin-order): 受注一覧と詳細確認を追加`
- `fd61e15 feat(inventory): 在庫推移表示を追加`

### 総合評価
`IT2` の受け入れ観点はテストで固定されており、`US-03` と `US-04` の最小導線は成立しています。一方で、業務ルールと期間指定の解釈に 2 件の重要なずれがあり、現状のままでは新規受注や在庫確認の結果を業務判断にそのまま使うと誤認を招きます。

### 改善提案（重要度順）

#### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | 新規受注の `shippingDate` を `deliveryDate` と同日にせず、確認画面 / 既存データと整合する算出ルールへ修正する | [order.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/order.service.ts#L68) | xp-programmer, xp-tester, xp-user-representative | `US-02` で登録した受注を `US-03` で確認すると、新規受注だけ出荷日が届け日と同日になります。既存シードは前日出荷で統一されており、注文確認画面の期待ともずれるため、後続業務の判断を誤らせます。 |
| 2 | 在庫推移 API を任意期間の契約に合わせるか、少なくとも対応範囲外の期間を明示的に拒否する | [inventory.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/inventory.service.ts#L22) | xp-architect, xp-tester, xp-user-representative | API は `startDate` と `endDate` を受け取りますが、実際には `2026-04-10` から `2026-04-12` の固定 3 日分だけを切り出して返します。指定期間を自由に変えられるように見えるのに、範囲外では不完全な結果を返すため、在庫判断を誤らせます。 |

#### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `US-03` の API / UI テストに「注文登録後の受注が一覧 / 詳細でどう見えるか」を追加する | [admin-order.spec.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/test/admin-order.spec.ts#L22), [page.spec.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.spec.tsx#L87) | xp-tester | 現在のテストは固定シードデータだけを前提にしており、`US-02` と `US-03` の接続面である新規受注の反映を守れていません。高優先の出荷日不整合も、この結合テストがあれば早く検知できました。 |
| 2 | 在庫推移セクションに `startDate > endDate` の入力検証、読み込み中、取得失敗時の表示を追加する | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L82), [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L200) | xp-technical-writer, xp-user-representative | 現状は無効な期間でも即時に API を呼び、失敗時は何も表示されません。UI 設計の「通信失敗は再試行導線を出す」ともずれており、利用者には空表示と失敗の区別がつきません。 |

#### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `受注一覧` の絞り込み条件を `顧客名` だけでなく、設計書にある `出荷日 / 届け日 / 状態` へ広げるか、MVP 範囲として未対応であることを明記する | [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L130), [order.controller.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/order.controller.ts#L20) | xp-architect, xp-technical-writer | UI 設計とシステムユースケースでは複数条件の絞り込みが示されていますが、実装は `顧客名` のみです。MVP として意図的なら、差分を文書化しておく方が誤解を防げます。 |

### 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | xp-programmer は固定データの最小実装として妥当と評価 | xp-user-representative は業務判断に使うには期間解釈が危険と評価 | 在庫推移 API をどこまで本実装扱いにするか | MVP の最小実装自体は許容できますが、少なくとも「対応範囲外は拒否する」防波堤は入れるべきです。 |

### エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 1 / 中: 0 / 低: 0）</summary>

### 評価サマリー
テストファーストで段階的に実装されており、読みやすい最小コードです。ただし、新規受注作成時の `shippingDate` が既存の業務表現と矛盾しています。

### 良い点
- `AdminPage` の責務は `受注一覧 / 受注詳細 / 在庫推移` にまとまっており、現段階では追いやすいです。
- `getInventoryAlertLabel` を関数として切り出し、テスト可能にしています。

### 改善提案
- 【重要度: 高】([order.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/order.service.ts#L68)) 新規受注の `shippingDate` が `deliveryDate` と同日です。既存データや画面の期待と揃えてください。

### 懸念事項
- `AdminPage` は今後も機能が増えると急速に肥大化します。`US-04` 時点ではまだ許容範囲ですが、次の反復ではコンポーネント分割を検討してよいです。

### スコープ外の発見
- なし。
</details>

<details>
<summary>xp-tester（高: 2 / 中: 1 / 低: 0）</summary>

### 評価サマリー
受け入れ観点を先に固定してから実装しており、TDD の流れは良好です。ただし、重要な結合面と境界条件のテストが抜けています。

### 良い点
- `US-03` と `US-04` の主要シナリオが UI と API の両方で固定されています。
- `getInventoryAlertLabel` の単体テストがあり、表示ルールの意図が読み取れます。

### 改善提案
- 【重要度: 高】([inventory.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/inventory.service.ts#L22)) 期間指定の境界条件テストがありません。現状は固定 3 日分しか返さないため、範囲外指定で壊れます。
- 【重要度: 高】([order.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/order.service.ts#L68)) `POST /customer/orders` 後に `GET /admin/orders` で新規受注を確認する結合テストがなく、出荷日の不整合を見逃しています。
- 【重要度: 中】([admin-order.spec.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/test/admin-order.spec.ts#L22)) 固定シード依存を減らし、登録済みデータを前提にしたテストデータ構築へ寄せると変更に強くなります。

### 懸念事項
- `startDate > endDate` や対象 0 件の在庫推移ケースが未検証です。

### スコープ外の発見
- なし。
</details>

<details>
<summary>xp-architect（高: 1 / 中: 0 / 低: 1）</summary>

### 評価サマリー
MVP の縦切りとしては筋がよいですが、在庫推移 API の契約が UI と実装でずれており、変更容易性よりもその場の固定値に寄っています。

### 良い点
- Backend 側で `InventoryService` を独立させたため、将来の計算ロジック差し替え余地は残っています。
- Controller / Service の分離は一貫しています。

### 改善提案
- 【重要度: 高】([inventory.controller.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/inventory.controller.ts#L9), [inventory.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/inventory.service.ts#L22)) API 契約が「任意期間指定可能」に見えるのに、実体は固定データです。契約を狭めるか、実装を広げるかを揃えるべきです。
- 【重要度: 低】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L130)) `US-03` の絞り込み軸が設計書より少ないため、MVP 差分をドキュメントに明記すると設計との緊張が減ります。

### 懸念事項
- `AdminPage` に複数ユースケースの fetch と表示ルールが集中し始めています。

### スコープ外の発見
- なし。
</details>

<details>
<summary>xp-technical-writer（高: 0 / 中: 1 / 低: 1）</summary>

### 評価サマリー
画面文言は全体に理解しやすいです。一方で、失敗時や未対応範囲の説明が足りず、利用者は「空なのか、壊れているのか」を区別できません。

### 良い点
- `受注一覧`、`受注詳細`、`在庫推移` など見出しは業務用語として自然です。
- 注意表示の文言も短く、一覧上で判読しやすいです。

### 改善提案
- 【重要度: 中】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L82), [page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L221)) 在庫推移の取得失敗や無効期間に対する説明文を追加してください。
- 【重要度: 低】([iteration_plan-2.md](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/docs/development/iteration_plan-2.md#L179)) 実装範囲が UI 設計から一部縮小しているため、計画書か実績メモに「MVP では顧客名絞り込みのみ」などの差分注記があると追跡しやすいです。

### 懸念事項
- ドキュメントなしで理解できる設計を目指すなら、エラー時表示の不足は早めに埋めるべきです。

### スコープ外の発見
- なし。
</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 1 / 低: 0）</summary>

### 評価サマリー
受注スタッフと仕入スタッフが最低限使い始められる形にはなっています。ただし、出荷日と在庫期間は業務判断に直結するので、ここがずれると現場では信用されません。

### 良い点
- 受注一覧から詳細へ入る流れは自然です。
- 在庫推移で `不足見込み` と `廃棄注意` が直接見えるのは、仕入判断に役立ちます。

### 改善提案
- 【重要度: 高】([order.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/order.service.ts#L68)) 新しく入った受注だけ出荷日が同日になるのは、現場では誤りとして扱われます。
- 【重要度: 高】([inventory.service.ts](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/backend/src/inventory.service.ts#L22)) 任意期間を見たいのに、実際は 3 日分だけだと仕入判断に使えません。使えない範囲なら、見せない方が安全です。
- 【重要度: 中】([page.tsx](C:/Users/PC202411-1/IdeaProjects/case-study-sdd-development/apps/frontend/app/admin/page.tsx#L203)) 期間を逆に入れたときの案内がないため、担当者は「データがない」と誤解します。

### 懸念事項
- 仕入判断に関わる機能は「それらしく見える固定値」が最も危険です。

### スコープ外の発見
- なし。
</details>
