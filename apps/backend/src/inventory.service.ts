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

@Injectable()
export class InventoryService {
  private readonly materialService: MaterialService;

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
        projections: item.projections.filter(
          (projection) => projection.date >= startDate && projection.date <= endDate,
        ),
      })),
    };
  }

  isSupportedRange(startDate: string, endDate: string): boolean {
    return startDate >= INVENTORY_DATES[0] && endDate <= INVENTORY_DATES[INVENTORY_DATES.length - 1];
  }
}
