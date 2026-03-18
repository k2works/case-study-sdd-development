import { Order } from './order.js';
import { OrderId, OrderStatus } from '../shared/value-objects.js';

export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findAll(status?: OrderStatus): Promise<Order[]>;
  findByStatuses(statuses: OrderStatus[]): Promise<Order[]>;
  save(order: Order): Promise<Order>;
}
