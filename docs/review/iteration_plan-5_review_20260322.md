# コードレビュー結果: IT5 イテレーション計画

## レビュー対象

- docs/development/iteration_plan-5.md（新規作成）
- docs/development/release_plan.md（更新）

## 総合評価

IT5 計画は全体として堅実で、ベロシティに対して保守的な 11SP 設定、技術負債の先行解消、TDD ファーストの姿勢が評価できる。ただし、**PurchaseOrder の残数量追跡機能の欠落**（入荷登録の前提）、**PurchaseOrderStatus の PARTIAL→PARTIAL 遷移が不可能**（複数回部分入荷）、**Order に prepare() メソッドが存在しない**（結束完了の前提）の 3 つの設計上の課題が実装時にブロッカーとなる。また IT6 の 16SP はベロシティ超過であり再調整が必要。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | PurchaseOrder に入荷済み数量追跡（arrivedQuantity / remainingQuantity()）を追加する設計をタスク 1.1 に明記 | タスク 1.1 | Programmer, Tester, Architect | 現在の PurchaseOrder には入荷済み累計がなく、残数量超過チェックが実装不能 |
| H-2 | PurchaseOrderStatus に PARTIAL→PARTIAL 遷移を追加（複数回部分入荷対応） | タスク 1.1 | Tester | 現在は PARTIAL→RECEIVED のみ許可。2 回目の部分入荷でエラーになる |
| H-3 | Order に prepare() メソッド追加をタスク 3.1 に明記 | タスク 3.1 | Tester, Architect | accept() のみ実装で ACCEPTED→PREPARING 遷移メソッドがない |
| H-4 | タスク 0.2 の見積もりを 2.5h→3.5h に上方修正（orders + product_compositions JOIN の複雑性） | タスク 0.2 | Programmer | 現在 return 0 のスタブ。TDD + テストデータセットアップに 2.5h は楽観的 |
| H-5 | user_story.md との受入条件の整合（US-012 のロール条件、「本日」vs「翌日」の表現統一） | ストーリー詳細 | TechWriter | user_story.md と IT5 で表現が食い違っている |
| H-6 | release_plan.md の進捗テーブル IT6 計画 SP を 13→16 に更新 | release_plan.md | Programmer, TechWriter | 本文と進捗テーブルで矛盾 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | タスク 3.1 を「3.1a: 在庫消費戦略（FIFO）ドメインサービス TDD」と「3.1b: 結束ステータス遷移 TDD + Order.prepare()」に分割 | タスク 3.1 | Programmer | 複合ロジック（FIFO 消費 + ステータス遷移）が 3h に詰め込まれている |
| M-2 | BundlingQueryService を application 層（application/bundling/）に配置することを明記 | タスク 2.2 | Architect | 複数集約横断の読み取り専用オペレーション。ドメイン層に置くと依存が増える |
| M-3 | Stock.consume 後に quantity==0 の場合の扱い（削除 or isEmpty()）を明確化 | タスク 3.1 | Programmer, Architect, Tester | domain_model.md に「0 になったら削除」と記載あるが、実装に反映されていない |
| M-4 | 統合テスト（4.1）にトランザクション異常系を追加し 2h→3h に増加 | タスク 4.1 | Tester | 途中在庫不足時のロールバック確認、楽観的ロック競合テストが未計画 |
| M-5 | フロントエンドテスト（4.3）を 2h→3.5h に増加し対象画面を明記（S-302, S-401） | タスク 4.3 | Programmer, Tester | 「コンポーネントテスト拡充」が曖昧。IT4 のアイスクリームコーン傾向が未解消 |
| M-6 | 結束完了 API パスを `PUT /api/v1/admin/orders/{orderId}/bundle` に変更検討 | タスク 3.3 | Architect | bundling テーブル/エンティティが存在しないのにトップレベルリソースにしている。結束は受注のサブアクション |
| M-7 | IT6 の 16SP はベロシティ超過。US-008（8SP）を IT7 に移動し IT6=8SP を検討 | release_plan.md | Programmer | IT4 で 16→13SP に下げた教訓が活かされていない。持続可能なペースの原則に反する |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | SecurityConfig の bundling パスルールは `/api/v1/admin/**` のキャッチオールより前に追加 | タスク 2.4 | Architect | Spring Security のルール評価順序を誤ると OWNER のみアクセス可能になる |
| L-2 | 境界値テストケースを計画に明示（残数量ちょうど、+1 超過、最小入荷 1、消費で 0 等） | タスク 1.1, 3.1 | Tester | TDD 実施時のテストケースリストが暗黙的 |
| L-3 | release_plan.md のバーンダウン計画線を IT5=11SP に修正（35→24→8→0） | release_plan.md | TechWriter | 現在 IT5 で 14SP 消化の前提になっている |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | Architect: 結束完了 API は `PUT /api/v1/admin/orders/{orderId}/bundle`（受注のサブアクション） | 計画: `PUT /api/v1/admin/bundling/{orderId}/complete`（bundling トップレベル） | リソース設計 | Architect 案を推奨。bundling テーブルがないためトップレベルリソースとしての実体がない |
| 2 | Programmer: IT6 を 8SP に縮小（US-008 を IT7 に移動） | 計画: IT6=16SP | スコープ調整 | IT4 の教訓から Programmer 案を推奨。ただし IT6 開始時に再判断可能 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 1 / 低: 1）</summary>

