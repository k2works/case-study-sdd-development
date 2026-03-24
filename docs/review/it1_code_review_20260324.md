# コードレビュー結果: IT1 開発成果物

レビュー日: 2026-03-24

## レビュー対象

- `apps/` - IT1 で実装された Rails アプリケーション全体
- Models: User, Product, Supplier, Item, Composition
- Controllers: ProductsController, ItemsController, CompositionsController
- Views: products/, items/, compositions/, devise/
- Specs: 47 examples, 0 failures, カバレッジ 85.59%

## 総合評価

IT1 として堅実な出発点。RESTful な設計、TDD による品質担保、N+1 予防、DB 制約の適用など基本が押さえられている。ただし、**認可（Authorization）の欠如**、**ログインフォームのクレデンシャルハードコーディング**、**テストの網羅性不足**（未認証テスト・更新失敗テスト・関連テスト）が共通の重要指摘。IT2 開始前に対応推奨。

## 改善提案（重要度順）

### 高（IT2 開始前に対応推奨）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 1 | **ログインフォームのパスワードフィールドを password_field に変更** | Prog | パスワードが平文表示されるセキュリティリスク |
| 2 | **認可（ロールチェック）を追加** | Prog, Arch | customer が管理画面を操作可能な状態 |
| 3 | **未認証アクセスのテストを追加** | Tester | authenticate_user! の回帰テストがゼロ |
| 4 | **Product の関連テスト追加**（has_many :compositions dependent :destroy） | Tester | カスケード削除の保証がない |
| 5 | **PATCH 更新失敗テストを追加** | Tester | unprocessable_entity パスが未検証 |
| 6 | **DB CHECK 制約を追加**（price > 0 等） | Arch | アプリ層バリデーションのみでは不十分 |

### 中（対応推奨）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 7 | ビューから直接モデルクエリを削除（Supplier.all, Item.all） | Prog | MVC の責務境界違反 |
| 8 | Composition の uniqueness バリデーション追加 | Prog | DB エラーがそのまま raise |
| 9 | SimpleCov minimum_coverage を 80 に引き上げ | Tester | IT1 完了で 85% 達成済み |
| 10 | Supplier dependent テストを追加 | Tester | restrict_with_error のテストなし |
| 11 | Product に active スコープと activate!/deactivate! 追加 | Arch | ドメインモデルとの整合 |
| 12 | User モデルの `# test comment` を削除 | Prog, Arch, Tester | 不要コメント |
| 13 | .rspec に `--order random` を追加 | Tester | 順序依存バグの検出 |

### 低（改善の余地あり）

| # | 提案 | 指摘元 | 理由 |
|---|------|--------|------|
| 14 | price に only_integer: true 追加 | Prog | 意図の明確化 |
| 15 | 各モデルの name に length: maximum 追加 | Arch | データモデルとの整合 |
| 16 | production の DB 名を frere_memoire_production に統一 | Arch | 命名の一貫性 |
| 17 | FactoryBot の supplier に sequence 追加 | Tester | 複数作成時の衝突防止 |
| 18 | ナビゲーション（共通レイアウト）の追加 | Prog | 画面間の遷移が不可 |

## 対応方針

### 修正する（IT2 開始前）

| # | 対応内容 |
|---|---------|
| 1 | パスワードフィールドを password_field に変更（開発用デフォルト値は維持） |
| 2 | ApplicationController に require_staff! メソッドを追加 |
| 3 | 未認証アクセスのテストを各 Request Spec に追加 |
| 4 | Product の関連テスト追加 |
| 5 | PATCH 更新失敗テスト追加 |
| 9 | SimpleCov minimum_coverage を 80 に引き上げ |
| 12 | test comment を削除 |

### 許容する（IT2 で対応）

| # | 理由 |
|---|------|
| 6 | DB CHECK 制約は IT2 のマイグレーションで追加 |
| 7 | ビューからのクエリは IT2 の Bootstrap レイアウト適用時にリファクタリング |
| 11 | active スコープは商品表示ページ（IT2）で必要になるタイミングで追加 |
| 18 | ナビゲーションは IT2 の Bootstrap レイアウトで実装 |
