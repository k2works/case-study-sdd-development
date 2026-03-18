import { ArrivalId, ItemId, PurchaseOrderId, Quantity } from '../shared/value-objects.js';

export interface ArrivalProps {
  arrivalId: ArrivalId | null;
  itemId: ItemId;
  purchaseOrderId: PurchaseOrderId;
  quantity: Quantity;
  arrivalDate: Date;
}

export type NewArrivalProps = Omit<ArrivalProps, 'arrivalId'>;

export class Arrival {
  readonly arrivalId: ArrivalId | null;
  readonly itemId: ItemId;
  readonly purchaseOrderId: PurchaseOrderId;
  readonly quantity: Quantity;
  readonly arrivalDate: Date;

  static createNew(props: NewArrivalProps): Arrival {
    return new Arrival({
      ...props,
      arrivalId: null,
    });
  }

  constructor(props: ArrivalProps) {
    this.arrivalId = props.arrivalId;
    this.itemId = props.itemId;
    this.purchaseOrderId = props.purchaseOrderId;
    this.quantity = props.quantity;
    this.arrivalDate = props.arrivalDate;
  }
}
