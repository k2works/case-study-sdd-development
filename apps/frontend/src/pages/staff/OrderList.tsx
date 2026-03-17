import { useState, useEffect } from 'react';
import type { OrderDto } from '../../types/order';

interface Props {
  fetchOrders: (status?: string) => Promise<OrderDto[]>;
  onDetail: (orderId: number) => void;
}

const STATUS_OPTIONS = ['全て', '注文済み', '出荷準備中', '出荷済み'] as const;

export function OrderList({ fetchOrders, onDetail }: Readonly<Props>) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [statusFilter, setStatusFilter] = useState('全て');

  useEffect(() => {
    const status = statusFilter === '全て' ? undefined : statusFilter;
    fetchOrders(status).then(setOrders);
  }, [fetchOrders, statusFilter]);

  return (
    <div>
      <div className="toolbar">
        <h2>受注管理</h2>
        <div className="filter-group">
          <label className="form-label" htmlFor="status-filter">状態フィルタ</label>
          <select
            className="form-input"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="data-table" aria-label="受注一覧">
        <thead>
          <tr>
            <th>受注ID</th>
            <th>届け先</th>
            <th>届け日</th>
            <th>価格</th>
            <th>状態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.destination.name}</td>
              <td>{order.deliveryDate}</td>
              <td>¥{order.price.toLocaleString()}</td>
              <td>{order.status}</td>
              <td>
                <button className="btn btn--sm" onClick={() => onDetail(order.id)}>詳細</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
