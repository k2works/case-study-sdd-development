import { Order } from '../../domain/order/order.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { OrderId, OrderStatus } from '../../domain/shared/value-objects.js';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders: Map<number, Order> = new Map();
  private nextId = 1;

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.value) ?? null;
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const all = Array.from(this.orders.values());
    if (status) {
      return all.filter((o) => o.status.value === status.value);
    }
    return all;
  }

  async save(order: Order): Promise<Order> {
    if (!order.orderId) {
      const id = this.nextId++;
      const saved = new Order({
        ...order,
        orderId: new OrderId(id),
      });
      this.orders.set(id, saved);
      return saved;
    }
    this.orders.set(order.orderId.value, order);
    return order;
  }
}
