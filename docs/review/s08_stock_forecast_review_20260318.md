# コードレビュー結果: S08 在庫推移を確認する

## レビュー対象

- **ストーリー**: S08「在庫推移を確認する」(5 SP)
- **ブランチ**: claude/take1
- **変更ファイル**: 15 ファイル変更 + 14 ファイル新規作成
- **レビュー日**: 2026-03-18

## 総合評価

Hexagonal Architecture に忠実な実装であり、ドメイン層の純粋性・テストの網羅性・レイヤー分離の設計は高品質。TDD サイクルの痕跡が明確で、受入条件を満たす E2E テストも整備されている。主な課題は (1) test-server.ts の TypeScript コンパイルエラー、(2) ドメインサービス内のマジックストリング、(3) フロントエンドのエラーハンドリング欠如、(4) 業務 UI の改善（曜日表示・凡例の完備）の 4 点。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H1 | test-server.ts の `addRecord` 呼び出しで `purchaseOrderId`, `supplierId`, `orderDate` が欠落。TypeScript コンパイルエラー | test-server.ts:98-103 | Programmer, Architect | `tsc --noEmit` が失敗する。CI でビルドが壊れる |
| H2 | app.ts で `InMemoryPurchaseOrderRepository` を本番コードに使用。サーバー再起動でデータ消失 | app.ts:43 | Architect | S09 で対応予定だが TODO コメントと ADR 記録が必要 |
| H3 | ドメインサービス内のマジックストリング (`'有効'`, `'発注済み'`, `'注文済み'`, `'出荷準備中'`) | stock-forecast-service.ts:39,43,46 | Programmer, Writer | 値オブジェクトの型を使うべき。新規開発者が対象ステータスを把握できない |
| H4 | 凡例に品質維持日数超過の警告（黄色背景）の説明がない | StockForecast.tsx:127 | User Rep | 仕入スタッフが黄色背景の意味を理解できない |
| H5 | 日付ヘッダーに曜日が表示されない | StockForecast.tsx:94 | User Rep | 花市場は曜日ベースで動いており、発注判断に曜日情報が必須 |
| H6 | 発注ボタンが常に disabled で説明がない | App.tsx:287, StockForecast.tsx:117 | User Rep | S09 未実装でも「準備中」等のフィードバックが必要 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M1 | `calculateForecast` の引数が 6 個で多すぎる。パラメータオブジェクトに束ねるべき | stock-forecast-service.ts:28-35 | Programmer | 引数順序の取り違えリスク |
| M2 | N+1 クエリ: `activeOrders` ループ内で `productRepository.findById` を毎回呼出 | stock-forecast-usecase.ts:50-65 | Programmer, Architect | Prisma 実装切替時にパフォーマンス問題 |
| M3 | 日付バリデーション不足。不正文字列で `Invalid Date` が後続に流れる | stock-forecast-routes.ts:16-18 | Programmer, Architect, Writer | `new Date("abc")` で予測不能動作 |
| M4 | フロントエンドのエラーハンドリング欠如。`.catch` なし | StockForecast.tsx:40 | Programmer, Architect, Tester, User Rep | API 失敗時にユーザーフィードバックなし |
| M5 | 複数日の累積計算テストがドメインサービスレベルで不足 | stock-forecast-service.test.ts | Tester | 在庫「推移」の時系列変化がコアだが直接テストなし |
| M6 | `出荷準備中` ステータスの注文が引当に含まれるかの UseCase テストがない | stock-forecast-usecase.test.ts | Tester | フィルタ条件の変更見落としリスク |
| M7 | `order.orderId!.value` の非 null アサーション | stock-forecast-usecase.ts:57 | Programmer, Writer | null 時にランタイムエラー |
| M8 | 自動再取得と「表示」ボタンの二重 UI | StockForecast.tsx:43-45 | User Rep | 日付変更途中で不整合データが取得される |
| M9 | `StockForecast` ドメインオブジェクト自体の独立ユニットテストがない | (該当ファイルなし) | Tester | `isShortage` の 0 境界値を独立テストすべき |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L1 | `formatDate` 関数がバックエンドとフロントエンドで重複 | routes, StockForecast.tsx | Programmer, Writer | 片方だけ更新される事故リスク |
| L2 | デフォルト期間 `6` がマジックナンバー | StockForecast.tsx:19 | Writer | 定数化で意図を明確に |
| L3 | `generateDateRange` の Date ミューテーション | stock-forecast-service.ts:81-88 | Programmer | 不変オブジェクト方針と矛盾 |
| L4 | 単品フィルタの選択肢がデータ依存。フィルタ後に選択肢が絞られる | StockForecast.tsx:79-83 | Programmer | 「全て」に戻しづらくなる |
| L5 | フロントエンドの `expiry-warning` クラステストがない | StockForecast.test.tsx | Tester | `isExpiryWarning: true` & `isShortage: false` の組合せ |
| L6 | テーブル列順序（品質維持が日付列の後ろ） | StockForecast.tsx | User Rep | 業務の読み順として改善余地 |
| L7 | ツールチップがホバー操作前提（タブレット非対応） | StockForecast.tsx | User Rep | 倉庫でのタブレット利用シナリオ |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | Programmer: ドメインサービスの引数をドメイン型にすべき | Architect: プリミティブ DTO で純粋性を保つ設計は適切 | ドメインサービスの入力型 | 現状維持。ただしマジックストリングは解消すべき |
| 2 | User Rep: 自動再取得をやめて手動取得に統一 | (暗黙): useEffect による自動更新は React の標準パターン | UX vs 技術慣習 | 業務視点を優先し、手動取得に統一を推奨 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 3 / 低: 3）</summary>

