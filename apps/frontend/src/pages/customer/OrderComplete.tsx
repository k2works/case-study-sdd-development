import type { OrderDto } from '../../types/order';

interface Props {
  order: OrderDto;
  productName: string;
  onTop: () => void;
}

export function OrderComplete({ order, productName, onTop }: Readonly<Props>) {
  return (
    <div>
      <h2>注文が完了しました</h2>

      <div className="order-complete-section">
        <dl className="detail-list">
          <dt>注文番号</dt>
          <dd>{order.id}</dd>
          <dt>商品名</dt>
          <dd>{productName}</dd>
          <dt>価格</dt>
          <dd>¥{order.price.toLocaleString()}（税込）</dd>
          <dt>届け日</dt>
          <dd>{order.deliveryDate}</dd>
          <dt>届け先名</dt>
          <dd>{order.destination.name}</dd>
          <dt>届け先住所</dt>
          <dd>{order.destination.address}</dd>
          <dt>電話番号</dt>
          <dd>{order.destination.phone}</dd>
          <dt>お届けメッセージ</dt>
          <dd>{order.message}</dd>
        </dl>
      </div>

      <div className="form-actions">
        <button className="btn btn--primary" type="button" onClick={onTop}>
          トップページに戻る
        </button>
      </div>
    </div>
  );
}
