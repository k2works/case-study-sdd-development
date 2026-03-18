import { ArrivalRepository } from '../../domain/arrival/arrival-repository.js';
import { Arrival } from '../../domain/arrival/arrival.js';
import { ItemRepository } from '../../domain/item/item-repository.js';
import { PurchaseOrderRepository } from '../../domain/purchase-order/purchase-order-repository.js';
import { PurchaseOrderId, Quantity } from '../../domain/shared/value-objects.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';

export interface RegisterArrivalInput {
  purchaseOrderId: number;
  quantity: number;
  arrivalDate: Date;
}

export interface RegisterArrivalResult {
  arrivalId: number;
  itemId: number;
  purchaseOrderId: number;
  quantity: number;
  arrivalDate: Date;
  status: string;
}

export class ArrivalUseCase {
  constructor(
    private readonly arrivalRepository: ArrivalRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly stockLotRepository: StockLotRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async registerArrival(input: RegisterArrivalInput): Promise<RegisterArrivalResult> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      new PurchaseOrderId(input.purchaseOrderId),
    );
    if (!purchaseOrder) {
      throw new Error('発注が見つかりません');
    }

    // PurchaseOrder.receive() がドメインルールを検証（二重入荷・数量不一致）
    const receivedPO = purchaseOrder.receive(input.quantity);

    const item = await this.itemRepository.findById(purchaseOrder.itemId);
    if (!item) {
      throw new Error('単品が見つかりません');
    }

    // Arrival 作成
    const arrival = Arrival.createNew({
      itemId: purchaseOrder.itemId,
      purchaseOrderId: receivedPO.purchaseOrderId!,
      quantity: new Quantity(input.quantity),
      arrivalDate: input.arrivalDate,
    });

    // StockLot 作成（expiryDate = arrivalDate + qualityRetentionDays）
    const expiryDate = new Date(input.arrivalDate);
    expiryDate.setDate(expiryDate.getDate() + item.qualityRetentionDays.value);

    const stockLot = StockLot.createNew({
      itemId: purchaseOrder.itemId,
      quantity: new Quantity(input.quantity),
      arrivalDate: input.arrivalDate,
      expiryDate,
    });

    // 永続化（本番では prisma.$transaction で実行）
    await this.purchaseOrderRepository.save(receivedPO);
    const savedArrival = await this.arrivalRepository.save(arrival);
    await this.stockLotRepository.save(stockLot);

    return {
      arrivalId: savedArrival.arrivalId!.value,
      itemId: savedArrival.itemId.value,
      purchaseOrderId: savedArrival.purchaseOrderId.value,
      quantity: savedArrival.quantity.value,
      arrivalDate: savedArrival.arrivalDate,
      status: receivedPO.status.value,
    };
  }
}
