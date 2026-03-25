import { BadRequestException, Controller, Get, Inject, Query } from "@nestjs/common";

import { InventoryProjectionResponse, InventoryService } from "./inventory.service";

@Controller("admin/inventory-projections")
export class InventoryController {
  private readonly inventoryService: InventoryService;

  constructor(@Inject(InventoryService) inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  @Get()
  getInventoryProjections(
    @Query("startDate") startDate = "2026-04-10",
    @Query("endDate") endDate = "2026-04-12",
  ): InventoryProjectionResponse {
    if (startDate > endDate) {
      throw new BadRequestException("開始日は終了日以前で指定してください。");
    }

    if (!this.inventoryService.isSupportedRange(startDate, endDate)) {
      throw new BadRequestException("指定期間は現在のサンプル表示範囲外です。");
    }

    return this.inventoryService.getInventoryProjections(startDate, endDate);
  }
}
