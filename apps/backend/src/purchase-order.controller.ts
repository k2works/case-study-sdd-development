import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";

import {
  ConfirmPurchaseOrderRequest,
  ConfirmPurchaseOrderResponse,
  PurchaseOrderCandidateGroup,
  PurchaseOrderService,
} from "./purchase-order.service";

@Controller("admin/purchase-orders")
export class PurchaseOrderController {
  private readonly purchaseOrderService: PurchaseOrderService;

  constructor(@Inject(PurchaseOrderService) purchaseOrderService: PurchaseOrderService) {
    this.purchaseOrderService = purchaseOrderService;
  }

  @Get("candidates")
  getCandidates(
    @Query("startDate") startDate = "2026-04-10",
    @Query("endDate") endDate = "2026-04-12",
  ): PurchaseOrderCandidateGroup[] {
    return this.purchaseOrderService.getCandidates(startDate, endDate);
  }

  @Post()
  confirmPurchaseOrder(
    @Body() request: ConfirmPurchaseOrderRequest,
  ): ConfirmPurchaseOrderResponse {
    return this.purchaseOrderService.confirmPurchaseOrder(request);
  }
}
