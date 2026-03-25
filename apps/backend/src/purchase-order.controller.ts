import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";

import {
  ConfirmPurchaseOrderRequest,
  ConfirmPurchaseOrderResponse,
  PurchaseOrderCandidateGroup,
  PurchaseOrderSummary,
  PurchaseOrderService,
  RegisterReceiptRequest,
  RegisterReceiptResponse,
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

  @Get()
  listPurchaseOrders(): PurchaseOrderSummary[] {
    return this.purchaseOrderService.listPurchaseOrders();
  }

  @Post()
  confirmPurchaseOrder(
    @Body() request: ConfirmPurchaseOrderRequest,
  ): ConfirmPurchaseOrderResponse {
    return this.purchaseOrderService.confirmPurchaseOrder(request);
  }

  @Post(":purchaseOrderId/receipts")
  registerReceipt(
    @Param("purchaseOrderId") purchaseOrderId: string,
    @Body() request: RegisterReceiptRequest,
  ): RegisterReceiptResponse {
    return this.purchaseOrderService.registerReceipt(purchaseOrderId, request);
  }
}
