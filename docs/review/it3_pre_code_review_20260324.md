# IT3 開発前コードレビュー統合レポート

## レビュー対象

- IT1-IT2 で実装された orders / products アプリのコードベース全体
- テスト: 130 テスト（8 ファイル）、カバレッジ 99%
- 関連設計ドキュメント: ドメインモデル設計、UI 設計、アーキテクチャ設計

## 総合評価

IT1-IT2 の実装は、ドメイン層の分離、値オブジェクトの不変性設計、リポジトリパターンの適用が堅実であり、TDD に基づく品質も高い。全体として「変更を楽に安全にできる」土台が構築されている。

一方で、**Application 層の欠落**、**OrderStatus の設計書との乖離**、**注文確認画面の省略**が IT3 の US-007（在庫推移）・US-014（キャンセル）実装における主要な技術的リスクとなっている。これらは IT3 Day 1-2 のリファクタリングフェーズで対処すべき。

---

## 改善提案（重要度順）

### 高（IT3 開発前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- | :--- |
| H-01 | Application 層（OrderService）の導入 | orders/views.py:29-64 | programmer, architect | View にビジネスロジック混在。IT3 でキャンセル・在庫連携追加時に View が肥大化する |
| H-02 | OrderStatus の設計書との乖離を ADR に記録し方針決定 | value_objects.py:24-29 | programmer, tester, architect, writer | 設計書: ACCEPTED/PREPARING/SHIPPED/CANCELLED vs 実装: PENDING/CONFIRMED/CANCELLED。cancel() 実装前に確定必須 |
| H-03 | OrderStatus に状態遷移検証ロジック（can_transition_to）を追加 | value_objects.py:24-29 | programmer | 遷移ルールが Order メソッド内に散在する前に集約すべき |
| H-04 | DeliveryDate の `_skip_validation` が等価性を壊す | value_objects.py:37 | programmer, tester, architect | `field(compare=False)` または `object.__setattr__` による reconstruct パターン標準化 |
| H-05 | OrderRepository インターフェースに docstring 追加 | interfaces.py:14-23 | writer | save() の upsert 振る舞い・next_order_number の形式が非自明 |
| H-06 | 注文確認画面（C-07）の追加 | views.py | user-rep | US-005 受入条件に明記。花束注文で確認画面なしは事故リスク大 |
| H-07 | 注文完了画面に商品名・合計金額を表示 | order_complete.html | user-rep | 注文内容を確認する唯一の手段（確認メール未実装のため） |
| H-08 | 二重送信防止（ボタン disabled 化） | order_form.html | user-rep | 二重注文による金銭トラブル・運用負荷の防止 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- | :--- |
| M-01 | Order.create() ファクトリメソッドの導入 | entities.py:50-73 | programmer | 生成ロジックが View に漏出。初期ステータスのビジネスルールをドメインに閉じる |
| M-02 | DeliveryAddress のバリデーション強化（postal_code, phone） | entities.py:16-29 | tester | 空の郵便番号・電話番号が許容される |
| M-03 | フォームフィールド順序の変更（届け日を先頭に） | forms.py | user-rep | UI 設計書（C-05）に「1. 届け日 → 2. 届け先 → 3. メッセージ」と定義 |
| M-04 | 届け日の最大値（30 日後）制限の追加 | forms.py, value_objects.py | user-rep | US-005 受入条件: 最長 = 注文日 + 30 日後 |
| M-05 | date.today() 依存の制御方法を決定 | value_objects.py:40 | tester | IT3 の can_cancel() テストで日付固定が必要。freezegun or パラメータ注入 |
| M-06 | OrderCompleteView の ORM 直接依存を解消 | views.py:70-74 | architect | ORM Model を直接参照するレイヤー違反。OrderService 導入と同時に対応可能 |
| M-07 | products/services.py のプレースホルダーコメントを現状に合わせて更新 | services.py | writer | 「IT2 以降で実装」のまま放置。実態を反映するコメントに更新 |
| M-08 | orders ドメインのモジュール docstring を products と同水準に揃える | entities.py, value_objects.py | writer | products は充実、orders は最小限で一貫性が欠如 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
| :--- | :--- | :--- | :--- | :--- |
| L-01 | Repository の save() 明細全削除 → 再作成パターンの方針を ADR に記録 | repositories.py:66-74 | programmer, architect | IT4 の Allocation 設計前に方針確定 |
| L-02 | OrderLine の product_id スナップショットの意図をコメントで明記 | entities.py:32-47 | programmer | 注文時点の商品名保存の設計判断が非自明 |
| L-03 | OrderLine の負数数量テストを追加 | test_domain.py | tester | quantity=-1 のテストなし（実装は < 1 でガード済みだが明示テストなし） |
| L-04 | DeliveryDate の翌日（最小有効値）境界値テスト追加 | test_domain.py | tester | today + 1 が有効最小値だが未テスト |

---

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
| :--- | :--- | :--- | :--- | :--- |
| C-01 | architect: OrderStatus は実装の PENDING/CONFIRMED を正とし設計書を更新（選択肢 B） | programmer: 設計書の ACCEPTED/PREPARING/SHIPPED/CANCELLED に合わせてリファクタリング | 設計書と実装のどちらを正とするか | **選択肢 B を推奨**: PENDING/CONFIRMED を正とし、IT4 で PREPARING/SHIPPED を追加。ただし ADR に明記し設計書を更新すること |
| C-02 | user-rep: 注文確認画面（C-07）は IT3 前に対応すべき | IT3 計画: US-007 + US-014 で 11SP 超挑戦的 | IT3 スコープに含めるか | **IT3 タスク 4 のキャンセル画面実装と同タイミングで最小限の確認画面を追加**。完全版は IT4 |

