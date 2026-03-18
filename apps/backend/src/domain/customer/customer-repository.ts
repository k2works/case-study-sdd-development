import { CustomerId } from '../shared/value-objects.js';
import { Customer } from './customer.js';
import { Destination } from './destination.js';

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: CustomerId): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
  getDestinations(customerId: CustomerId): Promise<Destination[]>;
  addDestination(destination: Destination): Promise<Destination>;
}
