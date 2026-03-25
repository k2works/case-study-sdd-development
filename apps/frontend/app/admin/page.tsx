"use client";

import { useEffect, useState } from "react";

type AdminWorkbench = "orders" | "inventory";

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

function getInventoryAlertClassName(projectedQuantity: number): string {
  if (projectedQuantity < 0) {
    return "status-badge status-badge--shortage";
  }

  return "status-badge status-badge--surplus";
}

export default function AdminPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const [activeWorkbench, setActiveWorkbench] = useState<AdminWorkbench>("orders");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [startDate, setStartDate] = useState("2026-04-10");
  const [endDate, setEndDate] = useState("2026-04-12");
  const [inventoryProjection, setInventoryProjection] = useState<InventoryProjectionResponse | null>(
    null,
  );
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryReloadKey, setInventoryReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/admin/orders`);

        if (!response.ok) {
          if (active) {
            setOrders([]);
            setOrdersError("受注一覧を取得できませんでした。");
          }

          return;
        }

        const data = (await response.json()) as OrderSummary[];

        if (active) {
          setOrders(data);
          setOrdersError(null);
        }
      } catch {
        if (active) {
          setOrders([]);
          setOrdersError("受注一覧を取得できませんでした。");
        }
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
      try {
        if (startDate > endDate) {
          if (active) {
            setInventoryProjection(null);
            setInventoryError("開始日は終了日以前で指定してください。");
          }

          return;
        }

        const query = new URLSearchParams({ startDate, endDate });
        const response = await fetch(`${apiBaseUrl}/admin/inventory-projections?${query.toString()}`);

        if (!response.ok) {
          if (active) {
            setInventoryProjection(null);
            setInventoryError("在庫推移を取得できませんでした。再試行してください。");
          }

          return;
        }

        const data = (await response.json()) as InventoryProjectionResponse;

        if (active) {
          setInventoryError(null);
          setInventoryProjection(data);
        }
      } catch {
        if (active) {
          setInventoryProjection(null);
          setInventoryError("在庫推移を取得できませんでした。再試行してください。");
        }
      }
    };

    void loadInventoryProjection();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, endDate, inventoryReloadKey, startDate]);

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
          <h1>{activeWorkbench === "orders" ? "受注一覧" : "在庫推移"}</h1>
          <p>
            {activeWorkbench === "orders"
              ? "受注の確認、詳細照会、後続業務への引き継ぎをここで行います。"
              : "仕入判断のために、対象期間の在庫推移と不足見込みを確認します。"}
          </p>
        </section>

        <nav className="admin-switcher" aria-label="管理業務切替">
          <button
            type="button"
            className={activeWorkbench === "orders" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "orders"}
            onClick={() => setActiveWorkbench("orders")}
          >
            受注管理
          </button>
          <button
            type="button"
            className={activeWorkbench === "inventory" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "inventory"}
            onClick={() => setActiveWorkbench("inventory")}
          >
            在庫管理
          </button>
        </nav>

        {activeWorkbench === "orders" ? (
          <section className="admin-workbench" data-testid="admin-order-workbench">
            <div className="admin-pane admin-pane--primary">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p className="eyebrow">Order Desk</p>
                    <h2>受注一覧</h2>
                  </div>
                  <label className="field admin-filter" htmlFor="customerName">
                    <span>顧客名</span>
                    <input
                      id="customerName"
                      name="customerName"
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                    />
                  </label>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="admin-empty">
                    {ordersError ?? "条件に一致する受注はありません。"}
                  </p>
                ) : (
                  <table className="admin-table">
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
                              className="table-link"
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
              </div>
            </div>

            <div className="admin-pane">
              <section className="admin-panel admin-panel--detail">
                <div className="admin-panel-header">
                  <div>
                    <p className="eyebrow">Order Detail</p>
                    <h2>受注詳細</h2>
                  </div>
                </div>

                {selectedOrder ? (
                  <dl className="detail-grid">
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
                ) : (
                  <p className="admin-empty">一覧から受注を選択すると詳細を表示します。</p>
                )}
              </section>
            </div>
          </section>
        ) : (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Inventory Outlook</p>
                <h2>期間指定</h2>
              </div>
              <div className="inventory-filters">
                <label className="field" htmlFor="startDate">
                  <span>期間開始</span>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>
                <label className="field" htmlFor="endDate">
                  <span>期間終了</span>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </label>
              </div>
            </div>

            {inventoryProjection ? (
              <table className="admin-table">
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
                            <div className="inventory-cell">
                              <span>{projection.projectedQuantity}</span>
                              {alertLabel ? (
                                <span className={getInventoryAlertClassName(projection.projectedQuantity)}>
                                  {alertLabel}
                                </span>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {inventoryError ? (
              <div className="admin-feedback admin-feedback--error">
                <p>{inventoryError}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setInventoryReloadKey((current) => current + 1)}
                >
                  再試行
                </button>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
