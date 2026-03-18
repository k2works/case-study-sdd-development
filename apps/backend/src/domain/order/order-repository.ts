import { Order } from './order.js';
import { OrderId, OrderStatus, CustomerId } from '../shared/value-objects.js';

export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findAll(status?: OrderStatus): Promise<Order[]>;
  findByStatuses(statuses: OrderStatus[]): Promise<Order[]>;
  findByShippingDate(shippingDate: Date): Promise<Order[]>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  save(order: Order): Promise<Order>;
}
