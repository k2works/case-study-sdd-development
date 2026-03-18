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

interface AllocationPlan {
  lot: StockLot;
  allocateQty: number;
}

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

    // 2. 在庫チェックと引当ロットの事前準備（まだ保存しない）
    const allocationPlans = await this.prepareAllocations(product.compositions);

    // 3. 受注を作成・保存
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

    // 4. 引当ロットを一括保存（orderId を確定してから）
    await this.saveAllocations(allocationPlans, savedOrder.orderId!);

    return savedOrder;
  }

  private async prepareAllocations(
    compositions: readonly { itemId: ItemId; quantity: Quantity }[],
  ): Promise<AllocationPlan[]> {
    const activeStatus = new StockStatus('有効');
    const plans: AllocationPlan[] = [];

    for (const composition of compositions) {
      const lots = await this.stockLotRepository.findByItemIdAndStatus(composition.itemId, activeStatus);
      const totalAvailable = lots.reduce((sum, lot) => sum + lot.quantity.value, 0);

      if (totalAvailable < composition.quantity.value) {
        throw new Error(`在庫が不足しています（単品ID: ${composition.itemId.value}）`);
      }

      let remainingQty = composition.quantity.value;
      for (const lot of lots) {
        if (remainingQty <= 0) break;

        const allocateQty = Math.min(lot.quantity.value, remainingQty);
        plans.push({ lot, allocateQty });
        remainingQty -= allocateQty;
      }
    }

    return plans;
  }

  private async saveAllocations(plans: AllocationPlan[], orderId: OrderId): Promise<void> {
    for (const { lot, allocateQty } of plans) {
      if (allocateQty === lot.quantity.value) {
        const allocated = lot.allocate(orderId);
        await this.stockLotRepository.save(allocated);
      } else {
        const [allocatedPart, remainingPart] = lot.split(new Quantity(allocateQty));
        const allocated = allocatedPart.allocate(orderId);

        const updatedOriginal = new StockLot({
          ...allocated,
          stockId: lot.stockId,
        });
        await this.stockLotRepository.save(updatedOriginal);

        if (remainingPart) {
          await this.stockLotRepository.save(remainingPart);
        }
      }
    }
  }

  async changeDeliveryDate(
    orderId: number,
    newDeliveryDateStr: string,
  ): Promise<{
    success: boolean;
    reason?: string;
    order?: {
      orderId: number;
      deliveryDate: string;
      shippingDate: string;
      status: string;
    };
  }> {
    const order = await this.orderRepository.findById(new OrderId(orderId));
    if (!order) {
      return { success: false, reason: '受注が見つかりません' };
    }

    const newDeliveryDate = new DeliveryDate(new Date(newDeliveryDateStr), { skipValidation: true });
    const result = order.changeDeliveryDate(newDeliveryDate);

    if (!result.success) {
      return { success: false, reason: result.reason };
    }

    const saved = await this.orderRepository.save(result.order!);
    return {
      success: true,
      order: {
        orderId: saved.orderId!.value,
        deliveryDate: saved.deliveryDate.value.toISOString().split('T')[0],
        shippingDate: saved.shippingDate.value.toISOString().split('T')[0],
        status: saved.status.value,
      },
    };
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

  async getOrderDestinations(
    customerId: number,
  ): Promise<{ name: string; address: string; phone: string }[]> {
    const orders = await this.orderRepository.findByCustomerId(new CustomerId(customerId));

    // name+address+phone で重複排除
    const seen = new Set<string>();
    const destinations: { name: string; address: string; phone: string }[] = [];

    for (const order of orders) {
      const key = `${order.destination.name}|${order.destination.address}|${order.destination.phone}`;
      if (!seen.has(key)) {
        seen.add(key);
        destinations.push({
          name: order.destination.name,
          address: order.destination.address,
          phone: order.destination.phone,
        });
      }
    }

    return destinations;
  }

  async getProductName(productId: ProductId): Promise<string> {
    const product = await this.productRepository.findById(productId);
    return product?.name.value ?? '';
  }
}
