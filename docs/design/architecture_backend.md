# バックエンドアーキテクチャ - フレール・メモワール WEB ショップシステム

## アーキテクチャパターン選定

### 選定結果: レイヤードアーキテクチャ

**選定理由:**

- 業務ロジックは在庫推移計算・引当処理など一定の複雑さがあるが、ヘキサゴナルやクリーンアーキテクチャを採用するほどではない
- 小規模チーム（1〜2 名）での開発のため、シンプルで理解しやすいパターンが適切
- CRUD 中心の業務（受注・発注・入荷・出荷）にはレイヤードで十分対応できる
- 将来的な複雑化に備え、ドメイン層を明確に分離する

### レイヤー構成

```plantuml
@startuml

title バックエンドレイヤー構成

package "Presentation Layer" {
  component [REST API Controller]
  component [Request/Response DTO]
}

package "Application Layer" {
  component [Use Case / Service]
  component [Application DTO]
}

package "Domain Layer" {
  component [Entity]
  component [Value Object]
  component [Domain Service]
  component [Repository Interface]
}

package "Infrastructure Layer" {
  component [Repository Implementation]
  component [Database (ORM)]
  component [External Service Client]
}

[REST API Controller] --> [Use Case / Service]
[Use Case / Service] --> [Entity]
[Use Case / Service] --> [Domain Service]
[Use Case / Service] --> [Repository Interface]
[Repository Implementation] ..|> [Repository Interface]
[Repository Implementation] --> [Database (ORM)]

@enduml
```

### 各レイヤーの責務

| レイヤー | 責務 | 含まれるもの |
| :--- | :--- | :--- |
| Presentation | HTTP リクエスト/レスポンスの処理 | Controller、DTO（入出力） |
| Application | ユースケースの実行・調整 | Service、Application DTO |
| Domain | ビジネスルールの表現 | Entity、Value Object、Domain Service、Repository Interface |
| Infrastructure | 外部システムとの接続 | Repository 実装、ORM、外部 API クライアント |

## API 設計方針

### REST API

- リソース指向の URL 設計
- HTTP メソッドで操作を表現（GET / POST / PUT / DELETE）
- JSON 形式でリクエスト・レスポンスを統一

### エンドポイント一覧

| メソッド | パス | 説明 | 対応 UC |
| :--- | :--- | :--- | :--- |
| GET | /api/products | 商品一覧取得 | UC-01 |
| POST | /api/orders | 注文登録 | UC-02 |
| GET | /api/orders | 受注一覧取得 | UC-05 |
| GET | /api/orders/:id | 受注詳細取得 | UC-06 |
| PUT | /api/orders/:id/delivery-date | 届け日変更 | UC-04 |
| GET | /api/stock/transitions | 在庫推移取得 | UC-07 |
| POST | /api/purchase-orders | 発注登録 | UC-08 |
| POST | /api/arrivals | 入荷登録 | UC-09 |
| GET | /api/shipments/targets | 出荷対象一覧取得 | UC-10 |
| POST | /api/shipments | 出荷登録 | UC-11 |
| GET /POST /PUT | /api/products/:id | 商品マスタ管理 | UC-12 |
| GET /POST /PUT | /api/items/:id | 単品マスタ管理 | UC-13 |
| GET /POST /PUT | /api/customers/:id | 得意先管理 | UC-14 |

### レスポンス形式

```json
// 成功
{
  "data": { ... },
  "meta": { "total": 10 }
}

// エラー
{
  "error": {
    "code": "STOCK_INSUFFICIENT",
    "message": "在庫が不足しています"
  }
}
```

## ドメインモデル概要

### 主要エンティティ

```plantuml
@startuml

title ドメインモデル概要

entity 得意先 {
  + 得意先 ID
  + 氏名
  + 連絡先
}

entity 受注 {
  + 受注 ID
  + 届け日
  + メッセージ
  + ステータス
}

entity 届け先 {
  + 届け先 ID
  + 氏名
  + 住所
}

entity "商品（花束）" {
  + 商品 ID
  + 商品名
  + 価格
}

entity 商品構成 {
  + 数量
}

entity "単品（花）" {
  + 単品 ID
  + 単品名
  + 品質維持日数
  + 購入単位
  + リードタイム
}

entity 仕入先 {
  + 仕入先 ID
  + 仕入先名
}

entity 発注 {
  + 発注 ID
  + 発注日
  + 発注数量
  + ステータス
}

entity 入荷 {
  + 入荷 ID
  + 入荷日
  + 入荷数量
}

entity 在庫 {
  + 在庫 ID
  + 在庫数
}

entity 出荷 {
  + 出荷 ID
  + 出荷日
}

得意先 "1" -- "0..*" 受注
受注 "1" -- "1" 届け先
受注 "1" -- "1" "商品（花束）"
受注 "1" -- "0..1" 出荷
"商品（花束）" "1" -- "1..*" 商品構成
商品構成 "1..*" -- "1" "単品（花）"
"単品（花）" "1" -- "1" 仕入先
"単品（花）" "1" -- "0..*" 発注
"単品（花）" "1" -- "0..*" 入荷
"単品（花）" "1" -- "1" 在庫
得意先 "1" -- "0..*" 届け先

@enduml
```

### 在庫推移計算ロジック

在庫推移は以下の要素から日別に計算する：

```
日別在庫予定数 = 前日在庫 + 入荷予定数 - 受注引当数 - 廃棄予定数
廃棄予定数 = 品質維持日数を超えた在庫数
```

## 技術スタック（暫定）

| 分類 | 技術 | 備考 |
| :--- | :--- | :--- |
| 言語 | TypeScript | 型安全性の確保 |
| フレームワーク | Express.js / Fastify | 軽量・シンプル |
| ORM | Prisma | TypeScript 親和性が高い |
| データベース | PostgreSQL | リレーショナルデータに適合 |
| テスト | Vitest | 単体・統合テスト |

## アーキテクチャ決定記録（ADR）

### ADR-001: バックエンドアーキテクチャにレイヤードアーキテクチャを採用

- **ステータス**: 承認済
- **決定**: レイヤードアーキテクチャを採用する
- **理由**: 小規模チームでの開発効率を優先。業務ロジックの複雑さはレイヤードで対応可能
- **代替案**: ヘキサゴナルアーキテクチャ（複雑さに対して過剰）、クリーンアーキテクチャ（同様）

### ADR-002: API 設計に REST を採用

- **ステータス**: 承認済
- **決定**: REST API を採用する
- **理由**: シンプルで広く普及しており、チームの学習コストが低い。GraphQL は柔軟性が高いが複雑さも増す
- **代替案**: GraphQL（フロントエンドの柔軟性は高いが、小規模では過剰）
