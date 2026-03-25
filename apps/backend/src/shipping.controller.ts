import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";

import { ShippingService, ShippingTarget } from "./shipping.service";

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

  @Post("orders/:orderId/bundle-completions")
  completeBundle(
    @Param("orderId") orderId: string,
    @Body() _request: Record<string, never>,
  ): { orderId: string; status: "shipping-ready" } {
    return this.shippingService.completeBundle(orderId);
  }
}
