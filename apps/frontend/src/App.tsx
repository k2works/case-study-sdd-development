import { useState, useCallback } from 'react'
import './App.css'
import { ItemManagement } from './pages/staff/ItemManagement'
import { ProductManagement } from './pages/staff/ProductManagement'
import { ProductList } from './pages/customer/ProductList'
import { OrderForm } from './pages/customer/OrderForm'
import { OrderConfirm } from './pages/customer/OrderConfirm'
import { OrderComplete } from './pages/customer/OrderComplete'
import { OrderList } from './pages/staff/OrderList'
import { OrderDetail } from './pages/staff/OrderDetail'
import { StockForecast } from './pages/staff/StockForecast'
import { PurchaseOrderForm } from './pages/staff/PurchaseOrderForm'
import type { OrderFormProduct, OrderFormData } from './pages/customer/OrderForm'
import type { ItemDto, CreateItemInput } from './types/item'
import type { ProductDto, CreateProductInput } from './types/product'
import type { OrderDto, CreateOrderInput } from './types/order'
import type { StockForecastItem } from './types/stock-forecast'
import type { PurchaseOrderInput, PurchaseOrderResult, ItemInfo } from './types/purchase-order'
import { fetchApi } from './api/client'

const API_BASE = '/api';

const fetchItems = async (): Promise<ItemDto[]> => {
  const res = await fetch(`${API_BASE}/items`);
  return res.json();
};

