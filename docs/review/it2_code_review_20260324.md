# IT2 コードレビュー統合レポート

## レビュー対象

- IT2 全コミット（325737a..73ddf97）
- US-004: 商品閲覧画面、US-005: 注文機能
- 128 テスト、カバレッジ 99%

## 総合評価

4 層アーキテクチャと DDD パターンが一貫して適用され、TDD Inside-out アプローチで品質の高いコードが実装されています。ドメイン層の純粋性は優秀です。しかし、**DeliveryDate の DB 復元時バグ**（過去注文が取得不能になる致命的バグ）、**商品詳細画面の注文ボタン欠如**（購買フロー断絶）、**Application 層の欠落**（View にビジネスロジック集中）の 3 点は早急な対応が必要です。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-01 | DeliveryDate の DB 復元時バグ修正 | repositories.py:93 | programmer, tester, architect | 過去の注文を DB から取得する際に DeliveryDate のバリデーションで ValueError が発生し、注文履歴が参照不能になる |
| H-02 | 商品詳細画面に「注文する」ボタン追加 | product_detail.html | user-rep, designer, writer | 購買フローが断絶しており、ユーザーが注文に進めない |
| H-03 | 届け日バリデーションの 500 エラー防止 | views.py:28-62, forms.py | programmer, writer, user-rep | 当日を届け日に指定すると Form 通過後にドメイン層で ValueError → 500 エラー |
| H-04 | Repository の save にトランザクション追加 | repositories.py:40-71 | programmer, architect | Order 保存後に OrderLine 保存で例外時にデータ不整合 |
| H-05 | 注文完了画面のアクセス制御 | views.py:66-69 | programmer, user-rep, designer | PK 連番で他人の注文情報が推測可能 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-01 | Application 層（OrderService）導入 | views.py | programmer, architect | View にユースケースロジックが集中。API 追加時にコピペ発生 |
| M-02 | 注文完了画面に商品名・合計金額を表示 | order_complete.html | writer, user-rep, designer | ユーザーが「何を注文したか」確認できない |
| M-03 | フォームフィールド順序の見直し | forms.py | user-rep x2 | 届け日を先頭に（ユーザーの思考フロー順） |
| M-04 | DeliveryAddress を frozen=True に | entities.py:17 | programmer | 値オブジェクトとして不変であるべき |
| M-05 | 二重送信防止（ボタン disabled 化） | order_form.html | designer, user-rep | 重複注文のリスク |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-01 | フォーカスリング（focus:ring）追加 | forms.py | designer | キーボードユーザーのアクセシビリティ |
| L-02 | 注文関連 URL を orders の shop_urls に分離 | shop_urls.py | programmer, architect | 責務の明確化 |
| L-03 | 郵便番号・電話番号フォーマット検証 | forms.py | user-rep | 入力ミス防止 |
| L-04 | orders admin.py 追加 | - | architect | スタッフ向け受注管理 |

## エージェント別フィードバック要約

| エージェント | 高 | 中 | 低 | 主な発見 |
|---|---|---|---|---|
| xp-programmer | 2 | 4 | 3 | DeliveryDate バグ、Application 層欠如、トランザクション不在 |
| xp-tester | 1 | 2 | 2 | DeliveryDate 復元バグ、Form バリデーション穴、テスト URL ハードコード |
| xp-architect | 3 | 4 | 3 | Application 層欠如、設計ドキュメントとの乖離、DI 不在 |
| xp-technical-writer | 2 | 2 | 2 | 500 エラー体験、注文ボタン欠如、完了画面情報不足 |
| xp-user-representative | 3 | 2 | 2 | 注文ボタン欠如、注文者情報なし、確認画面なし |

## 更新履歴

| 日付 | 更新内容 |
|---|---|
| 2026-03-24 | 初版作成（5 エージェント並列レビュー） |
