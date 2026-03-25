import { Injectable } from "@nestjs/common";

export type CreateOrderRequest = {
  productId?: string | null;
  productName: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
};

export type CreateOrderResponse = {
  orderId: string;
  status: "confirmed";
};

@Injectable()
export class OrderService {
  private sequence = 1;

  createOrder(_: CreateOrderRequest): CreateOrderResponse {
    const orderId = `ORD-${String(this.sequence).padStart(4, "0")}`;
    this.sequence += 1;

    return {
      orderId,
      status: "confirmed",
    };
  }
}