const createItem = async (input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const updateItem = async (id: number, input: CreateItemInput): Promise<ItemDto> => {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const fetchProducts = async (): Promise<ProductDto[]> => {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
};

const createProduct = async (input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const updateProduct = async (id: number, input: CreateProductInput): Promise<ProductDto> => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
};

const fetchOrders = async (status?: string): Promise<OrderDto[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchApi<OrderDto[]>(`/orders${query}`);
};

const fetchOrder = async (id: number): Promise<OrderDto> => {
  return fetchApi<OrderDto>(`/orders/${id}`);
};

const createOrder = async (input: CreateOrderInput): Promise<OrderDto> => {
  return fetchApi<OrderDto>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

const fetchStockForecast = async (
  fromDate: string,
  toDate: string,
  itemId?: number,
): Promise<StockForecastItem[]> => {
  const params = new URLSearchParams({ fromDate, toDate });
  if (itemId) {
    params.set('itemId', String(itemId));
  }
  return fetchApi<StockForecastItem[]>(`/stock/forecast?${params.toString()}`);
};

type View = 'customer' | 'staff';
type CustomerPage = 'list' | 'order-form' | 'order-confirm' | 'order-complete';
type StaffTab = 'products' | 'items' | 'orders' | 'stock-forecast' | 'purchase-order';

function App() {
  const [view, setView] = useState<View>('customer');
  const [customerPage, setCustomerPage] = useState<CustomerPage>('list');
  const [staffTab, setStaffTab] = useState<StaffTab>('products');

  // 注文フローの状態管理
  const [selectedProduct, setSelectedProduct] = useState<OrderFormProduct | null>(null);
  const [orderFormData, setOrderFormData] = useState<OrderFormData | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null);

  // 受注詳細の状態管理
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [purchaseItemId, setPurchaseItemId] = useState<number | null>(null);

  const handleOrder = useCallback((product: OrderFormProduct) => {
    setSelectedProduct(product);
    setCustomerPage('order-form');
  }, []);

  const handleOrderConfirm = useCallback((data: OrderFormData) => {
    setOrderFormData(data);
    setCustomerPage('order-confirm');
  }, []);

  const handleOrderSubmit = useCallback(async () => {
    if (!selectedProduct || !orderFormData) return;

    const input: CreateOrderInput = {
      customerId: 1, // 仮の得意先 ID
      productId: selectedProduct.id,
      destinationName: orderFormData.destinationName,
      destinationAddress: orderFormData.destinationAddress,
      destinationPhone: orderFormData.destinationPhone,
      deliveryDate: orderFormData.deliveryDate,
      message: orderFormData.message || undefined,
    };

    const order = await createOrder(input);
    setCompletedOrder(order);
    setCustomerPage('order-complete');
  }, [selectedProduct, orderFormData]);

  const handleBackToList = useCallback(() => {
    setSelectedProduct(null);
    setOrderFormData(null);
    setCompletedOrder(null);
    setCustomerPage('list');
  }, []);

  const handleBackToForm = useCallback(() => {
    setCustomerPage('order-form');
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
    if (newView === 'customer') {
      handleBackToList();
    }
  }, [handleBackToList]);

  const handleOrderDetail = useCallback((orderId: number) => {
    setDetailOrderId(orderId);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setDetailOrderId(null);
  }, []);

  const fetchItemInfo = async (itemId: number): Promise<ItemInfo> => {
    const items = await fetchItems();
    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error('単品が見つかりません');
    return {
      itemId: item.id,
      itemName: item.name,
      purchaseUnit: item.purchaseUnit,
      leadTimeDays: item.leadTimeDays,
      supplierId: item.supplierId,
      supplierName: `仕入先 ${item.supplierId}`,
    };
  };

  const createPurchaseOrder = async (input: PurchaseOrderInput): Promise<PurchaseOrderResult> => {
    return fetchApi<PurchaseOrderResult>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  };

  const renderCustomerContent = () => {
    switch (customerPage) {
      case 'order-form':
        if (!selectedProduct) return null;
        return (
          <OrderForm
            product={selectedProduct}
            onBack={handleBackToList}
            onConfirm={handleOrderConfirm}
          />
        );
      case 'order-confirm':
        if (!selectedProduct || !orderFormData) return null;
        return (
          <OrderConfirm
            product={selectedProduct}
            formData={orderFormData}
            onBack={handleBackToForm}
            onSubmit={handleOrderSubmit}
          />
        );
      case 'order-complete':
        if (!completedOrder || !selectedProduct) return null;
        return (
          <OrderComplete
            order={completedOrder}
            productName={selectedProduct.name}
            onTop={handleBackToList}
          />
        );
      default:
        return (
          <ProductList
            fetchProducts={fetchProducts}
            fetchItems={fetchItems}
            onOrder={handleOrder}
          />
        );
    }
  };

  const renderStaffContent = () => {
    if (detailOrderId !== null) {
      return (
        <OrderDetail
          orderId={detailOrderId}
          fetchOrder={fetchOrder}
          onBack={handleBackFromDetail}
        />
      );
    }

    return (
      <>
        <div className="staff-tabs" role="tablist" aria-label="管理メニュー">
          <button
            className={`staff-tab${staffTab === 'products' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={staffTab === 'products'}
            aria-controls="panel-products"
            onClick={() => setStaffTab('products')}
            disabled={staffTab === 'products'}
          >
            商品管理
          </button>
          <button
            className={`staff-tab${staffTab === 'items' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={staffTab === 'items'}
            aria-controls="panel-items"
            onClick={() => setStaffTab('items')}
            disabled={staffTab === 'items'}
          >
            単品管理
          </button>
          <button
            className={`staff-tab${staffTab === 'orders' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={staffTab === 'orders'}
            aria-controls="panel-orders"
            onClick={() => setStaffTab('orders')}
            disabled={staffTab === 'orders'}
          >
            受注管理
          </button>
          <button
            className={`staff-tab${staffTab === 'stock-forecast' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={staffTab === 'stock-forecast'}
            aria-controls="panel-stock-forecast"
            onClick={() => setStaffTab('stock-forecast')}
            disabled={staffTab === 'stock-forecast'}
          >
            在庫推移
          </button>
        </div>
        <div role="tabpanel" id={`panel-${staffTab}`}>
          {staffTab === 'products' && (
            <ProductManagement
              fetchProducts={fetchProducts}
              createProduct={createProduct}
              updateProduct={updateProduct}
              fetchItems={fetchItems}
            />
          )}
          {staffTab === 'items' && (
            <ItemManagement
              fetchItems={fetchItems}
              createItem={createItem}
              updateItem={updateItem}
            />
          )}
          {staffTab === 'orders' && (
            <OrderList
              fetchOrders={fetchOrders}
              onDetail={handleOrderDetail}
            />
          )}
          {staffTab === 'stock-forecast' && (
            <StockForecast
              fetchForecast={fetchStockForecast}
              onPurchaseOrder={(itemId) => {
                setPurchaseItemId(itemId);
                setStaffTab('purchase-order');
              }}
            />
          )}
          {staffTab === 'purchase-order' && purchaseItemId && (
            <PurchaseOrderForm
              itemId={purchaseItemId}
              fetchItemInfo={fetchItemInfo}
              createPurchaseOrder={createPurchaseOrder}
              onBack={() => {
                setPurchaseItemId(null);
                setStaffTab('stock-forecast');
              }}
              onSuccess={() => {
                setPurchaseItemId(null);
                setStaffTab('stock-forecast');
              }}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">フレール・メモワール WEB ショップ</h1>
        <nav className="app-nav" aria-label="メインナビゲーション">
          <button
            className={`nav-button${view === 'customer' ? ' nav-button--active' : ''}`}
            onClick={() => handleViewChange('customer')}
            disabled={view === 'customer'}
            aria-current={view === 'customer' ? 'page' : undefined}
          >
            花束一覧
          </button>
          <button
            className={`nav-button${view === 'staff' ? ' nav-button--active' : ''}`}
            onClick={() => handleViewChange('staff')}
            disabled={view === 'staff'}
            aria-current={view === 'staff' ? 'page' : undefined}
          >
            管理画面
          </button>
        </nav>
      </header>
      <main className="app-main">
        {view === 'customer' && renderCustomerContent()}
        {view === 'staff' && renderStaffContent()}
      </main>
    </div>
  )
}

export default App
