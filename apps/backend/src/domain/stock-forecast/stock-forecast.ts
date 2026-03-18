import { ItemId } from '../shared/value-objects.js';

export interface StockForecastProps {
  date: Date;
  itemId: ItemId;
  currentStock: number;
  expectedArrival: number;
  allocated: number;
  expired: number;
}

export class StockForecast {
  readonly date: Date;
  readonly itemId: ItemId;
  readonly currentStock: number;
  readonly expectedArrival: number;
  readonly allocated: number;
  readonly expired: number;

  constructor(props: StockForecastProps) {
    this.date = props.date;
    this.itemId = props.itemId;
    this.currentStock = props.currentStock;
    this.expectedArrival = props.expectedArrival;
    this.allocated = props.allocated;
    this.expired = props.expired;
  }

  get availableStock(): number {
    return this.currentStock + this.expectedArrival - this.allocated - this.expired;
  }

  get isShortage(): boolean {
    return this.availableStock <= 0;
  }

  get isExpiryWarning(): boolean {
    return this.expired > 0;
  }
}
