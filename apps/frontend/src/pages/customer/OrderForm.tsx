import { useState, useEffect } from 'react';
import type { CustomerDto } from '../../types/customer';
import type { OrderDestination } from '../../types/order';

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
  fetchCustomers?: () => Promise<CustomerDto[]>;
  fetchOrderDestinations?: (customerId: number) => Promise<OrderDestination[]>;
}

function getMinDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split('T')[0];
}

export function OrderForm({ product, onBack, onConfirm, fetchCustomers, fetchOrderDestinations }: Readonly<Props>) {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationPhone, setDestinationPhone] = useState('');
  const [message, setMessage] = useState('');

  // 届け先コピー用の状態
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [orderDestinations, setOrderDestinations] = useState<OrderDestination[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  useEffect(() => {
    if (fetchCustomers) {
      fetchCustomers().then(setCustomers);
    }
  }, [fetchCustomers]);

  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setOrderDestinations([]);
    if (customerId && fetchOrderDestinations) {
      const dests = await fetchOrderDestinations(Number(customerId));
      setOrderDestinations(dests);
    }
  };

  const handleDestinationSelect = (index: string) => {
    if (index === '') return;
    const dest = orderDestinations[Number(index)];
    if (dest) {
      setDestinationName(dest.name);
      setDestinationAddress(dest.address);
      setDestinationPhone(dest.phone);
    }
  };

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

        {fetchCustomers && (
          <div className="form-section" style={{ marginBottom: '1rem' }}>
            <h4>過去の届け先からコピー</h4>
            <div className="form-group">
              <label className="form-label" htmlFor="customer-select">得意先を選択</label>
              <select
                className="form-input"
                id="customer-select"
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                <option value="">-- 選択してください --</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={String(c.customerId)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {orderDestinations.length > 0 && (
              <div className="form-group">
                <label className="form-label" htmlFor="destination-select">届け先を選択</label>
                <select
                  className="form-input"
                  id="destination-select"
                  defaultValue=""
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                >
                  <option value="">-- 選択してください --</option>
                  {orderDestinations.map((dest, idx) => (
                    <option key={`${dest.name}-${dest.address}`} value={String(idx)}>
                      {dest.name} - {dest.address}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

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
