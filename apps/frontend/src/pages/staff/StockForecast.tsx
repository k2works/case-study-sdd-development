import { useState, useEffect } from 'react';
import type { StockForecastDto } from '../../types/stock-forecast';
import type { ItemDto } from '../../types/item';

interface StockForecastProps {
  fetchItems: () => Promise<ItemDto[]>;
  fetchForecast: (itemId: number, fromDate: string, toDate: string) => Promise<StockForecastDto[]>;
  onPurchaseOrder: (item: ItemDto) => void;
}

function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + 6);
  return {
    fromDate: today.toISOString().split('T')[0],
    toDate: toDate.toISOString().split('T')[0],
  };
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function StockForecast({ fetchItems, fetchForecast, onPurchaseOrder }: StockForecastProps) {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const { fromDate: defaultFrom, toDate: defaultTo } = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [forecasts, setForecasts] = useState<StockForecastDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems().then(data => {
      setItems(data);
      if (data.length > 0) {
        setSelectedItemId(data[0].id);
      }
    });
  }, [fetchItems]);

  const handleFetch = async () => {
    if (!selectedItemId) return;
    setLoading(true);
    try {
      const data = await fetchForecast(Number(selectedItemId), fromDate, toDate);
      setForecasts(data);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="stock-forecast">
      <h2>在庫推移</h2>

      <div className="stock-forecast__controls">
        <label>
          単品:
          <select
            value={selectedItemId}
            onChange={e => setSelectedItemId(Number(e.target.value))}
          >
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

        <label>
          期間:
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
          〜
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </label>

        <button onClick={handleFetch} disabled={loading}>
          表示
        </button>
      </div>

      {forecasts.length > 0 && selectedItem && (
        <>
          <table className="stock-forecast__table">
            <thead>
              <tr>
                <th>単品名</th>
                {forecasts.map(f => (
                  <th key={f.date}>{formatDateShort(f.date)}</th>
                ))}
                <th>品質維持</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedItem.name}</td>
                {forecasts.map(f => (
                  <td
                    key={f.date}
                    className={[
                      f.isShortage ? 'stock-forecast__cell--shortage' : '',
                      f.isExpiryWarning ? 'stock-forecast__cell--expiry' : '',
                    ].join(' ').trim()}
                    title={`在庫予定数: ${f.availableStock}\n├ 現在庫: ${f.currentStock}\n├ 入荷予定: +${f.expectedArrival}\n├ 受注引当: -${f.allocated}\n└ 期限超過: -${f.expired}`}
                  >
                    {f.isShortage ? <strong>{f.availableStock}</strong> : f.availableStock}
                  </td>
                ))}
                <td>{selectedItem.qualityRetentionDays}日</td>
                <td>
                  <button onClick={() => onPurchaseOrder(selectedItem)}>
                    発注
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="stock-forecast__legend">
            <p><strong>※ 太字</strong>は欠品警告（在庫予定数 ≤ 0）</p>
            <p>※ 各セルにツールチップで内訳表示（現在庫/入荷予定/引当/期限超過）</p>
          </div>
        </>
      )}
    </div>
  );
}
