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

@Injectable()
export class InventoryService {
  getInventoryProjections(startDate: string, endDate: string): InventoryProjectionResponse {
    return {
      startDate,
      endDate,
      dates: ["2026-04-10", "2026-04-11", "2026-04-12"].filter(
        (date) => date >= startDate && date <= endDate,
      ),
      items: [
        {
          materialName: "バラ赤",
          projections: [
            { date: "2026-04-10", projectedQuantity: 12 },
            { date: "2026-04-11", projectedQuantity: -2 },
            { date: "2026-04-12", projectedQuantity: 24 },
          ].filter((projection) => projection.date >= startDate && projection.date <= endDate),
        },
        {
          materialName: "カスミソウ",
          projections: [
            { date: "2026-04-10", projectedQuantity: 6 },
            { date: "2026-04-11", projectedQuantity: 5 },
            { date: "2026-04-12", projectedQuantity: 22 },
          ].filter((projection) => projection.date >= startDate && projection.date <= endDate),
        },
      ],
    };
  }
}
