import { CustomerRepository } from '../../domain/customer/customer-repository.js';
import { Customer } from '../../domain/customer/customer.js';
import { Destination } from '../../domain/customer/destination.js';
import { CustomerId } from '../../domain/shared/value-objects.js';

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email: string | null;
}

export interface UpdateCustomerInput {
  name: string;
  phone: string;
  email: string | null;
}

export interface AddDestinationInput {
  name: string;
  address: string;
  phone: string;
}

export interface CustomerResult {
  customerId: number;
  name: string;
  phone: string;
  email: string | null;
}

export interface DestinationResult {
  destinationId: number;
  customerId: number;
  name: string;
  address: string;
  phone: string;
}

function toCustomerResult(customer: Customer): CustomerResult {
  return {
    customerId: customer.customerId!.value,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  };
}

function toDestinationResult(destination: Destination): DestinationResult {
  return {
    destinationId: destination.destinationId!.value,
    customerId: destination.customerId.value,
    name: destination.name,
    address: destination.address,
    phone: destination.phone,
  };
}

export class CustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(input: CreateCustomerInput): Promise<CustomerResult> {
    const customer = Customer.createNew({
      name: input.name,
      phone: input.phone,
      email: input.email,
    });
    const saved = await this.customerRepository.save(customer);
    return toCustomerResult(saved);
  }

  async getCustomers(): Promise<CustomerResult[]> {
    const customers = await this.customerRepository.findAll();
    return customers.map(toCustomerResult);
  }

  async getCustomerById(id: number): Promise<CustomerResult | null> {
    const customer = await this.customerRepository.findById(new CustomerId(id));
    if (!customer) return null;
    return toCustomerResult(customer);
  }

  async updateCustomer(id: number, input: UpdateCustomerInput): Promise<CustomerResult> {
    const existing = await this.customerRepository.findById(new CustomerId(id));
    if (!existing) {
      throw new Error('得意先が見つかりません');
    }

    const updated = new Customer({
      customerId: existing.customerId,
      name: input.name,
      phone: input.phone,
      email: input.email,
    });
    const saved = await this.customerRepository.save(updated);
    return toCustomerResult(saved);
  }

  async getDestinations(customerId: number): Promise<DestinationResult[]> {
    const destinations = await this.customerRepository.getDestinations(new CustomerId(customerId));
    return destinations.map(toDestinationResult);
  }

  async addDestination(customerId: number, input: AddDestinationInput): Promise<DestinationResult> {
    const destination = Destination.createNew({
      customerId: new CustomerId(customerId),
      name: input.name,
      address: input.address,
      phone: input.phone,
    });
    const saved = await this.customerRepository.addDestination(destination);
    return toDestinationResult(saved);
  }
}
