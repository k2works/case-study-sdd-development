import type { CustomerRepository } from '../../domain/customer/customer-repository.js';
import { Customer } from '../../domain/customer/customer.js';
import { Destination } from '../../domain/customer/destination.js';
import { CustomerId, DestinationId } from '../../domain/shared/value-objects.js';

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers: Map<number, Customer> = new Map();
  private readonly destinations: Map<number, Destination> = new Map();
  private nextCustomerId = 1;
  private nextDestinationId = 1;

  clear(): void {
    this.customers.clear();
    this.destinations.clear();
    this.nextCustomerId = 1;
    this.nextDestinationId = 1;
  }

  async findAll(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.customers.get(id.value) ?? null;
  }

  async save(customer: Customer): Promise<Customer> {
    if (!customer.customerId) {
      const id = this.nextCustomerId++;
      const saved = new Customer({
        ...customer,
        customerId: new CustomerId(id),
      });
      this.customers.set(id, saved);
      return saved;
    }
    this.customers.set(customer.customerId.value, customer);
    return customer;
  }

  async getDestinations(customerId: CustomerId): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(
      (d) => d.customerId.equals(customerId),
    );
  }

  async addDestination(destination: Destination): Promise<Destination> {
    if (!destination.destinationId) {
      const id = this.nextDestinationId++;
      const saved = new Destination({
        ...destination,
        destinationId: new DestinationId(id),
      });
      this.destinations.set(id, saved);
      return saved;
    }
    this.destinations.set(destination.destinationId.value, destination);
    return destination;
  }
}
