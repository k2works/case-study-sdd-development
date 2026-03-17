import { useState } from 'react'
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
import { fetchItems, createItem, updateItem } from './api/items'
import { fetchProducts, createProduct, updateProduct } from './api/products'
import { fetchOrders, fetchOrder, createOrder } from './api/orders'
import { fetchStockForecast } from './api/stock-forecast'
import { createPurchaseOrder } from './api/purchase-orders'
import { useNavigation } from './hooks/useNavigation'
import { useOrderFlow } from './hooks/useOrderFlow'
import type { ItemDto } from './types/item'

function App() {
  const {
    view,
    customerPage,
    setCustomerPage,
    staffTab,
    setStaffTab,
    detailOrderId,
    handleViewChange,
    handleOrderDetail,
    handleBackFromDetail,
    resetCustomerFlow,
  } = useNavigation();

  const {
    selectedProduct,
    orderFormData,
    completedOrder,
    handleOrder,
    handleOrderConfirm,
    handleOrderSubmit,
    handleBackToList,
    handleBackToForm,
    resetOrderFlow,
  } = useOrderFlow({ createOrder, setCustomerPage });

  const [purchaseOrderItem, setPurchaseOrderItem] = useState<ItemDto | null>(null);

  const handlePurchaseOrder = (item: ItemDto) => {
    setPurchaseOrderItem(item);
  };

  const handlePurchaseOrderBack = () => {
    setPurchaseOrderItem(null);
  };

  const handlePurchaseOrderComplete = () => {
    setPurchaseOrderItem(null);
  };

  const handleViewChangeWithReset = (newView: 'customer' | 'staff') => {
    handleViewChange(newView);
    if (newView === 'customer') {
      resetOrderFlow();
    }
  };

  const handleBackToListWithReset = () => {
    resetOrderFlow();
    resetCustomerFlow();
  };

  const renderCustomerContent = () => {
    switch (customerPage) {
      case 'order-form':
        if (!selectedProduct) return null;
        return (
          <OrderForm
            product={selectedProduct}
            onBack={handleBackToListWithReset}
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
            onTop={handleBackToListWithReset}
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
            onClick={() => { setStaffTab('stock-forecast'); setPurchaseOrderItem(null); }}
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
            purchaseOrderItem ? (
              <PurchaseOrderForm
                item={purchaseOrderItem}
                createPurchaseOrder={createPurchaseOrder}
                onBack={handlePurchaseOrderBack}
                onComplete={handlePurchaseOrderComplete}
              />
            ) : (
              <StockForecast
                fetchItems={fetchItems}
                fetchForecast={fetchStockForecast}
                onPurchaseOrder={handlePurchaseOrder}
              />
            )
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
            onClick={() => handleViewChangeWithReset('customer')}
            disabled={view === 'customer'}
            aria-current={view === 'customer' ? 'page' : undefined}
          >
            花束一覧
          </button>
          <button
            className={`nav-button${view === 'staff' ? ' nav-button--active' : ''}`}
            onClick={() => handleViewChangeWithReset('staff')}
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
