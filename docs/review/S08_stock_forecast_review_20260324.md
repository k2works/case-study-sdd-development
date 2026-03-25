# コードレビュー結果: IT3 S08 在庫推移を確認する

## レビュー対象

- IT3 S08（在庫推移を確認する）8SP
- ブランチ: `claude/setup-orchestration-hNYxr`
- レビュー日: 2026-03-24

## 総合評価

全体として堅実な TDD 実装であり、Controller は薄く Service に業務ロジックを委譲する設計方針を遵守しています。136 テスト Green、カバレッジ 94.01%、RuboCop/Brakeman クリーンと品質基準を満たしています。ただし、**`effective_stock` 計算式における `expired` の二重減算**が最も重大な設計上の問題として 3 エージェント（programmer, architect, user-representative）から一致して指摘されました。また、Controller の日付パース時のエラーハンドリング欠如も複数のエージェントから指摘されています。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | `effective_stock` 計算式の修正: `expired` は表示用に留め、`effective_stock = available_stock + incoming - allocated` とする | `stock_forecast_service.rb:16` | programmer, architect, user-rep | 期限切れ在庫は `available_stock` から既に除外されており、`expired` を別途引くと二重減算になる |
| 2 | Controller の `Date.parse` にエラーハンドリングを追加 | `stock_forecasts_controller.rb:10-11` | programmer, architect, tester | 不正な日付文字列で 500 エラーが発生する |
| 3 | 引当計算のビジネスルール（出荷日 = 届け日 - 1 日）にコメント追加 | `stock_forecast_service.rb:43-63` | writer | `delivery_date` 範囲の `+1.day` オフセットが非自明 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 4 | `Stock#expired?` に日付パラメータを追加（`expired?(as_of: Date.current)`） | `stock.rb:18-20` | tester, architect | Service との日付判定ロジックの二箇所分散を解消 |
| 5 | Item モデルに `has_many :purchase_orders` を追加 | `item.rb` | architect | ドメインモデル設計書との整合、逆方向関連の非対称性解消 |
| 6 | `入荷予定` の累積型計算ロジックの仕様明確化 | `stock_forecast_service.rb:35-36` | programmer, architect, user-rep | 「当日入荷」vs「累積入荷予定」の仕様曖昧さ解消 |
| 7 | 単品未選択時のガイダンスメッセージ追加 | `index.html.erb` | user-rep | UX 改善: 初回アクセス時の空白画面を回避 |
| 8 | 境界値テスト追加（期限日当日、同日重複、1 日期間） | spec 各種 | tester | テストの信頼性向上 |
| 9 | Request spec にエラーハンドリングテスト追加 | `stock_forecasts_spec.rb` | tester | 不正 item_id、不正日付のテスト |
| 10 | ドキュメントとコードの用語不整合修正 | `iteration_plan-3.md` | writer | `quality_deadline` vs `expiry_date`, `arrived_at` vs `arrived_date` |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 11 | `@current_date` インスタンス変数が未使用 | `stock_forecast_service.rb:2` | programmer | 不要な変数の除去 |
| 12 | `cancel!` に RuntimeError 代わりにドメイン固有例外を使用 | `purchase_order.rb:21` | architect, tester | 例外の種別判定を容易にする |
| 13 | View のロジック（マイナス判定）をヘルパーに抽出 | `index.html.erb` | programmer | テスタビリティ向上 |
| 14 | 有効在庫の計算式を画面上に凡例として表示 | `index.html.erb` | user-rep | ユーザーの理解促進 |
| 15 | `not_expired_on` スコープが未使用 | `stock.rb:16` | writer | 使わないコードの除去検討 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | programmer: 入荷予定の累積型は「その日までの合計」で在庫推移の文脈では正しい | user-rep: 仕入担当者が見たいのは「当日入荷予定」であり累積ではない | `calculate_incoming` の仕様 | **user-rep を優先**: 業務ユーザーの期待に合わせるべき。ただし IT4（仕入管理）で仕様を確定する |
| 2 | programmer: `effective_stock` が -30 になるのは二重減算バグ | テスト: `-30` を正しい期待値として記述 | expired の扱い | **programmer/architect を優先**: 計算式を修正し、テストの期待値も更新 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 2 / 中: 4 / 低: 3）</summary>

堅実な設計。effective_stock の二重減算、Date.parse のエラーハンドリング欠如、calculate_incoming の累積型仕様の曖昧さを指摘。@current_date の未使用、i18n 未対応も報告。
</details>

<details>
<summary>xp-tester（高: 2 / 中: 6 / 低: 2）</summary>

テストピラミッドは適切。Stock#expired? の境界値テスト欠如、入荷と期限切れ同日重複シナリオの不足、Request spec のエラーハンドリングテスト不足を指摘。factory 未活用箇所の改善も提案。
</details>

<details>
<summary>xp-architect（高: 2 / 中: 3 / 低: 2）</summary>

MVC + Service Object の責務分離は適切。effective_stock の二重減算、入荷予定の累積仕様の曖昧さ、Item モデルの関連定義不足を指摘。集約境界の遵守状況にも言及。
</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 2 / 低: 2）</summary>

テストがドキュメントとして機能している点を評価。引当計算のビジネスルールコメント欠如、delivery_date 範囲の +1.day の意図不明瞭、ドキュメントとコードの用語不整合を指摘。
</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 2 / 低: 1）</summary>

受入条件は基本的に満たされている。入荷予定の累積型計算ロジックの業務上の違和感、単品未選択時のガイダンス欠如を指摘。有効在庫の二重減算懸念も報告。
</details>
