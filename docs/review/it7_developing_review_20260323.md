# IT7 開発レビュー: 得意先シードデータ追加

- **レビュー日**: 2026-03-23
- **対象**: `DevDataInitializer.java` — 得意先2のシードデータ追加（+57行）
- **レビュアー**: xp-programmer, xp-tester, xp-architect, xp-technical-writer, xp-user-representative

## 総合評価

機能的に正しく動作し、べき等性も確保されたシードデータ追加。ただし、既存コードとのべき等性チェック方式の不整合（グローバル vs 顧客単位）が最も重要な技術的課題。また、届け先が全て本人名義というデータはデモの説得力を下げるため、業務観点での改善が必要。DRY 違反は今後の拡張を見据えて対応推奨。

## 改善提案（重要度順）

### 高（マージ前に対応すべき）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 1 | べき等性チェック方式の統一（`findAll` → `findByCustomerId` に統一） | `createSeedOrders()` vs `createSecondCustomerOrders()` | tester, architect | 1人目がグローバルチェック、2人目が個別チェックで不整合 |
| 2 | 得意先1の届け先を本人以外に変更 | `createSeedOrders()` 内の SeedOrderSpec | user-rep | 花屋の注文は「別の人に花を送る」のが主。US-015 のデモ効果が弱い |
| 3 | 得意先2の注文2の届け先を母親（別人物）に変更 | `createSecondCustomerOrders()` | user-rep | 「母の日のプレゼント」で本人宛は業務的に不自然 |

### 中（対応推奨）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 4 | `createCustomerUser` と `createSecondCustomerUser` をパラメータ化して統合 | 両メソッド | programmer, architect | DRY 違反。3人目追加時に `createThirdCustomerUser` が生まれる |
| 5 | `createSeedOrders` と `createSecondCustomerOrders` を汎用メソッドに抽出 | 両メソッド | programmer, architect | `createSeedOrdersFor(email, List<SeedOrderSpec>)` に集約可能 |
| 6 | サイレント早期リターンに `log.debug` 追加 | `createSecondCustomerOrders()` の3箇所 | tester | スキップ理由が外部から判別不能 |
| 7 | ログメッセージのフォーマット統一 | ログ出力全体 | tech-writer | 1人目と2人目でログの書式が異なる |
| 8 | 受注スタッフ「花子」と得意先2「鈴木花子」の同名問題 | ユーザーデータ全体 | user-rep | デモ時にロール説明が混乱する可能性 |

### 低（改善の余地あり）

| # | 提案 | 箇所 | 指摘元 | 理由 |
|---|------|------|--------|------|
| 9 | `java.time.LocalDate` の完全修飾名を import に統一 | `createSecondCustomerOrders()` | programmer | スタイルの一貫性 |
| 10 | メールアドレスリテラルの定数化 | 複数箇所 | tester | タイポ防止 |
| 11 | `run()` メソッドのカテゴリ別グループ化 | `run()` | programmer, architect | 肥大化傾向への予防 |

## 矛盾事項

| # | 視点 A | 視点 B | 論点 | 推奨判断 |
|---|--------|--------|------|----------|
| 1 | architect: YAGNI で現状維持も可 | programmer: 今すぐリファクタリング | DRY 違反への対応タイミング | 今回の変更で #4, #5 を対応推奨。データが2人分あるので汎用化の根拠は十分 |
