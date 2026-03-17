export interface ItemDto {
  id: number;
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}

export interface CreateItemInput {
  name: string;
  qualityRetentionDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierId: number;
}
