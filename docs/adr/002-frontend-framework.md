# ADR-002: フロントエンドフレームワーク選定（React SPA）

フロントエンドフレームワークに React を採用し、SPA（Single Page Application）として構築する。

日付: 2026-03-20

## ステータス

2026-03-20 承認済み

## コンテキスト

フレール・メモワール WEB ショップシステムのフロントエンドアーキテクチャを選定する必要がある。

- **画面数**: 15〜20 程度（顧客向け 7 画面、管理画面 11 画面）
- **SEO 要件**: 低い（管理画面が大半、顧客向け画面も限定的）
- **インタラクティビティ**: 中程度（在庫推移表示、注文フォーム、一覧操作）
- **状態管理**: サーバー状態中心、クライアント状態は限定的
- **テスト要件**: TDD（アウトサイドインアプローチ）を採用

## 決定

**フレームワーク**: React 19.x + TypeScript 5.9.x

**レンダリング戦略**: SPA（Client-Side Rendering）

**状態管理**: TanStack Query（サーバー状態） + Context API（認証状態）

**スタイリング**: Tailwind CSS

**コンポーネント設計**: Container / Presentational パターン

### 変更箇所

- `src/features/` 以下にフィーチャー単位でモジュールを構成
- 各フィーチャーは `components/`、`hooks/`、`types/` を持つ
- Container コンポーネントがデータ取得・状態管理、Presentational コンポーネントが表示を担当

### 代替案

| 代替案 | 却下理由 |
|:---|:---|
| Next.js (SSR/SSG) | SEO 要件が低く、サーバーサイドレンダリングのメリットが薄い。運用複雑性が増加する |
| Vue.js | エコシステムと TDD ツールチェーンの充実度で React に劣る |
| Angular | 中小規模プロジェクトにはフレームワークが重すぎる。学習コストが高い |
| Svelte | エコシステムが未成熟。テストツールの選択肢が限定的 |
| Redux | サーバー状態中心の設計では Redux のボイラープレートが過剰。TanStack Query で十分 |
| Zustand | Context API で十分なスコープの状態管理。追加ライブラリは不要 |

## 影響

### ポジティブ

- React のエコシステム（Testing Library、MSW、Playwright）が TDD ワークフローと好相性
- TypeScript による型安全性がリファクタリング時の安全性を確保
- Container / Presentational パターンにより、テスト容易性と関心の分離を実現
- TanStack Query のキャッシュ・楽観的更新がユーザー体験を向上

### ネガティブ

- SPA のため初回ロード時間が SSR と比較して長い（コード分割で軽減）
- SEO が必要になった場合、Next.js 等への移行コストが発生する
- React のバージョンアップへの追従が必要

## コンプライアンス

- Presentational コンポーネントが外部状態（Context、React Query）に直接依存していないことをコードレビューで確認する
- 全コンポーネントに TypeScript の Props 型定義が存在することを ESLint ルールで強制する
- テストカバレッジ 80% 以上を CI の品質ゲートで検証する

## 備考

- 著者: AI Agent
- 関連ドキュメント: `docs/design/architecture_frontend.md`
- 関連 ADR: ADR-001（バックエンドアーキテクチャとの整合性）
