# フレール・メモワール WEB ショップ - フロントエンド

花束注文・在庫管理・出荷管理を統合する WEB ショップのフロントエンドアプリケーション。

## 技術スタック

- React 19 + TypeScript 5.9
- Vite 8（ビルドツール）
- React Router 7（ルーティング）
- TanStack Query 5（サーバー状態管理）
- Tailwind CSS 4（スタイリング）
- Vitest + Testing Library（テスト）

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動（http://localhost:5173）
npm run build        # プロダクションビルド
npm run test         # テスト実行
npm run test:watch   # テストウォッチモード
npm run lint         # ESLint 実行
npm run format       # Prettier フォーマット
```

## ディレクトリ構成

```
src/
├── components/      # 共通コンポーネント
│   ├── ui/          # UI プリミティブ
│   └── layout/      # レイアウトコンポーネント
├── features/        # 機能モジュール
│   ├── auth/        # 認証
│   ├── customer/    # 得意先管理
│   ├── inventory/   # 在庫管理
│   ├── item/        # 単品管理
│   ├── order/       # 受注管理
│   ├── product/     # 商品管理
│   ├── purchase/    # 発注管理
│   └── shipping/    # 出荷管理
├── hooks/           # カスタムフック
├── lib/             # ユーティリティライブラリ
├── pages/           # ページコンポーネント
├── providers/       # コンテキストプロバイダー
├── types/           # 型定義
└── utils/           # ヘルパー関数
```

## 詳細

セットアップ手順の詳細は [アプリケーション開発環境セットアップ手順書](../../docs/operation/app-development-setup.md) を参照してください。
