import { useState, useEffect, useCallback } from 'react';
import type { StockForecastItem } from '../../types/stock-forecast';

interface Props {
  fetchForecast: (fromDate: string, toDate: string, itemId?: number) => Promise<StockForecastItem[]>;
  onPurchaseOrder?: (itemId: number) => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + 6);

  return {
    fromDate: formatDate(today),
    toDate: formatDate(toDate),
  };
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const mmdd = dateStr.slice(5);
  const weekday = WEEKDAYS[date.getDay()];
  return `${mmdd}(${weekday})`;
}

function buildTooltip(forecast: StockForecastItem['forecasts'][number]): string {
  return `在庫予定数: ${forecast.availableStock}\n├ 現在庫: ${forecast.currentStock}\n├ 入荷予定: +${forecast.expectedArrival}\n├ 受注引当: -${forecast.allocated}\n└ 期限超過: -${forecast.expired}`;
}

function getCellClassName(forecast: StockForecastItem['forecasts'][number]): string {
  if (forecast.isShortage) return 'shortage';
  if (forecast.isExpiryWarning) return 'expiry-warning';
  return '';
}

export function StockForecast({ fetchForecast, onPurchaseOrder }: Readonly<Props>) {
  const defaults = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [data, setData] = useState<StockForecastItem[]>([]);

  const loadData = useCallback(() => {
    const itemId = selectedItemId ? Number(selectedItemId) : undefined;
    fetchForecast(fromDate, toDate, itemId).then(setData);
  }, [fetchForecast, fromDate, toDate, selectedItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dates = data[0]?.forecasts.map((forecast) => forecast.date) ?? [];

  return (
    <div>
      <div className="toolbar">
        <h2>在庫推移</h2>
        <div className="filter-group">
          <label className="form-label" htmlFor="from-date">開始日</label>
          <input
            type="date"
            id="from-date"
            className="form-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span>〜</span>
          <label className="form-label" htmlFor="to-date">終了日</label>
          <input
            type="date"
            id="to-date"
            className="form-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <label className="form-label" htmlFor="item-filter">単品</label>
          <select
            id="item-filter"
            className="form-input"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            <option value="">全て</option>
            {data.map((item) => (
              <option key={item.itemId} value={item.itemId}>
                {item.itemName}
              </option>
            ))}
          </select>
          <button className="btn btn--sm" onClick={loadData}>表示</button>
        </div>
      </div>

      <table className="data-table" aria-label="在庫推移">
        <thead>
          <tr>
            <th>単品名</th>
            {dates.map((date) => (
              <th key={date}>{formatDateHeader(date)}</th>
            ))}
            <th>品質維持</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.itemId}>
              <td>{item.itemName}</td>
              {item.forecasts.map((forecast) => (
                <td
                  key={forecast.date}
                  className={getCellClassName(forecast)}
                  title={buildTooltip(forecast)}
                >
                  {forecast.isShortage ? <strong>{forecast.availableStock}</strong> : forecast.availableStock}
                </td>
              ))}
              <td>{item.qualityRetentionDays}日</td>
              <td>
                <button
                  className="btn btn--sm"
                  onClick={() => onPurchaseOrder?.(item.itemId)}
                  disabled={!onPurchaseOrder}
                  title={onPurchaseOrder ? undefined : '発注機能は準備中です'}
                >
                  発注
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="legend">※ <strong className="shortage">太字赤</strong> = 欠品警告（在庫予定数 ≤ 0） ※ <span className="expiry-warning">黄色背景</span> = 品質維持日数超過の在庫あり</p>
    </div>
  );
}
