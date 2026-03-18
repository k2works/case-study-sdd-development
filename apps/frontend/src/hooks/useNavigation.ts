import { useState, useCallback } from 'react';
import type { OrderFormProduct, OrderFormData } from '../pages/customer/OrderForm';
import type { OrderDto } from '../types/order';

export type View = 'customer' | 'staff';
export type CustomerPage = 'list' | 'order-form' | 'order-confirm' | 'order-complete';
export type StaffTab = 'products' | 'items' | 'orders' | 'customers' | 'stock-forecast' | 'purchase-order' | 'arrival' | 'shipments';

export function useNavigation() {
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

  const handleOrderComplete = useCallback((order: OrderDto) => {
    setCompletedOrder(order);
    setCustomerPage('order-complete');
  }, []);

  const handlePurchaseOrder = useCallback((itemId: number) => {
    setPurchaseItemId(itemId);
    setStaffTab('purchase-order');
  }, []);

  const handleBackFromPurchaseOrder = useCallback(() => {
    setPurchaseItemId(null);
    setStaffTab('stock-forecast');
  }, []);

  return {
    view,
    customerPage,
    staffTab,
    setStaffTab,
    selectedProduct,
    orderFormData,
    completedOrder,
    detailOrderId,
    purchaseItemId,
    handleOrder,
    handleOrderConfirm,
    handleOrderComplete,
    handleBackToList,
    handleBackToForm,
    handleViewChange,
    handleOrderDetail,
    handleBackFromDetail,
    handlePurchaseOrder,
    handleBackFromPurchaseOrder,
  };
}
