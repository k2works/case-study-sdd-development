import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
  controllers: [HealthController, OrderController, InventoryController],
  providers: [HealthService, OrderService, InventoryService],
})
export class AppModule {}
