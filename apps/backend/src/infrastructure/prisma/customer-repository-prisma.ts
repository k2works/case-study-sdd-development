import { PrismaClient } from '../../generated/prisma/client.js';
import { CustomerRepository } from '../../domain/customer/customer-repository.js';
import { Customer } from '../../domain/customer/customer.js';
import { Destination } from '../../domain/customer/destination.js';
import { CustomerId, DestinationId } from '../../domain/shared/value-objects.js';

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Customer[]> {
    const records = await this.prisma.customer.findMany({
      orderBy: { customerId: 'asc' },
    });
    return records.map((r) => this.toCustomerDomain(r));
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { customerId: id.value },
    });
    if (!record) return null;
    return this.toCustomerDomain(record);
  }

  async save(customer: Customer): Promise<Customer> {
    if (!customer.customerId) {
      const record = await this.prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        },
      });
      return this.toCustomerDomain(record);
    }

    const record = await this.prisma.customer.update({
      where: { customerId: customer.customerId.value },
      data: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
    return this.toCustomerDomain(record);
  }

  async getDestinations(customerId: CustomerId): Promise<Destination[]> {
    const records = await this.prisma.destination.findMany({
      where: { customerId: customerId.value },
      orderBy: { destinationId: 'asc' },
    });
    return records.map((r) => this.toDestinationDomain(r));
  }

  async addDestination(destination: Destination): Promise<Destination> {
    const record = await this.prisma.destination.create({
      data: {
        customerId: destination.customerId.value,
        name: destination.name,
        address: destination.address,
        phone: destination.phone,
      },
    });
    return this.toDestinationDomain(record);
  }

  private toCustomerDomain(record: {
    customerId: number;
    name: string;
    phone: string;
    email: string | null;
  }): Customer {
    return new Customer({
      customerId: new CustomerId(record.customerId),
      name: record.name,
      phone: record.phone,
      email: record.email,
    });
  }

  private toDestinationDomain(record: {
    destinationId: number;
    customerId: number;
    name: string;
    address: string;
    phone: string;
  }): Destination {
    return new Destination({
      destinationId: new DestinationId(record.destinationId),
      customerId: new CustomerId(record.customerId),
      name: record.name,
      address: record.address,
      phone: record.phone,
    });
  }
}
