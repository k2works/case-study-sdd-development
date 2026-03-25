# IT5・IT6 コードレビュー / UI/UX レビュー統合報告書

**レビュー日**: 2026-03-25
**レビュー対象**: IT5（仕入・入荷・品質期限アラート）+ IT6（出荷管理・届け日変更）
**ブランチ**: `claude/release-0.2.0-Ns2Q7`（master からの差分 310 ファイル、10,429 行追加）

## 総合評価

DDD レイヤードアーキテクチャ（domain/services/repositories/views）が全アプリで一貫しており、301 テスト・96% カバレッジという高い品質水準を達成しています。TDD サイクルの遵守、日本語テスト名による仕様の可読性、値オブジェクトによるビジネスルールのカプセル化は優れた実践です。一方、**ORM モデルとドメインモデルの状態不整合**、**トランザクション管理の不足**、**認証・認可の未実装**が主要なリスクです。UI/UX 面では顧客/スタッフのナビゲーション分離の欠如と注文確認画面の未実装が最大の課題です。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-1 | OrderStatus の ORM choices に `preparing`/`shipped` を追加 | `orders/models.py:15-19` | programmer, architect | ドメイン層は 5 状態だが ORM は 3 状態。出荷処理で status=shipped 保存時に Django Admin/Form バリデーション不整合 |
| H-2 | `PurchaseOrder.__post_init__` に DB 復元時のバリデーションスキップ追加 | `purchasing/domain/entities.py:29` | programmer, architect | 入荷予定日を過ぎた既存発注の Repository 読み出しで ValueError 発生。本番で一覧取得が破綻 |
| H-3 | `ShippingService.ship_order()` の `datetime.now()` → `timezone.now()` | `shipping/services.py:97` | programmer, writer, architect | USE_TZ=True 環境で naive datetime 保存。タイムゾーン不整合バグ |
| H-4 | `PurchasingService.receive_arrival()` に `@transaction.atomic` 追加 | `purchasing/services.py` | programmer, architect | 入荷記録・発注ステータス更新・在庫ロット作成が別トランザクション。障害時にデータ不整合 |
| H-5 | `test_変更期限超過でエラー` のテスト名と内容の矛盾を修正 | `orders/tests/test_services.py:367-380` | programmer, tester | テスト名は「エラー」だが実際は成功をアサート。バグを隠蔽する危険なテスト |
| H-6 | 品質期限アラートの境界値テスト追加（残り 0/1/2/3 日） | `purchasing/tests/test_views.py:170-197` | tester | 閾値の境界が未検証。残り 1 日と 5 日のみで閾値の正確性が不明 |
| H-7 | 出荷済み・キャンセル済み注文への `ship_order` エラーケーステスト追加 | `shipping/tests/test_services.py` | tester | 不正な状態遷移のテストが欠落 |
| H-8 | 顧客/スタッフのナビゲーション分離 | `templates/shop/base.html:19-25` | designer, user-rep | 「受注管理」「在庫推移」が顧客にも表示。ロール別表示が未実装 |
| H-9 | 注文確認画面（C-07）の実装 | `orders/views.py` | designer, user-rep | 設計では C-05→C-07→C-08 だが確認なしで直接完了。誤注文リスク |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-1 | `ShippingService.get_bundling_summary()` の Composition ORM 直接参照を Repository 経由に | `shipping/services.py:52-54` | programmer, architect, tester | サービス層→ORM 直接依存はレイヤー違反。Fake Repository でのテスト不可 |
| M-2 | `_enrich_orders()` の monkey-patching を DTO/ViewModel に置換 | `purchasing/views.py:29-43` | programmer, architect, writer | dataclass に未宣言属性を動的付与。型安全性を損なう |
| M-3 | `ExpiryAlertView` の N+1 クエリ問題解消 | `purchasing/views.py:131-161` | programmer, architect | 全単品ループで在庫ロット取得。`find_near_expiry()` 一括取得推奨 |
| M-4 | `PurchaseOrderRepository.find_ordered()` の文字列 `"ordered"` → Enum 使用 | `purchasing/repositories.py:37-41` | programmer | ステータス比較にハードコード文字列 |
| M-5 | 設計ドキュメントの OrderStatus 記述を実装に合わせて更新 | `docs/design/domain-model.md:278-281`, `data-model.md:369` | writer, architect | ADR-001 で決定済みだが設計書未更新 |
| M-6 | `user_story.md` のチェックボックスを完了状態に更新 | `docs/requirements/user_story.md` | writer | US-008〜US-013 が全て `[ ]` のまま |
| M-7 | PurchasingService に FakeRepository を導入しユニットテスト化 | `purchasing/tests/test_services.py` | tester | 全テストが `@pytest.mark.django_db` 統合テストのみ |
| M-8 | shipping の Repository テストファイル作成 | `shipping/tests/` | tester | 他アプリには存在するが shipping だけ欠落 |
| M-9 | 届け日入力に `min` 属性設定（クライアント側制約） | `order_change_delivery_date.html`, `order_form.html` | designer, user-rep | 過去日も選択可能。サーバーエラーまで気づけない |
| M-10 | 出荷処理後の成功メッセージ表示（Django messages） | `shipping/views.py` | user-rep | リダイレクトのみで処理結果フィードバックなし |
| M-11 | テーブルの `<th>` に `scope="col"` 追加 | 全テーブルテンプレート | designer | スクリーンリーダーがヘッダー/データセルの関係を認識不可 |
| M-12 | 注文キャンセル画面の検索メソッドを POST → GET に変更 | `order_cancel.html` | designer | 検索（読み取り）に POST 使用。戻るボタンで再送信確認表示 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-1 | `Order.change_delivery_date()` の `object.__setattr__` → 通常代入 | `orders/domain/entities.py:112` | programmer, writer, tester | Order は frozen でないため不要なハック |
| L-2 | `PurchaseOrder.ordered_at` の None 初期化を改善 | `purchasing/services.py:61` | programmer, architect | ドメインエンティティとして不完全 |
| L-3 | 品質期限アラートから発注登録・在庫推移への直接導線 | テンプレート | user-rep | 判断→行動の動線が長い |
| L-4 | 出荷管理の一括処理機能（チェックボックス） | `shipment_list.html` | user-rep | 繁忙期に 1 件ずつ処理は非現実的 |
| L-5 | 結束一覧の作業完了チェック機能 | `bundling_list.html` | user-rep | 途中離脱時に進捗不明 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | architect: PREPARING/SHIPPED の段階的遷移が設計意図 | programmer: `ship_order()` で一気通貫は実用的 | PREPARING 状態の存在意義 | 現状は一気通貫を許容。結束完了→出荷を分離する場合は次リリースで対応 |
| 2 | user-rep: US-013 の在庫確認・代替日提案は必須 | architect: 在庫引当自体が未実装 | 届け日変更時の在庫確認 | 在庫引当が未実装のため現段階ではスコープ外。将来の在庫引当実装時に対応 |

