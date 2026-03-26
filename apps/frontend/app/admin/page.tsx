"use client";

import { ChangeEvent, useEffect, useState } from "react";

type AdminWorkbench =
  | "orders"
  | "products"
  | "inventory"
  | "materials"
  | "purchaseOrders"
  | "receipts"
  | "shipping";

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

type ProductMaterial = {
  materialId: string;
  quantity: number;
};

type Product = {
  productId: string;
  productName: string;
  description: string;
  price: number;
  isActive: boolean;
  materials: ProductMaterial[];
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

type PurchaseOrderSummary = {
  purchaseOrderId: string;
  supplierName: string;
  status: string;
  items: Array<{
    materialId: string;
    quantity: number;
    receivedQuantity: number;
  }>;
};

type ReceiptResult = {
  purchaseOrderId: string;
  status: string;
};

type DeliveryDateChangeResult = {
  orderId: string;
  deliveryDate: string;
  shippingDate: string;
  status: string;
};

type ShippingTarget = {
  orderId: string;
  customerName: string;
  productName: string;
  shippingDate: string;
  status: string;
  materials: Array<{
    materialId: string;
    materialName: string;
    requiredQuantity: number;
    projectedQuantity: number;
  }>;
  hasShortage: boolean;
};

type ShipmentTarget = {
  orderId: string;
  customerName: string;
  productName: string;
  shippingDate: string;
  status: string;
};

const createEmptyProductForm = (): Product => ({
  productId: "draft-product",
  productName: "",
  description: "",
  price: 0,
  isActive: true,
  materials: [],
});

function toProductIdSeed(productName: string): string {
  const normalized = productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "new-product";
}

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
  const [nextDeliveryDate, setNextDeliveryDate] = useState("");
  const [deliveryDateFeedback, setDeliveryDateFeedback] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productForm, setProductForm] = useState<Product | null>(null);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);
  const [productsReloadKey, setProductsReloadKey] = useState(0);
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
  const [receiptOrders, setReceiptOrders] = useState<PurchaseOrderSummary[]>([]);
  const [receiptLoading, setReceiptLoading] = useState(true);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptFeedback, setReceiptFeedback] = useState<string | null>(null);
  const [receiptQuantities, setReceiptQuantities] = useState<Record<string, number>>({});
  const [receiptReloadKey, setReceiptReloadKey] = useState(0);
  const [shippingDate, setShippingDate] = useState("2026-04-11");
  const [shippingTargets, setShippingTargets] = useState<ShippingTarget[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingFeedback, setShippingFeedback] = useState<string | null>(null);
  const [shippingReloadKey, setShippingReloadKey] = useState(0);
  const [shipmentTargets, setShipmentTargets] = useState<ShipmentTarget[]>([]);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const [shipmentLoading, setShipmentLoading] = useState(true);
  const [shipmentFeedback, setShipmentFeedback] = useState<string | null>(null);
  const [shipmentReloadKey, setShipmentReloadKey] = useState(0);

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

    const loadProducts = async () => {
      if (active) {
        setProductsLoading(true);
      }

      try {
        const response = await fetch(`${apiBaseUrl}/admin/products`);

        if (!response.ok) {
          if (active) {
            setProducts([]);
            setProductsError("商品一覧を取得できませんでした。");
            setProductsLoading(false);
          }

          return;
        }

        const data = (await response.json()) as Product[];

        if (active) {
          setProducts(data);
          setProductsError(null);
          setProductsLoading(false);
          if (!productForm && data.length > 0) {
            setProductForm(data[0]);
          }
        }
      } catch {
        if (active) {
          setProducts([]);
          setProductsError("商品一覧を取得できませんでした。");
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, productsReloadKey]);

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

  useEffect(() => {
    let active = true;

    const loadReceiptOrders = async () => {
      if (active) {
        setReceiptLoading(true);
      }

      try {
        const response = await fetch(`${apiBaseUrl}/admin/purchase-orders`);

        if (!response.ok) {
          if (active) {
            setReceiptOrders([]);
            setReceiptError("入荷対象を取得できませんでした。");
            setReceiptLoading(false);
          }

          return;
        }

        const data = (await response.json()) as PurchaseOrderSummary[];

        if (active) {
          setReceiptOrders(data);
          setReceiptError(null);
          setReceiptLoading(false);
          setReceiptQuantities(
            Object.fromEntries(
              data.flatMap((order) =>
                order.items.map((item) => [`${order.purchaseOrderId}:${item.materialId}`, item.quantity - item.receivedQuantity]),
              ),
            ),
          );
        }
      } catch {
        if (active) {
          setReceiptOrders([]);
          setReceiptError("入荷対象を取得できませんでした。");
          setReceiptLoading(false);
        }
      }
    };

    void loadReceiptOrders();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, receiptReloadKey]);

  useEffect(() => {
    let active = true;

    const loadShippingTargets = async () => {
      if (active) {
        setShippingLoading(true);
      }

      try {
        const query = new URLSearchParams({ shippingDate });
        const response = await fetch(`${apiBaseUrl}/admin/shipping-targets?${query.toString()}`);

        if (!response.ok) {
          if (active) {
            setShippingTargets([]);
            setShippingError("出荷対象を取得できませんでした。");
            setShippingLoading(false);
          }

          return;
        }

        const data = (await response.json()) as ShippingTarget[];

        if (active) {
          setShippingTargets(data);
          setShippingError(null);
          setShippingLoading(false);
        }
      } catch {
        if (active) {
          setShippingTargets([]);
          setShippingError("出荷対象を取得できませんでした。");
          setShippingLoading(false);
        }
      }
    };

    void loadShippingTargets();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, shippingDate, shippingReloadKey]);

  useEffect(() => {
    let active = true;

    const loadShipmentTargets = async () => {
      if (active) {
        setShipmentLoading(true);
      }

      try {
        const query = new URLSearchParams({ shippingDate });
        const response = await fetch(`${apiBaseUrl}/admin/shipments?${query.toString()}`);

        if (!response.ok) {
          if (active) {
            setShipmentTargets([]);
            setShipmentError("出荷確定対象を取得できませんでした。");
            setShipmentLoading(false);
          }

          return;
        }

        const data = (await response.json()) as ShipmentTarget[];

        if (active) {
          setShipmentTargets(data);
          setShipmentError(null);
          setShipmentLoading(false);
        }
      } catch {
        if (active) {
          setShipmentTargets([]);
          setShipmentError("出荷確定対象を取得できませんでした。");
          setShipmentLoading(false);
        }
      }
    };

    void loadShipmentTargets();

    return () => {
      active = false;
    };
  }, [apiBaseUrl, shippingDate, shipmentReloadKey]);

  const filteredOrders = orders.filter((order) =>
    order.customerName.includes(customerName.trim()),
  );

  const handleSelectOrder = async (orderId: string) => {
    const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}`);

    if (!response.ok) {
      return;
    }

    const order = (await response.json()) as OrderDetail;
    setSelectedOrder(order);
    setNextDeliveryDate(order.deliveryDate);
    setDeliveryDateFeedback(null);
  };

  const handleChangeDeliveryDate = async () => {
    if (!selectedOrder) {
      return;
    }

    setDeliveryDateFeedback(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/admin/orders/${selectedOrder.orderId}/delivery-date-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryDate: nextDeliveryDate,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setDeliveryDateFeedback(payload.message ?? "届け日を変更できませんでした。");
        return;
      }

      const payload = (await response.json()) as DeliveryDateChangeResult;
      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              deliveryDate: payload.deliveryDate,
              shippingDate: payload.shippingDate,
              status: payload.status,
            }
          : current,
      );
      setOrders((current) =>
        current.map((order) =>
          order.orderId === payload.orderId
            ? {
                ...order,
                deliveryDate: payload.deliveryDate,
                shippingDate: payload.shippingDate,
                status: payload.status,
              }
            : order,
        ),
      );
      setNextDeliveryDate(payload.deliveryDate);
      setDeliveryDateFeedback("届け日を変更しました。");
      setInventoryReloadKey((current) => current + 1);
      setShippingReloadKey((current) => current + 1);
      setShipmentReloadKey((current) => current + 1);
    } catch {
      setDeliveryDateFeedback("届け日を変更できませんでした。");
    }
  };

  const handleEditMaterial = (materialId: string) => {
    const target = materials.find((material) => material.materialId === materialId);

    if (!target) {
      return;
    }

    setMaterialFeedback(null);
    setMaterialForm(target);
  };

  const handleEditProduct = (productId: string) => {
    const target = products.find((product) => product.productId === productId);

    if (!target) {
      return;
    }

    setProductFeedback(null);
    setProductForm(target);
  };

  const handleCreateProduct = () => {
    setProductFeedback(null);
    setProductForm(createEmptyProductForm());
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

  const handleProductFormChange =
    (field: "productName" | "description" | "price" | "isActive") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const nextValue = field === "price"
        ? Number(event.target.value)
        : field === "isActive"
          ? event.target.value === "true"
          : event.target.value;

      setProductForm((current) =>
        current
          ? {
              ...current,
              [field]: nextValue,
            }
          : current,
      );
    };

  const handleProductMaterialChange =
    (materialId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const quantity = Number(event.target.value);

      setProductForm((current) =>
        current
          ? {
              ...current,
              materials: materials.map((material) => ({
                materialId: material.materialId,
                quantity:
                  material.materialId === materialId
                    ? quantity
                    : current.materials.find((item) => item.materialId === material.materialId)?.quantity ?? 0,
              })),
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

  const handleSaveProduct = async () => {
    if (!productForm) {
      return;
    }

    setProductFeedback(null);
    const productId =
      productForm.productId === "draft-product"
        ? toProductIdSeed(productForm.productName)
        : productForm.productId;
    const productToSave: Product = {
      ...productForm,
      productId,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productToSave),
      });

      if (!response.ok) {
        setProductFeedback("商品を保存できませんでした。");
        return;
      }

      const savedProduct = (await response.json()) as Product;
      setProducts((current) =>
        current.some((product) => product.productId === savedProduct.productId)
          ? current.map((product) =>
              product.productId === savedProduct.productId ? savedProduct : product,
            )
          : [...current, savedProduct],
      );
      setProductForm(savedProduct);
      setProductFeedback("商品を保存しました。");
      setProductsReloadKey((current) => current + 1);
    } catch {
      setProductFeedback("商品を保存できませんでした。");
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

  const handleReceiptQuantityChange =
    (purchaseOrderId: string, materialId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setReceiptQuantities((current) => ({
        ...current,
        [`${purchaseOrderId}:${materialId}`]: Number(event.target.value),
      }));
    };

  const handleRegisterReceipt = async (purchaseOrderId: string) => {
    const targetOrder = receiptOrders.find((order) => order.purchaseOrderId === purchaseOrderId);

    if (!targetOrder) {
      return;
    }

    setReceiptFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/purchase-orders/${purchaseOrderId}/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptDate: shippingDate,
          items: targetOrder.items.map((item) => ({
            materialId: item.materialId,
            quantity: receiptQuantities[`${purchaseOrderId}:${item.materialId}`] ?? 0,
          })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setReceiptFeedback(payload.message ?? "入荷実績を登録できませんでした。");
        return;
      }

      const payload = (await response.json()) as ReceiptResult;
      setReceiptFeedback(`入荷実績を登録しました。状態: ${payload.status}`);
      setReceiptReloadKey((current) => current + 1);
      setInventoryReloadKey((current) => current + 1);
      setShippingReloadKey((current) => current + 1);
    } catch {
      setReceiptFeedback("入荷実績を登録できませんでした。");
    }
  };

  const handleCompleteBundle = async (orderId: string) => {
    setShippingFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}/bundle-completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setShippingFeedback(payload.message ?? "結束完了を登録できませんでした。");
        return;
      }

      setShippingFeedback("結束完了を登録しました。");
      setShippingReloadKey((current) => current + 1);
      setShipmentReloadKey((current) => current + 1);
    } catch {
      setShippingFeedback("結束完了を登録できませんでした。");
    }
  };

  const handleConfirmShipment = async (orderId: string) => {
    setShipmentFeedback(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/orders/${orderId}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setShipmentFeedback(payload.message ?? "出荷実績を確定できませんでした。");
        return;
      }

      setShipmentFeedback("出荷実績を確定しました。");
      setShipmentReloadKey((current) => current + 1);
      setShippingReloadKey((current) => current + 1);
    } catch {
      setShipmentFeedback("出荷実績を確定できませんでした。");
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
              : activeWorkbench === "products"
                ? "商品管理"
              : activeWorkbench === "inventory"
                ? "在庫推移"
                : activeWorkbench === "materials"
                  ? "花材管理"
                  : activeWorkbench === "purchaseOrders"
                    ? "発注管理"
                    : activeWorkbench === "receipts"
                      ? "入荷管理"
                      : "出荷管理"}
          </h1>
          <p>
            {activeWorkbench === "orders"
              ? "受注の確認、詳細照会、後続業務への引き継ぎをここで行います。"
              : activeWorkbench === "products"
                ? "販売する花束商品と花束構成を管理し、受注画面へ反映します。"
              : activeWorkbench === "inventory"
                ? "仕入判断のために、対象期間の在庫推移と不足見込みを確認します。"
                : activeWorkbench === "materials"
                  ? "在庫推移と発注判断の前提になる花材情報と仕入条件を管理します。"
                  : activeWorkbench === "purchaseOrders"
                    ? "不足見込みから仕入先別の発注候補を確認し、発注を確定します。"
                    : activeWorkbench === "receipts"
                      ? "発注に対する入荷実績を登録し、在庫へ反映します。"
                      : "当日の出荷対象と必要花材を確認し、結束完了を登録します。"}
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
            className={activeWorkbench === "products" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "products"}
            onClick={() => setActiveWorkbench("products")}
          >
            商品管理
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
          <button
            type="button"
            className={activeWorkbench === "receipts" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "receipts"}
            onClick={() => setActiveWorkbench("receipts")}
          >
            入荷管理
          </button>
          <button
            type="button"
            className={activeWorkbench === "shipping" ? "switch-chip is-active" : "switch-chip"}
            aria-pressed={activeWorkbench === "shipping"}
            onClick={() => setActiveWorkbench("shipping")}
          >
            出荷管理
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
                  <>
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

                    <div className="detail-actions">
                      <label className="field" htmlFor="nextDeliveryDate">
                        <span>新しい届け日</span>
                        <input
                          id="nextDeliveryDate"
                          name="nextDeliveryDate"
                          type="date"
                          value={nextDeliveryDate}
                          onChange={(event) => setNextDeliveryDate(event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => void handleChangeDeliveryDate()}
                      >
                        届け日を変更する
                      </button>
                      {deliveryDateFeedback ? (
                        <p className="admin-feedback">{deliveryDateFeedback}</p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="admin-empty">一覧から受注を選択すると詳細を表示します。</p>
                )}
              </section>
            </div>
          </section>
        ) : activeWorkbench === "products" ? (
          <section className="admin-workbench">
            <div className="admin-pane admin-pane--primary">
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p className="eyebrow">Product Master</p>
                    <h2>商品一覧</h2>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCreateProduct}
                  >
                    新規登録
                  </button>
                </div>
                {productsLoading ? (
                  <p className="admin-empty">商品一覧を読み込んでいます。</p>
                ) : products.length === 0 ? (
                  <p className="admin-empty">{productsError ?? "商品が登録されていません。"}</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>商品名</th>
                        <th>価格</th>
                        <th>販売状態</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.productId}>
                          <td>{product.productName}</td>
                          <td>{product.price}</td>
                          <td>{product.isActive ? "販売中" : "停止中"}</td>
                          <td>
                            <button
                              type="button"
                              className="table-link"
                              aria-label={`${product.productName} を編集`}
                              onClick={() => handleEditProduct(product.productId)}
                            >
                              編集
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {productsError || productFeedback === "商品を保存できませんでした。" ? (
                  <div className="admin-feedback admin-feedback--error">
                    <p>{productsError ?? productFeedback}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setProductsReloadKey((current) => current + 1)}
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
                    <p className="eyebrow">Product Editor</p>
                    <h2>{productForm?.productId === "draft-product" ? "商品新規登録" : "商品編集"}</h2>
                  </div>
                </div>
                {productForm ? (
                  <div className="admin-form-grid">
                    <label className="field" htmlFor="productId">
                      <span>商品 ID</span>
                      <input
                        id="productId"
                        type="text"
                        value={
                          productForm.productId === "draft-product"
                            ? toProductIdSeed(productForm.productName)
                            : productForm.productId
                        }
                        readOnly
                      />
                    </label>
                    <label className="field" htmlFor="productName">
                      <span>商品名</span>
                      <input
                        id="productName"
                        type="text"
                        value={productForm.productName}
                        onChange={handleProductFormChange("productName")}
                      />
                    </label>
                    <label className="field" htmlFor="productDescription">
                      <span>説明</span>
                      <textarea
                        id="productDescription"
                        value={productForm.description}
                        rows={4}
                        onChange={handleProductFormChange("description")}
                      />
                    </label>
                    <label className="field" htmlFor="productPrice">
                      <span>価格</span>
                      <input
                        id="productPrice"
                        type="number"
                        value={productForm.price}
                        onChange={handleProductFormChange("price")}
                      />
                    </label>
                    <label className="field" htmlFor="productStatus">
                      <span>販売状態</span>
                      <select
                        id="productStatus"
                        value={String(productForm.isActive)}
                        onChange={handleProductFormChange("isActive")}
                      >
                        <option value="true">販売中</option>
                        <option value="false">停止中</option>
                      </select>
                    </label>
                    <div className="admin-subsection">
                      <h3>花束構成</h3>
                      <div className="recipe-grid">
                        {materials.map((material) => (
                          <label className="field" key={material.materialId}>
                            <span>{material.materialName}</span>
                            <input
                              type="number"
                              value={
                                productForm.materials.find((item) => item.materialId === material.materialId)
                                  ?.quantity ?? 0
                              }
                              onChange={handleProductMaterialChange(material.materialId)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void handleSaveProduct()}
                    >
                      商品を保存する
                    </button>
                    {productFeedback && productFeedback !== "商品を保存できませんでした。" ? (
                      <p className="admin-inline-feedback">{productFeedback}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="admin-empty">新規登録または一覧から商品を選択すると編集できます。</p>
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
        ) : activeWorkbench === "purchaseOrders" ? (
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
        ) : activeWorkbench === "receipts" ? (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Receiving</p>
                <h2>入荷対象</h2>
              </div>
            </div>
            {receiptLoading ? <p className="admin-empty">入荷対象を読み込んでいます。</p> : null}
            {!receiptLoading &&
              receiptOrders.map((order) => (
                <section key={order.purchaseOrderId} className="purchase-group">
                  <h3>{order.purchaseOrderId} / {order.supplierName}</h3>
                  <p className="admin-inline-feedback">状態: {order.status}</p>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>花材</th>
                        <th>発注数</th>
                        <th>入荷済み</th>
                        <th>今回入荷</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.materialId}>
                          <td>{item.materialId}</td>
                          <td>{item.quantity}</td>
                          <td>{item.receivedQuantity}</td>
                          <td>
                            <input
                              className="quantity-input"
                              type="number"
                              value={receiptQuantities[`${order.purchaseOrderId}:${item.materialId}`] ?? 0}
                              onChange={handleReceiptQuantityChange(order.purchaseOrderId, item.materialId)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void handleRegisterReceipt(order.purchaseOrderId)}
                  >
                    入荷を登録する
                  </button>
                </section>
              ))}
            {!receiptLoading && receiptOrders.length === 0 ? (
              <p className="admin-empty">{receiptError ?? "入荷対象はありません。"}</p>
            ) : null}
            {receiptFeedback && receiptFeedback !== "入荷実績を登録できませんでした。" ? (
              <p className="admin-inline-feedback">{receiptFeedback}</p>
            ) : null}
            {receiptFeedback === "入荷実績を登録できませんでした。" || receiptError ? (
              <div className="admin-feedback admin-feedback--error">
                <p>{receiptError ?? receiptFeedback}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setReceiptReloadKey((current) => current + 1)}
                >
                  再試行
                </button>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Shipping</p>
                <h2>出荷対象</h2>
              </div>
              <label className="field" htmlFor="shippingDate">
                <span>出荷日</span>
                <input
                  id="shippingDate"
                  name="shippingDate"
                  type="date"
                  value={shippingDate}
                  onChange={(event) => setShippingDate(event.target.value)}
                />
              </label>
            </div>
            {shippingLoading ? <p className="admin-empty">出荷対象を読み込んでいます。</p> : null}
            {!shippingLoading &&
              shippingTargets.map((target) => (
                <section key={target.orderId} className="purchase-group">
                  <h3>{target.orderId} / {target.customerName}</h3>
                  <p className="admin-inline-feedback">状態: {target.status}</p>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>花材</th>
                        <th>必要数</th>
                        <th>在庫予定</th>
                      </tr>
                    </thead>
                    <tbody>
                      {target.materials.map((material) => (
                        <tr key={material.materialId}>
                          <td>{material.materialName}</td>
                          <td>{material.requiredQuantity}</td>
                          <td>{material.projectedQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {target.hasShortage ? (
                    <p className="admin-feedback admin-feedback--error">在庫不足のため結束完了を登録できません。</p>
                  ) : null}
                  <button
                    type="button"
                    className="primary-button"
                    disabled={target.hasShortage || target.status !== "shipping-prep"}
                    onClick={() => void handleCompleteBundle(target.orderId)}
                  >
                    結束完了を登録する
                  </button>
                </section>
              ))}
            {!shippingLoading && shippingTargets.length === 0 ? (
              <p className="admin-empty">{shippingError ?? "出荷対象はありません。"}</p>
            ) : null}
            {shippingFeedback && shippingFeedback !== "結束完了を登録できませんでした。" ? (
              <p className="admin-inline-feedback">{shippingFeedback}</p>
            ) : null}
            {shippingFeedback === "結束完了を登録できませんでした。" || shippingError ? (
              <div className="admin-feedback admin-feedback--error">
                <p>{shippingError ?? shippingFeedback}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShippingReloadKey((current) => current + 1)}
                >
                  再試行
                </button>
              </div>
            ) : null}

            <section className="purchase-group">
              <h3>出荷確定対象</h3>
              {shipmentLoading ? <p className="admin-empty">出荷確定対象を読み込んでいます。</p> : null}
              {!shipmentLoading &&
                shipmentTargets.map((target) => (
                  <section key={`shipment-${target.orderId}`} className="purchase-group">
                    <h3>{target.orderId} / {target.customerName}</h3>
                    <p className="admin-inline-feedback">状態: {target.status}</p>
                    <p className="admin-inline-feedback">商品: {target.productName}</p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void handleConfirmShipment(target.orderId)}
                    >
                      出荷実績を確定する
                    </button>
                  </section>
                ))}
              {!shipmentLoading && shipmentTargets.length === 0 ? (
                <p className="admin-empty">{shipmentError ?? "出荷確定対象はありません。"}</p>
              ) : null}
              {shipmentFeedback && shipmentFeedback !== "出荷実績を確定できませんでした。" ? (
                <p className="admin-inline-feedback">{shipmentFeedback}</p>
              ) : null}
              {shipmentFeedback === "出荷実績を確定できませんでした。" || shipmentError ? (
                <div className="admin-feedback admin-feedback--error">
                  <p>{shipmentError ?? shipmentFeedback}</p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShipmentReloadKey((current) => current + 1)}
                  >
                    再試行
                  </button>
                </div>
              ) : null}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