---

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 3 / 低: 2）</summary>

### 評価サマリー
IT1-IT2 の受注ドメインは、ドメイン層・インフラ層・プレゼンテーション層の分離が明確で、TDD に基づいたテストも網羅されている。ただし設計書との乖離と IT3 への拡張性に課題あり。

### 主要指摘
- H-01: Application 層（OrderService）の導入（View にビジネスロジック混在）
- H-02: OrderStatus が設計書と乖離（PENDING/CONFIRMED vs ACCEPTED/PREPARING/SHIPPED/CANCELLED）
- H-03: Order に設計書定義のメソッド不足（cancel, can_cancel 等）
- M-01: OrderStatus に状態遷移検証ロジック（can_transition_to）がない
- M-02: ファクトリメソッドパターンが未適用
- H-04: DeliveryDate の `_skip_validation` が frozen dataclass の等価性を壊す
</details>

<details>
<summary>xp-tester（高: 3 / 中: 4 / 低: 2）</summary>

### 評価サマリー
テスト総数 130、カバレッジ 99% は優秀。AAA パターン遵守、日本語命名で仕様として読める。ただし IT3 の cancel() 実装に向けて境界値テストと日付制御の仕組みが不足。

### 主要指摘
- H: OrderStatus の状態遷移テストが不足（Enum 値確認のみ）
- H: Order.confirm() が CANCELLED 状態を考慮していない
- H: DeliveryDate の翌日（最小有効値）境界値テスト不足
- M: date.today() 依存の制御が必要（freezegun or パラメータ注入）
- M: OrderLine の負数数量テスト不足
- M: DeliveryAddress の postal_code/phone バリデーション不足
- M: テストピラミッドがやや「中膨れ」（View テスト 37% vs 目標 20%）
</details>

<details>
<summary>xp-architect（高: 2 / 中: 3 / 低: 1）</summary>

### 評価サマリー
ドメイン層の独立性とリポジトリパターンの適用は堅実。Application 層の欠落が最大の構造的問題。IT3 で inventory アプリを追加する際の依存方向に注意。

### 主要指摘
- H: Application 層（OrderService）の導入（他の全改善の前提条件）
- H: OrderStatus の設計書との不一致を ADR に記録（選択肢 B: PENDING/CONFIRMED を正とする案を推奨）
- M: DeliveryDate の `_skip_validation` フラグを解消
- M: OrderCompleteView の ORM 直接依存を解消
- M: Repository の save() 明細全削除 → 再作成パターンの方針を ADR に記録
</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 3 / 低: 0）</summary>

### 評価サマリー
products ドメインは docstring が充実しているが、orders ドメインは最小限で一貫性が欠如。設計ドキュメントとの乖離が複数箇所あり、IT3 開発者の混乱リスクが高い。

### 主要指摘
- H: 設計ドキュメントと実装の乖離を ADR に記録（OrderStatus, Order フィールド, Order メソッド）
- H: OrderRepository インターフェースの docstring 追加（save() の upsert 振る舞いが非自明）
- H: 設計書の OrderRepository メソッドとの差分を明確化
- M: views.py に C-07 省略の意図コメントを追加
- M: products/services.py のプレースホルダーコメントを現状に合わせて更新
- M: orders ドメインのモジュール docstring を充実
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 3 / 低: 1）</summary>

### 評価サマリー
商品一覧→詳細→注文の基本フローは成立しているが、注文フロー後半（確認画面省略、完了画面情報不足、二重送信防止なし）に業務上の事故リスクが複数ある。花束は「大切な人への贈り物」という性質上、注文ミスへの不安が大きい商品であり、現状は安心して注文できる状態とは言えない。

### 主要指摘
- H: 注文確認画面（C-07）の追加（US-005 受入条件に明記）
- H: 注文完了画面に商品名・合計金額を表示
- H: 二重送信防止（ボタン disabled 化）
- M: フォームフィールド順序の変更（届け日を先頭に）
- M: 届け日の最大値（30 日後）制限の追加
- M: 届け日の最短日にリードタイムを反映

### 懸念事項
- IT3 キャンセル機能の前提として注文履歴画面（C-09）と認証機能が未整備
- 注文者情報（依頼主）が未取得で配達トラブル時に連絡不可
</details>

---

## IT3 Day 1-2 推奨アクション（優先順）

| 順序 | アクション | 関連指摘 | 理由 |
| :--- | :--- | :--- | :--- |
| 1 | OrderStatus の方針決定と ADR 記録 | H-02, C-01 | cancel() 実装の前提。PENDING/CONFIRMED を正とし設計書を更新 |
| 2 | OrderService の導入（View からロジック抽出） | H-01 | 他の全改善の前提条件 |
| 3 | DeliveryDate の `_skip_validation` 解消 + reconstruct 標準化 | H-04 | ファクトリメソッドパターンの統一 |
| 4 | OrderRepository docstring 追加 | H-05 | 1 時間以内で対応可能 |
| 5 | 二重送信防止 + 注文完了画面情報拡充 | H-07, H-08 | UI の最小限の改善（半日以内） |
| 6 | 注文確認画面の最小版 | H-06 | US-014 キャンセル画面と同タイミングで対応 |

---

## 更新履歴

| 日付 | 更新内容 |
| :--- | :--- |
| 2026-03-24 | 初版作成（5 エージェント並列レビュー） |