## ドキュメント欠落

| ドキュメント | 状態 | 指摘元 |
|:---|:---|:---|
| `docs/development/retrospective-6.md` | **未作成** | writer |
| `docs/development/iteration_report-6.md` | **未作成** | writer |
| リリース v0.2.0 完了報告書 | **未作成** | writer |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 5 / 低: 3）</summary>

### 評価サマリー
DDD 基本構造が各 Bounded Context で一貫して適用されており、レイヤー分離も適切。テストカバレッジも良好。

### 良い点
- レイヤーアーキテクチャの一貫性（domain/interfaces/repositories/services/views）
- Repository パターンの適切な実装（ABC + Django ORM 実装分離）
- 値オブジェクトの活用（ExpiryDate, DeliveryDate, OrderNumber 等）
- コマンドオブジェクトパターン（PlacePurchaseOrderCommand 等）
- テスト名が日本語で意図を表現
- 結束ドメインの frozen dataclass モデリング

### 主要指摘
- OrderStatus の ORM choices 不整合（高）
- PurchaseOrder の DB 復元時バリデーション問題（高）
- `datetime.now()` のタイムゾーン問題（高）
- Composition ORM 直接参照（中）
- `_enrich_orders()` monkey-patching（中）
- ExpiryAlertView N+1 クエリ（中）
</details>

