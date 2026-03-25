import { Controller, Get, Query } from "@nestjs/common";

import { InventoryProjectionResponse, InventoryService } from "./inventory.service";

@Controller("admin/inventory-projections")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventoryProjections(
    @Query("startDate") startDate = "2026-04-10",
    @Query("endDate") endDate = "2026-04-12",
  ): InventoryProjectionResponse {
    return this.inventoryService.getInventoryProjections(startDate, endDate);
  }
}
