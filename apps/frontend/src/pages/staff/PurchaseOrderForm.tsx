import { useEffect, useState } from 'react';
import type { ItemInfo, PurchaseOrderInput, PurchaseOrderResult } from '../../types/purchase-order';

interface Props {
  itemId: number;
  fetchItemInfo: (itemId: number) => Promise<ItemInfo>;
  createPurchaseOrder: (input: PurchaseOrderInput) => Promise<PurchaseOrderResult>;
  onBack: () => void;
  onSuccess: (result: PurchaseOrderResult) => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function PurchaseOrderForm({
  itemId,
  fetchItemInfo,
  createPurchaseOrder,
  onBack,
  onSuccess,
}: Readonly<Props>) {
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchItemInfo(itemId).then(setItemInfo);
  }, [fetchItemInfo, itemId]);

  const enteredQuantity = quantity ? Number(quantity) : 0;
  const adjustedQuantity =
    itemInfo && enteredQuantity > 0
      ? Math.ceil(enteredQuantity / itemInfo.purchaseUnit) * itemInfo.purchaseUnit
      : null;
  const expectedArrivalDate = itemInfo
    ? (() => {
        const date = new Date();
        date.setDate(date.getDate() + itemInfo.leadTimeDays);
        return formatDate(date);
      })()
    : null;

  const handleSubmit = async () => {
    if (!quantity || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPurchaseOrder({
        itemId,
        quantity: Number(quantity),
      });
      onSuccess(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>発注画面</h2>
      </div>

      {itemInfo && (
        <div className="form-section">
          <div className="form-group">
            <span className="form-label">単品名</span>
            <div>{itemInfo.itemName}</div>
          </div>
          <div className="form-group">
            <span className="form-label">仕入先</span>
            <div>{itemInfo.supplierName}</div>
          </div>
          <div className="form-group">
            <span className="form-label">購入単位</span>
            <div>{itemInfo.purchaseUnit} 本</div>
          </div>
          <div className="form-group">
            <span className="form-label">リードタイム</span>
            <div>{itemInfo.leadTimeDays} 日</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="purchase-order-quantity">発注数量</label>
            <div className="form-input-group">
              <input
                id="purchase-order-quantity"
                className="form-input"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ maxWidth: '160px' }}
              />
              <span className="form-suffix">本</span>
            </div>
          </div>
          {adjustedQuantity !== null && (
            <p>自動調整後: {adjustedQuantity} 本（購入単位: {itemInfo.purchaseUnit} 本の倍数）</p>
          )}
          {expectedArrivalDate && (
            <p>入荷予定日: {expectedArrivalDate}（リードタイム: {itemInfo.leadTimeDays} 日）</p>
          )}
          <div className="form-actions">
            <button className="btn" onClick={onBack} disabled={isSubmitting}>戻る</button>
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={!quantity || isSubmitting}
            >
              発注する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
