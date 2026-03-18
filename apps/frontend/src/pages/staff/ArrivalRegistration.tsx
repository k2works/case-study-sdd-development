import { useEffect, useState, useCallback } from 'react';
import type { PurchaseOrderRecord, RegisterArrivalInput, RegisterArrivalResult } from '../../types/arrival';
import type { ItemDto } from '../../types/item';

interface Props {
  fetchPurchaseOrders: () => Promise<PurchaseOrderRecord[]>;
  fetchItems: () => Promise<ItemDto[]>;
  registerArrival: (input: RegisterArrivalInput) => Promise<RegisterArrivalResult>;
  onSuccess: () => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ArrivalRegistration({
  fetchPurchaseOrders,
  fetchItems,
  registerArrival,
  onSuccess,
}: Readonly<Props>) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderRecord | null>(null);
  const [quantity, setQuantity] = useState('');
  const [arrivalDate, setArrivalDate] = useState(formatDate(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    Promise.all([fetchPurchaseOrders(), fetchItems()])
      .then(([pos, its]) => {
        setPurchaseOrders(pos);
        setItems(its);
      })
      .catch(() => setError('データの取得に失敗しました。'));
  }, [fetchPurchaseOrders, fetchItems]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getItemName = (itemId: number): string => {
    const item = items.find((i) => i.id === itemId);
    return item?.name ?? `単品 ${itemId}`;
  };

  const handleSelectPO = (po: PurchaseOrderRecord) => {
    setSelectedPO(po);
    setQuantity(String(po.quantity));
    setArrivalDate(formatDate(new Date()));
    setError(null);
  };

  const handleCancel = () => {
    setSelectedPO(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPO || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await registerArrival({
        purchaseOrderId: selectedPO.purchaseOrderId,
        quantity: Number(quantity),
        arrivalDate,
      });
      setSelectedPO(null);
      onSuccess();
      loadData();
    } catch (e) {
      setError((e as Error).message || '入荷登録に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>入荷登録</h2>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {!selectedPO && (
        <>
          {purchaseOrders.length === 0 ? (
            <p>発注済みの発注はありません。</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>発注 ID</th>
                  <th>単品名</th>
                  <th>発注数量</th>
                  <th>入荷予定日</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.purchaseOrderId}>
                    <td>{po.purchaseOrderId}</td>
                    <td>{getItemName(po.itemId)}</td>
                    <td>{po.quantity} 本</td>
                    <td>{po.expectedArrivalDate}</td>
                    <td>
                      <button
                        className="btn btn--sm"
                        onClick={() => handleSelectPO(po)}
                      >
                        入荷登録
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {selectedPO && (
        <div className="form-section">
          <div className="form-group">
            <span className="form-label">単品名</span>
            <div>{getItemName(selectedPO.itemId)}</div>
          </div>
          <div className="form-group">
            <span className="form-label">発注数量</span>
            <div>{selectedPO.quantity} 本</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="arrival-quantity">入荷数量</label>
            <div className="form-input-group">
              <input
                id="arrival-quantity"
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
          <div className="form-group">
            <label className="form-label" htmlFor="arrival-date">入荷日</label>
            <input
              id="arrival-date"
              className="form-input"
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
          </div>
          <div className="form-actions">
            <button className="btn" onClick={handleCancel} disabled={isSubmitting}>
              キャンセル
            </button>
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={!quantity || Number(quantity) <= 0 || isSubmitting}
            >
              登録する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
