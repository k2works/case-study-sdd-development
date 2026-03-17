import { Order } from '../../domain/order/order.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { ProductRepository } from '../../domain/product/product-repository.js';
import { StockLotRepository } from '../../domain/stock/stock-lot-repository.js';
import { StockLot } from '../../domain/stock/stock-lot.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import {
  OrderId,
  CustomerId,
  ProductId,
  ItemId,
  DeliveryDate,
  Message,
  OrderStatus,
  StockStatus,
  Quantity,
  OrderStatusValue,
} from '../../domain/shared/value-objects.js';

export interface CreateOrderInput {
  customerId: number;
  productId: number;
  destinationName: string;
  destinationAddress: string;
  destinationPhone: string;
  deliveryDate: string;
  message?: string;
}

export class OrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly stockLotRepository: StockLotRepository,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. 商品を取得して構成を確認
    const product = await this.productRepository.findById(new ProductId(input.productId));
    if (!product) {
      throw new Error('商品が見つかりません');
    }

    // 2. 各構成の単品に対して在庫の十分性を検証
    const activeStatus = new StockStatus('有効');
    for (const composition of product.compositions) {
      const lots = await this.stockLotRepository.findByItemIdAndStatus(composition.itemId, activeStatus);
      const totalAvailable = lots.reduce((sum, lot) => sum + lot.quantity.value, 0);

      if (totalAvailable < composition.quantity.value) {
        throw new Error(`在庫が不足しています（単品ID: ${composition.itemId.value}）`);
      }
    }

    // 3. 受注を作成
    const order = Order.createNew({
      customerId: new CustomerId(input.customerId),
      productId: new ProductId(input.productId),
      price: product.price,
      destination: new DestinationSnapshot(
        input.destinationName,
        input.destinationAddress,
        input.destinationPhone,
      ),
      deliveryDate: new DeliveryDate(new Date(input.deliveryDate)),
      message: new Message(input.message),
    });

    const savedOrder = await this.orderRepository.save(order);

    // 4. 在庫ロットを引当（split してロット分割）
    for (const composition of product.compositions) {
      await this.allocateStock(composition.itemId, composition.quantity, savedOrder.orderId!);
    }

    return savedOrder;
  }

  private async allocateStock(itemId: ItemId, requiredQty: Quantity, orderId: OrderId): Promise<void> {
    const activeStatus = new StockStatus('有効');
    let remainingQty = requiredQty.value;
    const lots = await this.stockLotRepository.findByItemIdAndStatus(itemId, activeStatus);

    for (const lot of lots) {
      if (remainingQty <= 0) break;

      const allocateQty = Math.min(lot.quantity.value, remainingQty);

      if (allocateQty === lot.quantity.value) {
        // ロット全量を引当: 分割不要、そのまま引当
        const allocated = lot.allocate(orderId);
        await this.stockLotRepository.save(allocated);
      } else {
        // ロット部分引当: 分割して引当
        const [allocatedPart, remainingPart] = lot.split(new Quantity(allocateQty));
        const allocated = allocatedPart.allocate(orderId);

        // 元のロットを引当済みに上書き（数量を引当分に変更）
        const updatedOriginal = new StockLot({
          ...allocated,
          stockId: lot.stockId,
        });
        await this.stockLotRepository.save(updatedOriginal);

        // 残りロットを新規保存
        if (remainingPart) {
          await this.stockLotRepository.save(remainingPart);
        }
      }

      remainingQty -= allocateQty;
    }
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findById(new OrderId(id));
  }

  async findAll(status?: string): Promise<Order[]> {
    if (status) {
      return this.orderRepository.findAll(new OrderStatus(status as OrderStatusValue));
    }
    return this.orderRepository.findAll();
  }
}
