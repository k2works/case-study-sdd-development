# 運用

開発環境構築・デプロイ・運用に関するドキュメントです。

## ドキュメント一覧

### 環境セットアップ

| 段階 | 環境 | ドキュメント | 状態 |
| :--- | :--- | :--- | :--- |
| 1 | アプリケーション開発環境 | [セットアップ手順書](./dev_app_instruction.md) | 完了 |
| 2 | 開発環境（Heroku Container） | [セットアップ手順書](./dev_instruction.md) | 完了 |
| 3 | ステージング環境（AWS） | - | 未着手 |
| 4 | 本番環境（AWS） | - | 未着手 |

### 運用コマンド

| カテゴリ | コマンド | 説明 |
| :--- | :--- | :--- |
| 開発サーバー | `npx gulp dev:server` | Django 開発サーバー起動 |
| テスト | `npx gulp dev:test` | テスト実行（カバレッジ付き） |
| TDD | `npx gulp tdd:backend` | pytest watch モード |
| 品質チェック | `npx gulp dev:tox` | tox 全環境実行 |
| Heroku デプロイ | `npx gulp heroku:deploy` | 一括デプロイ |
| Heroku ステータス | `npx gulp heroku:status` | ステータス確認 |
| Heroku ログ | `npx gulp heroku:logs` | ログ確認 |
| ヘルプ | `npx gulp heroku:help` | Heroku コマンド一覧 |

### インフラ

| 環境 | プラットフォーム | アプリ名 | URL |
| :--- | :--- | :--- | :--- |
| 開発 | Heroku Container | sdd-case-study-take3 | `https://sdd-case-study-take3.herokuapp.com/` |
