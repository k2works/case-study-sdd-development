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

export type PurchaseOrderStatus = "送信待ち" | "一部入荷" | "入荷完了";

export type PurchaseOrderItemRecord = {
  materialId: string;
  quantity: number;
  receivedQuantity: number;
};

export type PurchaseOrderSummary = {
  purchaseOrderId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemRecord[];
};

export type RegisterReceiptRequest = {
  receiptDate: string;
  items: Array<{
    materialId: string;
    quantity: number;
  }>;
};

export type RegisterReceiptResponse = {
  purchaseOrderId: string;
  status: Extract<PurchaseOrderStatus, "一部入荷" | "入荷完了">;
};

type PurchaseOrderRecord = {
  purchaseOrderId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemRecord[];
};

@Injectable()
export class PurchaseOrderService {
  private sequence = 1;
  private readonly orders: PurchaseOrderRecord[] = [
    {
      purchaseOrderId: "PO-9001",
      supplierName: "東京フラワー物流",
      status: "送信待ち",
      items: [
        {
          materialId: "MAT-001",
          quantity: 10,
          receivedQuantity: 0,
        },
      ],
    },
  ];
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
        JSON.stringify(
          order.items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
          })),
        ) === JSON.stringify(request.items),
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
      purchaseOrderId: response.purchaseOrderId,
      supplierName: request.supplierName,
      status: response.status,
      items: request.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        receivedQuantity: 0,
      })),
    });

    return response;
  }

  listPurchaseOrders(): PurchaseOrderSummary[] {
    return this.orders.map((order) => ({
      purchaseOrderId: order.purchaseOrderId,
      supplierName: order.supplierName,
      status: order.status,
      items: order.items.map((item) => ({ ...item })),
    }));
  }

  registerReceipt(
    purchaseOrderId: string,
    request: RegisterReceiptRequest,
  ): RegisterReceiptResponse {
    const order = this.orders.find((candidate) => candidate.purchaseOrderId === purchaseOrderId);

    if (!order) {
      throw new BadRequestException("対象の発注が存在しません。");
    }

    if (request.items.some((item) => item.quantity <= 0)) {
      throw new BadRequestException("入荷数量は 1 以上で入力してください。");
    }

    for (const receiptItem of request.items) {
      const orderItem = order.items.find((candidate) => candidate.materialId === receiptItem.materialId);

      if (!orderItem) {
        throw new BadRequestException("発注明細に存在しない花材です。");
      }

      if (orderItem.receivedQuantity + receiptItem.quantity > orderItem.quantity) {
        throw new BadRequestException("発注数量を超える入荷数量は登録できません。");
      }
    }

    for (const receiptItem of request.items) {
      const orderItem = order.items.find((candidate) => candidate.materialId === receiptItem.materialId);

      if (!orderItem) {
        continue;
      }

      orderItem.receivedQuantity += receiptItem.quantity;
    }

    this.inventoryService.applyReceipt(request.receiptDate, request.items);
    order.status = order.items.every((item) => item.receivedQuantity === item.quantity)
      ? "入荷完了"
      : "一部入荷";

    return {
      purchaseOrderId: order.purchaseOrderId,
      status: order.status,
    };
  }
}
