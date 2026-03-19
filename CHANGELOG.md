# Changelog

## [0.3.0] - 2026-03-19

### Features

- S06 在庫チェック付き届け日変更 + S15 注文キャンセル実装 (930c9a3)

### Bug Fixes

- handleTabChange → setStaffTab に修正（TypeScript ビルドエラー解消） (076ea8b)
- SQLite スキーマを IT5 構成に同期（Customer/Destination/Arrival 追加） (40c2d27)
- tsc -b --noEmit のエラー 5 件を修正 (2c7762c)
- tsc --noEmit の strictNullChecks エラー 25 件を修正 (d6c6a17)

### Documentation

- release_plan.md IT6 タスク完了・全リリース条件更新 (e4bbb71)
- review/index.md に IT6 レビュー 2 件を追加 (46b923c)
- IT6 ふりかえり・完了報告書作成、リリース計画最終更新 (1947d9f)
- IT6 受入条件を全件チェック済みに更新 (cc0a231)
- IT6 全タスク完了状態に更新 (71dcb65)
- IT6 開発成果物レビュー結果（5 エージェント並列） (dbd4b71)
- IT6 進捗更新・GitHub Issues クローズ・Phase3 Milestone クローズ (53e128a)
- IT6 計画作成・XP レビュー反映・GitHub 同期 (a5f3f0d)

### Tests

- S04 得意先管理 + S05 届け日変更の E2E テスト追加（IT5 負債解消） (338ea3b)
- S06 在庫チェック付き届け日変更 + S15 注文キャンセルの E2E テスト追加 (8a0f92c)

## [0.2.0] - 2026-03-18

### Features

- IT5 S04/S02/S05 実装完了 — 得意先管理・届け先コピー・届け日変更 (8b60d82)
- S10 ドメイン層 — Arrival エンティティと PurchaseOrder.receive() 拡張 (121847c)
- S10 アプリケーション・インフラ・プレゼンテーション層 — 入荷登録機能 (5e04f3d)
- S10 P09 入荷登録画面 + ナビゲーション導線 (566809b)
- S11 出荷対象確認 — ShipmentService + ShipmentUseCase + API (3fa541f)
- S11/S12 P10 出荷一覧画面 + 出荷記録ボタン (9a8bb37)
- S12 出荷記録 — recordShipment + POST /api/shipments (dd5bdbe)

### Bug Fixes

- arrivals テーブルの外部キー制約に対応した削除順序を修正 (d671f20)
- SonarQube Code Smell 3 件修正 — Quality Gate PASS (6d4b10a)

### Refactoring

- App.tsx をカスタムフックに分割 + エラーハンドリング改善 + 仕入先名対応 (03f4465)
- IT4 技術的負債解消（型安全化・バリデーション・スキーマ拡張） (f9808a6)

### Tests

- useApi の Customer/DeliveryDate API テスト追加 (0ae0a97)
- S10/S11/S12 E2E テスト + テストサーバー修正 (abe8f9a)

### Documentation

- ADR-003 届け日変更時のトランザクション方針を作成 (600d5ac)
- IT4/IT5 計画・ふりかえり・完了報告書
- IT5 計画に XP レビュー指摘 11 件を反映

### Chores

- @k2works/claude-code-booster を 2.5.1 に更新 (b016594)

## [0.1.0] - 2026-03-18

### Features

- Playwright 実行環境を追加 (d34b4b8)
- デモ環境用 Gulp 運用スクリプトを追加 (d5c0919)
- Heroku コンテナデモ環境を構築 (78a3ad5)
- デモ環境用 SQLite モードを追加（ADR-002） (4be18b8)
- S09 発注画面を実装 (49e8955)
- S09 発注機能を実装 (4462779)
- S08 在庫推移画面を実装 (ae9b0c6)
- S08 在庫推移機能を実装 (eab351c)
- マルチパースペクティブレビュースキルを追加 (5496eb2)
- App.tsx に注文フローと受注管理タブを統合 (199915a)
- P06 受注詳細画面（OrderDetail）を追加 (5dfb448)
- P05 受注一覧画面（OrderList）を追加 (3dbc0dd)
- P04 注文完了画面（OrderComplete）を追加 (ce518e4)
- P03 注文確認画面（OrderConfirm）を追加 (e5dfbdb)
- P02 注文入力画面（OrderForm）を追加 (6355ae2)
- API クライアントユーティリティと Order 型定義を追加 (c221f47)
- app.ts と test-server.ts に受注ルートを登録 (2355a74)
- 受注 API ルートを追加 (78029b1)
- Prisma リポジトリ実装と統合テストを追加 (6b0b674)
- InMemory リポジトリと OrderUseCase を追加 (48e62ab)
- Order・StockLot リポジトリインターフェースを追加 (b96bb96)
- StockLot エンティティを追加 (4bc12d6)
- Order エンティティを追加 (fb54fa2)
- DestinationSnapshot 値オブジェクトを追加 (5077e78)
- Order・Stock 関連の値オブジェクトを追加 (db77a8a)
- Prisma スキーマに Order と Stock モデルを追加 (a6dbcca)
- UI設計ドキュメントに基づくUI改善 (22411cc)
- S03 得意先向け商品一覧画面を追加 (d752a8d)
- S13 商品管理のフロントエンド実装 (c48bd6f)
- S13 商品管理のバックエンド実装 (592ba63)
- S14 単品管理のフロントエンド実装 (743d629)
- S14 単品管理のバックエンド実装 (fc03244)

### Bug Fixes

