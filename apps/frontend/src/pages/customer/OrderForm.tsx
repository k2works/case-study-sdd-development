import { useState } from 'react';

export interface OrderFormProduct {
  id: number;
  name: string;
  price: number;
}

export interface OrderFormData {
  deliveryDate: string;
  destinationName: string;
  destinationAddress: string;
  destinationPhone: string;
  message: string;
}

interface Props {
  product: OrderFormProduct;
  onBack: () => void;
  onConfirm: (data: OrderFormData) => void;
}

function getMinDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split('T')[0];
}

export function OrderForm({ product, onBack, onConfirm }: Readonly<Props>) {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationPhone, setDestinationPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirm({
      deliveryDate,
      destinationName,
      destinationAddress,
      destinationPhone,
      message,
    });
  };

  return (
    <div>
      <h2>注文入力</h2>
      <div className="order-product-info">
        <h3>{product.name}</h3>
        <p>¥{product.price.toLocaleString()}（税込）</p>
      </div>

      <form className="form-section" onSubmit={handleSubmit} aria-label="注文入力フォーム">
        <div className="form-group">
          <label className="form-label" htmlFor="delivery-date">届け日</label>
          <input
            className="form-input"
            id="delivery-date"
            type="date"
            value={deliveryDate}
            min={getMinDeliveryDate()}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="destination-name">届け先名</label>
          <input
            className="form-input"
            id="destination-name"
            type="text"
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="destination-address">届け先住所</label>
          <input
            className="form-input"
            id="destination-address"
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="destination-phone">届け先電話番号</label>
          <input
            className="form-input"
            id="destination-phone"
            type="tel"
            value={destinationPhone}
            onChange={(e) => setDestinationPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-message">お届けメッセージ</label>
          <textarea
            className="form-input"
            id="order-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button className="btn" type="button" onClick={onBack}>戻る</button>
          <button className="btn btn--primary" type="submit">確認画面へ</button>
        </div>
      </form>
    </div>
  );
}
