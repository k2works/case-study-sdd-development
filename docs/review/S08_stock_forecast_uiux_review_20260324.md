# UI/UX レビュー結果: IT3 S08 在庫推移を確認する

## レビュー対象

- 在庫推移画面: `apps/app/views/stock_forecasts/index.html.erb`
- レイアウト: `apps/app/views/layouts/application.html.erb`
- UI 設計書: `docs/design/ui-design.md`（A09 在庫推移画面）
- レビュー日: 2026-03-24

## 総合評価

在庫推移画面は UI 設計書の仕様を概ね忠実に実装しており、Bootstrap 5.3 の card/table/form コンポーネントを活用した堅実な構成です。有効在庫マイナス時の赤ハイライト、曜日付き日付表示、品質維持日数のヘッダー表示など業務に即した工夫も見られます。ただし、**空状態のガイダンス欠如**、**アクセシビリティ上の色依存問題**（WCAG 1.4.1）、**他画面とのデザインパターン不整合**が確認され、業務画面としての完成度向上にはいくつかの改善が必要です。

## モダンデザイン準拠サマリー

| 評価項目 | 状態 | 備考 |
|---|---|---|
| カラーシステム | 要改善 | text-info/warning/danger のセマンティクスがやや不整合 |
| タイポグラフィ | 要改善 | 数値の tabular-nums 未適用、桁揃え不安定 |
| Elevation & Surface | OK | card による検索/結果の階層分離は適切 |
| コンポーネント一貫性 | 要改善 | 他画面（orders, items）と card/table パターンが異なる |
| スペーシング | OK | Bootstrap グリッド（row g-3, col-md-*）を適切に使用 |
| レスポンシブ / Adaptive | 要改善 | container vs container-fluid の不整合 |
| ダークモード | 未対応 | Bootstrap デフォルトのまま |
| 状態デザイン（空 / Loading / Error） | 要改善 | 空状態ガイダンスなし、Loading/Error 未対応 |

## 改善提案（重要度順）

### 高（リリース前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | 空状態のガイダンスメッセージ追加 | index.html.erb:28 | designer, user-rep | 初回アクセス時に空白画面。「単品を選択して表示を押してください」のガイドが必要 |
| 2 | 色だけに依存した情報伝達の改善（WCAG 1.4.1） | index.html.erb:50-56 | designer | 色覚多様性のあるユーザー（男性約5%）に区別困難。アイコンやバッジの併用が必要 |
| 3 | container の不整合解消 | layout + index.html.erb | designer, user-rep | container 内の container-fluid は実質無効。全画面統一が必要 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 4 | 他画面とのコンポーネントパターン統一 | 全管理画面 | designer | 在庫推移の card+table パターンを標準として横展開 |
| 5 | 有効在庫の計算式凡例を card-footer に追加 | index.html.erb | designer, user-rep | 仕入担当者の発注判断時に計算ロジックの透明性が必要 |
| 6 | 数値の tabular-nums 適用 | テーブル数値列 | designer | 桁揃えが読み取り精度に直結 |
| 7 | 廃棄対象の表示説明を追加 | index.html.erb | user-rep | 「良品在庫から既に除外済み」が分からず混乱する可能性 |
| 8 | 数値の単位表記を追加 | テーブルヘッダー | user-rep | 単位取り違えが発注ミスに直結 |
| 9 | 「発注画面へ」リンクの placeholder 配置 | index.html.erb 下部 | designer, user-rep | UI 設計書 A09 定義済み。IT4 前でも disabled リンク配置 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 10 | 検索ボタンを btn-outline-primary に統一 | index.html.erb:22 | designer | 主要アクション（登録等）と検索の視覚的区別 |
| 11 | 期間プリセット追加（1週間/2週間） | 検索フォーム | user-rep | 毎回日付入力の手間を軽減 |

## 矛盾事項

なし（両エージェントの指摘は概ね一致）

## エージェント別フィードバック詳細

<details>
<summary>xp-interaction-designer（高: 3 / 中: 4 / 低: 1）</summary>

UI 設計書との整合性は高い。card/table-responsive の使い方は適切。ただし WCAG 1.4.1（色のみの情報伝達）違反、空状態デザイン欠如、container 不整合、他画面とのパターン不統一を指摘。tabular-nums による数値桁揃え、有効在庫凡例の追加を推奨。在庫推移画面の card パターンを管理画面の標準として横展開することを提案。
</details>

<details>
<summary>xp-user-representative（高: 2 / 中: 2 / 低: 1）</summary>

受入条件は基本的に満たされている。曜日表示、マイナス行のハイライト、品質維持日数の表示を評価。「発注画面へ」の導線欠如、空状態の空白画面、廃棄対象の表示説明不足を指摘。入荷予定の累積型ロジックへの業務上の違和感、container の不整合も報告。
</details>
