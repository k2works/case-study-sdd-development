import { BadRequestException, Injectable, Inject } from "@nestjs/common";

import { InventoryService } from "./inventory.service";
import { OrderDetail, OrderService } from "./order.service";

export type ShippingTargetMaterial = {
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  projectedQuantity: number;
};

export type ShippingTarget = {
  orderId: string;
  customerName: string;
  productName: string;
  shippingDate: string;
  status: string;
  materials: ShippingTargetMaterial[];
  hasShortage: boolean;
};

const PRODUCT_RECIPES: Record<
  string,
  Array<{
    materialId: string;
    materialName: string;
    requiredQuantity: number;
  }>
> = {
  "ホワイトリリー": [
    { materialId: "MAT-001", materialName: "バラ赤", requiredQuantity: 8 },
    { materialId: "MAT-002", materialName: "カスミソウ", requiredQuantity: 4 },
  ],
  "ローズガーデン": [
    { materialId: "MAT-001", materialName: "バラ赤", requiredQuantity: 10 },
    { materialId: "MAT-002", materialName: "カスミソウ", requiredQuantity: 2 },
  ],
};

@Injectable()
export class ShippingService {
  private readonly inventoryService: InventoryService;
  private readonly orderService: OrderService;

  constructor(
    @Inject(InventoryService) inventoryService: InventoryService,
    @Inject(OrderService) orderService: OrderService,
  ) {
    this.inventoryService = inventoryService;
    this.orderService = orderService;
  }

  listShippingTargets(shippingDate: string): ShippingTarget[] {
    return this.orderService.listOrdersByShippingDate(shippingDate).map((order) =>
      this.toShippingTarget(order),
    );
  }

  completeBundle(orderId: string): { orderId: string; status: "shipping-ready" } {
    const order = this.orderService.getOrderDetail(orderId);

    if (!order) {
      throw new BadRequestException("対象受注が存在しません。");
    }

    if (order.status === "shipping-ready") {
      throw new BadRequestException("すでに出荷準備完了です。");
    }

    const target = this.toShippingTarget(order);

    if (target.hasShortage) {
      throw new BadRequestException("在庫不足のため結束完了を登録できません。");
    }

    this.orderService.updateOrderStatus(orderId, "shipping-ready");

    return {
      orderId,
      status: "shipping-ready",
    };
  }

  private toShippingTarget(order: OrderDetail): ShippingTarget {
    const recipe = PRODUCT_RECIPES[order.productName] ?? [];
    const materials = recipe.map((material) => ({
      materialId: material.materialId,
      materialName: material.materialName,
      requiredQuantity: material.requiredQuantity,
      projectedQuantity: this.inventoryService.getProjectedQuantity(material.materialId, order.shippingDate),
    }));

    return {
      orderId: order.orderId,
      customerName: order.customerName,
      productName: order.productName,
      shippingDate: order.shippingDate,
      status: order.status,
      materials,
      hasShortage: materials.some((material) => material.projectedQuantity < material.requiredQuantity),
    };
  }
}
