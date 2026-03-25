# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-03-24

Phase 1 MVP リリース。受注から在庫推移可視化までの基本業務フローを実現。

### Features

- **商品管理（IT1）**
  - feat(products): 単品ドメイン層を TDD で実装 (f2ef043)
  - feat(products): US-001 単品マスタのインフラ層・プレゼンテーション層を実装 (1564207)
  - feat(products): US-002 商品（花束）の全層を TDD で実装 (50ebadf)
  - feat(products): US-003 花束構成定義の全層を TDD で実装 (4f03592)
  - feat(products): US-004 商品閲覧画面を Django Template + Tailwind CSS で実装 (7f2e58d)

- **受注管理（IT2-IT4）**
  - feat(orders): US-005 受注ドメイン層・インフラ層を TDD で実装 (33e294c)
  - feat(orders): US-005 注文入力・確認・完了画面を TDD で実装 (5a36be5)
  - feat(orders): add order cancel feature with deadline enforcement (8aedf6d)
  - feat(orders): IT4 全ストーリー実装（US-015, US-016, US-006）(d085efa)

- **在庫管理（IT3）**
  - feat(inventory): add StockLot aggregate and StockForecastService domain layer (59afcc4)
  - feat(inventory): add Django ORM model, repository, and admin for StockLot (6328ad0)
  - feat(inventory): add stock forecast view with item selector and 14-day table (5d12aeb)

- **基盤**
  - feat(webshop): Django プロジェクト初期セットアップ (2e575c0)

### Bug Fixes

- fix(ui): correct form field order, add focus ring, prevent double submit (c355225)
- fix(orders): SonarQube S1192 フォーム CSS クラスの文字列重複を定数化 (31c07d0)
- fix(webshop): コードレビュー指摘に基づく初期セットアップ修正 (63dbbb3)
- fix: .gitignore の改行不足を修正 (460670f)

### Refactoring

- refactor(orders): レビュー指摘対応 - レイヤー原則統一・UX 改善 (b61fdbb)
- refactor(orders): introduce OrderService application layer (11db1c9)
- refactor(domain): standardize reconstruct factory method pattern (d518c27)
- refactor(orders): コードレビュー指摘に基づく品質改善 (7f806c7)
- refactor(products): コードレビュー指摘に基づく品質改善 (325737a)

### Documentation

- docs: IT1-IT4 イテレーション計画・ふりかえり・完了報告書
- docs: IT1-IT4 コードレビュー・UI/UX レビュー統合レポート
- docs(adr): record OrderStatus naming and design deviations (05f523c)
- docs: リリース計画・進捗管理ドキュメント

### Other

- ci: WebShop の Lint + テスト用 GitHub Actions ワークフローを追加 (46f1bdc)
- chore: husky + lint-staged で Python 品質チェックを pre-commit に追加 (760c81d)
- chore: SonarQube スキャン設定と品質指摘の修正 (50f9ffa)
- style: fix lint issues (70a48e1)

### Phase 1 MVP ストーリー一覧

| ID | ストーリー | SP | 完了 IT |
| :--- | :--- | :--- | :--- |
| US-001 | 単品マスタを登録する | 3 | IT1 |
| US-002 | 商品（花束）を登録する | 3 | IT1 |
| US-003 | 花束構成を定義する | 3 | IT1 |
| US-004 | 商品を選択する | 3 | IT2 |
| US-005 | 届け日・届け先・メッセージを入力して注文する | 5 | IT2 |
| US-007 | 在庫推移を確認する | 8 | IT3 |
| US-014 | 注文をキャンセルする | 3 | IT3 |
| US-015 | 受注状況を確認する | 3 | IT4 |
| US-016 | 注文履歴・注文状況を確認する | 3 | IT4 |
| US-006 | 届け先をコピーして再注文する | 3 | IT4 |
| **合計** | | **37** | |

### 品質メトリクス

| 指標 | 値 |
| :--- | :--- |
| テスト数 | 215 |
| テストファイル | 13 |
| カバレッジ | 98% |
| Ruff エラー | 0 |
| 平均ベロシティ | 9.25 SP/IT |