### 評価サマリー
ドメインモデルの表現力、テストの網羅性、レイヤー分離の設計はよくできている。`StockForecastService` の責務過多とプリミティブ型への依存が集中しており改善の余地あり。

### 良い点
- StockForecast エンティティの不変性（readonly + 計算プロパティ）
- ドメインサービスのテスト品質（ヘルパーが DRY で読みやすい）
- フロントエンドの Props Injection パターン
- E2E テストの充実度

### 主な改善提案
- test-server.ts のコンパイルエラー修正（高）
- calculateForecast の引数をパラメータオブジェクトに（高）
- マジックストリングの排除（高）
- N+1 クエリの解消（中）
- 日付バリデーション追加（中）
- エラーハンドリング追加（低）
</details>

<details>
<summary>xp-tester（高: 3 / 中: 5 / 低: 3）</summary>

### 評価サマリー
テストピラミッドが適切に形成されており、主要パスを網羅。ただし複数日の累積計算テストが不足しており「推移」の時系列変化検証が弱い。

### テストレベル別カバレッジ
| 検証項目 | Unit (Domain) | Unit (UseCase) | Unit (Routes) | Unit (Frontend) | E2E |
|---|---|---|---|---|---|
| 在庫予定数の計算式 | OK | OK | - | - | - |
| 欠品警告表示 | OK | - | - | OK | OK |
| 複数日の累積推移 | **欠** | 部分的 | - | - | OK (間接) |
| エラーハンドリング | - | - | **欠** | **欠** | - |

### 最優先で追加すべきテスト
1. ドメインサービスの複数日累積計算テスト
2. UseCase の `出荷準備中` / `出荷済み` ステータス別テスト
3. `StockForecast` ドメインオブジェクトの境界値テスト
4. フロントエンドのエラーハンドリングテスト
</details>

<details>
<summary>xp-architect（高: 2 / 中: 3 / 低: 2）</summary>

### 評価サマリー
Hexagonal Architecture の原則に忠実。ドメイン層の純粋性が保たれている。本番コードでの InMemoryPurchaseOrderRepository 使用がアーキテクチャ上の穴。

### 良い点
- 依存方向が正しい（内→外の一方向）
- ドメインサービスが純粋関数的
- ユースケース層でのデータ変換が明確
- ルーティングのファクトリ関数パターン

### 主な懸念
- `PurchaseOrderRecord` がプリミティブ型で他のリポジトリ（ドメインオブジェクト返却）と不一致
- ドメインサービスの責務肥大化の兆候（将来的に予約引当・返品等が追加される場合）
- App.tsx の状態管理肥大化（Router 導入検討時期）
</details>

<details>
<summary>xp-technical-writer（高: 0 / 中: 2 / 低: 3）</summary>

### 評価サマリー
設計の自己文書化性が高く、型定義・命名・テスト構造で意図が明確に伝わる。ドキュメント追加すべき箇所は少ない。

### 良い点
- 型定義の自己文書化性（プロパティ名がそのまま仕様書）
- テスト名が仕様として読める
- ツールチップの樹形図表記
- エラーメッセージが日本語

### 主な改善提案
- ステータス文字列のハードコーディング解消（中）
- 累積計算ロジックの意図コメント追加（中）
- API エンドポイントの仕様ドキュメント化（低）
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 3 / 低: 2）</summary>

### 評価サマリー
受入条件を満たす実装だが、毎日使う業務画面としては曜日表示・凡例完備・発注ボタン状態説明が必要。

### 良い点
- 計算式が正しく内訳確認可能
- 欠品警告の視認性（赤太字）
- 2 段階警告（赤 = 欠品、黄 = 注意）
- デフォルト期間設定が実務に合致

### 主な改善提案
- 凡例に品質維持超過警告の説明追加（高）
- 日付ヘッダーに曜日表示（高）
- disabled 発注ボタンの説明（高）
- 自動再取得と手動取得の統一（中）
- テーブル列順序の見直し（低）
</details>

## 対応方針

| # | 指摘 | 方針 | 理由 |
|---|------|------|------|
| H1 | test-server コンパイルエラー | **修正する** | ビルドが壊れる |
| H2 | InMemory の本番使用 | **TODO + ADR で記録** | S09 で解消予定 |
| H3 | マジックストリング | **S09 実装時に対応** | 発注ドメイン整備と合わせて実施 |
| H4 | 凡例に expiry-warning 説明追加 | **修正する** | 軽微な変更で UX 向上 |
| H5 | 日付ヘッダーに曜日表示 | **修正する** | 軽微な変更で業務価値大 |
| H6 | disabled 発注ボタンの説明 | **修正する** | ツールチップ追加で対応 |
| M1-M9 | 中優先度の改善 | **IT3 内で可能な範囲で対応** | リファクタリングフェーズで実施 |
</details>
