import { useState, useCallback } from 'react';
import type { OrderFormProduct, OrderFormData } from '../pages/customer/OrderForm';
import type { OrderDto, CreateOrderInput } from '../types/order';
import type { CustomerPage } from './useNavigation';

interface UseOrderFlowProps {
  createOrder: (input: CreateOrderInput) => Promise<OrderDto>;
  setCustomerPage: (page: CustomerPage) => void;
}

export function useOrderFlow({ createOrder, setCustomerPage }: UseOrderFlowProps) {
  const [selectedProduct, setSelectedProduct] = useState<OrderFormProduct | null>(null);
  const [orderFormData, setOrderFormData] = useState<OrderFormData | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderDto | null>(null);

  const handleOrder = useCallback((product: OrderFormProduct) => {
    setSelectedProduct(product);
    setCustomerPage('order-form');
  }, [setCustomerPage]);

  const handleOrderConfirm = useCallback((data: OrderFormData) => {
    setOrderFormData(data);
    setCustomerPage('order-confirm');
  }, [setCustomerPage]);

  const handleOrderSubmit = useCallback(async () => {
    if (!selectedProduct || !orderFormData) return;

    const input: CreateOrderInput = {
      customerId: 1,
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
  }, [selectedProduct, orderFormData, createOrder, setCustomerPage]);

  const handleBackToList = useCallback(() => {
    setSelectedProduct(null);
    setOrderFormData(null);
    setCompletedOrder(null);
    setCustomerPage('list');
  }, [setCustomerPage]);

  const handleBackToForm = useCallback(() => {
    setCustomerPage('order-form');
  }, [setCustomerPage]);

  const resetOrderFlow = useCallback(() => {
    setSelectedProduct(null);
    setOrderFormData(null);
    setCompletedOrder(null);
  }, []);

  return {
    selectedProduct,
    orderFormData,
    completedOrder,
    handleOrder,
    handleOrderConfirm,
    handleOrderSubmit,
    handleBackToList,
    handleBackToForm,
    resetOrderFlow,
  };
}
