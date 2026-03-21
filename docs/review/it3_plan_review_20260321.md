# IT3 計画レビュー - 注文フロー・受注管理

**レビュー日**: 2026-03-21
**レビュー対象**: docs/development/iteration_plan-3.md（US-005, US-006, US-007）

## 総合評価

IT3 計画は全体として構造がよく整理されており、ドメインモデル・データモデル・API・UI のワイヤーフレームまで包含した「実装に着手可能な計画」である。IT1/IT2 の実績（各 11 SP, 100% 達成）を踏まえた 13 SP の目標は妥当な範囲。ただし、**DeliveryDestination の Entity/Value Object の不整合**が全エージェントから一致して指摘されており、実装前に解決が必要。また Day 8 のタスク密度、テスト計画の具体性、Customer 生成タイミングの未定義が共通の懸念事項。

## 改善提案（重要度順）

### 高（開発着手前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | DeliveryDestination の Entity/Value Object を統一する | ドメインモデル図・データモデル・タスク 1.2 | programmer, architect, writer | IT3 計画では Entity、domain_model.md では Value Object。FK 設計と矛盾。Entity に統一を推奨 |
| H-2 | Day 8 のタスク密度を分散する（9.5h → 2 日に分割） | スケジュール Day 7-8 | programmer, tester, writer | Day 7 は 2h で余裕あり。API 実装（2.1, 2.2）を Day 7 に前倒し |
| H-3 | テストタスクを明示化する（統合テスト・コンポーネントテスト・認可テスト） | タスク一覧 | tester | IT2 では明示的だったテストタスクが IT3 で欠落。認可テスト（403/401）は特に重要 |
| H-4 | DeliveryDate の境界値テストケースを計画に明記する | タスク 1.1 | tester | 翌日～30 日後の 6 パターン（当日、翌日、30 日後、31 日後、過去日、null） |
| H-5 | Customer 生成タイミングを受入条件に明記する | US-005 受入条件 | programmer, architect, user-rep | ユーザー登録時に自動生成 or 初回注文時に生成。実装判断に直結 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | OrderUseCase を責務で分割する（CreateOrder / ManageOrder） | タスク 1.5 | programmer, architect | 異なるアクター（得意先 vs スタッフ）の責務が混在。Controller 分離とも整合 |
| M-2 | 「1 注文 = 1 商品 × 1 個」の制約を明示する | US-005 受入条件 | programmer, architect, user-rep | Order に数量フィールドなし。業務制約を明示すべき |
| M-3 | customers.email を削除し users.email のみで管理する | データモデル | architect | 同一情報の重複による整合性リスク |
| M-4 | 画面イメージ（S-006, S-007, S-102）を追加する | 設計セクション | writer | 特に S-102（受注詳細）は US-007 の中核。ステータス更新ボタンの配置を明示 |
| M-5 | API リクエスト/レスポンスの JSON 例を記載する | API 設計セクション | writer | POST /api/v1/orders のリクエストボディ構造が不明 |
| M-6 | E2E テストを 4 シナリオに拡充する | タスク 3.4 | tester | Happy Path のみでなく、バリデーション・ロール分離のシナリオも必要 |
| M-7 | 注文履歴 API（GET /orders/my）のスコープを明確にする | API 設計 | writer, user-rep | API は定義済みだが対応画面・タスクがない |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | OrderStatus の enum を全 6 状態で定義し、IT3 では 2 遷移のみ実装する | タスク 3.1 | architect | 将来の拡張を安全にするため |
| L-2 | マイグレーションファイル名を統一する（V5__create_customers_and_orders.sql） | タスク 1.6・SQL セクション・ディレクトリ構成 | programmer, architect, writer | 3 箇所で名前が不一致 |
| L-3 | 関連ドキュメントに IT2 ふりかえり・完了報告書を追加する | 関連ドキュメント | writer | IT2 成果物への追跡性向上 |
| L-4 | 見積もり根拠を再検証する（1SP=3.3h は IT2 の 3.6h より楽観的） | タスク合計 | programmer | 新規集約 3 つの導入で工数増が予想される |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | architect: Order 内に届け先を Value Object として埋め込む（スナップショット保持） | programmer: DeliveryDestination を Entity に統一 | 注文後に届け先が変更された場合の影響 | 花束配達では届け先情報のスナップショット保持が重要。Entity として管理しつつ、Order には注文時点のスナップショットを保持する設計を推奨 |
| 2 | tester: E2E テストを 4 シナリオに拡充（4h） | programmer: スケジュール密度の懸念 | テスト充実 vs スケジュール制約 | Day 9-10 で分散。最低 2 シナリオ（Happy Path + 認可）は必須 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 2 / 中: 3 / 低: 2）</summary>

