# IT2 開発成果物レビュー - 商品管理・花束構成・商品一覧

**レビュー日**: 2026-03-21
**レビュー対象**: IT2 コミット `d6fb178` (US-001, US-002, US-004)

## レビュー対象

### バックエンド
- `Product.java`, `ProductComposition.java`, `ProductRepository.java`
- `ProductUseCase.java`
- `ProductController.java`, `CatalogController.java`
- `ProductRequest.java`, `ProductResponse.java`, `CompositionRequest.java`, `CompositionResponse.java`
- `JpaProductRepository.java`, `ProductEntity.java`, `ProductCompositionEntity.java`
- `ProductTest.java`, `ProductUseCaseTest.java`, `ProductControllerTest.java`
- `V3__create_products.sql`, `V4__create_product_compositions.sql`

### フロントエンド
- `ProductListPage.tsx`, `ProductFormPage.tsx`, `ProductDetailPage.tsx`
- `ProductCompositionPage.tsx`, `ProductCatalogPage.tsx`
- `product-api.ts`, `product.ts`
- `ProductListPage.test.tsx`

## 総合評価

ヘキサゴナルアーキテクチャの層分離が適切に実現されており、ドメイン層のバリデーションロジック、Port/Adapter パターン、集約によるライフサイクル管理が正しく機能しています。テストの日本語命名による仕様書としての可読性も高いです。ただし、**CatalogController の非アクティブ商品露出バグ**、**CompositionResponse の itemName 欠落**、**価格バリデーションの設計書との不一致**という 3 つの重要な問題が発見されました。テストカバレッジにも大きな穴（花束構成テスト欠落、CatalogController テスト不在、フロントエンド 5 ページ中 1 ページのみ）があります。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | CatalogController.findById が非アクティブ商品も返す | `CatalogController.java:31-35` | architect, programmer, writer, user-rep | 顧客向け API で非公開商品が表示される設計バグ。`findActiveById` の追加が必要 |
| 2 | CompositionResponse に itemName フィールドがない | `CompositionResponse.java`, `product.ts:3` | programmer, writer | フロントエンドが `comp.itemName` を表示するが、バックエンドが返さないため常に undefined |
| 3 | addComposition 時の Item 存在チェックがない | `ProductUseCase.java:47-51` | architect, programmer | 存在しない itemId で構成追加が成功してしまう。ItemRepository で存在確認が必要 |
| 4 | 価格バリデーションが設計書と不一致（実装: 0 以上、設計書: 1〜999,999） | `Product.java:99-103` | architect, writer, user-rep | 0 円商品の登録が可能。花束販売で無料商品はビジネス上ありえない |
| 5 | ProductTest に addComposition / removeComposition のテストが欠落 | `ProductTest.java` | programmer, tester | ドメイン層の中核ビジネスロジックがテストされていない |
| 6 | CatalogController のテストが存在しない | テストファイルなし | programmer, tester | 顧客向け公開 API のテストが皆無 |
| 7 | ProductUseCaseTest に addComposition / removeComposition のテストが欠落 | `ProductUseCaseTest.java` | programmer, tester | ユースケース層の構成管理ロジックが未テスト |
| 8 | フロントエンドテストが ProductListPage のみ（5 ページ中 1 ページ） | フロントエンド全体 | tester | 特に ProductFormPage（バリデーション）と ProductCompositionPage（操作）のテスト優先度が高い |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 9 | ProductController のロール制御テストが不十分（全て CUSTOMER ロール） | `ProductControllerTest.java` | programmer, tester | 管理操作を CUSTOMER ロールでテスト。ADMIN/STAFF ロール分離が必要 |
| 10 | Product.setId() が public で公開されている | `Product.java:106` | programmer, architect, tester | ドメインオブジェクトの不変性を損なう。パッケージプライベートまたは Builder パターンへ |
| 11 | ProductUseCase に @Transactional がない | `ProductUseCase.java` | architect | findById → addComposition → save が別トランザクションになる可能性 |
| 12 | OpenAPI アノテーションが完全に欠落 | `ProductController.java`, `CatalogController.java` | writer | springdoc 導入済みだが @Tag, @Operation 等なし |
| 13 | formatPrice 関数が 3 箇所で重複 | `ProductListPage.tsx`, `ProductDetailPage.tsx`, `ProductCatalogPage.tsx` | programmer, writer | 共通ユーティリティとして抽出すべき |
| 14 | ProductFormPage で useEffect による直接 API 呼び出し（useQuery 未使用） | `ProductFormPage.tsx:27-35` | programmer, writer | エラーハンドリングなし、ローディング状態未管理、他ページとパターン不一致 |
| 15 | API エラー時のユーザーフィードバックがない | `ProductFormPage.tsx`, `ProductCompositionPage.tsx` | user-rep, writer | onError ハンドラー未定義。操作失敗時に無反応 |
| 16 | ProductController に構成取得ロジックが混在 | `ProductController.java:64-71` | programmer, architect | getCompositions の責務は UseCase 層にあるべき |
| 17 | 削除戦略が Product（論理）と Item（物理）で不統一 | `ProductUseCase.java:41-45` vs `ItemUseCase` | architect | 物理削除された Item を ProductComposition が参照すると整合性破壊 |
| 18 | バリデーションルール（MAX_NAME_LENGTH=50）が API 層でハードコーディング | `ProductRequest.java` vs `Product.java` | programmer, writer | 変更時に二箇所修正が必要 |
| 19 | 商品名 50 文字ちょうどの境界値テストがない | `ProductTest.java` | tester | 51 文字で NG は確認済みだが 50 文字で OK の確認なし |
| 20 | 非公開商品の再公開手段が UI にない | フロントエンド全体 | user-rep | activate() メソッドはあるが UI から呼べない |
| 21 | 花束構成の数量変更にインライン編集がない | `ProductCompositionPage.tsx` | user-rep | 数量変更に削除→再追加が必要で非効率 |
| 22 | architecture_backend.md のエンドポイント一覧に IT2 API が未記載 | `docs/design/architecture_backend.md` | writer | PUT, DELETE, compositions, catalog 系が未記載 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 23 | LocalDateTime.now() のテスタビリティ | `Product.java:37,48,53,58` | programmer, tester, architect | Clock インジェクションで時刻テストを制御可能に |
| 24 | ProductRepository に未使用メソッド（deleteById, existsById） | `ProductRepository.java:14` | programmer | YAGNI 原則に基づき削除検討 |
| 25 | delete メソッド名が論理削除の動作と不一致 | `ProductUseCase.java:41` | writer | deactivate に改名するか Javadoc で明記 |
| 26 | ProductComposition のバリデーションが Product.addComposition と重複 | `Product.java:61-75`, `ProductComposition.java:10-15` | programmer, tester, writer | DRY 原則違反。addComposition は重複チェックのみ担い、基本バリデーションは ProductComposition に委譲 |
| 27 | 商品画像機能がない | フロントエンド全体 | user-rep | 花束販売において画像は最重要情報。IT3 で最優先対応を推奨 |
| 28 | フロントエンドテストの `as never` キャスト | `ProductListPage.test.tsx` | tester | 型安全性を損なう。MSW 導入推奨 |
| 29 | 「花束構成管理」と「商品構成」のドメイン用語のずれ | `ProductCompositionPage.tsx:81` | writer | ユビキタス言語との統一を検討 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | user-rep: 価格は 1 円以上にすべき | programmer: 0 円テストが通っている | 価格の下限値 | **設計書に合わせて 1 円以上に変更**。花束販売で 0 円は業務上ありえない |
| 2 | architect: 値オブジェクト（ProductName, Price）を導入すべき | programmer: 現状のシンプルな設計で十分 | ドメインモデルの表現力 | **IT2 では現状維持、IT3 以降で値オブジェクト導入を計画**。ADR として記録 |
| 3 | user-rep: 商品画像は IT2 で対応すべき | tester/architect: IT2 のスコープ外 | 画像機能の優先度 | **IT3 の最優先ストーリーとして計画**。IT2 ではプレースホルダー画像の表示を検討 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 4 / 中: 4 / 低: 2）</summary>

