import { StockLot } from '../../domain/stock/stock-lot.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import { StockId, ItemId, StockStatus } from '../../domain/shared/value-objects.js';

export class InMemoryStockLotRepository implements StockLotRepository {
  private readonly stockLots: Map<number, StockLot> = new Map();
  private nextId = 1;

  clear(): void {
    this.stockLots.clear();
    this.nextId = 1;
  }

  async findById(id: StockId): Promise<StockLot | null> {
    return this.stockLots.get(id.value) ?? null;
  }

  async findByItemIdAndStatus(itemId: ItemId, status: StockStatus): Promise<StockLot[]> {
    return Array.from(this.stockLots.values()).filter(
      (lot) => lot.itemId.value === itemId.value && lot.status.value === status.value,
    );
  }

  async findActiveByItemId(itemId: ItemId): Promise<StockLot[]> {
    return Array.from(this.stockLots.values()).filter(
      (lot) => lot.itemId.equals(itemId) && lot.status.value === '有効',
    );
  }

  async findAllActive(): Promise<StockLot[]> {
    return Array.from(this.stockLots.values()).filter((lot) => lot.status.value === '有効');
  }

  async save(stockLot: StockLot): Promise<StockLot> {
    if (!stockLot.stockId) {
      const id = this.nextId++;
      const saved = new StockLot({
        ...stockLot,
        stockId: new StockId(id),
      });
      this.stockLots.set(id, saved);
      return saved;
    }
    this.stockLots.set(stockLot.stockId.value, stockLot);
    return stockLot;
  }

  async saveAll(stockLots: StockLot[]): Promise<StockLot[]> {
    const results: StockLot[] = [];
    for (const lot of stockLots) {
      results.push(await this.save(lot));
    }
    return results;
  }
}
