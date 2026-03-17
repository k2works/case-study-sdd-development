import { useState, useCallback } from 'react';

export type View = 'customer' | 'staff';
export type CustomerPage = 'list' | 'order-form' | 'order-confirm' | 'order-complete';
export type StaffTab = 'products' | 'items' | 'orders' | 'stock-forecast';

export function useNavigation() {
  const [view, setView] = useState<View>('customer');
  const [customerPage, setCustomerPage] = useState<CustomerPage>('list');
  const [staffTab, setStaffTab] = useState<StaffTab>('products');
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const resetCustomerFlow = useCallback(() => {
    setCustomerPage('list');
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
    if (newView === 'customer') {
      resetCustomerFlow();
    }
  }, [resetCustomerFlow]);

  const handleOrderDetail = useCallback((orderId: number) => {
    setDetailOrderId(orderId);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setDetailOrderId(null);
  }, []);

  return {
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
  };
}
