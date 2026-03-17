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
  readonly availableStock: number;
  readonly isShortage: boolean;
  readonly isExpiryWarning: boolean;

  constructor(props: StockForecastProps) {
    this.date = props.date;
    this.itemId = props.itemId;
    this.currentStock = props.currentStock;
    this.expectedArrival = props.expectedArrival;
    this.allocated = props.allocated;
    this.expired = props.expired;
    this.availableStock = props.currentStock + props.expectedArrival - props.allocated - props.expired;
    this.isShortage = this.availableStock <= 0;
    this.isExpiryWarning = props.expired > 0;
  }
}