### 評価サマリー
ヘキサゴナルアーキテクチャの層分離が適切に実現されており、ドメイン層にバリデーションロジックが集約された良い設計です。ただし、バリデーションの重複、テストカバレッジの欠落箇所、フロントエンドとバックエンドの型定義の不整合など、改善すべき点がいくつかあります。

### 良い点
- ドメインモデルの自己防衛: `Product` が自身のバリデーションを持ち、不正な状態のオブジェクトが生成されない設計
- `Product.create()` ファクトリメソッド、`getCompositions()` での `List.copyOf()` による防御的コピー
- Entity と Domain の変換が `ProductEntity.fromDomain()` / `toDomain()` にカプセル化
- テストの日本語命名が仕様書としての可読性が高い
- フロントエンドの `productApi` と `catalogApi` の分離が明確
- アクセシビリティへの配慮（`sr-only`, `aria-live`）

### 懸念事項
- カタログ API で非アクティブ商品が個別取得可能
- 花束構成追加時の itemId 存在検証がない
- ProductController のセキュリティ（CUSTOMER ロールで管理操作可能）
- N+1 問題の可能性（@OneToMany LAZY ロード）
- DomainException vs IllegalArgumentException の例外階層不統一
</details>

<details>
<summary>xp-tester（高: 4 / 中: 4 / 低: 3）</summary>