- Playwright の worker を 1 に固定し InMemory サーバーとの競合を解消 (7c0ae59)
- リリース品質ゲートをモノレポ構成に対応 (845adef)
- リリースタスクを gulpfile に登録し deploy:prd 未定義時のエラーを修正 (68e668d)
- demo:open を Heroku デモサイト URL に変更 (c38c492)
- Dockerfile を Heroku 命名規則に合わせてリネーム (adebdf7)
- シードデータを冪等化しデモ用データを拡充 (89382bb)
- レビュー指摘対応 — 発注数量を調整後の値で送信・エラーハンドリング追加 (0af47b5)
- 初期 migration に受注と在庫テーブルを追加 (ed8ced9)
- GitHub Actions の失敗を解消 (dfe64b2)
- SonarQube Quality Gate の指摘を修正 (01c09f9)
- 注文確定エラー時のフィードバック表示を追加 (77d8b83)
- 受注一覧・詳細に商品名を追加し、注文完了画面にメッセージを表示 (efac500)
- Order 状態遷移ガード強化と受注作成のトランザクション改善 (bf8699b)
- 統合テストに仕入先の事前作成を追加 (de9a255)
- SonarQube Code Smell を修正 (d22d275)
- 環境構築の不具合を修正 (9d0bf62)
- ガントチャートの mermaid シンタックスエラーを修正 (80cb744)

### Documentation

- README にデモサイトへのリンクを追加 (6ee2bc1)
- ドキュメントインデックスを更新 (4c5a2ce)
- スキル一覧にレビュー・品質管理系を追加 (4b8da6d)
- デモ環境手順書のダイアグラムを PlantUML に変更 (36f2078)
- デモ環境（Heroku Container）セットアップ手順書を追加 (d322ba3)
- ドキュメントインデックスに IT3 成果物と ADR-001 を追加 (aebcfce)
- IT3 完了 — ふりかえり・完了報告書・進捗更新 (b532241)
- ADR-001 発注作成時のトランザクション方針を記録 (6200549)
- IT3 計画の S09 完了を反映 — 進捗率 100% (be79986)
- IT3 計画の S08 完了を反映 — 進捗率 62.5% (4bdbb2a)
- IT3 計画に XP レビュー高優先度 8 件の指摘を反映 (6f7cdc1)
- IT3 計画のマルチパースペクティブレビュー結果を記録 (af1c1cb)
- IT3 計画を作成 — 在庫推移表示(S08)と発注機能(S09)、MVP リリース検証 (044e310)
- 開発インデックスに IT1・IT2 の進捗実績を反映 (b70fd04)
- linter によるドキュメントインデックスの調整を反映 (847cc6a)
- IT2 完了 — ふりかえり・完了報告書・進捗更新・GitHub Issues クローズ (3ed43af)
- イテレーション 2 計画を作成 (e432234)
- IT1 ふりかえりを完了報告書から分離 (ad39366)
- ドキュメントインデックスに未登録ファイルを追加 (51ea192)
- ドキュメントインデックスにイテレーション 1 完了報告書を追加 (12f4706)
- orchestrating-project の --sync にドキュメント同期を追加 (6354fe1)
- IT1 完了報告書を作成 (d23fa76)
- IT1 完了に伴うドキュメント・GitHub Issues 同期 (676ac4d)
- セットアップ手順書に DATABASE_URL の .env 設定を追記 (9906d2c)
- アプリケーション開発環境セットアップ手順書を作成 (e38db48)
- 開発セクションのindex.mdをイテレーション一覧・進捗で更新 (6c298ae)
- XPチームIT1レビュー指摘5件を反映 (b92b869)
- イテレーション1計画を作成 (22d514c)
- XPチームレビュー指摘を反映しリリース計画を再構成 (9cccfde)
- リリース計画を作成 (d66d8eb)
- XPチーム設計レビュー指摘5件を反映 (3ab7f52)
- XPチームレビュー指摘の必須6件を反映 (013458f)
- mkdocs.yml に設計ドキュメント10件のナビゲーションを追加 (ac67345)
- 技術スタック選定を作成 (fa11133)
- テスト戦略・非機能要件・運用要件を作成 (8eddf06)
- UI設計を作成 (0bed4bf)
- ドメインモデル設計を作成 (46afe8e)
- データモデル設計を作成 (35538fc)
- バックエンド・フロントエンド・インフラのアーキテクチャ設計を作成 (57ab7c8)
- ユースケースとユーザーストーリーを作成 (4f544f8)
- README に花束問題V1.2の概要を追記 (238ff32)
- RDRA 2.0 に基づく要件定義書を作成 (52238c7)
- ビジネスアーキテクチャとインセプションデッキを作成 (372bfc9)

### Refactoring

- InMemory リポジトリの Map フィールドに readonly を追加 (899526a)

### Tests

- S09 発注機能の E2E テストを追加 (67c1e7b)
- StockForecast のフィルタ操作・発注ボタンのテストを追加 (e89471b)
- S08 在庫推移の E2E テストとレビュー結果を追加 (26aed79)
- App と ProductManagement のテストカバレッジを改善 (db1a136)
- IT2 S01/S07 の E2E テストを追加 (d3d7473)
- Playwright による E2E テスト環境を構築 (bd83a9c)

### Chores

- @k2works/claude-code-booster を 2.4.0 に更新 (75c5ada)
- claude-code-booster を 2.3.0 に更新 (5d7af37)
- coverage/ と .claude/agent-memory/ を .gitignore に追加 (326e04e)
- claude-code-booster 依存を追加 (929d4a0)
- CI ワークフローを Backend/Frontend に分離 (b459519)
- カバレッジ連携と全プロジェクト対応を追加 (14d7720)
- 運用スクリプトとスキルを追加 (ce5aabd)
- IT1 環境構築（タスク0.1〜0.9） (5617ba3)
- プロジェクト初期セットアップ (466f6f9)

### Other

- Revert "docs: ドキュメントインデックスを更新" (ac5bc74)
- Initial commit (fc3941b)
