import { Order } from '../order/order.js';
import { Product } from '../product/product.js';

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

export interface ItemInfo {
  itemId: number;
  itemName: string;
}

export class ShipmentService {
  buildShipmentTargets(
    orders: Order[],
    products: Product[],
    items: ItemInfo[],
  ): ShipmentResult {
    const productMap = new Map(
      products.map((p) => [p.productId!.value, p]),
    );

    const itemMap = new Map(
      items.map((i) => [i.itemId, i.itemName]),
    );

    const totalMap = new Map<number, number>();

    const targets: ShipmentTarget[] = orders.map((order) => {
      const product = productMap.get(order.productId.value);
      const materials: MaterialRequirement[] = product
        ? product.compositions.map((c) => {
            const qty = c.quantity.value;
            const iid = c.itemId.value;

            // 全体集計
            totalMap.set(iid, (totalMap.get(iid) ?? 0) + qty);

            return {
              itemId: iid,
              itemName: itemMap.get(iid) ?? `単品 ${iid}`,
              quantity: qty,
            };
          })
        : [];

      return {
        orderId: order.orderId!.value,
        customerId: order.customerId.value,
        productId: order.productId.value,
        productName: product?.name.value ?? '',
        destinationName: order.destination.name,
        destinationAddress: order.destination.address,
        materials,
      };
    });

    const totalMaterials: MaterialRequirement[] = Array.from(totalMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([itemId, quantity]) => ({
        itemId,
        itemName: itemMap.get(itemId) ?? `単品 ${itemId}`,
        quantity,
      }));

    return { targets, totalMaterials };
  }
}
