import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";

import { ShipmentResult, ShipmentTarget, ShippingService, ShippingTarget } from "./shipping.service";

@Controller("admin")
export class ShippingController {
  private readonly shippingService: ShippingService;

  constructor(@Inject(ShippingService) shippingService: ShippingService) {
    this.shippingService = shippingService;
  }

  @Get("shipping-targets")
  listShippingTargets(@Query("shippingDate") shippingDate = "2026-04-11"): ShippingTarget[] {
    return this.shippingService.listShippingTargets(shippingDate);
  }

  @Get("shipments")
  listShipmentTargets(@Query("shippingDate") shippingDate = "2026-04-11"): ShipmentTarget[] {
    return this.shippingService.listShipmentTargets(shippingDate);
  }

  @Post("orders/:orderId/bundle-completions")
  completeBundle(
    @Param("orderId") orderId: string,
    @Body() _request: Record<string, never>,
  ): { orderId: string; status: "shipping-ready" } {
    return this.shippingService.completeBundle(orderId);
  }

  @Post("orders/:orderId/shipments")
  confirmShipment(@Param("orderId") orderId: string): ShipmentResult {
    return this.shippingService.confirmShipment(orderId);
  }
}