<details>
<summary>xp-tester（高: 4 / 中: 6 / 低: 2）</summary>

### 評価サマリー
ドメイン層のユニットテストは境界値テストが丁寧。サービス層・View 層の異常系テストが薄い。

### テスト数概況
- Domain: 121 件（47%）、Service: 32 件（13%）、Repository: 30 件（12%）、View: 71 件（28%）

### 主要指摘
- `test_変更期限超過でエラー` のテスト名/内容矛盾（高）
- 品質期限アラート境界値テスト不足（高）
- 出荷済み注文の再出荷エラーテスト欠落（高）
- PurchasingService に FakeRepository 未導入（高）
- shipping Repository テストファイル不在（中）
- `date.today()` 直接依存によるフレーキーリスク（中）
</details>

<details>
<summary>xp-architect（高: 3 / 中: 3 / 低: 2）</summary>

### 評価サマリー
レイヤードアーキテクチャと DDD パターンに概ね忠実。設計ドキュメントとの乖離が複数。

### 良い点
- DIP が全アプリで守られている
- 値オブジェクトのビジネスルール実装が充実
- DI パターンの一貫した適用

### 主要指摘
- OrderStatus ORM/ドメイン不整合（高）
- Order モデルの設計ドキュメントとの構造的乖離（高、ADR 推奨）
- ShippingService の Composition ORM 直接参照（高）
- purchasing → inventory の境界コンテキスト間結合（中）
- トランザクション管理不足（懸念）
- 認証・認可の未実装（懸念）
</details>

<details>
<summary>xp-technical-writer（高: 3 / 中: 4 / 低: 2）</summary>

### 評価サマリー
コード内コメントと DDD 語彙の一貫性が高い。IT6 完了ドキュメントの欠落と設計書の陳腐化が課題。

### 良い点
- 全 .py ファイルに日本語 docstring
- エラーメッセージがアクション指向
- ユビキタス言語テーブルの日英対応

### 主要指摘
- IT6 完了報告書・ふりかえり欠落（高）
- domain-model.md の OrderStatus 不整合（高）
- data-model.md のステータス値不整合（高）
- user_story.md のチェックボックス未更新（低）
</details>

<details>
<summary>xp-user-representative（高: 3 / 中: 3 / 低: 2）</summary>

### 評価サマリー
基本的な受入条件は概ね達成。届け日変更時の在庫確認未実装と出荷通知がログのみの点が業務インパクト大。

### 良い点
- 発注登録の仕入先自動設定
- 入荷登録の差異表示
- 品質期限アラートの視覚的緊急度表現
- 結束一覧の二段構成（花材別＋注文別）
- ステータス別導線制御

### 主要指摘
- US-013 在庫確認・代替日提案が未実装（高）
- 出荷通知がログのみ（高）
- 出荷処理後のフィードバック欠如（高）
- 注文履歴の初期表示が空（中）
- 発注一覧が未入荷のみ（中）
- キャンセル画面の GET パラメータ未読み取り（懸念・バグ）
</details>

<details>
<summary>xp-interaction-designer（高: 4 / 中: 6 / 低: 1）</summary>

### 評価サマリー
Tailwind CSS による清潔感のあるデザイン。顧客/スタッフのナビゲーション分離欠如と注文確認画面未実装が深刻。

### 良い点
- ブランドカラー（pink-600）の一貫性
- 状態バッジの直感的色分け
- 二重送信防止処理
- 空状態メッセージ
- レスポンシブグリッド対応

### 主要指摘
- 顧客/スタッフナビゲーション混在（高）
- スタッフ画面のナビゲーション導線不足（高）
- 注文確認画面（C-07）未実装（高）
- テーブルの scope 属性欠落（高）
- 届け日の min 属性未設定（中）
- フォームの ARIA 属性不足（高）
</details>
