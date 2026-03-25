import { Inject, Injectable } from "@nestjs/common";

import { MaterialService } from "./material.service";

export type InventoryProjection = {
  date: string;
  projectedQuantity: number;
};

export type InventoryProjectionItem = {
  materialId: string;
  materialName: string;
  projections: InventoryProjection[];
};

export type InventoryProjectionResponse = {
  startDate: string;
  endDate: string;
  dates: string[];
  items: InventoryProjectionItem[];
};

const INVENTORY_DATES = ["2026-04-10", "2026-04-11", "2026-04-12"] as const;
const INVENTORY_ITEMS: Array<{ materialId: string; projections: InventoryProjection[] }> = [
  {
    materialId: "MAT-001",
    projections: [
      { date: "2026-04-10", projectedQuantity: 12 },
      { date: "2026-04-11", projectedQuantity: -2 },
      { date: "2026-04-12", projectedQuantity: 24 },
    ],
  },
  {
    materialId: "MAT-002",
    projections: [
      { date: "2026-04-10", projectedQuantity: 6 },
      { date: "2026-04-11", projectedQuantity: 5 },
      { date: "2026-04-12", projectedQuantity: 22 },
    ],
  },
];

type ReceiptRecord = {
  receiptDate: string;
  materialId: string;
  quantity: number;
};

@Injectable()
export class InventoryService {
  private readonly materialService: MaterialService;
  private readonly receipts: ReceiptRecord[] = [];

  constructor(@Inject(MaterialService) materialService: MaterialService) {
    this.materialService = materialService;
  }

  getInventoryProjections(startDate: string, endDate: string): InventoryProjectionResponse {
    return {
      startDate,
      endDate,
      dates: INVENTORY_DATES.filter((date) => date >= startDate && date <= endDate),
      items: INVENTORY_ITEMS.map((item) => ({
        materialId: item.materialId,
        materialName:
          this.materialService.findMaterial(item.materialId)?.materialName ?? item.materialId,
        projections: item.projections
          .filter((projection) => projection.date >= startDate && projection.date <= endDate)
          .map((projection) => ({
            date: projection.date,
            projectedQuantity:
              projection.projectedQuantity +
              this.getReceiptQuantityOnOrBefore(item.materialId, projection.date),
          })),
      })),
    };
  }

  isSupportedRange(startDate: string, endDate: string): boolean {
    return startDate >= INVENTORY_DATES[0] && endDate <= INVENTORY_DATES[INVENTORY_DATES.length - 1];
  }

  applyReceipt(
    receiptDate: string,
    items: Array<{
      materialId: string;
      quantity: number;
    }>,
  ): void {
    for (const item of items) {
      this.receipts.push({
        receiptDate,
        materialId: item.materialId,
        quantity: item.quantity,
      });
    }
  }

  getProjectedQuantity(materialId: string, date: string): number {
    const target = INVENTORY_ITEMS.find((item) => item.materialId === materialId);
    const base = target?.projections.find((projection) => projection.date === date)?.projectedQuantity ?? 0;

    return base + this.getReceiptQuantityOnOrBefore(materialId, date);
  }

  private getReceiptQuantityOnOrBefore(materialId: string, date: string): number {
    return this.receipts
      .filter((receipt) => receipt.materialId === materialId && receipt.receiptDate <= date)
      .reduce((total, receipt) => total + receipt.quantity, 0);
  }
}
