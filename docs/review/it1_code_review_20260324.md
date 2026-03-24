# IT1 コードレビュー結果

## レビュー対象

- `apps/webshop/apps/products/` 配下の全ファイル（ドメイン層・インフラ層・プレゼンテーション層・テスト）

## 総合評価

IT1 の成果物は高品質。ドメイン層の独立性、TDD の規律、テストピラミッドのバランスはいずれも適切。値オブジェクトの設計、Repository パターンの適用、テスト名の仕様性は模範的。主要な技術的負債は **Product 集約の Composition 永続化の欠落** と **サービス層の不在** の 2 点で、IT2 開始前に対応すべき。

## 改善提案（重要度順）

### 高（IT2 開始前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| H-01 | ProductRepository に Composition の読み書きを追加 | repositories.py | programmer, tester, architect | find_by_id で compositions が空リスト。get_required_items() が機能しない |
| H-02 | Repository の save で新規/更新判別を id: int \| None に変更 | entities.py, repositories.py | programmer | id=0 の暗黙規約が脆弱。None を「未保存」とする |
| H-03 | Supplier.name を SupplierName 値オブジェクトに統一 | entities.py, value_objects.py | programmer, architect | 他エンティティとの設計一貫性 |
| H-04 | remove_composition の存在しない item_id のテスト追加 | test_domain.py | tester | 仕様の明示化（サイレント無視 or エラー） |
| H-05 | Composition の境界値テスト補完（負数、quantity=1） | test_domain.py | tester | 境界値分析の欠落 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| M-01 | ViewSet → Service 層経由パターンの ADR 記録 | services.py | programmer, architect | IT2 で書き込み操作時にドメイン層形骸化リスク |
| M-02 | SupplierViewSet を削除 or スタッフ権限制御追加 | views.py, urls.py | architect | 仕入先連絡先が認証なしで公開 |
| M-03 | API テストに POST/PUT/DELETE 拒否テスト追加 | test_views.py | tester | ReadOnly の意図を回帰テストで保護 |
| M-04 | is_near_expiry の期限当日・期限超過テスト追加 | test_domain.py | tester | エッジケースの欠落 |
| M-05 | API テストで reverse() を使用 | test_views.py | programmer | URL ハードコードの脆弱性 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| L-01 | is_near_expiry のマジックナンバー 2 を定数化 | value_objects.py | programmer | ビジネスルールの可読性 |
| L-02 | テストフィクスチャのヘルパー関数共通化 | test_domain.py | programmer, tester | ボイラープレートの削減 |
| L-03 | Price の小数精度テスト追加 | test_domain.py | tester | Decimal の精度整合性 |
| L-04 | domain/__init__.py で公開 API を明示 | domain/__init__.py | architect | import パスの統一 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | programmer: ItemName/ProductName の基底クラス抽出 | 将来の分岐可能性 | DRY vs YAGNI | 現状維持。3 回目の重複（SupplierName 導入時）でリファクタリング |
| 2 | architect: views → service 層経由 | programmer: DRF の利便性 | ドメイン純粋性 vs 実用性 | IT1 は現状維持。IT2 で書き込み API 追加時にサービス層導入 |

## エージェント別フィードバック詳細

<details>
<summary>xp-programmer（高: 3 / 中: 2 / 低: 2）</summary>

ドメイン層の独立性、値オブジェクトの設計、Repository パターンの適用を高く評価。主要な指摘は ItemName/ProductName の DRY 違反、Supplier.name の値オブジェクト未適用、Repository save の新規/更新判別の脆弱性、Composition 永続化の欠落。ViewSet の ORM 直接依存は DRF の流儀として現実的な判断と認めつつ、書き込み API 追加時の移行を推奨。
</details>

<details>
<summary>xp-tester（高: 3 / 中: 3 / 低: 2）</summary>

テストピラミッドのバランス（63/17/20%）、境界値テストの充実、テスト名の仕様性を高く評価。主要な指摘は remove_composition の仕様不明確、Composition 境界値テストの欠落、Repository の Composition 永続化テスト欠落。API テストでの POST/PUT/DELETE 拒否テスト、is_near_expiry のエッジケーステストの追加を推奨。
</details>

<details>
<summary>xp-architect（高: 2 / 中: 2 / 低: 2）</summary>

4 層レイヤードアーキテクチャへの準拠度を高く評価。データモデルとの整合性も良好。主要な指摘は Product 集約の Composition 永続化の欠落（集約パターンの不変条件違反）、サービス層不在による設計パターン逸脱リスク。SupplierViewSet の仕入先情報公開をセキュリティ上の懸念として指摘。
</details>
