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
import { ArrivalRegistration } from './pages/staff/ArrivalRegistration'
import { ShipmentList } from './pages/staff/ShipmentList'
import { CustomerManagement } from './pages/staff/CustomerManagement'
import type { CreateOrderInput } from './types/order'
import { useNavigation } from './hooks/useNavigation'
import {
  fetchItems,
  createItem,
  updateItem,
  fetchProducts,
  createProduct,
  updateProduct,
  fetchOrders,
  fetchOrder,
  createOrder,
  fetchStockForecast,
  fetchItemInfo,
  createPurchaseOrder,
  fetchPurchaseOrders,
  registerArrival,
  fetchShipments,
  recordShipment,
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchDestinations,
  fetchOrderDestinations,
  changeDeliveryDate,
} from './hooks/useApi'

function App() {
  const nav = useNavigation();

  const handleOrderSubmit = async () => {
    if (!nav.selectedProduct || !nav.orderFormData) return;

    const input: CreateOrderInput = {
      customerId: 1, // 仮の得意先 ID
      productId: nav.selectedProduct.id,
      destinationName: nav.orderFormData.destinationName,
      destinationAddress: nav.orderFormData.destinationAddress,
      destinationPhone: nav.orderFormData.destinationPhone,
      deliveryDate: nav.orderFormData.deliveryDate,
      message: nav.orderFormData.message || undefined,
    };

    const order = await createOrder(input);
    nav.handleOrderComplete(order);
  };

  const renderCustomerContent = () => {
    switch (nav.customerPage) {
      case 'order-form':
        if (!nav.selectedProduct) return null;
        return (
          <OrderForm
            product={nav.selectedProduct}
            onBack={nav.handleBackToList}
            onConfirm={nav.handleOrderConfirm}
            fetchCustomers={fetchCustomers}
            fetchOrderDestinations={fetchOrderDestinations}
          />
        );
      case 'order-confirm':
        if (!nav.selectedProduct || !nav.orderFormData) return null;
        return (
          <OrderConfirm
            product={nav.selectedProduct}
            formData={nav.orderFormData}
            onBack={nav.handleBackToForm}
            onSubmit={handleOrderSubmit}
          />
        );
      case 'order-complete':
        if (!nav.completedOrder || !nav.selectedProduct) return null;
        return (
          <OrderComplete
            order={nav.completedOrder}
            productName={nav.selectedProduct.name}
            onTop={nav.handleBackToList}
          />
        );
      default:
        return (
          <ProductList
            fetchProducts={fetchProducts}
            fetchItems={fetchItems}
            onOrder={nav.handleOrder}
          />
        );
    }
  };

  const renderStaffContent = () => {
    if (nav.detailOrderId !== null) {
      return (
        <OrderDetail
          orderId={nav.detailOrderId}
          fetchOrder={fetchOrder}
          onBack={nav.handleBackFromDetail}
          changeDeliveryDate={changeDeliveryDate}
        />
      );
    }

    return (
      <>
        <div className="staff-tabs" role="tablist" aria-label="管理メニュー">
          <button
            className={`staff-tab${nav.staffTab === 'products' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'products'}
            aria-controls="panel-products"
            onClick={() => nav.setStaffTab('products')}
            disabled={nav.staffTab === 'products'}
          >
            商品管理
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'items' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'items'}
            aria-controls="panel-items"
            onClick={() => nav.setStaffTab('items')}
            disabled={nav.staffTab === 'items'}
          >
            単品管理
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'orders' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'orders'}
            aria-controls="panel-orders"
            onClick={() => nav.setStaffTab('orders')}
            disabled={nav.staffTab === 'orders'}
          >
            受注管理
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'customers' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'customers'}
            aria-controls="panel-customers"
            onClick={() => nav.setStaffTab('customers')}
            disabled={nav.staffTab === 'customers'}
          >
            得意先
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'stock-forecast' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'stock-forecast'}
            aria-controls="panel-stock-forecast"
            onClick={() => nav.setStaffTab('stock-forecast')}
            disabled={nav.staffTab === 'stock-forecast'}
          >
            在庫推移
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'arrival' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'arrival'}
            aria-controls="panel-arrival"
            onClick={() => nav.setStaffTab('arrival')}
            disabled={nav.staffTab === 'arrival'}
          >
            入荷登録
          </button>
          <button
            className={`staff-tab${nav.staffTab === 'shipments' ? ' staff-tab--active' : ''}`}
            role="tab"
            aria-selected={nav.staffTab === 'shipments'}
            aria-controls="panel-shipments"
            onClick={() => nav.setStaffTab('shipments')}
            disabled={nav.staffTab === 'shipments'}
          >
            出荷
          </button>
        </div>
        <div role="tabpanel" id={`panel-${nav.staffTab}`}>
          {nav.staffTab === 'products' && (
            <ProductManagement
              fetchProducts={fetchProducts}
              createProduct={createProduct}
              updateProduct={updateProduct}
              fetchItems={fetchItems}
            />
          )}
          {nav.staffTab === 'items' && (
            <ItemManagement
              fetchItems={fetchItems}
              createItem={createItem}
              updateItem={updateItem}
            />
          )}
          {nav.staffTab === 'orders' && (
            <OrderList
              fetchOrders={fetchOrders}
              onDetail={nav.handleOrderDetail}
            />
          )}
          {nav.staffTab === 'customers' && (
            <CustomerManagement
              fetchCustomers={fetchCustomers}
              createCustomer={createCustomer}
              updateCustomer={updateCustomer}
              fetchDestinations={fetchDestinations}
            />
          )}
          {nav.staffTab === 'stock-forecast' && (
            <StockForecast
              fetchForecast={fetchStockForecast}
              onPurchaseOrder={nav.handlePurchaseOrder}
            />
          )}
          {nav.staffTab === 'purchase-order' && nav.purchaseItemId && (
            <PurchaseOrderForm
              itemId={nav.purchaseItemId}
              fetchItemInfo={fetchItemInfo}
              createPurchaseOrder={createPurchaseOrder}
              onBack={nav.handleBackFromPurchaseOrder}
              onSuccess={nav.handleBackFromPurchaseOrder}
            />
          )}
          {nav.staffTab === 'shipments' && (
            <ShipmentList
              fetchShipments={fetchShipments}
              recordShipment={recordShipment}
            />
          )}
          {nav.staffTab === 'arrival' && (
            <ArrivalRegistration
              fetchPurchaseOrders={fetchPurchaseOrders}
              fetchItems={fetchItems}
              registerArrival={registerArrival}
              onSuccess={() => {}}
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
            className={`nav-button${nav.view === 'customer' ? ' nav-button--active' : ''}`}
            onClick={() => nav.handleViewChange('customer')}
            disabled={nav.view === 'customer'}
            aria-current={nav.view === 'customer' ? 'page' : undefined}
          >
            花束一覧
          </button>
          <button
            className={`nav-button${nav.view === 'staff' ? ' nav-button--active' : ''}`}
            onClick={() => nav.handleViewChange('staff')}
            disabled={nav.view === 'staff'}
            aria-current={nav.view === 'staff' ? 'page' : undefined}
          >
            管理画面
          </button>
        </nav>
      </header>
      <main className="app-main">
        {nav.view === 'customer' && renderCustomerContent()}
        {nav.view === 'staff' && renderStaffContent()}
      </main>
    </div>
  )
}

export default App
