import { StockId, ItemId, Quantity, StockStatus, OrderId } from '../shared/value-objects.js';

export interface StockLotProps {
  stockId: StockId | null;
  itemId: ItemId;
  quantity: Quantity;
  arrivalDate: Date;
  expiryDate: Date;
  status: StockStatus;
  orderId: OrderId | null;
}

export type NewStockLotProps = Pick<StockLotProps, 'itemId' | 'quantity' | 'arrivalDate' | 'expiryDate'>;

export class StockLot {
  readonly stockId: StockId | null;
  readonly itemId: ItemId;
  readonly quantity: Quantity;
  readonly arrivalDate: Date;
  readonly expiryDate: Date;
  readonly status: StockStatus;
  readonly orderId: OrderId | null;

  static createNew(props: NewStockLotProps): StockLot {
    return new StockLot({
      ...props,
      stockId: null,
      status: new StockStatus('有効'),
      orderId: null,
    });
  }

  constructor(props: StockLotProps) {
    this.stockId = props.stockId;
    this.itemId = props.itemId;
    this.quantity = props.quantity;
    this.arrivalDate = props.arrivalDate;
    this.expiryDate = props.expiryDate;
    this.status = props.status;
    this.orderId = props.orderId;
  }

  allocate(orderId: OrderId): StockLot {
    if (this.status.value !== '有効') {
      throw new Error('有効な在庫ロットのみ引当できます');
    }
    return new StockLot({
      ...this,
      status: new StockStatus('引当済み'),
      orderId,
    });
  }

  split(allocateQty: Quantity): [StockLot, StockLot | null] {
    if (allocateQty.value > this.quantity.value) {
      throw new Error('在庫数量を超える分割はできません');
    }

    const allocatedLot = new StockLot({
      ...this,
      stockId: null,
      quantity: allocateQty,
    });

    const remainingValue = this.quantity.value - allocateQty.value;
    if (remainingValue === 0) {
      return [allocatedLot, null];
    }

    const remainingLot = new StockLot({
      ...this,
      stockId: null,
      quantity: new Quantity(remainingValue),
    });

    return [allocatedLot, remainingLot];
  }

  deallocate(): StockLot {
    if (this.status.value !== '引当済み') {
      throw new Error('引当済みの在庫ロットのみ引当解除できます');
    }
    return new StockLot({
      ...this,
      status: new StockStatus('有効'),
      orderId: null,
    });
  }

  consume(): StockLot {
    if (this.status.value !== '引当済み') {
      throw new Error('引当済みの在庫ロットのみ消費できます');
    }
    return new StockLot({
      ...this,
      status: new StockStatus('消費済み'),
    });
  }

  markAsExpired(): StockLot {
    if (this.status.value !== '有効') {
      throw new Error('有効な在庫ロットのみ期限切れにできます');
    }
    return new StockLot({
      ...this,
      status: new StockStatus('期限切れ'),
    });
  }
}
