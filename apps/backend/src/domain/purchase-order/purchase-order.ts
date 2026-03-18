import {
  ItemId,
  PurchaseOrderId,
  PurchaseOrderStatus,
  PurchaseUnit,
  Quantity,
  SupplierId,
} from '../shared/value-objects.js';

export interface PurchaseOrderProps {
  purchaseOrderId: PurchaseOrderId | null;
  itemId: ItemId;
  supplierId: SupplierId;
  quantity: Quantity;
  orderDate: Date;
  expectedArrivalDate: Date;
  status: PurchaseOrderStatus;
}

export interface NewPurchaseOrderProps {
  itemId: ItemId;
  quantity: Quantity;
  purchaseUnit: PurchaseUnit;
  leadTimeDays: number;
  supplierId: SupplierId;
}

export class PurchaseOrder {
  readonly purchaseOrderId: PurchaseOrderId | null;
  readonly itemId: ItemId;
  readonly supplierId: SupplierId;
  readonly quantity: Quantity;
  readonly orderDate: Date;
  readonly expectedArrivalDate: Date;
  readonly status: PurchaseOrderStatus;

  static createNew(props: NewPurchaseOrderProps): PurchaseOrder {
    const adjustedQuantity = Math.ceil(props.quantity.value / props.purchaseUnit.value) * props.purchaseUnit.value;
    const orderDate = new Date();
    const expectedArrivalDate = new Date(orderDate);
    expectedArrivalDate.setDate(expectedArrivalDate.getDate() + props.leadTimeDays);

    return new PurchaseOrder({
      purchaseOrderId: null,
      itemId: props.itemId,
      supplierId: props.supplierId,
      quantity: new Quantity(adjustedQuantity),
      orderDate,
      expectedArrivalDate,
      status: new PurchaseOrderStatus('発注済み'),
    });
  }

  constructor(props: PurchaseOrderProps) {
    this.purchaseOrderId = props.purchaseOrderId;
    this.itemId = props.itemId;
    this.supplierId = props.supplierId;
    this.quantity = props.quantity;
    this.orderDate = props.orderDate;
    this.expectedArrivalDate = props.expectedArrivalDate;
    this.status = props.status;
  }

  receive(): PurchaseOrder {
    if (this.status.value === '入荷済み') {
      throw new Error('既に入荷済みです');
    }

    return new PurchaseOrder({
      ...this,
      status: new PurchaseOrderStatus('入荷済み'),
    });
  }
}