### 評価サマリー
バックエンドのドメイン層テスト (ProductTest) は境界値分析が丁寧に行われており、インサイドアウト TDD の良い実践が見られる。一方、ProductComposition の単体テスト不在、CatalogController のテスト不在、フロントエンドテストが ProductListPage のみという 3 つの大きなカバレッジの穴がある。

### 良い点
- ProductTest のバリデーション境界値テスト（null, 空文字, 50 文字超, 価格 -1, 価格 0）
- AAA パターンの遵守
- ProductUseCaseTest の論理削除検証（`argThat(p -> !p.isActive())`）
- 未認証アクセスの 403 テスト

### テストピラミッドの現状
- ドメイン層ユニットテスト: 12 件 (ProductTest のみ)
- アプリケーション層ユニットテスト: 8 件 (ProductUseCaseTest のみ)
- API 統合テスト: 11 件 (ProductControllerTest のみ)
- フロントエンドコンポーネントテスト: 4 件 (ProductListPage.test.tsx のみ)
- E2E テスト: 0 件
- Testcontainers / RestAssured / Playwright 未使用

### 懸念事項
- LocalDateTime.now() がテストの信頼性リスク
- Product.setId() が public でテストから直接操作
- ProductComposition のバリデーション重複
</details>

<details>
<summary>xp-architect（高: 3 / 中: 4 / 低: 2）</summary>

### 評価サマリー
ヘキサゴナルアーキテクチャの基本構造は正しく実装されており、依存関係の方向も適切。ただし、ドメインモデル設計ドキュメントで定義された値オブジェクト（ProductName, Price 等）が未導入であり、集約間の参照整合性チェックの欠如と CatalogController のアクセス制御上の懸念がある。

### 良い点
- 依存関係の方向が正しく、ArchUnit テストで自動検証
- Port/Adapter パターンの正しい適用（Item ドメインと一貫性あり）
- 集約ルートによる子エンティティのライフサイクル管理
- ProductComposition が Item を ID のみで参照（集約境界が正しい）
- CascadeType.ALL + orphanRemoval の適切な設定

### 懸念事項
- 集約の不変条件不足（構成 0 件の商品が作成可能、設計書では 1 つ以上）
- トランザクション境界の明示なし（@Transactional 未付与）
- ItemUseCase.delete() の物理削除が ProductComposition の参照整合性を壊す可能性
- Item.MAX_NAME_LENGTH=200 だが items テーブルは VARCHAR(50) で不一致
</details>

<details>
<summary>xp-technical-writer（高: 2 / 中: 4 / 低: 3）</summary>

### 評価サマリー
コードの命名と構造が直感的で、ドキュメントなしでも開発者が基本的な機能を理解できる良い設計。ただし、ドメイン用語の一貫性に複数の揺れがあり、OpenAPI アノテーションが完全に欠落している。

### 良い点
- ドメインモデル設計書のユビキタス言語テーブルが優秀
- エラーメッセージが日本語で統一
- GlobalExceptionHandler が RFC 7807 ProblemDetail に準拠
- フロントエンドの UI テキストが自然な日本語
- アクセシビリティへの配慮

### 懸念事項
- API ドキュメント未整備によるフロントエンド・バックエンド間の認識齟齬リスク
- CompositionResponse と フロントエンド ProductComposition 型の itemName 不整合
- 価格の下限バリデーション不整合（0 円 vs 1 円）
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 5 / 低: 3）</summary>

### 評価サマリー
基本的な商品の登録・編集・構成管理・カタログ表示の業務フローは一通り実現できており、受け入れ基準の核となる部分は満たしている。ただし、花束販売という業態の特性を踏まえると、商品画像の欠如と価格 0 円商品の登録が可能な点は、実運用に入る前に対処が必要。

### 良い点
- 削除がソフトデリート（論理削除）で過去データを保持
- 花束構成管理で既に追加済みの花材がドロップダウンから除外
- 構成削除時に確認ダイアログ
- カタログ画面がカード型グリッドレイアウト
- 管理者向け一覧に「構成花材数」列

### 懸念事項
- 「販売中」商品を非公開化した場合の既存受注への影響が不明
- 非公開商品の再公開手段が UI にない
- カタログの説明なし商品カードが寂しい
- 商品名 50 文字制限は妥当（実務上十分）
</details>
