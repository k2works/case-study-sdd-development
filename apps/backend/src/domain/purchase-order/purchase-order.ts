import { PurchaseOrderId, PurchaseOrderStatus, ItemId, SupplierId, Quantity, PurchaseUnit, Days } from '../shared/value-objects.js';

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
  supplierId: SupplierId;
  requestedQuantity: number;
  purchaseUnit: PurchaseUnit;
  leadTimeDays: Days;
  orderDate: Date;
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
    // 購入単位の倍数に切り上げ
    const unit = props.purchaseUnit.value;
    const adjustedQuantity = Math.ceil(props.requestedQuantity / unit) * unit;

    // 入荷予定日 = 発注日 + リードタイム
    const expectedArrivalDate = new Date(props.orderDate);
    expectedArrivalDate.setDate(expectedArrivalDate.getDate() + props.leadTimeDays.value);

    return new PurchaseOrder({
      purchaseOrderId: null,
      itemId: props.itemId,
      supplierId: props.supplierId,
      quantity: new Quantity(adjustedQuantity),
      orderDate: props.orderDate,
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
    if (this.status.value !== '発注済み') {
      throw new Error('発注済みの発注のみ入荷済みに遷移できます');
    }
    return new PurchaseOrder({
      ...this,
      status: new PurchaseOrderStatus('入荷済み'),
    });
  }
}
