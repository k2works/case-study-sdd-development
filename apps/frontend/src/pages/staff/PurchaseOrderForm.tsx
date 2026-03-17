import { useState } from 'react';
import type { ItemDto } from '../../types/item';
import type { CreatePurchaseOrderInput, PurchaseOrderDto } from '../../types/purchase-order';

interface PurchaseOrderFormProps {
  item: ItemDto;
  createPurchaseOrder: (input: CreatePurchaseOrderInput) => Promise<PurchaseOrderDto>;
  onBack: () => void;
  onComplete: () => void;
}

export function PurchaseOrderForm({ item, createPurchaseOrder, onBack, onComplete }: PurchaseOrderFormProps) {
  const [quantity, setQuantity] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const adjustedQuantity = quantity > 0
    ? Math.ceil(quantity / item.purchaseUnit) * item.purchaseUnit
    : 0;

  const handleSubmit = async () => {
    if (quantity <= 0) return;
    setSubmitting(true);
    try {
      await createPurchaseOrder({ itemId: item.id, quantity });
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="purchase-order-form">
      <h2>発注</h2>

      <dl>
        <dt>単品名</dt>
        <dd>{item.name}</dd>
        <dt>購入単位</dt>
        <dd>{item.purchaseUnit}本</dd>
        <dt>リードタイム</dt>
        <dd>{item.leadTimeDays}日</dd>
      </dl>

      <label>
        発注数量
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          min={0}
        />
      </label>

      {quantity > 0 && (
        <p>{adjustedQuantity}本（購入単位: {item.purchaseUnit}本の倍数）</p>
      )}

      <div className="purchase-order-form__actions">
        <button onClick={onBack}>戻る</button>
        <button onClick={handleSubmit} disabled={quantity <= 0 || submitting}>
          発注する
        </button>
      </div>
    </div>
  );
}
