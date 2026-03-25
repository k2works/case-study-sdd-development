import { Body, Controller, Post } from "@nestjs/common";

import { CreateOrderRequest, CreateOrderResponse, OrderService } from "./order.service";

@Controller("customer/orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() request: CreateOrderRequest): CreateOrderResponse {
    return this.orderService.createOrder(request);
  }
}
