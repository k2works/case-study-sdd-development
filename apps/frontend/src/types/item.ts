export interface ItemDto {
  id: number;
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
  supplierName?: string;
}

export interface CreateItemInput {
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}
