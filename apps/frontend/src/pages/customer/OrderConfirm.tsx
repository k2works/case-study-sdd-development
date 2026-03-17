import { useState } from 'react';
import type { OrderFormProduct, OrderFormData } from './OrderForm';

interface Props {
  product: OrderFormProduct;
  formData: OrderFormData;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

export function OrderConfirm({ product, formData, onBack, onSubmit }: Readonly<Props>) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>注文確認</h2>

      <div className="order-confirm-section">
        <h3>商品情報</h3>
        <dl className="detail-list">
          <dt>商品名</dt>
          <dd>{product.name}</dd>
          <dt>価格</dt>
          <dd>¥{product.price.toLocaleString()}（税込）</dd>
        </dl>
      </div>

      <div className="order-confirm-section">
        <h3>お届け情報</h3>
        <dl className="detail-list">
          <dt>届け日</dt>
          <dd>{formData.deliveryDate}</dd>
          <dt>届け先名</dt>
          <dd>{formData.destinationName}</dd>
          <dt>届け先住所</dt>
          <dd>{formData.destinationAddress}</dd>
          <dt>電話番号</dt>
          <dd>{formData.destinationPhone}</dd>
          <dt>メッセージ</dt>
          <dd>{formData.message}</dd>
        </dl>
      </div>

      <div className="form-actions">
        <button className="btn" type="button" onClick={onBack}>修正する</button>
        <button
          className="btn btn--primary"
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '送信中...' : '注文を確定する'}
        </button>
      </div>
    </div>
  );
}
