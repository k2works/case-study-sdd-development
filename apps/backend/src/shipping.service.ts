import { BadRequestException, Injectable, Inject } from "@nestjs/common";

import { InventoryService } from "./inventory.service";
import { OrderDetail, OrderService } from "./order.service";
import { MaterialService } from "./material.service";
import { ProductService } from "./product.service";

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

export type ShipmentTarget = {
  orderId: string;
  customerName: string;
  productName: string;
  shippingDate: string;
  status: "shipping-ready";
};

export type ShipmentResult = {
  orderId: string;
  status: "shipped";
};

@Injectable()
export class ShippingService {
  private readonly inventoryService: InventoryService;
  private readonly materialService: MaterialService;
  private readonly orderService: OrderService;
  private readonly productService: ProductService;

  constructor(
    @Inject(InventoryService) inventoryService: InventoryService,
    @Inject(MaterialService) materialService: MaterialService,
    @Inject(OrderService) orderService: OrderService,
    @Inject(ProductService) productService: ProductService,
  ) {
    this.inventoryService = inventoryService;
    this.materialService = materialService;
    this.orderService = orderService;
    this.productService = productService;
  }

  listShippingTargets(shippingDate: string): ShippingTarget[] {
    return this.orderService
      .listOrdersByShippingDate(shippingDate)
      .filter((order) => order.status !== "shipped")
      .map((order) =>
      this.toShippingTarget(order),
      );
  }

  completeBundle(orderId: string): { orderId: string; status: "shipping-ready" } {
    const order = this.orderService.getOrderRecord(orderId);

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

    if (order.status === "shipped") {
      throw new BadRequestException("すでに出荷済みです。");
    }

    this.orderService.updateOrderStatus(orderId, "shipping-ready");

    return {
      orderId,
      status: "shipping-ready",
    };
  }

  listShipmentTargets(shippingDate: string): ShipmentTarget[] {
    return this.orderService.listOrdersByStatus("shipping-ready", shippingDate).map((order) => ({
      orderId: order.orderId,
      customerName: order.customerName,
      productName: order.productName,
      shippingDate: order.shippingDate,
      status: "shipping-ready",
    }));
  }

  confirmShipment(orderId: string): ShipmentResult {
    const order = this.orderService.getOrderRecord(orderId);

    if (!order) {
      throw new BadRequestException("対象受注が存在しません。");
    }

    if (order.status === "shipped") {
      throw new BadRequestException("すでに出荷済みです。");
    }

    if (order.status !== "shipping-ready") {
      throw new BadRequestException("出荷準備完了の対象だけを出荷確定できます。");
    }

    this.orderService.updateOrderStatus(orderId, "shipped");

    return {
      orderId,
      status: "shipped",
    };
  }

  private toShippingTarget(order: OrderDetail): ShippingTarget {
    const record = this.orderService.getOrderRecord(order.orderId);
    const recipe = record?.productId
      ? this.productService.findProduct(record.productId)?.materials ?? []
      : [];
    const materials = recipe.map((material) => ({
      materialId: material.materialId,
      materialName:
        this.materialService.findMaterial(material.materialId)?.materialName ?? material.materialId,
      requiredQuantity: material.quantity,
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
