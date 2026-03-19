import { useState, useEffect } from 'react';
import type { OrderDto } from '../../types/order';

interface DeliveryDateChangeResult {
  success: boolean;
  reason?: string;
  order?: {
    orderId: number;
    deliveryDate: string;
    shippingDate: string;
    status: string;
  };
}

interface Props {
  orderId: number;
  fetchOrder: (id: number) => Promise<OrderDto>;
  onBack: () => void;
  changeDeliveryDate?: (orderId: number, newDeliveryDate: string) => Promise<DeliveryDateChangeResult>;
  cancelOrder?: (orderId: number) => Promise<{ success: boolean; reason?: string }>;
  onNavigateToStockForecast?: () => void;
}

export function OrderDetail({ orderId, fetchOrder, onBack, changeDeliveryDate, cancelOrder, onNavigateToStockForecast }: Readonly<Props>) {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [changeResult, setChangeResult] = useState<DeliveryDateChangeResult | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchOrder(orderId).then(setOrder);
  }, [orderId, fetchOrder]);

  const handleChangeDeliveryDate = async () => {
    if (!changeDeliveryDate || !newDeliveryDate) return;

    const result = await changeDeliveryDate(orderId, newDeliveryDate);
    setChangeResult(result);

    if (result.success && result.order) {
      const updated = await fetchOrder(orderId);
      setOrder(updated);
      setNewDeliveryDate('');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrder) return;

    const result = await cancelOrder(orderId);
    setShowCancelDialog(false);

    if (result.success) {
      const updated = await fetchOrder(orderId);
      setOrder(updated);
    }
  };

  if (!order) {
    return <div>読み込み中...</div>;
  }

  const canChangeDeliveryDate = order.status === '注文済み' && changeDeliveryDate;
  const canCancel = order.status === '注文済み' && cancelOrder;
  const isStockShortage = changeResult && !changeResult.success && changeResult.reason?.includes('在庫');

  return (
    <div>
      <h2>受注詳細</h2>

      <div className="order-detail-section">
        <dl className="detail-list">
          <dt>受注ID</dt>
          <dd>{order.id}</dd>
          <dt>商品</dt>
          <dd>{order.productName}</dd>
          <dt>状態</dt>
          <dd>{order.status}</dd>
          <dt>価格</dt>
          <dd>¥{order.price.toLocaleString()}（税込）</dd>
          <dt>届け日</dt>
          <dd>{order.deliveryDate}</dd>
          <dt>出荷日</dt>
          <dd>{order.shippingDate}</dd>
          <dt>届け先名</dt>
          <dd>{order.destination.name}</dd>
          <dt>届け先住所</dt>
          <dd>{order.destination.address}</dd>
          <dt>電話番号</dt>
          <dd>{order.destination.phone}</dd>
          <dt>メッセージ</dt>
          <dd>{order.message}</dd>
        </dl>
      </div>

      {canChangeDeliveryDate && (
        <div className="form-section">
          <h3>届け日変更</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="new-delivery-date">新しい届け日</label>
            <input
              className="form-input"
              id="new-delivery-date"
              type="date"
              value={newDeliveryDate}
              onChange={(e) => {
                setNewDeliveryDate(e.target.value);
                setChangeResult(null);
              }}
              style={{ maxWidth: '200px' }}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn btn--primary"
              type="button"
              onClick={handleChangeDeliveryDate}
              disabled={!newDeliveryDate}
            >
              届け日を変更する
            </button>
          </div>
          {changeResult && !changeResult.success && changeResult.reason && (
            <div>
              <p className="error-message" style={{ color: 'red', marginTop: '0.5rem' }}>
                {changeResult.reason}
              </p>
              {isStockShortage && onNavigateToStockForecast && (
                <button
                  className="btn btn--link"
                  type="button"
                  onClick={onNavigateToStockForecast}
                  style={{ marginTop: '0.25rem' }}
                >
                  在庫推移を確認
                </button>
              )}
            </div>
          )}
          {changeResult?.success && (
            <p style={{ color: 'green', marginTop: '0.5rem' }}>
              届け日を変更しました
            </p>
          )}
        </div>
      )}

      <div className="form-actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn" type="button" onClick={onBack}>戻る</button>
        {canCancel && (
          <button
            className="btn btn--danger"
            type="button"
            onClick={() => setShowCancelDialog(true)}
            style={{ color: 'red' }}
          >
            キャンセル
          </button>
        )}
      </div>

      {showCancelDialog && (
        <div className="cancel-dialog" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p><strong>この注文をキャンセルしますか？</strong></p>
          <p>引当済みの在庫は有効在庫に戻されます。この操作は取り消せません。</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className="btn"
              type="button"
              onClick={() => setShowCancelDialog(false)}
            >
              いいえ
            </button>
            <button
              className="btn btn--danger"
              type="button"
              onClick={handleCancelOrder}
              style={{ color: 'red' }}
            >
              はい、キャンセルする
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
