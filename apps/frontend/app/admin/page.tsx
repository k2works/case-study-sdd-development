"use client";

import { useEffect, useState } from "react";

type OrderSummary = {
  orderId: string;
  customerName: string;
  productName: string;
  deliveryDate: string;
  shippingDate: string;
  status: string;
};

type OrderDetail = OrderSummary & {
  deliveryAddress: string;
};

type InventoryProjection = {
  date: string;
  projectedQuantity: number;
};

type InventoryProjectionItem = {
  materialName: string;
  projections: InventoryProjection[];
};

type InventoryProjectionResponse = {
  startDate: string;
  endDate: string;
  dates: string[];
  items: InventoryProjectionItem[];
};

export function getInventoryAlertLabel(projectedQuantity: number): string | null {
  if (projectedQuantity < 0) {
    return "不足見込み";
  }

  if (projectedQuantity >= 20) {
    return "廃棄注意";
  }

  return null;
}

export default function AdminPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [startDate, setStartDate] = useState("2026-04-10");
  const [endDate, setEndDate] = useState("2026-04-12");
  const [inventoryProjection, setInventoryProjection] = useState<InventoryProjectionResponse | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      const response = await fetch(`${apiBaseUrl}/admin/orders`);

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as OrderSummary[];

      if (active) {
        setOrders(data);
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    let active = true;

    const loadInventoryProjection = async () => {
      const query = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`${apiBaseUrl}/admin/inventory-projections?${query.toString()}`);

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as InventoryProjectionResponse;

      if (active) {
        setInventoryProjection(data);
      }
    };

    void loadInventoryProjection();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, endDate, startDate]);

  const filteredOrders = orders.filter((order) =>
    order.customerName.includes(customerName.trim()),
  );

  const handleSelectOrder = async (orderId: string) => {
    const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}`);

    if (!response.ok) {
      return;
    }

    setSelectedOrder((await response.json()) as OrderDetail);
  };

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Admin Console</span>
          <h1>受注一覧</h1>
          <p>受注の確認、詳細照会、後続業務への引き継ぎをここで行います。</p>
        </section>

        <section>
          <label htmlFor="customerName">顧客名</label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />
        </section>

        <section>
          {filteredOrders.length === 0 ? (
            <p>条件に一致する受注はありません。</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>受注番号</th>
                  <th>顧客名</th>
                  <th>商品</th>
                  <th>届け日</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <button
                        type="button"
                        aria-label={`${order.orderId} の詳細を表示`}
                        onClick={() => void handleSelectOrder(order.orderId)}
                      >
                        {order.orderId}
                      </button>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.productName}</td>
                    <td>{order.deliveryDate}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {selectedOrder ? (
          <section>
            <h2>受注詳細</h2>
            <dl>
              <dt>受注番号</dt>
              <dd>{selectedOrder.orderId}</dd>
              <dt>顧客名</dt>
              <dd>{selectedOrder.customerName}</dd>
              <dt>商品</dt>
              <dd>{selectedOrder.productName}</dd>
              <dt>届け日</dt>
              <dd>{selectedOrder.deliveryDate}</dd>
              <dt>出荷日</dt>
              <dd>{selectedOrder.shippingDate}</dd>
              <dt>状態</dt>
              <dd>{selectedOrder.status}</dd>
              <dt>届け先</dt>
              <dd>{selectedOrder.deliveryAddress}</dd>
            </dl>
          </section>
        ) : null}

        <section>
          <h2>在庫推移</h2>
          <div>
            <label htmlFor="startDate">期間開始</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <label htmlFor="endDate">期間終了</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          {inventoryProjection ? (
            <table>
              <thead>
                <tr>
                  <th>花材</th>
                  {inventoryProjection.dates.map((date) => (
                    <th key={date}>{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryProjection.items.map((item) => (
                  <tr key={item.materialName}>
                    <td>{item.materialName}</td>
                    {item.projections.map((projection) => {
                      const alertLabel = getInventoryAlertLabel(projection.projectedQuantity);

                      return (
                        <td key={projection.date}>
                          <span>{projection.projectedQuantity}</span>
                          {alertLabel ? <span>{alertLabel}</span> : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>
    </main>
  );
}
