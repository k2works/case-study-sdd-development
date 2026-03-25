import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
  controllers: [HealthController, OrderController],
  providers: [HealthService, OrderService],
})
export class AppModule {}
