# フロントエンドアーキテクチャ - フレール・メモワール WEB ショップシステム

## アーキテクチャ方針

### 選定結果

| 項目 | 選定 |
| :--- | :--- |
| レンダリング方式 | Django Template（SSR）+ HTMX |
| スタイリング | Tailwind CSS |
| インタラクション | HTMX + Alpine.js |
| 管理画面 | Django Admin（カスタマイズ） |
| テスト | Playwright（E2E）、pytest（テンプレートテスト） |

### 選定理由

**Django Template + HTMX を選定した理由**:

- Django モノリシックアーキテクチャとの親和性が最も高い
- SPA フレームワーク（React/Vue）を導入すると、フロントエンドとバックエンドの分離が必要になり、小規模チームの負担が増大する
- HTMX は HTML 属性ベースでサーバーサイドレンダリングを拡張でき、JavaScript を最小限に抑えられる
- Alpine.js は軽量な JavaScript フレームワークで、カレンダー選択等の局所的なインタラクションに適している
- SEO はフラワーショップの WEB ショップとして重要であり、SSR が有利

**Django Admin を管理画面に選定した理由**:

- モデル定義から自動的に CRUD 画面が生成される
- カスタマイズ性が高く、在庫推移表示等のカスタム画面も追加可能
- 認証・認可が標準装備
- スタッフ向けの管理機能を最小限の工数で実現できる

## 画面構成

### 顧客向け画面（得意先用）

```plantuml
@startuml

title 顧客向け画面遷移図

[*] --> ログイン

state ログイン : メールアドレス + パスワード
ログイン --> 新規登録 : アカウント作成
新規登録 --> ログイン : 登録完了
ログイン --> 商品一覧 : ログイン成功

state 商品一覧 : 花束の一覧表示
商品一覧 --> 商品詳細 : 商品選択

state 商品詳細 : 花束の構成花材・価格・説明
商品詳細 --> 注文入力 : 注文へ進む

state 注文入力 {
  [*] --> 届け日選択
  届け日選択 --> 届け先入力
  届け先入力 --> メッセージ入力
  メッセージ入力 --> 注文確認
}

注文入力 --> 注文完了 : 注文確定
注文入力 --> 届け先選択 : 過去の届け先を利用

state 届け先選択 : 過去の届け先一覧
届け先選択 --> 注文入力 : 届け先コピー

state 注文完了 : 注文番号表示・確認メール送信
注文完了 --> 注文履歴 : 注文履歴へ
注文完了 --> 商品一覧 : 買い物を続ける

state 注文履歴 : 注文一覧（ステータス付き）
注文履歴 --> 注文詳細 : 注文選択

state 注文詳細 : 注文内容・ステータス
注文詳細 --> 届け日変更 : 変更
注文詳細 --> キャンセル確認 : キャンセル

商品一覧 --> 注文履歴 : マイページ
注文履歴 --> 商品一覧 : 商品一覧へ

ログイン --> [*] : ログアウト

@enduml
```

### 管理画面（スタッフ用）

```plantuml
@startuml

title 管理画面構成

[*] --> ダッシュボード

state ダッシュボード : 本日の出荷対象件数\n品質維持期限アラート\n未処理受注件数

ダッシュボード --> 受注管理 : 受注
ダッシュボード --> 在庫推移 : 在庫
ダッシュボード --> 商品管理 : 商品
ダッシュボード --> 発注管理 : 発注
ダッシュボード --> 結束一覧 : 結束
ダッシュボード --> 出荷管理 : 出荷

state 受注管理 : 受注一覧（ステータス絞込）\n受注詳細\n届け日変更・キャンセル対応

state 在庫推移 : 単品ごとの日別在庫推移\n品質維持期限アラート

state 商品管理 {
  [*] --> 商品一覧
  商品一覧 --> 商品編集
  商品一覧 --> 単品管理
  商品一覧 --> 花束構成
}

state 発注管理 : 発注登録\n発注一覧\n入荷登録

state 結束一覧 : 出荷日の結束対象\n花材別必要総数量

state 出荷管理 : 出荷対象一覧\n出荷処理・通知送信

@enduml
```

## テンプレート構成

```
templates/
├── base.html                    # 共通レイアウト
├── components/                  # 再利用可能コンポーネント
│   ├── _navbar.html
│   ├── _footer.html
│   ├── _pagination.html
│   └── _alert.html
├── shop/                        # 顧客向け
│   ├── product_list.html
│   ├── product_detail.html
│   ├── order_form.html
│   ├── order_confirm.html
│   ├── order_complete.html
│   ├── order_history.html
│   ├── order_detail.html
│   ├── delivery_address_list.html
│   └── partials/               # HTMX 部分更新用
│       ├── _delivery_date_picker.html
│       ├── _delivery_address_copy.html
│       └── _order_status.html
├── accounts/                    # 認証
│   ├── login.html
│   └── register.html
└── admin/                       # Django Admin カスタマイズ
    └── inventory/
        └── stock_forecast.html  # 在庫推移カスタム画面
```

## HTMX によるインタラクション

### 届け日選択の動的更新

```html
<!-- 商品選択後、届け日カレンダーを動的更新 -->
<select name="product" hx-get="/api/available-dates/" hx-target="#date-picker">
  {% for product in products %}
  <option value="{{ product.id }}">{{ product.name }}</option>
  {% endfor %}
</select>
<div id="date-picker">
  <!-- HTMX でサーバーから届け日候補を取得して差し替え -->
</div>
```

### 届け先コピーの非同期読み込み

```html
<!-- 過去の届け先一覧を HTMX で非同期取得 -->
<button hx-get="/api/delivery-addresses/"
        hx-target="#address-form"
        hx-swap="outerHTML">
  過去の届け先を利用
</button>
```

## レスポンシブ対応

| 画面 | 対応方針 |
| :--- | :--- |
| 顧客向け画面 | モバイルファースト（Tailwind CSS のレスポンシブユーティリティ） |
| 管理画面 | デスクトップ優先（Django Admin のデフォルトレスポンシブ対応） |
| 結束一覧 | タブレット対応（作業場での利用を想定） |

## テスト戦略

| テスト種別 | 対象 | ツール |
| :--- | :--- | :--- |
| テンプレートテスト | HTML 出力の正確性 | pytest-django (assertContains) |
| HTMX テスト | 部分更新の正確性 | pytest-django (hx-target 検証) |
| E2E テスト | 注文フロー全体 | Playwright |
| アクセシビリティ | WCAG 2.1 AA | axe-core (Playwright 連携) |
