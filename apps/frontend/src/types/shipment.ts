export interface MaterialRequirement {
  itemId: number;
  itemName: string;
  quantity: number;
}

export interface ShipmentTarget {
  orderId: number;
  customerId: number;
  productId: number;
  productName: string;
  destinationName: string;
  destinationAddress: string;
  materials: MaterialRequirement[];
}

export interface ShipmentResult {
  targets: ShipmentTarget[];
  totalMaterials: MaterialRequirement[];
}
