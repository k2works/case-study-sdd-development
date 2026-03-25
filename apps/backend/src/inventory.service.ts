import { Injectable } from "@nestjs/common";

export type InventoryProjection = {
  date: string;
  projectedQuantity: number;
};

export type InventoryProjectionItem = {
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
const INVENTORY_ITEMS: InventoryProjectionItem[] = [
  {
    materialName: "バラ赤",
    projections: [
      { date: "2026-04-10", projectedQuantity: 12 },
      { date: "2026-04-11", projectedQuantity: -2 },
      { date: "2026-04-12", projectedQuantity: 24 },
    ],
  },
  {
    materialName: "カスミソウ",
    projections: [
      { date: "2026-04-10", projectedQuantity: 6 },
      { date: "2026-04-11", projectedQuantity: 5 },
      { date: "2026-04-12", projectedQuantity: 22 },
    ],
  },
];

@Injectable()
export class InventoryService {
  getInventoryProjections(startDate: string, endDate: string): InventoryProjectionResponse {
    return {
      startDate,
      endDate,
      dates: INVENTORY_DATES.filter((date) => date >= startDate && date <= endDate),
      items: INVENTORY_ITEMS.map((item) => ({
        materialName: item.materialName,
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
