import { PrismaClient } from '../../generated/prisma/client.js';
import { Order } from '../../domain/order/order.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { DestinationSnapshot } from '../../domain/order/destination-snapshot.js';
import {
  OrderId,
  CustomerId,
  ProductId,
  Price,
  DeliveryDate,
  OrderStatus,
  OrderStatusValue,
  Message,
} from '../../domain/shared/value-objects.js';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { orderId: id.value },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const where = status ? { status: status.value } : {};
    const records = await this.prisma.order.findMany({
      where,
      orderBy: { orderId: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByStatuses(statuses: OrderStatus[]): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { status: { in: statuses.map((status) => status.value) } },
      orderBy: { orderId: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(order: Order): Promise<Order> {
    if (!order.orderId) {
      const record = await this.prisma.order.create({
        data: {
          customerId: order.customerId.value,
          productId: order.productId.value,
          price: order.price.value,
          destinationName: order.destination.name,
          destinationAddress: order.destination.address,
          destinationPhone: order.destination.phone,
          deliveryDate: order.deliveryDate.value,
          shippingDate: order.shippingDate.value,
          message: order.message.value || null,
          status: order.status.value,
        },
      });
      return this.toDomain(record);
    }

    const record = await this.prisma.order.update({
      where: { orderId: order.orderId.value },
      data: {
        customerId: order.customerId.value,
        productId: order.productId.value,
        price: order.price.value,
        destinationName: order.destination.name,
        destinationAddress: order.destination.address,
        destinationPhone: order.destination.phone,
        deliveryDate: order.deliveryDate.value,
        shippingDate: order.shippingDate.value,
        message: order.message.value || null,
        status: order.status.value,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    orderId: number;
    customerId: number;
    productId: number;
    price: number;
    destinationName: string;
    destinationAddress: string;
    destinationPhone: string;
    deliveryDate: Date;
    shippingDate: Date;
    message: string | null;
    status: string;
  }): Order {
    return new Order({
      orderId: new OrderId(record.orderId),
      customerId: new CustomerId(record.customerId),
      productId: new ProductId(record.productId),
      price: new Price(record.price),
      destination: new DestinationSnapshot(
        record.destinationName,
        record.destinationAddress,
        record.destinationPhone,
      ),
      deliveryDate: new DeliveryDate(record.deliveryDate),
      message: new Message(record.message),
      status: new OrderStatus(record.status as OrderStatusValue),
    });
  }
}
