import { useState } from 'react';
import type { ShipmentResult } from '../../types/shipment';

interface Props {
  fetchShipments: (shippingDate: string) => Promise<ShipmentResult>;
  recordShipment: (orderId: number) => Promise<void>;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ShipmentList({
  fetchShipments,
  recordShipment,
}: Readonly<Props>) {
  const [shippingDate, setShippingDate] = useState(formatDate(new Date()));
  const [result, setResult] = useState<ShipmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchShipments(shippingDate);
      setResult(data);
    } catch (e) {
      setError((e as Error).message || 'データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShip = async (orderId: number) => {
    setError(null);
    try {
      await recordShipment(orderId);
      // 出荷後に再取得
      const data = await fetchShipments(shippingDate);
      setResult(data);
    } catch (e) {
      setError((e as Error).message || '出荷に失敗しました。');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>出荷一覧</h2>
      </div>

      <div className="form-section">
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="form-label" htmlFor="shipping-date">出荷日</label>
          <input
            id="shipping-date"
            className="form-input"
            type="date"
            value={shippingDate}
            onChange={(e) => setShippingDate(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button className="btn btn--primary" onClick={handleSearch} disabled={isLoading}>
            表示
          </button>
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {result?.targets.length === 0 && (
        <p>該当日の出荷対象はありません。</p>
      )}

      {(result?.targets.length ?? 0) > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>受注 ID</th>
                <th>商品</th>
                <th>届け先</th>
                <th>花材</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {result.targets.map((target) => (
                <tr key={target.orderId}>
                  <td>{target.orderId}</td>
                  <td>{target.productName}</td>
                  <td>{target.destinationName}({target.destinationAddress})</td>
                  <td>
                    {target.materials.map((m) => `${m.itemName}x${m.quantity}`).join(', ')}
                  </td>
                  <td>
                    <button
                      className="btn btn--sm"
                      onClick={() => handleShip(target.orderId)}
                    >
                      出荷
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.totalMaterials.length > 0 && (
            <>
              <h3>必要花材合計</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>花材名</th>
                    <th>合計数量</th>
                  </tr>
                </thead>
                <tbody>
                  {result.totalMaterials.map((m) => (
                    <tr key={m.itemId}>
                      <td>{m.itemName}</td>
                      <td>{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
