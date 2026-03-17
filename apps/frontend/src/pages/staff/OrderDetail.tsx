import { useState, useEffect } from 'react';
import type { OrderDto } from '../../types/order';

interface Props {
  orderId: number;
  fetchOrder: (id: number) => Promise<OrderDto>;
  onBack: () => void;
}

export function OrderDetail({ orderId, fetchOrder, onBack }: Readonly<Props>) {
  const [order, setOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    fetchOrder(orderId).then(setOrder);
  }, [orderId, fetchOrder]);

  if (!order) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h2>受注詳細</h2>

      <div className="order-detail-section">
        <dl className="detail-list">
          <dt>受注ID</dt>
          <dd>{order.id}</dd>
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

      <div className="form-actions">
        <button className="btn" type="button" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
}
