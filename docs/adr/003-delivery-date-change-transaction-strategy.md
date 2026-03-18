# ADR-003: 届け日変更時のトランザクション方針

届け日変更処理（IT5-S05）は単一集約の更新のみのため、Prisma のデフォルトトランザクションで運用する。在庫引当の解除・再引当を伴う高度な変更（S06）は IT6 で `prisma.$transaction` を導入する。

日付: 2026-03-18

## ステータス

承認済み

## コンテキスト

S05「届け日変更を依頼する」機能の実装にあたり、届け日変更時のトランザクション境界を明確にする必要がある。

### 現在の処理フロー（S05 MVP スコープ）

1. `OrderRepository.findById()` で受注を取得（読み取り）
2. `DeliveryDateChangeValidator.validate()` で変更可否を判定（インメモリ）
   - 状態チェック: 「注文済み」以外は変更不可
   - 日付チェック: 新しい出荷日（= 届け日 - 1 日）が過去の場合は変更不可
3. `Order.changeDeliveryDate(newDate)` で届け日・出荷日を更新（インメモリ）
4. `OrderRepository.save()` で受注を永続化（書き込み）

### 将来の処理フロー（S06 在庫ベース判定スコープ）

1-4 に加え:

5. `StockLotRepository.findByOrderId()` で引当済みロットを取得
6. 各ロットの `deallocate()` で引当解除（引当済み → 有効）
7. 新しい出荷日に基づく引当可否チェック（品質維持期限 >= 新出荷日）
8. FIFO で再引当（有効 → 引当済み）
9. 引当済みロットを保存

### 考慮すべき点

- ADR-001 で「単一集約の保存のみの場合はデフォルトトランザクション」と決定済み
- S05 の MVP スコープ（状態チェック + 日付チェック）は **Order テーブルへの UPDATE 1 件のみ** で完結する
- S06 の在庫ベース判定は **Order テーブル + Stock テーブルの複数行更新** が必要（複数集約にまたがる操作）
- IT4 の ArrivalUseCase では、入荷登録時に PurchaseOrder + Arrival + StockLot の 3 テーブルを更新しているが、明示的トランザクション制御は未導入（各 Repository が個別に save を実行）
- XP レビューで「引当解除後に再引当が失敗した場合のロールバック」が重要な懸念として指摘された

## 決定

### Phase 1: S05 MVP（IT5）

**Order の届け日・出荷日更新のみを行い、Prisma のデフォルトトランザクションを使用する。在庫引当の解除・再引当は行わない。**

理由:

1. **単一集約の保存**: S05 MVP は `orders` テーブルへの `UPDATE` 1 件のみであり、ADR-001 の方針と一致
2. **段階的な複雑性導入**: 在庫引当再計算という最も複雑なロジックを分離することで、IT5 のベロシティリスクを軽減
3. **業務上の許容性**: 届け日を変更しても、既存の引当は出荷日まで有効。出荷日が変わった場合の在庫再計算は S06 で対応

### Phase 2: S06 在庫ベース判定（IT6）

**在庫引当の解除・再引当を含む届け日変更では、`prisma.$transaction` のコールバック方式を使用する。**

導入パターン:

```typescript
// S06 で導入する明示的トランザクション
async changeDeliveryDateWithReallocation(orderId: OrderId, newDate: Date): Promise<ChangeResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. 受注取得
    const order = await orderRepo.findById(orderId, tx);
    // 2. 引当済みロット取得
    const allocatedLots = await stockLotRepo.findByOrderId(orderId, tx);
    // 3. 引当解除
    const deallocatedLots = allocatedLots.map(lot => lot.deallocate());
    // 4. 新出荷日で引当可否チェック + 再引当
    // 5. 全ロット保存
    // 6. Order 更新
    // ※ いずれかのステップで失敗した場合、全体がロールバック
  });
}
```

選択理由:

- `prisma.$transaction` のコールバック方式は、複数の Repository 操作を単一トランザクション内で実行できる
- Prisma Client インスタンス（`tx`）を各 Repository メソッドに渡すことで、既存のリポジトリインターフェースを大きく変更せずに済む
- ADR-001 で定義した「将来のトランザクション導入基準」の条件（複数テーブルへの書き込み + ロールバック要件）を満たす

### 変更箇所

**IT5（S05）で必要な変更:**

- `Order.changeDeliveryDate(newDate)`: 新メソッド追加（ドメイン層）
- `DeliveryDateChangeValidator`: 新クラス追加（ドメイン層）
- `OrderUseCase.changeDeliveryDate()`: 新メソッド追加（アプリケーション層）
- `StockLot.deallocate()`: 新メソッド追加（ドメイン層、S06 準備）

**IT6（S06）で必要な変更:**

- `OrderRepository.findById(id, tx?)`: トランザクションコンテキストの optional パラメータ追加
- `StockLotRepository.findByOrderId(orderId, tx?)`: 同上
- `StockLotRepository.save(lot, tx?)`: 同上
- `OrderUseCase.changeDeliveryDateWithReallocation()`: 新メソッド追加

### 代替案

| 代替案 | 却下理由 |
|--------|---------|
| S05 で在庫引当再計算も含めて実装 | 8 SP がベロシティ上限ギリギリであり、在庫引当再計算の複雑さを加えるとスコープ超過のリスクが高い |
| Unit of Work パターンを導入 | プロジェクトの規模に対してオーバーエンジニアリング。Prisma の `$transaction` で十分 |
| 2 フェーズコミット（Saga パターン） | 単一 DB 内の操作であり、分散トランザクションは不要 |
| S05 で引当解除のみ実行し、再引当を別プロセスで実行 | 引当解除と再引当の間にデータ不整合が生じるリスクがあり、ユーザー体験が悪い |

## 影響

### ポジティブ

- S05 の実装がシンプルになり、IT5 のベロシティリスクが軽減される
- ADR-001 の方針と一貫性が保たれる
- S06 でのトランザクション導入が段階的かつ計画的に行える
- `StockLot.deallocate()` を IT5 で先行実装することで、S06 の基盤が整う

### ネガティブ

- S05 完了時点では、届け日変更後の在庫引当が不整合になる可能性がある（古い出荷日の引当が残る）
- S06 完了まで、届け日変更の業務フローが不完全（受注スタッフが手動で在庫状況を確認する必要がある）
- S06 で Repository インターフェースに `tx?` パラメータを追加する際、既存の呼び出し箇所への影響がある

## コンプライアンス

- S05 の E2E テストで、届け日変更後に Order の deliveryDate/shippingDate が正しく更新されることを検証する
- S05 の単体テストで、DeliveryDateChangeValidator の 6 パターン（状態制約 3 + 日付制約 1 + 正常系 2）を検証する
- S06 実装時に、トランザクションのロールバックテスト（引当解除後の再引当失敗 → 全体ロールバック）を必ず含める

## 備考

- 関連 ADR: [ADR-001: 発注作成時のトランザクション方針](./001-purchase-order-transaction-strategy.md)
- 関連計画: [IT5 計画](../development/iteration_plan-5.md)
- XP レビュー指摘: Architect H3（トランザクション設計未定義）への対応
