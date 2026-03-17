export interface OrderDestination {
  name: string;
  address: string;
  phone: string;
}

export interface OrderDto {
  id: number;
  customerId: number;
  productId: number;
  price: number;
  destination: OrderDestination;
  deliveryDate: string;
  shippingDate: string;
  message: string;
  status: string;
}

export interface CreateOrderInput {
  customerId: number;
  productId: number;
  destinationName: string;
  destinationAddress: string;
  destinationPhone: string;
  deliveryDate: string;
  message?: string;
}
