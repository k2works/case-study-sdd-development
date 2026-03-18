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
}

export function OrderDetail({ orderId, fetchOrder, onBack, changeDeliveryDate }: Readonly<Props>) {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [changeResult, setChangeResult] = useState<DeliveryDateChangeResult | null>(null);

  useEffect(() => {
    fetchOrder(orderId).then(setOrder);
  }, [orderId, fetchOrder]);

  const handleChangeDeliveryDate = async () => {
    if (!changeDeliveryDate || !newDeliveryDate) return;

    const result = await changeDeliveryDate(orderId, newDeliveryDate);
    setChangeResult(result);

    if (result.success && result.order) {
      // 注文情報を再取得して最新状態に更新
      const updated = await fetchOrder(orderId);
      setOrder(updated);
      setNewDeliveryDate('');
    }
  };

  if (!order) {
    return <div>読み込み中...</div>;
  }

  const canChangeDeliveryDate = order.status === '注文済み' && changeDeliveryDate;

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
            <p className="error-message" style={{ color: 'red', marginTop: '0.5rem' }}>
              {changeResult.reason}
            </p>
          )}
          {changeResult?.success && (
            <p style={{ color: 'green', marginTop: '0.5rem' }}>
              届け日を変更しました
            </p>
          )}
        </div>
      )}

      <div className="form-actions">
        <button className="btn" type="button" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
}
