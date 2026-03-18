export class ItemId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('ItemId は正の整数でなければなりません');
  }

  equals(other: ItemId): boolean {
    return this.value === other.value;
  }
}

export class ItemName {
  constructor(public readonly value: string) {
    if (value.length === 0) throw new Error('ItemName は空にできません');
    if (value.length > 100) throw new Error('ItemName は100文字以内でなければなりません');
  }
}

export class Days {
  constructor(public readonly value: number) {
    if (value < 0) throw new Error('Days は0以上でなければなりません');
  }
}

export class PurchaseUnit {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('PurchaseUnit は正の整数でなければなりません');
  }
}

export class SupplierId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('SupplierId は正の整数でなければなりません');
  }
}

export class ProductId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('ProductId は正の整数でなければなりません');
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}

export class ProductName {
  constructor(public readonly value: string) {
    if (value.length === 0) throw new Error('ProductName は空にできません');
    if (value.length > 100) throw new Error('ProductName は100文字以内でなければなりません');
  }
}

export class Price {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('Price は正の整数でなければなりません');
  }
}

export class Quantity {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('Quantity は正の整数でなければなりません');
  }
}

export class OrderId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('OrderId は正の整数でなければなりません');
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}

export class PurchaseOrderId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('PurchaseOrderId は正の整数でなければなりません');
  }

  equals(other: PurchaseOrderId): boolean {
    return this.value === other.value;
  }
}

export class CustomerId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('CustomerId は正の整数でなければなりません');
  }
}

export class DeliveryDate {
  constructor(public readonly value: Date) {}
}

export class ShippingDate {
  constructor(public readonly value: Date) {}

  static fromDeliveryDate(deliveryDate: DeliveryDate): ShippingDate {
    const date = new Date(deliveryDate.value);
    date.setDate(date.getDate() - 1);
    return new ShippingDate(date);
  }
}

export type OrderStatusValue = '注文済み' | '出荷準備中' | '出荷済み' | 'キャンセル';

const VALID_ORDER_STATUSES: OrderStatusValue[] = ['注文済み', '出荷準備中', '出荷済み', 'キャンセル'];

export class OrderStatus {
  constructor(public readonly value: OrderStatusValue) {
    if (!VALID_ORDER_STATUSES.includes(value)) {
      throw new Error(`OrderStatus は ${VALID_ORDER_STATUSES.join(', ')} のいずれかでなければなりません`);
    }
  }
}

export type PurchaseOrderStatusValue = '発注済み' | '入荷済み';

const VALID_PURCHASE_ORDER_STATUSES: PurchaseOrderStatusValue[] = ['発注済み', '入荷済み'];

export class PurchaseOrderStatus {
  constructor(public readonly value: PurchaseOrderStatusValue) {
    if (!VALID_PURCHASE_ORDER_STATUSES.includes(value)) {
      throw new Error(
        `PurchaseOrderStatus は ${VALID_PURCHASE_ORDER_STATUSES.join(', ')} のいずれかでなければなりません`,
      );
    }
  }
}

export class Message {
  public readonly value: string;

  constructor(value: string | null | undefined) {
    this.value = value ?? '';
    if (this.value.length > 500) throw new Error('Message は500文字以内でなければなりません');
  }
}

export class StockId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error('StockId は正の整数でなければなりません');
  }

  equals(other: StockId): boolean {
    return this.value === other.value;
  }
}

export type StockStatusValue = '有効' | '引当済み' | '消費済み' | '期限切れ';

const VALID_STOCK_STATUSES: StockStatusValue[] = ['有効', '引当済み', '消費済み', '期限切れ'];

export class StockStatus {
  constructor(public readonly value: StockStatusValue) {
    if (!VALID_STOCK_STATUSES.includes(value)) {
      throw new Error(`StockStatus は ${VALID_STOCK_STATUSES.join(', ')} のいずれかでなければなりません`);
    }
  }
}
