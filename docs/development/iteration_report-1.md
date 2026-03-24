# イテレーション 1 完了報告書

## 概要

| 項目 | 内容 |
| :--- | :--- |
| イテレーション | 1 |
| 期間 | Week 1-2 |
| ゴール | 開発環境を構築し、商品マスタ（単品・花束・構成）の CRUD を TDD で完成させる |
| 達成状況 | **完了** |

---

## 成果サマリー

### ストーリー達成状況

| ID | ユーザーストーリー | SP | 状態 |
| :--- | :--- | :--- | :--- |
| US-001 | 単品マスタを登録する | 3 | 完了 |
| US-002 | 商品（花束）を登録する | 3 | 完了 |
| US-003 | 花束構成を定義する | 3 | 完了 |
| **合計** | | **9** | **100%** |

### ベロシティ

| 指標 | 値 |
| :--- | :--- |
| 計画 SP | 9 |
| 完了 SP | 9 |
| ベロシティ | 9 SP/IT |
| 達成率 | 100% |

---

## 技術成果

### 実装済みコンポーネント

| レイヤー | コンポーネント | ファイル数 |
| :--- | :--- | :--- |
| ドメイン層 | 値オブジェクト 6 個（ItemName, QualityRetentionDays, PurchaseUnit, LeadTimeDays, ProductName, Price） | 1 |
| ドメイン層 | エンティティ 4 個（Supplier, Item, Product, Composition） | 1 |
| ドメイン層 | Repository インターフェース 3 個（ItemRepository, SupplierRepository, ProductRepository） | 1 |
| インフラ層 | Django ORM Model 4 個（Supplier, Item, Product, Composition） | 1 |
| インフラ層 | Repository 実装 3 個（DjangoSupplierRepository, DjangoItemRepository, DjangoProductRepository） | 1 |
| プレゼン層 | Django Admin 4 モデル登録（CompositionInline 含む） | 1 |
| プレゼン層 | DRF Serializer 5 個 + ViewSet 3 個 + URL ルーティング | 3 |

### API エンドポイント

| メソッド | パス | 説明 |
| :--- | :--- | :--- |
| GET | `/api/products/` | 商品一覧（有効な商品のみ、認証不要） |
| GET | `/api/products/{id}/` | 商品詳細（構成花材含む、認証不要） |
| GET | `/api/items/` | 単品一覧（有効な単品のみ） |
| GET | `/api/items/{id}/` | 単品詳細 |
| GET | `/api/suppliers/` | 仕入先一覧 |
| GET | `/api/suppliers/{id}/` | 仕入先詳細 |

### 品質メトリクス

| メトリクス | 値 | 目標 |
| :--- | :--- | :--- |
| テスト数 | 70 | - |
| テストカバレッジ | 97% | 80% |
| ドメイン層カバレッジ | 100% | 90% |
| Ruff lint エラー | 0 | 0 |
| SonarQube 違反 | 0 | 0 |
| SonarQube Quality Gate | OK | OK |
| SonarQube 重複率 | 0% | < 3% |

### テスト内訳

| カテゴリ | テスト数 | 対象 |
| :--- | :--- | :--- |
| ドメイン（値オブジェクト） | 30 | ItemName, QualityRetentionDays, PurchaseUnit, LeadTimeDays, ProductName, Price |
| ドメイン（エンティティ） | 19 | Supplier, Item, Product, Composition |
| 統合（Repository） | 9 | DjangoSupplierRepository, DjangoItemRepository, DjangoProductRepository |
| API | 10 | SupplierAPI, ItemAPI, ProductAPI |
| スモーク | 2 | Django settings, app config |
| **合計** | **70** | |

---

## コミット履歴

| コミット | 内容 |
| :--- | :--- |
| `2e575c0` | Django プロジェクト初期セットアップ |
| `63dbbb3` | コードレビュー指摘に基づく初期セットアップ修正 |
| `760c81d` | husky + lint-staged で Python 品質チェックを pre-commit に追加 |
| `f2ef043` | 単品ドメイン層を TDD で実装 |
| `1564207` | US-001 単品マスタのインフラ層・プレゼンテーション層を実装 |
| `50ebadf` | US-002 商品（花束）の全層を TDD で実装 |
| `4f03592` | US-003 花束構成定義の全層を TDD で実装 |
| `50f9ffa` | SonarQube スキャン設定と品質指摘の修正 |

---

## 学習事項

- **Django 5.2 LTS の制約**: `django>=5.2` だけでは 6.x がインストールされる。`>=5.2,<6` の上限制約が必須
- **dataclass(frozen=True)**: 値オブジェクトの不変性・等価性を自然に実現できるパターン。全値オブジェクトで採用
- **DOCKER_HOST 環境変数**: Docker Desktop 使用時に干渉する。Git Bash からの Docker 操作は Named Pipe パスの解釈問題がある
- **SonarQube Python S125**: docstring のみのファイルを誤検知。1 行コメントに変更して回避

---

## 次のイテレーション（IT2）への引き継ぎ

### IT2 の対象ストーリー（リリース計画より）

| ID | ユーザーストーリー | SP |
| :--- | :--- | :--- |
| US-004 | 商品を選択する | 3 |
| US-005 | 届け日・届け先・メッセージを入力して注文する | 5 |
| US-007 | 在庫推移を確認する（一部） | 8（分割予定） |

### IT2 開始前の準備事項

- [ ] .gitignore の整備（`__pycache__`、`.coverage`、`db.sqlite3`）
- [ ] GitHub Actions ワークフローの作成（Lint + テスト + カバレッジ）
- [ ] IT2 イテレーション計画の作成
