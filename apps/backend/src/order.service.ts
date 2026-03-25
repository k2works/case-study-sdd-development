import { Injectable } from "@nestjs/common";

export type CreateOrderRequest = {
  productId?: string | null;
  customerName?: string | null;
  productName: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
};

export type CreateOrderResponse = {
  orderId: string;
  status: "confirmed";
};

export type OrderSummary = {
  orderId: string;
  customerName: string;
  productName: string;
  deliveryDate: string;
  shippingDate: string;
  status: "confirmed" | "shipping-prep";
};

export type OrderDetail = OrderSummary & {
  deliveryAddress: string;
  message: string;
};

export type OrderFilter = {
  customerName?: string;
};

@Injectable()
export class OrderService {
  private sequence = 1;
  private readonly orders: OrderDetail[] = [
    {
      orderId: "ORD-1001",
      customerName: "青山フラワー",
      productName: "ローズガーデン",
      deliveryDate: "2026-04-10",
      shippingDate: "2026-04-09",
      status: "confirmed",
      deliveryAddress: "東京都港区南青山 1-2-3",
      message: "開店祝いのお花です。",
    },
    {
      orderId: "ORD-1002",
      customerName: "表参道ギャラリー",
      productName: "ホワイトリリー",
      deliveryDate: "2026-04-12",
      shippingDate: "2026-04-11",
      status: "shipping-prep",
      deliveryAddress: "東京都渋谷区神宮前 4-5-6",
      message: "展示会受付にお届けしてください。",
    },
  ];

  createOrder(request: CreateOrderRequest): CreateOrderResponse {
    const orderId = `ORD-${String(this.sequence).padStart(4, "0")}`;
    this.sequence += 1;
    this.orders.push({
      orderId,
      customerName: request.customerName ?? "オンライン顧客",
      productName: request.productName,
      deliveryDate: request.deliveryDate,
      shippingDate: request.deliveryDate,
      status: "confirmed",
      deliveryAddress: request.deliveryAddress,
      message: request.message,
    });

    return {
      orderId,
      status: "confirmed",
    };
  }

  listOrders(filter: OrderFilter = {}): OrderSummary[] {
    return this.orders
      .filter((order) => {
        if (!filter.customerName) {
          return true;
        }

        return order.customerName.includes(filter.customerName);
      })
      .map(({ orderId, customerName, productName, deliveryDate, shippingDate, status }) => ({
        orderId,
        customerName,
        productName,
        deliveryDate,
        shippingDate,
        status,
      }));
  }

  getOrderDetail(orderId: string): OrderDetail | undefined {
    return this.orders.find((order) => order.orderId === orderId);
  }
}
