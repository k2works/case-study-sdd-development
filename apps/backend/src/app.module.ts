import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { PurchaseOrderController } from "./purchase-order.controller";
import { PurchaseOrderService } from "./purchase-order.service";

@Module({
  controllers: [
    HealthController,
    OrderController,
    InventoryController,
    MaterialController,
    PurchaseOrderController,
  ],
  providers: [
    HealthService,
    OrderService,
    MaterialService,
    InventoryService,
    PurchaseOrderService,
  ],
})
export class AppModule {}
