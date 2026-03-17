import { PrismaClient } from '../../generated/prisma/client.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import {
  StockId,
  ItemId,
  Quantity,
  StockStatus,
  StockStatusValue,
  OrderId,
} from '../../domain/shared/value-objects.js';

export class PrismaStockLotRepository implements StockLotRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: StockId): Promise<StockLot | null> {
    const record = await this.prisma.stock.findUnique({
      where: { stockId: id.value },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByItemIdAndStatus(itemId: ItemId, status: StockStatus): Promise<StockLot[]> {
    const records = await this.prisma.stock.findMany({
      where: {
        itemId: itemId.value,
        status: status.value,
      },
      orderBy: { expiryDate: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(stockLot: StockLot): Promise<StockLot> {
    if (!stockLot.stockId) {
      const record = await this.prisma.stock.create({
        data: {
          itemId: stockLot.itemId.value,
          quantity: stockLot.quantity.value,
          arrivalDate: stockLot.arrivalDate,
          expiryDate: stockLot.expiryDate,
          status: stockLot.status.value,
          orderId: stockLot.orderId?.value ?? null,
        },
      });
      return this.toDomain(record);
    }

    const record = await this.prisma.stock.update({
      where: { stockId: stockLot.stockId.value },
      data: {
        itemId: stockLot.itemId.value,
        quantity: stockLot.quantity.value,
        arrivalDate: stockLot.arrivalDate,
        expiryDate: stockLot.expiryDate,
        status: stockLot.status.value,
        orderId: stockLot.orderId?.value ?? null,
      },
    });
    return this.toDomain(record);
  }

  async saveAll(stockLots: StockLot[]): Promise<StockLot[]> {
    const results: StockLot[] = [];
    for (const lot of stockLots) {
      results.push(await this.save(lot));
    }
    return results;
  }

  private toDomain(record: {
    stockId: number;
    itemId: number;
    quantity: number;
    arrivalDate: Date;
    expiryDate: Date;
    status: string;
    orderId: number | null;
  }): StockLot {
    return new StockLot({
      stockId: new StockId(record.stockId),
      itemId: new ItemId(record.itemId),
      quantity: new Quantity(record.quantity),
      arrivalDate: record.arrivalDate,
      expiryDate: record.expiryDate,
      status: new StockStatus(record.status as StockStatusValue),
      orderId: record.orderId ? new OrderId(record.orderId) : null,
    });
  }
}