### 評価サマリー
全体として堅実な計画。11SP はベロシティ平均に対して保守的で、技術負債の先行解消、既存コードとの整合性が良い。

### 良い点
- ベロシティに対して保守的な SP 設定（1SP のバッファ）
- 技術負債を Day 1-2 に配置し基盤を固める姿勢
- 既存の PurchaseOrder.receiveAll()/receivePartial()、Stock.consume() を活用（YAGNI）
- 依存関係の明示

### 改善提案
- 【高】Arrival ドメインエンティティのパッケージ配置判断をタスク 1.1 に明記
- 【高】タスク 0.2 の工数を 3.5h に上方修正
- 【高】release_plan.md 進捗テーブルの IT6 SP を更新
- 【中】US-013 の在庫消費ロジックを FIFO 戦略サービスとステータス遷移に分割
- 【低】テストタスク 4.3 の対象画面を明記

### 懸念事項
- IT6 の 16SP はベロシティ超過。持続可能なペースの原則に反する
- Stock.consume 後に quantity==0 のステータス管理が未実装
- ArrivalEntity が孤立している（JPA エンティティのみ、ドメインモデルなし）

### スコープ外の発見
- Stock.consume() で quantity==0 でも AVAILABLE のまま
- MVP マイルストーンの定義（US-011 含むか否か）が曖昧

</details>

<details>
<summary>xp-tester（高: 3 / 中: 2 / 低: 1）</summary>

### 評価サマリー
テスト計画の構造は健全で TDD タスクが適切に組み込まれている。ただし PurchaseOrder の残数量追跡機能欠落、PARTIAL→PARTIAL 遷移不可、Order.prepare() 不在の 3 つが設計ブロッカー。

### 良い点
- TDD タスクが SP 内に含まれ、テストファーストが徹底
- テストピラミッドのバランスが適切（ユニット > 統合 > E2E）
- トランザクション要件が受入条件に明記
- リスク表にデッドロックリスクが記載

### 改善提案
- 【高】PurchaseOrder に入荷済み数量追跡を追加（タスク 1.1 の前提）
- 【高】PurchaseOrderStatus に PARTIAL→PARTIAL 遷移追加
- 【高】Order に prepare() メソッド追加をタスク 3.1 に明記
- 【中】境界値テストケースの明示的リストアップ
- 【中】フロントエンドテストのアイスクリームコーン傾向改善（4.3 を 3.5h に）
- 【低】成功基準とテストタスクの対応表を追加

### 懸念事項
- TZ 依存リスク（結束対象の「翌日」判定で Clock 注入パターン未適用の箇所あり）
- InventoryQueryPort 未実装が Day 1-2 のブロッカー
- PurchaseOrderQueryService のテスト欠落（IT4 負債）が IT5 タスクに未反映
- Stock.consume 後 quantity=0 でステータスが AVAILABLE のまま

### 工数影響
元 40h → 修正 44h（+4h）。バッファ内で吸収可能。

</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 1）</summary>

### 評価サマリー
ヘキサゴナルアーキテクチャと DDD に沿った設計。ただし API パスの設計書との不一致、結束ドメインの境界コンテキスト位置づけ、Stock.consume の集約一貫性に改善が必要。

