import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PurchaseOrderController } from "./purchase-order.controller";
import { PurchaseOrderService } from "./purchase-order.service";
import { ShippingController } from "./shipping.controller";
import { ShippingService } from "./shipping.service";

@Module({
  controllers: [
    HealthController,
    OrderController,
    ProductController,
    InventoryController,
    MaterialController,
    PurchaseOrderController,
    ShippingController,
  ],
  providers: [
    HealthService,
    ProductService,
    OrderService,
    MaterialService,
    InventoryService,
    PurchaseOrderService,
    ShippingService,
  ],
})
export class AppModule {}
