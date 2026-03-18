import { Order } from '../../domain/order/order.js';
import { OrderRepository } from '../../domain/order/order-repository.js';
import { OrderId, OrderStatus, CustomerId } from '../../domain/shared/value-objects.js';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders: Map<number, Order> = new Map();
  private nextId = 1;

  clear(): void {
    this.orders.clear();
    this.nextId = 1;
  }

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

  async findByStatuses(statuses: OrderStatus[]): Promise<Order[]> {
    const statusValues = new Set(statuses.map((status) => status.value));
    return Array.from(this.orders.values()).filter((order) => statusValues.has(order.status.value));
  }

  async findByShippingDate(shippingDate: Date): Promise<Order[]> {
    const target = shippingDate.toISOString().slice(0, 10);
    return Array.from(this.orders.values()).filter((order) => {
      const sd = order.shippingDate.value.toISOString().slice(0, 10);
      return sd === target;
    });
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId.value === customerId.value,
    );
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