### 評価サマリー
IT2 の実績を踏まえた 13 SP の目標は妥当。ドメインモデル設計との整合性に重要な乖離（DeliveryDestination）があり、Day 8 のタスク密度が非現実的。

### 良い点
- TDD 明記の徹底、インサイドアウトの実装順序
- 状態遷移ロジックの独立タスク化
- API 設計の認可分離

### 主な改善提案
- H: DeliveryDestination の Entity/Value Object 統一
- H: Day 8 のタスク密度を分散
- M: OrderUseCase の責務分割
- M: 注文数量の制約明示
- L: マイグレーションファイル名統一
</details>

<details>
<summary>xp-tester（高: 4 / 中: 4 / 低: 2）</summary>

### 評価サマリー
テスト計画が IT2 と比較して後退。E2E テストが 1 タスクのみで、統合テスト・コンポーネントテスト・認可テストの明示的タスクが欠落。

### 良い点
- 受入条件が具体的で検証可能（数値明示）
- 状態遷移の限定が明確
- ArchUnit テストの継続

### 主な改善提案
- H: テストタスクの明示化（統合・コンポーネント・認可）
- H: DeliveryDate の境界値テスト 6 パターン
- H: Message の境界値テスト（200 文字制限）
- H: 認可テスト（403/401、データ分離）
- M: E2E テストを 4 シナリオに拡充
- M: フィルタリングテスト（デシジョンテーブル推奨）
</details>

<details>
<summary>xp-architect（高: 1 / 中: 3 / 低: 2）</summary>

### 評価サマリー
ヘキサゴナルアーキテクチャのレイヤー構造に忠実。集約境界の設計に 1 点重要な矛盾（DeliveryDestination）があるが、全体的に設計ドキュメントとの整合性は高い。

### 良い点
- ヘキサゴナルアーキテクチャの忠実な踏襲
- 集約間の参照が ID のみ
- 状態遷移のドメインモデルへの集約
- バリデーションの二層配置（値オブジェクト）

### 主な改善提案
- H: DeliveryDestination の Entity/Value Object 統一（Entity 推奨）
- M: Order 内の DeliveryDestination 参照方法の明確化（スナップショット検討）
- M: customers.email と users.email の重複排除
- M: OrderUseCase の責務分割
</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 3 / 低: 2）</summary>

### 評価サマリー
IT2 計画の構造を踏襲した質の高い計画書。画面イメージの網羅性と API 仕様の詳細度に改善余地あり。

### 良い点
- IT2 との構造的一貫性
- 受入条件の具体性
- ドメインモデル図の明確さ
- IT2 レビュー指摘の追跡継続

### 主な改善提案
- H: 画面イメージ（S-006, S-007, S-102）の追加
- H: API リクエスト/レスポンスの JSON 例記載
- M: 注文画面 wireframe と UI 設計書の差異解消
- M: 注文履歴 API のスコープ明確化
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 2 / 低: 1）</summary>

### 評価サマリー
業務フローの基本は押さえているが、得意先の注文履歴確認、Customer 生成タイミング、ロール別メニュー分離など、実際の利用シーンで重要な点が未定義。

### 良い点
- 注文フローの 3 画面構成（入力→確認→完了）
- 受注スタッフのステータス管理機能
- 届け先情報の必須バリデーション

### 主な改善提案
- H: 得意先の注文履歴画面のスコープ明確化
- H: Customer 生成タイミングの定義
- H: ロール別メニュー制御の具体仕様
- M: 注文確定後の確認メール/通知の検討
- M: 受注一覧のページネーション仕様
</details>