### 良い点
- InventoryQueryPort 技術負債解消を先行させる判断が正しい
- Stock.consume のドメインロジックが既に実装済み
- OrderStatus の遷移制御が堅牢（ACCEPTED→PREPARING が許可済み）
- PurchaseOrder に receivePartial()/receiveAll() が準備済み

### 改善提案
- 【高】API パスの設計書（architecture_backend.md）との不一致を解消
- 【高】結束完了 API を PUT /api/v1/admin/orders/{orderId}/bundle に変更
- 【高】Stock.consume 後の quantity==0 の扱いを明確化（isEmpty() メソッド追加）
- 【中】BundlingQueryService を application 層に配置
- 【中】Arrival のパッケージ配置を ADR として記録
- 【中】PurchaseOrder に remainingQuantity() メソッド追加
- 【低】SecurityConfig のルール追加順序に注意

### 懸念事項
- 結束完了のトランザクションでデッドロックリスク（Stock に @Version なし）
- InventoryQueryPort.getExpectedArrivals の「入荷予定」と「入荷実績」の区別
- Order.markAsPreparing() がドメインモデル設計書にあるが実装にない

### スコープ外の発見
- Order.accept() が LocalDateTime.now() 直接呼び出し（Clock 注入パターン未適用）
- architecture_backend.md のエンドポイント表が実装の /admin/ プレフィックスと体系的に乖離

</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 3 / 低: 2）</summary>

### 評価サマリー
IT4 のフォーマットを踏襲しつつ適切に構成されている。ただし user_story.md との表現の食い違いと release_plan.md の整合性に改善が必要。

### 良い点
- 変更経緯の明示（US-014 移動理由とベロシティ調整根拠）
- 依存関係セクション（IT4 にはなかった良い追加）
- 成功基準が具体的で検証可能
- IT4 技術負債を SP 外として正直に計上

### 改善提案
- 【高】user_story.md との受入条件の不一致を解消（US-012 ロール条件、「本日」vs「翌日」）
- 【高】release_plan.md の IT4 セクションから US-011 を取消線にするか削除
- 【中】release_plan.md の IT6 計画 SP 矛盾（本文 16 vs 進捗表 13）を解消
- 【低】バーンダウンチャート計画線を IT5=11SP に修正
- 【低】フォーカスファクター（理想時間/実稼働時間）の注記を追加

### 懸念事項
- Phase と IT の対応関係が読者にわかりにくい（IT5 で Phase 1 の US-011 と Phase 2 の US-012/013 を混在）
- 工数合計 40h と 2 週間 80h のギャップが説明されていない

### スコープ外の発見
- release_plan.md のバーンダウン計画線が IT5 で 14SP 消化前提（実際は 11SP）
- IT4 の成功基準に「入荷実績を登録すると在庫が更新される」が残っている（US-011 は IT5 移動済み）

</details>

## 対応方針

| # | 指摘 | 方針 |
|---|------|------|
| H-1 | PurchaseOrder に remainingQuantity() 追加 | **対応済み** — タスク 1.1 に明記 |
| H-2 | PARTIAL→PARTIAL 遷移追加 | **対応済み** — タスク 1.1 に明記 |
| H-3 | Order.prepare() 追加 | **対応済み** — タスク 3.1b に明記 |
| H-4 | タスク 0.2 見積もり上方修正 | **対応済み** — 2.5h→3.5h |
| H-5 | user_story.md との整合 | **対応済み** — US-012 にロール条件追加 |
| H-6 | release_plan.md 進捗テーブル | **対応済み** — IT6 を 16 に更新 |
| M-1 | タスク 3.1 分割 | **対応済み** — 3.1a（FIFO）+ 3.1b（ステータス遷移） |
| M-2 | BundlingQueryService を application 層に | **対応済み** — タスク 2.2 に明記 |
| M-3 | Stock.isEmpty() 追加 | **対応済み** — タスク 3.1a に明記 |
| M-4 | 統合テスト 2h→3h | **対応済み** — 異常系追加 |
| M-5 | FE テスト 2h→3h + 対象画面明記 | **対応済み** — S-302, S-401 明記 |
| M-6 | 結束完了 API パス変更 | **対応済み** — /orders/{id}/bundle |
| M-7 | IT6 の 16SP 再調整 | **保留** — IT5 完了後に再判断 |
| L-1〜L-3 | 各低程度提案 | L-3 対応済み（バーンダウン修正）、L-1/L-2 は実装時に対応 |
