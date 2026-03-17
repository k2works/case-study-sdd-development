import { StockLot } from './stock-lot.js';
import { StockId, ItemId, StockStatus } from '../shared/value-objects.js';

export interface StockLotRepository {
  findById(id: StockId): Promise<StockLot | null>;
  findByItemId(itemId: ItemId): Promise<StockLot[]>;
  findByItemIdAndStatus(itemId: ItemId, status: StockStatus): Promise<StockLot[]>;
  save(stockLot: StockLot): Promise<StockLot>;
  saveAll(stockLots: StockLot[]): Promise<StockLot[]>;
}
