import { ConflictException, Injectable, BadRequestException, Inject } from "@nestjs/common";

import { InventoryService } from "./inventory.service";
import { MaterialService } from "./material.service";

export type PurchaseOrderCandidateItem = {
  materialId: string;
  materialName: string;
  shortageDate: string;
  shortageQuantity: number;
  suggestedQuantity: number;
  purchaseUnit: number;
};

export type PurchaseOrderCandidateGroup = {
  supplierName: string;
  items: PurchaseOrderCandidateItem[];
};

export type ConfirmPurchaseOrderRequest = {
  supplierName: string;
  items: Array<{
    materialId: string;
    quantity: number;
  }>;
};

export type ConfirmPurchaseOrderResponse = {
  purchaseOrderId: string;
  status: "送信待ち";
};

type PurchaseOrderRecord = ConfirmPurchaseOrderResponse & ConfirmPurchaseOrderRequest;

@Injectable()
export class PurchaseOrderService {
  private sequence = 1;
  private readonly orders: PurchaseOrderRecord[] = [];
  private readonly inventoryService: InventoryService;
  private readonly materialService: MaterialService;

  constructor(
    @Inject(InventoryService) inventoryService: InventoryService,
    @Inject(MaterialService) materialService: MaterialService,
  ) {
    this.inventoryService = inventoryService;
    this.materialService = materialService;
  }

  getCandidates(startDate: string, endDate: string): PurchaseOrderCandidateGroup[] {
    const projection = this.inventoryService.getInventoryProjections(startDate, endDate);
    const groups = new Map<string, PurchaseOrderCandidateItem[]>();

    for (const item of projection.items) {
      const shortageProjections = item.projections.filter(
        (projectionItem) => projectionItem.projectedQuantity < 0,
      );

      if (shortageProjections.length === 0) {
        continue;
      }

      const material = this.materialService.findMaterial(item.materialId);

      if (!material) {
        continue;
      }

      const shortageProjection = shortageProjections.reduce((currentMax, candidate) =>
        Math.abs(candidate.projectedQuantity) > Math.abs(currentMax.projectedQuantity)
          ? candidate
          : currentMax
      );
      const shortageQuantity = Math.abs(shortageProjection.projectedQuantity);
      const suggestedQuantity =
        Math.ceil(shortageQuantity / material.purchaseUnit) * material.purchaseUnit;

      const candidateItem: PurchaseOrderCandidateItem = {
        materialId: material.materialId,
        materialName: material.materialName,
        shortageDate: shortageProjection.date,
        shortageQuantity,
        suggestedQuantity,
        purchaseUnit: material.purchaseUnit,
      };

      const current = groups.get(material.supplierName) ?? [];
      current.push(candidateItem);
      groups.set(material.supplierName, current);
    }

    return Array.from(groups.entries()).map(([supplierName, items]) => ({
      supplierName,
      items,
    }));
  }

  confirmPurchaseOrder(request: ConfirmPurchaseOrderRequest): ConfirmPurchaseOrderResponse {
    if (request.items.some((item) => item.quantity <= 0)) {
      throw new BadRequestException("数量 0 以下の発注は確定できません。");
    }

    const duplicated = this.orders.find(
      (order) =>
        order.supplierName === request.supplierName &&
        JSON.stringify(order.items) === JSON.stringify(request.items),
    );

    if (duplicated) {
      throw new ConflictException("同一内容の発注が存在します。再送案内を確認してください。");
    }

    const response: ConfirmPurchaseOrderResponse = {
      purchaseOrderId: `PO-${String(this.sequence).padStart(4, "0")}`,
      status: "送信待ち",
    };
    this.sequence += 1;

    this.orders.push({
      ...request,
      ...response,
    });

    return response;
  }
}
