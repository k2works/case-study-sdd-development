import { Body, Controller, Get, Inject, NotFoundException, Param, Post, Query } from "@nestjs/common";

import {
  ChangeDeliveryDateRequest,
  ChangeDeliveryDateResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  DeliveryAddressHistory,
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

  @Get("customer/delivery-addresses")
  listDeliveryAddresses(
    @Query("customerEmail") customerEmail?: string,
    @Query("customerPhone") customerPhone?: string,
  ): DeliveryAddressHistory[] {
    if (!customerEmail || !customerPhone) {
      return [];
    }

    return this.orderService.listDeliveryAddresses(customerEmail, customerPhone);
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

  @Post("admin/orders/:orderId/delivery-date-change")
  changeDeliveryDate(
    @Param("orderId") orderId: string,
    @Body() request: ChangeDeliveryDateRequest,
  ): ChangeDeliveryDateResponse {
    return this.orderService.changeDeliveryDate(orderId, request);
  }
}
