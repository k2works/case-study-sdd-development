import { Body, Controller, Get, Inject, NotFoundException, Param, Post, Query } from "@nestjs/common";

import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  OrderService,
  OrderSummary,
} from "./order.service";

@Controller()
export class OrderController {
  private readonly orderService: OrderService;

  constructor(@Inject(OrderService) orderService: OrderService) {
    this.orderService = orderService;
  }

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
