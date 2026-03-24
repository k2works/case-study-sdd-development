# IT4 コードレビュー結果

## レビュー対象

- IT4 コミット: feat(orders): IT4 全ストーリー実装（US-015, US-016, US-006）
- 変更: 21 ファイル、+989 行
- テスト: 215 件全パス、カバレッジ 99%

## 総合評価

ドメイン層の純粋性、Repository パターンによる依存性逆転、TDD サイクルの遵守は優れています。しかし **View 層の 4 箇所で ORM Model に直接アクセスしており、レイヤードアーキテクチャの原則に違反** しています。また、受注一覧画面でステータスが英語のまま表示される問題、注文詳細のキャンセル導線に条件表示がない問題があります。FakeRepository と DjangoRepository のソート基準の不一致もテストの信頼性を損なうリスクがあります。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H1 | View から ORM 直接アクセスを排除し、全て OrderService 経由にする | views.py:58,72-78,90-93 | programmer, architect | レイヤードアーキテクチャ違反。同一ファイル内で 2 パターンが混在し技術的負債化 |
| H2 | 受注一覧のステータスを日本語表示にする | staff_order_list.html:54 | writer, user | 英語の confirmed/cancelled がスタッフ画面に表示される。受入条件では日本語ステータス |
| H3 | キャンセル導線に条件表示を追加 | order_history_detail.html:77 | user | キャンセル不可（期限切れ/済み）でもリンクが出て不信感。条件付き表示にすべき |
| H4 | FakeOrderRepository のソート基準を DjangoOrderRepository と統一 | test_services.py:47 | tester | Fake は delivery_date 降順、Django は created_at 降順。テストの信頼性を損なう |
| H5 | OrderHistoryView の関数内 import を除去 | views.py:72 | programmer, writer | ファイル先頭の OrderModel と重複し、エイリアス名も異なり可読性低下 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M1 | ステータス選択肢を OrderStatus Enum から生成 | views.py:44-49 | programmer, architect | ハードコーディングは DRY 違反。ステータス追加時に 2 箇所修正必要 |
| M2 | 注文詳細（得意先向け）に合計金額を表示 | order_history_detail.html | user | 受注詳細にはあるが得意先向けにない |
| M3 | テストの _make_command ヘルパーを共通化 | test_services.py | tester, programmer | 3 クラスにほぼ同一の定義が重複 |
| M4 | イテレーション計画書のファイル名を実装に合わせて更新 | iteration_plan-4.md:291-296 | writer | テンプレートファイル名が計画と実装で乖離 |
| M5 | 受注一覧に件数表示を追加 | staff_order_list.html | user | スタッフが全体感を把握するために必要 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L1 | find_recent_addresses のソートを -created_at に変更 | repositories.py:65 | architect | -recipient_name は意味的に不自然 |
| L2 | 通貨表示に intcomma フィルタを追加 | 全テンプレート | writer | ¥12000 より ¥12,000 の方がユーザビリティ向上 |
| L3 | ナビゲーションのスタッフ/得意先をグループ分け | base.html | user | 認証未実装でも視覚的にセパレーション可能 |
| L4 | キャンセル導線に注文番号を引き継ぐ | order_history_detail.html:77 | user | 詳細画面から遷移後に再入力させるのは不自然 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| C1 | architect: staff_order_detail もドメインエンティティを渡すべき | writer: テンプレートで get_status_display が使える ORM モデルの方が便利 | View からテンプレートに渡すデータ型 | **architect 支持**: レイヤー原則を優先し、ドメインエンティティに日本語ラベル用のプロパティを追加する |

## 対応方針

| 重要度 | 対応 | 件数 |
|:---|:---|:---|
| 高 | 修正する | H1-H5 全て |
| 中 | M1, M2, M5 を修正。M3, M4 は保留 | 3/5 |
| 低 | L1, L4 を修正。L2, L3 は次回 | 2/4 |

## 更新履歴

| 日付 | 更新内容 |
| :--- | :--- |
| 2026-03-24 | 初版作成 |
