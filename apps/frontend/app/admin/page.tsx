"use client";

import { ChangeEvent, useEffect, useState } from "react";

type AdminWorkbench = "orders" | "inventory" | "materials" | "purchaseOrders";

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
  materialId: string;
  materialName: string;
  projections: InventoryProjection[];
};

type InventoryProjectionResponse = {
  startDate: string;
  endDate: string;
  dates: string[];
  items: InventoryProjectionItem[];
};

type Material = {
  materialId: string;
  materialName: string;
  shelfLifeDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierName: string;
};

type PurchaseOrderCandidateItem = {
  materialId: string;
  materialName: string;
  shortageDate: string;
  shortageQuantity: number;
  suggestedQuantity: number;
  purchaseUnit: number;
};

type PurchaseOrderCandidateGroup = {
  supplierName: string;
  items: PurchaseOrderCandidateItem[];
};

type PurchaseOrderResult = {
  purchaseOrderId: string;
  status: string;
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
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [startDate, setStartDate] = useState("2026-04-10");
  const [endDate, setEndDate] = useState("2026-04-12");
  const [inventoryProjection, setInventoryProjection] = useState<InventoryProjectionResponse | null>(
    null,
  );
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryReloadKey, setInventoryReloadKey] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialForm, setMaterialForm] = useState<Material | null>(null);
  const [materialFeedback, setMaterialFeedback] = useState<string | null>(null);
  const [materialsReloadKey, setMaterialsReloadKey] = useState(0);
  const [purchaseCandidates, setPurchaseCandidates] = useState<PurchaseOrderCandidateGroup[]>([]);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});
  const [purchaseReloadKey, setPurchaseReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (active) {
        setOrdersLoading(true);
      }

      try {
        const response = await fetch(`${apiBaseUrl}/admin/orders`);

        if (!response.ok) {
          if (active) {
            setOrders([]);
            setOrdersError("受注一覧を取得できませんでした。");
            setOrdersLoading(false);
          }

          return;
        }

        const data = (await response.json()) as OrderSummary[];

        if (active) {
          setOrders(data);
          setOrdersError(null);
          setOrdersLoading(false);
        }
      } catch {
        if (active) {
          setOrders([]);
          setOrdersError("受注一覧を取得できませんでした。");
          setOrdersLoading(false);
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

    const loadMaterials = async () => {
      if (active) {
        setMaterialsLoading(true);
      }

      try {
        const response = await fetch(`${apiBaseUrl}/admin/materials`);

        if (!response.ok) {
          if (active) {
            setMaterials([]);
            setMaterialsError("花材一覧を取得できませんでした。");
            setMaterialsLoading(false);
          }

          return;
        }

        const data = (await response.json()) as Material[];

        if (active) {
          setMaterials(data);
          setMaterialsError(null);
          setMaterialsLoading(false);
          if (!materialForm && data.length > 0) {
            setMaterialForm(data[0]);
          }
        }
      } catch {
        if (active) {
          setMaterials([]);
          setMaterialsError("花材一覧を取得できませんでした。");
          setMaterialsLoading(false);
        }
      }
    };

    void loadMaterials();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, materialsReloadKey]);

  useEffect(() => {
    let active = true;

    const loadInventoryProjection = async () => {
      if (active) {
        setInventoryLoading(true);
      }

      try {
        if (startDate > endDate) {
          if (active) {
            setInventoryProjection(null);
            setInventoryError("開始日は終了日以前で指定してください。");
            setInventoryLoading(false);
          }

          return;
        }

        const query = new URLSearchParams({ startDate, endDate });
        const response = await fetch(`${apiBaseUrl}/admin/inventory-projections?${query.toString()}`);

        if (!response.ok) {
          if (active) {
            setInventoryProjection(null);
            setInventoryError("在庫推移を取得できませんでした。再試行してください。");
            setInventoryLoading(false);
          }

          return;
        }

        const data = (await response.json()) as InventoryProjectionResponse;

        if (active) {
          setInventoryError(null);
          setInventoryProjection(data);
          setInventoryLoading(false);
        }
      } catch {
        if (active) {
          setInventoryProjection(null);
          setInventoryError("在庫推移を取得できませんでした。再試行してください。");
          setInventoryLoading(false);
        }
      }
    };

    void loadInventoryProjection();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, endDate, inventoryReloadKey, startDate]);

  useEffect(() => {
    let active = true;

    const loadPurchaseCandidates = async () => {
      if (active) {
        setPurchaseLoading(true);
      }

      try {
        const query = new URLSearchParams({ startDate, endDate });
        const response = await fetch(
          `${apiBaseUrl}/admin/purchase-orders/candidates?${query.toString()}`,
        );

        if (!response.ok) {
          if (active) {
            setPurchaseCandidates([]);
            setPurchaseError("発注候補を取得できませんでした。");
            setPurchaseLoading(false);
          }

          return;
        }

        const data = (await response.json()) as PurchaseOrderCandidateGroup[];

        if (active) {
          setPurchaseCandidates(data);
          setPurchaseError(null);
          setPurchaseLoading(false);
          setPurchaseQuantities(
            Object.fromEntries(
              data.flatMap((group) =>
                group.items.map((item) => [item.materialId, item.suggestedQuantity]),
              ),
            ),
          );
        }
      } catch {
        if (active) {
          setPurchaseCandidates([]);
          setPurchaseError("発注候補を取得できませんでした。");
          setPurchaseLoading(false);
        }
      }
    };

    void loadPurchaseCandidates();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, endDate, purchaseReloadKey, startDate]);

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

  const handleEditMaterial = (materialId: string) => {
    const target = materials.find((material) => material.materialId === materialId);

    if (!target) {
      return;
    }

    setMaterialFeedback(null);
    setMaterialForm(target);
  };

  const handleMaterialFormChange =
    (field: keyof Material) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = field === "materialName" || field === "supplierName"
        ? event.target.value
        : Number(event.target.value);

      setMaterialForm((current) =>
        current
          ? {
              ...current,
              [field]: nextValue,
            }
          : current,
      );
    };

  const handleSaveMaterial = async () => {
    if (!materialForm) {
      return;
    }

    setMaterialFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialForm),
      });

      if (!response.ok) {
        setMaterialFeedback("花材を保存できませんでした。");
        return;
      }

      const savedMaterial = (await response.json()) as Material;
      setMaterials((current) =>
        current.some((material) => material.materialId === savedMaterial.materialId)
          ? current.map((material) =>
              material.materialId === savedMaterial.materialId ? savedMaterial : material,
            )
          : [...current, savedMaterial],
      );
      setMaterialForm(savedMaterial);
      setMaterialFeedback("花材を保存しました。");
      setMaterialsReloadKey((current) => current + 1);
    } catch {
      setMaterialFeedback("花材を保存できませんでした。");
    }
  };

  const handlePurchaseQuantityChange =
    (materialId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setPurchaseQuantities((current) => ({
        ...current,
        [materialId]: Number(event.target.value),
      }));
    };

  const handleConfirmPurchaseOrder = async (supplierName: string) => {
    const targetGroup = purchaseCandidates.find((candidate) => candidate.supplierName === supplierName);

    if (!targetGroup) {
      return;
    }

    setPurchaseFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/purchase-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName,
          items: targetGroup.items.map((item) => ({
            materialId: item.materialId,
            quantity: purchaseQuantities[item.materialId] ?? item.suggestedQuantity,
          })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setPurchaseFeedback(payload.message ?? "発注を登録できませんでした。");
        return;
      }

      const payload = (await response.json()) as PurchaseOrderResult;
      setPurchaseFeedback(`発注を登録しました。状態: ${payload.status}`);
    } catch {
      setPurchaseFeedback("発注を登録できませんでした。");
    }
  };

  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="badge">Admin Console</span>
          <h1>
            {activeWorkbench === "orders"
              ? "受注一覧"
              : activeWorkbench === "inventory"
                ? "在庫推移"
                : activeWorkbench === "materials"
                  ? "花材管理"
                  : "発注管理"}
          </h1>
          <p>
            {activeWorkbench === "orders"
              ? "受注の確認、詳細照会、後続業務への引き継ぎをここで行います。"
              : activeWorkbench === "inventory"
                ? "仕入判断のために、対象期間の在庫推移と不足見込みを確認します。"
                : activeWorkbench === "materials"
                  ? "在庫推移と発注判断の前提になる花材情報と仕入条件を管理します。"
                  : "不足見込みから仕入先別の発注候補を確認し、発注を確定します。"}
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
          <button
            type="button"
            className={activeWorkbench === "materials" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "materials"}
            onClick={() => setActiveWorkbench("materials")}
          >
            花材管理
          </button>
          <button
            type="button"
            className={activeWorkbench === "purchaseOrders" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "purchaseOrders"}
            onClick={() => setActiveWorkbench("purchaseOrders")}
          >
            発注管理
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

                {ordersLoading ? (
                  <p className="admin-empty">受注一覧を読み込んでいます。</p>
                ) : filteredOrders.length === 0 ? (
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
        ) : activeWorkbench === "inventory" ? (
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
              <div className="inventory-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setActiveWorkbench("purchaseOrders")}
                >
                  発注候補を確認する
                </button>
              </div>
            </div>

            {inventoryLoading ? (
              <p className="admin-empty">在庫推移を読み込んでいます。</p>
            ) : inventoryProjection ? (
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
        ) : activeWorkbench === "materials" ? (
          <section className="admin-workbench">
            <div className="admin-pane admin-pane--primary">
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p className="eyebrow">Material Master</p>
                    <h2>花材一覧</h2>
                  </div>
                </div>
                {materialsLoading ? (
                  <p className="admin-empty">花材一覧を読み込んでいます。</p>
                ) : materials.length === 0 ? (
                  <p className="admin-empty">{materialsError ?? "花材が登録されていません。"}</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>花材名</th>
                        <th>品質維持日数</th>
                        <th>購入単位</th>
                        <th>リードタイム</th>
                        <th>仕入先</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr key={material.materialId}>
                          <td>{material.materialName}</td>
                          <td>{material.shelfLifeDays}</td>
                          <td>{material.purchaseUnit}</td>
                          <td>{material.leadTimeDays}</td>
                          <td>{material.supplierName}</td>
                          <td>
                            <button
                              type="button"
                              className="table-link"
                              aria-label={`${material.materialName} を編集`}
                              onClick={() => handleEditMaterial(material.materialId)}
                            >
                              編集
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {materialsError || materialFeedback === "花材を保存できませんでした。" ? (
                  <div className="admin-feedback admin-feedback--error">
                    <p>{materialsError ?? materialFeedback}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setMaterialsReloadKey((current) => current + 1)}
                    >
                      再試行
                    </button>
                  </div>
                ) : null}
              </section>
            </div>

            <div className="admin-pane">
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p className="eyebrow">Material Editor</p>
                    <h2>花材編集</h2>
                  </div>
                </div>
                {materialForm ? (
                  <div className="admin-form-grid">
                    <label className="field" htmlFor="materialName">
                      <span>花材名</span>
                      <input
                        id="materialName"
                        type="text"
                        value={materialForm.materialName}
                        onChange={handleMaterialFormChange("materialName")}
                      />
                    </label>
                    <label className="field" htmlFor="shelfLifeDays">
                      <span>品質維持日数</span>
                      <input
                        id="shelfLifeDays"
                        type="number"
                        value={materialForm.shelfLifeDays}
                        onChange={handleMaterialFormChange("shelfLifeDays")}
                      />
                    </label>
                    <label className="field" htmlFor="purchaseUnit">
                      <span>購入単位</span>
                      <input
                        id="purchaseUnit"
                        type="number"
                        value={materialForm.purchaseUnit}
                        onChange={handleMaterialFormChange("purchaseUnit")}
                      />
                    </label>
                    <label className="field" htmlFor="leadTimeDays">
                      <span>リードタイム</span>
                      <input
                        id="leadTimeDays"
                        type="number"
                        value={materialForm.leadTimeDays}
                        onChange={handleMaterialFormChange("leadTimeDays")}
                      />
                    </label>
                    <label className="field" htmlFor="supplierName">
                      <span>仕入先</span>
                      <input
                        id="supplierName"
                        type="text"
                        value={materialForm.supplierName}
                        onChange={handleMaterialFormChange("supplierName")}
                      />
                    </label>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void handleSaveMaterial()}
                    >
                      花材を保存する
                    </button>
                    {materialFeedback && materialFeedback !== "花材を保存できませんでした。" ? (
                      <p className="admin-inline-feedback">{materialFeedback}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="admin-empty">一覧から花材を選択すると編集できます。</p>
                )}
              </section>
            </div>
          </section>
        ) : (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Purchase Orders</p>
                <h2>仕入先別の発注候補</h2>
              </div>
            </div>
            {purchaseLoading ? (
              <p className="admin-empty">発注候補を読み込んでいます。</p>
            ) : null}
            {!purchaseLoading && purchaseCandidates.map((group) => (
              <section key={group.supplierName} className="purchase-group">
                <h3>{group.supplierName}</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>花材</th>
                      <th>不足日</th>
                      <th>不足数</th>
                      <th>購入単位</th>
                      <th>発注数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.materialId}>
                        <td>{item.materialName}</td>
                        <td>{item.shortageDate}</td>
                        <td>{item.shortageQuantity}</td>
                        <td>{item.purchaseUnit}</td>
                        <td>
                          <input
                            className="quantity-input"
                            type="number"
                            value={purchaseQuantities[item.materialId] ?? item.suggestedQuantity}
                            onChange={handlePurchaseQuantityChange(item.materialId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleConfirmPurchaseOrder(group.supplierName)}
                >
                  発注を確定する
                </button>
              </section>
            ))}
            {!purchaseLoading && purchaseCandidates.length === 0 ? (
              <p className="admin-empty">{purchaseError ?? "発注候補はありません。"}</p>
            ) : null}
            {purchaseFeedback && purchaseFeedback !== "発注を登録できませんでした。" ? (
              <p className="admin-inline-feedback">{purchaseFeedback}</p>
            ) : null}
            {purchaseFeedback === "発注を登録できませんでした。" || purchaseError ? (
              <div className="admin-feedback admin-feedback--error">
                <p>{purchaseError ?? purchaseFeedback}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPurchaseReloadKey((current) => current + 1)}
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
