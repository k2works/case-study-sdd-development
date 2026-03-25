import { Body, Controller, Get, NotFoundException, Param, Post, Query } from "@nestjs/common";

import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  OrderService,
  OrderSummary,
} from "./order.service";

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("customer/orders")
  createOrder(@Body() request: CreateOrderRequest): CreateOrderResponse {
    return this.orderService.createOrder(request);
  }

  @Get("admin/orders")
  listOrders(@Query("customerName") customerName?: string): OrderSummary[] {
    return this.orderService.listOrders({ customerName });
  }

  @Get("admin/orders/:orderId")
  getOrderDetail(@Param("orderId") orderId: string): OrderDetail {
    const order = this.orderService.getOrderDetail(orderId);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }
}
